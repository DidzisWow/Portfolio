/* Five Nights at the Server
   An original night-shift survival game for the Win98 desktop. Four home-made
   office mascots wander a dark data centre; keep them out until 6 AM.
   Everything (art, sound, AI) is generated in code: no images, no audio files.
   Registers with window.W98_APPS (see script.js "Extension point"). */
(function () {
  "use strict";

  const W = 800, H = 540;
  const NIGHT_LEN = 90, HOUR = NIGHT_LEN / 6;           // 15 s of real time per in-game hour
  const MONO = '"Lucida Console","Courier New",monospace';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------------------------------------------------------------- world */
  const CAM_ROOM = ["", "LAB", "SERVERS", "WEST", "EAST", "CLOSET", "BREAK"];       // index = camera number
  const CAM_OF = { LAB: 1, SERVERS: 2, WEST: 3, EAST: 4, CLOSET: 5, BREAK: 6 };
  const ROOM_TITLE = { LAB: "MAIN LAB", SERVERS: "SERVER ROOM", WEST: "WEST HALL", EAST: "EAST HALL", CLOSET: "SUPPLY CLOSET", BREAK: "BREAK ROOM" };
  const MASCOTS = {
    floppy: { name: "Floppy", side: "L", start: "LAB", every: 4.3, door: [6.2, 9.0], headY: -76, ds: 2.4 },
    dot:    { name: "Dot",    side: "R", start: "LAB", every: 3.8, door: [4.8, 7.4], headY: -84, ds: 2.1 },
    baud:   { name: "Baud",   side: "R", start: "SERVERS", every: 4.8, door: [4.6, 6.8], headY: -80, ds: 2.2 },
    cursor: { name: "Cursor", side: "L", start: "CLOSET", every: 4.4, headY: -76, jscale: 0.62, ds: 2.0 },
  };
  const ROUTES = {
    floppy: { LAB: ["SERVERS", "WEST", "WEST"], SERVERS: ["WEST", "WEST", "LAB"], WEST: ["LDOOR", "LDOOR", "SERVERS"] },
    dot:    { LAB: ["BREAK", "SERVERS"], SERVERS: ["EAST", "BREAK"], BREAK: ["EAST", "EAST", "LAB"], EAST: ["RDOOR", "RDOOR", "BREAK"] },
    baud:   { SERVERS: ["EAST", "BREAK", "EAST"], BREAK: ["EAST", "SERVERS"], EAST: ["RDOOR", "RDOOR", "SERVERS"] },
  };
  // AI level 0-20 (chance per move opportunity = level / 20) and power drain per usage bar
  const NIGHTS = [
    { ai: { floppy: 4,  dot: 3,  baud: 0,  cursor: 0 },  drain: 0.37 },
    { ai: { floppy: 6,  dot: 5,  baud: 3,  cursor: 4 },  drain: 0.40 },
    { ai: { floppy: 8,  dot: 7,  baud: 5,  cursor: 6 },  drain: 0.43 },
    { ai: { floppy: 9,  dot: 8,  baud: 7,  cursor: 8 },  drain: 0.45 },
    { ai: { floppy: 11, dot: 10, baud: 9,  cursor: 10 }, drain: 0.48 },
  ];
  const CALLS = [
    ["Hello? Hello, is this thing recording? Great. Welcome to the night shift at Northgate Data Services!",
     "Your job is simple. Sit in the office, keep an eye on the cameras and make sure nobody touches the servers. Nobody.",
     "The usual suspects are our four mascots: Floppy, Dot, Baud and Cursor. They did the school demo days back in '94. Real crowd pleasers.",
     "Their motion routines go a little off after midnight. The old servers run hot, and they wander. Toward the office, mostly.",
     "If one is at your door, shut it. But doors and lights use power, so don't go wild with them.",
     "Oh, and Baud likes the glow of the monitor. Don't stare at the cameras all night. Alright. Good luck, and, uh, goodnight!"],
    ["Hello, hello! Look at you, still here. Management is thrilled.",
     "Small thing. Cursor has been getting out of the supply closet. That's CAM 5. If he's out, you'll hear him pounding down the west hall. Close that left door, quick.",
     "Dot is fast on the right side. Just a heads up. Okay, bye!"],
    ["Hey. Night three, wow. Not many make it this far. Not that I'm counting.",
     "Dot got into the toner again. I don't know why that matters, but she's been more... energetic.",
     "Keep an eye on that power meter. If the lights go out, well. Baud knows a song. It's not a nice one."],
    ["Hello... if you can hear this, you're doing better than I expected.",
     "They're moving faster now. I'd blame the heat, but I stopped believing that a while ago.",
     "Stay off the cameras when you can and save the doors for when it counts. You've got this."],
    ["Hel... lo? ...it's the last... (static) ...no more calls... (static)",
     "...you're on your own tonight."],
  ];
  const HELP = "Survive from 12 AM to 6 AM, five nights in a row.\n\nA / D  -  close the left / right door\nQ / E  -  hold to shine the left / right hall light\nSpace or S  -  raise or lower the camera monitor\n1 - 6  -  pick a camera      P  -  pause\n\nMascots that reach your door walk in unless it is shut. Doors, lights and the monitor all drain power; if it hits zero you are in the dark. Floppy and Dot come down the halls. Baud only moves while you watch the monitor. Cursor sneaks out of the supply closet when you are not watching it, then runs.";

  /* ---------------------------------------------------------------- sound */
  // Everything is synthesized with WebAudio on top of the desktop's shared context
  // (W98.Sound), so the volume slider and Mute checkbox in the tray apply here too.
  function makeAudio(S) {
    let bus = null, nb = null, hum = null, buzz = null, camLoop = null;
    const ready = () => !!(S.ctx && S.ctx.state === "running");
    const out = () => {
      if (!bus) { bus = S.ctx.createGain(); bus.gain.value = S.muted ? 0 : 1; bus.connect(S.master()); }
      return bus;
    };
    const noiseBuf = () => {
      if (!nb) { const c = S.ctx, n = c.sampleRate; nb = c.createBuffer(1, n, c.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
      return nb;
    };
    const route = (node, pan) => {
      const c = S.ctx;
      if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(out()); }
      else node.connect(out());
    };
    function tone(f, dur, o = {}) {
      if (!ready() || S.muted) return;
      const c = S.ctx, t = c.currentTime + (o.delay || 0) + 0.01, os = c.createOscillator(), gn = c.createGain();
      os.type = o.type || "sine";
      os.frequency.setValueAtTime(f, t);
      if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(o.vol == null ? 0.1 : o.vol, t + (o.attack || 0.005));
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      if (o.lp) { const fl = c.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = o.lp; os.connect(fl); fl.connect(gn); } else os.connect(gn);
      route(gn, o.pan);
      os.start(t); os.stop(t + dur + 0.05);
    }
    function noise(dur, o = {}) {
      if (!ready() || S.muted) return;
      const c = S.ctx, t = c.currentTime + (o.delay || 0) + 0.01, src = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain();
      src.buffer = noiseBuf(); src.loop = true;
      fl.type = o.type || "lowpass"; fl.frequency.value = o.f || 1000; fl.Q.value = o.q || 0.7;
      gn.gain.setValueAtTime(o.vol == null ? 0.2 : o.vol, t);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(fl); fl.connect(gn); route(gn, o.pan);
      src.start(t, Math.random() * 0.8); src.stop(t + dur + 0.05);
    }
    function loop(kind) {
      if (!ready()) return null;
      const c = S.ctx, t = c.currentTime, g = c.createGain(), nodes = [];
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 1.2); g.connect(out());
      const osc = (type, f, v, lp) => {
        const o = c.createOscillator(), gg = c.createGain(); o.type = type; o.frequency.value = f; gg.gain.value = v;
        if (lp) { const fl = c.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; o.connect(fl); fl.connect(gg); } else o.connect(gg);
        gg.connect(g); o.start(); nodes.push(o);
      };
      const nz = (f, v, type) => {
        const s = c.createBufferSource(), fl = c.createBiquadFilter(), gg = c.createGain();
        s.buffer = noiseBuf(); s.loop = true; fl.type = type || "lowpass"; fl.frequency.value = f; gg.gain.value = v;
        s.connect(fl); fl.connect(gg); gg.connect(g); s.start(); nodes.push(s);
      };
      if (kind === "hum") { osc("sine", 50, 0.1); osc("sine", 100.6, 0.04); osc("sawtooth", 49.6, 0.025, 180); nz(420, 0.05); }
      else if (kind === "buzz") { osc("sawtooth", 118, 0.03, 900); osc("square", 59, 0.015, 400); }
      else if (kind === "cam") { osc("sine", 120, 0.03); nz(3200, 0.012, "bandpass"); }
      return { g, nodes };
    }
    function kill(l, fade) {
      if (!l) return;
      try {
        const t = S.ctx.currentTime;
        l.g.gain.cancelScheduledValues(t); l.g.gain.setValueAtTime(l.g.gain.value, t); l.g.gain.linearRampToValueAtTime(0.0001, t + (fade || 0.08));
        l.nodes.forEach(n => { try { n.stop(t + (fade || 0.08) + 0.02); } catch (e) {} });
      } catch (e) {}
    }
    const A = {
      ready, tone, noise,
      sync(on) { if (bus) { const v = on && !S.muted ? 1 : 0; if (bus.gain.value !== v) bus.gain.value = v; } },
      hum(on) { if (on && !hum) hum = loop("hum"); else if (!on) { kill(hum, .4); hum = null; } },
      buzz(on) { if (on && !buzz) buzz = loop("buzz"); else if (!on && buzz) { kill(buzz); buzz = null; } },
      cam(on) { if (on && !camLoop) camLoop = loop("cam"); else if (!on && camLoop) { kill(camLoop); camLoop = null; } },
      door(down) {
        noise(.2, { f: down ? 260 : 200, vol: down ? .5 : .28 });
        tone(down ? 70 : 110, .24, { vol: down ? .38 : .15, slide: down ? 36 : 180 });
        tone(down ? 190 : 110, .26, { type: "sawtooth", vol: .045, slide: down ? 100 : 210, lp: 600 });
      },
      light(on) { tone(on ? 920 : 640, .05, { type: "square", vol: .035 }); },
      camFlip(up) { noise(.25, { type: "bandpass", f: up ? 900 : 500, vol: .22 }); tone(up ? 160 : 100, .2, { vol: .22, slide: 60 }); },
      blip() { noise(.22, { type: "bandpass", f: 2600, vol: .22 }); tone(1180, .05, { type: "square", vol: .035 }); },
      step(pan, vol) { noise(.07, { f: 240, vol: vol * 1.2, pan }); tone(82, .12, { vol: vol * .9, slide: 48, pan }); },
      clank(pan) { noise(.12, { f: 1400, vol: .16, pan }); tone(210, .2, { type: "triangle", vol: .12, slide: 120, pan }); tone(530, .12, { type: "square", vol: .02, pan }); },
      run() { for (let i = 0; i < 9; i++) { const p = -0.7 + i * 0.05; noise(.07, { f: 240, vol: .1 + i * .045, pan: p, delay: i * .2 }); tone(80, .12, { vol: .1 + i * .04, slide: 46, pan: p, delay: i * .2 }); } },
      bang(n) { for (let i = 0; i < 3; i++) { noise(.16, { f: 380, vol: .6, delay: i * .17 }); tone(64, .22, { vol: .5, slide: 36, delay: i * .17 }); } if (n) tone(40, .6, { vol: .2, slide: 25, delay: .5 }); },
      sting() { noise(.4, { type: "highpass", f: 3000, vol: .3 }); tone(3300, .35, { type: "square", vol: .04, slide: 1700 }); tone(2490, .35, { type: "square", vol: .03, slide: 1300 }); },
      scream() {
        noise(1.25, { type: "highpass", f: 700, vol: .4 });
        noise(.9, { type: "bandpass", f: 1800, vol: .28, q: 3 });
        [[640, 2100], [420, 1600], [900, 2900], [310, 1250]].forEach(a => tone(a[0], 1.1, { type: "sawtooth", vol: .09, slide: a[1], lp: 6000, attack: .01 }));
        tone(72, .9, { type: "square", vol: .16, slide: 38 });
      },
      ring() { for (let i = 0; i < 3; i++) { tone(1320, .09, { type: "square", vol: .035, delay: i * .5 }); tone(1480, .09, { type: "square", vol: .035, delay: i * .5 + .11 }); } },
      voice() { tone(rand(120, 210), .06, { type: "triangle", vol: .018, lp: 900 }); },
      powerDown() { tone(260, 1.5, { type: "sawtooth", vol: .14, slide: 28, lp: 1400 }); noise(.5, { f: 180, vol: .4 }); tone(60, .5, { vol: .3, slide: 30 }); },
      jingle() {
        // a small music-box tune (original) that plays when the lights die
        const seq = [[659, 0], [784, .38], [988, .76], [784, 1.14], [880, 1.52], [698, 1.9], [587, 2.28], [698, 2.66], [659, 3.2], [784, 3.58], [988, 3.96], [1175, 4.34], [988, 4.72], [880, 5.1], [784, 5.48], [659, 6.1]];
        seq.forEach(n => { tone(n[0], .55, { vol: .07, delay: n[1] }); tone(n[0] * 2, .25, { vol: .018, delay: n[1] }); });
      },
      chime() { [523, 659, 784, 1047, 1319].forEach((f, i) => { tone(f, 1.2, { type: "triangle", vol: .08, delay: i * .14 }); tone(f * 2, .6, { vol: .02, delay: i * .14 }); }); },
      tick() { tone(740, .07, { type: "square", vol: .03 }); },
      ding() { tone(1318, .5, { vol: .08 }); tone(1760, .6, { vol: .05, delay: .07 }); },
      dispose() { A.hum(false); A.buzz(false); A.cam(false); try { if (bus) bus.disconnect(); } catch (e) {} bus = null; },
    };
    return A;
  }

  /* ---------------------------------------------------------------- drawing kit */
  // All art is flat shapes on one 800x540 canvas. In "mono" mode every colour is
  // converted to a green-grey CCTV tone, so one scene function serves both the
  // office and the security cameras.
  let g = null, mono = false, skip = false, inGlow = false;
  const tintCache = new Map();
  function tint(hex) {
    let v = tintCache.get(hex);
    if (v) return v;
    let h = hex.slice(1); if (h.length === 3) h = h.replace(/./g, "$&$&");
    const r = parseInt(h.slice(0, 2), 16), gr = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const l = 0.3 * r + 0.59 * gr + 0.11 * b;
    v = `rgb(${(l * 0.66) | 0},${Math.min(255, l * 0.96 + 6) | 0},${(l * 0.72) | 0})`;
    tintCache.set(hex, v);
    return v;
  }
  const K = c => (mono ? tint(c) : c);
  const hide = () => skip && !inGlow;
  const R = (x, y, w, h, c) => { if (hide()) return; g.fillStyle = K(c); g.fillRect(x, y, w, h); };
  const P = (p, c) => {
    if (hide()) return;
    g.fillStyle = K(c); g.beginPath(); g.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
    g.closePath(); g.fill();
  };
  const O = (x, y, r, c) => { if (hide()) return; g.fillStyle = K(c); g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); };
  const LN = (x1, y1, x2, y2, c, w = 1) => { if (hide()) return; g.strokeStyle = K(c); g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  const TX = (s, x, y, c, size, align = "left", weight = "bold") => {
    if (hide()) return;
    g.font = `${weight} ${size}px ${MONO}`; g.textAlign = align; g.textBaseline = "alphabetic"; g.fillStyle = K(c); g.fillText(s, x, y);
  };
  const GL = fn => { inGlow = true; fn(); inGlow = false; };
  const ALPHA = (a, fn) => { const o = g.globalAlpha; g.globalAlpha = o * a; fn(); g.globalAlpha = o; };
  const FRAME = (x, y, w, h, c, t = 1) => { R(x, y, w, t, c); R(x, y + h - t, w, t, c); R(x, y, t, h, c); R(x + w - t, y, t, h, c); };

  /* ---------------------------------------------------------------- the mascots */
  // Original characters: a floppy disk, a dot-matrix printer, a modem and a mouse cursor.
  // Origin is the point between the feet; roughly 105-135 units tall.
  function mouth(x, y, w, h, open, c1) {
    const hh = h + open * h * 4.5;
    R(x, y, w, hh, c1 || "#0a0a0a");
    const n = Math.max(3, Math.round(w / 6)), tw = w / n, th = Math.min(hh * 0.5, 3 + open * 6);
    for (let i = 0; i < n; i++) {
      const tx = x + i * tw;
      P([tx + 0.5, y, tx + tw - 0.5, y, tx + tw / 2, y + th], "#ece8da");
      if (open > 0.2) P([tx + 0.5, y + hh, tx + tw - 0.5, y + hh, tx + tw / 2, y + hh - Math.min(hh * 0.5, 3 + open * 5)], "#ece8da");
    }
  }
  function eye(x, y, r, o) {
    GL(() => { O(x, y, r, "#f2f0e4"); O(x + (o.look || 0) * r * 0.35, y, r * (o.pin ? 0.28 : 0.52), "#050505"); });
  }
  function mFloppy(o) {
    const op = o.open || 0;
    R(-14, -26, 9, 26, "#18223f"); R(5, -26, 9, 26, "#18223f");
    R(-19, -5, 14, 5, "#0b1020"); R(5, -5, 14, 5, "#0b1020");
    R(-27, -54, 7, 29, "#1e3a8a"); R(20, -54, 7, 29, "#1e3a8a");
    O(-23.5, -23, 4.6, "#dcdcd4"); O(23.5, -23, 4.6, "#dcdcd4");
    R(-17, -54, 34, 32, "#233f94"); R(-17, -26, 34, 4, "#18306f");
    R(-9, -40, 18, 11, "#e8e4d4"); R(-6, -37, 12, 1.6, "#9a9684"); R(-6, -33.5, 8, 1.6, "#9a9684");
    P([0, -53, -10, -60, -10, -46], "#c0392b"); P([0, -53, 10, -60, 10, -46], "#c0392b"); R(-2.5, -56, 5, 6, "#8a2519");
    P([-25, -106, 13, -106, 25, -94, 25, -58, -25, -58], "#2f5bd0");
    R(-25, -62, 50, 4, "#2449a8");
    P([13, -106, 25, -94, 13, -94], "#1e3a8a");
    R(-14, -106, 27, 19, "#c0c4cc"); R(-14, -89, 27, 2, "#8b9098"); R(4, -104, 7, 14, "#4a4f56");
    R(-19, -84, 38, 26, "#e8e4d4"); R(-19, -60, 38, 2, "#cfcab6");
    eye(-8, -74, 6.2, o); eye(8, -74, 6.2, o);
    LN(-15, -83, -3, -79.5, "#1a1a1a", 2.2); LN(15, -83, 3, -79.5, "#1a1a1a", 2.2);
    mouth(-12, -66, 24, 5, op);
  }
  function mDot(o) {
    const op = o.open || 0, t = o.t || 0;
    R(-12, -26, 5, 26, "#1d1d1d"); R(7, -26, 5, 26, "#1d1d1d"); R(-17, -5, 13, 5, "#0d0d0d"); R(4, -5, 13, 5, "#0d0d0d");
    LN(-24, -54, -36, -38, "#1d1d1d", 3.5); LN(-36, -38, -33, -26, "#1d1d1d", 3.5); R(-38, -27, 9, 7, "#111");
    LN(24, -54, 36, -38, "#1d1d1d", 3.5); LN(36, -38, 33, -26, "#1d1d1d", 3.5); R(29, -27, 9, 7, "#111");
    R(-24, -60, 48, 36, "#cdbf9f"); R(-24, -60, 48, 3, "#ddd2b6"); R(-24, -28, 48, 4, "#a79b7b");
    R(-17, -52, 21, 11, "#3b3b3b");
    GL(() => { O(-12, -46, 2.2, "#e04b4b"); O(-6, -46, 2.2, Math.floor(t * 2) % 2 ? "#5be37d" : "#1f5a2c"); O(0, -46, 2.2, "#f0c040"); });
    R(9, -52, 11, 3, "#8f8466"); R(9, -46, 11, 3, "#8f8466"); R(9, -40, 11, 3, "#8f8466");
    R(-14, -138, 28, 32, "#f4f3ee"); P([-14, -138, 14, -138, 10, -144, -10, -144], "#e0dfd8");
    for (let y = -134; y < -108; y += 6) { O(-10, y, 1.5, "#8d8d88"); O(10, y, 1.5, "#8d8d88"); }
    R(-6, -130, 12, 1.5, "#9a9a95"); R(-6, -125, 9, 1.5, "#9a9a95"); R(-6, -120, 12, 1.5, "#9a9a95");
    R(-28, -106, 56, 46, "#d9cdae"); R(-28, -110, 56, 6, "#b3a781"); R(-28, -64, 56, 4, "#bdb08f");
    R(-23, -98, 19, 15, "#151515"); R(4, -98, 19, 15, "#151515");
    GL(() => {
      O(-13.5, -90.5, 5.8, "#5be37d"); O(13.5, -90.5, 5.8, "#5be37d");
      O(-13.5 + (o.look || 0) * 1.6, -90.5, o.pin ? 1.1 : 2.4, "#052a10"); O(13.5 + (o.look || 0) * 1.6, -90.5, o.pin ? 1.1 : 2.4, "#052a10");
    });
    mouth(-18, -76, 36, 5, op);
    const tl = 12 + op * 16;
    R(-9, -72, 18, tl, "#f4f3ee");
    for (let y = -67; y < -72 + tl - 2; y += 4.5) R(-6, y, 12, 1.4, "#6b6b66");
    P([-9, -72 + tl, -6, -72 + tl + 3.5, -3, -72 + tl, 0, -72 + tl + 3.5, 3, -72 + tl, 6, -72 + tl + 3.5, 9, -72 + tl], "#f4f3ee");
  }
  function mBaud(o) {
    const op = o.open || 0, t = o.t || 0;
    R(-11, -26, 6, 26, "#1c1722"); R(5, -26, 6, 26, "#1c1722"); R(-16, -5, 12, 5, "#0c0a10"); R(4, -5, 12, 5, "#0c0a10");
    R(-31, -56, 7, 30, "#2d2733"); R(24, -56, 7, 30, "#2d2733"); R(-32, -28, 9, 7, "#9a9a9a"); R(23, -28, 9, 7, "#9a9a9a");
    R(-21, -58, 42, 34, "#2d2733"); R(-21, -58, 42, 4, "#4a3f59"); R(-21, -38, 42, 5, "#d8a31a");
    GL(() => { const cols = ["#5be37d", "#5be37d", "#e04b4b", "#f0b429", "#5be37d"]; for (let i = 0; i < 5; i++) R(-15 + i * 7.5, -50, 4.5, 4.5, (Math.floor(t * (2.5 + i * 0.7)) + i) % 3 ? cols[i] : "#1c2a20"); });
    R(-33, -108, 66, 50, "#2d2733"); R(-33, -108, 66, 5, "#4a3f59"); R(-33, -62, 66, 4, "#221d28");
    LN(-20, -108, -28, -136, "#14111a", 3.5); LN(20, -108, 28, -136, "#14111a", 3.5);
    GL(() => { O(-28, -138, 4.6, "#e04b4b"); O(28, -138, 4.6, "#e04b4b"); });
    R(-25, -100, 20, 15, "#0a090d"); R(5, -100, 20, 15, "#0a090d");
    GL(() => {
      R(-22, -97, 14, 9, "#ffb000"); R(8, -97, 14, 9, "#ffb000");
      const px = (o.look || 0) * 2, pw = o.pin ? 2 : 4.5;
      R(-17 + px - pw / 2 + 2, -95, pw, 5.5, "#2b1700"); R(13 + px - pw / 2 + 2, -95, pw, 5.5, "#2b1700");
    });
    if (op > 0.15) mouth(-24, -78, 48, 12, op, "#0a090d");
    else { R(-24, -78, 48, 13, "#0a090d"); for (let i = 0; i < 11; i++) R(-22 + i * 4.2, -76, 2.2, 9, "#40384d"); }
  }
  const ARROW = [0, 0, 0, 16, 4.1, 12.4, 6.8, 19, 9.6, 17.8, 6.9, 11.4, 11.6, 11.4];
  function mCursor(o) {
    const op = o.open || 0;
    R(-9, -26, 6, 26, "#0a0a0a"); R(4, -26, 6, 26, "#0a0a0a"); R(-15, -6, 14, 6, "#0a0a0a"); R(3, -6, 14, 6, "#0a0a0a");
    g.save(); g.translate(-23, -126); g.rotate(-0.12); g.scale(5.5, 5.5);
    if (!hide()) {
      g.lineJoin = "miter"; g.lineWidth = 1.1; g.strokeStyle = K("#050505"); g.fillStyle = K("#f1f1ec");
      g.beginPath(); g.moveTo(ARROW[0], ARROW[1]); for (let i = 2; i < ARROW.length; i += 2) g.lineTo(ARROW[i], ARROW[i + 1]); g.closePath(); g.fill(); g.stroke();
    }
    const sk = o.look || 0;
    GL(() => {
      O(2.55, 6.5, 1.75, "#050505"); O(5.9, 7.9, 1.75, "#050505"); O(2.55, 6.5, 1.35, "#f4f4ee"); O(5.9, 7.9, 1.35, "#f4f4ee");
      O(2.55 + sk * .3, 6.5, o.pin ? .3 : .7, "#050505"); O(5.9 + sk * .3, 7.9, o.pin ? .3 : .7, "#050505");
    });
    if (op > 0.15) {
      P([1.2, 9.7, 7.2, 11.2, 6.4, 11.2 + 1.6 * op, 1.2, 10.4 + 1.8 * op], "#0a0a0a");
      P([1.6, 9.8, 2.4, 9.9, 2.0, 10.9], "#f1f1ec"); P([3.6, 10.1, 4.4, 10.2, 4.0, 11.2], "#f1f1ec"); P([5.4, 10.4, 6.2, 10.5, 5.8, 11.5], "#f1f1ec");
    } else {
      g.fillStyle = K("#0a0a0a"); P([1.1, 9.7, 6.9, 11.0, 6.8, 11.4, 1.1, 10.2], "#0a0a0a");
    }
    g.restore();
  }
  const MDRAW = { floppy: mFloppy, dot: mDot, baud: mBaud, cursor: mCursor };
  function drawMascot(id, x, y, s, o) {
    g.save(); g.translate(x, y); g.scale(s, s);
    if (o && o.rot) g.rotate(o.rot);
    MDRAW[id](o || {});
    g.restore();
  }

  /* ---------------------------------------------------------------- scenes */
  let G = null, NOW = 0, FR = 0;               // game state, clock (s), frame counter
  let noiseCv = null, noiseCtx = null, noiseImg = null, scanPat = null;
  const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

  function refreshNoise() {
    if (!noiseCv) {
      noiseCv = document.createElement("canvas"); noiseCv.width = 320; noiseCv.height = 216;
      noiseCtx = noiseCv.getContext("2d"); noiseImg = noiseCtx.createImageData(320, 216);
    }
    const d = noiseImg.data;
    for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    noiseCtx.putImageData(noiseImg, 0, 0);
  }
  function drawStatic(a) {
    if (a <= 0) return;
    const o = g.globalAlpha, sm = g.imageSmoothingEnabled;
    g.imageSmoothingEnabled = false; g.globalAlpha = o * a;
    g.drawImage(noiseCv, 0, 0, W, H);
    g.globalAlpha = o; g.imageSmoothingEnabled = sm;
  }
  function drawScan(a) {
    if (!scanPat) {
      const c = document.createElement("canvas"); c.width = 4; c.height = 4;
      const x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, 4, 1);
      scanPat = g.createPattern(c, "repeat");
    }
    const o = g.globalAlpha; g.globalAlpha = o * a; g.fillStyle = scanPat; g.fillRect(0, 0, W, H); g.globalAlpha = o;
  }
  function vignette(a, step = 22, n = 6) {
    for (let i = 0; i < n; i++) {
      const al = a * (1 - i / n), d = i * step;
      ALPHA(al, () => { R(d, d, W - d * 2, step, "#000"); R(d, H - d - step, W - d * 2, step, "#000"); R(d, d + step, step, H - d * 2 - step * 2, "#000"); R(W - d - step, d + step, step, H - d * 2 - step * 2, "#000"); });
    }
  }

  /* ---- the office ---- */
  const OPEN = { L: { x: 12, y: 62, w: 158, h: 322 }, R: { x: 630, y: 62, w: 158, h: 322 } };
  const DOORSPOT = { L: "LDOOR", R: "RDOOR" };

  function paper(x, y, w, h, c, lines, title, tc) {
    R(x + 2, y + 2, w, h, "#2a1f15");
    R(x, y, w, h, c);
    if (title) TX(title, x + 4, y + 10, tc || "#33302a", 8);
    lines.forEach((l, i) => { if (typeof l === "string") TX(l, x + 4, y + 21 + i * 8, "#55524a", 6.5, "left", "normal"); else R(x + 4, y + (title ? 16 : 6) + i * 5, l, 1.5, "#8c887a"); });
    O(x + w / 2, y + 2, 2.2, "#c0392b");
  }

  function hallLit(s, lit) {
    const o = OPEN[s], spot = DOORSPOT[s], x1 = o.x + o.w, y1 = o.y + o.h;
    g.save(); g.beginPath(); g.rect(o.x, o.y, o.w, o.h); g.clip();
    R(o.x, o.y, o.w, o.h, "#020304");
    if (!lit) {
      const fw = o.w * 0.4, fh = o.h * 0.4, fx = o.x + (o.w - fw) / 2 + (s === "L" ? -14 : 14), fy = o.y + o.h * 0.22;
      P([o.x, y1, x1, y1, fx + fw, fy + fh, fx, fy + fh], "#05080b");
      P([o.x, o.y, fx, fy, fx, fy + fh, o.x, y1], "#04070a");
      P([x1, o.y, fx + fw, fy, fx + fw, fy + fh, x1, y1], "#04070a");
      R(fx, fy, fw, fh, "#010203");
    }
    if (lit) {
      const fl = hash(Math.floor(NOW * 20), s === "L" ? 3 : 7) > 0.94 ? 0.55 : 1;
      ALPHA(fl, () => {
        const fw = o.w * 0.4, fh = o.h * 0.4, fx = o.x + (o.w - fw) / 2 + (s === "L" ? -14 : 14), fy = o.y + o.h * 0.22;
        P([o.x, o.y, x1, o.y, fx + fw, fy, fx, fy], "#2d373f");
        P([o.x, y1, x1, y1, fx + fw, fy + fh, fx, fy + fh], "#262f36");
        P([o.x, o.y, fx, fy, fx, fy + fh, o.x, y1], "#3d4953");
        P([x1, o.y, fx + fw, fy, fx + fw, fy + fh, x1, y1], "#36414a");
        R(fx, fy, fw, fh, "#0e1317");
        for (let i = 1; i < 5; i++) {
          const f = i / 5, ex = o.x + (fx - o.x) * f, ex2 = x1 + (fx + fw - x1) * f, ey = o.y + (fy - o.y) * f, ey2 = y1 + (fy + fh - y1) * f;
          LN(ex, ey, ex, ey2, "#2d373f", 2); LN(ex2, ey, ex2, ey2, "#2d373f", 2);
          LN(ex, ey2, ex2, ey2, "#1d242a", 2);
        }
        P([o.x + 56, o.y, o.x + 102, o.y, fx + fw * 0.7, fy, fx + fw * 0.3, fy], "#d8e2e8");
        // faint light on the floor, flat bands
        ALPHA(0.12, () => P([o.x + 30, y1, x1 - 30, y1, fx + fw * 0.8, fy + fh, fx + fw * 0.2, fy + fh], "#dbe9f2"));
      });
      const here = G.mascots.filter(m => m.room === spot);
      here.forEach((m, i) => drawMascot(m.id, o.x + o.w / 2 + (here.length > 1 ? (i ? 34 : -34) : 0) + (s === "L" ? -6 : 6), y1 + 14, MASCOTS[m.id].ds * (here.length > 1 ? 0.88 : 1), { t: NOW, look: Math.sin(NOW * 1.3 + i) * 0.4 }));
    }
    g.restore();
  }
  function shutter(s, a) {
    const o = OPEN[s], h = Math.round(o.h * a);
    if (h <= 0) return;
    R(o.x, o.y, o.w, h, "#4a545f");
    for (let y = o.y + 6; y < o.y + h - 4; y += 14) { R(o.x, y, o.w, 2, "#39424b"); R(o.x, y + 2, o.w, 1, "#586470"); }
    R(o.x, o.y, 6, h, "#2a3138"); R(o.x + o.w - 6, o.y, 6, h, "#2a3138");
    R(o.x, o.y + h - 14, o.w, 14, "#2c343b");
    for (let x = o.x; x < o.x + o.w; x += 22) P([x, o.y + h - 14, x + 11, o.y + h - 14, x + 5, o.y + h, x - 6, o.y + h], "#d6a21c");
    R(o.x, o.y + h - 2, o.w, 2, "#1d2328");
  }

  function drawOffice() {
    const out = !!G.out, dark = out || G.flick > 0;
    R(0, 0, W, H, "#10151a");
    R(0, 40, W, 346, "#1a2128");
    for (let x = 0; x < W; x += 70) R(x, 40, 2, 346, "#161c22");
    R(0, 40, W, 3, "#252e36");
    R(0, 0, W, 40, "#0c1014"); R(0, 36, W, 4, "#1e262d");
    R(0, 384, W, 156, "#0b0f13");
    [402, 430, 468, 518].forEach(y => R(0, y, W, 2, "#10161b"));
    for (let i = -5; i <= 5; i++) LN(400 + i * 64, 386, 400 + i * 200, 540, "#10161b", 2);
    R(0, 374, W, 12, "#11161b");
    // ceiling lamp
    R(318, 40, 164, 7, "#6c7781"); R(328, 47, 144, 3, "#4a535b");
    if (!dark) ALPHA(0.055, () => P([336, 50, 464, 50, 570, 384, 230, 384], "#dbeaff"));
    // monitor glow on the wall
    if (!out) { ALPHA(0.05, () => R(250, 190, 300, 190, "#5affa0")); ALPHA(0.05, () => R(290, 230, 220, 150, "#5affa0")); }

    // wall decor
    R(278, 78, 244, 138, "#2e2218"); R(282, 82, 236, 130, "#6b5236");
    for (let i = 0; i < 40; i++) R(286 + hash(i, 1) * 226, 86 + hash(i, 2) * 122, 2, 2, "#5b4430");
    paper(292, 92, 74, 54, "#e4e0cc", ["1 DOORS COST POWER", "2 NO FOOD IN LAB", "3 SAY HI TO BAUD"], "NIGHT RULES");
    paper(376, 98, 56, 36, "#e8d96a", ["DON'T FEED", "THE MODEM"], null);
    paper(442, 90, 66, 58, "#d3dadd", [], "STAFF OF THE");
    TX("MONTH", 449, 111, "#33302a", 8);
    drawMascot("floppy", 475, 143, 0.26, { t: NOW });
    paper(300, 156, 84, 48, "#e4e0cc", [50, 36, 44, 28, 40], "BACKUPS");
    paper(398, 160, 62, 40, "#cfd9cf", ["FIRE EXIT", "NOT THIS WAY"], null);
    paper(470, 158, 40, 44, "#e7c9c9", [24, 30, 18], "EXT.");
    // side posters
    R(198, 76, 74, 68, "#0e1216"); R(201, 79, 68, 62, "#26333c");
    P([235, 84, 252, 112, 218, 112], "#d6a21c"); R(233, 92, 4, 11, "#0e1216"); R(233, 105, 4, 4, "#0e1216");
    TX("STAY OUT OF", 235, 126, "#c8d2d8", 8, "center"); TX("THE LAB", 235, 136, "#c8d2d8", 8, "center");
    R(528, 76, 74, 68, "#0e1216"); R(531, 79, 68, 62, "#312a22");
    TX("WELCOME", 565, 92, "#cbbf9b", 9, "center"); TX("NORTHGATE", 565, 103, "#cbbf9b", 8, "center"); TX("DATA SVCS", 565, 113, "#cbbf9b", 8, "center");
    R(540, 120, 50, 1.5, "#6d6450"); R(540, 127, 50, 1.5, "#6d6450"); R(540, 134, 36, 1.5, "#6d6450");

    // doorways
    ["L", "R"].forEach(s => {
      const o = OPEN[s], fx = o.x - 12;
      R(fx, o.y - 14, o.w + 24, o.h + 16, "#252d35");
      R(fx, o.y - 14, o.w + 24, 3, "#34404a");
      R(fx, o.y - 11, 3, o.h + 13, "#1a2026"); R(fx + o.w + 21, o.y - 11, 3, o.h + 13, "#1a2026");
      hallLit(s, !!G.lights[s] && !G.cam.up);
      shutter(s, G.doors[s].a);
      R(o.x, o.y, o.w, 4, "#161b20");
      R(s === "L" ? o.x + o.w : o.x - 6, o.y, 6, o.h, "#161b20");
    });
    // control plates
    [[194, 148], [530, 148]].forEach(p => { R(p[0], p[1], 76, 172, "#212932"); R(p[0], p[1], 76, 2, "#303b46"); O(p[0] + 6, p[1] + 6, 2, "#4a5560"); O(p[0] + 70, p[1] + 6, 2, "#4a5560"); O(p[0] + 6, p[1] + 166, 2, "#4a5560"); O(p[0] + 70, p[1] + 166, 2, "#4a5560"); });

    // desk
    R(204, 372, 392, 16, "#463626"); R(204, 372, 392, 3, "#5a4733");
    R(214, 388, 372, 152, "#2a2118");
    R(232, 404, 150, 54, "#30261c"); R(418, 404, 150, 54, "#30261c"); R(298, 428, 18, 4, "#6f6552"); R(484, 428, 18, 4, "#6f6552");
    R(232, 470, 336, 3, "#231b13");
    // CRT
    R(332, 258, 136, 112, "#8b8470"); R(332, 258, 136, 5, "#a39c86"); R(332, 365, 136, 5, "#6b6554");
    R(344, 270, 112, 84, "#151a17");
    R(348, 274, 104, 76, out ? "#050605" : "#071410");
    if (!out) {
      const hr = Math.min(5, Math.floor(G.t / HOUR));
      TX("SEC-VIEW 2.1", 354, 288, "#2fa55a", 8);
      for (let i = 0; i < 5; i++) R(354, 296 + i * 9, 40 + hash(i + hr, 5) * 46, 2, "#1d6e3b");
      if (Math.floor(NOW * 2) % 2) R(354, 344, 6, 7, "#2fa55a");
      TX(hourLabel(G.t), 446, 288, "#2fa55a", 8, "right");
    }
    R(378, 354, 44, 8, "#6b6554");
    R(342, 376, 118, 8, "#4a463b"); for (let i = 0; i < 12; i++) R(345 + i * 9.6, 378, 7, 2, "#6a6556"); for (let i = 0; i < 12; i++) R(345 + i * 9.6, 381, 7, 2, "#5e5a4c");
    // fan
    R(290, 352, 8, 22, "#2a2f35"); R(278, 371, 32, 4, "#1e2226");
    const fa = NOW * 22;
    g.save(); g.translate(294, 330);
    for (let i = 0; i < 3; i++) { g.save(); g.rotate(fa + i * 2.094); ALPHA(0.8, () => P([0, 0, -6, -20, 6, -20], "#56616b")); g.restore(); }
    if (!hide()) { g.strokeStyle = K("#46505a"); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 23, 0, 6.2832); g.stroke(); }
    LN(-23, 0, 23, 0, "#2f373e", 1); LN(0, -23, 0, 23, "#2f373e", 1); O(0, 0, 4, "#2a2f35");
    g.restore();
    // phone, mug, disks
    R(492, 358, 56, 14, "#24272b"); R(496, 351, 48, 8, "#1b1d20"); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) R(504 + i * 8, 361 + j * 5, 5, 3, "#3b3f45");
    const ring = G.call && G.call.ring > 0 && Math.floor(NOW * 6) % 2;
    R(534, 360, 8, 3, ring ? "#ff4d4d" : "#5a2020");
    R(560, 352, 14, 20, "#c4bfae"); R(574, 357, 5, 10, "#c4bfae"); R(576, 360, 2, 4, "#463626"); R(562, 354, 10, 4, "#3a2a1c");
    R(224, 366, 30, 6, "#2f5bd0"); R(226, 362, 30, 5, "#6b3fa0"); R(222, 358, 30, 5, "#2f5bd0"); R(232, 360, 12, 2, "#e8e4d4");

    // blackout: eyes in the dark doorway
    if (out && G.out.eyes) { GL(() => { R(62, 190, 14, 9, "#ffb000"); R(100, 190, 14, 9, "#ffb000"); R(66, 192, 4, 5, "#2b1700"); R(104, 192, 4, 5, "#2b1700"); }); }
    vignette(0.5);
    if (out) ALPHA(0.9, () => R(0, 0, W, H, "#000"));
    else if (G.flick > 0) ALPHA(0.5, () => R(0, 0, W, H, "#000"));
    else ALPHA(0.1, () => R(0, 0, W, H, "#000"));
    if (out && G.out.eyes) { GL(() => { R(62, 190, 14, 9, "#ffb000"); R(100, 190, 14, 9, "#ffb000"); R(66, 192, 4, 5, "#2b1700"); R(104, 192, 4, 5, "#2b1700"); }); }
  }
  function hourLabel(t) { const h = Math.min(6, Math.floor(t / HOUR)); return (h === 0 ? 12 : h) + " AM"; }

  /* ---- the cameras ---- */
  const SLOTS = {
    LAB:     [[262, 380, 1.5], [410, 388, 1.65], [552, 380, 1.5]],
    SERVERS: [[300, 440, 1.7], [420, 452, 1.85], [540, 440, 1.7]],
    WEST:    [[406, 338, 0.8], [402, 410, 1.25], [396, 510, 2.0]],
    EAST:    [[394, 338, 0.8], [398, 410, 1.25], [404, 510, 2.0]],
    BREAK:   [[300, 438, 1.55], [430, 446, 1.6], [560, 438, 1.55]],
  };
  function mascotsIn(room) {
    const used = {};
    G.mascots.filter(m => m.room === room && !(m.id === "cursor" && (room === "CLOSET" || m.state === "run"))).sort((a, b) => a.slot - b.slot).forEach(m => {
      const sl = SLOTS[room][m.slot % 3], k = m.slot % 3, n = used[k] = (used[k] || 0) + 1;
      drawMascot(m.id, sl[0] + (n - 1) * 54, sl[1], sl[2], { t: NOW, look: Math.sin(NOW * 0.9 + m.slot) * 0.5 });
    });
  }
  function labDesk(x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    R(0, 30, 124, 8, "#6a5844"); R(4, 38, 6, 38, "#453a2c"); R(114, 38, 6, 38, "#453a2c");
    R(34, -14, 56, 46, "#a39e8a"); R(34, -14, 56, 4, "#bab59f"); R(40, -8, 44, 34, "#0f2318"); R(44, -4, 20, 2, "#2c8a52"); R(44, 2, 30, 2, "#1f6b3c"); R(44, 8, 14, 2, "#2c8a52");
    R(54, 30, 16, 6, "#8b8670"); R(30, 28, 64, 4, "#7a7562");
    g.restore();
  }
  function sceneLab() {
    R(0, 0, W, H, "#2a3036");
    R(0, 0, W, 306, "#4a5259"); R(0, 0, W, 48, "#2f353b"); R(0, 300, W, 8, "#3a4147");
    [[70, 160], [330, 160], [590, 160]].forEach(l => { R(l[0], 18, l[1], 10, "#dfe5e8"); R(l[0], 28, l[1], 3, "#8a9298"); });
    R(310, 80, 180, 110, "#d6dbdd"); FRAME(310, 80, 180, 110, "#8a9298", 4);
    for (let i = 0; i < 6; i++) LN(326, 100 + i * 14, 326 + 40 + hash(i, 3) * 100, 102 + i * 14 - hash(i, 4) * 6, "#6c767c", 2);
    R(60, 90, 120, 90, "#3b444a"); R(70, 100, 100, 70, "#5d6a72"); R(620, 90, 120, 90, "#3b444a"); R(630, 100, 100, 70, "#5d6a72");
    R(0, 308, W, 232, "#30363b");
    for (let i = -9; i <= 9; i++) LN(400 + i * 36, 308, 400 + i * 150, 540, "#383f45", 2);
    [338, 380, 440, 520].forEach(y => R(0, y, W, 2, "#383f45"));
    [20, 190, 420, 596].forEach(x => { labDesk(x, 240, 1); R(x + 40, 322, 40, 24, "#2c3238"); R(x + 36, 316, 48, 8, "#363d44"); });
    mascotsIn("LAB");
    labDesk(-30, 372, 1.8); labDesk(626, 372, 1.8);
  }
  function rack(x, y, w, h, seed) {
    R(x, y, w, h, "#232a30"); R(x, y, w, 3, "#36404a"); R(x, y, 3, h, "#2c353d"); R(x + w - 3, y, 3, h, "#1a2025");
    const n = Math.floor((h - 12) / 16);
    for (let r = 0; r < n; r++) {
      const yy = y + 8 + r * 16;
      R(x + 6, yy, w - 12, 13, "#1a1f24"); R(x + 6, yy + 12, w - 12, 1, "#2f3a43");
      for (let i = 0; i < 3; i++) {
        const on = hash(seed * 31 + r, i) > 0.35, blink = hash(seed + r, i + 5) > 0.7 ? Math.floor(NOW * (1.5 + i)) % 2 : 1;
        R(x + 10 + i * 8, yy + 4, 4, 4, on && blink ? (hash(r, i + seed) > 0.8 ? "#f0b429" : "#5be37d") : "#2a3138");
      }
      for (let i = 0; i < 6; i++) R(x + w - 40 + i * 5, yy + 3, 2, 7, "#2c353d");
    }
  }
  function sceneServers() {
    R(0, 0, W, H, "#12161a");
    R(0, 0, W, 44, "#1d2328"); for (let i = 0; i < 6; i++) R(0, 14 + i * 4, W, 2, "#0b0e10"); R(0, 40, W, 4, "#2a3138");
    R(0, 44, W, 280, "#1a2025");
    for (let i = 0; i < 7; i++) rack(8 + i * 112, 74, 100, 250, i);
    R(0, 324, W, 216, "#262c31");
    for (let x = -4; x <= 18; x++) LN(400 + (x - 7) * 50, 324, 400 + (x - 7) * 150, 540, "#2f363c", 2);
    [352, 392, 446, 514].forEach(y => R(0, y, W, 2, "#2f363c"));
    for (let i = 0; i < 8; i++) R(120 + i * 70, 330 + (i % 2) * 2, 30, 3, "#32393f");
    mascotsIn("SERVERS");
    R(0, 0, 150, H, "#1c2227"); rack(6, 20, 138, 520, 11); R(650, 0, 150, H, "#1c2227"); rack(656, 20, 138, 520, 17);
  }
  function hall(room) {
    const flip = room === "EAST";
    const X = x => (flip ? W - x : x);
    const PX = (pts, c) => { const q = pts.slice(); for (let i = 0; i < q.length; i += 2) q[i] = X(q[i]); P(q, c); };
    const RX = (x, y, w, h, c) => R(flip ? W - x - w : x, y, w, h, c);
    const LX = (x1, y1, x2, y2, c, w) => LN(X(x1), y1, X(x2), y2, c, w);
    const fx0 = 330, fx1 = 470, fy0 = 150, fy1 = 320;
    const dd = f => ({ x0: fx0 * f, x1: W - (W - fx1) * f, y0: fy0 * f, y1: H - (H - fy1) * f });
    R(0, 0, W, H, "#000");
    PX([0, 0, W, 0, fx1, fy0, fx0, fy0], "#2a2f35");
    PX([0, H, W, H, fx1, fy1, fx0, fy1], "#3a4047");
    PX([0, 0, fx0, fy0, fx0, fy1, 0, H], "#454c53");
    PX([W, 0, fx1, fy0, fx1, fy1, W, H], "#3b4148");
    RX(fx0, fy0, fx1 - fx0, fy1 - fy0, "#12161a");
    [0.2, 0.38, 0.54, 0.68, 0.8, 0.9].forEach(f => {
      const d = dd(f);
      LX(d.x0, d.y1, d.x1, d.y1, "#31373d", 2);
      LX(d.x0, d.y0, d.x0, d.y1, "#3a4148", 2); LX(d.x1, d.y0, d.x1, d.y1, "#333940", 2);
    });
    for (let u = 1; u < 4; u++) LX(W * u / 4, H, fx0 + (fx1 - fx0) * u / 4, fy1, "#30363c", 2);
    // ceiling lamps
    [[0.12, 0.26], [0.42, 0.52], [0.66, 0.73], [0.84, 0.88]].forEach((p, i) => {
      const a = dd(p[0]), b = dd(p[1]), on = hash(Math.floor(NOW * 12), i + (flip ? 9 : 2)) > 0.04;
      const w1 = (a.x1 - a.x0) * 0.16, w2 = (b.x1 - b.x0) * 0.16, c1 = (a.x0 + a.x1) / 2, c2 = (b.x0 + b.x1) / 2;
      PX([c1 - w1, a.y0, c1 + w1, a.y0, c2 + w2, b.y0, c2 - w2, b.y0], on ? "#d3dade" : "#3a4046");
    });
    // far end
    if (!flip) { RX(344, 168, 112, 152, "#1f252a"); RX(348, 172, 50, 148, "#2f373d"); RX(402, 172, 50, 148, "#2f373d"); RX(372, 150, 56, 12, "#c8d0d4"); }
    else { RX(344, 168, 112, 152, "#1f252a"); RX(348, 172, 104, 148, "#2b3338"); RX(372, 150, 56, 12, "#c8d0d4"); for (let i = 0; i < 6; i++) RX(352 + i * 16, 176, 4, 140, "#232a2f"); }
    const wall = (f1, f2, hb, ht, left) => {
      const a = dd(f1), b = dd(f2), xa = left ? a.x0 : a.x1, xb = left ? b.x0 : b.x1;
      const ya = h => a.y1 - (a.y1 - a.y0) * h, yb = h => b.y1 - (b.y1 - b.y0) * h;
      return [xa, ya(ht), xb, yb(ht), xb, yb(hb), xa, ya(hb)];
    };
    if (!flip) {
      PX(wall(0.34, 0.52, 0, 0.7, true), "#5a646d"); PX(wall(0.355, 0.505, 0, 0.66, true), "#4a535b");
      PX(wall(0.4, 0.46, 0.34, 0.58, true), "#2b3238");
      PX(wall(0.37, 0.485, 0.74, 0.84, true), "#cbd3d8");
      PX(wall(0.3, 0.56, 0.3, 0.72, false), "#8a6f4a"); PX(wall(0.31, 0.55, 0.33, 0.69, false), "#a98a5e");
      PX(wall(0.34, 0.38, 0.5, 0.62, false), "#e4e0cc"); PX(wall(0.42, 0.47, 0.42, 0.56, false), "#e8d96a"); PX(wall(0.49, 0.53, 0.5, 0.64, false), "#cfd9cf");
    } else {
      PX(wall(0.34, 0.52, 0, 0.7, true), "#5a646d"); PX(wall(0.355, 0.505, 0, 0.66, true), "#4a535b");
      PX(wall(0.365, 0.425, 0.2, 0.58, true), "#202b33"); PX(wall(0.435, 0.495, 0.2, 0.58, true), "#202b33");
      PX(wall(0.37, 0.485, 0.74, 0.84, true), "#cbd3d8");
      PX(wall(0.32, 0.46, 0, 0.62, false), "#2e3a52"); PX(wall(0.33, 0.45, 0.2, 0.55, false), "#10161f");
      PX(wall(0.335, 0.445, 0.24, 0.3, false), "#7aa0d0"); PX(wall(0.335, 0.445, 0.36, 0.42, false), "#d0a060"); PX(wall(0.335, 0.445, 0.48, 0.54, false), "#c0584a");
      PX(wall(0.5, 0.53, 0.18, 0.46, false), "#c0392b"); PX(wall(0.5, 0.53, 0.46, 0.5, false), "#222");
      PX(wall(0.58, 0.7, 0, 0.001, false), "#000");
    }
    // the halls end at the office: a hazard line on the near floor
    mascotsIn(room);
    if (room === "WEST") {
      const c = G.mascots.find(m => m.id === "cursor");
      if (c && c.state === "run") {
        const p = clamp(c.runP, 0, 1), e = p * p;
        drawMascot("cursor", 238 + e * 165, 372 + e * 210, 1.0 + e * 2.3, { t: NOW, rot: -0.08, look: 0.5, open: e > 0.6 ? 0.5 : 0 });
      }
    }
  }
  function sceneCloset() {
    const c = G.mascots.find(m => m.id === "cursor");
    const stage = c && c.state === "closet" ? c.stage : -1;
    R(0, 0, W, H, "#151a1d");
    R(0, 0, W, 392, "#22282c"); for (let x = 0; x < W; x += 50) R(x, 0, 2, 392, "#1d2327");
    R(0, 392, W, 148, "#1a1f22"); [420, 460, 510].forEach(y => R(0, y, W, 2, "#20262a"));
    // shelves
    const shelf = (x, w) => {
      for (let i = 0; i < 4; i++) {
        const y = 90 + i * 76;
        R(x, y + 64, w, 6, "#4a545c");
        for (let j = 0; j < 3; j++) { const bw = 36 + hash(i * 3 + j, x) * 22, bx = x + 8 + j * (w / 3); R(bx, y + 64 - 40 - hash(j, i) * 10, bw, 40 + hash(j, i) * 10, ["#8b7355", "#7b6648", "#a08560"][(i + j) % 3]); R(bx, y + 64 - 40 - hash(j, i) * 10, bw, 3, "#a89068"); }
      }
      R(x, 80, 5, 300, "#3c454c"); R(x + w - 5, 80, 5, 300, "#3c454c");
    };
    shelf(24, 196); shelf(580, 196);
    LN(400, 0, 400, 36, "#0b0e10", 2); R(392, 36, 16, 8, "#2a2f33"); O(400, 52, 11, G.flick > 0 || hash(Math.floor(NOW * 10), 4) > 0.96 ? "#6a6650" : "#e8e0b0");
    // cabinet with the doors
    R(284, 64, 232, 334, "#323b42"); R(296, 76, 208, 322, "#05070a");
    R(330, 30, 140, 24, "#2b343a"); R(330, 30, 140, 3, "#47535b"); TX("STORAGE", 400, 48, "#dfe5e8", 14, "center");
    for (let x = 284; x < 516; x += 24) P([x, 392, x + 12, 392, x + 6, 398, x - 6, 398], "#d6a21c");
    if (stage >= 0 && c) {
      g.save(); g.beginPath(); g.rect(296, 76, 208, 322); g.clip();
      const lean = [0.0, 0.0, -0.05, -0.1][stage], sc = [1.5, 1.65, 1.85, 2.15][stage];
      drawMascot("cursor", 400 + [0, 0, 18, 0][stage], 410, sc, { t: NOW, rot: lean, pin: stage === 3, look: stage === 3 ? 0 : -0.6 });
      g.restore();
    }
    const open = c && c.state === "closet" ? [0, 0.14, 0.46, 0.95][stage] : 0.95;
    const dw = 104 * (1 - open);
    R(296, 76, dw, 322, "#46515a"); R(504 - dw, 76, dw, 322, "#46515a");
    if (dw > 4) { for (let i = 0; i < 6; i++) { R(300, 100 + i * 10, Math.max(0, dw - 8), 3, "#363f46"); R(504 - dw + 4, 100 + i * 10, Math.max(0, dw - 8), 3, "#363f46"); } R(296 + dw - 6, 230, 4, 40, "#9aa4ab"); R(504 - dw + 2, 230, 4, 40, "#9aa4ab"); }
    R(310, 400, 30, 30, "#8b7355"); R(520, 396, 70, 26, "#3b4850"); R(436, 404, 3, 80, "#888"); R(430, 484, 15, 12, "#4a5560");
  }
  function sceneBreak() {
    R(0, 0, W, H, "#25282a");
    R(0, 0, W, 306, "#4b4f46"); R(0, 0, W, 44, "#2e3129"); R(0, 300, W, 8, "#363a32");
    R(360, 18, 90, 10, "#dfe5e8");
    O(400, 108, 30, "#d9d9d1"); O(400, 108, 24, "#eeeee6"); LN(400, 108, 400, 90, "#222", 3); LN(400, 108, 412, 112, "#222", 3);
    R(60, 70, 110, 80, "#38403a"); R(66, 76, 98, 68, "#6b8f78"); P([66, 144, 100, 100, 130, 130, 164, 90, 164, 144], "#4d6e5b");
    R(0, 308, W, 232, "#34372e");
    for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) R(i * 70 - 20 + j * 8, 320 + j * 56, 70, 56, "#2e3128");
    R(20, 224, 220, 86, "#675a42"); R(20, 224, 220, 6, "#85775c"); R(50, 152, 56, 74, "#252525"); R(58, 160, 40, 28, "#101010"); GL(() => R(64, 194, 8, 6, "#e04b4b")); R(124, 188, 80, 38, "#8a8a82"); R(132, 194, 46, 26, "#2a2d2b");
    R(610, 100, 150, 270, "#2e3a52"); R(610, 100, 150, 6, "#3e4c68"); R(624, 120, 86, 190, "#0e141c");
    const cols = ["#7aa0d0", "#d0a060", "#c0584a", "#7ab07a"];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) R(632 + c * 20, 130 + r * 44, 14, 28, cols[(r + c) % 4]);
    R(722, 130, 26, 70, "#1b222e"); R(728, 140, 14, 8, "#5be37d"); R(724, 330, 34, 8, "#10151d");
    mascotsIn("BREAK");
    R(280, 360, 250, 12, "#7b6a4e"); R(290, 372, 8, 70, "#463d2d"); R(512, 372, 8, 70, "#463d2d");
    R(240, 330, 36, 70, "#2a3036"); R(536, 330, 36, 70, "#2a3036"); R(236, 380, 44, 8, "#363d44"); R(532, 380, 44, 8, "#363d44");
    R(380, 346, 24, 14, "#c4bfae"); R(410, 350, 14, 10, "#d8d0a8");
  }
  const SCENES = { LAB: sceneLab, SERVERS: sceneServers, WEST: () => hall("WEST"), EAST: () => hall("EAST"), CLOSET: sceneCloset, BREAK: sceneBreak };

  function drawCamFeed(sel) {
    const room = CAM_ROOM[sel], sway = Math.sin(NOW * 0.45 + sel) * 8;
    mono = true;
    g.save();
    g.translate(W / 2, H / 2); g.scale(1.04, 1.04); g.translate(-W / 2 + (room === "LAB" || room === "SERVERS" || room === "BREAK" ? sway : 0), -H / 2);
    SCENES[room]();
    g.restore();
    mono = false;
    ALPHA(0.1, () => R(0, 0, W, H, "#00ff80"));
    // a horizontal glitch band now and then
    if (hash(Math.floor(NOW * 6), sel) > 0.93 || G.cam.burst > 0.1) {
      const y = hash(Math.floor(NOW * 30), sel) * H, hh = 8 + hash(FR, sel) * 40;
      ALPHA(0.4, () => R(0, y, W, hh, "#aaffcc"));
    }
    drawScan(0.3);
    drawStatic(0.1 + clamp(G.cam.burst * 2.6, 0, 0.9));
    vignette(0.55, 20, 6);
    TX("CAM " + sel, 26, 498, "#c9ffdc", 20);
    TX(ROOM_TITLE[room], 26, 518, "#9ee0b8", 13);
    if (Math.floor(NOW * 1.6) % 2) { O(W - 98, 100, 6, "#ff3b30"); TX("REC", W - 86, 106, "#ffb0aa", 14); }
  }

  /* ---- jumpscare, title, static ---- */
  function drawJump(j) {
    const t = j.t, def = MASCOTS[j.id];
    R(0, 0, W, H, FR % 2 ? "#220606" : "#000");
    const grow = clamp(t / 0.28, 0, 1), s = (3.0 + 4.6 * grow * (2 - grow) + t * 0.8) * (def.jscale || 1), open = clamp(t / 0.16, 0, 1);
    const sh = t < 0.9 ? 30 : 10, dx = (Math.random() - 0.5) * sh, dy = (Math.random() - 0.5) * sh;
    drawMascot(j.id, W / 2 + dx + (j.id === "cursor" ? 18 * s * 0.2 : 0), H * 0.5 - def.headY * s + dy, s, { open, pin: true, t: NOW, look: 0 });
    drawStatic(t < 0.9 ? 0.08 + Math.random() * 0.1 : clamp(0.3 + (t - 0.9) * 4, 0, 1));
  }
  function drawTitleBg(t) {
    R(0, 0, W, H, "#050607");
    const ids = ["floppy", "dot", "baud", "cursor"], seg = 6.5, id = ids[Math.floor(t / seg) % 4], ph = t % seg;
    const vis = ph > 0.6 && ph < 5.8 && !(ph > 2.3 && ph < 2.42) && !(ph > 4.4 && ph < 4.52);
    if (vis) {
      const x = 590 + Math.sin(t * 0.5) * 8, y = 610, s = 4.6, o = { t, look: Math.sin(t * 0.7), };
      ALPHA(0.55, () => drawMascot(id, x, y, s, o));
      ALPHA(0.8, () => R(0, 0, W, H, "#040506"));
      skip = true; drawMascot(id, x, y, s, o); skip = false;
    }
    R(0, 440, W, 100, "#08090b");
    drawStatic(0.045);
    const by = (t * 60) % (H + 120) - 60; ALPHA(0.035, () => R(0, by, W, 50, "#bfe8d0"));
    drawScan(0.18);
    vignette(0.6, 26, 6);
  }

  /* ---------------------------------------------------------------- the game */
  const BACK = { floppy: "WEST", dot: "EAST", baud: "SERVERS" };
  const SIDE_OF = { LDOOR: "L", RDOOR: "R" };

  function makeMascot(id, ai) {
    const d = MASCOTS[id];
    return { id, ai, room: d.start, timer: d.every * rand(0.7, 1.3), wait: 0, slot: Math.floor(Math.random() * 3), seen: false, live: false, state: "closet", stage: 0, hold: 0, runT: 0, runLen: 2.4, runP: 0, bangs: 0 };
  }
  function freshState(night) {
    const cfg = NIGHTS[clamp(night, 1, 5) - 1];
    return {
      scr: "title", night, cfg, t: 0, hour: 0, introT: 0, power: 100,
      doors: { L: { on: false, a: 0 }, R: { on: false, a: 0 } }, lights: { L: false, R: false },
      cam: { up: false, a: 0, sel: 1, burst: 0 },
      mascots: Object.keys(MASCOTS).map(id => makeMascot(id, cfg.ai[id])),
      call: null, out: null, jump: null, flick: 0, nextFlick: rand(6, 14), caught: null,
    };
  }

  function createGame(body, win, W98) {
    const { store, Sound: S } = W98;
    const A = makeAudio(S);
    let dead = false, manual = false, shownPause = null, titleSel = 0, raf = 0, last = 0, held = null;

    body.classList.add("body--flush");
    body.style.position = "relative"; body.style.overflow = "hidden";
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    body.innerHTML = `
      <div class="fn"><div class="fn__stage">
        <canvas class="fn__cv" aria-label="Five Nights at the Server game view"></canvas>
        <div class="fn__ui">
          <div class="fn__hud" hidden>
            <div class="fn__pw"><span>Power left: <b data-pw>100</b>%</span><span class="fn__use" data-lvl="g">Usage: <span class="fn__bars"><i></i><i></i><i></i><i></i><i></i></span></span></div>
            <div class="fn__clk"><b data-clk>12 AM</b><span data-night>Night 1</span></div>
          </div>
          <div class="fn__call" hidden><button type="button" data-act="mute" tabindex="-1">Mute call</button><p data-sub aria-live="polite"></p></div>
          <div class="fn__pan fn__pan--l" hidden>
            <button type="button" class="fn__pb fn__pb--door" data-door="L" tabindex="-1"><i></i><b>DOOR</b><small>A</small></button>
            <button type="button" class="fn__pb fn__pb--light" data-hold="L" tabindex="-1"><i></i><b>LIGHT</b><small>Q</small></button>
          </div>
          <div class="fn__pan fn__pan--r" hidden>
            <button type="button" class="fn__pb fn__pb--door" data-door="R" tabindex="-1"><i></i><b>DOOR</b><small>D</small></button>
            <button type="button" class="fn__pb fn__pb--light" data-hold="R" tabindex="-1"><i></i><b>LIGHT</b><small>E</small></button>
          </div>
          <button type="button" class="fn__cb" data-cambtn tabindex="-1" hidden><b>OPEN CAMERA</b><small>SPACE</small></button>
          <div class="fn__map" hidden>
            ${[1, 2, 3, 4, 5, 6].map(n => `<button type="button" class="fn__mb fn__mb--${n}" data-cam="${n}" tabindex="-1"><b>CAM ${n}</b><small>${["", "LAB", "SERVERS", "WEST", "EAST", "CLOSET", "BREAK"][n]}</small></button>`).join("")}
            <div class="fn__you"><b>YOU</b></div>
          </div>
          <div class="fn__scr" hidden></div>
          <div class="fn__pause" hidden><b>PAUSED</b><span></span></div>
        </div>
      </div></div>`;
    const stage = $(".fn__stage", body), cv = $(".fn__cv", body), ui = $(".fn__ui", body), scr = $(".fn__scr", body);
    const hudEl = $(".fn__hud", body), callEl = $(".fn__call", body), subEl = $("[data-sub]", body), mapEl = $(".fn__map", body);
    const panL = $(".fn__pan--l", body), panR = $(".fn__pan--r", body), camBtn = $("[data-cambtn]", body), pauseEl = $(".fn__pause", body);
    const pwEl = $("[data-pw]", body), clkEl = $("[data-clk]", body), nightEl = $("[data-night]", body), useEl = $(".fn__use", body), bars = $$(".fn__bars i", body);
    const hudCache = { pw: -1, clk: "", use: -1, cam: -1 };
    g = cv.getContext("2d");
    refreshNoise();
    let kx = 1;
    const fit = () => {
      const bw = body.clientWidth, bh = body.clientHeight;
      if (!bw || !bh) return;
      // on a narrow portrait screen (phones) lay the stage on its side so it can be bigger
      const rot = bw / bh < 0.72 && window.matchMedia("(max-width: 700px)").matches;
      kx = rot ? Math.min(bh / W, bw / H) : Math.min(bw / W, bh / H);
      const q = kx * Math.min(window.devicePixelRatio || 1, 2), cw = Math.max(1, Math.round(W * q)), ch = Math.max(1, Math.round(H * q));
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
      g.setTransform(cw / W, 0, 0, ch / H, 0, 0);
      stage.style.cssText = `width:${W * kx}px;height:${H * kx}px;left:${(bw - W * kx) / 2}px;top:${(bh - H * kx) / 2}px;${rot ? "transform:rotate(90deg)" : ""}`;
      ui.style.transform = `scale(${kx})`;
      scanPat = null;
    };
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(body); else window.addEventListener("resize", fit);
    fit();

    G = freshState(1);
    const saved = () => clamp(store.get("fnafNight", 1), 1, 5);

    /* ---- screens ---- */
    const showScr = (k, html) => { scr.dataset.k = k; scr.innerHTML = html || ""; scr.hidden = !html; };
    const titleHtml = () => {
      const n = saved(), beat = store.get("fnafBeat", false);
      return `<div class="fn__title">
        <p class="fn__kick">Northgate Data Services presents</p>
        <h1><span>Five Nights</span><span>at the Server</span></h1>
        <p class="fn__tag">A night-shift survival game &middot; 1998</p>
        <ul class="fn__menu">
          <li><button type="button" data-act="new" class="fn__mi">New Game</button></li>
          <li><button type="button" data-act="cont" class="fn__mi">Continue<small>Night ${n}${beat ? " &middot; completed" : ""}</small></button></li>
          <li><button type="button" data-act="help" class="fn__mi">How to Play</button></li>
        </ul>
        <p class="fn__foot">&copy; 1998 Northgate Data Services. Any resemblance to your own workplace is unintentional.</p>
      </div>`;
    };
    function markSel() { $$(".fn__mi", scr).forEach((b, i) => b.classList.toggle("is-sel", i === titleSel)); }
    function showPlayUI() {
      const play = G.scr === "play", office = play && !G.cam.up && !G.out;
      hudEl.hidden = !play;
      panL.hidden = panR.hidden = !office;
      camBtn.hidden = !play || !!G.out;
      mapEl.hidden = !(play && G.cam.up && !G.out);
      callEl.hidden = !(play && G.call && G.call.state === "talk");
      $("b", camBtn).textContent = G.cam.up ? "CLOSE CAMERA" : "OPEN CAMERA";
      $$("[data-door]", body).forEach(b => b.classList.toggle("is-on", G.doors[b.dataset.door].on));
      $$("[data-hold]", body).forEach(b => b.classList.toggle("is-on", G.lights[b.dataset.hold]));
      $$("[data-cam]", body).forEach(b => b.classList.toggle("is-on", +b.dataset.cam === G.cam.sel));
    }
    function toTitle() {
      stopLoops(); manual = false;
      G = freshState(saved()); G.scr = "title";
      showScr("title", titleHtml()); titleSel = 0; markSel(); showPlayUI();
    }
    function stopLoops() { A.hum(false); A.buzz(false); A.cam(false); }

    /* ---- night flow ---- */
    function startNight(n) {
      if (dead) return;
      S.unlock();
      stopLoops(); manual = false;
      G = freshState(n); G.scr = "intro";
      showScr("intro", `<div class="fn__card fn__card--intro"><p class="fn__big">12:00 AM</p><p class="fn__mid">Night ${n}</p><p class="fn__hint">A / D doors &nbsp;&middot;&nbsp; Q / E hold for hall light &nbsp;&middot;&nbsp; SPACE camera &nbsp;&middot;&nbsp; P pause</p></div>`);
      showPlayUI();
      A.tone(98, 2.6, { type: "sine", vol: .12, attack: .6 }); A.tone(147, 2.4, { type: "sine", vol: .05, attack: .8 });
    }
    function beginPlay() {
      G.scr = "play"; showScr("play", "");
      nightEl.textContent = "Night " + G.night;
      const lines = CALLS[G.night - 1];
      G.call = lines ? { lines, i: 0, t: 0, shown: 0, state: "wait", ring: 0 } : null;
      subEl.textContent = "";
      A.hum(true);
      showPlayUI();
    }
    function winNight() {
      const n = G.night;
      stopLoops(); G.cam.up = false; G.lights.L = G.lights.R = false;
      A.chime();
      if (n < 5) store.set("fnafNight", Math.max(saved(), n + 1)); else store.set("fnafBeat", true);
      G.scr = "win"; G.winT = 0;
      showScr("win", `<div class="fn__card">
        <div class="fn__roll"><div><span>5 AM</span><span>6 AM</span></div></div>
        <p class="fn__mid fn__fade">${n < 5 ? `Night ${n} complete` : "You survived all five nights"}</p>
        <div class="fn__btns fn__fade"><button type="button" class="fn__btn" data-act="${n < 5 ? "next" : "pay"}">${n < 5 ? `Start Night ${n + 1}` : "Collect your pay"}</button></div></div>`);
      showPlayUI();
    }
    function paycheck() {
      G.scr = "end";
      showScr("end", `<div class="fn__card"><div class="fn__check">
        <p class="fn__chk-h"><b>NORTHGATE DATA SERVICES</b><span>No. 00231</span></p>
        <div class="fn__chk-row"><p>Pay to the order of <u>Night Guard (temp)</u></p><p class="fn__chk-amt">$120.00</p></div>
        <p class="fn__chk-l">One hundred twenty dollars and 00/100</p>
        <p class="fn__chk-m">Five nights, 30 hours @ $4.00. Hazard pay not included. We do not discuss hazards.</p>
        <p class="fn__chk-s"><i>M. Hollis</i><span>Facilities</span></p></div>
        <p class="fn__mid">Thanks for playing. See you Monday?</p>
        <div class="fn__btns"><button type="button" class="fn__btn" data-act="menu">Main Menu</button></div></div>`);
    }
    function caught(id) {
      if (G.scr !== "play") return;
      G.scr = "jump"; G.jump = { id, t: 0 }; G.caught = { id, when: hourLabel(G.t) };
      G.cam.up = false; G.lights.L = G.lights.R = false;
      stopLoops(); A.scream(); showScr("jump", ""); showPlayUI();
    }
    function gameOver() {
      G.scr = "over"; G.overT = 0;
      A.noise(1.6, { type: "highpass", f: 2200, vol: .12 });
      const n = G.night, who = MASCOTS[G.caught.id].name;
      showScr("over", `<div class="fn__card fn__card--over"><p class="fn__big fn__red">GAME OVER</p><p class="fn__mid">${who} got you at ${G.caught.when}</p>
        <div class="fn__btns"><button type="button" class="fn__btn" data-act="retry">Retry Night ${n}</button><button type="button" class="fn__btn" data-act="menu">Main Menu</button></div></div>`);
    }
    async function newGame() {
      const n = saved();
      if (n > 1 || store.get("fnafBeat", false)) {
        const r = await W98.msgBox({ title: "Five Nights at the Server", icon: "question", text: `Start a new game? Your saved progress (Night ${n}) will be erased.`, buttons: ["Yes", "No"], defaultIndex: 1 });
        if (r !== "Yes" || dead) return;
      }
      store.set("fnafNight", 1); store.set("fnafBeat", false);
      startNight(1);
    }
    const help = () => W98.msgBox({ title: "How to Play", icon: "info", text: HELP });

    /* ---- controls ---- */
    const usage = () => 1 + (G.doors.L.on ? 1 : 0) + (G.doors.R.on ? 1 : 0) + (G.lights.L || G.lights.R ? 1 : 0) + (G.cam.up ? 1 : 0);
    const isPaused = () => manual || (G.scr === "play" && (W98.WM.active !== "fnaf" || win.min));
    const canAct = () => G.scr === "play" && !G.out && !G.cam.up && !isPaused();
    function setDoor(s, v) {
      if (!canAct()) return;
      const d = G.doors[s], nv = v == null ? !d.on : v;
      if (d.on === nv) return;
      d.on = nv; A.door(nv); showPlayUI();
    }
    function setLight(s, v) {
      if (v && !canAct()) v = false;
      if (G.lights[s] === v) return;
      if (v) G.lights[s === "L" ? "R" : "L"] = false;
      G.lights[s] = v; A.light(v); A.buzz(G.lights.L || G.lights.R);
      if (v) G.mascots.forEach(m => { if (m.room === (s === "L" ? "LDOOR" : "RDOOR") && !m.seen) { m.seen = true; A.sting(); } });
      showPlayUI();
    }
    const releaseLights = () => { held = null; if (G.lights.L || G.lights.R) { G.lights.L = G.lights.R = false; A.buzz(false); showPlayUI(); } };
    function toggleCam(v) {
      if (G.scr !== "play" || G.out || isPaused()) return;
      const nv = v == null ? !G.cam.up : v;
      if (nv === G.cam.up) return;
      G.cam.up = nv;
      if (nv) { releaseLights(); G.cam.burst = 0.35; }
      A.camFlip(nv); A.cam(nv); showPlayUI();
    }
    function pickCam(n) {
      if (G.scr !== "play" || !G.cam.up || G.cam.sel === n || isPaused()) return;
      G.cam.sel = n; G.cam.burst = 0.3; A.blip(); showPlayUI();
    }
    const togglePause = () => { if (G.scr === "play") { manual = !manual; if (manual) releaseLights(); } };

    function act(a) {
      if (a === "new") newGame();
      else if (a === "cont") startNight(saved());
      else if (a === "help") help();
      else if (a === "next") startNight(G.night + 1);
      else if (a === "retry") startNight(G.night);
      else if (a === "pay") paycheck();
      else if (a === "menu") toTitle();
      else if (a === "mute" && G.call) { G.call.state = "done"; showPlayUI(); }
    }
    root_events();
    function root_events() {
      body.addEventListener("mousedown", e => { if (e.target.closest("button")) e.preventDefault(); });
      body.addEventListener("click", e => {
        const b = e.target.closest("[data-act]");
        if (b) { A.tone(1500, .03, { type: "square", vol: .02 }); act(b.dataset.act); return; }
        if (manual && e.target.closest(".fn__pause")) manual = false;
        if (G.scr === "intro" && G.introT > 1.2) beginPlay();
      });
      body.addEventListener("pointerover", e => {
        const b = e.target.closest(".fn__mi"); if (!b) return;
        titleSel = $$(".fn__mi", scr).indexOf(b); markSel();
      });
      body.addEventListener("pointerdown", e => {
        const hold = e.target.closest("[data-hold]");
        if (hold) { held = hold; try { hold.setPointerCapture(e.pointerId); } catch (x) {} setLight(hold.dataset.hold, true); return; }
        const door = e.target.closest("[data-door]"); if (door) { setDoor(door.dataset.door); return; }
        if (e.target.closest("[data-cambtn]")) { toggleCam(); return; }
        const cm = e.target.closest("[data-cam]"); if (cm) pickCam(+cm.dataset.cam);
      });
      const up = () => { if (held) { const s = held.dataset.hold; held = null; setLight(s, false); } };
      body.addEventListener("pointerup", up); body.addEventListener("pointercancel", up);
      body.addEventListener("lostpointercapture", up);
    }
    win.onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (G.scr === "title") {
        const n = $$(".fn__mi", scr).length;
        if (k === "ArrowDown") { e.preventDefault(); titleSel = (titleSel + 1) % n; markSel(); }
        else if (k === "ArrowUp") { e.preventDefault(); titleSel = (titleSel + n - 1) % n; markSel(); }
        else if (k === "Enter" || k === " ") { e.preventDefault(); const b = $$(".fn__mi", scr)[titleSel]; if (b) b.click(); }
        return;
      }
      if (G.scr === "intro") { if ((k === "Enter" || k === " ") && G.introT > 1.2) { e.preventDefault(); beginPlay(); } return; }
      if (G.scr === "win" || G.scr === "over" || G.scr === "end") {
        if (k === "Enter" && !e.repeat && (G.scr !== "win" || G.winT > 3.4)) { const b = $(".fn__btn", scr); if (b) { e.preventDefault(); b.click(); } }
        return;
      }
      if (G.scr !== "play") return;
      if (k === "p") { e.preventDefault(); if (!e.repeat) togglePause(); return; }
      if (manual) return;
      if (e.repeat) { if (" asdqeASDQE".includes(k)) e.preventDefault(); return; }
      if (k === "a" || k === "ArrowLeft") { e.preventDefault(); setDoor("L"); }
      else if (k === "d" || k === "ArrowRight") { e.preventDefault(); setDoor("R"); }
      else if (k === "q") { e.preventDefault(); setLight("L", true); }
      else if (k === "e") { e.preventDefault(); setLight("R", true); }
      else if (k === " " || k === "s" || k === "ArrowDown") { e.preventDefault(); toggleCam(); }
      else if (k === "Escape") { toggleCam(false); }
      else if (/^[1-6]$/.test(k)) { e.preventDefault(); pickCam(+k); }
    };
    const kup = e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === "q") setLight("L", false); else if (k === "e") setLight("R", false);
      if (k === " " && WMactive()) e.preventDefault();
    };
    const WMactive = () => W98.WM.active === "fnaf";
    const onBlur = () => releaseLights();
    document.addEventListener("keyup", kup); window.addEventListener("blur", onBlur);

    /* ---- the AI ---- */
    const doorClosed = s => G.doors[s].on && G.doors[s].a > 0.5;
    const watching = () => G.cam.up && G.cam.a > 0.6;
    const interval = m => MASCOTS[m.id].every * (1 - (G.night - 1) * 0.05) * rand(0.8, 1.2);
    function enter(m, room) {
      const was = m.room;
      m.room = room; m.slot = Math.floor(Math.random() * 3);
      const side = room === "LDOOR" || room === "WEST" ? -1 : 1;
      if (room === "LDOOR" || room === "RDOOR") {
        const d = MASCOTS[m.id];
        m.wait = rand(d.door[0], d.door[1]) * (1 - (G.night - 1) * 0.1); m.seen = false; m.live = false;
        A.clank(side * 0.8);
        if (G.lights[SIDE_OF[room]] && !G.cam.up) { m.seen = true; A.sting(); }
      } else if (room === "WEST" || room === "EAST") A.step(side * 0.55, 0.12);
      if (watching() && (CAM_ROOM[G.cam.sel] === was || CAM_ROOM[G.cam.sel] === room)) G.cam.burst = 0.4;
    }
    function attack(m) {
      const s = SIDE_OF[m.room];
      if (doorClosed(s)) {
        A.clank(s === "L" ? -0.8 : 0.8); A.tone(120, .15, { vol: .2, slide: 70, pan: s === "L" ? -0.8 : 0.8 });
        const to = BACK[m.id]; m.room = to; m.slot = Math.floor(Math.random() * 3); m.timer = interval(m) * 1.3;
      } else caught(m.id);
    }
    function cursorStep(m, dt) {
      if (m.state === "closet") {
        const watched = watching() && G.cam.sel === 5;
        if (watched) { if (m.stage === 3) m.hold = Math.max(m.hold, 2.2); return; }
        if (m.stage < 3) {
          m.timer -= dt;
          if (m.timer <= 0) {
            m.timer = interval(m);
            if (Math.random() * 20 < m.ai) { m.stage++; if (m.stage === 3) m.hold = rand(4, 9); if (watching() && G.cam.sel === 5) G.cam.burst = .3; }
          }
        } else {
          m.hold -= dt;
          if (m.hold <= 0) { m.state = "run"; m.runT = 0; m.runLen = Math.max(1.55, 2.7 - G.night * 0.2); m.room = "WEST"; m.runP = 0; A.run(); }
        }
      } else if (m.state === "run") {
        m.runT += dt; m.runP = m.runT / m.runLen;
        if (m.runP >= 1) {
          m.room = "LDOOR";
          if (doorClosed("L")) {
            m.bangs++; G.power = Math.max(0, G.power - (2 + (m.bangs - 1) * 3)); A.bang(m.bangs);
            m.state = "closet"; m.room = "CLOSET"; m.stage = pick([0, 0, 1]); m.timer = interval(m) * 1.4;
          } else caught("cursor");
        }
      }
    }
    function aiStep(dt) {
      G.mascots.forEach(m => {
        if (G.scr !== "play") return;
        if (m.id === "cursor") { cursorStep(m, dt); return; }
        const atDoor = m.room === "LDOOR" || m.room === "RDOOR";
        if (m.id === "baud") {
          const w = watching();
          if (!w) { m.live = false; return; }       // Baud only stirs while the monitor is glowing
          if (atDoor && !m.live) { m.live = true; m.wait = Math.max(m.wait, 1.7); }
        }
        if (atDoor) { m.wait -= dt; if (m.wait <= 0) attack(m); return; }
        m.timer -= dt;
        if (m.timer > 0) return;
        m.timer = interval(m);
        if (Math.random() * 20 >= m.ai) return;
        const opts = ROUTES[m.id][m.room];
        if (!opts) return;
        enter(m, pick(opts));
        if (m.id === "dot" && Math.random() < 0.25) m.timer = 0.8;
      });
    }
    function goDark() {
      G.out = { t: 0, eyes: false, jingle: false };
      G.doors.L.on = G.doors.R.on = false; G.lights.L = G.lights.R = false; G.cam.up = false;
      stopLoops(); A.powerDown(); showPlayUI();
    }
    function darkStep(dt) {
      const o = G.out; o.t += dt;
      if (o.t > 3.5 && !o.jingle) { o.jingle = true; A.jingle(); }
      if (o.t > 3.5) o.eyes = o.t < 8.5 ? Math.random() > 0.3 : Math.random() > 0.55;
      if (o.t > 10.8) caught("baud");
    }

    /* ---- the phone call ---- */
    function callStep(dt) {
      const c = G.call;
      if (!c || c.state === "done") return;
      c.t += dt;
      if (c.state === "wait") { if (G.t > 2.2) { c.state = "ring"; c.ring = 1.7; c.t = 0; A.ring(); } return; }
      if (c.state === "ring") { c.ring -= dt; if (c.ring <= 0) { c.state = "talk"; c.t = 0; c.shown = 0; showPlayUI(); } return; }
      if (G.out) { c.state = "done"; showPlayUI(); return; }
      const line = c.lines[c.i], n = Math.min(line.length, Math.floor(c.t * 40));
      if (n !== c.shown) { if (Math.floor(n / 3) !== Math.floor(c.shown / 3)) A.voice(); c.shown = n; subEl.textContent = line.slice(0, n); }
      if (n >= line.length && c.t > line.length / 40 + 1.5 + line.length * 0.014) {
        c.i++; c.t = 0; c.shown = 0;
        if (c.i >= c.lines.length) { c.state = "done"; showPlayUI(); } else subEl.textContent = "";
      }
    }

    /* ---- per frame ---- */
    function playStep(dt) {
      G.t += dt;
      ["L", "R"].forEach(s => { const d = G.doors[s]; d.a = clamp(d.a + (d.on ? dt : -dt) / 0.2, 0, 1); });
      G.cam.a = clamp(G.cam.a + (G.cam.up ? dt : -dt) / 0.22, 0, 1);
      G.cam.burst = Math.max(0, G.cam.burst - dt);
      G.flick = Math.max(0, G.flick - dt); G.nextFlick -= dt;
      if (G.nextFlick <= 0) { G.flick = rand(0.05, 0.18); G.nextFlick = rand(5, 16); }
      const hr = Math.floor(G.t / HOUR);
      if (hr !== G.hour) { G.hour = hr; if (hr < 6) A.tick(); }
      if (G.t >= NIGHT_LEN) { winNight(); return; }
      if (!G.out) {
        G.power -= usage() * G.cfg.drain * dt;
        if (G.power <= 0) { G.power = 0; goDark(); } else aiStep(dt);
      } else darkStep(dt);
      callStep(dt);
    }
    function update(dt) {
      if (G.scr === "intro") { G.introT += dt; if (G.introT > 3.6) beginPlay(); }
      else if (G.scr === "jump") { G.jump.t += dt; if (G.jump.t > 1.3) gameOver(); }
      else if (G.scr === "play") playStep(dt);
      else if (G.scr === "win") { G.winT += dt; if (!G.dinged && G.winT > 1.3) { G.dinged = true; A.ding(); } }
      else if (G.scr === "over") G.overT += dt;
    }
    function syncHud() {
      if (G.scr !== "play") return;
      const pw = Math.ceil(G.power), clk = hourLabel(G.t), u = usage();
      if (pw !== hudCache.pw) { hudCache.pw = pw; pwEl.textContent = pw; }
      if (clk !== hudCache.clk) { hudCache.clk = clk; clkEl.textContent = clk; }
      if (u !== hudCache.use) { hudCache.use = u; bars.forEach((b, i) => b.classList.toggle("on", i < u)); useEl.dataset.lvl = u <= 2 ? "g" : u === 3 ? "y" : "r"; }
    }
    function render() {
      g.save();
      g.imageSmoothingEnabled = true;
      if (G.scr === "title") drawTitleBg(NOW);
      else if (G.scr === "play") {
        drawOffice();
        if (G.cam.a > 0) {
          const e = G.cam.a * G.cam.a * (3 - 2 * G.cam.a), y = (1 - e) * H;
          g.save(); g.translate(0, y); g.beginPath(); g.rect(0, 0, W, H); g.clip();
          drawCamFeed(G.cam.sel);
          g.restore();
          if (e < 1) { R(0, y - 8, W, 8, "#0a0d0f"); R(0, y - 9, W, 1, "#2a323a"); }
        }
      } else if (G.scr === "jump") drawJump(G.jump);
      else if (G.scr === "over") { R(0, 0, W, H, "#000"); drawStatic(clamp(0.9 - G.overT * 0.6, 0.4, 0.9)); ALPHA(0.55, () => R(0, 0, W, H, "#000")); drawScan(.25); }
      else R(0, 0, W, H, "#000");
      g.restore();
      syncHud();
    }
    function frame(ts) {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      if (win.min) { last = ts; return; }
      const dt = clamp((ts - last) / 1000, 0, 0.1); last = ts;
      const p = isPaused();
      if (p !== shownPause) {
        shownPause = p;
        pauseEl.hidden = !(p && G.scr === "play");
        $("span", pauseEl).textContent = manual ? "Press P or click to resume" : "Click the window to resume";
        if (p) releaseLights();
      }
      A.sync(!p);
      if (!p) { NOW += dt; update(dt); }
      FR++;
      if (FR % 2 === 0) refreshNoise();
      render();
    }

    toTitle();
    raf = requestAnimationFrame(t => { last = t; frame(t); });

    return {
      newGame, help, toTitle, startNight,
      cont: () => startNight(saved()),
      pause: togglePause,
      saved,
      destroy() {
        dead = true; cancelAnimationFrame(raf);
        if (ro) ro.disconnect(); else window.removeEventListener("resize", fit);
        document.removeEventListener("keyup", kup); window.removeEventListener("blur", onBlur);
        A.dispose();
      },
      // test hooks
      get G() { return G; },
      step(dt) { NOW += dt; FR++; update(dt); },
      act: { setDoor, setLight, toggleCam, pickCam },
      audio: A,
    };
  }

  /* ---------------------------------------------------------------- registration */
  (window.W98_APPS = window.W98_APPS || []).push({
    key: "fnaf", label: "Five Nights at the Server", group: "games",
    aliases: ["fnaf", "nightshift", "night", "horror", "five nights at the server"],
    open(opts, W98) {
      const WM = W98.WM, S = W98.Sound, store = W98.store;
      WM.open("fnaf", {
        title: "Five Nights at the Server", icon: "fnaf", w: 806, h: 584, from: opts.from, resizable: true,
        render(body, win) { win.fnaf = createGame(body, win, W98); },
        menu: win => [
          { label: "Game", items: [
            { label: "New Game", action: () => win.fnaf.newGame() },
            { label: "Continue", get disabled() { return false; }, action: () => win.fnaf.cont() },
            { label: "Pause", hint: "P", action: () => win.fnaf.pause() },
            { sep: true },
            { label: "Main Menu", action: () => win.fnaf.toTitle() },
            { sep: true },
            { label: "Exit", action: () => win.close() },
          ] },
          { label: "Night", items: [1, 2, 3, 4, 5].map(n => ({ label: "Night " + n, get disabled() { return n > win.fnaf.saved(); }, action: () => win.fnaf.startNight(n) })) },
          { label: "Sound", items: [
            { label: "Mute Sound", get checked() { return S.muted; }, action: () => { S.muted = !S.muted; store.set("muted", S.muted); } },
          ] },
          { label: "Help", items: [
            { label: "How to Play", action: () => win.fnaf.help() },
          ] },
        ],
        onClose: win => { if (win.fnaf) win.fnaf.destroy(); },
      });
    },
  });
})();
