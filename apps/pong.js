// pong: registers with window.W98_APPS (see script.js "Extension point")
(window.W98_APPS = window.W98_APPS || []).push({
  key: "pong", label: "Pong", group: "games", aliases: ["pingpong"],
  open(opts, W98) {
    const { WM, store, Sound, msgBox } = W98;

    // ---- court + tuning -------------------------------------------------
    const W = 480, H = 300, WALL = 6, PW = 8, PH = 52, BALL = 8, MARGIN = 16, TO_WIN = 7;
    const STEP = 1 / 120;                       // fixed simulation step (s)
    const BASE_SPEED = 230, HIT_BOOST = 17, MAX_SPEED = 540, MAX_ANGLE = 0.9;
    const HUMAN_SPEED = 380;                    // keyboard paddle speed (px/s)
    const MIN_Y = WALL + 2 + PH / 2, MAX_Y = H - WALL - 2 - PH / 2;
    // AI: speed = max paddle speed, err = aim error (px), reach = how early it starts tracking (fraction of court)
    const LEVELS = {
      easy:   { label: "Easy",   speed: 175, err: 46, reach: 0.62, predict: false },
      medium: { label: "Medium", speed: 285, err: 20, reach: 0.85, predict: true },
      hard:   { label: "Hard",   speed: 400, err: 6,  reach: 1,    predict: true },
    };
    const THEMES = {
      mono:  { label: "Monochrome",     bg: "#000000", fg: "#ececec", dim: "#5a5a5a" },
      green: { label: "Green phosphor", bg: "#020f05", fg: "#4dff7a", dim: "#1b7a3d" },
      amber: { label: "Amber",          bg: "#120a00", fg: "#ffb000", dim: "#7a5200" },
    };

    // ---- 3x5 pixel font (each glyph = 5 octal digits, one per row, 3 bits wide) ----
    const FONT = {};
    ("A25755 B65656 C34443 D65556 E74647 F74644 G34553 H55755 I72227 J11152 K55655 L44447 M57755 N65555 O25552 P65644 Q25563 R65655 S34216 T72222 U55557 V55552 W55775 X55255 Y55222 Z71247 " +
      "075557 126227 261247 361216 455711 574616 634757 771222 875757 975716 -00700 :02020 .00002 !22202 ?61202 /11244 +02720").split(" ").forEach(t => { FONT[t[0]] = t.slice(1); });
    const tw = (s, k) => s.length * 4 * k - k;

    WM.open("pong", {
      title: "Pong", icon: "pong", w: W + 14, from: opts.from, resizable: false,
      render(body, win) {
        body.classList.add("body--flush");
        body.innerHTML = `<div class="pong"><canvas class="pong__cv" width="${W}" height="${H}" aria-label="Pong court"></canvas></div>`;
        const wrap = body.firstElementChild, cv = wrap.firstElementChild, g = cv.getContext("2d");

        // ---- settings (remembered) ----
        let mode = store.get("pongMode", 1) === 2 ? 2 : 1;
        let level = LEVELS[store.get("pongLevel", "medium")] ? store.get("pongLevel", "medium") : "medium";
        let themeKey = THEMES[store.get("pongTheme", "mono")] ? store.get("pongTheme", "mono") : "mono";
        let best = store.get("pongBest", 0);
        let th = THEMES[themeKey];

        // ---- game state ----
        const L = { x: MARGIN, y: H / 2, err: 0 }, R = { x: W - MARGIN - PW, y: H / 2, err: 0 };
        const ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, sp: BASE_SPEED };
        let trail = [], trailT = 0;
        let state = "demo";                     // demo | serve | play | point | over
        let paused = false, scoreL = 0, scoreR = 0, rally = 0, winner = null;
        let timer = 0, count = 3, serveDir = 1, held = new Set(), blink = 0;
        let raf = 0, last = 0, acc = 0, dead = false;

        const clampY = y => Math.max(MIN_Y, Math.min(MAX_Y, y));
        const lv = () => LEVELS[state === "demo" ? "medium" : level];
        const playing = () => state === "serve" || state === "play" || state === "point";

        const blip = (f, d = 0.06, type = "square", vol = 0.05) => {
          if (Sound.muted || !Sound.ctx || Sound.ctx.state !== "running") return;
          Sound.tone(f, Sound.ctx.currentTime + 0.005, d, type, vol, 0.002);
        };
        const names = () => mode === 2 ? ["P1", "P2"] : ["YOU", "CPU"];
        const status = () => win.setStatus([mode === 2 ? "2 Players - first to " + TO_WIN : "1 Player - " + LEVELS[level].label + " - first to " + TO_WIN, best ? "Best rally: " + best : "Best rally: -"]);

        // ---- flow ----
        const rollErr = () => { const e = lv().err; L.err = (Math.random() * 2 - 1) * e; R.err = (Math.random() * 2 - 1) * e; };
        function startServe(dir) {
          state = "serve"; serveDir = dir; count = 3; timer = 0; rally = 0;
          ball.x = W / 2; ball.y = H / 2; ball.vx = ball.vy = 0; ball.sp = BASE_SPEED; trail = [];
          rollErr();
          blip(392, 0.09, "square", 0.04);
        }
        function launch() {
          state = "play";
          const a = (Math.random() * 2 - 1) * 0.45;
          ball.sp = BASE_SPEED;
          ball.vx = serveDir * Math.cos(a) * ball.sp; ball.vy = Math.sin(a) * ball.sp;
        }
        function newGame() {
          paused = false; scoreL = scoreR = 0; winner = null; held.clear();
          L.y = R.y = H / 2;
          startServe(Math.random() < 0.5 ? -1 : 1);
          status();
        }
        function startDemo() {
          state = "demo"; paused = false; scoreL = scoreR = 0; L.y = R.y = H / 2;
          ball.x = W / 2; ball.y = H / 2; ball.sp = BASE_SPEED;
          const a = (Math.random() * 2 - 1) * 0.45;
          ball.vx = (Math.random() < 0.5 ? -1 : 1) * Math.cos(a) * BASE_SPEED; ball.vy = Math.sin(a) * BASE_SPEED;
          rollErr(); trail = [];
        }
        function point(side) {                  // side: "L" or "R" scored
          if (state === "demo") { startDemo(); return; }
          if (rally > best) { best = rally; store.set("pongBest", best); status(); }
          if (side === "L") scoreL++; else scoreR++;
          blip(side === "L" ? 520 : 400, 0.28, "square", 0.05);
          if (scoreL >= TO_WIN || scoreR >= TO_WIN) {
            state = "over"; winner = side; ball.vx = ball.vy = 0;
            const human = mode === 2 || side === "L";
            setTimeout(() => { if (!dead) Sound.play(human ? "win" : "error"); }, 180);
            return;
          }
          state = "point"; timer = 0; ball.vx = ball.vy = 0;
          serveDir = side === "L" ? 1 : -1;     // serve towards whoever just lost the point
        }
        function togglePause() {
          if (!playing()) return;
          paused = !paused; last = 0;
        }
        const primary = () => { if (state === "demo" || state === "over") newGame(); else if (paused) { paused = false; last = 0; } };

        // ---- AI ----
        function predictY(px) {
          const t = Math.abs((px - ball.x) / (ball.vx || 1));
          const lo = WALL + BALL / 2, span = H - WALL - BALL / 2 - lo;
          let y = ball.y + ball.vy * t - lo;
          y = ((y % (2 * span)) + 2 * span) % (2 * span);
          if (y > span) y = 2 * span - y;
          return y + lo;
        }
        function ai(p, side, dt) {              // side: -1 = left paddle, +1 = right paddle
          const l = lv();
          let target = H / 2;
          const toward = side > 0 ? ball.vx > 0 : ball.vx < 0;
          if (toward && (state === "play" || state === "demo")) {
            const px = side > 0 ? p.x : p.x + PW, dist = side > 0 ? px - ball.x : ball.x - px;
            if (dist <= W * l.reach) target = (l.predict ? predictY(px) : ball.y) + p.err;
          }
          const d = target - p.y;
          if (Math.abs(d) > 3) p.y = clampY(p.y + Math.sign(d) * Math.min(Math.abs(d), l.speed * dt));
        }

        // ---- simulation ----
        function hit(p, dir) {
          const off = Math.max(-1, Math.min(1, (ball.y - p.y) / (PH / 2 + BALL / 2)));
          const a = off * MAX_ANGLE;
          ball.sp = Math.min(MAX_SPEED, ball.sp + HIT_BOOST);
          ball.vx = dir * Math.cos(a) * ball.sp; ball.vy = Math.sin(a) * ball.sp;
          ball.x = dir > 0 ? p.x + PW + BALL / 2 : p.x - BALL / 2;
          rally++; rollErr();
          blip(460 + Math.min(rally, 20) * 8, 0.06);
        }
        function update(dt) {
          blink += dt;
          // paddles
          if (state === "demo") { ai(L, -1, dt); ai(R, 1, dt); }
          else {
            const up1 = held.has("w") || (mode === 1 && held.has("up")), dn1 = held.has("s") || (mode === 1 && held.has("down"));
            if (up1 !== dn1) L.y = clampY(L.y + (dn1 ? 1 : -1) * HUMAN_SPEED * dt);
            if (mode === 2) {
              const up2 = held.has("up"), dn2 = held.has("down");
              if (up2 !== dn2) R.y = clampY(R.y + (dn2 ? 1 : -1) * HUMAN_SPEED * dt);
            } else if (state !== "over") ai(R, 1, dt);
          }
          if (state === "serve" || state === "point") {
            timer += dt;
            if (state === "point" && timer > 0.9) startServe(serveDir);
            else if (state === "serve") {
              if (count === 0) { if (timer > 0.5) launch(); }
              else if (timer > 0.7) { timer = 0; count--; if (count === 0) { blip(784, 0.14, "square", 0.05); launch(); } else blip(392, 0.09, "square", 0.04); }
            }
            return;
          }
          if (state !== "play" && state !== "demo") return;
          ball.x += ball.vx * dt; ball.y += ball.vy * dt;
          const top = WALL + BALL / 2, bot = H - WALL - BALL / 2;
          if (ball.y < top) { ball.y = top; ball.vy = Math.abs(ball.vy); blip(226, 0.05); }
          else if (ball.y > bot) { ball.y = bot; ball.vy = -Math.abs(ball.vy); blip(226, 0.05); }
          const r = BALL / 2, reach = PH / 2 + r;
          if (ball.vx < 0 && ball.x - r <= L.x + PW && ball.x + r >= L.x && Math.abs(ball.y - L.y) <= reach) hit(L, 1);
          else if (ball.vx > 0 && ball.x + r >= R.x && ball.x - r <= R.x + PW && Math.abs(ball.y - R.y) <= reach) hit(R, -1);
          else if (ball.x + r < 0) point("R");
          else if (ball.x - r > W) point("L");
          if ((trailT += dt) > 0.018) { trailT = 0; trail.push(ball.x, ball.y); if (trail.length > 8) trail.splice(0, 2); }
        }

        // ---- drawing ----
        function text(str, cx, y, k, color, left) {
          let x = left ? cx : Math.round(cx - tw(str, k) / 2);
          g.fillStyle = color;
          for (const ch of str) {
            const rows = FONT[ch];
            if (rows) for (let r = 0; r < 5; r++) { const bits = rows.charCodeAt(r) - 48; for (let c = 0; c < 3; c++) if (bits & (4 >> c)) g.fillRect(x + c * k, y + r * k, k, k); }
            x += 4 * k;
          }
        }
        const veil = () => { g.globalAlpha = 0.62; g.fillStyle = th.bg; g.fillRect(0, WALL, W, H - WALL * 2); g.globalAlpha = 1; };
        function draw() {
          g.fillStyle = th.bg; g.fillRect(0, 0, W, H);
          g.fillStyle = th.fg; g.fillRect(0, 0, W, WALL); g.fillRect(0, H - WALL, W, WALL);
          g.fillStyle = th.dim;
          for (let y = WALL + 6; y < H - WALL - 6; y += 18) g.fillRect(W / 2 - 2, y, 4, 10);
          if (state !== "demo") {
            const nm = names();
            text(String(scoreL), W / 2 - 56 - 12, 22, 8, th.fg, true);
            text(String(scoreR), W / 2 + 56 - 12, 22, 8, th.fg, true);
            text(nm[0], W / 2 - 56, 70, 2, th.dim);
            text(nm[1], W / 2 + 56, 70, 2, th.dim);
            if (rally >= 3 && state === "play") text("RALLY " + rally, W / 2, H - WALL - 18, 2, th.dim);
          }
          // ball trail, paddles, ball
          g.fillStyle = th.dim;
          for (let i = 0; i < trail.length; i += 2) { const k = i / 2; g.globalAlpha = 0.18 + k * 0.07; g.fillRect(Math.round(trail[i] - BALL / 2), Math.round(trail[i + 1] - BALL / 2), BALL, BALL); }
          g.globalAlpha = 1;
          g.fillStyle = th.fg;
          g.fillRect(L.x, Math.round(L.y - PH / 2), PW, PH);
          g.fillRect(R.x, Math.round(R.y - PH / 2), PW, PH);
          if (state !== "over") g.fillRect(Math.round(ball.x - BALL / 2), Math.round(ball.y - BALL / 2), BALL, BALL);
          // overlays
          const on = Math.floor(blink * 1.6) % 2 === 0;
          if (state === "serve" && count > 0) text(String(count), W / 2, 188, 8, th.fg);
          if (state === "demo") {
            veil();
            text("PONG", W / 2, 66, 14, th.fg);
            g.fillStyle = th.fg; g.fillRect(W / 2 - 105, 150, 210, 3);
            if (on) text("PRESS SPACE OR CLICK", W / 2, 172, 3, th.fg);
            text(mode === 2 ? "2 PLAYERS  W S AND UP DOWN" : "1 PLAYER  " + LEVELS[level].label.toUpperCase() + "  W S OR MOUSE", W / 2, 212, 2, th.dim);
            text("FIRST TO " + TO_WIN, W / 2, 232, 2, th.dim);
          } else if (state === "over") {
            veil();
            const msg = mode === 2 ? (winner === "L" ? "PLAYER 1 WINS" : "PLAYER 2 WINS") : (winner === "L" ? "YOU WIN" : "CPU WINS");
            text(msg, W / 2, 98, mode === 2 ? 5 : 7, th.fg);
            text(scoreL + " - " + scoreR, W / 2, 150, 4, th.fg);
            if (on) text("SPACE FOR A NEW GAME", W / 2, 196, 2, th.fg);
          } else if (paused) {
            veil();
            text("PAUSED", W / 2, 106, 8, th.fg);
            if (on) text("PRESS SPACE OR CLICK", W / 2, 164, 2, th.fg);
          }
        }

        // ---- loop ----
        function frame(ts) {
          raf = requestAnimationFrame(frame);
          if (win.min) { last = 0; return; }
          if (!last) last = ts;
          const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
          if (playing() && !paused && WM.active !== "pong") paused = true;     // lost focus: auto-pause
          if (!paused) { acc += dt; let n = 0; while (acc >= STEP && n++ < 12) { update(STEP); acc -= STEP; } if (n >= 12) acc = 0; }
          else blink += dt;
          draw();
        }

        // ---- input ----
        const keyName = k => ({ w: "w", W: "w", s: "s", S: "s", ArrowUp: "up", ArrowDown: "down" })[k];
        win.onKey = e => {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          const kn = keyName(e.key);
          if (kn) { e.preventDefault(); held.add(kn); return; }
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (e.repeat) return;
            if (state === "demo" || state === "over") newGame(); else if (e.key === " " || paused) togglePause();
          } else if (e.key === "p" || e.key === "P") { e.preventDefault(); togglePause(); }
          else if (e.key === "F2") { e.preventDefault(); newGame(); }
        };
        const onKeyUp = e => { const kn = keyName(e.key); if (kn) held.delete(kn); };
        const onBlur = () => held.clear();
        document.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", onBlur);

        const moveTo = e => {
          if (paused || state === "demo" || state === "over") return;
          const r = cv.getBoundingClientRect();
          const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
          if (mode === 2 && x > W / 2) R.y = clampY(y); else L.y = clampY(y);
        };
        cv.addEventListener("pointermove", moveTo);
        cv.addEventListener("pointerdown", e => { primary(); moveTo(e); });

        // ---- settings ----
        const setMode = m => { mode = m; store.set("pongMode", m); newGame(); };
        const setLevel = l => { level = l; store.set("pongLevel", l); rollErr(); status(); };
        const setTheme = t => { themeKey = t; th = THEMES[t]; store.set("pongTheme", t); wrap.style.background = th.bg; };
        wrap.style.background = th.bg;
        win.pong = {
          get mode() { return mode; }, get level() { return level; }, get theme() { return themeKey; }, get paused() { return paused; }, get live() { return playing(); },
          newGame, togglePause, setMode, setLevel, setTheme,
          get state() { return state; }, get score() { return [scoreL, scoreR]; }, get ball() { return ball; }, get rally() { return rally; },
        };
        win.stop = () => { dead = true; cancelAnimationFrame(raf); document.removeEventListener("keyup", onKeyUp); window.removeEventListener("blur", onBlur); };

        startDemo(); status();
        raf = requestAnimationFrame(frame);
      },
      menu: win => [
        { label: "Game", get items() {
          const p = win.pong;
          return [
            { label: "New Game", hint: "F2", action: () => p.newGame() },
            { label: "Pause", hint: "Space", checked: p.paused, disabled: !p.live, action: () => p.togglePause() },
            { sep: true },
            { label: "1 Player", checked: p.mode === 1, action: () => p.setMode(1) },
            { label: "2 Players", checked: p.mode === 2, action: () => p.setMode(2) },
            { sep: true },
            { label: "Difficulty (1 Player)", disabled: true },
            { label: "Easy", checked: p.level === "easy", action: () => p.setLevel("easy") },
            { label: "Medium", checked: p.level === "medium", action: () => p.setLevel("medium") },
            { label: "Hard", checked: p.level === "hard", action: () => p.setLevel("hard") },
            { sep: true },
            { label: "Exit", action: () => win.close() },
          ];
        } },
        { label: "View", get items() {
          const p = win.pong;
          return Object.keys(THEMES).map(k => ({ label: THEMES[k].label, checked: p.theme === k, action: () => p.setTheme(k) }));
        } },
        { label: "Help", items: [
          { label: "How to Play", action: () => msgBox({ title: "Pong Help", icon: "info", text: "Beat the other paddle. First to " + TO_WIN + " points wins.\n\n1 Player: move with the mouse (or touch), W and S, or the Up and Down arrows.\n2 Players: left paddle W and S, right paddle Up and Down (or touch each half).\n\nThe ball speeds up every time it is hit, and the angle depends on where it lands on the paddle.\n\nSpace or P pauses. F2 starts a new game." }) },
        ] },
      ],
      onClose: w => w.stop && w.stop(),
    });
  },
});
