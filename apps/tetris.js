// tetris: registers with window.W98_APPS (see script.js "Extension point")
// 10x20 playfield on canvas, SRS rotation + wall kicks, 7-bag, hold, ghost, lock delay, T-spins.
(function () {
  "use strict";

  /* ------------------------------------------------------------------ rules */
  const COLS = 10, ROWS = 22, HID = 2, VIS = ROWS - HID;      // 2 hidden rows above the 20 visible ones
  const LOCK_MS = 500, LOCK_MOVES = 15, CLEAR_MS = 380;       // lock delay, move-reset cap, line-clear animation
  const DAS = 150, ARR = 36, SOFT = 40;                       // sideways auto-repeat and soft-drop speed (ms)
  const gravity = lv => Math.max(40, 900 * Math.pow(0.84, lv - 1));   // ms per row

  const NAMES = ["I", "O", "T", "S", "Z", "J", "L"];
  const COLORS = { I: "#18c8d8", O: "#f0d020", T: "#a048c8", S: "#38b838", Z: "#d83838", J: "#3858d8", L: "#f08830", G: "#909090" };
  const BASE = {
    I: ["....", "XXXX", "....", "...."],
    O: [".XX.", ".XX.", "....", "...."],
    T: [".X.", "XXX", "..."],
    S: [".XX", "XX.", "..."],
    Z: ["XX.", ".XX", "..."],
    J: ["X..", "XXX", "..."],
    L: ["..X", "XXX", "..."],
  };
  // SHAPES[type][rotation] = four [x, y] cells inside the piece's bounding box (0 = spawn, 1 = R, 2 = 180, 3 = L)
  const SHAPES = {};
  NAMES.forEach(t => {
    const rows = BASE[t], n = rows.length, cells = [];
    rows.forEach((row, y) => Array.from(row).forEach((ch, x) => { if (ch === "X") cells.push([x, y]); }));
    const st = [cells];
    for (let i = 1; i < 4; i++) st.push(t === "O" ? cells : st[i - 1].map(([x, y]) => [n - 1 - y, x]));
    SHAPES[t] = st;
  });
  // Super Rotation System wall kicks, keyed "from" + "to"; written as (x, y-up) like the guideline, flipped on use
  const KICK = {
    JLSTZ: {
      "01": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], "10": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
      "12": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], "21": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
      "23": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]], "32": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
      "30": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], "03": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    },
    I: {
      "01": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], "10": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
      "12": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]], "21": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
      "23": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], "32": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
      "30": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], "03": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    },
  };

  /* ------------------------------------------------------------------ drawing helpers */
  const shade = (hex, a) => {
    const n = parseInt(hex.slice(1), 16), f = v => Math.round(a >= 0 ? v + (255 - v) * a : v * (1 + a));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  };
  const PAL = {};
  Object.keys(COLORS).forEach(t => { PAL[t] = { base: COLORS[t], hi: shade(COLORS[t], 0.5), lo: shade(COLORS[t], -0.42) }; });

  // one flat block with a thin Win98-style bevel (light top/left, dark bottom/right)
  function block(ctx, x, y, s, t, alpha) {
    const p = PAL[t], b = Math.max(2, Math.round(s / 10));
    if (alpha != null) ctx.globalAlpha = alpha;
    ctx.fillStyle = p.base; ctx.fillRect(x, y, s, s);
    ctx.fillStyle = p.hi; ctx.fillRect(x, y, s, b); ctx.fillRect(x, y + b, b, s - 2 * b);
    ctx.fillStyle = p.lo; ctx.fillRect(x, y + s - b, s, b); ctx.fillRect(x + s - b, y + b, b, s - 2 * b);
    if (alpha != null) ctx.globalAlpha = 1;
  }

  const ICONS = {
    left: '<svg viewBox="0 0 24 24"><path d="M16 4v16L6 12z"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M8 4v16l10-8z"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M4 8h16L12 18z"/></svg>',
    hard: '<svg viewBox="0 0 24 24"><path d="M5 3h14v3H5zM5 8h14l-7 10z M5 20h14v2H5z"/></svg>',
    cw: '<svg viewBox="0 0 24 24"><path d="M5.2 13.5A7 7 0 1 1 12 19" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12.5 14.2 7 19l5.5 4.8z"/></svg>',
    ccw: '<svg class="is-flip" viewBox="0 0 24 24"><path d="M5.2 13.5A7 7 0 1 1 12 19" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12.5 14.2 7 19l5.5 4.8z"/></svg>',
  };

  /* ------------------------------------------------------------------ the game */
  function build(body, win, W98) {
    const { WM, store, Sound, msgBox, $, $$ } = W98;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const opt = Object.assign({ ghost: true, grid: true }, store.get("tetrisOpts", {}));

    body.classList.add("body--flush");
    body.innerHTML = `
      <div class="tet" data-state="ready">
        <div class="tet__main">
          <div class="tet__col tet__col--l">
            <div class="tet__panel"><span class="tet__lab">Hold</span><div class="tet__scr"><canvas class="tet__hold" aria-hidden="true"></canvas></div></div>
            <div class="tet__stats">
              <div class="tet__panel"><span class="tet__lab">Score</span><div class="tet__scr tet__val" data-v="score">0</div></div>
              <div class="tet__panel"><span class="tet__lab">Level</span><div class="tet__scr tet__val" data-v="level">1</div></div>
              <div class="tet__panel"><span class="tet__lab">Lines</span><div class="tet__scr tet__val" data-v="lines">0</div></div>
            </div>
          </div>
          <div class="tet__well">
            <div class="tet__scr"><canvas class="tet__board" role="img" aria-label="Tetris playfield"></canvas></div>
            <div class="tet__veil"></div>
            <div class="tet__dlg" role="dialog" aria-live="polite"></div>
          </div>
          <div class="tet__col tet__col--r">
            <div class="tet__panel"><span class="tet__lab">Next</span><div class="tet__scr"><canvas class="tet__next" aria-hidden="true"></canvas></div></div>
            <div class="tet__panel tet__best"><span class="tet__lab">Best</span><div class="tet__scr tet__val" data-v="best">0</div></div>
            <dl class="tet__keys">
              <dt><kbd>Arrows</kbd></dt><dd>Move</dd>
              <dt><kbd>Up / X</kbd></dt><dd>Rotate</dd>
              <dt><kbd>Z</kbd></dt><dd>Reverse</dd>
              <dt><kbd>Space</kbd></dt><dd>Drop</dd>
              <dt><kbd>C</kbd></dt><dd>Hold</dd>
              <dt><kbd>P</kbd></dt><dd>Pause</dd>
            </dl>
          </div>
        </div>
        <div class="tet__touch" aria-label="Touch controls">
          <button type="button" data-t="left" aria-label="Move left" tabindex="-1">${ICONS.left}</button>
          <button type="button" data-t="down" aria-label="Soft drop" tabindex="-1">${ICONS.down}</button>
          <button type="button" data-t="right" aria-label="Move right" tabindex="-1">${ICONS.right}</button>
          <i class="tet__gap"></i>
          <button type="button" data-t="hold" aria-label="Hold piece" tabindex="-1">Hold</button>
          <button type="button" data-t="ccw" aria-label="Rotate counter-clockwise" tabindex="-1">${ICONS.ccw}</button>
          <button type="button" data-t="cw" aria-label="Rotate clockwise" tabindex="-1">${ICONS.cw}</button>
          <button type="button" data-t="hard" aria-label="Hard drop" tabindex="-1">${ICONS.hard}</button>
        </div>
      </div>`;

    const root = $(".tet", body), cv = $(".tet__board", body), hcv = $(".tet__hold", body), ncv = $(".tet__next", body);
    const dlg = $(".tet__dlg", body), touch = $(".tet__touch", body), colL = $(".tet__col--l", body), colR = $(".tet__col--r", body);
    const g = cv.getContext("2d"), gh = hcv.getContext("2d"), gn = ncv.getContext("2d");
    const hudEl = {};
    $$("[data-v]", body).forEach(el => { hudEl[el.dataset.v] = el; });

    /* ---- state ---- */
    let board, cur, hold, holdUsed, queue, bag, score, lines, level, combo, b2b, state = "ready";
    let lockT, lockMoves, lowest, gAcc, lastRot;
    let clear = null, flash = null, trail = null, toasts = [], overAnim = null, newBest = false, recorded = true, overAt = 0;
    let held = { left: false, right: false, down: false }, hdir = 0, hNext = 0, lastMoveSnd = 0;
    let C = 24, M = 18, raf = 0, last = 0, dirty = true, stopped = false;
    let best = store.get("tetrisBest", 0);

    const emptyRow = () => new Array(COLS).fill(0);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const fill = () => { while (queue.length < 5) queue.push(...shuffle(NAMES.slice())); };
    const takeNext = () => { fill(); const t = queue.shift(); fill(); return t; };
    const solid = (x, y) => x < 0 || x >= COLS || y >= ROWS || (y >= 0 && !!board[y][x]);
    const fits = (t, r, x, y) => SHAPES[t][r].every(([cx, cy]) => { const bx = x + cx, by = y + cy; return bx >= 0 && bx < COLS && by >= 0 && by < ROWS && !board[by][bx]; });
    const grounded = () => !!cur && !fits(cur.t, cur.r, cur.x, cur.y + 1);
    const ghostY = () => { let y = cur.y; while (fits(cur.t, cur.r, cur.x, y + 1)) y++; return y; };

    /* ---- sound (synthesized; honours the global mute) ---- */
    const sfx = (name, n) => {
      if (Sound.muted || !Sound.ctx || Sound.ctx.state !== "running") return;
      const t0 = Sound.ctx.currentTime + 0.01;
      const T = (f, o, d, type, v) => Sound.tone(f, t0 + o, d, type || "square", v || 0.03, 0.004);
      switch (name) {
        case "move": { const now = performance.now(); if (now - lastMoveSnd < 55) return; lastMoveSnd = now; T(500, 0, 0.03, "square", 0.012); break; }
        case "rot": T(760, 0, 0.04, "square", 0.016); break;
        case "hold": T(420, 0, 0.06, "triangle", 0.05); T(630, 0.05, 0.09, "triangle", 0.05); break;
        case "lock": T(150, 0, 0.07, "triangle", 0.09); break;
        case "drop": Sound.noise(t0, 0.12, 0.22); T(95, 0, 0.12, "sine", 0.15); break;
        case "tspin": T(392, 0, 0.1, "triangle", 0.07); T(588, 0.07, 0.14, "triangle", 0.07); break;
        case "clear": {
          const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
          for (let i = 0; i <= Math.min(n, 4); i++) T(notes[i], i * 0.06, 0.16, n === 4 ? "square" : "triangle", n === 4 ? 0.04 : 0.07);
          if (n === 4) { Sound.noise(t0, 0.3, 0.2); T(1568, 0.3, 0.3, "square", 0.04); }
          break;
        }
        case "level": [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => T(f, 0.25 + i * 0.07, 0.16, "triangle", 0.06)); break;
        case "start": T(523.25, 0, 0.07, "triangle", 0.06); T(783.99, 0.07, 0.12, "triangle", 0.06); break;
        case "over": [392, 349.23, 311.13, 261.63, 196].forEach((f, i) => T(f, i * 0.13, 0.28, "triangle", 0.07)); break;
        case "pause": T(330, 0, 0.06, "triangle", 0.04); break;
      }
    };

    /* ---- HUD, status, dialog ---- */
    const hudCache = {};
    const hud = () => {
      const v = { score, level, lines, best: Math.max(best, score || 0) };
      Object.keys(v).forEach(k => { if (hudCache[k] !== v[k]) { hudCache[k] = v[k]; hudEl[k].textContent = v[k]; } });
    };
    const status = () => {
      win.setStatus([{ ready: "Press Enter to start", play: "Playing", pause: "Paused", over: "Game over" }[state], "High score: " + Math.max(best, score || 0)]);
    };
    const showDlg = () => {
      const kinds = {
        ready: `<b class="tet__h">Tetris</b><p>Stack the blocks and clear lines. The game speeds up every 10 lines.</p><div class="tet__btns"><button type="button" class="btn btn--default" data-go="start" tabindex="-1">Start</button></div><small>Press Enter or Space</small>`,
        pause: `<b class="tet__h">Paused</b><p>Your board is hidden while the game is paused.</p><div class="tet__btns"><button type="button" class="btn btn--default" data-go="resume" tabindex="-1">Resume</button></div><small>Press P</small>`,
        over: `<b class="tet__h">Game Over</b><p>Score ${score}\nLines ${lines}   Level ${level}${newBest ? "\nNew high score!" : ""}</p><div class="tet__btns"><button type="button" class="btn btn--default" data-go="start" tabindex="-1">New Game</button><button type="button" class="btn" data-go="scores" tabindex="-1">Scores</button></div><small>Press Enter</small>`,
      };
      const on = state !== "play" && !(state === "over" && overAnim);
      root.classList.toggle("is-dlg", on);
      if (on) dlg.innerHTML = kinds[state];
    };
    const setState = s => {
      state = s;
      root.dataset.state = s;
      showDlg(); status(); dirty = true;
    };

    /* ---- piece handling ---- */
    const toast = text => {
      let row = 0;
      while (toasts.some(t => t.row === row)) row++;
      toasts.push({ text, age: 0, row });
    };
    const spawn = t => {
      cur = { t, r: 0, x: 3, y: 0 };
      lockT = 0; lockMoves = 0; gAcc = 0; lastRot = false;
      if (!fits(t, 0, 3, 0)) { lowest = 0; gameOver(); return; }
      if (fits(t, 0, 3, 1)) cur.y = 1;
      lowest = cur.y;
    };
    const touchLock = () => { if (grounded() && lockMoves < LOCK_MOVES) { lockT = 0; lockMoves++; } };
    const move = dx => {
      if (!cur || !fits(cur.t, cur.r, cur.x + dx, cur.y)) return false;
      cur.x += dx; lastRot = false; touchLock(); sfx("move"); dirty = true;
      return true;
    };
    const rotate = d => {
      if (!cur || cur.t === "O") return false;
      const to = (cur.r + d + 4) % 4, kicks = (cur.t === "I" ? KICK.I : KICK.JLSTZ)["" + cur.r + to];
      for (const [kx, ky] of kicks) {
        if (fits(cur.t, to, cur.x + kx, cur.y - ky)) {
          cur.r = to; cur.x += kx; cur.y -= ky; lastRot = true; touchLock(); sfx("rot"); dirty = true;
          return true;
        }
      }
      return false;
    };
    const stepDown = soft => {
      if (!cur || !fits(cur.t, cur.r, cur.x, cur.y + 1)) return false;
      cur.y++; lastRot = false;
      if (cur.y > lowest) { lowest = cur.y; lockMoves = 0; }
      if (soft) score += 1;
      return true;
    };
    const doHold = () => {
      if (!cur || holdUsed || clear) return;
      const prev = hold;
      hold = cur.t; holdUsed = true;
      spawn(prev || takeNext());
      sfx("hold"); dirty = true;
    };
    const hardDrop = () => {
      if (!cur) return;
      const y0 = cur.y;
      let d = 0;
      while (fits(cur.t, cur.r, cur.x, cur.y + 1)) { cur.y++; d++; }
      if (d) lastRot = false;
      score += d * 2;
      trail = { t: cur.t, r: cur.r, x: cur.x, y0, y1: cur.y, age: 0 };
      sfx("drop");
      lockPiece();
    };
    const lockPiece = () => {
      const p = cur;
      cur = null;
      let tspin = false;
      if (p.t === "T" && lastRot) {
        let n = 0;
        [[0, 0], [2, 0], [0, 2], [2, 2]].forEach(([dx, dy]) => { if (solid(p.x + dx, p.y + dy)) n++; });
        tspin = n >= 3;
      }
      const cells = SHAPES[p.t][p.r].map(([cx, cy]) => [p.x + cx, p.y + cy]);
      cells.forEach(([x, y]) => { board[y][x] = p.t; });
      flash = { cells, age: 0 };
      holdUsed = false;
      const full = [];
      for (let y = 0; y < ROWS; y++) if (board[y].every(Boolean)) full.push(y);
      dirty = true;
      if (!full.length) {
        combo = -1;
        if (tspin) { score += 400 * level; toast("T-SPIN"); sfx("tspin"); } else sfx("lock");
        if (cells.every(([, y]) => y < HID)) { gameOver(); return; }   // locked entirely above the playfield
        spawn(takeNext());
        return;
      }
      const n = full.length;
      combo++;
      let pts = (tspin ? [400, 800, 1200, 1600] : [0, 100, 300, 500, 800])[n] * level;
      const hard = tspin || n === 4, bonus = hard && b2b;
      if (bonus) pts = Math.floor(pts * 1.5);
      b2b = hard;
      if (combo > 0) pts += 50 * combo * level;
      score += pts; lines += n;
      toast((tspin ? "T-SPIN " : "") + ["", "SINGLE", "DOUBLE", "TRIPLE", "TETRIS"][n]);
      if (bonus) toast("BACK-TO-BACK");
      if (combo > 0) toast("COMBO x" + combo);
      const lv = Math.floor(lines / 10) + 1;
      if (lv > level) { level = lv; toast("LEVEL " + level); sfx("level"); }
      clear = { rows: full, t: 0 };
      sfx("clear", n);
    };
    const finishClear = () => {
      clear.rows.sort((a, b) => a - b).forEach(y => { board.splice(y, 1); board.unshift(emptyRow()); });
      clear = null;
      spawn(takeNext());
    };

    /* ---- game flow ---- */
    const recordScore = () => {
      if (recorded) return false;
      recorded = true;
      if (score <= 0) return false;
      const list = store.get("tetrisScores", []);
      list.push({ s: score, l: lines, v: level, d: Date.now() });
      list.sort((a, b) => b.s - a.s);
      store.set("tetrisScores", list.slice(0, 10));
      const nb = score > best;
      if (nb) { best = score; store.set("tetrisBest", score); }
      return nb;
    };
    const releaseAll = () => { held.left = held.right = held.down = false; hdir = 0; $$(".is-down", touch).forEach(b => b.classList.remove("is-down")); };
    const gameOver = () => {
      releaseAll();
      newBest = recordScore();
      clear = null;
      overAnim = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? null : { t: 0 };
      overAt = performance.now();
      sfx("over");
      setState("over");
    };
    const reset = () => {
      board = Array.from({ length: ROWS }, emptyRow);
      queue = []; hold = null; holdUsed = false; cur = null; clear = null; flash = null; trail = null; toasts = [];
      score = 0; lines = 0; level = 1; combo = -1; b2b = false; lockT = 0; lockMoves = 0; gAcc = 0; lastRot = false; overAnim = null;
    };
    const start = () => {
      if (state === "play" || state === "pause") recordScore();
      reset();
      recorded = false; newBest = false;
      releaseAll();
      fill();
      sfx("start");
      setState("play");
      spawn(takeNext());
    };
    const pause = () => { if (state !== "play") return; releaseAll(); sfx("pause"); setState("pause"); };
    const resume = () => { if (state !== "pause") return; sfx("pause"); setState("play"); };

    /* ---- input: one set of actions for keyboard and touch ---- */
    const press = a => {
      if (state !== "play") return;
      if (a === "left" || a === "right") { held[a] = true; hdir = a === "left" ? -1 : 1; hNext = DAS; if (cur && !clear) move(hdir); return; }
      if (a === "down") { held.down = true; return; }
      if (!cur || clear) return;
      if (a === "cw") rotate(1);
      else if (a === "ccw") rotate(-1);
      else if (a === "hold") doHold();
      else if (a === "hard") hardDrop();
    };
    const release = a => {
      if (a === "left" || a === "right") { held[a] = false; const nd = held.right ? 1 : held.left ? -1 : 0; if (nd !== hdir) hNext = ARR; hdir = nd; }
      else if (a === "down") held.down = false;
    };
    const KEYS = {
      ArrowLeft: "left", ArrowRight: "right", ArrowDown: "down", ArrowUp: "cw", KeyX: "cw", KeyZ: "ccw", KeyC: "hold",
      ShiftLeft: "hold", ShiftRight: "hold", Space: "hard", KeyA: "left", KeyD: "right", KeyS: "down", KeyW: "cw",
    };
    win.onKey = e => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const c = e.code;
      if (c === "F2") { e.preventDefault(); start(); return; }
      if (c === "KeyP" || c === "Escape") {
        if (c === "KeyP" && !e.repeat) { e.preventDefault(); if (state === "play") pause(); else if (state === "pause") resume(); }
        else if (c === "Escape" && state === "play") pause();
        return;
      }
      if (state === "ready" || state === "over" || state === "pause") {
        if ((c === "Enter" || c === "NumpadEnter" || (c === "Space" && state !== "over")) && !e.repeat) {
          e.preventDefault();
          if (state === "pause") resume();
          else if (state === "ready" || performance.now() - overAt > 700) start();
        } else if (KEYS[c]) e.preventDefault();
        return;
      }
      const a = KEYS[c];
      if (!a) return;
      e.preventDefault();
      if (!e.repeat) press(a);
    };
    const onKeyUp = e => { const a = KEYS[e.code]; if (a) release(a); };
    const onBlur = () => { releaseAll(); pause(); };
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    $$("[data-t]", touch).forEach(b => {
      const a = b.dataset.t;
      const down = e => { e.preventDefault(); b.classList.add("is-down"); try { b.setPointerCapture(e.pointerId); } catch (x) { /* synthetic pointer */ } press(a); };
      const up = () => { if (b.classList.contains("is-down")) { b.classList.remove("is-down"); release(a); } };
      b.addEventListener("pointerdown", down);
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => b.addEventListener(ev, up));
      b.addEventListener("mousedown", e => e.preventDefault());
      b.addEventListener("contextmenu", e => e.preventDefault());
    });
    dlg.addEventListener("click", e => {
      const b = e.target.closest("[data-go]");
      if (!b) return;
      if (b.dataset.go === "start") start();
      else if (b.dataset.go === "resume") resume();
      else if (b.dataset.go === "scores") win.showScores();
    });
    // opening a menu pauses, like the real thing
    win.el.addEventListener("pointerdown", e => { if (e.target.closest(".menubar")) pause(); }, true);

    /* ---- per-frame update ---- */
    const update = dt => {
      if (clear) { clear.t += dt; if (clear.t >= CLEAR_MS) finishClear(); return; }
      if (!cur) return;
      if (hdir) {
        hNext -= dt;
        for (let i = 0; hNext <= 0 && i < 12; i++) { if (move(hdir)) hNext += ARR; else { hNext = ARR; break; } }
      }
      const gv = gravity(level), step = held.down ? Math.min(gv, SOFT) : gv;
      gAcc += dt;
      for (let i = 0; gAcc >= step && i < 40; i++) {
        gAcc -= step;
        if (!stepDown(held.down)) { gAcc = 0; break; }
        dirty = true;
      }
      if (!cur) return;
      if (grounded()) { lockT += dt; if (lockT >= LOCK_MS) lockPiece(); } else lockT = 0;
    };
    const age = dt => {
      let any = false;
      if (flash) { flash.age += dt; if (flash.age > 120) flash = null; else any = true; }
      if (trail) { trail.age += dt; if (trail.age > 180) trail = null; else any = true; }
      if (toasts.length) { toasts.forEach(t => { t.age += dt; }); toasts = toasts.filter(t => t.age < 1300); any = true; }
      if (overAnim) {
        overAnim.t += dt; any = true;
        if (overAnim.t >= 1050) { overAnim = null; showDlg(); }
      }
      return any;
    };
    const frame = ts => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      if (state === "play" && (win.min || WM.active !== "tetris")) pause();   // minimized, or another window took focus
      if (win.min) { last = ts; return; }
      const dt = Math.min(100, ts - (last || ts));
      last = ts;
      if (state === "play") update(dt);
      const fx = state === "play" || state === "over" ? age(dt) : false;
      hud();
      if (state === "play" || fx || dirty) { draw(); dirty = false; }
    };

    /* ---- rendering ---- */
    const drawPreview = (ctx, w, h, types, slotH, dim) => {
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
      types.forEach((t, i) => {
        if (!t) return;
        const cells = SHAPES[t][0], xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
        const minx = Math.min(...xs), miny = Math.min(...ys);
        const pw = (Math.max(...xs) - minx + 1) * M, ph = (Math.max(...ys) - miny + 1) * M;
        const ox = Math.round((w - pw) / 2) - minx * M, oy = Math.round(i * slotH + (slotH - ph) / 2) - miny * M;
        cells.forEach(([x, y]) => block(ctx, ox + x * M, oy + y * M, M, t, dim ? 0.3 : null));
      });
    };
    const draw = () => {
      const W = COLS * C, H = VIS * C, hidden = state === "ready" || state === "pause";
      g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
      if (opt.grid) {
        g.fillStyle = "#1a1a1a";
        for (let x = 1; x < COLS; x++) g.fillRect(x * C, 0, 1, H);
        for (let y = 1; y < VIS; y++) g.fillRect(0, y * C, W, 1);
      }
      if (!hidden) {
        for (let y = HID; y < ROWS; y++) {
          const clearing = clear && clear.rows.indexOf(y) >= 0;
          for (let x = 0; x < COLS; x++) {
            const t = board[y][x];
            if (!t) continue;
            if (!clearing) { block(g, x * C, (y - HID) * C, C, t); continue; }
            // line clear: flash white, then wipe outward from the middle
            const k = clear.t;
            if (k < 130) { block(g, x * C, (y - HID) * C, C, t); g.fillStyle = "rgba(255,255,255,.85)"; g.fillRect(x * C, (y - HID) * C, C, C); }
            else if (Math.abs(x - 4.5) > ((k - 130) / (CLEAR_MS - 130)) * 5) { block(g, x * C, (y - HID) * C, C, t); }
          }
        }
        if (cur && state === "play" && !clear) {
          if (opt.ghost) {
            const gy = ghostY();
            if (gy !== cur.y) {
              SHAPES[cur.t][cur.r].forEach(([cx, cy]) => {
                const py = gy + cy - HID;
                if (py < 0) return;
                const px = (cur.x + cx) * C;
                g.globalAlpha = 0.2; g.fillStyle = COLORS[cur.t]; g.fillRect(px, py * C, C, C);
                g.globalAlpha = 0.9; g.fillStyle = PAL[cur.t].hi;
                g.fillRect(px + 1, py * C + 1, C - 2, 2); g.fillRect(px + 1, py * C + C - 3, C - 2, 2);
                g.fillRect(px + 1, py * C + 3, 2, C - 6); g.fillRect(px + C - 3, py * C + 3, 2, C - 6);
                g.globalAlpha = 1;
              });
            }
          }
        }
        if (cur && !clear) {
          // a piece resting on the stack dims as its lock delay runs out
          const a = state === "play" && grounded() ? 1 - 0.4 * Math.min(1, lockT / LOCK_MS) : null;
          SHAPES[cur.t][cur.r].forEach(([cx, cy]) => {
            const py = cur.y + cy - HID;
            if (py >= 0) block(g, (cur.x + cx) * C, py * C, C, cur.t, a);
          });
        }
        if (trail) {
          const cols = {};
          SHAPES[trail.t][trail.r].forEach(([cx, cy]) => { if (cols[cx] == null || cy < cols[cx]) cols[cx] = cy; });
          g.fillStyle = "#fff"; g.globalAlpha = 0.2 * (1 - trail.age / 180);
          Object.keys(cols).forEach(cx => {
            const top = trail.y0 + cols[cx] - HID, bot = trail.y1 + cols[cx] - HID;
            if (bot > top) g.fillRect((trail.x + +cx) * C, Math.max(0, top) * C, C, (bot - Math.max(0, top)) * C);
          });
          g.globalAlpha = 1;
        }
        if (flash) {
          g.fillStyle = "#fff"; g.globalAlpha = 0.55 * (1 - flash.age / 120);
          flash.cells.forEach(([x, y]) => { if (y >= HID) g.fillRect(x * C, (y - HID) * C, C, C); });
          g.globalAlpha = 1;
        }
        if (overAnim) {
          const t = overAnim.t;
          for (let r = 0; r < VIS; r++) {
            const grey = t < 560 ? r >= VIS - Math.floor(t / 28) : r >= Math.floor((t - 560) / 24);
            if (grey) for (let x = 0; x < COLS; x++) block(g, x * C, r * C, C, "G");
          }
        }
        if (toasts.length) {
          g.textAlign = "center"; g.textBaseline = "middle";
          g.font = `bold ${Math.round(C * 0.62)}px Tahoma, "MS Sans Serif", Arial, sans-serif`;
          toasts.forEach(t => {
            const a = t.age < 950 ? 1 : Math.max(0, 1 - (t.age - 950) / 350), y = C * 4 + t.row * C * 1.05 - Math.min(t.age, 400) * 0.01 * C;
            g.globalAlpha = a;
            g.fillStyle = "#000"; g.fillText(t.text, W / 2 + 1, y + 1);
            g.fillStyle = t.text.indexOf("LEVEL") === 0 ? "#f0d020" : "#fff"; g.fillText(t.text, W / 2, y);
          });
          g.globalAlpha = 1;
        }
      }
      drawPreview(gh, hcv.clientWidth, hcv.clientHeight, [hold], hcv.clientHeight, holdUsed && state === "play");
      drawPreview(gn, ncv.clientWidth, ncv.clientHeight, state === "ready" || !queue ? [] : queue.slice(0, 3), M * 3, false);
    };

    /* ---- layout: cell size from the room available ---- */
    const sizeCanvas = (cvs, ctx, w, h) => {
      cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr);
      cvs.style.width = w + "px"; cvs.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    let laidOut = "";
    const layout = () => {
      const touchOn = getComputedStyle(touch).display !== "none", th = touchOn ? touch.offsetHeight + 8 : 0;
      const maxed = win.el.classList.contains("is-max");
      let c;
      if (maxed) {
        const pad = 12, gap = 8, side = colR.offsetWidth;
        c = Math.floor(Math.min((body.clientWidth - pad - gap - side - 4) / 10, (body.clientHeight - pad - th - 4) / 20));
        c = Math.max(12, Math.min(34, c));
      } else {
        c = Math.floor((WM.bounds().h - 132 - th) / 20);
        c = Math.max(12, Math.min(26, c));
      }
      const pw = colL.clientWidth - 4;
      const m = Math.max(8, Math.min(Math.round(c * 0.75), Math.floor((pw - 6) / 4)));
      const key = c + "/" + m + "/" + pw;
      if (key === laidOut) return;
      laidOut = key; C = c; M = m;
      sizeCanvas(cv, g, COLS * C, VIS * C);
      sizeCanvas(hcv, gh, pw, M * 3);
      sizeCanvas(ncv, gn, pw, M * 9);
      dirty = true;
    };
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => { if (win.el.classList.contains("is-max")) layout(); }); ro.observe(body); }
    const onWinResize = () => layout();
    window.addEventListener("resize", onWinResize);

    /* ---- public bits for the menu / window ---- */
    win.newGame = start;
    win.isPaused = () => state === "pause";
    win.togglePause = () => { if (state === "play") pause(); else if (state === "pause") resume(); };
    win.opt = opt;
    win.setOpt = (k, v) => { opt[k] = v; store.set("tetrisOpts", opt); dirty = true; };
    win.showScores = () => {
      const table = () => {
        const list = store.get("tetrisScores", []);
        if (!list.length) return `<p class="tet-hs__none">No scores yet. Go play a round.</p>`;
        return `<table class="tet-hs__t"><thead><tr><th>#</th><th>Score</th><th>Lines</th><th>Level</th><th>Date</th></tr></thead><tbody>${list.map((r, i) => `<tr><td>${i + 1}</td><td>${r.s}</td><td>${r.l}</td><td>${r.v}</td><td>${new Date(r.d).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</td></tr>`).join("")}</tbody></table>`;
      };
      WM.open("tetris-scores", {
        title: "Tetris High Scores", icon: "tetris", modal: true, resizable: false, w: 340,
        render(b, w) {
          b.innerHTML = `<div class="tet-hs"><div class="sunken-box tet-hs__box">${table()}</div><div class="dialog-buttons dialog-buttons--center"><button type="button" class="btn btn--default" data-ok>OK</button><button type="button" class="btn" data-reset>Reset</button></div></div>`;
          $("[data-ok]", b).addEventListener("click", () => w.close());
          $("[data-reset]", b).addEventListener("click", () => {
            msgBox({ title: "Tetris", icon: "question", text: "Clear all high scores?", buttons: ["Yes", "No"], defaultIndex: 1 }).then(r => {
              if (WM.get("tetris-scores") !== w) return;
              if (r === "Yes") {
                store.set("tetrisScores", []); store.set("tetrisBest", 0); best = 0;
                $(".tet-hs__box", b).innerHTML = table(); status();
              }
              $("[data-ok]", b).focus();
            });
          });
          b.addEventListener("keydown", e => { if (e.key === "Escape") w.close(); });
        },
        onOpen(w) { const d = $("[data-ok]", w.body); if (d) d.focus(); },
      });
    };
    win.stop = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onWinResize);
      if (state === "play" || state === "pause") recordScore();
      const s = WM.get("tetris-scores"); if (s) s.close();
    };
    // small read/write window onto the game for debugging and tests
    win.dbg = {
      get s() { return { state, score, lines, level, combo, b2b, hold, holdUsed, cur: cur && { ...cur }, queue: queue.slice(), board: board.map(r => r.map(v => v || ".").join("")), clearing: !!clear, C, M, hdir, held: { ...held }, lockT, lockMoves, best }; },
      put(rows) { rows.forEach((r, i) => { board[ROWS - rows.length + i] = Array.from(r).map(ch => (ch === "." || ch === " ") ? 0 : ch); }); dirty = true; },
      piece(t, r, x, y) { cur = { t, r, x, y }; lowest = y; lockT = 0; lockMoves = 0; lastRot = false; dirty = true; },
      setLastRot(v) { lastRot = v; },
      setQueue(q) { queue = q.slice(); fill(); },
      setLines(n) { lines = n; level = Math.floor(n / 10) + 1; },
      rotate, move, hardDrop, press, release, lockPiece, stepDown, fits,
    };

    reset();
    layout();
    status();
    showDlg();
    hud();
    draw();
    raf = requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ window + menu */
  (window.W98_APPS = window.W98_APPS || []).push({
    key: "tetris", label: "Tetris", group: "games", aliases: ["blocks", "tetr"],
    open(opts, W98) {
      const { WM, msgBox } = W98;
      WM.open("tetris", {
        title: "Tetris", icon: "tetris", from: opts.from, resizable: false,
        render(body, win) { build(body, win, W98); },
        menu: win => [
          { label: "Game", items: [
            { label: "New Game", hint: "F2", action: () => win.newGame() },
            { get label() { return win.isPaused() ? "Resume" : "Pause"; }, hint: "P", action: () => win.togglePause() },
            { sep: true },
            { label: "High Scores...", action: () => win.showScores() },
            { sep: true },
            { label: "Exit", action: () => win.close() },
          ] },
          { label: "Options", items: [
            { label: "Ghost Piece", get checked() { return win.opt.ghost; }, action: () => win.setOpt("ghost", !win.opt.ghost) },
            { label: "Grid Lines", get checked() { return win.opt.grid; }, action: () => win.setOpt("grid", !win.opt.grid) },
          ] },
          { label: "Help", items: [
            { label: "How to Play", action: () => msgBox({ title: "Tetris Help", icon: "info", text: "Move with the Left and Right arrows (or A and D). Down is a soft drop, Space is a hard drop.\n\nRotate with Up or X (clockwise) and Z (counter-clockwise). C or Shift swaps the piece with your hold slot, once per piece.\n\nFill a row to clear it. Four at once is a Tetris. Spin a T piece into a tight slot for a T-Spin, and chain clears for combos. The game speeds up every 10 lines. P pauses.\n\nOn a phone, use the buttons under the board." }) },
            { sep: true },
            { label: "About Tetris", action: () => msgBox({ title: "About Tetris", icon: "info", text: "Tetris, rebuilt for this desktop.\n\n7-bag randomizer, Super Rotation System with wall kicks, hold, ghost piece, lock delay and T-Spins." }) },
          ] },
        ],
        onClose: w => w.stop && w.stop(),
      });
    },
  });
})();
