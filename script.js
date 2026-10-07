/* ==========================================================================
   Windows 98 portfolio — desktop, window manager and programs.
   You shouldn't need to edit this file. Put your info in content.js.
   ========================================================================== */
(() => {
"use strict";

/* ---------------------------------------------------------------- content */
// content.js declares `const CONTENT`, which is global but not a window property
const C = (typeof CONTENT !== "undefined" && CONTENT) || window.CONTENT || {};
const OS = "Windows 98";
const NAME = String(C.name || "Your Name").trim();
const FIRST = NAME.split(/\s+/)[0];
const SLUG = NAME.toLowerCase().replace(/[^a-z0-9]+/g, "") || "home";
const ROLE = C.role || "";
// skills can be plain strings ("HTML") or { name: "HTML", level: 4 } with a 1-5 level
const SKILL_LIST = (Array.isArray(C.skills) ? C.skills : [])
  .map(x => typeof x === "string" ? { name: x, level: 0 } : { name: String((x && x.name) || ""), level: Math.max(0, Math.min(5, +(x && x.level) || 0)) })
  .filter(x => x.name);
const SKILLS = SKILL_LIST.map(x => x.name);
const EXPERIENCE = Array.isArray(C.experience) ? C.experience.filter(x => x && x.title) : [];
const EDUCATION = Array.isArray(C.education) ? C.education.filter(x => x && x.title) : [];
const LOCATION = C.location || "";
const STATUS = C.status || "";
const PROJECTS = Array.isArray(C.projects) ? C.projects : [];
const CONTACTS = Array.isArray(C.contact) ? C.contact : [];
const SOCIAL = C.social || {};
const RESUME = C.resume || "";
const EMAIL_ENTRY = CONTACTS.find(x => /^mailto:/i.test(x.href || ""));
const EMAIL = EMAIL_ENTRY ? EMAIL_ENTRY.href.replace(/^mailto:/i, "").split("?")[0] : "";
const GITHUB_URL = SOCIAL.github || (CONTACTS.find(x => /github\.com/i.test(x.href || "")) || {}).href || "";
// Verified video IDs (each confirmed against a real YouTube page or reference; none are guessed)
const DEFAULT_VIDEOS = [
  { id: "dhxHOvixOpU", title: "FRIDAY NIGHT FUNKIN' IS THE BEST MUSIC GAME. (Part 1)", channel: "CoryxKenshin", cat: "Gaming" },
  { id: "06NiFBgT3bA", title: "Friday Night Funkin' KEEPS GETTING BETTER AND BETTER (Part 2)", channel: "CoryxKenshin", cat: "Gaming" },
  { id: "02PxiJNRN2I", title: "Friday Night Funkin' B-SIDE REMIXES ARE FREAKING INSANE (Part 3)", channel: "CoryxKenshin", cat: "Gaming" },
  { id: "iOztnsBPrAA", title: "WARNING: SCARIEST GAME IN YEARS | Five Nights at Freddy's - Part 1", channel: "Markiplier", cat: "Gaming" },
  { id: "GlZtlTon7_I", title: "Five Nights at Freddy's: Sister Location - Part 1", channel: "Markiplier", cat: "Gaming" },
  { id: "TA5OMtKTbzc", title: "Five Nights at Freddy's: Ultimate Custom Night - Part 1", channel: "Markiplier", cat: "Gaming" },
  { id: "GsxdZ-3n0GQ", title: "Ectodermal Dysplasia (We need to talk.)", channel: "CoryxKenshin", cat: "Vlogs" },
  { id: "t44TtAswYug", title: "Chasing My Dream. (The 'Big' Announcement)", channel: "CoryxKenshin", cat: "Vlogs" },
  { id: "4wZ5Sd2LbfA", title: "2020 is the worst year of my life", channel: "CoryxKenshin", cat: "Vlogs" },
  { id: "bqNzbkIHYF8", title: "Five Nights At Freddy's 2 Animation | Jacksepticeye Animated", channel: "jacksepticeye", cat: "Animation" },
  { id: "Uil9bh8kJgg", title: "Five Nights At Freddy's 3 & 4 Animation | Jacksepticeye Animated", channel: "jacksepticeye", cat: "Animation" },
  { id: "Y3qM6j3AceU", title: "Five Nights at Freddy's Animated short", channel: "iHasCupquake", cat: "Animation" },
  { id: "_zfN9wnPvU0", title: "AI Slop Is Killing Our Channel", channel: "Kurzgesagt – In a Nutshell", cat: "Education" },
  { id: "jNQXAC9IVRw", title: "Me at the zoo", channel: "jawed", cat: "Classics" },
  { id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up (Official Music Video)", channel: "Rick Astley", cat: "Music" },
  { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE M/V", channel: "officialpsy", cat: "Music" },
];
const BASE_VIDEOS = (Array.isArray(C.videos) && C.videos.length ? C.videos : DEFAULT_VIDEOS)
  .map(v => ({ id: v.id, title: v.title || "Untitled", channel: v.channel || "CoryxKenshin", cat: v.cat || "Videos" }));
const ABOUT_PARAS = String(C.about || "").split(/\n\s*\n/).map(p => p.replace(/\s+/g, " ").trim()).filter(Boolean);

/* ---------------------------------------------------------------- helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => window.matchMedia("(max-width: 700px)").matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem("w98:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("w98:" + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem("w98:" + k); } catch (e) {} },
};
const session = {
  get(k) { try { return sessionStorage.getItem("w98:" + k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem("w98:" + k, v); } catch (e) {} },
};
const initials = s => String(s || "?").trim().split(/\s+/).slice(0, 2).map(w => (w[0] || "").toUpperCase()).join("") || "?";
const fmtDate = (d = new Date()) => d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
const fmtTime = (d = new Date()) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function placeholder(label, w = 320, h = 240) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#c0c0c0"/><rect x="3" y="3" width="${w - 6}" height="${h - 6}" fill="none" stroke="#808080" stroke-dasharray="4 3"/><text x="50%" y="50%" font-family="Tahoma,Arial,sans-serif" font-size="${Math.round(h / 4)}" font-weight="bold" fill="#808080" text-anchor="middle" dominant-baseline="central">${esc(label)}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function downloadText(filename, text) { downloadBlob(filename, new Blob([text], { type: "text/plain" })); }
function downloadBlob(filename, blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function insertAtCursor(ta, s) { ta.setRangeText(s, ta.selectionStart, ta.selectionEnd, "end"); ta.focus(); }

document.addEventListener("error", e => {
  const t = e.target;
  if (!(t instanceof HTMLImageElement)) return;
  if (t.dataset.fallback && !t.dataset.failed) { t.dataset.failed = "1"; t.src = placeholder(t.dataset.fallback); }
  else if (t.classList.contains("px")) t.classList.add("is-broken");
}, true);

/* ---------------------------------------------------------------- pixel art */
const PAL = { k: "#000", w: "#fff", g: "#c0c0c0", d: "#808080", y: "#ff0", Y: "#808000", n: "#000080", b: "#00f", t: "#008080", c: "#0ff", r: "#f00", R: "#800000", G: "#008000", l: "#0f0" };
function pixelSvg(rows, size, fill) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  let out = "";
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch !== ".") out += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill || PAL[ch] || "#000"}"/>`; } });
  const W = size || w, H = size ? Math.round(size * h / w) : h;
  return `<svg class="pix" width="${W}" height="${H}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
}
const glyph = rows => pixelSvg(rows, 0, "currentColor");
const G = {
  min: glyph(["xxxxxx", "xxxxxx"]),
  max: glyph(["xxxxxxxxx", "xxxxxxxxx", "x.......x", "x.......x", "x.......x", "x.......x", "x.......x", "x.......x", "xxxxxxxxx"]),
  restore: glyph(["..xxxxxx", "..xxxxxx", "..x....x", "xxxxxx.x", "xxxxxx.x", "x....xxx", "x....x..", "x....x..", "xxxxxx.."]),
  close: glyph(["xx....xx", ".xx..xx.", "..xxxx..", "...xx...", "..xxxx..", ".xx..xx.", "xx....xx"]),
  arrowR: glyph(["x...", "xx..", "xxx.", "xxxx", "xxx.", "xx..", "x..."]),
  check: glyph(["......x", ".....xx", "x...xxx", "xx.xxx.", "xxxxx..", ".xxx...", "..x...."]),
  back: glyph(["....x....", "...xx....", "..xxxxxxx", ".xxxxxxxx", "..xxxxxxx", "...xx....", "....x...."]),
  fwd: glyph(["....x....", "....xx...", "xxxxxxx..", "xxxxxxxx.", "xxxxxxx..", "....xx...", "....x...."]),
  reload: glyph(["..xxxx..", ".x....xx", "x....xxx", "x.......", "x.......", "x......x", ".x....x.", "..xxxx.."]),
  home: glyph(["....x....", "...xxx...", "..xxxxx..", ".xxxxxxx.", "xxxxxxxxx", ".xx...xx.", ".xx...xx.", ".xx...xx."]),
  speaker: glyph(["....x....", "...xx..x.", "xxxxx...x", "xxxxx.x.x", "xxxxx.x.x", "xxxxx...x", "...xx..x.", "....x...."]),
  muted: glyph(["....x....", "...xx....", "xxxxx.x.x", "xxxxx..x.", "xxxxx..x.", "xxxxx.x.x", "...xx....", "....x...."]),
  pencil: glyph(["........xx", ".......x.x", "......x.x.", ".....x.x..", "....x.x...", "...x.x....", "..x.x.....", ".xxx......", ".xx.......", "x........."]),
  brush: glyph(["........x.", ".......xx.", "......xx..", ".....xx...", "....xx....", "..xxx.....", ".xxxx.....", ".xxx......", "xx........", "x........."]),
  eraser: glyph(["....xxxxxx", "...x....xx", "..x....x.x", ".x....x..x", "xxxxxx..x.", "x....x.x..", "x....xx...", "xxxxxx...."]),
  fill: glyph(["...xx.....", "..x..x....", ".x....x...", "x......x..", ".x....xxx.", "..x..x.xx.", "...xx..xx.", ".......x.."]),
  spray: glyph(["x.x.......", ".x.x......", "x.x.xxx...", "...x...x..", "...xxxxx..", "...x...x..", "...x...x..", "...xxxxx.."]),
  line: glyph(["x.........", ".x........", "..x.......", "...x......", "....x.....", ".....x....", "......x...", ".......x.."]),
  rect: glyph(["xxxxxxxxxx", "x........x", "x........x", "x........x", "x........x", "xxxxxxxxxx"]),
  ellipse: glyph(["...xxxx...", ".xx....xx.", "x........x", "x........x", ".xx....xx.", "...xxxx..."]),
  picker: glyph(["......xx", ".....xxx", "....xxxx", "...x.xx.", "..x.x...", ".x.x....", "x.x.....", "xx......"]),
};
const PIX = {
  monitor: ["................", ".kkkkkkkkkkkkkk.", ".kgkkkkkkkkkgdk.", ".kgkcctttttkgdk.", ".kgkcttttttkgdk.", ".kgktttttttkgdk.", ".kgktttttttkgdk.", ".kgktttttttkgdk.", ".kgkkkkkkkkkgdk.", ".kgggggggggggdk.", ".kkkkkkkkkkkkkk.", "......kkkk......", "....kggggggk....", "....kkkkkkkk....", "................", "................"],
  power: ["................", ".......kk.......", "...RR..kk..RR...", "..RR...kk...RR..", ".RR....kk....RR.", ".R.....kk.....R.", "RR.....kk.....RR", "RR............RR", "RR............RR", "RR............RR", ".RR..........RR.", ".RR..........RR.", "..RR........RR..", "...RRR....RRR...", ".....RRRRRR.....", "................"],
  bulb: ["......kkkk......", "....kkyyyykk....", "...kyyywyyyyk...", "..kyyywyyyyyyk..", "..kyywyyyyyyyk..", "..kyyyyyyyyyyk..", "..kyyyyyyyyyyk..", "...kyyyyyyyyk...", "....kyyyyyyk....", ".....kyyyyk.....", ".....kddddk.....", ".....kggggk.....", ".....kddddk.....", "......kkkk......", "................", "................"],
  clock: ["................", "....kkkkkkk.....", "..kkwwwkwwwkk...", ".kwwwwwwwwwwwk..", ".kwwwwwkwwwwwk..", "kwwwwwwkwwwwwwk.", "kwkwwwwkwwwwkwk.", "kwwwwwwkkkkwwwk.", "kwwwwwwwwwwwwwk.", "kwkwwwwwwwwwkwk.", ".kwwwwwwwwwwwk..", ".kwwwwwkwwwwwk..", "..kkwwwwwwwkk...", "....kkkkkkk.....", "................", "................"],
  showdesk: ["................", "................", "..........kk....", ".........kyk....", "........kyk.....", ".......kyk......", "......kkk.......", ".kkkkkkkkkkkkkk.", "kgggggggggggggdk", "kwwwwwwwwwwwwwdk", "kdddddddddddddkk", ".kd.........dk..", ".kd.........dk..", ".kk.........kk..", "................", "................"],
  flag: ["....rr....", "..rrrr....", ".rrrrr....", "..rrrr....", "....rr....", ".....k....", ".....k....", "...kkkk...", ".kkkkkkk.."],
  mine: ["....k....", ".k.kkk.k.", "..kkkkk..", ".kkwkkkk.", "kkkwkkkkk", ".kkkkkkk.", "..kkkkk..", ".k.kkk.k.", "....k...."],
  smile: [".....kkkkk.....", "...kkyyyyykk...", "..kyyyyyyyyyk..", ".kyyyyyyyyyyyk.", ".kyyykyyykyyyk.", "kyyyykyyykyyyyk", "kyyyyyyyyyyyyyk", "kyyyyyyyyyyyyyk", "kyyykyyyyykyyyk", ".kyyykkkkkyyyk.", ".kyyyyyyyyyyyk.", "..kyyyyyyyyyk..", "...kkyyyyykk...", ".....kkkkk....."],
  oh: [".....kkkkk.....", "...kkyyyyykk...", "..kyyyyyyyyyk..", ".kyyyyyyyyyyyk.", ".kyyykyyykyyyk.", "kyyyykyyykyyyyk", "kyyyyyyyyyyyyyk", "kyyyyyyyyyyyyyk", "kyyyyykkkyyyyyk", ".kyyyykykyyyyk.", ".kyyyykkkyyyyk.", "..kyyyyyyyyyk..", "...kkyyyyykk...", ".....kkkkk....."],
  dead: [".....kkkkk.....", "...kkyyyyykk...", "..kyyyyyyyyyk..", ".kyyyyyyyyyyyk.", ".kyykykykykyyk.", "kyyyykyyykyyyyk", "kyyykykykykyyyk", "kyyyyyyyyyyyyyk", "kyyyyyyyyyyyyyk", ".kyyykkkkkyyyk.", ".kyykyyyyykyyk.", "..kyyyyyyyyyk..", "...kkyyyyykk...", ".....kkkkk....."],
  cool: [".....kkkkk.....", "...kkyyyyykk...", "..kyyyyyyyyyk..", ".kyyyyyyyyyyyk.", ".kykkkkkkkkkyk.", "kyykkkyyykkkyyk", "kyyyyyyyyyyyyyk", "kyyyyyyyyyyyyyk", "kyyykyyyyykyyyk", ".kyyykkkkkyyyk.", ".kyyyyyyyyyyyk.", "..kyyyyyyyyyk..", "...kkyyyyykk...", ".....kkkkk....."],
};
function iconSrc(key) { return (C.icons && C.icons[key]) || `images/${key}.svg`; }
function icon(key, size = 32) {
  if (PIX[key]) return pixelSvg(PIX[key], size);
  return `<img class="px" src="${esc(iconSrc(key))}" width="${size}" height="${size}" alt="" draggable="false">`;
}

// Flat Material-style glyphs used by the YouTube and Spotify apps (instead of emoji).
const UI_PATHS = {
  home: "M12 3 3 10.5V21h6v-6h6v6h6V10.5z",
  homeO: "M12 5.7 18 10.7V19h-2v-6H8v6H6v-8.3zM12 3 4 9.7V21h6v-6h4v6h6V9.7z",
  search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z",
  create: "M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3z",
  play: "M8 5v14l11-7z",
  like: "M1 21h4V9H1zm22-11a2 2 0 0 0-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10a2 2 0 0 0 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73z",
  share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92",
  trash: "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z",
  subs: "M20 8H4V6h16zm-2-6H6v2h12zm4 10v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2m-6 4-6-3.27v6.53z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4",
  note: "M12 3v10.55A4 4 0 1 0 14 17V7h4V3z",
  library: "M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1m6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1m6.5-19.87A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.46a1 1 0 0 0-.5-.87z",
  back: "M15.5 20.3 7.2 12l8.3-8.3 1.4 1.4L10 12l6.9 6.9z",
  fwd: "M8.5 3.7 16.8 12l-8.3 8.3-1.4-1.4L14 12 7.1 5.1z",
  folder: "M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8z",
  down: "M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z",
  up: "M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z",
  close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
};
const ui = (name, size = 20) => `<svg class="ui-i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${UI_PATHS[name] || ""}"/></svg>`;

/* ---------------------------------------------------------------- sound */
// Every sound is synthesized live with WebAudio, so there are no audio files.
const Sound = {
  ctx: null,
  muted: store.get("muted", false),
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC(); } catch (e) { return; }
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  tone(f, t, dur, type = "sine", vol = 0.12, attack = 0.01) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master());
    o.start(t); o.stop(t + dur + 0.05);
  },
  master() {
    if (!this._m) { this._m = this.ctx.createGain(); this._m.gain.value = store.get("volume", 0.8); this._m.connect(this.ctx.destination); }
    return this._m;
  },
  setVolume(v) { store.set("volume", v); if (this._m) this._m.gain.value = v; },
  noise(t, dur, vol = 0.3) {
    const c = this.ctx, len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 900;
    s.buffer = buf; g.gain.value = vol;
    s.connect(f).connect(g).connect(this.master()); s.start(t);
  },
  play(name) {
    if (this.muted || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime + 0.02;
    switch (name) {
      case "startup":
        this.tone(155.56, t, 3.2, "sine", 0.10, 0.3);
        [311.13, 392.0, 466.16, 622.25, 783.99, 932.33].forEach((f, i) => {
          this.tone(f, t + i * 0.14, 2.6 - i * 0.15, "triangle", 0.07, 0.04);
          this.tone(f * 2, t + i * 0.14 + 0.01, 1.2, "sine", 0.02, 0.02);
        });
        break;
      case "ding": this.tone(1318.5, t, 0.5, "sine", 0.1); this.tone(1760, t + 0.07, 0.6, "sine", 0.06); break;
      case "error": this.tone(220, t, 0.35, "square", 0.05); this.tone(277.2, t, 0.35, "square", 0.04); break;
      case "notify": this.tone(880, t, 0.18, "sine", 0.08); this.tone(1174.7, t + 0.09, 0.25, "sine", 0.07); break;
      case "click": this.tone(1800, t, 0.03, "square", 0.02); break;
      case "boom": this.noise(t, 0.9, 0.5); this.tone(70, t, 0.6, "sine", 0.25); break;
      case "win": [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, t + i * 0.1, 0.4, "triangle", 0.08)); break;
      case "crumple": this.noise(t, 0.35, 0.25); this.noise(t + 0.12, 0.25, 0.18); break;
      case "deal": this.noise(t, 0.06, 0.12); break;
      case "eat": this.tone(660, t, 0.08, "square", 0.04); this.tone(990, t + 0.05, 0.1, "square", 0.04); break;
      case "power": this.tone(55, t, 0.5, "sine", 0.3, 0.005); this.tone(15600, t, 0.4, "sine", 0.015); break;
      case "shutdown": [783.99, 622.25, 466.16, 311.13].forEach((f, i) => this.tone(f, t + i * 0.22, 1.4, "triangle", 0.07, 0.05)); break;
    }
  },
};
["pointerdown", "keydown"].forEach(ev => window.addEventListener(ev, () => Sound.unlock(), { capture: true, passive: true }));

/* ---------------------------------------------------------------- sky */
// Procedural clouds: SVG fractal noise shaped into white cloud cover with soft
// blue-gray undersides, over a gradient sky (same idea as "Render Clouds").
let skyN = 0;
function skySvg(seed = 11) {
  const id = "sky" + (++skyN);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="sky" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a47b5"/><stop offset=".55" stop-color="#3c7ad6"/><stop offset="1" stop-color="#86b6ec"/></linearGradient>
      <filter id="${id}s" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0062" numOctaves="6" seed="${seed}"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.47  0 0 0 0 0.72  3.2 0 0 0 -1.55"/>
      </filter>
      <filter id="${id}f" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0062" numOctaves="6" seed="${seed}"/>
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.4 0 0 0 -1.72"/>
        <feComponentTransfer><feFuncA type="table" tableValues="0 .5 .85 .97 1"/></feComponentTransfer>
      </filter>
      <linearGradient id="${id}mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".4" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <mask id="${id}m"><rect width="1600" height="1000" fill="url(#${id}mg)"/></mask>
    </defs>
    <rect width="1600" height="1000" fill="url(#${id}g)"/>
    <g mask="url(#${id}m)">
      <rect width="1600" height="1000" filter="url(#${id}s)" transform="translate(0 14)"/>
      <rect width="1600" height="1000" filter="url(#${id}f)"/>
    </g>
  </svg>`;
}

// The desktop wallpaper uses the sky as a cached image instead of a live SVG
// filter, so dragging windows over it never has to recompute the clouds.
let skyUrl = "";
function ensureSkyWallpaper() {
  if (skyUrl) return skyUrl;
  skyUrl = URL.createObjectURL(new Blob([skySvg(23)], { type: "image/svg+xml" }));
  document.documentElement.style.setProperty("--sky", `url("${skyUrl}")`);
  return skyUrl;
}

/* ---------------------------------------------------------------- zoom effect */
function zoom(from, to, ms = 170) {
  return new Promise(resolve => {
    if (reduceMotion() || !from || !to || !document.body.animate) return resolve();
    const z = document.createElement("div");
    z.className = "zoom-rect";
    document.body.appendChild(z);
    const f = r => ({ left: r.left + "px", top: r.top + "px", width: Math.max(r.width, 8) + "px", height: Math.max(r.height, 8) + "px" });
    const a = z.animate([f(from), f(to)], { duration: ms, easing: "cubic-bezier(.25,.8,.3,1)", fill: "forwards" });
    const end = () => { z.remove(); resolve(); };
    a.onfinish = end; a.oncancel = end;
  });
}

/* ==========================================================================
   WINDOW MANAGER
   ========================================================================== */
const WM = {
  wins: new Map(), z: 10, cascade: 0, active: null, layer: null, tasks: null,

  init() {
    this.layer = $("#windows");
    this.tasks = $("#taskButtons");
    window.addEventListener("resize", () => this.wins.forEach(w => this.clamp(w)));
  },
  has(id) { return this.wins.has(id); },
  get(id) { return this.wins.get(id); },
  bounds() { return { w: this.layer.clientWidth, h: this.layer.clientHeight }; },

  open(id, o) {
    const existing = this.wins.get(id);
    if (existing) {
      if (existing.min) this.restore(id); else this.focus(id);
      this.flash(existing);
      return existing;
    }
    const el = document.createElement("div");
    el.className = "window" + (o.className ? " " + o.className : "");
    el.dataset.id = id;
    el.setAttribute("role", o.modal ? "alertdialog" : "dialog");
    el.setAttribute("aria-label", o.title);
    const canMax = o.maximizable !== false && o.resizable !== false;
    const canMin = o.minimizable !== false && !o.modal;
    el.innerHTML = `
      <div class="title-bar">
        ${o.icon ? `<span class="title-bar__icon">${icon(o.icon, 16)}</span>` : ""}
        <span class="title-bar__text"></span>
        <div class="title-bar__controls">
          ${canMin ? `<button type="button" class="tb-btn" data-tb="min" aria-label="Minimize" tabindex="-1">${G.min}</button>` : ""}
          ${canMax ? `<button type="button" class="tb-btn" data-tb="max" aria-label="Maximize" tabindex="-1">${G.max}</button>` : ""}
          <button type="button" class="tb-btn tb-btn--close" data-tb="close" aria-label="Close" tabindex="-1">${G.close}</button>
        </div>
      </div>
      <div class="menubar" hidden></div>
      <div class="window__body"></div>
      <div class="statusbar" hidden></div>
      ${o.resizable !== false ? `<div class="resize-grip" aria-hidden="true"></div>` : ""}`;
    $(".title-bar__text", el).textContent = o.title;

    const w = {
      id, el, o, min: false, max: false, btn: null,
      body: $(".window__body", el),
      setTitle: t => {
        $(".title-bar__text", el).textContent = t;
        el.setAttribute("aria-label", t);
        if (w.btn) { $("span", w.btn).textContent = t; w.btn.title = t; }
      },
      setStatus: parts => {
        const bar = $(".statusbar", el);
        bar.hidden = false;
        bar.innerHTML = (Array.isArray(parts) ? parts : [parts]).map(p => `<p class="statusbar__field">${esc(p)}</p>`).join("");
      },
      close: () => this.close(id),
      notify: () => { if (this.active !== id && w.btn) w.btn.classList.add("is-flashing"); },
    };
    this.wins.set(id, w);

    if (o.w) el.style.width = Math.min(o.w, window.innerWidth - 8) + "px";
    if (o.h) { el.style.height = Math.min(o.h, this.bounds().h - 8) + "px"; el.classList.add("has-height"); }
    el.style.visibility = "hidden";
    this.layer.appendChild(el);

    if (o.render) o.render(w.body, w);
    if (o.menu) {
      const bar = $(".menubar", el);
      bar.hidden = false;
      buildMenubar(bar, typeof o.menu === "function" ? o.menu(w) : o.menu);
    }
    if (o.status) w.setStatus(o.status);
    this.place(w);
    if (isMobile() && !o.modal && o.maximizable !== false) { w.max = true; el.classList.add("is-max"); }

    if (!o.modal && o.taskbar !== false) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "task-btn";
      btn.innerHTML = `${icon(o.icon || "about", 16)}<span></span>`;
      $("span", btn).textContent = o.title;
      btn.title = o.title;
      btn.addEventListener("click", () => {
        if (w.min) this.restore(id);
        else if (this.active === id) this.minimize(id);
        else this.focus(id);
      });
      this.tasks.appendChild(btn);
      w.btn = btn;
    }

    this.wire(w);
    this.focus(id);
    const show = () => {
      el.style.visibility = "";
      el.classList.add("is-opening");
      setTimeout(() => el.classList.remove("is-opening"), 180);
      // focus is deferred a frame so the key that opened this window
      // (e.g. Enter in the Run box) can't also "press" a button inside it
      if (o.onOpen) requestAnimationFrame(() => { if (this.wins.get(id) === w) o.onOpen(w); });
    };
    if (o.from) zoom(o.from, el.getBoundingClientRect()).then(show); else show();
    return w;
  },

  place(w) {
    const { el, o } = w;
    const b = this.bounds();
    let r = el.getBoundingClientRect();
    if (r.height > b.h - 8) { el.style.height = (b.h - 8) + "px"; el.classList.add("has-height"); r = el.getBoundingClientRect(); }
    let x, y;
    if (o.center || o.modal) {
      x = (b.w - r.width) / 2; y = (b.h - r.height) / 2.3;
    } else {
      const off = (this.cascade++ % 6) * 26;
      const minX = b.w > 900 ? 180 : 12;
      x = Math.max(minX, (b.w - r.width) / 2 - 70) + off;
      y = Math.max(16, (b.h - r.height) / 2 - 50) + off;
    }
    x = Math.max(4, Math.min(x, b.w - r.width - 4));
    y = Math.max(4, Math.min(y, b.h - r.height - 4));
    el.style.left = Math.round(x) + "px";
    el.style.top = Math.round(y) + "px";
  },

  wire(w) {
    const { el } = w;
    el.addEventListener("pointerdown", () => this.focus(w.id), true);
    $$("[data-tb]", el).forEach(btn => btn.addEventListener("click", e => {
      e.stopPropagation();
      const a = btn.dataset.tb;
      if (a === "min") this.minimize(w.id);
      else if (a === "max") this.toggleMax(w.id);
      else this.close(w.id);
    }));

    const bar = $(".title-bar", el);
    let lastDown = 0;
    bar.addEventListener("pointerdown", e => {
      if (e.button !== 0 || e.target.closest(".tb-btn")) return;
      const now = Date.now();
      if (now - lastDown < 350) { lastDown = 0; if ($('[data-tb="max"]', el)) this.toggleMax(w.id); return; }
      lastDown = now;
      if (w.max || isMobile()) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      bar.setPointerCapture(e.pointerId);
      document.body.classList.add("is-dragging");
      const move = ev => {
        const b = this.bounds();
        const nx = Math.min(Math.max(ox + ev.clientX - sx, 60 - el.offsetWidth), b.w - 60);
        const ny = Math.min(Math.max(oy + ev.clientY - sy, 0), b.h - 20);
        el.style.left = nx + "px"; el.style.top = ny + "px";
      };
      const up = () => {
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
        document.body.classList.remove("is-dragging");
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });

    const grip = $(".resize-grip", el);
    if (grip) grip.addEventListener("pointerdown", e => {
      if (e.button !== 0 || w.max) return;
      e.preventDefault(); e.stopPropagation();
      const sx = e.clientX, sy = e.clientY, ow = el.offsetWidth, oh = el.offsetHeight;
      grip.setPointerCapture(e.pointerId);
      document.body.classList.add("is-dragging");
      el.classList.add("has-height");
      const move = ev => {
        const b = this.bounds();
        el.style.width = Math.min(Math.max(ow + ev.clientX - sx, 240), b.w - el.offsetLeft) + "px";
        el.style.height = Math.min(Math.max(oh + ev.clientY - sy, 150), b.h - el.offsetTop) + "px";
        if (w.o.onResize) w.o.onResize(w);
      };
      const up = () => {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", up);
        grip.removeEventListener("pointercancel", up);
        document.body.classList.remove("is-dragging");
      };
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", up);
      grip.addEventListener("pointercancel", up);
    });
  },

  focus(id) {
    const w = this.wins.get(id);
    if (!w || w.min) return;
    if (this.active !== id || !w.el.style.zIndex) w.el.style.zIndex = (w.o.modal ? 5000 : 0) + (++this.z);
    this.wins.forEach(x => {
      const on = x === w;
      x.el.classList.toggle("is-active", on);
      if (x.btn) x.btn.classList.toggle("is-pressed", on);
    });
    if (w.btn) w.btn.classList.remove("is-flashing");
    this.active = id;
    if (w.o.onFocus) w.o.onFocus(w);
  },
  focusTop() {
    let top = null;
    this.wins.forEach(w => { if (!w.min && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w; });
    if (top) this.focus(top.id);
    else {
      this.active = null;
      this.wins.forEach(x => { x.el.classList.remove("is-active"); if (x.btn) x.btn.classList.remove("is-pressed"); });
    }
  },
  minimize(id, animate = true) {
    const w = this.wins.get(id);
    if (!w || w.min || w.o.modal) return;
    const from = w.el.getBoundingClientRect();
    w.min = true;
    w.el.classList.add("is-min");
    if (w.btn) { w.btn.classList.remove("is-pressed"); if (animate) zoom(from, w.btn.getBoundingClientRect(), 150); }
    if (this.active === id) this.active = null;
    this.focusTop();
  },
  restore(id) {
    const w = this.wins.get(id);
    if (!w) return;
    w.min = false;
    w.el.classList.remove("is-min");
    w.el.style.visibility = "hidden";
    this.focus(id);
    const show = () => { w.el.style.visibility = ""; };
    if (w.btn) zoom(w.btn.getBoundingClientRect(), w.el.getBoundingClientRect(), 150).then(show); else show();
  },
  toggleMax(id) {
    const w = this.wins.get(id);
    if (!w || isMobile()) return;
    const from = w.el.getBoundingClientRect();
    w.max = !w.max;
    w.el.classList.toggle("is-max", w.max);
    const mb = $('[data-tb="max"]', w.el);
    if (mb) { mb.innerHTML = w.max ? G.restore : G.max; mb.setAttribute("aria-label", w.max ? "Restore" : "Maximize"); }
    if (w.o.onResize) w.o.onResize(w);
    if (!reduceMotion()) {
      const to = w.el.getBoundingClientRect();
      w.el.style.visibility = "hidden";
      zoom(from, to, 130).then(() => { w.el.style.visibility = ""; });
    }
  },
  close(id) {
    const w = this.wins.get(id);
    if (!w) return;
    this.wins.delete(id);
    if (w.o.onClose) w.o.onClose(w);
    if (w.btn) w.btn.remove();
    w.el.classList.add("is-closing");
    setTimeout(() => w.el.remove(), reduceMotion() ? 0 : 100);
    if (this.active === id) { this.active = null; this.focusTop(); }
  },
  closeAll() { Array.from(this.wins.keys()).forEach(id => this.close(id)); },
  flash(w) { w.el.classList.remove("is-flash"); void w.el.offsetWidth; w.el.classList.add("is-flash"); },
  clamp(w) {
    if (w.max) return;
    const b = this.bounds();
    const x = Math.min(Math.max(w.el.offsetLeft, 60 - w.el.offsetWidth), b.w - 60);
    const y = Math.min(Math.max(w.el.offsetTop, 0), Math.max(0, b.h - 20));
    w.el.style.left = x + "px"; w.el.style.top = y + "px";
  },
  // "Show Desktop": minimize everything; clicking again brings it all back
  showDesktop() {
    const open = Array.from(this.wins.values()).filter(w => !w.min && !w.o.modal && w.btn);
    if (open.length) { this._hidden = open.map(w => w.id); open.forEach(w => this.minimize(w.id, false)); }
    else if (this._hidden) { this._hidden.forEach(id => { if (this.wins.has(id)) this.restore(id); }); this._hidden = null; }
  },
};

/* ==========================================================================
   MENUS (drop-downs, context menus, popups)
   ========================================================================== */
const Menu = {
  stack: [],
  open(items, x, y, opts = {}) {
    this.closeAll();
    const m = document.createElement("div");
    m.className = "menu";
    m.setAttribute("role", "menu");
    items.forEach(it => {
      if (it.sep) { const s = document.createElement("div"); s.className = "menu__sep"; m.appendChild(s); return; }
      const b = document.createElement("button");
      b.type = "button";
      b.className = "menu__item" + (it.bold ? " is-default" : "");
      b.setAttribute("role", "menuitem");
      b.disabled = !!it.disabled;
      b.innerHTML = `<span class="menu__check">${it.checked ? G.check : ""}</span><span class="menu__label"></span><span class="menu__hint"></span>`;
      $(".menu__label", b).textContent = it.label;
      $(".menu__hint", b).textContent = it.hint || "";
      b.addEventListener("click", e => { e.stopPropagation(); this.closeAll(); if (it.action) it.action(); });
      m.appendChild(b);
    });
    this.mount(m, x, y, opts.onClose);
    return m;
  },
  mount(el, x, y, onClose) {
    el.addEventListener("pointerdown", e => e.stopPropagation());
    el.addEventListener("contextmenu", e => e.preventDefault());
    document.body.appendChild(el);
    const r = el.getBoundingClientRect();
    el.style.left = Math.max(0, Math.min(x, window.innerWidth - r.width - 2)) + "px";
    el.style.top = Math.max(0, Math.min(y, window.innerHeight - r.height - 2)) + "px";
    this.stack.push({ el, onClose });
  },
  closeAll() {
    while (this.stack.length) { const s = this.stack.pop(); s.el.remove(); if (s.onClose) s.onClose(); }
  },
};

function buildMenubar(bar, menus) {
  bar.innerHTML = menus.map((m, i) => `<button type="button" class="menubar__item" data-i="${i}"><u>${esc(m.label[0])}</u>${esc(m.label.slice(1))}</button>`).join("");
  let open = -1;
  const reset = () => { open = -1; $$(".menubar__item", bar).forEach(b => b.classList.remove("is-open")); };
  const show = (i, b) => {
    Menu.closeAll();
    open = i;
    b.classList.add("is-open");
    const r = b.getBoundingClientRect();
    Menu.open(menus[i].items, r.left, r.bottom, { onClose: reset });
  };
  bar.addEventListener("pointerdown", e => {
    const b = e.target.closest(".menubar__item");
    if (!b) return;
    e.stopPropagation();
    const i = +b.dataset.i;
    if (open === i) Menu.closeAll(); else show(i, b);
  });
  bar.addEventListener("pointerover", e => {
    const b = e.target.closest(".menubar__item");
    if (!b || open < 0) return;
    const i = +b.dataset.i;
    if (i !== open) show(i, b);
  });
}

function wireTabs(root) {
  const tabs = $$(".tab", root);
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => { const on = x === t; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", on); });
    $$(".tab-panel", root).forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
  }));
}

/* ==========================================================================
   MESSAGE BOX
   ========================================================================== */
let msgN = 0;
function msgBox({ title = OS, text = "", icon: ic = "info", buttons = ["OK"], defaultIndex = 0 } = {}) {
  Sound.play(ic === "error" ? "error" : "ding");
  return new Promise(resolve => {
    let done = false;
    WM.open("msg-" + (++msgN), {
      title, modal: true, resizable: false, w: 380,
      render(body, win) {
        body.innerHTML = `
          <div class="msgbox"><div class="msgbox__icon msgbox__icon--${ic}" aria-hidden="true"></div><p class="msgbox__text"></p></div>
          <div class="dialog-buttons dialog-buttons--center">${buttons.map((b, i) => `<button type="button" class="btn${i === defaultIndex ? " btn--default" : ""}" data-i="${i}">${esc(b)}</button>`).join("")}</div>`;
        $(".msgbox__text", body).textContent = text;
        $$("[data-i]", body).forEach(b => b.addEventListener("click", () => { done = true; win.close(); resolve(buttons[+b.dataset.i]); }));
        body.addEventListener("keydown", e => { if (e.key === "Escape") win.close(); });
      },
      onOpen(w) { const d = $(".btn--default", w.body); if (d) d.focus(); },
      onClose() { if (!done) resolve(null); },
    });
  });
}
/* ---------- About Me ---------- */
function contactIcon(label, href) {
  const t = (label + " " + href).toLowerCase();
  if (t.includes("mail")) return "contact";
  if (t.includes("github")) return "github";
  if (t.includes("discord")) return "discord";
  if (t.includes("youtube")) return "youtube";
  return "chrome";
}
function openAbout(o = {}) {
  WM.open("about", {
    title: "About Me", icon: "about", w: 520, from: o.from, resizable: false,
    render(body, win) {
      const photo = C.heroImage
        ? `<img src="${esc(C.heroImage)}" data-fallback="${esc(initials(NAME))}" alt="${esc(NAME)}">`
        : `<img src="${placeholder(initials(NAME), 240, 240)}" alt="">`;
      const hasExp = EXPERIENCE.length || EDUCATION.length;
      const tabs = [["general", "General"], ["skills", "Skills"], ...(hasExp ? [["exp", "Experience"]] : []), ["contact", "Contact"]];
      const leveled = SKILL_LIST.some(x => x.level);
      const timeline = (list, legend) => list.length ? `<fieldset class="groupbox"><legend>${legend}</legend><div class="ab__timeline">${list.map(x => `
        <div class="ab__item"><b>${esc(x.title)}</b><span>${esc([x.place, x.when].filter(Boolean).join("  \u00b7  "))}</span>${x.text ? `<p>${esc(x.text)}</p>` : ""}</div>`).join("")}</div></fieldset>` : "";
      body.innerHTML = `
        <div class="tabs" role="tablist">${tabs.map(([k, l], i) => `<button type="button" class="tab${i ? "" : " is-active"}" data-tab="${k}" role="tab">${l}</button>`).join("")}</div>
        <div class="tab-panel" data-panel="general">
          <div class="ab__hero">
            <div class="ab__photo">${photo}</div>
            <div class="ab__id">
              <h2>${esc(NAME)}</h2>
              ${ROLE ? `<p class="ab__role">${esc(ROLE)}</p>` : ""}
              <p class="ab__tags">
                ${STATUS ? `<span class="ab__status"><i></i>${esc(STATUS)}</span>` : ""}
                ${LOCATION ? `<span class="ab__chip">${esc(LOCATION)}</span>` : ""}
              </p>
              ${C.tagline ? `<p class="ab__tagline">${esc(C.tagline)}</p>` : ""}
            </div>
          </div>
          <fieldset class="groupbox"><legend>About me</legend>
            <div class="ab__bio">${ABOUT_PARAS.map(p => `<p>${esc(p)}</p>`).join("") || "<p>Nothing here yet.</p>"}</div>
          </fieldset>
        </div>
        <div class="tab-panel" data-panel="skills" hidden>
          <fieldset class="groupbox"><legend>What I work with</legend>
            ${leveled
              ? `<div class="ab__skills">${SKILL_LIST.map(x => `<div class="ab__skill"><span>${esc(x.name)}</span><span class="ab__meter" title="${x.level ? x.level + " out of 5" : ""}">${Array.from({ length: 15 }, (_, i) => `<i${i < x.level * 3 ? ' class="on"' : ""}></i>`).join("")}</span></div>`).join("")}</div>`
              : `<div class="chips">${SKILLS.map(x => `<span class="chip">${esc(x)}</span>`).join("") || "No skills listed yet."}</div>`}
          </fieldset>
          <p class="ab__note">Always learning. ${PROJECTS.length ? `See these skills in action in <a href="#" data-app="projects">My Projects</a>.` : ""}</p>
        </div>
        ${hasExp ? `<div class="tab-panel" data-panel="exp" hidden>${timeline(EXPERIENCE, "Experience")}${timeline(EDUCATION, "Education")}</div>` : ""}
        <div class="tab-panel" data-panel="contact" hidden>
          <div class="ab__links">${CONTACTS.map(x => `<a class="ab__link" href="${esc(x.href)}" target="_blank" rel="noopener">${icon(contactIcon(x.label, x.href), 32)}<span><b>${esc(x.label)}</b><small>${esc(x.value)}</small></span></a>`).join("") || "<p>No contact info yet.</p>"}</div>
          <div class="dialog-buttons" style="justify-content:flex-start"><button type="button" class="btn" data-app="contact">New Message...</button>${RESUME ? `<button type="button" class="btn" data-app="resume">Open Resume</button>` : ""}</div>
        </div>
        <div class="dialog-buttons">
          <button type="button" class="btn" data-app="projects">My Projects...</button>
          ${RESUME ? `<button type="button" class="btn" data-app="resume">Resume...</button>` : ""}
          <button type="button" class="btn btn--default" data-act="ok">OK</button>
        </div>`;
      wireTabs(body);
      body.addEventListener("click", e => {
        const a = e.target.closest("[data-app]");
        if (a) { e.preventDefault(); openApp(a.dataset.app); return; }
        const t = e.target.closest("[data-tab-go]");
        if (t) { const tab = $(`.tab[data-tab="${t.dataset.tabGo}"]`, body); if (tab) tab.click(); }
      });
      $('[data-act="ok"]', body).addEventListener("click", () => win.close());
    },
    onOpen: w => $('[data-act="ok"]', w.body).focus(),
  });
}

/* ---------- Notepad (Skills + new text files) ---------- */
function skillsText() {
  const names = ["", "Beginner", "Learning", "Comfortable", "Advanced", "Expert"];
  const w = Math.max(12, ...SKILL_LIST.map(x => x.name.length)) + 2;
  const lines = [
    `SKILLS.TXT  -  ${NAME}`,
    "=".repeat(44),
    "",
    `  ${"SKILL".padEnd(w)}LEVEL`,
    `  ${"-----".padEnd(w)}-----`,
  ];
  SKILL_LIST.forEach(x => {
    const lv = x.level || 0;
    lines.push(`  ${x.name.padEnd(w)}${lv ? `[${"#".repeat(lv * 2).padEnd(10, ".")}]  ${names[lv]}` : "[  listed  ]"}`);
  });
  lines.push("", `  Projects on disk: ${PROJECTS.length}   (open the My Projects folder)`, "", "  Always learning. Ask me about any of the above!", "", "  Tip: type SKILLS in the MS-DOS Prompt for the animated version.");
  return lines.join("\n");
}
let noteN = 0;
function openSkills(o = {}) { openNotepad("skills", "skills.txt", skillsText(), o); }
function openNewNote(o = {}) { noteN++; openNotepad("note-" + noteN, noteN === 1 ? "Untitled" : `Untitled (${noteN})`, "", o); }
function saveAsDialog(name) {
  return new Promise(resolve => {
    let result = null;
    WM.open("saveas-" + Date.now(), {
      title: "Save As", icon: "skills", modal: true, resizable: false, w: 380,
      render(body, win) {
        body.innerHTML = `
          <div class="saveas">
            <label class="mail-field"><span>Save in:</span><span class="field addressbar__field">${icon("showdesk", 16)}Desktop</span></label>
            <label class="mail-field"><span>File name:</span><input class="field" value="${esc(name)}" maxlength="60" spellcheck="false"></label>
            <label class="mail-field"><span>Save as:</span><span class="field addressbar__field">Text Documents (*.txt)</span></label>
          </div>
          <div class="dialog-buttons"><button type="button" class="btn btn--default" data-act="save">Save</button><button type="button" class="btn" data-act="cancel">Cancel</button></div>`;
        const input = $("input", body);
        const go = () => {
          let v = input.value.trim().replace(/[\\/:*?"<>|]/g, "");
          if (!v) return;
          if (!/\.[a-z0-9]{1,4}$/i.test(v)) v += ".txt";
          result = v; win.close();
        };
        $('[data-act="save"]', body).addEventListener("click", go);
        $('[data-act="cancel"]', body).addEventListener("click", () => win.close());
        input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); go(); } if (e.key === "Escape") win.close(); });
        win.input = input;
      },
      onOpen: w => { w.input.focus(); w.input.setSelectionRange(0, w.input.value.replace(/\.txt$/i, "").length); },
      onClose: () => resolve(result),
    });
  });
}
function openNotepad(id, file, text, o = {}) {
  WM.open(id, {
    title: `${file} - Notepad`, icon: "notepad", w: 520, h: 370, from: o.from,
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      body.innerHTML = `<textarea class="notepad" spellcheck="false" aria-label="${esc(file)}"></textarea>`;
      win.ta = $("textarea", body);
      win.ta.value = text;
      win.wrap = true;
      win.docId = o.docId || null;
      win.file = file;
      win.save = async (forceAs = false) => {
        const docs = store.get("docs", []);
        if (win.docId && !forceAs && docs.some(d => d.id === win.docId)) {
          docs.find(d => d.id === win.docId).text = win.ta.value;
          store.set("docs", docs);
        } else {
          const name = await saveAsDialog(/\.txt$/i.test(win.file) || /\.[a-z0-9]{1,4}$/i.test(win.file) ? win.file : win.file + ".txt");
          if (!name || !WM.has(id)) return;
          const doc = { id: Date.now().toString(36), name, text: win.ta.value };
          store.set("docs", store.get("docs", []).concat(doc));
          win.docId = doc.id; win.file = name;
          win.setTitle(`${name} - Notepad`);
        }
        buildDesktopIcons();
        win.setStatus([`Saved to the desktop as ${win.file}`]);
      };
      win.ta.addEventListener("keydown", e => {
        if (e.key === "F5") { e.preventDefault(); insertAtCursor(win.ta, `${fmtTime()} ${fmtDate()}`); }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); win.save(); }
      });
    },
    menu: win => [
      { label: "File", items: [
        { label: "New", action: () => openNewNote() },
        { label: "Save", hint: "Ctrl+S", action: () => win.save() },
        { label: "Save As...", action: () => win.save(true) },
        { label: "Download as .txt", action: () => downloadText(/\.[a-z0-9]{1,4}$/i.test(win.file) ? win.file : win.file + ".txt", win.ta.value) },
        { sep: true },
        { label: "Exit", action: () => win.close() },
      ] },
      { label: "Edit", items: [
        { label: "Select All", action: () => { win.ta.focus(); win.ta.select(); } },
        { label: "Time/Date", hint: "F5", action: () => insertAtCursor(win.ta, `${fmtTime()} ${fmtDate()}`) },
      ] },
      { label: "Format", items: [
        { label: "Word Wrap", get checked() { return win.wrap; }, action: () => { win.wrap = !win.wrap; win.ta.classList.toggle("is-nowrap", !win.wrap); } },
      ] },
      { label: "Help", items: [
        { label: "About Notepad", action: () => msgBox({ title: "About Notepad", icon: "info", text: "Notepad\nWindows 98 Edition\n\nFile > Save puts your document on the desktop.\nDelete it there and it goes to the Recycle Bin." }) },
      ] },
    ],
    onOpen: w => w.ta.focus(),
  });
}

/* ---------- My Projects (Explorer) ---------- */
function openProjects(o = {}) {
  const count = `${PROJECTS.length} object(s)`;
  WM.open("projects", {
    title: "My Projects", icon: "projects", w: 540, h: 410, from: o.from, status: [count, ""],
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      const wvGlyph = {
        up: glyph(["...x...", "..xxx..", ".xxxxx.", "xxxxxxx", "..xxx..", "..xxx..", "..xxx..", "..xxx.."]),
        icons: glyph(["xxxxx.xxxxx.", "x...x.x...x.", "x...x.x...x.", "x...x.x...x.", "xxxxx.xxxxx.", "............", "xxxxx.xxxxx.", "x...x.x...x.", "x...x.x...x.", "x...x.x...x.", "xxxxx.xxxxx.", "............"]),
        details: glyph(["xx.xxxxxxxx", "xx.xxxxxxxx", "...........", "xx.xxxxxxxx", "xx.xxxxxxxx", "...........", "xx.xxxxxxxx", "xx.xxxxxxxx", "...........", "xx.xxxxxxxx", "xx.xxxxxxxx", "..........."]),
      };
      body.innerHTML = `
        <div class="toolbar wv__bar">
          <button type="button" class="tool-btn" disabled><span class="wv__ico wv__ico--arrow">${G.back}</span><span>Back</span></button>
          <button type="button" class="tool-btn" disabled><span class="wv__ico wv__ico--arrow">${G.fwd}</span><span>Forward</span></button>
          <button type="button" class="tool-btn" disabled><span class="wv__ico wv__ico--up">${wvGlyph.up}</span><span>Up</span></button>
          <span class="toolbar__sep"></span>
          <button type="button" class="tool-btn" data-view="icons"><span class="wv__ico wv__ico--view">${wvGlyph.icons}</span><span>Icons</span></button>
          <button type="button" class="tool-btn" data-view="details"><span class="wv__ico wv__ico--view">${wvGlyph.details}</span><span>Details</span></button>
        </div>
        <div class="addressbar"><span>Address</span><div class="field addressbar__field">${icon("projects", 16)}<span>C:\\My Documents\\Projects</span></div></div>
        <div class="wv">
          <aside class="wv__pane">
            <div class="wv__head">${icon("projects", 32)}<h2>My Projects</h2></div>
            <div class="wv__rule"></div>
            <div class="wv__info">${PROJECTS.length} project${PROJECTS.length === 1 ? "" : "s"} live in this folder.<br><br>Point at a project to see what it is. Click it to open the details, the code and the live demo.</div>
          </aside>
          <div class="explorer sunken-box" role="list" aria-label="Projects"></div>
        </div>`;
      win.view = store.get("projView", "icons");
      const box = $(".explorer", body);
      box.addEventListener("pointerleave", () => win.setStatus([count, ""]));
      $$("[data-view]", body).forEach(b => b.addEventListener("click", () => { win.view = b.dataset.view; store.set("projView", win.view); win.draw(); }));
      win.draw = () => {
        box.className = "explorer sunken-box explorer--" + win.view;
        $$("[data-view]", body).forEach(b => b.classList.toggle("is-on", b.dataset.view === win.view));
        if (!PROJECTS.length) { box.innerHTML = `<p class="explorer__empty">This folder is empty. Add projects in content.js.</p>`; return; }
        if (win.view === "details") {
          box.innerHTML = `<table class="details"><thead><tr><th>Name</th><th>Built with</th><th>Links</th></tr></thead><tbody>${PROJECTS.map((p, i) => `
            <tr data-i="${i}" tabindex="0"><td><span class="details__name">${icon("projects", 16)}${esc(p.title)}</span></td><td>${esc((p.tags || []).join(", "))}</td><td>${[p.github ? "Code" : "", p.demo ? "Live demo" : ""].filter(Boolean).join(", ") || "-"}</td></tr>`).join("")}</tbody></table>`;
        } else {
          box.innerHTML = PROJECTS.map((p, i) => `
            <button type="button" class="file" data-i="${i}" role="listitem">
              <span class="file__thumb">${icon("projects", 32)}</span>
              <span class="file__label">${esc(p.title)}</span>
            </button>`).join("");
        }
        $$("[data-i]", box).forEach(el => {
          const go = () => openProject(+el.dataset.i, el.getBoundingClientRect());
          el.addEventListener("click", go);
          el.addEventListener("keydown", e => { if (e.key === "Enter" && el.tagName === "TR") go(); });
          el.addEventListener("pointerenter", () => {
            const p = PROJECTS[+el.dataset.i];
            win.setStatus([p.title, "Click to open"]);
            $(".wv__info", body).innerHTML = `<b class="wv__title">${esc(p.title)}</b><br>${esc(p.description || "")}${(p.tags || []).length ? `<br><br><span class="wv__label">Built with:</span><br>${esc(p.tags.join(", "))}` : ""}<br><br>${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener">View code</a>` : ""}${p.github && p.demo ? " &middot; " : ""}${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">Live demo</a>` : ""}`;
          });
        });
      };
      win.draw();
    },
    menu: win => [
      { label: "File", items: [{ label: "Close", action: () => win.close() }] },
      { label: "View", items: [
        { label: "Large Icons", get checked() { return win.view === "icons"; }, action: () => { win.view = "icons"; store.set("projView", "icons"); win.draw(); } },
        { label: "Details", get checked() { return win.view === "details"; }, action: () => { win.view = "details"; store.set("projView", "details"); win.draw(); } },
        { sep: true },
        { label: "Refresh", action: () => win.draw() },
      ] },
      { label: "Help", items: [{ label: "About My Projects", action: () => msgBox({ title: "My Projects", icon: "info", text: "Click any project to see what it does, what it's built with, and links to the code and a live demo." }) }] },
    ],
  });
}
function openProject(i, from) {
  const p = PROJECTS[i];
  if (!p) return;
  WM.open("project-" + i, {
    title: p.title, icon: "projects", w: 470, from, resizable: false,
    render(body, win) {
      const shot = p.image
        ? `<img src="${esc(p.image)}" data-fallback="${esc(initials(p.title))}" alt="Screenshot of ${esc(p.title)}">`
        : `<img src="${placeholder(initials(p.title))}" alt="">`;
      body.innerHTML = `
        <div class="project__shot sunken-box">${shot}</div>
        <h2 class="project__title">${esc(p.title)}</h2>
        <p class="project__desc">${esc(p.description || "")}</p>
        ${(p.tags || []).length ? `<fieldset class="groupbox"><legend>Built with</legend><div class="chips">${p.tags.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div></fieldset>` : ""}
        <div class="dialog-buttons">
          ${p.github ? `<a class="btn" href="${esc(p.github)}" target="_blank" rel="noopener">View Code</a>` : ""}
          ${p.demo ? `<a class="btn" href="${esc(p.demo)}" target="_blank" rel="noopener">Live Demo</a>` : ""}
          <button type="button" class="btn btn--default" data-act="close">Close</button>
        </div>`;
      $('[data-act="close"]', body).addEventListener("click", () => win.close());
    },
  });
}

/* ---------- Contact Me (Outlook Express) ---------- */
function linkify(text) {
  return esc(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/([\w.+-]+@[\w-]+\.[\w.-]+)/g, '<a href="mailto:$1">$1</a>');
}
function inboxMessages() {
  const others = CONTACTS.filter(x => !/^mailto:/i.test(x.href || ""));
  return [
    { id: "welcome", from: NAME, subject: "Thanks for stopping by!", date: fmtDate(), body:
      `Hi there,\n\nThanks for checking out my portfolio! Yes, it's a whole Windows 98 desktop. Everything works, so poke around.\n\n` +
      `${ROLE ? `I'm a ${ROLE}${C.tagline ? ". " + C.tagline : "."}\n\n` : ""}` +
      `If you'd like to get in touch, click "New Mail" above and your message will open in your email program, ready to send` + (EMAIL ? `, or write to me directly at ${EMAIL}.` : ".") +
      `\n\nTalk soon,\n${NAME}` },
    { id: "links", from: FIRST, subject: "Where to find me", date: fmtDate(), body:
      `Here's everywhere you can find me:\n\n${CONTACTS.map(x => `${x.label}:  ${/^mailto:/i.test(x.href) ? x.value : x.href}`).join("\n")}\n\n${others.length ? "I reply fastest by email." : ""}` },
    { id: "work", from: NAME, subject: "What I've been building", date: fmtDate(), body:
      PROJECTS.length ? `A few things I've made:\n\n${PROJECTS.map(p => `- ${p.title}${p.description ? ": " + p.description : ""}${p.demo ? "\n  " + p.demo : ""}`).join("\n\n")}\n\nOpen the My Projects folder on the desktop for screenshots and code.` : "Projects are on their way. Check back soon!" },
    { id: "tip", from: "Outlook Express Team", subject: "Welcome to Outlook Express", date: "06/14/1998", body: "Outlook Express is the fastest way to say hello. Click New Mail to write a message, or Copy Email to grab the address." },
  ];
}
function openContact(o = {}) {
  WM.open("contact", {
    title: "Inbox - Outlook Express", icon: "contact", w: 760, h: 480, from: o.from,
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      body.innerHTML = `
        <div class="toolbar">
          <button type="button" class="tool-btn" data-act="new">${icon("contact", 16)}<span>New Mail</span></button>
          <button type="button" class="tool-btn" data-act="reply"><span class="oe__ico">${pixelSvg(["................", "................", ".....nn.........", "....nbbn........", "...nbbbbnnnnnnn.", "..nbbbbbbbbbbbn.", ".nbbbbbbbbbbbbn.", "..nbbbbbbbbbbbn.", "...nbbbbnnnnnnn.", "....nbbn........", ".....nn.........", "................", "................", "................", "................", "................"], 16)}</span><span>Reply</span></button>
          <span class="toolbar__sep"></span>
          <button type="button" class="tool-btn" data-act="copy"><span class="oe__ico">${pixelSvg(["................", "......kkkk......", ".....kddddk.....", "..kkkkkddkkkkk..", "..kYYYYYYYYYYk..", "..kYkkkkkkkkYk..", "..kYkwwwwwwkYk..", "..kYkwddddwkYk..", "..kYkwwwwwwkYk..", "..kYkwddddwkYk..", "..kYkwwwwwwkYk..", "..kYkwddddwkYk..", "..kYkwwwwwwkYk..", "..kYkkkkkkkkYk..", "..kYYYYYYYYYYk..", "..kkkkkkkkkkkk.."], 16)}</span><span>Copy Email</span></button>
          ${GITHUB_URL ? `<button type="button" class="tool-btn" data-act="github">${icon("github", 16)}<span>GitHub</span></button>` : ""}
        </div>
        <div class="oe">
          <nav class="oe__folders sunken-box"></nav>
          <section class="oe__right">
            <div class="oe__list sunken-box"></div>
            <div class="oe__preview sunken-box"></div>
          </section>
        </div>`;
      let folder = "inbox", sel = "welcome";
      const read = () => new Set(store.get("mailRead", []));
      const markRead = id => { const r = read(); r.add(id); store.set("mailRead", [...r]); };
      const lists = () => ({ inbox: inboxMessages(), sent: store.get("sentMail", []), drafts: store.get("mailDraft", null) ? [{ id: "draft", from: "(you)", subject: store.get("mailDraft").subject || "(no subject)", date: "", body: store.get("mailDraft").body || "" }] : [] });
      const draw = () => {
        const L = lists(), r = read(), unread = L.inbox.filter(m => !r.has(m.id)).length;
        $(".oe__folders", body).innerHTML = `
          <p class="oe__root">${icon("contact", 16)} Outlook Express</p>
          ${[["inbox", "Inbox", unread], ["sent", "Sent Items", 0], ["drafts", "Drafts", L.drafts.length]].map(([k, l, n]) => `<button type="button" class="oe__folder${k === folder ? " is-on" : ""}" data-folder="${k}">${icon("projects", 16)}<span>${l}</span>${n ? `<b>(${n})</b>` : ""}</button>`).join("")}`;
        const list = L[folder];
        if (!list.find(m => m.id === sel)) sel = list[0] ? list[0].id : null;
        $(".oe__list", body).innerHTML = list.length
          ? `<table class="details"><thead><tr><th>${folder === "sent" ? "To" : "From"}</th><th>Subject</th><th>${folder === "sent" ? "Sent" : "Received"}</th></tr></thead><tbody>${list.map(m => `
              <tr data-id="${esc(m.id)}" class="${m.id === sel ? "is-selected" : ""}${folder === "inbox" && !r.has(m.id) ? " is-unread" : ""}"><td><span class="details__name">${icon("contact", 16)}${esc(folder === "sent" ? (m.to || NAME) : m.from)}</span></td><td>${esc(m.subject)}</td><td>${esc(m.date)}</td></tr>`).join("")}</tbody></table>`
          : `<p class="explorer__empty">There are no items in this folder.</p>`;
        const m = list.find(x => x.id === sel);
        if (m && folder === "inbox") markRead(m.id);
        $(".oe__preview", body).innerHTML = m
          ? `<div class="oe__head"><p><b>From:</b> ${esc(folder === "sent" ? "You" : m.from)}${folder !== "sent" && (m.from === NAME || m.from === FIRST) && EMAIL ? ` &lt;${esc(EMAIL)}&gt;` : ""}</p><p><b>To:</b> ${esc(folder === "sent" ? (m.to || NAME) : "You")}</p><p><b>Subject:</b> ${esc(m.subject)}</p></div><div class="oe__body">${linkify(m.body)}</div>${folder === "drafts" ? `<p style="padding:0 12px"><button type="button" class="btn" data-act="new">Continue writing...</button></p>` : ""}`
          : `<p class="explorer__empty">No message selected.</p>`;
        win.setStatus([`${list.length} message(s)${folder === "inbox" && unread ? `, ${unread} unread` : ""}`, "Working Online"]);
      };
      win.draw = draw;
      body.addEventListener("click", e => {
        const f = e.target.closest("[data-folder]"); if (f) { folder = f.dataset.folder; sel = null; draw(); return; }
        const row = e.target.closest("tr[data-id]"); if (row) { sel = row.dataset.id; draw(); return; }
        const a = e.target.closest("[data-act]"); if (!a) return;
        if (a.dataset.act === "new") openCompose();
        if (a.dataset.act === "reply") { const m = lists()[folder].find(x => x.id === sel); openCompose(m && folder === "inbox" ? "Re: " + m.subject : ""); }
        if (a.dataset.act === "github") window.open(GITHUB_URL, "_blank", "noopener");
        if (a.dataset.act === "copy") {
          if (!EMAIL) { msgBox({ title: "Copy Email", icon: "warning", text: "There's no email address in content.js yet." }); return; }
          const done = () => msgBox({ title: "Copy Email", icon: "info", text: `Copied to the clipboard:\n${EMAIL}` });
          if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, () => msgBox({ title: "Copy Email", icon: "info", text: EMAIL })); else msgBox({ title: "Copy Email", icon: "info", text: EMAIL });
        }
      });
      draw();
    },
  });
}
function openCompose(subject = "") {
  const draft = store.get("mailDraft", null);
  WM.open("compose", {
    title: "New Message", icon: "contact", w: 540, h: 430, center: true,
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      body.innerHTML = `
        <div class="toolbar">
          <button type="button" class="tool-btn" data-act="send">${icon("contact", 16)}<span>Send</span></button>
          <button type="button" class="tool-btn" data-act="save">${icon("skills", 16)}<span>Save</span></button>
          <button type="button" class="tool-btn" data-act="discard"><span style="color:#c00;display:flex">${G.close}</span><span>Discard</span></button>
        </div>
        <div class="mail-fields">
          <label class="mail-field"><span>To:</span><input class="field" value="${esc(EMAIL ? `${NAME} <${EMAIL}>` : "(no email set)")}" readonly></label>
          <label class="mail-field"><span>From:</span><input class="field" data-f="from" placeholder="Your name" maxlength="80" value="${esc((draft && draft.from) || "")}"></label>
          <label class="mail-field"><span>Subject:</span><input class="field" data-f="subject" placeholder="Internship opportunity" maxlength="120" value="${esc(subject || (draft && draft.subject) || "")}"></label>
        </div>
        <textarea class="field mail-body" data-f="body" placeholder="Hi ${esc(FIRST)}, ..." aria-label="Message">${esc((draft && draft.body) || "")}</textarea>`;
      const val = k => $(`[data-f="${k}"]`, body).value.trim();
      const refresh = () => { const w = WM.get("contact"); if (w && w.draw) w.draw(); };
      $('[data-act="send"]', body).addEventListener("click", async () => {
        if (!EMAIL) { msgBox({ title: "New Message", icon: "warning", text: "There's no email address in content.js yet." }); return; }
        if (!val("body")) { await msgBox({ title: "New Message", icon: "warning", text: "Your message is empty. Type something first!" }); $('[data-f="body"]', body).focus(); return; }
        const text = val("body") + (val("from") ? `\n\n- ${val("from")}` : "");
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(val("subject") || "Hello from your portfolio")}&body=${encodeURIComponent(text)}`;
        const sent = store.get("sentMail", []);
        sent.unshift({ id: "s" + Date.now(), to: NAME, subject: val("subject") || "(no subject)", date: fmtDate(), body: text });
        store.set("sentMail", sent.slice(0, 20));
        store.del("mailDraft");
        refresh();
        win.close();
        msgBox({ title: "Message Sent", icon: "info", text: "Your email program should open with this message ready to send.\n\nA copy is in Sent Items. Thanks for reaching out!" });
      });
      $('[data-act="save"]', body).addEventListener("click", () => { store.set("mailDraft", { from: val("from"), subject: val("subject"), body: val("body") }); refresh(); win.setStatus(["Saved to Drafts"]); });
      $('[data-act="discard"]', body).addEventListener("click", () => { store.del("mailDraft"); refresh(); win.close(); });
    },
    status: [EMAIL ? "Ready" : "Add your email in content.js"],
    onOpen: w => $('[data-f="body"]', w.body).focus(),
  });
}

/* ---------- Chrome 98 ---------- */
const HOME = `http://www.geocities.com/SiliconValley/${SLUG}/`;
const GUESTBOOK_SEED = [
  { name: "CoolDude98", msg: "awesome site!!! added you to my webring", date: "06/14/1998" },
  { name: "NetSurfer99", msg: "love the under construction sign. very professional", date: "06/12/1998" },
  { name: "Mom", msg: "Very nice honey. How do I get back to the AOL?", date: "06/10/1998" },
];
function normUrl(u) {
  let s = String(u || "").trim();
  if (!s) return HOME;
  if (/^chrome:/i.test(s)) return "chrome://newtab";
  if (!/[.:/]/.test(s)) return `http://www.altavista.com/search?q=${encodeURIComponent(s)}`;
  if (!/^[a-z]+:/i.test(s)) s = "http://" + s;
  return s;
}
function routeOf(url) {
  const u = url.toLowerCase();
  if (u === "about:blank") return "blank";
  if (u.startsWith("chrome://")) return "newtab";
  if (u.includes("geocities.com")) {
    if (/about\.html?$/.test(u)) return "about";
    if (/guestbook\.html?$/.test(u)) return "guestbook";
    if (/links\.html?$/.test(u)) return "links";
    if (/\/siliconvalley\/[^/]+\/?(index\.html?)?$/.test(u)) return "home";
    return "404";
  }
  if (/youtube\.|youtu\.be/.test(u)) return "youtube";
  if (u.includes("github.com")) return "github";
  if (/altavista\.com|\/search\?q=/.test(u)) return "search";
  // any real-looking web address opens in the Time Machine (Internet Archive)
  if (/^https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(u)) return "web";
  return "error";
}
const SEARCH_INDEX = () => [
  { title: `${NAME}'s Homepage`, url: HOME, kw: `home homepage portfolio ${NAME} ${ROLE}`, desc: C.tagline || "My corner of the web." },
  { title: `About ${NAME}`, url: HOME + "about.html", kw: `about me bio ${NAME} ${SKILLS.join(" ")}`, desc: "Who I am and what I do." },
  { title: "Sign my Guestbook!", url: HOME + "guestbook.html", kw: "guestbook sign message", desc: "Leave a message. Be nice." },
  { title: "Cool Links", url: HOME + "links.html", kw: "links webring cool sites", desc: "The best sites on the information superhighway." },
  { title: "YouTube - Broadcast Yourself", url: "http://www.youtube.com", kw: "youtube video videos coryxkenshin", desc: "Watch videos." },
  ...PROJECTS.map((p, i) => ({ title: p.title, url: HOME + "about.html", kw: `${p.title} ${(p.tags || []).join(" ")} project`, desc: p.description || "", project: i })),
];
const PAGES = {
  blank: () => `<div class="ie-page"></div>`,
  home: () => {
    const visits = store.get("visits", 4216) + 1;
    store.set("visits", visits);
    const photo = C.heroImage ? `<img src="${esc(C.heroImage)}" data-fallback="${esc(initials(NAME))}" alt="">` : "";
    return `<div class="gc">
      <div class="gc__marquee"><span>*** Welcome to ${esc(NAME)}'s Homepage *** Thanks for stopping by *** Don't forget to sign my guestbook! ***</span></div>
      <h1>${esc(NAME)}'s Homepage</h1>
      <p class="gc__blink">&#9733; Under Construction &#9733;</p>
      <div class="gc__construct"></div>
      <p class="gc__nav">[ <a data-go="${HOME}">Home</a> | <a data-go="${HOME}about.html">About Me</a> | <a data-go="${HOME}guestbook.html">Guestbook</a> | <a data-go="${HOME}links.html">Cool Links</a> ]</p>
      <hr>
      <div class="gc__intro">${photo}<div><p>Hi! My name is <b>${esc(NAME)}</b>${ROLE ? ` and I'm a <b>${esc(ROLE)}</b>` : ""}.</p><p>${esc(C.tagline || "")}</p></div></div>
      <h2>My Projects</h2>
      <ul>${PROJECTS.map((p, i) => `<li><a data-project="${i}">${esc(p.title)}</a> &mdash; ${esc(p.description || "")}</li>`).join("") || "<li>Coming soon!</li>"}</ul>
      <hr>
      <p class="gc__counter">You are visitor number <span class="gc__digits">${String(visits).padStart(6, "0")}</span></p>
      <p class="gc__small">Best viewed in Chrome 98 at 800x600 &middot; Last updated ${fmtDate()}</p>
      <p class="gc__small"><a data-app="contact">E-mail me!</a></p>
    </div>`;
  },
  about: () => `<div class="gc">
      <p class="gc__nav">[ <a data-go="${HOME}">Home</a> | <b>About Me</b> | <a data-go="${HOME}guestbook.html">Guestbook</a> | <a data-go="${HOME}links.html">Cool Links</a> ]</p>
      <h1>About Me</h1><hr>
      ${ABOUT_PARAS.map(p => `<p>${esc(p)}</p>`).join("")}
      <h2>Things I can do</h2>
      <ul>${SKILLS.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
      <p class="gc__small"><a data-go="${HOME}">&laquo; Back home</a></p>
    </div>`,
  guestbook: () => {
    const list = store.get("guestbook", GUESTBOOK_SEED);
    return `<div class="gc">
      <p class="gc__nav">[ <a data-go="${HOME}">Home</a> | <a data-go="${HOME}about.html">About Me</a> | <b>Guestbook</b> | <a data-go="${HOME}links.html">Cool Links</a> ]</p>
      <h1>Sign My Guestbook!</h1><hr>
      <form data-form="guestbook">
        <label>Your name:<br><input class="field" name="name" maxlength="40" style="width:100%"></label>
        <label>Message:<br><textarea class="field" name="msg" maxlength="400" style="width:100%"></textarea></label>
        <div><button class="btn" type="submit">Sign Guestbook</button></div>
      </form>
      <h2>${list.length} entries</h2>
      ${list.map(e => `<div class="gc__entry"><b>${esc(e.name)}</b> <small>wrote on ${esc(e.date)}:</small><br>${esc(e.msg)}</div>`).join("")}
    </div>`;
  },
  links: () => `<div class="gc">
      <p class="gc__nav">[ <a data-go="${HOME}">Home</a> | <a data-go="${HOME}about.html">About Me</a> | <a data-go="${HOME}guestbook.html">Guestbook</a> | <b>Cool Links</b> ]</p>
      <h1>Cool Links</h1><hr>
      <ul>
        <li><a data-go="http://www.youtube.com">YouTube</a> &mdash; videos, apparently from the future</li>
        ${GITHUB_URL ? `<li><a data-go="${esc(GITHUB_URL)}">My GitHub</a> &mdash; where my code lives</li>` : ""}
        <li><a data-go="http://www.altavista.com">AltaVista</a> &mdash; search the whole web</li>
        <li><a data-go="http://www.my-other-site.com">My other homepage</a> &mdash; (it's down right now)</li>
      </ul>
      <p class="gc__small">This site is a proud member of the <b>Windows 98 Webring</b></p>
    </div>`,
  youtube: () => `<div class="ie-page"><h1>Opening YouTube...</h1><p>YouTube opened in its own window, where the videos actually play.</p><p><a data-app="youtube">Show YouTube</a> &middot; <a data-nav="back">Go back</a></p></div>`,
  web: url => {
    const year = store.get("crYear", 1998);
    const host = url.replace(/^https?:\/\//i, "").split(/[/?#]/)[0].replace(/^www\./i, "");
    return `<div class="tm">
      <div class="tm__bar">
        <span class="tm__badge">TIME MACHINE</span>
        <span><b>${esc(host)}</b> as it looked around <b>${year}</b>, from the Internet Archive</span>
        <a href="https://web.archive.org/web/${year}0601000000*/${esc(url)}" target="_blank" rel="noopener">All snapshots</a>
        <a href="${esc(url)}" target="_blank" rel="noopener">Live site</a>
      </div>
      <iframe class="tm__frame" src="https://web.archive.org/web/${year}0601000000if_/${esc(url)}" title="${esc(host)} in ${year}" referrerpolicy="no-referrer" sandbox="allow-scripts allow-forms allow-same-origin allow-popups"></iframe>
      <div class="tm__loading"><span class="tm__spin"></span>Dialing the Internet Archive...</div>
    </div>`;
  },
  newtab: () => `<div class="nt">
      <div class="nt__logo" aria-label="Google"><i>G</i><i>o</i><i>o</i><i>g</i><i>l</i><i>e</i></div>
      <form class="nt__search" data-form="search">${ui("search", 20)}<input class="field" name="q" placeholder="Search, or type a website like google.com" aria-label="Search" autocomplete="off" spellcheck="false"></form>
      <div class="nt__tiles">${CR_TILES.map(([label, url, ic, app, col]) => `<a class="nt__tile" ${app ? `data-app="${app}"` : `data-go="${esc(url)}"`}><span class="nt__fav"${col ? ` style="color:${col}"` : ""}>${col ? esc(label[0]) : icon(ic, 24)}</span><span class="nt__lbl">${esc(label)}</span></a>`).join("")}</div>
    </div>`,
  github: url => `<div class="ie-page">
      <h1>Opening GitHub...</h1>
      <p>GitHub opened in its own window.</p>
      <p><a data-app="github">Show GitHub</a> &middot; <a href="${esc(url)}" target="_blank" rel="noopener">Open github.com in a real browser</a> &middot; <a data-nav="back">Go back</a></p></div>`,
  search: url => {
    let q = "";
    try { q = new URL(url).searchParams.get("q") || ""; } catch (e) {}
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const results = terms.length ? SEARCH_INDEX().filter(r => terms.some(t => (r.title + " " + r.kw + " " + r.desc).toLowerCase().includes(t))) : [];
    return `<div class="ie-page">
      <h1>AltaVista Search</h1>
      <form class="search-box" data-form="search"><input class="field" name="q" value="${esc(q)}" placeholder="Search the web"><button class="btn btn--sm" type="submit">Search</button></form>
      ${q ? (results.length ? results.map(r => `<div class="result"><a ${r.project !== undefined ? `data-project="${r.project}"` : `data-go="${esc(r.url)}"`}>${esc(r.title)}</a><br>${esc(r.desc)}<small>${esc(r.url)}</small></div>`).join("")
          : `<p>No results on this site for <b>${esc(q)}</b>.</p>`) + (q ? `<p class="result"><a data-go="http://www.${esc(q.toLowerCase().replace(/[^a-z0-9-]/g, ""))}.com">Visit www.${esc(q.toLowerCase().replace(/[^a-z0-9-]/g, ""))}.com in the Time Machine</a><small>See how it looked back in the day</small></p>` : "") : `<p class="ie-page__muted">Tip: try searching for "projects" or "${esc(FIRST)}".</p>`}
    </div>`;
  },
  "404": url => `<div class="gc"><h1>404 Not Found</h1><p>The page <b>${esc(url)}</b> has moved to a new neighborhood.</p><p><a data-go="${HOME}">Go to the homepage</a></p></div>`,
  error: url => `<div class="ie-page">
      <h1>The page cannot be displayed</h1>
      <p>The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties, or it's 1998 and it doesn't exist yet.</p>
      <hr>
      <p>Please try the following:</p>
      <ul>
        <li>Click the <a data-nav="reload">Refresh</a> button, or try again later.</li>
        <li>Open the <a data-go="${HOME}">home page</a>, and then look for links to the information you want.</li>
        <li>Check your dial-up connection. Is someone on the phone?</li>
      </ul>
      <p class="ie-page__muted">Cannot find server or DNS Error<br>Chrome 98 &middot; ${esc(url)}</p>
    </div>`,
};
const PAGE_TITLES = { web: "Time Machine", newtab: "New Tab", home: `${NAME}'s Homepage`, about: "About Me", guestbook: "Guestbook", links: "Cool Links", search: "AltaVista Search", youtube: "YouTube", github: "GitHub", error: "Cannot find server", "404": "404 Not Found", blank: "about:blank" };

const CR_BOOKMARKS = () => [
  ["My Homepage", HOME, "page"],
  ["Guestbook", HOME + "guestbook.html", "page"],
  ["Cool Links", HOME + "links.html", "page"],
  ["YouTube", "http://www.youtube.com", "youtube"],
  ["GitHub", GITHUB_URL || "http://www.github.com", "github"],
  ["AltaVista", "http://www.altavista.com", "page"],
];
// Chrome toolbar glyphs (flat Material paths), kept local to the Chrome app
const CR_PATHS = {
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z",
  fwd: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  reload: "M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z",
  page: "M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm7 7V3.5L18.5 9z",
};
const crIco = (name, size = 20) => `<svg class="cr-svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${CR_PATHS[name]}"/></svg>`;
const crBmIcon = ic => CR_PATHS[ic] ? crIco(ic, 16) : icon(ic, 16);
const CR_TILES = [
  ["My Homepage", HOME, "about", "", "#1a73e8"],
  ["Google, 1998", "http://www.google.com", "chrome", "", "#4285f4"],
  ["Yahoo!", "http://www.yahoo.com", "chrome", "", "#720e9e"],
  ["Space Jam", "http://www.spacejam.com", "chrome", "", "#1a237e"],
  ["Apple", "http://www.apple.com", "chrome", "", "#5f6368"],
  ["Amazon", "http://www.amazon.com", "chrome", "", "#ff9900"],
  ["YouTube", "http://www.youtube.com", "youtube"],
  ["GitHub", "http://www.github.com", "github"],
  ["Discord", "", "discord", "discord"],
];
function openChrome(o = {}) {
  const had = WM.has("chrome");
  const w = WM.open("chrome", {
    title: "Chrome 98", icon: "chrome", w: 800, h: 600, from: o.from, status: ["Done"],
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      body.innerHTML = `
        <div class="cr-tabs"><div class="cr-tabs__list" role="tablist"></div><button type="button" class="cr-tabs__new" title="New Tab" aria-label="New Tab">${ui("plus", 18)}</button></div>
        <div class="cr-bar">
          <button type="button" class="cr-ico" data-nav="back" title="Back" aria-label="Back">${crIco("back")}</button>
          <button type="button" class="cr-ico" data-nav="fwd" title="Forward" aria-label="Forward">${crIco("fwd")}</button>
          <button type="button" class="cr-ico" data-nav="reload" title="Reload" aria-label="Reload">${crIco("reload")}</button>
          <form class="addressbar cr-omni">${ui("search", 16)}<input id="addr-chrome" class="addressbar__input" spellcheck="false" autocomplete="off" placeholder="Search or type a URL" aria-label="Address and search bar"></form>
          <label class="cr-year" title="Which year the Time Machine shows websites from. Type any website (like google.com) to see how it looked back in the day."><span>Year</span><select class="field">${Array.from({ length: 15 }, (_, i) => 1996 + i).map(y => `<option${y === store.get("crYear", 1998) ? " selected" : ""}>${y}</option>`).join("")}</select></label>
        </div>
        <div class="cr-bookmarks">${CR_BOOKMARKS().map(([label, url, ic]) => `<button type="button" data-go="${esc(url)}" title="${esc(url)}">${crBmIcon(ic)}<span>${esc(label)}</span></button>`).join("")}</div>
        <div class="browser__view sunken-box"><div class="browser__doc"></div></div>`;
      const input = $(".addressbar__input", body), doc = $(".browser__doc", body), view = $(".browser__view", body), list = $(".cr-tabs__list", body);
      const bBack = $('[data-nav="back"]', body), bFwd = $('[data-nav="fwd"]', body);
      const tabs = [];
      let active = null, tid = 0;
      const sync = () => { bBack.disabled = !active || active.idx <= 0; bFwd.disabled = !active || active.idx >= active.hist.length - 1; };
      const drawTabs = () => {
        list.innerHTML = tabs.map(t => `<div class="cr-tab${t === active ? " is-active" : ""}" data-tab="${t.id}" role="tab" title="${esc(t.title)}">${icon(t.icon || "chrome", 16)}<span>${esc(t.title)}</span><button type="button" data-close="${t.id}" aria-label="Close tab"><svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.4" fill="none"/></svg></button></div>`).join("");
      };
      const showTitle = () => win.setTitle(`${active.title} - Chrome 98`);
      // archived pages load inside an iframe: show progress until it finishes
      const watchFrame = () => {
        const f = $(".tm__frame", doc);
        if (!f) return;
        win.el.classList.add("is-loading");
        win.setStatus(["Contacting web.archive.org...", ""]);
        const done = () => { if (!f.isConnected) return; win.el.classList.remove("is-loading"); f.parentElement.classList.add("is-ready"); win.setStatus(["Done", ""]); };
        f.addEventListener("load", done);
        setTimeout(done, 20000);
      };
      const select = t => {
        if (active) active.scroll = view.scrollTop;
        active = t;
        doc.innerHTML = t.html;
        view.scrollTop = t.scroll || 0;
        watchFrame();
        input.value = t.hist[t.idx] === "chrome://newtab" ? "" : (t.hist[t.idx] || "");
        win.el.classList.toggle("is-loading", !!t.loading);
        sync(); drawTabs(); showTitle();
      };
      const load = (t, url) => {
        const my = t.token = (t.token || 0) + 1;
        t.loading = true;
        if (t === active) { input.value = url === "chrome://newtab" ? "" : url; win.setStatus([`Opening page ${url}...`]); win.el.classList.add("is-loading"); }
        setTimeout(() => {
          if (my !== t.token || !WM.has("chrome")) return;
          const page = routeOf(url);
          t.html = PAGES[page](url);
          t.title = PAGE_TITLES[page] || url;
          t.icon = page === "youtube" ? "youtube" : page === "github" ? "github" : "chrome";
          t.loading = false;
          t.scroll = 0;
          if (t === active) {
            doc.innerHTML = t.html;
            view.scrollTop = 0;
            win.el.classList.remove("is-loading");
            win.setStatus(["Done"]);
            watchFrame();
            showTitle();
            if (page === "newtab") { const q = $(".nt__search input", doc); if (q) q.focus(); }
          }
          drawTabs();
          if (page === "youtube") openApp("youtube");
          if (page === "github") openApp("github");
        }, reduceMotion() || url === "chrome://newtab" ? 0 : 250 + Math.random() * 350);
      };
      const navigate = (raw, t = active) => {
        const url = normUrl(raw);
        t.hist.splice(t.idx + 1);
        t.hist.push(url);
        t.idx = t.hist.length - 1;
        if (t === active) sync();
        load(t, url);
      };
      const newTab = (url, focus = true) => {
        const t = { id: ++tid, hist: [], idx: -1, title: "New Tab", html: "", scroll: 0 };
        tabs.push(t);
        if (focus || !active) select(t); else drawTabs();
        navigate(url || "chrome://newtab", t);
        return t;
      };
      const closeTab = t => {
        const i = tabs.indexOf(t);
        tabs.splice(i, 1);
        if (!tabs.length) { win.close(); return; }
        if (active === t) { active = null; select(tabs[Math.max(0, i - 1)]); } else drawTabs();
      };
      const nav = a => {
        const t = active;
        if (a === "back" && t.idx > 0) { t.idx--; sync(); load(t, t.hist[t.idx]); }
        else if (a === "fwd" && t.idx < t.hist.length - 1) { t.idx++; sync(); load(t, t.hist[t.idx]); }
        else if (a === "reload" && t.idx >= 0) load(t, t.hist[t.idx]);
        else if (a === "home") navigate(HOME);
        else if (a === "stop") { t.token++; t.loading = false; win.el.classList.remove("is-loading"); win.setStatus(["Stopped"]); }
      };
      win.navigate = url => navigate(url);
      win.newTab = newTab;
      win.nav = nav;

      list.addEventListener("click", e => {
        const c = e.target.closest("[data-close]");
        if (c) { e.stopPropagation(); closeTab(tabs.find(t => t.id === +c.dataset.close)); return; }
        const tb = e.target.closest("[data-tab]");
        if (tb) select(tabs.find(t => t.id === +tb.dataset.tab));
      });
      list.addEventListener("auxclick", e => { const tb = e.target.closest("[data-tab]"); if (tb && e.button === 1) closeTab(tabs.find(t => t.id === +tb.dataset.tab)); });
      $(".cr-tabs__new", body).addEventListener("click", () => newTab());
      $(".cr-year select", body).addEventListener("change", e => {
        store.set("crYear", +e.target.value);
        if (active && routeOf(active.hist[active.idx] || "") === "web") load(active, active.hist[active.idx]);
      });
      $(".addressbar", body).addEventListener("submit", e => { e.preventDefault(); navigate(input.value); });
      $$(".cr-bar [data-nav]", body).forEach(b => b.addEventListener("click", () => nav(b.dataset.nav)));
      $(".cr-bookmarks", body).addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) { if (e.ctrlKey || e.metaKey) newTab(b.dataset.go, false); else navigate(b.dataset.go); } });
      const follow = (e, background) => {
        const t = e.target.closest("[data-go],[data-app],[data-nav],[data-project]");
        if (!t) return false;
        e.preventDefault();
        if (t.dataset.go) { if (background) newTab(t.dataset.go, false); else navigate(t.dataset.go); }
        else if (t.dataset.app) openApp(t.dataset.app);
        else if (t.dataset.nav) nav(t.dataset.nav);
        else if (t.dataset.project !== undefined) openProject(+t.dataset.project);
        return true;
      };
      doc.addEventListener("click", e => follow(e, e.ctrlKey || e.metaKey));
      doc.addEventListener("auxclick", e => { if (e.button === 1) follow(e, true); });
      doc.addEventListener("submit", e => {
        const f = e.target.closest("form[data-form]");
        if (!f) return;
        e.preventDefault();
        if (f.dataset.form === "guestbook") {
          const msg = f.elements.msg.value.trim();
          if (!msg) { msgBox({ title: "Guestbook", icon: "warning", text: "Write a message first!" }); return; }
          const gb = store.get("guestbook", GUESTBOOK_SEED);
          gb.unshift({ name: f.elements.name.value.trim() || "Anonymous", msg, date: fmtDate() });
          store.set("guestbook", gb.slice(0, 50));
          load(active, active.hist[active.idx]);
        } else if (f.dataset.form === "search") {
          const q = f.elements.q.value.trim();
          if (q) navigate(/^(https?:\/\/|www\.)|\.(com|org|net|io|app|dev)(\/|$)/i.test(q) ? q : `http://www.altavista.com/search?q=${encodeURIComponent(q)}`);
        }
      });
      doc.addEventListener("pointerover", e => {
        const a = e.target.closest("[data-go], a[href]");
        if (a && !win.el.classList.contains("is-loading")) win.setStatus([a.dataset.go || a.href]);
      });
      doc.addEventListener("pointerout", e => {
        if (e.target.closest("[data-go], a[href]") && !win.el.classList.contains("is-loading")) win.setStatus(["Done"]);
      });
      newTab(o.url || "chrome://newtab");
    },
  });
  if (had && o.url && w.newTab) w.newTab(o.url);
}

/* ---------- Résumé ---------- */
function openResume(o = {}) {
  if (!RESUME) { msgBox({ title: "Resume", icon: "info", text: "Add your resume to content.js (resume: \"images/resume.pdf\") and it will open here." }); return; }
  WM.open("resume", {
    title: "Resume.pdf", icon: "resume", w: 640, h: 520, from: o.from, status: [RESUME],
    render(body) {
      body.classList.add("body--flush", "body--column");
      body.innerHTML = `
        <div class="toolbar">
          <a class="tool-btn tool-btn--row" href="${esc(RESUME)}" download>${icon("resume", 16)}<span>Download</span></a>
          <a class="tool-btn tool-btn--row" href="${esc(RESUME)}" target="_blank" rel="noopener">${icon("chrome", 16)}<span>Open in new tab</span></a>
        </div>
        <div class="resume-frame"><iframe src="${esc(RESUME)}" title="Resume"></iframe></div>`;
    },
  });
}

/* ---------- YouTube ---------- */
// Accepts a full YouTube link (watch, youtu.be, shorts, embed, live) or a bare 11-character ID.
function ytParseId(input) {
  const t = String(input || "").trim();
  if (/^[\w-]{11}$/.test(t)) return t;
  const m = t.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live|v)\/)([\w-]{11})/);
  return m ? m[1] : "";
}
function ytColor(name) { let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) % 360; return `hsl(${h},55%,42%)`; }
const ytThumb = id => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;

// Flat Material glyphs (outlined where YouTube uses outlines). Falls back to UI_PATHS.
const YT_ICONS = {
  menu: "M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z",
  arrow: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z",
  trend: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  subsO: "M20 8H4V6h16zm-2-6H6v2h12zm4 10v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2zm-2 0H4v8h16zm-10 1.5v5l5-2.5z",
  history: "M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z",
  later: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7z",
  list: "M4 10h12v2H4zm0-4h12v2H4zm0 8h8v2H4zm10 0v6l5-3z",
  listAdd: "M14 10H2v2h12zm0-4H2v2h12zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2zM2 16h8v-2H2z",
  likeO: "M9 21h9c.8 0 1.5-.5 1.8-1.2l3-7c.1-.2.2-.5.2-.7v-2c0-1.1-.9-2-2-2h-6.3l.9-4.6v-.3c0-.4-.2-.8-.4-1.1L14.2 1 7.6 7.6C7.2 8 7 8.5 7 9v10c0 1.1.9 2 2 2zM9 9l4.3-4.3L12 10h9v2l-3 7H9zM1 9h4v12H1z",
  more: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  theater: "M19 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 10H5V8h14z",
  speed: "M20.4 8.6l-1.2 1.9a8 8 0 0 1-.2 7.5H5.1A8 8 0 0 1 15.6 6.9l1.8-1.3A10 10 0 0 0 3.4 19a2 2 0 0 0 1.7 1h13.8a2 2 0 0 0 1.8-1 10 10 0 0 0-.3-10.4zm-9.8 6.8a2 2 0 0 0 2.8 0l5.7-8.5-8.5 5.7a2 2 0 0 0 0 2.8z",
  moon: "M12 3a9 9 0 1 0 9 9c0-.5 0-.9-.1-1.4a5.4 5.4 0 0 1-4.4 2.3 5.4 5.4 0 0 1-3.1-9.8C12.9 3 12.5 3 12 3z",
  keys: "M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-9 3h2v2h-2zm0 3h2v2h-2zM8 8h2v2H8zm0 3h2v2H8zm-1 2H5v-2h2zm0-3H5V8h2zm9 7H8v-2h8zm0-4h-2v-2h2zm0-3h-2V8h2zm3 3h-2v-2h2zm0-3h-2V8h2z",
  sort: "M3 18h6v-2H3zM3 6v2h18V6zm0 7h12v-2H3z",
  shuffle: "M10.6 9.2 5.4 4 4 5.4l5.2 5.2zM14.5 4l2 2L4 18.6 5.4 20 18 7.5l2 2V4zm.3 9.4-1.4 1.4 3.1 3.1-2 2H20v-5.5l-2 2z",
  game: "M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3zm4.5 2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
  news: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-5 14H7v-2h7zm3-4H7v-2h10zm0-4H7V7h10z",
  trophy: "M19 5h-2V3H7v2H5a2 2 0 0 0-2 2v1c0 2.6 1.9 4.6 4.4 4.9a5 5 0 0 0 3.6 3V19H7v2h10v-2h-4v-3.1a5 5 0 0 0 3.6-3C19.1 12.6 21 10.6 21 8V7a2 2 0 0 0-2-2zM5 8V7h2v3.8C5.8 10.4 5 9.3 5 8zm14 0c0 1.3-.8 2.4-2 2.8V7h2z",
  bulb: "M9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9zm3-19a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3c1.8-1.3 3-3.4 3-5.7a7 7 0 0 0-7-7z",
  film: "M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4z",
  ext: "M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z",
  acct: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM7.1 18.3c.4-.9 3-1.8 4.9-1.8s4.5.9 4.9 1.8A7.9 7.9 0 0 1 12 20c-1.9 0-3.6-.6-4.9-1.7zm11.3-1.5C17 15.1 13.5 14.5 12 14.5s-5 .6-6.4 2.3A8 8 0 0 1 4 12a8 8 0 1 1 16 0c0 1.8-.6 3.5-1.6 4.8zM12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
};
const ytI = (n, s = 20) => `<svg class="ui-i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${YT_ICONS[n] || UI_PATHS[n] || ""}"/></svg>`;

// Explore / Trending: [key, label, YouTube videoCategoryId, icon, library categories that match when offline]
const YT_EXPLORE = [
  ["now", "Now", 0, "trend", null],
  ["music", "Music", 10, "note", ["Music"]],
  ["gaming", "Gaming", 20, "game", ["Gaming"]],
  ["movies", "Movies", 1, "film", ["Animation", "Classics"]],
  ["learning", "Learning", 27, "bulb", ["Education"]],
  ["sports", "Sports", 17, "trophy", []],
  ["news", "News", 25, "news", []],
];
const YT_CAT = { 1: "Film & Animation", 2: "Autos & Vehicles", 10: "Music", 15: "Pets & Animals", 17: "Sports", 19: "Travel & Events", 20: "Gaming", 22: "People & Blogs", 23: "Comedy", 24: "Entertainment", 25: "News & Politics", 26: "Howto & Style", 27: "Education", 28: "Science & Technology", 29: "Nonprofits & Activism" };
const YT_CATID = { Animation: 1, Music: 10, Sports: 17, Gaming: 20, Vlogs: 22, Comedy: 23, Entertainment: 24, News: 25, Education: 27, Learning: 27, Science: 28 };

// Number / date formatting the way YouTube prints it (1.2M views, 3 days ago, 12:34).
function ytNum(n) {
  n = +n;
  if (!isFinite(n) || n < 0) return "";
  for (const [d, s] of [[1e9, "B"], [1e6, "M"], [1e3, "K"]]) if (n >= d) { const v = n / d; return (v < 10 ? Math.floor(v * 10 + 1e-9) / 10 : Math.floor(v)) + s; }
  return String(Math.floor(n));
}
const ytViews = n => n == null ? "" : n === 1 ? "1 view" : `${ytNum(n)} views`;
function ytAgo(t) {
  const ms = typeof t === "number" ? t : Date.parse(t);
  if (!ms) return "";
  const s = Math.max(0, (Date.now() - ms) / 1000);
  for (const [d, u] of [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"]]) if (s >= d) { const n = Math.floor(s / d); return `${n} ${u}${n === 1 ? "" : "s"} ago`; }
  return "Just now";
}
function ytDur(sec) {
  sec = Math.round(+sec);
  if (!(sec >= 0)) return "";
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}
function ytIso(d) {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(d || "");
  return m ? (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0) : 0;
}
// Description text -> safe HTML with links, #hashtags and clickable 1:23 timestamps.
function ytLinkify(text) {
  text = String(text || "");
  const re = /(https?:\/\/[^\s<]+)|(\b(?:\d{1,2}:)?[0-5]?\d:[0-5]\d\b)|(#[\p{L}\p{N}_]+)/gu;
  let out = "", last = 0;
  for (const m of text.matchAll(re)) {
    out += esc(text.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[1]) { const u = m[1].replace(/[).,;!?]+$/, ""); out += `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a>${esc(m[1].slice(u.length))}`; }
    else if (m[2]) { const p = m[2].split(":").map(Number); out += `<button type="button" class="yt2__ts" data-seek="${p.reduce((a, b) => a * 60 + b, 0)}">${esc(m[2])}</button>`; }
    else out += `<span class="yt2__tag">${esc(m[3])}</span>`;
  }
  return (out + esc(text.slice(last))).replace(/\n/g, "<br>");
}

// Optional YouTube Data API v3 (set CONTENT.youtubeApiKey). Everything here throws on failure and the app
// falls back to the built-in library, so a missing key, a bad key or no network never shows an error.
const ytApi = {
  base: "https://www.googleapis.com/youtube/v3/",
  cache: new Map(),
  failedAt: 0,
  key() { return typeof C.youtubeApiKey === "string" ? C.youtubeApiKey.trim() : ""; },
  get on() { return !!this.key() && Date.now() - this.failedAt > 120000; },
  region() { const r = ((navigator.language || "").split("-")[1] || "").toUpperCase(); return /^[A-Z]{2}$/.test(r) ? r : ""; },
  call(ep, params) {
    const q = new URLSearchParams(params).toString(), ck = ep + "?" + q;
    if (this.cache.has(ck)) return this.cache.get(ck);
    const p = fetch(`${this.base}${ep}?${q}&key=${encodeURIComponent(this.key())}`).then(r => r.ok ? r.json() : r.json().catch(() => ({})).then(j => {
      const er = (j && j.error) || {}, e = new Error("YouTube API " + r.status);
      e.status = r.status; e.reason = ((er.errors && er.errors[0] && er.errors[0].reason) || "") + " " + (er.message || "");
      throw e;
    }));
    this.cache.set(ck, p);
    // network trouble, a bad key or an exhausted quota pause the API for two minutes; 404/commentsDisabled do not
    p.catch(e => { this.cache.delete(ck); if (!e.status || e.status === 401 || /quota|keyInvalid|api key|referer|accessNotConfigured|dailyLimit|rateLimit/i.test(e.reason || "")) this.failedAt = Date.now(); });
    return p;
  },
  vid(it) {
    const s = it.snippet || {}, st = it.statistics || {}, cd = it.contentDetails || {};
    return {
      id: typeof it.id === "string" ? it.id : "", title: s.title || "Untitled", channel: s.channelTitle || "YouTube", channelId: s.channelId || "",
      cat: YT_CAT[s.categoryId] || "Videos", desc: s.description || "", date: s.publishedAt || "",
      views: st.viewCount != null ? +st.viewCount : null, likes: st.likeCount != null ? +st.likeCount : null,
      commentCount: st.commentCount != null ? +st.commentCount : null, dur: ytIso(cd.duration), live: s.liveBroadcastContent === "live",
      embeddable: !it.status || it.status.embeddable !== false, api: true,
    };
  },
  async videos(ids) {
    ids = ids.filter(Boolean).slice(0, 50);
    if (!ids.length) return [];
    const j = await this.call("videos", { part: "snippet,contentDetails,statistics,status", id: ids.join(","), maxResults: 50 });
    const map = new Map((j.items || []).map(it => [it.id, this.vid(it)]));
    return ids.map(id => map.get(id)).filter(v => v && v.embeddable);
  },
  async search(q) {
    const j = await this.call("search", { part: "snippet", type: "video", videoEmbeddable: "true", maxResults: 20, safeSearch: "moderate", q });
    return this.videos((j.items || []).map(i => i.id && i.id.videoId));
  },
  async popular(catId) {
    const p = { part: "snippet,contentDetails,statistics,status", chart: "mostPopular", maxResults: 24 };
    if (catId) p.videoCategoryId = String(catId);
    if (this.region()) p.regionCode = this.region();
    const j = await this.call("videos", p);
    return (j.items || []).map(it => this.vid(it)).filter(v => v.embeddable);
  },
  async related(v) {
    const q = v.title.replace(/[|()[\]:\-–—]/g, " ").split(/\s+/).filter(Boolean).slice(0, 6).join(" ");
    return (await this.search(q)).filter(x => x.id !== v.id);
  },
  async findChannel(name) {
    const j = await this.call("search", { part: "snippet", type: "channel", maxResults: 1, q: name });
    const it = (j.items || [])[0];
    return it && it.snippet && it.snippet.channelId || (it && it.id && it.id.channelId) || "";
  },
  async channel(id) {
    const j = await this.call("channels", { part: "snippet,statistics,contentDetails", id });
    const it = (j.items || [])[0];
    if (!it) throw new Error("no channel");
    const s = it.snippet || {}, st = it.statistics || {};
    return {
      id, name: s.title || "", handle: s.customUrl || "", desc: s.description || "", joined: s.publishedAt || "",
      thumb: s.thumbnails && ((s.thumbnails.medium || s.thumbnails.default || {}).url) || "",
      subs: st.hiddenSubscriberCount ? null : st.subscriberCount != null ? +st.subscriberCount : null,
      count: st.videoCount != null ? +st.videoCount : null, views: st.viewCount != null ? +st.viewCount : null,
      uploads: (it.contentDetails && it.contentDetails.relatedPlaylists && it.contentDetails.relatedPlaylists.uploads) || "",
    };
  },
  async uploads(playlistId) {
    if (!playlistId) return [];
    const j = await this.call("playlistItems", { part: "contentDetails", playlistId, maxResults: 24 });
    return this.videos((j.items || []).map(i => i.contentDetails && i.contentDetails.videoId));
  },
  async comments(videoId, order) {
    const j = await this.call("commentThreads", { part: "snippet", videoId, order: order === "time" ? "time" : "relevance", maxResults: 20, textFormat: "plainText" });
    return (j.items || []).map(it => {
      const c = (it.snippet && it.snippet.topLevelComment && it.snippet.topLevelComment.snippet) || {};
      return { key: "api:" + it.id, name: String(c.authorDisplayName || "").replace(/^@/, ""), avatar: c.authorProfileImageUrl || "", t: c.textDisplay || c.textOriginal || "", likes: +c.likeCount || 0, ts: Date.parse(c.publishedAt) || 0, api: true };
    });
  },
};
// Uploads/exports for the extra YouTube data (history, playlists...). exportBackup/importBackup below only know the original keys.
const YT_EXTRA_KEYS = ["ytHist", "ytWL", "ytPL", "ytCL", "ytMeta"];
function ytExport() {
  const data = { app: "w98-portfolio", saved: new Date().toISOString() };
  BACKUP_KEYS.forEach(k => { data[k] = store.get(k, k === "ytComments" ? {} : []); });
  YT_EXTRA_KEYS.forEach(k => { data[k] = store.get(k, k === "ytMeta" ? {} : []); });
  downloadBlob("portfolio-media-backup.json", new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
}
function ytImportExtra(file) {
  return file.text().then(t => {
    const d = JSON.parse(t);
    if (!d || d.app !== "w98-portfolio") return;
    const arr = k => Array.isArray(d[k]) ? d[k].filter(Boolean) : [];
    const pl = store.get("ytPL", []), seen = new Set(pl.map(p => p.id));
    arr("ytPL").forEach(p => { if (p.id && !seen.has(p.id) && Array.isArray(p.ids)) pl.push(p); });
    store.set("ytPL", pl);
    store.set("ytWL", Array.from(new Set(store.get("ytWL", []).concat(arr("ytWL").filter(x => typeof x === "string")))));
    store.set("ytCL", Array.from(new Set(store.get("ytCL", []).concat(arr("ytCL").filter(x => typeof x === "string")))));
    const h = store.get("ytHist", []), hs = new Set(h.map(x => x.id));
    store.set("ytHist", h.concat(arr("ytHist").filter(x => x.id && !hs.has(x.id))).sort((a, b) => b.ts - a.ts).slice(0, 300));
    if (d.ytMeta && typeof d.ytMeta === "object") store.set("ytMeta", Object.assign({}, d.ytMeta, store.get("ytMeta", {})));
  }).catch(() => {});
}
function openYouTube(o = {}) {
  const w = WM.open("youtube", {
    title: "YouTube", icon: "youtube", w: 940, h: 610, from: o.from,
    render(body, win) {
      body.classList.add("body--flush");
      // videos posted from "Your channel" live in localStorage and show up under the portfolio owner's name
      const VIDEOS = BASE_VIDEOS.concat(store.get("ytUploads", []).map(u => ({ id: u.id, title: u.title, cat: u.cat || "Videos", desc: u.desc || "", ts: u.ts, channel: NAME, mine: true })));
      const pool = new Map();           // every video seen this session (library + API results), by id
      const lib = () => { const m = new Map(); VIDEOS.forEach(v => { const p = m.get(v.id); if (!p || (v.mine && !p.mine)) m.set(v.id, v); }); return Array.from(m.values()); };
      const syncPool = () => lib().forEach(v => pool.set(v.id, v));
      syncPool();
      const META = store.get("ytMeta", {}), DUR = store.get("ytDur", {}), PROG = store.get("ytProg", {}), CHAN = store.get("ytChan", {});
      const cats = () => {
        const c = Array.from(new Set(lib().map(v => v.cat)));
        if (ytApi.on) ["Music", "Gaming", "Sports", "News", "Learning"].forEach(x => { if (!c.some(y => y.toLowerCase() === x.toLowerCase())) c.push(x); });
        return c;
      };
      const channels = () => { const c = Array.from(new Set(lib().map(v => v.channel))).filter(c => c !== NAME); return [NAME, ...c]; };

      /* ---- persisted state ---- */
      const subs = () => store.get("ytSubs", []);
      const likes = () => store.get("ytLikes", []);
      const wl = () => store.get("ytWL", []);
      const pls = () => store.get("ytPL", []);
      const hist = () => store.get("ytHist", []);
      const cmts = id => (store.get("ytComments", {})[id] || []);
      const toggle = (key, val) => { const a = store.get(key, []); const i = a.indexOf(val); if (i >= 0) a.splice(i, 1); else a.push(val); store.set(key, a); return i < 0; };
      let autoplay = store.get("ytAuto", true), theater = store.get("ytTheater", false), speed = +store.get("ytSpeed", 1) || 1, dark = store.get("ytDark", false);
      let sideMode = store.get("ytSide", "");   // "" = full, "mini" = icon rail
      const origin = location.origin && location.origin !== "null" ? `&origin=${encodeURIComponent(location.origin)}` : "";

      /* ---- video lookup ---- */
      const ensure = v => {   // merge fresh API data into the copy we already hold
        if (!v || !v.id) return v;
        const cur = pool.get(v.id);
        if (!cur) { pool.set(v.id, v); return v; }
        if (cur !== v) {
          ["views", "likes", "commentCount", "date", "dur", "channelId", "live"].forEach(k => { if ((cur[k] == null || cur[k] === "" || cur[k] === 0) && v[k] != null && v[k] !== "") cur[k] = v[k]; });
          if (!cur.desc && v.desc) cur.desc = v.desc;
        }
        return cur;
      };
      const mergeList = list => list.map(ensure);
      const vidOf = id => {
        let v = pool.get(id);
        if (v) return v;
        const m = META[id];
        v = m ? { id, title: m.t || "Video", channel: m.c || "YouTube", channelId: m.ci || "", cat: m.k || "Videos", dur: m.d || 0, fromMeta: true } : { id, title: "Video unavailable", channel: "YouTube", cat: "Videos", gone: true };
        if (m) pool.set(id, v);
        return v;
      };
      const remember = v => {   // keep enough about non-library videos to list them offline later (history, playlists, likes)
        if (!v || !v.id || v.gone || lib().some(x => x.id === v.id)) return;
        META[v.id] = { t: v.title, c: v.channel, ci: v.channelId || "", k: v.cat || "", d: v.dur || 0 };
        const ks = Object.keys(META);
        if (ks.length > 400) delete META[ks[0]];
        store.set("ytMeta", META);
      };
      const durOf = v => v.dur || DUR[v.id] || 0;
      const progOf = id => { const p = PROG[id]; return p && p[1] > 0 && p[0] >= 5 ? Math.min(100, Math.round(p[0] / p[1] * 100)) : 0; };
      const cid = name => (CHAN[name] && CHAN[name].id) || "";
      const cidAttr = (name, v) => { const c = (v && v.channelId) || cid(name); return c ? ` data-cid="${esc(c)}"` : ""; };

      /* ---- shell ---- */
      body.innerHTML = `
        <div class="yt2${dark ? " yt2--dark" : ""}">
          <header class="yt2__head">
            <button type="button" class="yt2__burger" data-burger title="Guide" aria-label="Guide">${ytI("menu", 24)}</button>
            <button type="button" class="yt2__back" title="Back" aria-label="Back" disabled>${ytI("arrow", 24)}</button>
            <button type="button" class="yt2__logo" data-go="home" title="YouTube Home"><span class="yt2__play"></span>YouTube</button>
            <form class="yt2__search" role="search" autocomplete="off">
              <input name="q" placeholder="Search" aria-label="Search YouTube" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="ytSug">
              <button type="submit" aria-label="Search">${ytI("search", 24)}</button>
              <div class="yt2__sug" id="ytSug" role="listbox" hidden></div>
            </form>
            <button type="button" class="yt2__up" data-go="upload" title="Create">${ytI("create", 24)}<span>Create</span></button>
            <button type="button" class="yt2__me" data-me title="${esc(NAME)}" aria-label="Account menu" style="background:${ytColor(NAME)}">${esc(FIRST[0] || "?")}</button>
          </header>
          <div class="yt2__wrap">
            <nav class="yt2__side" aria-label="Guide"></nav>
            <main class="yt2__main"></main>
          </div>
          <div class="yt2__scrim" data-scrim></div>
        </div>`;
      const root = $(".yt2", body), main = $(".yt2__main", body), back = $(".yt2__back", body), side = $(".yt2__side", body);
      const qInput = $(".yt2__search input", body), sug = $(".yt2__sug", body);
      // thumbnails that fail to load keep their grey box but lose the broken-image icon (error doesn't bubble, so capture it)
      body.addEventListener("error", e => { if (e.target && e.target.tagName === "IMG") e.target.classList.add("is-broken"); }, true);
      body.addEventListener("load", e => { if (e.target && e.target.tagName === "IMG") e.target.classList.add("is-loaded"); }, true);
      const settle = () => $$(".yt2__thumb img, img.yt2__av", body).forEach(i => { if (i.complete && i.naturalWidth) i.classList.add("is-loaded"); });
      const timers = [];
      const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

      /* ---- markup helpers ---- */
      const avHtml = (name, big) => { const c = CHAN[name]; return c && c.thumb ? `<img class="yt2__av${big ? " yt2__av--big" : ""}" src="${esc(c.thumb)}" alt="">` : `<i class="yt2__av${big ? " yt2__av--big" : ""}" style="background:${ytColor(name)}">${esc((name || "?")[0].toUpperCase())}</i>`; };
      const metaLine = v => {
        const a = [];
        if (v.views != null) a.push(ytViews(v.views));
        const t = v.date || v.ts;
        if (t) a.push(ytAgo(t));
        if (!a.length && v.cat) a.push(v.cat);
        return a.join(" • ");
      };
      const thumb = v => {
        const d = durOf(v), p = progOf(v.id);
        return `<span class="yt2__thumb"><img src="${esc(ytThumb(v.id))}" alt="" loading="lazy" draggable="false">${v.live ? `<b class="yt2__dur yt2__dur--live">LIVE</b>` : d ? `<b class="yt2__dur">${ytDur(d)}</b>` : ""}${p ? `<i class="yt2__prog"><em style="width:${p}%"></em></i>` : ""}</span>`;
      };
      const chBtn = v => `<button type="button" class="yt2__cn" data-channel="${esc(v.channel)}"${cidAttr(v.channel, v)}>${esc(v.channel)}</button>`;
      const card = v => `
        <div class="yt2__card">
          <button type="button" class="yt2__tl" data-v="${esc(v.id)}" tabindex="-1" aria-hidden="true">${thumb(v)}</button>
          <div class="yt2__info">
            <button type="button" class="yt2__avb" data-channel="${esc(v.channel)}"${cidAttr(v.channel, v)} tabindex="-1" aria-hidden="true">${avHtml(v.channel)}</button>
            <span class="yt2__txt">
              <button type="button" class="yt2__tt" data-v="${esc(v.id)}"><strong>${esc(v.title)}</strong></button>
              <small>${chBtn(v)}</small>
              <small>${esc(metaLine(v))}</small>
            </span>
            <button type="button" class="yt2__more" data-more="${esc(v.id)}" aria-label="Action menu" title="Action menu">${ytI("more", 20)}</button>
          </div>
        </div>`;
      const row = (v, op = {}) => `
        <div class="yt2__row${op.cls ? " " + op.cls : ""}">
          ${op.idx != null ? `<span class="yt2__idx">${op.cur ? ytI("play", 16) : op.idx}</span>` : ""}
          <button type="button" class="yt2__tl" data-v="${esc(v.id)}" tabindex="-1" aria-hidden="true">${thumb(v)}</button>
          <span class="yt2__txt">
            <button type="button" class="yt2__tt" data-v="${esc(v.id)}"><strong>${esc(v.title)}</strong></button>
            <small>${chBtn(v)}</small>
            <small>${esc(metaLine(v))}</small>
            ${op.desc && v.desc ? `<small class="yt2__snip">${esc(v.desc.replace(/\s+/g, " ").slice(0, 150))}</small>` : ""}
          </span>
          ${op.rm === "hist" ? `<button type="button" class="yt2__more" data-rmhist="${esc(v.id)}" aria-label="Remove from watch history" title="Remove from watch history">${ytI("close", 20)}</button>`
            : op.rm === "pl" ? `<button type="button" class="yt2__more" data-plrm="${esc(v.id)}" aria-label="Remove from playlist" title="Remove from playlist">${ytI("close", 20)}</button>`
            : `<button type="button" class="yt2__more" data-more="${esc(v.id)}" aria-label="Action menu" title="Action menu">${ytI("more", 20)}</button>`}
        </div>`;
      const grid = list => list.length ? `<div class="yt2__grid">${list.map(card).join("")}</div>` : "";
      const chipsHtml = (items, cur, attr) => `<div class="yt2__chips">${items.map(([k, label]) => `<button type="button" class="yt2__chip${k === cur ? " is-on" : ""}" ${attr}="${esc(k)}">${esc(label)}</button>`).join("")}</div>`;
      const subBtn = (ch, c) => { const on = subs().includes(ch); return `<button type="button" class="yt2__sub${on ? " is-on" : ""}" data-sub="${esc(ch)}"${c ? ` data-cid="${esc(c)}"` : ""}>${on ? "Subscribed" : "Subscribe"}</button>`; };
      const empty = (t, sub) => `<div class="yt2__empty">${t ? `<b>${esc(t)}</b>` : ""}${sub || ""}</div>`;
      const chRow = c => { const n = lib().filter(v => v.channel === c).length; return `<div class="yt2__chrow"><button type="button" class="yt2__chlink" data-channel="${esc(c)}"${cidAttr(c)}>${avHtml(c, true)}<span><b>${esc(c)}</b><small>${n ? `${n} video${n === 1 ? "" : "s"}` : "Channel"}</small></span></button>${subBtn(c, cid(c))}</div>`; };
      // skeletons: flat grey blocks that pulse until the data arrives
      const skCard = `<div class="yt2__card is-skel" aria-hidden="true"><div class="yt2__thumb"></div><div class="yt2__info"><i class="yt2__av"></i><span class="yt2__txt"><span class="yt2__sk" style="width:92%"></span><span class="yt2__sk" style="width:62%"></span></span></div></div>`;
      const skRow = `<div class="yt2__row is-skel" aria-hidden="true"><span class="yt2__thumb"></span><span class="yt2__txt"><span class="yt2__sk" style="width:90%"></span><span class="yt2__sk" style="width:55%"></span><span class="yt2__sk" style="width:35%"></span></span></div>`;
      const skeleton = page => page === "search" || page === "trending" ? `<div class="yt2__rows yt2__rows--wide">${skRow.repeat(5)}</div>`
        : page === "channel" ? `<div class="yt2__banner is-skel"></div><div class="yt2__grid">${skCard.repeat(6)}</div>`
        : `<div class="yt2__chips is-skel">${`<span class="yt2__chip"></span>`.repeat(6)}</div><div class="yt2__grid">${skCard.repeat(9)}</div>`;
      const dayLabel = ts => {
        const d = new Date(ts), t = new Date(), day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(), diff = Math.round((day(t) - day(d)) / 864e5);
        return diff <= 0 ? "Today" : diff === 1 ? "Yesterday" : diff < 7 ? d.toLocaleDateString(undefined, { weekday: "long" }) : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() === t.getFullYear() ? undefined : "numeric" });
      };
      const blend = (loc, api) => {
        const ids = new Set(loc.map(v => v.id)), a = api.filter(v => !ids.has(v.id)), out = [];
        let li = 0;
        for (let i = 0; i < a.length || li < loc.length; i++) { if (i % 4 === 0 && li < loc.length) out.push(loc[li++]); if (i < a.length) out.push(a[i]); }
        return out;
      };
      const shuffled = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

      /* ---- playlists ---- */
      const plInfo = id => {
        if (id === "WL") return { id, name: "Watch later", ids: wl(), sys: true };
        if (id === "LL") return { id, name: "Liked videos", ids: likes().slice().reverse(), sys: true };
        const p = pls().find(x => x.id === id);
        return p ? { id: p.id, name: p.name, ids: p.ids.slice(), upd: p.upd || p.ts, sys: false } : null;
      };
      const plAdd = (listId, id, on) => {
        if (listId === "WL") { const a = wl().filter(x => x !== id); if (on) a.unshift(id); store.set("ytWL", a); }
        else {
          const a = pls(), p = a.find(x => x.id === listId);
          if (!p) return;
          p.ids = p.ids.filter(x => x !== id);
          if (on) p.ids.push(id);
          p.upd = Date.now();
          store.set("ytPL", a);
        }
        if (on) remember(vidOf(id));
      };
      const plNew = (name, firstId) => {
        const p = { id: "pl" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), name: name.trim().slice(0, 150) || "Untitled playlist", ids: firstId ? [firstId] : [], ts: Date.now(), upd: Date.now() };
        store.set("ytPL", pls().concat(p));
        if (firstId) remember(vidOf(firstId));
        return p;
      };
      const pushHist = v => {
        remember(v);
        if (store.get("ytHistOff", false)) return;
        store.set("ytHist", [{ id: v.id, ts: Date.now() }].concat(hist().filter(x => x.id !== v.id)).slice(0, 300));
      };
      const pushSearch = q => store.set("ytSearches", [q].concat(store.get("ytSearches", []).filter(x => x.toLowerCase() !== q.toLowerCase())).slice(0, 20));

      /* ---- navigation ---- */
      const stack = [];
      let tok = 0, upnext = [], nextAll = [], nextFilter = "all";
      const apiComments = {};
      const pl = { id: "", t: 0, d: 0, state: -1, rate: 1, vol: 100, muted: false, got: false, saved: 0, spd: false, endedFor: "" };
      const navKey = s => {
        if (s.page === "playlist") return s.id === "WL" ? "later" : s.id === "LL" ? "liked" : "playlists";
        if (s.page === "channel") return s.name === NAME ? "mine" : "";
        if (s.page === "trending" && s.k && s.k !== "now") return "ex:" + s.k;
        return s.page;
      };
      const isMini = () => sideMode === "mini" && !root.classList.contains("is-narrow");
      const drawSide = () => {
        const s = stack[stack.length - 1] || {}, cur = navKey(s);
        const nb = (key, label, off, on, attrs) => `<button type="button" class="${key === cur ? "is-on" : ""}" ${attrs}>${ytI(key === cur ? on : off, 24)}<span>${label}</span></button>`;
        const home = nb("home", "Home", "homeO", "home", 'data-go="home"'), trend = nb("trending", "Trending", "trend", "trend", 'data-go="trending"'), sb = nb("subs", "Subscriptions", "subsO", "subs", 'data-go="subs"');
        const hi = nb("history", "History", "history", "history", 'data-go="history"'), pp = nb("playlists", "Playlists", "list", "list", 'data-go="playlists"');
        root.classList.toggle("is-mini", isMini());
        if (isMini()) { side.innerHTML = home + trend + sb + hi + pp; return; }
        const sl = subs(), list = sl.length ? sl : channels().filter(c => c !== NAME), present = new Set(lib().map(v => v.cat));
        const ex = YT_EXPLORE.filter(x => x[0] !== "now" && (ytApi.on || (x[4] || []).some(c => present.has(c))));
        side.innerHTML = `${home}${trend}${sb}<hr>
          <p>You ${ytI("fwd", 16)}</p>${hi}${pp}${nb("mine", "Your channel", "acct", "acct", `data-channel="${esc(NAME)}"`)}${nb("later", "Watch later", "later", "later", 'data-go="playlist" data-id="WL"')}${nb("liked", "Liked videos", "likeO", "like", 'data-go="playlist" data-id="LL"')}<hr>
          <p>${sl.length ? "Subscriptions" : "Channels"}</p>
          ${list.map(c => `<button type="button" class="${s.page === "channel" && s.name === c ? "is-on" : ""}" data-channel="${esc(c)}"${cidAttr(c)}>${avHtml(c)}<span>${esc(c)}</span></button>`).join("")}
          ${ex.length ? `<hr><p>Explore</p>${ex.map(x => nb("ex:" + x[0], x[1], x[3], x[3], `data-go="trending" data-k="${x[0]}"`)).join("")}` : ""}
          <hr><button type="button" data-pa="keys">${ytI("keys", 24)}<span>Keyboard shortcuts</span></button>`;
      };

      /* ---- player ---- */
      const cmd = (func, args = []) => {
        const f = $(".yt2__player iframe", main);
        if (f && f.contentWindow) try { f.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*"); } catch (e) {}
      };
      const saveProg = force => {
        if (!pl.id || !(pl.d > 0)) return;
        if (!force && Date.now() - pl.saved < 5000) return;
        pl.saved = Date.now();
        if (pl.state === 0 || pl.t >= pl.d - 8) delete PROG[pl.id];
        else if (pl.t >= 5) { PROG[pl.id] = [Math.floor(pl.t), Math.floor(pl.d)]; const k = Object.keys(PROG); if (k.length > 300) delete PROG[k[0]]; }
        else return;
        store.set("ytProg", PROG);
      };
      const mountPlayer = v => {
        const box = $(".yt2__player", main);
        if (!box) return;
        const p = PROG[v.id], start = p && p[0] > 10 && p[1] && p[0] < p[1] - 10 ? p[0] : 0;
        Object.assign(pl, { id: v.id, t: start, d: 0, state: -1, rate: 1, got: false, saved: Date.now(), spd: false, endedFor: "" });
        box.classList.add("is-loading");
        box.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(v.id)}?autoplay=1&rel=0&playsinline=1&enablejsapi=1${start ? "&start=" + start : ""}${origin}" title="${esc(v.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
        const ifr = $("iframe", box);
        const listen = () => { try { ifr.contentWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*"); } catch (e) {} };
        ifr.addEventListener("load", () => { box.classList.remove("is-loading"); listen(); later(() => { if (!pl.got) listen(); }, 700); later(() => { if (!pl.got) listen(); }, 2500); });
      };
      const leaveWatch = () => { if (pl.id) { saveProg(true); pl.id = ""; } };
      const seek = d => { if (!pl.id) return; const t = Math.max(0, Math.min(pl.d || 1e9, pl.t + d)); pl.t = t; cmd("seekTo", [t, true]); };
      const seekTo = t => { if (!pl.id) return; pl.t = t; cmd("seekTo", [t, true]); };
      const playPause = () => { if (pl.state === 1 || pl.state === 3) cmd("pauseVideo"); else cmd("playVideo"); };
      const setSpeed = r => {
        speed = Math.max(.25, Math.min(2, r));
        store.set("ytSpeed", speed);
        cmd("setPlaybackRate", [speed]);
        const l = $(".yt2__spd", main);
        if (l) l.textContent = speed === 1 ? "" : speed + "x";
      };
      const setTheater = on => {
        theater = !!on;
        store.set("ytTheater", theater);
        const wEl = $(".yt2__watch", main);
        if (wEl) wEl.classList.toggle("is-theater", theater);
        const b = $("[data-theater]", main);
        if (b) { b.classList.toggle("is-on", theater); b.setAttribute("aria-pressed", theater); b.title = theater ? "Default view (t)" : "Theater mode (t)"; }
        sizeStage();
        if (wEl) main.scrollTop = 0;
      };
      const sizeStage = () => root.style.setProperty("--ytmh", Math.max(240, main.clientHeight - 24) + "px");
      const fullscreen = () => {
        if (document.fullscreenElement) { document.exitFullscreen(); return; }
        const t = $(".yt2__player iframe", main) || $(".yt2__player", main);
        if (t && t.requestFullscreen) t.requestFullscreen().catch(() => {});
      };
      const nextOf = (s, force) => {
        if (s.list) {
          const ids = s.order || (plInfo(s.list) || { ids: [] }).ids, i = ids.indexOf(s.id);
          return i >= 0 && ids[i + 1] ? { page: "watch", id: ids[i + 1], list: s.list, ...(s.order ? { order: s.order } : {}) } : null;
        }
        return (autoplay || force) && upnext[0] ? { page: "watch", id: upnext[0] } : null;
      };

      /* ---- popups (menus), modal dialogs, search suggestions ---- */
      let pop = null;
      const closePop = () => { if (pop) { pop.anchor.classList.remove("is-open"); pop.el.remove(); pop = null; } };
      const openPop = (anchor, html, cls, op = {}) => {
        if (pop && pop.anchor === anchor) { closePop(); return null; }
        closePop();
        const el = document.createElement("div");
        el.className = "yt2__pop " + (cls || "");
        el.setAttribute("role", "menu");
        el.innerHTML = html;
        root.appendChild(el);
        const r = anchor.getBoundingClientRect(), b = root.getBoundingClientRect();
        let x = (op.right ? r.right - el.offsetWidth : r.left) - b.left, y = r.bottom - b.top + 4;
        x = Math.max(8, Math.min(x, b.width - el.offsetWidth - 8));
        if (y + el.offsetHeight > b.height - 8) y = Math.max(8, r.top - b.top - el.offsetHeight - 4);
        el.style.left = x + "px"; el.style.top = y + "px";
        pop = { el, anchor, ...op };
        anchor.classList.add("is-open");
        const f = $("button, input", el);
        if (f && op.focus !== false) f.focus({ preventScroll: true });
        return el;
      };
      root.addEventListener("pointerdown", e => { if (pop && !pop.el.contains(e.target) && !pop.anchor.contains(e.target)) closePop(); }, true);
      root.addEventListener("keydown", e => {
        if (!pop || !pop.el.contains(document.activeElement)) return;
        const items = $$("button, input[type=checkbox]", pop.el), i = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus(); }
        else if (e.key === "Escape") { const a = pop.anchor; closePop(); a.focus(); e.stopPropagation(); }
      });
      const modal = (inner, cls) => {
        closePop();
        const m = document.createElement("div");
        m.className = "yt2__modal";
        m.innerHTML = `<div class="yt2__dlg ${cls || ""}" role="dialog" aria-modal="true">${inner}</div>`;
        root.appendChild(m);
        const close = () => m.remove();
        m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-dx]")) close(); });
        m.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
        const f = $("input, .yt2__dbtn--ok", m) || $("button", m);
        if (f) f.focus();
        return { m, close };
      };
      const askName = (title, value, okLabel, cb) => {
        const d = modal(`<form><h3>${esc(title)}</h3><label>Name<input name="n" maxlength="150" value="${esc(value)}" placeholder="Choose a title" autocomplete="off"></label><div class="yt2__dact"><button type="button" class="yt2__dbtn" data-dx>Cancel</button><button type="submit" class="yt2__dbtn yt2__dbtn--ok">${esc(okLabel)}</button></div></form>`);
        const inp = $("input", d.m);
        inp.select();
        $("form", d.m).addEventListener("submit", e => { e.preventDefault(); const n = inp.value.trim(); if (!n) return; d.close(); cb(n); });
      };
      const SHORTCUTS = [["k or Space", "Play / pause"], ["j / l", "Back / forward 10 seconds"], ["← / →", "Back / forward 5 seconds"], ["↑ / ↓", "Volume up / down"], ["m", "Mute"], ["0 - 9", "Jump to 0% - 90% of the video"], ["f", "Full screen"], ["t", "Theater mode"], ["< / >", "Slower / faster"], ["Shift + N", "Next video"], ["/", "Search"], ["?", "This list"]];
      const showKeys = () => modal(`<h3>Keyboard shortcuts</h3><table class="yt2__keys"><tbody>${SHORTCUTS.map(([k, d]) => `<tr><td>${k.split(" ").map(x => /^(or|\/|-)$/.test(x) ? ` ${x} ` : `<kbd>${esc(x)}</kbd>`).join("")}</td><td>${esc(d)}</td></tr>`).join("")}</tbody></table><div class="yt2__dact"><button type="button" class="yt2__dbtn yt2__dbtn--ok" data-dx>Close</button></div>`, "yt2__dlg--keys");
      const setDark = on => { dark = !!on; store.set("ytDark", dark); root.classList.toggle("yt2--dark", dark); };

      // search suggestions: recent searches + completions built from the titles, channels and categories in the library
      let sugItems = [], sugSel = -1;
      const completions = q => {
        const qs = q.toLowerCase(), qw = qs.split(/\s+/).length, freq = new Map();
        const cands = [];
        pool.forEach(v => { cands.push(v.title, v.channel, v.cat); });
        cands.forEach(c => {
          const ws = String(c).split(/\s+/);
          for (let i = 0; i < ws.length; i++) {
            if (!ws.slice(i).join(" ").toLowerCase().startsWith(qs)) continue;
            const t = ws.slice(i, i + qw + 2).join(" ").replace(/^[\s,:;|\-–—()[\]]+|[\s,:;|\-–—()[\]]+$/g, "");
            const k = t.toLowerCase();
            if (k.startsWith(qs) && k.length > qs.length) freq.set(k, { t: t.toLowerCase(), n: ((freq.get(k) || {}).n || 0) + 1 });
            break;
          }
        });
        return Array.from(freq.values()).sort((a, b) => b.n - a.n || a.t.length - b.t.length).map(x => x.t);
      };
      const buildSug = q => {
        const out = [], seen = new Set(), add = (t, kind) => { const k = t.toLowerCase(); if (t && !seen.has(k)) { seen.add(k); out.push({ t, kind }); } };
        const sh = store.get("ytSearches", []), qs = q.trim().toLowerCase();
        if (!qs) sh.slice(0, 8).forEach(t => add(t, "hist"));
        else { sh.filter(t => t.toLowerCase().includes(qs)).slice(0, 4).forEach(t => add(t, "hist")); completions(q.trim()).slice(0, 10).forEach(t => add(t, "sug")); }
        return out.slice(0, 10);
      };
      const hideSug = () => { sug.hidden = true; sugSel = -1; qInput.setAttribute("aria-expanded", "false"); };
      const showSug = () => {
        sugItems = buildSug(qInput.value);
        sugSel = -1;
        if (!sugItems.length) { hideSug(); return; }
        const q = qInput.value.trim();
        sug.innerHTML = sugItems.map((x, i) => {
          const pre = x.kind === "sug" ? esc(x.t.slice(0, q.length)) + `<b>${esc(x.t.slice(q.length))}</b>` : esc(x.t);
          return `<div class="yt2__si" role="option" id="ytSug${i}" data-si="${i}">${ytI(x.kind === "hist" ? "history" : "search", 20)}<span>${pre}</span>${x.kind === "hist" ? `<em class="yt2__sx" data-sx="${i}" title="Remove from search history">Remove</em>` : ""}</div>`;
        }).join("");
        sug.hidden = false;
        qInput.setAttribute("aria-expanded", "true");
      };
      const markSug = () => { $$(".yt2__si", sug).forEach((el, i) => { el.classList.toggle("is-sel", i === sugSel); if (i === sugSel) qInput.setAttribute("aria-activedescendant", el.id); }); };
      const runSearch = q => { q = q.trim(); if (!q) return; pushSearch(q); qInput.value = q; hideSug(); qInput.blur(); go({ page: "search", q }); };

      /* ---- pages ---- */
      const views = {
        home(s) {
          const cat = s.cat || "All", sl = subs(), seen = new Set(hist().map(h => h.id));
          // light "recommendations": subscribed channels first, things you already watched last
          const local = lib().filter(v => cat === "All" || v.cat === cat).map((v, i) => ({ v, k: (seen.has(v.id) ? 10 : 0) - (sl.includes(v.channel) ? 5 : 0) + i / 1000 })).sort((a, b) => a.k - b.k).map(x => x.v);
          const page = list => `${chipsHtml([["All", "All"], ...cats().map(c => [c, c])], cat, "data-cat")}${list.length ? grid(list) : empty("Nothing here yet", "No videos in this category.")}`;
          if (!ytApi.on || (cat !== "All" && !YT_CATID[cat])) return page(local);
          return ytApi.popular(cat === "All" ? 0 : YT_CATID[cat]).then(api => page(blend(local, mergeList(api)))).catch(() => page(local));
        },
        trending(s) {
          const k = s.k || "now", ex = YT_EXPLORE.find(x => x[0] === k) || YT_EXPLORE[0], present = new Set(lib().map(v => v.cat));
          const head = `<h2 class="yt2__h">${ex[0] === "now" ? "Trending" : esc(ex[1])}</h2>${chipsHtml(YT_EXPLORE.filter(x => x[0] === "now" || ytApi.on || (x[4] || []).some(c => present.has(c))).map(x => [x[0], x[1]]), ex[0], "data-k")}`;
          const rank = v => { const i = hist().findIndex(h => h.id === v.id); return i < 0 ? 1e6 : i; };
          const local = (ex[0] === "now" ? lib().slice().sort((a, b) => rank(a) - rank(b)) : lib().filter(v => (ex[4] || []).includes(v.cat)));
          const page = list => `${head}${list.length ? `<div class="yt2__rows yt2__rows--wide">${list.map(v => row(v, { desc: true })).join("")}</div>` : empty("Nothing here yet", "There are no videos in this category.")}`;
          if (!ytApi.on) return page(local);
          return ytApi.popular(ex[2]).then(api => page(mergeList(api))).catch(() => page(local));
        },
        subs() {
          const sl = subs();
          if (!sl.length) return `<h2 class="yt2__h">Subscriptions</h2>${empty("Don't miss new videos", "Subscribe to a channel and its latest videos show up here.")}<h3 class="yt2__h3">Suggested channels</h3><div class="yt2__chrows">${channels().filter(c => c !== NAME).slice(0, 6).map(chRow).join("")}</div>`;
          const strip = `<div class="yt2__strip">${sl.map(c => `<button type="button" class="yt2__stripc" data-channel="${esc(c)}"${cidAttr(c)}>${avHtml(c, true)}<span>${esc(c)}</span></button>`).join("")}</div>`;
          const local = lib().filter(v => sl.includes(v.channel));
          const page = list => `<h2 class="yt2__h">Latest</h2>${strip}${list.length ? grid(list) : empty("No videos yet", "Nothing from your subscriptions yet.")}`;
          const ids = sl.map(cid).filter(Boolean).slice(0, 6);
          if (!ytApi.on || !ids.length) return page(local);
          return Promise.all(ids.map(id => ytApi.channel(id).then(c => ytApi.uploads(c.uploads)).catch(() => []))).then(r => {
            const seen = new Set(), all = mergeList([].concat(...r)).concat(local).filter(v => !seen.has(v.id) && seen.add(v.id));
            return page(all.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0)));
          }).catch(() => page(local));
        },
        history(s) {
          const off = store.get("ytHistOff", false);
          return `<h2 class="yt2__h">Watch history</h2><div class="yt2__hist">
            <div class="yt2__hmain"><div class="yt2__hlist">${histList((s.q || "").toLowerCase())}</div></div>
            <aside class="yt2__hside">
              <form class="yt2__hsearch" role="search"><input data-hq placeholder="Search watch history" value="${esc(s.q || "")}" aria-label="Search watch history" autocomplete="off">${ytI("search", 20)}</form>
              <button type="button" class="yt2__lnk" data-clearhist>${ytI("trash", 20)}<span>Clear all watch history</span></button>
              <button type="button" class="yt2__lnk" data-pausehist>${ytI("history", 20)}<span>${off ? "Turn on watch history" : "Pause watch history"}</span></button>
            </aside></div>`;
        },
        playlists() {
          const tile = (id, name, ids, sub) => {
            const f = ids[0] && vidOf(ids[0]);
            return `<div class="yt2__plc"><button type="button" class="yt2__tl" data-go="playlist" data-id="${esc(id)}" tabindex="-1" aria-hidden="true"><span class="yt2__thumb">${f ? `<img src="${esc(ytThumb(f.id))}" alt="" loading="lazy" draggable="false">` : ""}<span class="yt2__pcount">${ytI("list", 16)}${ids.length} video${ids.length === 1 ? "" : "s"}</span></span></button><button type="button" class="yt2__tt" data-go="playlist" data-id="${esc(id)}"><strong>${esc(name)}</strong></button><small>${sub}</small></div>`;
          };
          const mine = pls();
          return `<div class="yt2__phead"><h2 class="yt2__h">Playlists</h2><button type="button" class="yt2__sub" data-newpl>${ytI("plus", 20)}<span>New playlist</span></button></div>
            <div class="yt2__grid">
              ${tile("WL", "Watch later", wl(), "Private")}${tile("LL", "Liked videos", likes().slice().reverse(), "Private")}
              ${mine.map(p => tile(p.id, p.name, p.ids, `Updated ${esc(ytAgo(p.upd || p.ts))}`)).join("")}
            </div>${mine.length ? "" : `<p class="yt2__hint2">Create a playlist to group videos. Use <b>Save</b> on any video to add it.</p>`}`;
        },
        playlist(s) {
          const P = plInfo(s.id);
          if (!P) return empty("This playlist doesn't exist", "It may have been deleted.");
          const items = P.ids.map(vidOf), f = items[0];
          return `<div class="yt2__plpage">
            <aside class="yt2__plside">
              <span class="yt2__plcover"><span class="yt2__thumb">${f ? `<img src="${esc(ytThumb(f.id))}" alt="" draggable="false">` : ""}</span></span>
              <div class="yt2__pltitle"><h2>${esc(P.name)}</h2>${P.sys ? "" : `<button type="button" class="yt2__ibtn" data-plrename="${esc(P.id)}" aria-label="Rename playlist" title="Rename playlist">${ytI("edit", 18)}</button>`}</div>
              <p class="yt2__plmeta"><b>${esc(NAME)}</b></p>
              <p class="yt2__plmeta">${items.length} video${items.length === 1 ? "" : "s"}${P.upd ? ` &middot; Updated ${esc(ytAgo(P.upd))}` : ""}</p>
              <div class="yt2__plbtns">
                <button type="button" class="yt2__sub yt2__sub--w" data-playall="${esc(P.id)}"${items.length ? "" : " disabled"}>${ytI("play", 20)}<span>Play all</span></button>
                <button type="button" class="yt2__pill" data-playall="${esc(P.id)}" data-shuffle="1"${items.length ? "" : " disabled"}>${ytI("shuffle", 18)}<span>Shuffle</span></button>
                ${P.sys ? "" : `<button type="button" class="yt2__pill" data-pldel="${esc(P.id)}">${ytI("trash", 18)}<span>Delete</span></button>`}
              </div>
            </aside>
            <div class="yt2__rows yt2__rows--pl" data-list="${esc(P.id)}">${items.length ? items.map((v, i) => row(v, { idx: i + 1, rm: "pl" })).join("") : empty("No videos yet", P.id === "LL" ? "Videos you like will show up here." : "Use Save on a video to add it to this playlist.")}</div>
          </div>`;
        },
        search(s) {
          const q = s.q.toLowerCase().replace(/\bfnaf\b/g, "five nights").replace(/\bfnf\b/g, "friday night funkin").replace(/\brick ?roll\b/g, "rick astley").replace(/\bcory\b/g, "coryxkenshin").replace(/\bmark\b/g, "markiplier");
          const terms = q.split(/\s+/).filter(Boolean);
          const local = lib().filter(v => terms.every(t => (v.title + " " + v.channel + " " + v.cat).toLowerCase().includes(t)));
          const chans = s.q.trim() ? channels().filter(c => terms.every(t => c.toLowerCase().includes(t))).slice(0, 2) : [];
          const page = list => `<h2 class="yt2__h">Results for "${esc(s.q)}"</h2>${chans.length ? `<div class="yt2__chrows">${chans.map(chRow).join("")}</div>` : ""}${list.length ? `<div class="yt2__rows yt2__rows--wide">${list.map(v => row(v, { desc: true })).join("")}</div>` : empty("No results found", `Try "fnaf", "music" or a channel name.`)}`;
          if (!ytApi.on) return page(local);
          return ytApi.search(s.q).then(api => page(mergeList(api))).catch(() => page(local));
        },
        channel(s) {
          const ch = s.name, mine = ch === NAME, tab = s.tab || "videos";
          const localList = lib().filter(v => v.channel === ch);
          if (mine && !store.get("ytJoined", 0)) store.set("ytJoined", Date.now());
          const page = (info, list) => {
            const joined = mine ? new Date(store.get("ytJoined", Date.now())).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : info && info.joined ? new Date(info.joined).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
            const handle = info && info.handle ? info.handle : "@" + ch.toLowerCase().replace(/[^a-z0-9]+/g, "");
            const nv = info && info.count != null ? info.count : list.length;
            const sub = [mine || (info && info.handle) ? handle : "", info && info.subs != null ? `${ytNum(info.subs)} subscribers` : "", `${ytNum(nv)} video${nv === 1 ? "" : "s"}${!mine && !info ? " here" : ""}`, mine ? `Joined ${joined}` : ""].filter(Boolean).join(" • ");
            const tabs = [["videos", "Videos"], ...(mine ? [["playlists", "Playlists"]] : []), ["about", "About"]];
            let content;
            if (tab === "about") {
              const links = mine ? CONTACTS.filter(x => x && x.href).map(x => `<a href="${esc(x.href)}" target="_blank" rel="noopener noreferrer">${esc(x.label || x.href)}</a>`).join("") : "";
              content = `<div class="yt2__about"><h3>Description</h3><p>${ytLinkify(mine ? (C.tagline || ROLE || "") : info && info.desc ? info.desc : `${ch} is a channel in ${FIRST}'s library.`)}</p><h3>More info</h3><ul>${joined ? `<li>Joined ${esc(joined)}</li>` : ""}${info && info.views != null ? `<li>${ytNum(info.views)} total views</li>` : ""}${mine && LOCATION ? `<li>${esc(LOCATION)}</li>` : ""}<li>${nv} video${nv === 1 ? "" : "s"}</li></ul>${links ? `<h3>Links</h3><div class="yt2__links">${links}</div>` : ""}</div>`;
            } else if (tab === "playlists") content = views.playlists();
            else content = `${mine ? `<div class="yt2__backup">${backupBar()}</div>` : ""}${list.length ? grid(list) : mine ? `<p class="yt2__empty">This is your channel. You haven't posted anything yet &mdash; hit <b>Upload video</b> and paste a YouTube link to publish it here.</p>` : ""}`;
            return `
              <div class="yt2__banner" style="background:${ytColor(ch)}"></div>
              <div class="yt2__chan">
                ${avHtml(ch, true)}
                <span><b>${esc(ch)}</b><small>${esc(sub)}</small>${mine ? `<small>${esc(C.tagline || ROLE || "")}</small>` : ""}</span>
                ${mine ? `<button type="button" class="yt2__sub" data-go="upload">Upload video</button>` : subBtn(ch, (info && info.id) || s.cid || cid(ch))}
              </div>
              <div class="yt2__tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === tab}" class="${k === tab ? "is-on" : ""}" data-tab="${k}">${l}</button>`).join("")}</div>
              ${content}`;
          };
          if (mine || !ytApi.on || tab !== "videos" && tab !== "about") return page(null, localList);
          const idp = s.cid ? Promise.resolve(s.cid) : cid(ch) ? Promise.resolve(cid(ch)) : ytApi.findChannel(ch);
          return idp.then(id => {
            if (!id) throw new Error("unknown channel");
            return ytApi.channel(id).then(info => {
              CHAN[ch] = { id, thumb: info.thumb }; store.set("ytChan", CHAN);
              return ytApi.uploads(info.uploads).then(up => { const seen = new Set(localList.map(v => v.id)); return page(info, localList.concat(mergeList(up).filter(v => !seen.has(v.id)))); });
            });
          }).catch(() => page(null, localList));
        },
        upload(s) {
          const ed = s.edit ? VIDEOS.find(v => v.mine && v.id === s.edit) : null;
          return `
            <h2 class="yt2__h">${ed ? "Edit video" : "Upload video"}</h2>
            <form class="yt2__form" autocomplete="off"${ed ? ` data-editing="${esc(ed.id)}"` : ""}>
              <p class="yt2__hint">${ed ? "Changes are saved to your channel." : `Paste a YouTube link (or video ID). It will be posted to <b>${esc(NAME)}</b>'s channel.`}</p>
              <label>YouTube link<input name="url" placeholder="https://www.youtube.com/watch?v=..." value="${ed ? `https://youtu.be/${esc(ed.id)}` : ""}"${ed ? " readonly" : " required"}></label>
              <label>Title<input name="title" maxlength="100" value="${ed ? esc(ed.title) : ""}" placeholder="Filled in automatically when possible"></label>
              <label>Category<input name="cat" list="ytCatList" value="${ed ? esc(ed.cat) : "Videos"}" maxlength="24"><datalist id="ytCatList">${cats().map(c => `<option value="${esc(c)}">`).join("")}</datalist></label>
              <label>Description<textarea name="desc" rows="3" maxlength="500">${ed ? esc(ed.desc) : ""}</textarea></label>
              <div class="yt2__prev">${ed ? `<img src="${esc(ytThumb(ed.id))}" alt="">` : ""}</div>
              <button type="submit" class="yt2__sub yt2__sub--red">${ed ? "Save changes" : "Publish"}</button>
            </form>`;
        },
        watch(s) {
          const v = vidOf(s.id), liked = likes().includes(v.id), ch = v.channel, mine = !!v.mine;
          const dateStr = v.date || v.ts ? new Date(v.date || v.ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
          const stats = [v.views != null ? ytViews(v.views) : "", dateStr].filter(Boolean);
          const text = v.desc || `Added to ${FIRST}'s favorites. Watching on Windows 98, as intended.`;
          const n = lib().filter(x => x.channel === ch).length;
          const P = s.list ? plInfo(s.list) : null, pids = P ? (s.order || P.ids) : [], pi = pids.indexOf(v.id);
          return `
            <div class="yt2__watch${theater ? " is-theater" : ""}">
              <div class="yt2__stage"><div class="yt2__player is-loading"></div></div>
              <div class="yt2__primary">
                <div class="yt2__trow">
                  <h1 class="yt2__title">${esc(v.title)}</h1>
                  <span class="yt2__tools">
                    <button type="button" class="yt2__chipb" data-speed aria-haspopup="menu" aria-label="Playback speed" title="Playback speed (&lt; and &gt;)">${ytI("speed", 20)}<span class="yt2__spd">${speed === 1 ? "" : speed + "x"}</span></button>
                    <button type="button" class="yt2__chipb${theater ? " is-on" : ""}" data-theater aria-pressed="${theater}" aria-label="Theater mode" title="Theater mode (t)">${ytI("theater", 20)}</button>
                    <a class="yt2__chipb" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}" target="_blank" rel="noopener" aria-label="Open on YouTube" title="Open on YouTube">${ytI("ext", 20)}</a>
                  </span>
                </div>
                <div class="yt2__owner">
                  <button type="button" class="yt2__avb" data-channel="${esc(ch)}"${cidAttr(ch, v)} tabindex="-1" aria-hidden="true">${avHtml(ch)}</button>
                  <span class="yt2__oname"><b data-channel="${esc(ch)}"${cidAttr(ch, v)}>${esc(ch)}</b><small class="yt2__subs">${mine ? `${n} video${n === 1 ? "" : "s"}` : esc(v.cat)}</small></span>
                  ${mine ? "" : subBtn(ch, v.channelId || cid(ch))}
                  <span class="yt2__actions">
                    <button type="button" class="yt2__pill${liked ? " is-on" : ""}" data-like="${esc(v.id)}">${likeInner(v, liked)}</button>
                    <button type="button" class="yt2__pill" data-share="${esc(v.id)}">${ytI("share", 18)}<span>Share</span></button>
                    <button type="button" class="yt2__pill" data-save="${esc(v.id)}" aria-haspopup="menu">${ytI("listAdd", 18)}<span>Save</span></button>
                    ${mine ? `<button type="button" class="yt2__pill" data-edit="${esc(v.id)}">${ytI("edit", 18)}<span>Edit</span></button>` : ""}
                    ${mine ? `<button type="button" class="yt2__pill" data-del="${esc(v.id)}">${ytI("trash", 18)}<span>Delete</span></button>` : ""}
                  </span>
                </div>
                <div class="yt2__desc">
                  <div class="yt2__dstat">${stats.length ? stats.map(x => `<b>${esc(x)}</b>`).join("") : `<b>${esc(ch)}</b><b>${esc(v.cat)}</b>`}</div>
                  <div class="yt2__dtext">${ytLinkify(text)}</div>
                  <dl class="yt2__dx"><dt>Channel</dt><dd><button type="button" class="yt2__cn" data-channel="${esc(ch)}"${cidAttr(ch, v)}>${esc(ch)}</button></dd><dt>Category</dt><dd>${esc(v.cat)}</dd>${durOf(v) ? `<dt>Length</dt><dd>${ytDur(durOf(v))}</dd>` : ""}<dt>Video ID</dt><dd>${esc(v.id)}</dd></dl>
                  <button type="button" class="yt2__dmore" data-desc aria-expanded="false">Show more</button>
                </div>
                <section class="yt2__comments">
                  <div class="yt2__chead"><h3 class="yt2__ccount"></h3><button type="button" class="yt2__csort" data-csort aria-haspopup="menu">${ytI("sort", 24)}<span>Sort by</span></button></div>
                  <form class="yt2__cform"><i class="yt2__av" style="background:${ytColor(NAME)}">${esc(NAME[0].toUpperCase())}</i><span class="yt2__cin"><input name="c" maxlength="300" placeholder="Add a comment..." aria-label="Add a comment" autocomplete="off"><span class="yt2__cbtns"><button type="reset" class="yt2__sub yt2__sub--ghost">Cancel</button><button type="submit" class="yt2__sub">Comment</button></span></span></form>
                  <div class="yt2__clist"></div>
                </section>
              </div>
              <aside class="yt2__next">
                ${P ? `<div class="yt2__plpanel"><div class="yt2__plph"><b>${esc(P.name)}</b><small>${esc(NAME)} &bull; ${pi + 1} / ${pids.length}</small></div><div class="yt2__plbody" data-list="${esc(P.id)}">${pids.map((id, i) => row(vidOf(id), { idx: i + 1, cur: id === v.id, cls: "yt2__row--pl" + (id === v.id ? " is-cur" : "") })).join("")}</div></div>` : ""}
                <div class="yt2__nhead"><span>Up next</span><label class="yt2__auto"><span>Autoplay</span><input type="checkbox" class="yt2__autobox" role="switch"${autoplay ? " checked" : ""}></label></div>
                <div class="yt2__chips yt2__chips--s"><button type="button" class="yt2__chip is-on" data-nf="all">All</button><button type="button" class="yt2__chip" data-nf="ch">From ${esc(ch)}</button></div>
                <div class="yt2__rows yt2__rows--small" data-nlist>${skRow.repeat(5)}</div>
              </aside>
            </div>`;
        },
      };
      const likeInner = (v, liked) => `${ytI(liked ? "like" : "likeO", 18)}<span>${v.likes != null ? ytNum(v.likes + (liked ? 1 : 0)) : liked ? "Liked" : "Like"}</span>`;
      const histList = q => {
        const all = hist(), items = all.map(h => ({ h, v: vidOf(h.id) })).filter(x => !q || (x.v.title + " " + x.v.channel).toLowerCase().includes(q));
        if (!items.length) return empty(all.length ? "No matching videos" : store.get("ytHistOff", false) ? "Watch history is paused" : "Your watch history is empty", all.length ? "Try a different search." : "Videos you watch will show up here.");
        let cur = "", html = "";
        items.forEach(({ h, v }) => {
          const d = dayLabel(h.ts);
          if (d !== cur) { if (cur) html += "</div>"; cur = d; html += `<h3 class="yt2__day">${esc(d)}</h3><div class="yt2__rows">`; }
          html += row(v, { rm: "hist", desc: true });
        });
        return html + "</div>";
      };

      /* ---- comments ---- */
      const commentItems = v => {
        const sort = store.get("ytCSort", "top"), liked = new Set(store.get("ytCL", []));
        const mineC = cmts(v.id).map(c => ({ key: `me:${v.id}:${c.ts}`, name: NAME, t: c.t, ts: c.ts, likes: 0, me: true, raw: c.ts })).sort((a, b) => b.ts - a.ts);
        const api = apiComments[v.id + ":" + sort] || [];
        if (sort === "new") return mineC.concat(api).sort((a, b) => b.ts - a.ts);
        return mineC.filter(c => liked.has(c.key)).concat(api, mineC.filter(c => !liked.has(c.key)));
      };
      const commentHtml = (c, v, liked) => `
        <div class="yt2__cmt">
          ${c.avatar ? `<img class="yt2__av" src="${esc(c.avatar)}" alt="">` : `<i class="yt2__av" style="background:${ytColor(c.name)}">${esc((c.name || "?")[0].toUpperCase())}</i>`}
          <span class="yt2__cbody"><span class="yt2__chd"><b>${esc(c.name)}</b> <small>${esc(ytAgo(c.ts))}</small></span><span class="yt2__ctx">${esc(c.t).replace(/\n/g, "<br>")}</span>
          <span class="yt2__cact"><button type="button" class="yt2__clike${liked.has(c.key) ? " is-on" : ""}" data-clike="${esc(c.key)}" aria-label="Like" aria-pressed="${liked.has(c.key)}">${ytI(liked.has(c.key) ? "like" : "likeO", 16)}<span>${c.likes + (liked.has(c.key) ? 1 : 0) || ""}</span></button>${c.me ? `<button type="button" class="yt2__cdel" data-cdel="${c.raw}" data-vid="${esc(v.id)}">Delete</button>` : ""}</span></span>
        </div>`;
      const refreshComments = v => {
        const list = $(".yt2__clist", main), head = $(".yt2__ccount", main);
        if (!list || !head || !v) return;
        const items = commentItems(v), liked = new Set(store.get("ytCL", [])), sort = store.get("ytCSort", "top");
        const total = (ytApi.on && v.commentCount != null ? v.commentCount : 0) + items.filter(c => c.me).length;
        head.textContent = ytApi.on && v.commentCount != null ? `${ytNum(total)} Comments` : `${items.length} Comment${items.length === 1 ? "" : "s"}`;
        const loading = ytApi.on && apiComments[v.id + ":" + sort] === undefined;
        list.innerHTML = (items.length ? items.map(c => commentHtml(c, v, liked)).join("") : loading ? "" : `<p class="yt2__empty yt2__empty--cmt">No comments yet. Be the first to comment.</p>`) + (loading ? `<div class="yt2__cmt is-skel" aria-hidden="true"><i class="yt2__av"></i><span class="yt2__cbody"><span class="yt2__sk" style="width:30%"></span><span class="yt2__sk" style="width:85%"></span></span></div>`.repeat(3) : "");
      };
      const loadApiComments = v => {
        const sort = store.get("ytCSort", "top"), key = v.id + ":" + sort;
        if (!ytApi.on || apiComments[key] !== undefined) return;
        const my = tok;
        ytApi.comments(v.id, sort === "new" ? "time" : "relevance").then(c => { apiComments[key] = c; }, () => { apiComments[key] = []; }).then(() => { if (my === tok) refreshComments(v); });
      };

      /* ---- "Up next" / related ---- */
      const drawNext = (s, v) => {
        const list = $("[data-nlist]", main);
        if (!list) return;
        const shown = nextAll.filter(x => nextFilter === "all" || x.channel === v.channel);
        upnext = nextAll.map(x => x.id);
        list.innerHTML = shown.length ? shown.map(x => row(x, { cls: "yt2__row--sm" })).join("") : empty("", `Nothing else from ${esc(v.channel)}.`);
        settle();
      };
      const fillNext = (s, v) => {
        const my = tok, local = lib().filter(x => x.id !== v.id).sort((a, b) => (b.channel === v.channel) - (a.channel === v.channel));
        nextFilter = "all"; nextAll = []; upnext = [];
        const done = items => { if (my !== tok) return; nextAll = items; drawNext(s, v); };
        if (ytApi.on) ytApi.related(v).then(a => done(mergeList(a).slice(0, 16).concat(local.filter(x => x.channel === v.channel).slice(0, 3)).filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i)), () => done(local));
        else done(local);
      };
      // real subscriber count and channel picture, when the API is on and the channel is known
      const fillOwner = v => {
        const id = v.channelId || cid(v.channel), my = tok;
        if (!ytApi.on || !id || v.mine) return;
        ytApi.channel(id).then(info => {
          CHAN[v.channel] = { id, thumb: info.thumb }; store.set("ytChan", CHAN);
          if (my !== tok) return;
          const sb = $(".yt2__subs", main);
          if (sb && info.subs != null) sb.textContent = `${ytNum(info.subs)} subscribers`;
          const av = $(".yt2__owner .yt2__avb", main);
          if (av && info.thumb) { av.innerHTML = avHtml(v.channel); settle(); }
        }).catch(() => {});
      };

      /* ---- render ---- */
      let drawer = false;
      const render = (restoreY = 0) => {
        const s = stack[stack.length - 1], my = ++tok;
        leaveWatch();
        closePop(); hideSug();
        drawer = false; root.classList.remove("is-drawer");
        drawSide();
        back.disabled = stack.length < 2;
        win.setTitle("YouTube");
        let out;
        try { out = views[s.page](s); } catch (err) { console.error(err); out = empty("Something went wrong", "Please try again."); }
        const put = html => {
          if (my !== tok) return;
          main.innerHTML = html;
          main.scrollTop = restoreY;
          settle();
          if (s.page === "watch") {
            const v = vidOf(s.id);
            pushHist(v);
            mountPlayer(v);
            win.setTitle(`${v.title} - YouTube`);
            sizeStage();
            refreshComments(v); loadApiComments(v);
            fillNext(s, v); fillOwner(v);
          }
        };
        if (out && typeof out.then === "function") { main.innerHTML = skeleton(s.page); main.scrollTop = 0; out.then(put, err => { console.warn(err); put(empty("Couldn't load this page", "Check your connection and try again.")); }); }
        else put(out);
      };
      const sameState = (a, b) => JSON.stringify(a, (k, x) => k === "_y" ? undefined : x) === JSON.stringify(b, (k, x) => k === "_y" ? undefined : x);
      const go = s => {
        const top = stack[stack.length - 1];
        if (top && sameState(top, s)) return;
        if (top) top._y = main.scrollTop;
        stack.push(s);
        if (stack.length > 40) stack.shift();
        render();
      };
      win.ytGo = go;
      const toast = text => {
        $$(".yt2__toast", root).forEach(x => x.remove());
        const t = document.createElement("div");
        t.className = "yt2__toast"; t.setAttribute("role", "status"); t.textContent = text;
        root.appendChild(t);
        later(() => t.remove(), 2600);
      };

      /* ---- actions ---- */
      const top = () => stack[stack.length - 1] || {};
      const share = id => {
        const url = `https://www.youtube.com/watch?v=${id}`;
        const done = () => msgBox({ title: "Share", icon: "info", text: `Link copied to the clipboard:\n${url}` });
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => msgBox({ title: "Share", icon: "info", text: url })); else msgBox({ title: "Share", icon: "info", text: url });
      };
      const toggleDesc = () => {
        const d = $(".yt2__desc", main);
        if (!d) return;
        const open = d.classList.toggle("is-open"), b = $("[data-desc]", d);
        b.textContent = open ? "Show less" : "Show more";
        b.setAttribute("aria-expanded", open);
      };
      const saveHtml = id => `<h4>Save video to...</h4><div class="yt2__chks">
        <label class="yt2__chk"><input type="checkbox" data-plchk="WL"${wl().includes(id) ? " checked" : ""}><span>Watch later</span></label>
        ${pls().map(p => `<label class="yt2__chk"><input type="checkbox" data-plchk="${esc(p.id)}"${p.ids.includes(id) ? " checked" : ""}><span>${esc(p.name)}</span></label>`).join("")}</div>
        <div class="yt2__pnew"><button type="button" data-pnew>${ytI("plus", 24)}<span>New playlist</span></button></div>`;
      const openSave = (anchor, id) => openPop(anchor, saveHtml(id), "yt2__pop--save", { vid: id });
      const openMenu = (btn, id) => {
        const inWL = wl().includes(id);
        openPop(btn, `<button type="button" data-pa="wl" data-id="${esc(id)}">${ytI("later", 24)}<span>${inWL ? "Remove from Watch later" : "Save to Watch later"}</span></button>
          <button type="button" data-pa="save" data-id="${esc(id)}">${ytI("listAdd", 24)}<span>Save to playlist</span></button>
          <button type="button" data-pa="share" data-id="${esc(id)}">${ytI("share", 24)}<span>Share</span></button>`, "yt2__pop--menu", { right: true });
      };
      const openMe = btn => {
        const handle = "@" + NAME.toLowerCase().replace(/[^a-z0-9]+/g, "");
        openPop(btn, `<div class="yt2__pme">${avHtml(NAME, true)}<span><b>${esc(NAME)}</b><small>${esc(handle)}</small><button type="button" class="yt2__lnk2" data-channel="${esc(NAME)}">View your channel</button></span></div><hr>
          <button type="button" role="menuitemcheckbox" aria-checked="${dark}" data-pa="theme">${ytI("moon", 24)}<span>Dark theme</span><span class="yt2__switch${dark ? " is-on" : ""}"></span></button>
          <button type="button" data-pa="keys">${ytI("keys", 24)}<span>Keyboard shortcuts</span></button><hr>
          <button type="button" data-export>${ytI("down", 24)}<span>Export backup</span></button>
          <label class="yt2__pbtn">${ytI("up", 24)}<span>Import backup</span><input type="file" accept="application/json,.json" data-import hidden></label>`, "yt2__pop--me", { right: true });
      };
      const popAction = el => {
        const a = el.dataset.pa, id = el.dataset.id, anchor = pop && pop.anchor;
        if (a === "theme") { setDark(!dark); el.setAttribute("aria-checked", dark); $(".yt2__switch", el).classList.toggle("is-on", dark); return; }
        closePop();
        if (a === "keys") showKeys();
        else if (a === "wl") {
          const on = !wl().includes(id);
          plAdd("WL", id, on);
          toast(on ? "Saved to Watch later" : "Removed from Watch later");
          if (top().page === "playlist" && top().id === "WL") render(main.scrollTop);
        }
        else if (a === "save" && anchor) openSave(anchor, id);
        else if (a === "share") share(id);
        else if (a === "sort") { const v = vidOf(top().id); store.set("ytCSort", el.dataset.val); refreshComments(v); loadApiComments(v); }
        else if (a === "speed") setSpeed(+el.dataset.val);
      };
      const playAll = (id, shuffle) => {
        const P = plInfo(id);
        if (!P || !P.ids.length) return;
        const order = shuffle ? shuffled(P.ids) : null;
        go({ page: "watch", id: (order || P.ids)[0], list: id, ...(order ? { order } : {}) });
      };
      const confirmBox = (title, text, yes) => msgBox({ title, icon: "warning", text, buttons: [yes, "Cancel"], defaultIndex: 1 }).then(r => r === 0 || r === yes);

      body.addEventListener("click", e => {
        const t = e.target, c = sel => t.closest(sel);
        let el;
        if ((el = c("[data-pa]"))) { popAction(el); return; }
        if (c("[data-scrim]")) { drawer = false; root.classList.remove("is-drawer"); return; }
        if (c("[data-burger]")) {
          if (root.classList.contains("is-narrow")) { drawer = !drawer; root.classList.toggle("is-drawer", drawer); }
          else { sideMode = sideMode === "mini" ? "" : "mini"; store.set("ytSide", sideMode); drawSide(); }
          return;
        }
        if ((el = c("[data-me]"))) { openMe(el); return; }
        if ((el = c("[data-more]"))) { openMenu(el, el.dataset.more); return; }
        if ((el = c("[data-channel]"))) { e.stopPropagation(); go({ page: "channel", name: el.dataset.channel, ...(el.dataset.cid ? { cid: el.dataset.cid } : {}) }); return; }
        if (c("[data-export]")) { closePop(); ytExport(); return; }
        if ((el = c("[data-edit]"))) { go({ page: "upload", edit: el.dataset.edit }); return; }
        if ((el = c("[data-cdel]"))) {
          const m = store.get("ytComments", {});
          m[el.dataset.vid] = (m[el.dataset.vid] || []).filter(x => String(x.ts) !== el.dataset.cdel);
          store.set("ytComments", m);
          refreshComments(vidOf(el.dataset.vid));
          return;
        }
        if ((el = c("[data-del]"))) {
          const id = el.dataset.del;
          msgBox({ title: "Delete video", icon: "warning", text: "Remove this video from your channel?", buttons: ["Delete", "Cancel"], defaultIndex: 1 }).then(r => {
            if (r !== 0 && r !== "Delete") return;
            store.set("ytUploads", store.get("ytUploads", []).filter(u => u.id !== id));
            const i = VIDEOS.findIndex(v => v.mine && v.id === id);
            if (i >= 0) VIDEOS.splice(i, 1);
            pool.delete(id); syncPool();
            stack.length = 0;
            go({ page: "channel", name: NAME });
          });
          return;
        }
        if ((el = c("[data-sub]"))) {
          const ch = el.dataset.sub, on = toggle("ytSubs", ch);
          if (on && el.dataset.cid) { CHAN[ch] = Object.assign(CHAN[ch] || {}, { id: el.dataset.cid }); store.set("ytChan", CHAN); }
          $$(`[data-sub="${CSS.escape(ch)}"]`, body).forEach(b => { b.classList.toggle("is-on", on); b.textContent = on ? "Subscribed" : "Subscribe"; });
          drawSide();
          return;
        }
        if ((el = c("[data-like]"))) {
          const v = vidOf(el.dataset.like), on = toggle("ytLikes", v.id);
          if (on) remember(v);
          el.classList.toggle("is-on", on);
          el.innerHTML = likeInner(v, on);
          return;
        }
        if ((el = c("[data-share]"))) { share(el.dataset.share); return; }
        if ((el = c("[data-save]"))) { openSave(el, el.dataset.save); return; }
        if ((el = c("[data-speed]"))) {
          openPop(el, `<h4>Playback speed</h4>${[.25, .5, .75, 1, 1.25, 1.5, 1.75, 2].map(x => `<button type="button" data-pa="speed" data-val="${x}"><span class="yt2__ck">${x === speed ? ytI("check", 20) : ""}</span><span>${x === 1 ? "Normal" : x}</span></button>`).join("")}`, "yt2__pop--menu");
          return;
        }
        if (c("[data-theater]")) { setTheater(!theater); return; }
        if ((el = c("[data-seek]"))) { seekTo(+el.dataset.seek); return; }
        if (c("a[href]")) return;
        if (c("[data-desc]") || c(".yt2__desc:not(.is-open)")) { toggleDesc(); return; }
        if ((el = c("[data-csort]"))) {
          const cur = store.get("ytCSort", "top");
          openPop(el, [["top", "Top comments"], ["new", "Newest first"]].map(([k, l]) => `<button type="button" data-pa="sort" data-val="${k}"><span class="yt2__ck">${k === cur ? ytI("check", 20) : ""}</span><span>${l}</span></button>`).join(""), "yt2__pop--menu");
          return;
        }
        if ((el = c("[data-clike]"))) { toggle("ytCL", el.dataset.clike); refreshComments(vidOf(top().id)); return; }
        if ((el = c("[data-nf]"))) {
          nextFilter = el.dataset.nf;
          $$("[data-nf]", main).forEach(b => b.classList.toggle("is-on", b === el));
          drawNext(top(), vidOf(top().id));
          return;
        }
        if (c("[data-newpl]")) { askName("New playlist", "", "Create", n => { plNew(n); if (top().page === "playlists" || top().tab === "playlists") render(main.scrollTop); toast("Playlist created"); }); return; }
        if (c("[data-pnew]")) {
          const box = $(".yt2__pnew", pop && pop.el);
          if (!box) return;
          box.innerHTML = `<form class="yt2__pform"><input name="n" maxlength="150" placeholder="Enter playlist name..." aria-label="Playlist name" autocomplete="off"><button type="submit">Create</button></form>`;
          $("input", box).focus();
          return;
        }
        if ((el = c("[data-plrename]"))) {
          const P = plInfo(el.dataset.plrename);
          if (P) askName("Rename playlist", P.name, "Save", n => { const a = pls(), p = a.find(x => x.id === P.id); if (p) { p.name = n.slice(0, 150); p.upd = Date.now(); store.set("ytPL", a); } render(main.scrollTop); });
          return;
        }
        if ((el = c("[data-pldel]"))) {
          const P = plInfo(el.dataset.pldel);
          if (P) confirmBox("Delete playlist", `Delete "${P.name}"? This can't be undone.`, "Delete").then(ok => { if (!ok) return; store.set("ytPL", pls().filter(p => p.id !== P.id)); stack[stack.length - 1] = { page: "playlists" }; render(); });
          return;
        }
        if ((el = c("[data-playall]"))) { playAll(el.dataset.playall, !!el.dataset.shuffle); return; }
        if ((el = c("[data-plrm]"))) {
          const list = (c("[data-list]") || {}).dataset && c("[data-list]").dataset.list, id = el.dataset.plrm;
          if (list === "LL") toggle("ytLikes", id); else if (list) plAdd(list, id, false);
          render(main.scrollTop);
          return;
        }
        if ((el = c("[data-rmhist]"))) {
          store.set("ytHist", hist().filter(x => x.id !== el.dataset.rmhist));
          $(".yt2__hlist", main).innerHTML = histList((top().q || "").toLowerCase());
          settle();
          return;
        }
        if (c("[data-clearhist]")) {
          confirmBox("Clear watch history", "Clear all of your watch history? This also forgets where you stopped in each video.", "Clear history").then(ok => {
            if (!ok) return;
            store.set("ytHist", []);
            Object.keys(PROG).forEach(k => delete PROG[k]); store.set("ytProg", PROG);
            render();
          });
          return;
        }
        if (c("[data-pausehist]")) { store.set("ytHistOff", !store.get("ytHistOff", false)); render(main.scrollTop); return; }
        if ((el = c("[data-tab]"))) { stack[stack.length - 1] = { ...top(), tab: el.dataset.tab }; render(); return; }
        if ((el = c("[data-cat]"))) { stack[stack.length - 1] = { page: "home", cat: el.dataset.cat }; render(); return; }
        if ((el = c("[data-k]"))) { stack[stack.length - 1] = { page: "trending", k: el.dataset.k }; render(); return; }
        if ((el = c("[data-v]"))) {
          const lst = c("[data-list]"), cur = top(), st = { page: "watch", id: el.dataset.v };
          if (lst) { st.list = lst.dataset.list; if (cur.page === "watch" && cur.list === st.list && cur.order) st.order = cur.order; }
          go(st);
          return;
        }
        if ((el = c("[data-go]"))) { const st = { page: el.dataset.go }; if (el.dataset.id) st.id = el.dataset.id; if (el.dataset.k) st.k = el.dataset.k; go(st); }
      });
      body.addEventListener("input", e => {
        const hq = e.target.closest("[data-hq]");
        if (hq) { top().q = hq.value; $(".yt2__hlist", main).innerHTML = histList(hq.value.toLowerCase()); settle(); return; }
        const ci = e.target.closest(".yt2__cform input");
        if (ci) { ci.parentElement.classList.toggle("has-text", !!ci.value); return; }
        const f = e.target.closest(".yt2__form");
        if (!f || e.target.name !== "url") return;
        const id = ytParseId(e.target.value), prev = $(".yt2__prev", f);
        if (!id) { prev.innerHTML = e.target.value ? `<small>That doesn't look like a YouTube link yet.</small>` : ""; return; }
        prev.innerHTML = `<img src="${esc(ytThumb(id))}" alt="">`;
        const t = f.elements.title;
        if (t.value.trim() && !t.dataset.auto) return;
        fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}`)
          .then(r => r.ok ? r.json() : null)
          .then(j => { if (j && j.title && ytParseId(f.elements.url.value) === id && (!t.value.trim() || t.dataset.auto)) { t.value = j.title; t.dataset.auto = "1"; } })
          .catch(() => {});
      });
      body.addEventListener("reset", e => { const cin = e.target.closest(".yt2__cform"); if (cin) { $(".yt2__cin", cin).classList.remove("has-text"); document.activeElement && document.activeElement.blur(); } });
      body.addEventListener("submit", e => {
        const f0 = e.target;
        if (f0.matches(".yt2__search")) { e.preventDefault(); runSearch(qInput.value); return; }
        if (f0.matches(".yt2__hsearch")) { e.preventDefault(); return; }
        if (f0.matches(".yt2__pform")) {
          e.preventDefault();
          const n = f0.elements.n.value.trim();
          if (!n || !pop) return;
          const p = plNew(n, pop.vid);
          pop.el.innerHTML = saveHtml(pop.vid);
          toast(`Saved to ${p.name}`);
          return;
        }
        const cf = e.target.closest(".yt2__cform");
        if (cf) {
          e.preventDefault();
          const t = cf.elements.c.value.trim(), s = top();
          if (!t || s.page !== "watch") return;
          const id = s.id, m = store.get("ytComments", {});
          m[id] = (m[id] || []).concat({ t, ts: Date.now() });
          store.set("ytComments", m);
          Sound.play("notify");
          cf.reset();
          refreshComments(vidOf(id));
          return;
        }
        const f = e.target.closest(".yt2__form");
        if (!f) return;
        e.preventDefault();
        if (f.dataset.editing) {
          const list = store.get("ytUploads", []), u = list.find(x => x.id === f.dataset.editing), v = VIDEOS.find(x => x.mine && x.id === f.dataset.editing);
          if (u && v) {
            Object.assign(u, { title: f.elements.title.value.trim() || "Untitled video", cat: f.elements.cat.value.trim() || "Videos", desc: f.elements.desc.value.trim() });
            Object.assign(v, { title: u.title, cat: u.cat, desc: u.desc });
            store.set("ytUploads", list);
          }
          stack.length = 0;
          go({ page: "channel", name: NAME });
          return;
        }
        const id = ytParseId(f.elements.url.value);
        if (!id) { msgBox({ title: "Upload", icon: "error", text: "Couldn't find a video in that link. Paste a youtube.com or youtu.be link, or the 11-character video ID." }); return; }
        if (VIDEOS.some(v => v.mine && v.id === id)) { msgBox({ title: "Upload", icon: "info", text: "That video is already on your channel." }); return; }
        const u = { id, title: f.elements.title.value.trim() || "Untitled video", cat: f.elements.cat.value.trim() || "Videos", desc: f.elements.desc.value.trim(), ts: Date.now() };
        store.set("ytUploads", store.get("ytUploads", []).concat(u));
        VIDEOS.push({ ...u, channel: NAME, mine: true });
        syncPool();
        Sound.play("notify");
        go({ page: "channel", name: NAME });
      });
      body.addEventListener("change", e => {
        const imp = e.target.closest("[data-import]");
        if (imp && imp.files[0]) {
          const file = imp.files[0];
          closePop();
          importBackup(file, ok => {
            if (!ok) { msgBox({ title: "Import", icon: "error", text: "That file isn't a backup made by this site." }); return; }
            ytImportExtra(file).then(() => msgBox({ title: "Import", icon: "info", text: "Backup imported. Reopen YouTube to see everything." })).then(() => win.close());
          });
          return;
        }
        if (e.target.classList.contains("yt2__autobox")) { autoplay = e.target.checked; store.set("ytAuto", autoplay); return; }
        const chk = e.target.closest("[data-plchk]");
        if (chk && pop && pop.vid) {
          plAdd(chk.dataset.plchk, pop.vid, chk.checked);
          const name = chk.dataset.plchk === "WL" ? "Watch later" : (plInfo(chk.dataset.plchk) || {}).name || "playlist";
          toast(chk.checked ? `Saved to ${name}` : `Removed from ${name}`);
        }
      });
      back.addEventListener("click", () => { if (stack.length > 1) { stack.pop(); render(top()._y || 0); } });

      /* ---- search box ---- */
      let typed = "";
      qInput.addEventListener("input", () => { typed = qInput.value; showSug(); });
      qInput.addEventListener("focus", () => { typed = qInput.value; showSug(); });
      qInput.addEventListener("blur", () => later(hideSug, 150));
      qInput.addEventListener("keydown", e => {
        if (e.key === "Escape") { if (!sug.hidden) { hideSug(); e.stopPropagation(); } else qInput.blur(); return; }
        if ((e.key === "ArrowDown" || e.key === "ArrowUp") && sugItems.length) {
          if (sug.hidden) { showSug(); return; }
          e.preventDefault();
          const n = sugItems.length;
          sugSel = e.key === "ArrowDown" ? (sugSel + 1 >= n ? -1 : sugSel + 1) : (sugSel - 1 < -1 ? n - 1 : sugSel - 1);
          qInput.value = sugSel >= 0 ? sugItems[sugSel].t : typed;
          markSug();
        }
      });
      sug.addEventListener("pointerdown", e => e.preventDefault());
      sug.addEventListener("click", e => {
        e.stopPropagation();
        const x = e.target.closest("[data-sx]");
        if (x) { const it = sugItems[+x.dataset.sx]; if (it) store.set("ytSearches", store.get("ytSearches", []).filter(q => q !== it.t)); showSug(); return; }
        const it = e.target.closest("[data-si]");
        if (it && sugItems[+it.dataset.si]) runSearch(sugItems[+it.dataset.si].t);
      });

      /* ---- keyboard shortcuts (the iframe handles its own keys while it has focus) ---- */
      const onKey = e => {
        if (WM.active !== "youtube" || win.min || e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.target, tag = t && t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
        if ($(".yt2__modal", root)) return;
        const s = top(), watching = s.page === "watch", k = e.key, onBtn = tag === "BUTTON" || tag === "A" || tag === "SUMMARY";
        let used = true;
        if (k === "/") { qInput.focus(); qInput.select(); }
        else if (k === "?") showKeys();
        else if (!watching) used = false;
        else if (k === "k" || (k === " " && !onBtn)) playPause();
        else if (k === "j") seek(-10);
        else if (k === "l") seek(10);
        else if (k === "ArrowLeft" && !onBtn) seek(-5);
        else if (k === "ArrowRight" && !onBtn) seek(5);
        else if (k === "m") cmd(pl.muted ? "unMute" : "mute");
        else if (/^[0-9]$/.test(k)) { if (pl.d) seekTo(pl.d * +k / 10); }
        else if (k === "f") fullscreen();
        else if (k === "t") setTheater(!theater);
        else if (k === "<" || k === ">") {
          const steps = [.25, .5, .75, 1, 1.25, 1.5, 1.75, 2], i = Math.max(0, steps.indexOf(speed));
          setSpeed(steps[Math.max(0, Math.min(steps.length - 1, i + (k === ">" ? 1 : -1)))]);
          toast(`Playback speed: ${speed === 1 ? "Normal" : speed + "x"}`);
        }
        else if (k === "N") { const n = nextOf(s, true); if (n) go(n); }
        else used = false;
        if (used) e.preventDefault();
      };
      document.addEventListener("keydown", onKey);

      /* ---- player messages (YouTube iframe API) ---- */
      const onMsg = e => {
        if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin)) return;
        const ifr = $(".yt2__player iframe", main);
        if (!ifr || e.source !== ifr.contentWindow) return;
        let d; try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (err) { return; }
        if (!d) return;
        const info = d.event === "infoDelivery" || d.event === "initialDelivery" ? d.info : d.event === "onStateChange" ? { playerState: d.info } : null;
        if (!info || typeof info !== "object") return;
        const first = !pl.got;
        pl.got = true;
        if (typeof info.currentTime === "number") pl.t = info.currentTime;
        if (info.duration > 0 && pl.d !== info.duration) {
          pl.d = info.duration;
          if (Math.abs((DUR[pl.id] || 0) - pl.d) > 1) { DUR[pl.id] = Math.round(pl.d); const k = Object.keys(DUR); if (k.length > 600) delete DUR[k[0]]; store.set("ytDur", DUR); }
        }
        if (typeof info.volume === "number") pl.vol = info.volume;
        if (typeof info.muted === "boolean") pl.muted = info.muted;
        if (typeof info.playbackRate === "number") pl.rate = info.playbackRate;
        if (first && speed !== 1) cmd("setPlaybackRate", [speed]);
        if (info.playerState !== undefined && info.playerState !== null) {
          const st = info.playerState;
          pl.state = st;
          if (st === 2) saveProg(true);
          if (st === 1 && !pl.spd) { pl.spd = true; if (speed !== 1) cmd("setPlaybackRate", [speed]); }
          if (st === 0 && pl.endedFor !== pl.id) {
            pl.endedFor = pl.id;
            saveProg(true);
            const s = top(), n = s.page === "watch" ? nextOf(s) : null;
            if (n) go(n);
            return;
          }
        }
        saveProg(false);
      };
      window.addEventListener("message", onMsg);

      // narrow windows get a slide-over guide instead of the side rail
      const fit = () => {
        const was = root.classList.contains("is-narrow"), narrow = root.clientWidth < 720;
        root.classList.toggle("is-narrow", narrow);
        root.classList.toggle("is-compact", main.clientWidth < 1000);
        root.classList.toggle("is-tiny", root.clientWidth < 540);
        if (was !== narrow) { drawer = false; root.classList.remove("is-drawer"); drawSide(); }
        sizeStage();
      };
      const ro = typeof ResizeObserver === "function" ? new ResizeObserver(fit) : null;
      if (ro) { ro.observe(root); ro.observe(main); }
      fit();
      win.cleanup = () => {
        leaveWatch();
        window.removeEventListener("message", onMsg);
        document.removeEventListener("keydown", onKey);
        if (ro) ro.disconnect();
        timers.forEach(clearTimeout);
      };
      go({ page: "home", cat: "All" });
    },
    onClose: w => w.cleanup && w.cleanup(),
  });
  if (o.q && w && w.ytGo) w.ytGo({ page: "search", q: String(o.q) });
}

/* ---------- Spotify ---------- */
// Playlist IDs are Spotify's public editorial playlists. Add your own with "Add music".
const SP_DEFAULTS = [
  { type: "playlist", id: "37i9dQZF1DXcBWIGoYBM5M", title: "Today's Top Hits" },
  { type: "playlist", id: "37i9dQZF1DX4o1oenSJRJd", title: "All Out 2000s" },
  { type: "playlist", id: "37i9dQZF1DXbTxeAdrVG2l", title: "All Out 90s" },
  { type: "playlist", id: "37i9dQZF1DWXRqgorJj26U", title: "Rock Classics" },
  { type: "playlist", id: "37i9dQZF1DWWQRwui0ExPn", title: "Lofi Beats" },
  { type: "playlist", id: "37i9dQZF1DX4sWSpwq3LiO", title: "Peaceful Piano" },
];
// Accepts open.spotify.com links (incl. intl-xx/ prefixes) or spotify:type:id URIs.
function spParse(input) {
  const t = String(input || "").trim();
  const m = t.match(/open\.spotify\.com\/(?:intl-[\w-]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]{22})/) || t.match(/^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]{22})$/);
  return m ? { type: m[1], id: m[2] } : null;
}
// Uploads, comments and music are kept in localStorage, so offer a way to move them between browsers.
const BACKUP_KEYS = ["ytUploads", "ytComments", "ytSubs", "ytLikes", "spLib"];
function exportBackup() {
  const data = { app: "w98-portfolio", saved: new Date().toISOString() };
  BACKUP_KEYS.forEach(k => { data[k] = store.get(k, k === "ytComments" ? {} : []); });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = "portfolio-media-backup.json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importBackup(file, done) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || d.app !== "w98-portfolio") throw new Error("not a backup");
      const merge = (a, b, key) => { const seen = new Set(a.map(x => x[key])); return a.concat(b.filter(x => x && !seen.has(x[key]))); };
      store.set("ytUploads", merge(store.get("ytUploads", []), Array.isArray(d.ytUploads) ? d.ytUploads : [], "id"));
      store.set("spLib", merge(store.get("spLib", []), Array.isArray(d.spLib) ? d.spLib : [], "id"));
      ["ytSubs", "ytLikes"].forEach(k => store.set(k, Array.from(new Set(store.get(k, []).concat(Array.isArray(d[k]) ? d[k] : [])))));
      const cm = store.get("ytComments", {});
      Object.entries(d.ytComments || {}).forEach(([id, list]) => { if (Array.isArray(list)) cm[id] = merge(cm[id] || [], list, "ts"); });
      store.set("ytComments", cm);
      done(true);
    } catch (e) { done(false); }
  };
  r.readAsText(file);
}
const backupBar = () => `<span class="media-backup"><button type="button" data-export>Export backup</button><label class="media-backup__imp">Import backup<input type="file" accept="application/json,.json" data-import hidden></label></span>`;
function openSpotify(o = {}) {
  WM.open("spotify", {
    title: "Spotify", icon: "spotify", w: 980, h: 600, from: o.from,
    render(body, win) {
      body.classList.add("body--flush");
      const mine = () => store.get("spLib", []);
      const lib = () => mine().map(x => ({ ...x, mine: true })).concat(SP_DEFAULTS);
      const find = id => lib().find(x => x.id === id);
      const artCache = () => store.get("spArt", {});
      const artOf = it => it.thumb || artCache()[it.id] || "";
      const KIND = { track: "Song", album: "Album", playlist: "Playlist", artist: "Artist", episode: "Episode", show: "Podcast" };
      const hue = name => { let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
      const local = [];   // audio files picked from this computer; they only last until the window closes
      let localIdx = -1, filter = "";
      const hist = [{ page: "home" }]; let pos = 0;
      const tried = new Set();
      win.cleanup = () => local.forEach(f => URL.revokeObjectURL(f.url));

      body.innerHTML = `
        <div class="sp">
          <aside class="sp__side">
            <nav class="sp__panel sp__nav">
              <button type="button" data-go="home">${ui("home", 24)}<span>Home</span></button>
              <button type="button" data-go="add">${ui("search", 24)}<span>Add music</span></button>
              <button type="button" data-go="local">${ui("folder", 24)}<span>Your files</span></button>
            </nav>
            <section class="sp__panel sp__libpanel">
              <header><span>${ui("library", 22)}Your Library</span><button type="button" data-go="add" title="Add music" aria-label="Add music">${ui("plus", 18)}</button></header>
              <input class="sp__filter" type="search" placeholder="Search in Your Library" aria-label="Search in Your Library">
              <div class="sp__lib"></div>
            </section>
          </aside>
          <main class="sp__panel sp__main">
            <div class="sp__top"><button type="button" class="sp__nav-btn" data-hist="-1" aria-label="Back">${ui("back", 22)}</button><button type="button" class="sp__nav-btn" data-hist="1" aria-label="Forward">${ui("fwd", 22)}</button></div>
            <div class="sp__view"></div>
          </main>
        </div>`;
      const mainEl = $(".sp__main", body), view = $(".sp__view", body), libEl = $(".sp__lib", body);

      const cover = (it, cls = "") => {
        const a = artOf(it);
        return `<span class="sp__cover ${cls}" data-art="${esc(it.id)}"${a ? ` style="background-image:url('${esc(a)}')"` : ""}>${a ? "" : ui("note", 24)}</span>`;
      };
      const setArt = (id, url) => $$(`[data-art="${CSS.escape(id)}"]`, body).forEach(el => { el.style.backgroundImage = `url('${url.replace(/'/g, "%27")}')`; el.innerHTML = ""; });
      // real cover art comes from Spotify's oEmbed endpoint when online; cached so it only loads once
      const fetchArt = it => {
        if (artOf(it) || tried.has(it.id)) return;
        tried.add(it.id);
        fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/${it.type}/${it.id}`)}`)
          .then(r => r.ok ? r.json() : null)
          .then(j => { if (j && j.thumbnail_url) { const c = artCache(); c[it.id] = j.thumbnail_url; store.set("spArt", c); setArt(it.id, j.thumbnail_url); } })
          .catch(() => {});
      };
      const sub = it => `${KIND[it.type] || "Music"}${it.mine ? " &bull; You" : it.type === "playlist" ? " &bull; Spotify" : ""}`;

      const drawLib = () => {
        const q = filter.toLowerCase(), cur = hist[pos];
        const list = lib().filter(it => !q || it.title.toLowerCase().includes(q));
        libEl.innerHTML = list.length ? list.map(it => `
          <button type="button" class="sp__lrow${cur.page === "item" && cur.id === it.id ? " is-on" : ""}" data-open="${esc(it.id)}">
            ${cover(it)}<span><b>${esc(it.title)}</b><small>${sub(it)}</small></span>
          </button>`).join("") : `<p class="sp__empty">Nothing matches "${esc(filter)}".</p>`;
        $$(".sp__nav [data-go]", body).forEach(b => b.classList.toggle("is-on", b.dataset.go === cur.page));
        $$(".sp__nav-btn", body).forEach(b => { const t = pos + +b.dataset.hist; b.disabled = t < 0 || t >= hist.length; });
      };
      const card = it => `
        <button type="button" class="sp__card" data-open="${esc(it.id)}">
          <span class="sp__cardart">${cover(it)}<i class="sp__go">${ui("play", 22)}</i></span>
          <b>${esc(it.title)}</b><small>${sub(it)}</small>
        </button>`;
      const hello = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

      const pages = {
        home() {
          const items = lib(), mineList = items.filter(i => i.mine), pop = items.filter(i => !i.mine);
          mainEl.style.setProperty("--c", "hsl(220,18%,24%)");
          return `
            <h1 class="sp__hello">${hello()}</h1>
            <div class="sp__quick">${items.slice(0, 6).map(it => `<button type="button" data-open="${esc(it.id)}">${cover(it)}<b>${esc(it.title)}</b></button>`).join("")}</div>
            ${mineList.length ? `<h2 class="sp__h">Your music</h2><div class="sp__shelf">${mineList.map(card).join("")}</div>` : ""}
            <h2 class="sp__h">Popular playlists</h2>
            <div class="sp__shelf">${pop.map(card).join("")}</div>
            <p class="sp__note">Music plays through Spotify's own player. Log in to Spotify in this browser for full songs; otherwise you get 30-second previews.</p>`;
        },
        item(s) {
          const it = find(s.id);
          if (!it) return pages.home();
          const small = /^(track|episode)$/.test(it.type);
          mainEl.style.setProperty("--c", `hsl(${hue(it.title)},38%,30%)`);
          return `
            <div class="sp__hero">
              ${cover(it, "sp__cover--hero")}
              <div><small>${KIND[it.type] || "Music"}</small><h1>${esc(it.title)}</h1><p>${it.mine ? esc(NAME) : "Spotify"}</p></div>
            </div>
            <iframe class="sp__embed${small ? " sp__embed--small" : ""}" src="https://open.spotify.com/embed/${it.type}/${it.id}?utm_source=generator&theme=0" title="${esc(it.title)}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            ${it.mine ? `<button type="button" class="sp__link" data-rm="${esc(it.id)}">Remove from Your Library</button>` : ""}`;
        },
        add() {
          mainEl.style.setProperty("--c", "hsl(150,30%,22%)");
          return `
            <h1 class="sp__title">Add music</h1>
            <form class="sp__form" autocomplete="off">
              <p>In Spotify, choose <b>Share &rarr; Copy link</b> on a song, album, playlist, artist or podcast, then paste it below.</p>
              <label>Spotify link<input name="url" placeholder="https://open.spotify.com/track/..." required></label>
              <label>Name <em>(optional)</em><input name="title" maxlength="60" placeholder="Filled in automatically when possible"></label>
              <button type="submit" class="sp__btn">Add</button>
            </form>
            <div class="sp__backup">${backupBar()}</div>`;
        },
        local() {
          mainEl.style.setProperty("--c", "hsl(260,28%,26%)");
          return `
            <div class="sp__hero">
              <span class="sp__cover sp__cover--hero">${ui("folder", 64)}</span>
              <div><small>Local files</small><h1>Your files</h1><p>${local.length} song${local.length === 1 ? "" : "s"} &bull; this session only</p></div>
            </div>
            <label class="sp__btn sp__pick">Choose audio files<input type="file" accept="audio/*" multiple hidden data-files></label>
            <audio class="sp__audio" controls></audio>
            <div class="sp__tracks">${local.map((f, i) => `<button type="button" class="sp__track${i === localIdx ? " is-on" : ""}" data-track="${i}"><i>${i + 1}</i><span>${esc(f.name)}</span></button>`).join("")}</div>
            <p class="sp__note">Files stay on this computer. They aren't uploaded and disappear when you close Spotify.</p>`;
        },
      };
      const playLocal = i => {
        localIdx = i;
        const a = $(".sp__audio", view);
        if (!a) return;
        a.src = local[i].url; a.play().catch(() => {});
        $$(".sp__track", view).forEach((b, k) => b.classList.toggle("is-on", k === i));
      };
      const draw = () => {
        const s = hist[pos];
        view.innerHTML = pages[s.page](s);
        mainEl.scrollTop = 0;
        if (s.page === "local") {
          const a = $(".sp__audio", view);
          if (localIdx >= 0 && local[localIdx]) a.src = local[localIdx].url;
          a.addEventListener("ended", () => { if (localIdx + 1 < local.length) playLocal(localIdx + 1); });
        }
        drawLib();
        lib().forEach(it => { if (view.querySelector(`[data-art="${CSS.escape(it.id)}"]`) || libEl.querySelector(`[data-art="${CSS.escape(it.id)}"]`)) fetchArt(it); });
      };
      const go = s => { hist.length = pos + 1; hist.push(s); pos++; draw(); };

      $(".sp__filter", body).addEventListener("input", e => { filter = e.target.value.trim(); drawLib(); });
      body.addEventListener("change", e => {
        if (e.target.matches("[data-files]")) {
          Array.from(e.target.files).forEach(f => local.push({ name: f.name.replace(/\.[^.]+$/, ""), url: URL.createObjectURL(f) }));
          const first = localIdx < 0;
          draw();
          if (first && local.length) playLocal(0);
        } else if (e.target.matches("[data-import]") && e.target.files[0]) {
          importBackup(e.target.files[0], ok => {
            if (!ok) { msgBox({ title: "Import", icon: "error", text: "That file isn't a backup made by this site." }); return; }
            go({ page: "home" });
          });
        }
      });
      body.addEventListener("click", e => {
        if (e.target.closest("[data-export]")) { exportBackup(); return; }
        const h = e.target.closest("[data-hist]");
        if (h) { const t = pos + +h.dataset.hist; if (t >= 0 && t < hist.length) { pos = t; draw(); } return; }
        const tr = e.target.closest("[data-track]");
        if (tr) { playLocal(+tr.dataset.track); return; }
        const rm = e.target.closest("[data-rm]");
        if (rm) { store.set("spLib", mine().filter(x => x.id !== rm.dataset.rm)); go({ page: "home" }); return; }
        const op = e.target.closest("[data-open]");
        if (op) { go({ page: "item", id: op.dataset.open }); return; }
        const g = e.target.closest("[data-go]");
        if (g && !(hist[pos].page === g.dataset.go)) go({ page: g.dataset.go });
      });
      body.addEventListener("submit", async e => {
        const f = e.target.closest(".sp__form");
        if (!f) return;
        e.preventDefault();
        const p = spParse(f.elements.url.value);
        if (!p) { msgBox({ title: "Add music", icon: "error", text: "That doesn't look like a Spotify link. It should start with https://open.spotify.com/ and point to a song, album, playlist, artist or podcast." }); return; }
        if (lib().some(x => x.id === p.id)) { msgBox({ title: "Add music", icon: "info", text: "That's already in your library." }); return; }
        let title = f.elements.title.value.trim(), thumb = "";
        try {
          const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/${p.type}/${p.id}`)}`);
          if (r.ok) { const j = await r.json(); if (!title) title = j.title || ""; thumb = j.thumbnail_url || ""; }
        } catch (err) {}
        store.set("spLib", [{ ...p, title: title || `Spotify ${KIND[p.type] || p.type}`, thumb }].concat(mine()));
        Sound.play("notify");
        go({ page: "item", id: p.id });
      });
      draw();
    },
    onClose: w => w.cleanup && w.cleanup(),
  });
}

/* ---------- Discord reply brain ----------
   Replies are built from what you actually wrote: it pulls out the topic,
   answers questions, remembers what it asked you, and never repeats a line.
   If the site is deployed with an AI key (see api/chat.js), real AI replies
   are used instead and this is the fallback. */
const DC_PEOPLE = {
  neon_ninja: { vibe: "hyped-up gamer who lives for Quake II and LAN parties; energetic, uses caps for emphasis sometimes, says 'fr' and 'lets gooo'",
    fav: { game: "Quake II, no contest", food: "pizza rolls at 2am", music: "anything from the Need for Speed soundtrack", color: "neon green obviously", language: "C because Quake was written in it", movie: "The Matrix", site: "anything with cheat codes" } },
  dialup_dana: { vibe: "chill and dry-humored music nerd who always has Winamp open; types in lowercase, a bit sarcastic but kind",
    fav: { game: "the Snake on my phone", food: "cereal for dinner", music: "whatever 3-minute midi i'm looping", color: "winamp skin purple", language: "css, it's basically fashion", movie: "Hackers (1995)", site: "my geocities page, obviously" } },
  jpeg_jeff: { vibe: "nerdy, helpful web developer who loves HTML tables and explaining things; slightly formal, says 'technically'",
    fav: { game: "Minesweeper on expert", food: "anything I can eat while coding", music: "lo-fi modem noises", color: "#000080, the best blue", language: "JavaScript, despite everything", movie: "Office Space", site: "the W3C spec pages, no shame" } },
  Mom: { vibe: "sweet mom who is confused by computers, types in full sentences and signs off with 'Love, Mom'",
    fav: { game: "Solitaire", food: "your favorite, I'll make it this weekend", music: "the radio", color: "whatever you're wearing, sweetie", language: "English, dear", movie: "Titanic", site: "the AOL homepage" } },
};
const DC_STOP = new Set("almost pretty good done thing things stuff kinda gonna wanna want know think make made much many well still even being really actually literally maybe something anything nothing everything people today tomorrow yesterday right sure cool nice great the a an and or but if then so to of in on at for with from by is are was were be been am i im i'm you your yours me my mine we our us they them it its it's this that these those what whats what's how why when where who which do does did done have has had just really very like lol lmao ok okay yeah yes no not dont don't cant can't can will would should could about into out up down get got go going there here some any all more most than too also hey hi hello yo sup".split(" "));
const DC_MEM = {};
function dcMem(who) { return DC_MEM[who] || (DC_MEM[who] = { used: new Set(), asked: null, turns: 0 }); }
function dcPick(who, options) {
  const m = dcMem(who);
  const fresh = options.filter(x => x && !m.used.has(x));
  const choice = pick(fresh.length ? fresh : options.filter(Boolean));
  m.used.add(choice);
  return choice;
}
function dcFlip(s) {
  // turn "my portfolio" into "your portfolio" etc. when echoing someone back
  const map = { i: "you", "i'm": "you're", im: "you're", me: "you", my: "your", mine: "yours", myself: "yourself", you: "I", your: "my", yours: "mine", "you're": "I'm", am: "are" };
  return s.split(/\s+/).map(w => { const k = w.toLowerCase(); return map[k] !== undefined ? map[k] : w; }).join(" ");
}
function dcClean(s, max = 6) { return dcFlip(String(s).replace(/[?!.,;:]+$/g, "").trim().split(/\s+/).slice(0, max).join(" ")); }
function dcKeyword(text) {
  const words = text.toLowerCase().replace(/[^a-z0-9#+.\s'-]/g, " ").split(/\s+/).filter(w => w.length > 3 && !DC_STOP.has(w));
  return words.sort((a, b) => b.length - a.length)[0] || "";
}
function dcStyle(who, s) {
  if (who === "dialup_dana") return s.toLowerCase();
  if (who === "Mom") { const t = s.charAt(0).toUpperCase() + s.slice(1); return /Love, Mom$/.test(t) || Math.random() < 0.5 ? t : t + " Love, Mom"; }
  if (who === "neon_ninja" && Math.random() < 0.25) return s + pick([" fr", " lets gooo", " no cap"]);
  return s;
}
function dcBrain(who, text) {
  const raw = String(text).trim(), t = raw.toLowerCase(), m = dcMem(who), P = DC_PEOPLE[who] || DC_PEOPLE.jpeg_jeff;
  m.turns++;
  const ask = (s, kind) => { m.asked = kind; return s; };
  const say = arr => dcStyle(who, dcPick(who, arr));
  const proj = PROJECTS.find(p => t.includes(String(p.title).toLowerCase()));
  const skill = SKILLS.find(s => new RegExp(`\\b${String(s).toLowerCase().replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\b`).test(t));
  let mm;

  // answering a question the bot asked last time
  if (m.asked && /^(yes|yeah|yep|ya|sure|ofc|of course|definitely|kinda|no|nah|nope|not really)\b/.test(t)) {
    const yes = !/^(no|nah|nope|not really)/.test(t), q = m.asked; m.asked = null;
    if (q === "lan") return say(yes ? ["LETS GO, saturday at mine then", "bet, bring snacks and a 50ft ethernet cable"] : ["boo. next time then", "fair, your loss tho"]);
    if (q === "project") {
      const tp = m.topic || {};
      return say(yes
        ? [tp.thing ? `lets go, drop ${tp.thing} in #showcase when it's live` : "sick, drop it in #showcase when it's done", tp.skill ? `nice, ${tp.skill} for the win. send me the link` : "nice, what's it built with?", tp.thing ? `can't wait to see ${tp.thing}` : "can't wait to see it"]
        : ["no rush, it'll get there", "honestly that's how every project goes", "you'll get it, keep going"]);
    }
    if (q === "wellbeing") return say(yes ? ["love that for you", "good good"] : ["aw man, hope it gets better", "want to vent? i'm here"]);
    return say(yes ? ["say less", "glad we agree", "knew it"] : ["fair enough", "ok ok i respect it", "noted"]);
  }
  if (!m.asked && /^(yeah|yea|yes|yep|ok|okay|k|sure|true|nah|no|nope|maybe|idk|hmm+|mhm)\b/.test(t) && t.split(/\s+/).length <= 6) {
    const rest = dcKeyword(raw);
    return say(rest ? [`ok ${rest}, noted`, `${rest}? love that`, `nice, ${rest} is a good sign`] : ["fair", "ok ok", "gotcha", "makes sense", "true true"]);
  }
  if (/\b(are you|r u|you)\s+(a\s+)?(bot|ai|robot|real|human|person)\b/.test(t))
    return say([`lol you got me, i'm a scripted bot living in ${FIRST}'s portfolio. still happy to chat though`, "i'm a bot, but a friendly one. what's up?"]);
  if (/^(hi|hey|hello|yo|sup|hiya|howdy|heyy+|wassup|what's up|whats up|good (morning|evening|afternoon))\b[\s,!.?]*@?[\w-]*[\s!.?]*$/.test(t))
    return ask(say([`hey ${FIRST}! what are you up to?`, "yooo what's good", `oh hey ${FIRST}, how's it going?`, "hiii, how's your day been?"]), "wellbeing");
  if (/how (are|r) (you|u)|how's it going|how you doing|hows it going/.test(t))
    return ask(say(["pretty good! just " + (DC.members.find(x => x.name === who) || {}).activity?.toLowerCase() + ". you?", "honestly great, my modem only dropped twice today. you good?", "can't complain. how about you?"]), "wellbeing");
  if (/what (are|r) (you|u) (doing|up to)|wyd|what you doing/.test(t))
    return say([`${((DC.members.find(x => x.name === who) || {}).activity || "chilling").toLowerCase()} lol. you?`, "procrastinating, professionally", "staring at a loading bar, the usual"]);
  if (/\b(hire|hiring|intern|internship|job|recruit|resume|cv)\b/.test(t))
    return say([`honestly ${FIRST} would be a great hire. ${PROJECTS.length} projects on here already`, `if you're hiring, ${FIRST} built this whole OS in a browser. that's the pitch`, `${FIRST}'s ${ROLE ? ROLE.toLowerCase() : "a developer"} and actually ships stuff. message them through Contact Me`]);
  if ((mm = t.match(/\b(?:i'?m|i am|been|currently)\s+(building|making|working on|coding|learning|studying|playing|watching|listening to|reading|writing)\s+(.+)/))) {
    const thing = dcClean(mm[2], 6);
    const verb = mm[1];
    m.topic = { thing: thing.replace(new RegExp("\\s+(with|in|using)\\s+.*$", "i"), ""), skill };
    if (skill && /build|mak|cod|work/.test(verb)) { const what = m.topic.thing; return ask(say([`ooh ${what}? ${skill} is a great pick for that. how far along are you?`, `wait, ${what} in ${skill}? sounds sick. is it your first ${skill} project?`, `${what} with ${skill}, love it. got it deployed yet?`]), "project"); }
    return ask(say([`ooh ${verb} ${thing}? how's that going?`, `${thing}, nice. what made you pick that?`, `wait that's cool, send it when ${/build|mak|cod|writ/.test(verb) ? "it's done" : "you can"}`, `respect. ${verb} ${thing} is no joke`]), "project");
  }
  if ((mm = t.match(/\bi\s+(love|like|enjoy|really like|adore)\s+(.+)/))) {
    const thing = dcClean(mm[2], 5);
    return say([`${thing} is goated`, `ok same, ${thing} hits`, `what's your favorite thing about ${thing}?`, `${thing}? you have great taste`]);
  }
  if ((mm = t.match(/\bi\s+(hate|don't like|dont like|can't stand|cant stand)\s+(.+)/))) {
    const thing = dcClean(mm[2], 5);
    return say([`${thing} is rough, valid`, `what did ${thing} do to you lol`, `ugh yeah ${thing} can be a lot`]);
  }
  if (proj) {
    const d = String(proj.description || "").replace(/\.$/, "");
    return ask(say([`${proj.title}? ${d ? `the way it ${d.charAt(0).toLowerCase() + d.slice(1)}` : "that one"} is honestly really cool`, `wait ${proj.title} is so good. ${proj.tags && proj.tags.length ? `${proj.tags.join(" + ")} was the right call` : ""}`, `ok ${proj.title} goes hard. you working on anything new?`]), "project");
  }
  if (skill) return say([`${skill}? ${FIRST}'s actually really solid at that`, `${skill} is such a good thing to know right now`, `teach me ${skill} pls, i'm still stuck on <table> layouts`, `${skill} gang`]);
  if (new RegExp(`\\b(${FIRST.toLowerCase()}|${NAME.toLowerCase()}|portfolio|this site|your site|website)\\b`).test(t) && /\b(who|what|tell|about|think|like|rate|opinion)\b/.test(t))
    return say([`${FIRST}'s ${ROLE ? "a " + ROLE.toLowerCase() : "a developer"}${C.tagline ? ". " + C.tagline : ""}`, `honestly the site is crazy. a whole windows 98 with games? 10/10`, `${FIRST} has ${SKILLS.length} skills and ${PROJECTS.length} projects on here. check My Projects`]);
  if (/\b(portfolio|my site|my website|this site|the site|check (it|this) out)\b/.test(t))
    return say(["already looking at it, the boot screen alone is a 10/10", "ok this site is actually insane. a whole windows 98??", `checked it out, ${FIRST}. the minesweeper works and everything`, "bookmarked. the time machine in chrome is my favorite part"]);
  if (/\b(projects?|what (did|have) you build|what.*built)\b/.test(t))
    return say([PROJECTS.length ? `${FIRST}'s projects: ${PROJECTS.map(p => p.title).join(", ")}. open My Projects to see them` : "no projects posted yet, but stay tuned", "check the My Projects folder on the desktop, it's all there"]);
  if (/\bskills?\b/.test(t)) return say([SKILLS.length ? `${FIRST} knows ${SKILLS.slice(0, -1).join(", ")}${SKILLS.length > 1 ? " and " : ""}${SKILLS[SKILLS.length - 1]}` : "skills list coming soon", "open Skills.txt on the desktop, it's got the levels and everything"]);
  if (!t.match(/\bfav/) && (mm = t.match(/\bwhat (?:kind of |type of )?(music|songs?|games?|food|movies?|films?|shows?|languages?|colou?rs?|sites?|websites?)\b.*\b(?:you|u)\b/))) mm = [null, mm[1]];
  else mm = t.match(/\bfav(?:ou?rite)?\s+([a-z]+)/);
  if (mm) {
    const k = mm[1].replace(/s$/, ""), map = { song: "music", band: "music", artist: "music", snack: "food", meal: "food", film: "movie", show: "movie", website: "site", lang: "language", programming: "language", colour: "color" };
    const key = P.fav[k] ? k : map[k];
    if (key) return ask(say([`favorite ${k}? ${P.fav[key]}. what's yours?`, `${P.fav[key]}, easy. you?`]), "fav");
    return say([`ooh favorite ${k}... gotta think about that one. what's yours?`, `${k}? tough call honestly`]);
  }
  if ((mm = t.match(/\b(?:do|did) (?:you|u) (like|love|play|know|use|watch|listen to)\s+(.+)/))) {
    const thing = dcClean(mm[2], 5);
    return say([`${thing}? ${mm[1] === "know" ? "a little bit, why?" : "yeah honestly it's great"}`, `i ${mm[1] === "like" || mm[1] === "love" ? "love" : mm[1]} ${thing}, what about it?`, `${thing} is underrated tbh`]);
  }
  if (/\b(i'?m|i am|im|feeling|feel)\s+(so\s+|really\s+)?(sad|tired|bored|stressed|mad|angry|lonely|down|exhausted)\b/.test(t))
    return ask(say(["aw, that sucks. want to talk about it?", "sending good vibes. maybe a round of minesweeper helps?", "take a break, you deserve it. what's going on?"]), "wellbeing");
  if (/\b(i'?m|i am|im|feeling|feel)\s+(so\s+|really\s+)?(happy|excited|hyped|great|good|amazing)\b/.test(t))
    return say(["LETS GOOO", "love that energy", "yesss what happened?"]);
  if (/\b(lan|play|game|gaming|quake|minesweeper|solitaire|snake)\b/.test(t))
    return ask(say(["down for a game later?", "you trying to get destroyed at quake or what", "have you beaten minesweeper on expert yet?", "lan party saturday, you in?"]), "lan");
  if (/\b(music|song|songs|winamp|mp3|album|band)\b/.test(t))
    return say(["currently looping a 3 minute midi, it's a vibe", "winamp really whips the llama's ass", "send me the mp3, see you in 40 minutes"]);
  if (/^(same|me too|mine too|samee+|same here|ditto)\b/.test(t)) { m.asked = null; return say(["no way, great minds", "twins", "ok we're best friends now", "we have the same brain"]); }
  if (/\b(thanks|thank you|thx|ty)\b/.test(t)) return say(["anytime!", "of course", "np!"]);
  if (/\b(bye|gtg|g2g|cya|goodnight|good night|later)\b/.test(t)) return say(["cya!", "later!", "night!"]);
  if (/\b(lol|lmao|haha|lmfao|rofl)\b|\u{1F602}|\u{1F480}/u.test(t)) return say(["LMAOOO", "i'm crying", "ok that got me", "\u{1F480}\u{1F480}"]);
  if (/\b(you'?re|ur|you are)\s+(cool|awesome|great|funny|the best|smart)\b/.test(t)) return say(["stop you're making me blush", "no YOU are", "aw thanks"]);
  if (/\b(you'?re|ur|you are)\s+(dumb|stupid|bad|annoying|lame|cringe)\b/.test(t)) return say(["wow ok \u{1F62D}", "rude. accurate maybe, but rude", "i'll pretend i didn't see that"]);
  if ((mm = t.match(/^how (?:do|can|would) (?:i|you|we)\s+(.+)/))) {
    const thing = dcClean(mm[1], 7);
    return say([`to ${thing}? start small, google it, then ask in #dev-help`, `honestly for ${thing} i'd break it into tiny steps`, `${thing}... step one: coffee. step two: try it and see what breaks`]);
  }
  if ((mm = t.match(/^should (?:i|we)\s+(.+)/))) {
    const kw = dcKeyword(mm[1]) || dcClean(mm[1], 3);
    return say([`honestly yes, go for it. ${kw} is worth it`, `do it. future you will thank you for the ${kw}`, `i'd say yes, ${kw} pays off`, `yeah, but only if ${kw} actually sounds fun to you`]);
  }
  if ((mm = t.match(/^why\s+(.+)/))) return say(["probably dial-up, honestly. it's always dial-up", `good question. ${dcClean(mm[1], 6)}... no idea, but i'm curious now`, "nobody knows, and that's the beauty of it"]);
  if ((mm = t.match(/^what(?:'s| is| are)\s+(.+)/))) {
    const thing = dcClean(mm[1], 6);
    return say([`${thing}? honestly not 100% sure, what do you think?`, `${thing} is one of those things you have to see to get`, `ask jpeg_jeff about ${thing}, he knows everything`]);
  }
  if (t.endsWith("?")) {
    const kw = dcKeyword(raw);
    return say([kw ? `hmm, ${kw}? i'd say yes but don't quote me` : "i'd say yes but don't quote me", kw ? `good question about ${kw} tbh` : "good question tbh", "have you tried turning it off and on again", "ask Jeeves, he knows"]);
  }
  const kw = dcKeyword(raw);
  if (kw) return say([`${kw}?? say more`, `ok but what made you think about ${kw}`, `${kw} is a whole topic honestly`, `wait, ${kw}. go on`, `i didn't expect ${kw} today but here we are`]);
  return say(["real", "facts", "valid", "say less", "fair point", "lowkey agree"]);
}

// Optional real AI (only when deployed on Vercel with ANTHROPIC_API_KEY set; see api/chat.js)
let DC_AI = null; // null = unknown, false = unavailable, true = working
async function dcAI(who, key, list) {
  if (DC_AI === false || location.protocol === "file:") return null;
  const history = list.slice(-12).map(x => ({ role: x.who === who ? "assistant" : "user", content: x.who === who || x.who === FIRST ? x.text : `${x.who}: ${x.text}` }));
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ bot: who, persona: (DC_PEOPLE[who] || {}).vibe || "", user: FIRST, channel: key, owner: { name: NAME, role: ROLE, tagline: C.tagline || "", skills: SKILLS.slice(0, 12), projects: PROJECTS.slice(0, 8).map(p => p.title) }, history }),
    });
    clearTimeout(timer);
    if (!r.ok) { DC_AI = false; return null; }
    const d = await r.json();
    if (!d || !d.reply) { DC_AI = false; return null; }
    DC_AI = true;
    return String(d.reply).slice(0, 400);
  } catch (e) { clearTimeout(timer); DC_AI = false; return null; }
}

/* ---------- Discord ---------- */
const DC = {
  members: [
    { name: "neon_ninja", color: "#f08c4a", status: "online", activity: "Playing Quake II" },
    { name: "dialup_dana", color: "#38b6c8", status: "idle", activity: "Listening to Winamp" },
    { name: "jpeg_jeff", color: "#9a7bf0", status: "dnd", activity: "Coding in Notepad" },
    { name: "Mom", color: "#e670a8", status: "off", activity: "" },
  ],
  topics: {
    welcome: "Read the rules, then say hi.",
    general: "Hang out. Talk about whatever.",
    "dev-help": "Stuck on code? Paste it here. Nobody judges (much).",
    showcase: `Show off what you built. ${FIRST}'s projects live here.`,
    gaming: "LAN parties, high scores and trash talk.",
    memes: "Dancing babies and hamster dances only.",
  },
  ch: {}, dm: {}, unread: {}, key: "ch:general", status: "online", seeded: false,
  sys: "Discord",
};
const DC_LINES = {
  general: ["my modem just made the scream noise for 4 straight minutes", "anyone else's mouse ball need cleaning or just me", "brb someone picked up the phone and killed my connection", "who has the good screensavers. i need flying toasters", "just burned my first mix CD. took 40 minutes"],
  "dev-help": ["is it bad that my whole site is one big <table>", "pro tip: save your work. i lost 3 hours to a blue screen", "how do I make text blink without the <blink> tag", "why does it look fine in one browser and broken in the other", `@${FIRST} how'd you get the windows to drag like that`],
  showcase: ["these projects are actually so clean", `@${FIRST} how long did the whole site take`, "the boot screen alone is a 10/10", "bookmarking this for inspiration fr"],
  gaming: ["LAN party saturday, bring your own CRT", "just beat my minesweeper expert record", "who wants to get destroyed in quake later", "my CRT weighs 40 pounds and i'm still bringing it"],
  memes: ["*dancing baby.gif*", "all your base are belong to us", "me waiting for one jpeg to load: \u{1F9CD}", "it's peanut butter jelly time"],
};
function dcSeed() {
  if (DC.seeded) return;
  DC.seeded = true;
  const y = "Yesterday at 9:41 PM";
  const m = (who, text, t = y, extra = {}) => ({ who, text, t, reacts: {}, ...extra });
  const sys = text => m(DC.sys, text, y, { sys: true });
  DC.ch = {
    welcome: [
      sys("Welcome to the 1998 Server! Rules: be nice, no spamming, and absolutely no <blink> tags."),
      sys(`${FIRST} just joined the server. Everyone say hi!`),
      m("neon_ninja", `welcome @${FIRST}!! \u{1F44B}`),
      m("dialup_dana", "heyyy welcome in"),
    ],
    general: [
      m("dialup_dana", "morning everyone. my modem took 4 minutes to connect today"),
      m("neon_ninja", "skill issue"),
      m("jpeg_jeff", `@${FIRST} did you finish that portfolio site yet?`),
      m(FIRST, "yep, it's live. it's basically a whole operating system"),
      m("jpeg_jeff", "wait you built windows 98 in a browser???"),
      m("dialup_dana", "the minesweeper works too, i checked. lost twice"),
    ],
    "dev-help": [
      m("jpeg_jeff", "why is my css not loading"),
      m("neon_ninja", "did you link it with <link rel=\"stylesheet\">"),
      m("jpeg_jeff", "...i wrote rel=\"stylsheet\""),
      m("dialup_dana", "a classic. a timeless classic"),
    ],
    showcase: PROJECTS.length
      ? PROJECTS.slice(0, 4).map((p, i) => m(["neon_ninja", "dialup_dana", "jpeg_jeff"][i % 3], [`just tried ${p.title} by @${FIRST}, really clean`, `${p.title} goes hard ngl`, `the way ${p.title} works is so smooth`, `${p.title}?? ok i'm impressed`][i % 4]))
      : [m("neon_ninja", `waiting on @${FIRST} to post something here \u{1F440}`)],
    gaming: [
      m("neon_ninja", "LAN party at mine saturday. bring your own CRT"),
      m("dialup_dana", "my monitor weighs more than me"),
      m("jpeg_jeff", "i'm bringing minesweeper and nothing else"),
    ],
    memes: [
      m("dialup_dana", "*hamster dance plays*"),
      m("neon_ninja", "all your base are belong to us"),
      m("jpeg_jeff", "me waiting for one jpeg to load: \u{1F9CD}"),
    ],
  };
  DC.ch.general[4].reacts = { "\u{1F480}": 2, "\u{1F525}": 1 };
  DC.ch.welcome[2].reacts = { "\u{1F44B}": 3 };
  DC.dm = {
    neon_ninja: [m("neon_ninja", "yo you down for some quake tonight?", "Today at 8:12 AM")],
    Mom: [m("Mom", "Hi sweetie, how do I print the internet? Love, Mom", "Today at 8:12 AM")],
  };
  DC.unread = { "dm:neon_ninja": 1, "dm:Mom": 1, "ch:showcase": PROJECTS.length ? Math.min(4, PROJECTS.length) : 1 };
}
const DC_EMOJI = ["\u{1F600}", "\u{1F602}", "\u{1F525}", "\u{1F480}", "\u{1F44D}", "\u{2764}\u{FE0F}", "\u{1F60E}", "\u{1F914}", "\u{1F62D}", "\u{1F389}", "\u{1F440}", "\u{1F64F}", "\u{1F4AF}", "\u{1F92F}", "\u{1F973}", "\u{1F44B}", "\u{1F60F}", "\u{1F680}"];
function openDiscord(o = {}) {
  dcSeed();
  WM.open("discord", {
    title: "Discord", icon: "discord", w: 900, h: 560, from: o.from,
    render(body, win) {
      body.classList.add("body--flush");
      body.innerHTML = `
        <div class="dc">
          <nav class="dc__rail">
            <button type="button" class="dc__srv" data-srv="home" title="Direct Messages">${icon("discord", 22)}</button>
            <span class="dc__srv-sep"></span>
            <button type="button" class="dc__srv" data-srv="ch" title="The 1998 Server">98</button>
            <button type="button" class="dc__srv" data-srv="add" title="Add a Server">+</button>
          </nav>
          <div class="dc__side">
            <p class="dc__server"></p>
            <div class="dc__side-list"></div>
            <div class="dc__me">
              <button type="button" class="dc__av" style="background:#5865f2;border:0" title="Change status">${esc(FIRST[0] || "?")}<i></i></button>
              <span><b>${esc(FIRST)}</b><small class="dc__me-status"></small></span>
            </div>
          </div>
          <section class="dc__main">
            <header class="dc__header"></header>
            <div class="dc__log" aria-live="polite"></div>
            <p class="dc__typing"></p>
            <form class="dc__form">
              <input class="field dc__input" maxlength="400" autocomplete="off" aria-label="Message">
              <button type="button" class="dc__emoji-btn" title="Emoji"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zM8.5 7.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7.8 13.5h8.4a4.2 4.2 0 01-8.4 0z"/></svg></button>
            </form>
          </section>
          <aside class="dc__members"></aside>
        </div>`;
      const log = $(".dc__log", body), input = $(".dc__input", body), typing = $(".dc__typing", body);
      const member = n => DC.members.find(m => m.name === n);
      const color = who => who === FIRST ? "#5865f2" : who === DC.sys ? "#5865f2" : (member(who) || {}).color || "#949ba4";
      const listOf = key => key.startsWith("dm:") ? (DC.dm[key.slice(3)] = DC.dm[key.slice(3)] || []) : DC.ch[key.slice(3)];
      const statusText = { online: "Online", idle: "Idle", dnd: "Do Not Disturb", off: "Offline" };
      const fmt = text => esc(text).replace(/@(\w+)/g, '<span class="at">@$1</span>');

      const msgHTML = (m, i, arr) => {
        const prev = arr[i - 1];
        const cont = prev && prev.who === m.who && !m.sys && !prev.sys && prev.t === m.t;
        const mention = m.who !== FIRST && new RegExp("@" + FIRST + "\\b", "i").test(m.text);
        const reacts = Object.entries(m.reacts || {}).filter(([, n]) => n > 0)
          .map(([e, n]) => `<button type="button" class="dc__react${(m.mine || {})[e] ? " is-mine" : ""}" data-r="${e}" data-mi="${i}">${e} ${n}</button>`).join("");
        return `<div class="dc__msg${cont ? " is-cont" : ""}${mention ? " is-mention" : ""}" data-mi="${i}">
          ${cont ? "" : `<span class="dc__av" style="background:${color(m.who)}">${esc(m.who[0])}</span>`}
          <div class="dc__body">
            ${cont ? "" : `<span class="dc__who" style="color:${color(m.who)}">${esc(m.who)}</span>${m.sys ? '<span class="dc__tag">APP</span>' : ""}<span class="dc__time">${esc(m.t)}</span>`}
            <p class="dc__text${m.me ? " is-me" : ""}${m.sys ? " dc__sys" : ""}">${m.me ? "* " + esc(m.who) + " " : ""}${fmt(m.text)}</p>
            ${reacts ? `<div class="dc__reacts">${reacts}</div>` : ""}
          </div>
          <div class="dc__hover">${["\u{1F44D}", "\u{1F602}"].map(e => `<button type="button" data-r="${e}" data-mi="${i}" title="React">${e}</button>`).join("")}</div>
        </div>`;
      };
      const drawLog = () => {
        const arr = listOf(DC.key), dm = DC.key.startsWith("dm:"), n = DC.key.slice(3);
        const intro = `<div class="dc__intro"><span class="dc__intro-ic"${dm ? ` style="background:${color(n)}"` : ""}>${dm ? esc(n[0] || "?") : "#"}</span><h3>${dm ? esc(n) : "Welcome to #" + esc(n) + "!"}</h3><p>${dm ? `This is the beginning of your direct message history with <b>${esc(n)}</b>.` : `This is the start of the <b>#${esc(n)}</b> channel.`}</p></div>`;
        log.innerHTML = intro + arr.map(msgHTML).join(""); log.scrollTop = log.scrollHeight;
      };
      const drawRail = () => {
        const home = DC.key.startsWith("dm:"), dmUnread = Object.keys(DC.unread).filter(k => k.startsWith("dm:")).reduce((a, k) => a + DC.unread[k], 0);
        const chUnread = Object.keys(DC.unread).some(k => k.startsWith("ch:") && DC.unread[k]);
        $$(".dc__srv", body).forEach(b => {
          b.classList.toggle("is-active", (b.dataset.srv === "home" && home) || (b.dataset.srv === "ch" && !home));
          const old = $(".dc__pill", b); if (old) old.remove();
          if (b.dataset.srv === "home" && dmUnread) b.insertAdjacentHTML("beforeend", `<span class="dc__pill">${dmUnread}</span>`);
          if (b.dataset.srv === "ch" && chUnread && home) b.insertAdjacentHTML("beforeend", `<span class="dc__pill">&bull;</span>`);
        });
      };
      const drawSide = () => {
        const home = DC.key.startsWith("dm:");
        $(".dc__server", body).textContent = home ? "Direct Messages" : "The 1998 Server";
        const side = $(".dc__side-list", body);
        if (home) {
          const names = Array.from(new Set([...Object.keys(DC.dm), ...DC.members.map(m => m.name)]));
          side.innerHTML = `<p class="dc__heading">Direct Messages</p>` + names.map(n => {
            const k = "dm:" + n, u = DC.unread[k] || 0, mm = member(n) || {};
            return `<button type="button" class="dc__channel${k === DC.key ? " is-active" : ""}${u ? " is-unread" : ""}" data-key="${k}"><span class="dc__av" style="background:${color(n)}">${esc(n[0])}<i class="${mm.status || ""}"></i></span>${esc(n)}${u ? `<span class="dc__pill">${u}</span>` : ""}</button>`;
          }).join("");
        } else {
          side.innerHTML = `<p class="dc__heading">Text Channels</p>` + Object.keys(DC.ch).map(c => {
            const k = "ch:" + c, u = DC.unread[k] || 0;
            return `<button type="button" class="dc__channel${k === DC.key ? " is-active" : ""}${u ? " is-unread" : ""}" data-key="${k}"><span class="dc__hash">#</span>${c}${u ? `<span class="dc__pill">${u}</span>` : ""}</button>`;
          }).join("");
        }
      };
      const drawHeader = () => {
        const h = $(".dc__header", body);
        if (DC.key.startsWith("dm:")) {
          const n = DC.key.slice(3), mm = member(n);
          h.innerHTML = `<i class="dc__hash">@</i><b>${esc(n)}</b><span>${mm ? esc(statusText[mm.status]) + (mm.activity ? " - " + esc(mm.activity) : "") : ""}</span>`;
          input.placeholder = `Message @${n}`;
        } else {
          const c = DC.key.slice(3);
          h.innerHTML = `<i class="dc__hash">#</i><b>${esc(c)}</b><span>${esc(DC.topics[c] || "")}</span>`;
          input.placeholder = `Message #${c}  (try /help)`;
        }
      };
      const drawMembers = () => {
        const groups = [["Online", DC.members.filter(m => m.status !== "off")], ["Offline", DC.members.filter(m => m.status === "off")]];
        $(".dc__members", body).innerHTML = `<p class="dc__heading">Online &mdash; ${groups[0][1].length + 1}</p>
          <div class="dc__member"><span class="dc__av" style="background:#5865f2">${esc(FIRST[0])}<i class="${DC.status === "online" ? "" : DC.status}"></i></span><span><b>${esc(FIRST)}</b><small>That's you</small></span></div>` +
          groups.map(([label, ms], gi) => (gi ? `<p class="dc__heading">${label} &mdash; ${ms.length}</p>` : "") + ms.map(m => `
            <button type="button" class="dc__member${m.status === "off" ? " is-off" : ""}" data-dm="${m.name}" title="Message ${m.name}">
              <span class="dc__av" style="background:${m.color}">${esc(m.name[0])}<i class="${m.status === "online" ? "" : m.status}"></i></span>
              <span><b>${esc(m.name)}</b><small>${esc(m.activity || statusText[m.status])}</small></span>
            </button>`).join("")).join("");
        $(".dc__me-status", body).textContent = statusText[DC.status];
        const dot = $(".dc__me .dc__av i", body); dot.className = DC.status === "online" ? "" : DC.status;
      };
      const drawAll = () => { drawRail(); drawSide(); drawHeader(); drawLog(); drawMembers(); };
      const go = key => { DC.key = key; delete DC.unread[key]; typing.textContent = ""; drawAll(); input.focus(); };
      win.go = go;

      const push = (key, m) => {
        listOf(key).push(m);
        if (key === DC.key && WM.has("discord")) {
          const arr = listOf(key);
          log.insertAdjacentHTML("beforeend", msgHTML(m, arr.length - 1, arr));
          log.scrollTop = log.scrollHeight;
        } else {
          DC.unread[key] = (DC.unread[key] || 0) + 1;
          drawRail(); drawSide();
        }
        if (m.who !== FIRST) {
          if (key !== DC.key || WM.active !== "discord") Sound.play("notify");
          win.notify();
        }
      };
      const sysSay = text => push(DC.key, { who: DC.sys, text, t: "Today at " + fmtTime(), sys: true, reacts: {} });
      const botReply = (key, text) => {
        const isDM = key.startsWith("dm:");
        const online = DC.members.filter(m => m.status !== "off");
        // in channels, whoever you @mention answers; otherwise someone who's online
        const mentioned = online.find(m => new RegExp("@" + m.name + "\\b", "i").test(text));
        const who = isDM ? key.slice(3) : (mentioned || pick(online)).name;
        if (!isDM && !mentioned && Math.random() < 0.1) return;
        const slow = who === "Mom" ? 2500 : 0, started = Date.now();
        setTimeout(() => { if (key === DC.key && WM.has("discord")) typing.textContent = `${who} is typing`; }, 350 + slow / 2);
        dcAI(who, key, listOf(key)).then(ai => {
          const reply = ai || dcBrain(who, text);
          const wait = Math.max(0, 900 + Math.min(reply.length * 25, 1600) + slow - (Date.now() - started));
          setTimeout(() => {
            if (!WM.has("discord")) return;
            if (key === DC.key) typing.textContent = "";
            push(key, { who, text: reply, t: "Today at " + fmtTime(), reacts: {} });
            // sometimes a second friend chimes in on the channel
            if (!isDM && Math.random() < 0.3) {
              const other = pick(online.filter(m => m.name !== who && m.name !== "Mom"));
              if (other) setTimeout(() => {
                if (!WM.has("discord")) return;
                push(key, { who: other.name, text: dcStyle(other.name, dcPick(other.name, [`lol ${who} is right`, `${who} said it better than me`, `nah ${who} is wrong and you know it`, `+1 to what ${who} said`, `wait ${who}, since when lol`])), t: "Today at " + fmtTime(), reacts: {} });
              }, 1800 + Math.random() * 1500);
            }
          }, wait);
        });
      };
      const COMMANDS = {
        help: () => sysSay("Try: /roll [sides], /flip, /8ball <question>, /joke, /shrug, /me <action>, /status <online|idle|dnd>, /clear"),
        roll: a => { const n = Math.max(2, Math.min(1000, parseInt(a, 10) || 6)); sysSay(`${FIRST} rolled a ${1 + Math.floor(Math.random() * n)} (1-${n})`); },
        flip: () => sysSay(`${FIRST} flipped a coin: ${Math.random() < 0.5 ? "Heads" : "Tails"}`),
        "8ball": a => sysSay(a ? `\u{1F3B1} ${pick(["It is certain.", "Ask again later.", "Don't count on it.", "Signs point to yes.", "My sources say no.", "Without a doubt.", "Reply hazy, try again."])}` : "Ask a question: /8ball will I get the internship?"),
        joke: () => sysSay(pick(["Why do programmers prefer dark mode? Because light attracts bugs.", "There are 10 kinds of people: those who understand binary and those who don't.", "I would tell you a UDP joke, but you might not get it.", "My code works and I don't know why. My code doesn't work and I don't know why."])),
        shrug: a => send((a ? a + " " : "") + "\u00AF\\_(\u30C4)_/\u00AF"),
        me: a => { if (a) push(DC.key, { who: FIRST, text: a, t: "Today at " + fmtTime(), me: true, reacts: {} }); },
        status: a => { if (statusText[a] && a !== "off") { DC.status = a; drawMembers(); sysSay(`Status set to ${statusText[a]}.`); } else sysSay("Try /status online, /status idle or /status dnd"); },
        clear: () => { listOf(DC.key).length = 0; drawLog(); },
      };
      const send = text => {
        push(DC.key, { who: FIRST, text, t: "Today at " + fmtTime(), reacts: {} });
        botReply(DC.key, text);
      };

      $(".dc__form", body).addEventListener("submit", e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        $(".dc__emoji", body)?.remove();
        if (text.startsWith("/")) {
          const [cmd, ...rest] = text.slice(1).split(" ");
          const fn = COMMANDS[cmd.toLowerCase()];
          if (fn) fn(rest.join(" ").trim()); else sysSay(`Unknown command "/${cmd}". Type /help.`);
          return;
        }
        send(text);
      });
      $(".dc__emoji-btn", body).addEventListener("click", () => {
        const open = $(".dc__emoji", body);
        if (open) { open.remove(); return; }
        const p = document.createElement("div");
        p.className = "dc__emoji";
        p.innerHTML = DC_EMOJI.map(e => `<button type="button">${e}</button>`).join("");
        p.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { insertAtCursor(input, b.textContent); p.remove(); } });
        $(".dc__form", body).appendChild(p);
      });
      input.addEventListener("keydown", e => { if (e.key === "Escape") $(".dc__emoji", body)?.remove(); });
      body.addEventListener("click", e => {
        const k = e.target.closest("[data-key]"); if (k) { go(k.dataset.key); return; }
        const d = e.target.closest("[data-dm]"); if (d) { go("dm:" + d.dataset.dm); return; }
        const s = e.target.closest("[data-srv]");
        if (s) {
          if (s.dataset.srv === "add") msgBox({ title: "Add a Server", icon: "info", text: "Creating servers requires Windows 2000." });
          else if (s.dataset.srv === "home") go(Object.keys(DC.unread).find(x => x.startsWith("dm:")) || "dm:neon_ninja");
          else go(Object.keys(DC.unread).find(x => x.startsWith("ch:")) || "ch:general");
          return;
        }
        const r = e.target.closest("[data-r]");
        if (r) {
          const m = listOf(DC.key)[+r.dataset.mi]; if (!m) return;
          m.reacts = m.reacts || {}; m.mine = m.mine || {};
          const em = r.dataset.r;
          if (m.mine[em]) { m.mine[em] = false; m.reacts[em]--; } else { m.mine[em] = true; m.reacts[em] = (m.reacts[em] || 0) + 1; }
          const st = log.scrollTop; drawLog(); log.scrollTop = st;
        }
      });
      $(".dc__me .dc__av", body).addEventListener("click", () => {
        DC.status = { online: "idle", idle: "dnd", dnd: "online" }[DC.status];
        drawMembers();
      });

      // the server feels alive: friends post now and then while Discord is open
      const ambient = () => {
        win.ambient = setTimeout(() => {
          if (!WM.has("discord")) return;
          const chans = Object.keys(DC_LINES), c = pick(chans), who = pick(DC.members.filter(m => m.status !== "off")).name;
          const mention = Math.random() < 0.2;
          push("ch:" + c, { who, text: (mention ? `@${FIRST} ` : "") + dcPick("ambient:" + c, DC_LINES[c]), t: "Today at " + fmtTime(), reacts: {} });
          ambient();
        }, rand(22000, 45000));
      };
      ambient();
      go(DC.key);
    },
    onFocus: w => { if (w.body) { const i = $(".dc__input", w.body); } },
    onOpen: w => $(".dc__input", w.body).focus(),
    onClose: w => clearTimeout(w.ambient),
  });
}

/* ---------- GitHub ---------- */
// Loads your real public profile from the GitHub API (no key needed) using the
// username in content.js -> social.github. If that isn't set, or the API is
// unreachable, it shows your projects from content.js instead.
const GH_USER = (() => { const m = String(GITHUB_URL).match(/github\.com\/([A-Za-z0-9-]+)/i); return m ? m[1] : ""; })();
const GH_PLACEHOLDER = !GH_USER || /^your-?username$/i.test(GH_USER);
const LANG_COLORS = { JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c", Python: "#3572A5", Java: "#b07219", "C#": "#178600", "C++": "#f34b7d", C: "#555555", PHP: "#4F5D95", Ruby: "#701516", Go: "#00ADD8", Rust: "#dea584", Swift: "#F05138", Kotlin: "#A97BFF", Shell: "#89e051", Vue: "#41b883", Svelte: "#ff3e00", Dart: "#00B4AB", Lua: "#000080" };
const slugify = s => String(s || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
function guessLang(tags = []) {
  const t = tags.map(x => String(x).toLowerCase());
  if (t.some(x => x.includes("typescript"))) return "TypeScript";
  if (t.some(x => x.includes("react") || x.includes("javascript") || x === "js" || x.includes("node"))) return "JavaScript";
  if (t.some(x => x.includes("python"))) return "Python";
  if (t.some(x => x.includes("java"))) return "Java";
  if (t.some(x => x.includes("css"))) return "CSS";
  if (t.some(x => x.includes("html"))) return "HTML";
  return tags[0] || "";
}
const ghFetch = (path, raw) => fetch("https://api.github.com" + path, { headers: { Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json" } })
  .then(r => { if (!r.ok) throw new Error(r.status === 403 ? "rate limited" : "HTTP " + r.status); return raw ? r.text() : r.json(); });
function ghLocal(reason) {
  return {
    live: false, reason,
    user: { login: GH_PLACEHOLDER ? SLUG : GH_USER, name: NAME, bio: [ROLE, C.tagline].filter(Boolean).join(". "), avatar: C.heroImage || "", followers: 0, following: 0, location: "", blog: "", html_url: GITHUB_URL || "https://github.com" },
    repos: PROJECTS.map((p, i) => ({ name: slugify(p.title), title: p.title, description: p.description || "", language: guessLang(p.tags || []), stars: 0, forks: 0, updated: "", html_url: p.github || "", homepage: p.demo || "", topics: p.tags || [], local: i })),
    events: [],
  };
}
async function ghData() {
  if (GH_PLACEHOLDER) return ghLocal("placeholder");
  try { const c = JSON.parse(session.get("gh:" + GH_USER) || "null"); if (c && Date.now() - c.t < 10 * 60000) return c.d; } catch (e) {}
  try {
    const [u, r] = await Promise.all([ghFetch(`/users/${GH_USER}`), ghFetch(`/users/${GH_USER}/repos?per_page=100&sort=pushed`)]);
    const ev = await ghFetch(`/users/${GH_USER}/events/public?per_page=100`).catch(() => []);
    const d = {
      live: true,
      user: { login: u.login, name: u.name || u.login, bio: u.bio || "", avatar: u.avatar_url, followers: u.followers, following: u.following, location: u.location || "", blog: u.blog || "", html_url: u.html_url, public_repos: u.public_repos },
      repos: r.filter(x => !x.fork).map(x => ({ name: x.name, description: x.description || "", language: x.language || "", stars: x.stargazers_count, forks: x.forks_count, updated: x.pushed_at, html_url: x.html_url, homepage: x.homepage || "", topics: x.topics || [], full: x.full_name })),
      events: (Array.isArray(ev) ? ev : []).map(e => ({ type: e.type, repo: e.repo && e.repo.name, date: e.created_at, commits: e.payload && e.payload.commits ? e.payload.commits.length : 0 })),
    };
    session.set("gh:" + GH_USER, JSON.stringify({ t: Date.now(), d }));
    return d;
  } catch (e) { return ghLocal(String(e.message || e)); }
}
function mdToHtml(md) {
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/!\[([^\]]*)\]\((https:[^)\s]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  let out = "", code = false, list = false;
  const closeList = () => { if (list) { out += "</ul>"; list = false; } };
  String(md || "").replace(/\r/g, "").split("\n").forEach(raw => {
    if (raw.trim().startsWith("```")) { if (code) { out += "</code></pre>"; code = false; } else { closeList(); out += "<pre><code>"; code = true; } return; }
    if (code) { out += esc(raw) + "\n"; return; }
    const line = raw.replace(/<\/?[a-z][^>]*>/gi, "");
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)/))) { closeList(); const n = Math.min(m[1].length + 1, 4); out += `<h${n}>${inline(m[2])}</h${n}>`; }
    else if ((m = line.match(/^\s*[-*+]\s+(.*)/))) { if (!list) { out += "<ul>"; list = true; } out += `<li>${inline(m[1])}</li>`; }
    else if (!line.trim()) closeList();
    else { closeList(); out += `<p>${inline(line)}</p>`; }
  });
  if (code) out += "</code></pre>";
  closeList();
  return out;
}
const ago = iso => {
  if (!iso) return "";
  const d = (Date.now() - new Date(iso)) / 86400000;
  if (d < 1) return "today"; if (d < 2) return "yesterday"; if (d < 30) return `${Math.floor(d)} days ago`;
  return "on " + new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
// Primer Octicons (16px, MIT) used by the GitHub app instead of emoji.
const GH_OCT = {
  mark: "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
  people: "M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z",
  location: "m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z",
  link: "m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z",
  repo: "M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z",
  file: "M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z",
  dir: "M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z",
  star: "M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z",
  starFill: "M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z",
  fork: "M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z",
  code: "m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z",
};
const ghOct = (k, size = 16) => `<svg class="gh__oct gh__oct--${k}" viewBox="0 0 16 16" width="${size}" height="${size}" fill="currentColor" aria-hidden="true"><path d="${GH_OCT[k]}"/></svg>`;
function openGitHubApp(o = {}) {
  WM.open("github", {
    title: "GitHub", icon: "github", w: 860, h: 580, from: o.from, status: ["Connecting to api.github.com..."],
    render(body, win) {
      body.classList.add("body--flush");
      body.innerHTML = `<div class="gh"><div class="gh__loading"><span class="gh__spinner"></span>Loading profile...</div></div>`;
      const root = $(".gh", body);
      let data = null, tab = "overview", filter = "";
      const lang = l => l ? `<span class="gh__lang"><i style="background:${LANG_COLORS[l] || "#8b949e"}"></i>${esc(l)}</span>` : "";
      const repoCard = (r, i) => `
        <div class="gh__card">
          <div class="gh__card-top">${ghOct("repo")}<a class="gh__repo-link" data-repo="${i}">${esc(r.name)}</a><span class="gh__badge">Public</span></div>
          <p>${esc(r.description || "No description provided.")}</p>
          <div class="gh__meta">${lang(r.language)}${r.stars ? `<span>${ghOct("star", 14)} ${r.stars}</span>` : ""}${r.forks ? `<span>${ghOct("fork", 14)} ${r.forks}</span>` : ""}</div>
        </div>`;
      const pinned = () => {
        const linked = PROJECTS.map(p => p.github).filter(Boolean);
        return data.repos.map((r, i) => ({ r, i, score: (linked.includes(r.html_url) ? 1000 : 0) + r.stars * 2 + (r.updated ? new Date(r.updated).getTime() / 1e12 : 0) }))
          .sort((a, b) => b.score - a.score).slice(0, 6);
      };
      const graph = () => {
        const weeks = 40, days = weeks * 7, counts = {};
        data.events.forEach(e => { const k = e.date.slice(0, 10); counts[k] = (counts[k] || 0) + Math.max(1, e.commits); });
        const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1 + (6 - start.getDay()));
        let cells = "", total = 0;
        for (let w = 0; w < weeks; w++) {
          cells += "<div class='gh__week'>";
          for (let d = 0; d < 7; d++) {
            const day = new Date(start); day.setDate(start.getDate() + w * 7 + d - 6);
            const k = day.toISOString().slice(0, 10), n = counts[k] || 0;
            total += n;
            const lvl = n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : n < 7 ? 3 : 4;
            cells += `<i class="l${lvl}" title="${n} contribution${n === 1 ? "" : "s"} on ${day.toDateString()}"></i>`;
          }
          cells += "</div>";
        }
        return `<div class="gh__box"><h3>${total} contributions in the last ${weeks} weeks</h3>
          <div class="gh__graph">${cells}</div>
          <div class="gh__legend">Based on public activity. <span>Less <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> More</span></div></div>`;
      };
      const activity = () => {
        if (!data.events.length) return "";
        const label = { PushEvent: "Pushed to", CreateEvent: "Created", WatchEvent: "Starred", PullRequestEvent: "Opened a pull request in", IssuesEvent: "Opened an issue in", ForkEvent: "Forked", ReleaseEvent: "Published a release in" };
        return `<div class="gh__box"><h3>Recent activity</h3><ul class="gh__activity">${data.events.slice(0, 8).map(e => `<li><span>${esc(label[e.type] || e.type.replace(/Event$/, ""))} <b>${esc(e.repo || "")}</b></span><small>${ago(e.date)}</small></li>`).join("")}</ul></div>`;
      };
      const readme = () => `
        <div class="gh__box gh__readme">
          <small class="gh__path">${esc(data.user.login)} / README.md</small>
          <h2>Hi there, I'm ${esc(FIRST)} &#128075;</h2>
          ${ABOUT_PARAS.slice(0, 2).map(p => `<p>${esc(p)}</p>`).join("")}
          ${SKILLS.length ? `<p>Tech: ${SKILLS.map(esc).join(", ")}</p>` : ""}
        </div>`;
      const views = {
        overview: () => `${readme()}<h3 class="gh__h">Pinned</h3><div class="gh__grid">${pinned().map(x => repoCard(x.r, x.i)).join("") || "<p class='gh__muted'>No repositories yet.</p>"}</div>${data.live ? graph() : ""}${activity()}`,
        repos: () => {
          const list = data.repos.map((r, i) => ({ r, i })).filter(x => !filter || (x.r.name + " " + x.r.description).toLowerCase().includes(filter));
          return `<input class="gh__filter" placeholder="Find a repository..." value="${esc(filter)}">
            <ul class="gh__list">${list.map(({ r, i }) => `<li><div><a class="gh__repo-link" data-repo="${i}">${esc(r.name)}</a><span class="gh__badge">Public</span><p>${esc(r.description)}</p>
              <div class="gh__meta">${lang(r.language)}${r.stars ? `<span>${ghOct("star", 14)} ${r.stars}</span>` : ""}${r.updated ? `<span>Updated ${ago(r.updated)}</span>` : ""}</div></div>
              <button type="button" class="gh__btn" data-star="${i}">${ghOct("star")} Star</button></li>`).join("") || "<li class='gh__muted'>No repositories match.</li>"}</ul>`;
        },
      };
      const shell = inner => {
        const u = data.user;
        const avatar = `<span>${esc(initials(u.name))}</span>` + (u.avatar ? `<img src="${esc(u.avatar)}" alt="" onerror="this.remove()">` : "");
        const hasLink = u.html_url && !GH_PLACEHOLDER;
        return `
          <header class="gh__top">
            <span class="gh__mark">${ghOct("mark", 32)}</span>
            <b class="gh__login-top">${esc(u.login)}</b>
            <input class="gh__search" placeholder="Search or jump to..." aria-label="Search">
            <span class="gh__me">${esc((u.name || "?")[0])}</span>
          </header>
          <nav class="gh__tabs">
            <button type="button" data-tab="overview" class="${tab === "overview" ? "is-on" : ""}">Overview</button>
            <button type="button" data-tab="repos" class="${tab === "repos" ? "is-on" : ""}">Repositories <span class="gh__count">${data.repos.length}</span></button>
          </nav>
          <div class="gh__layout">
            <aside class="gh__side">
              <div class="gh__avatar">${avatar}</div>
              <h1>${esc(u.name)}</h1>
              <p class="gh__login">${esc(u.login)}</p>
              ${u.bio ? `<p class="gh__bio">${esc(u.bio)}</p>` : ""}
              <button type="button" class="gh__btn gh__btn--wide" data-follow>${store.get("ghFollow", false) ? "Unfollow" : "Follow"}</button>
              <p class="gh__muted">${ghOct("people")} <b>${u.followers + (store.get("ghFollow", false) ? 1 : 0)}</b> followers &middot; <b>${u.following}</b> following</p>
              ${u.location ? `<p class="gh__muted">${ghOct("location")} ${esc(u.location)}</p>` : ""}
              ${u.blog ? `<p class="gh__muted">${ghOct("link")} <a href="${esc(/^https?:/.test(u.blog) ? u.blog : "https://" + u.blog)}" target="_blank" rel="noopener">${esc(u.blog)}</a></p>` : ""}
              ${hasLink ? `<p class="gh__muted">${ghOct("link")} <a href="${esc(u.html_url)}" target="_blank" rel="noopener">${esc(u.html_url.replace(/^https?:\/\//, ""))}</a></p>` : ""}
            </aside>
            <main class="gh__main">${inner}</main>
          </div>`;
      };
      const draw = () => { root.classList.remove("is-repo"); root.innerHTML = shell(views[tab]()); win.setTitle(`${data.user.login} - GitHub`); };
      const openRepo = async i => {
        const r = data.repos[i];
        root.classList.add("is-repo");
        root.innerHTML = shell(`<div class="gh__loading"><span class="gh__spinner"></span>Opening ${esc(r.name)}...</div>`);
        win.setTitle(`${data.user.login}/${r.name} - GitHub`);
        let files = null, md = "";
        if (data.live && r.full) {
          win.setStatus([`Loading ${r.full}...`]);
          files = await ghFetch(`/repos/${r.full}/contents`).catch(() => null);
          md = await ghFetch(`/repos/${r.full}/readme`, true).catch(() => "");
          win.setStatus(["Done"]);
        }
        if (!files) files = [];
        if (!md) {
          const p = r.local !== undefined ? PROJECTS[r.local] : null;
          md = `# ${p ? p.title : r.name}\n\n${r.description || ""}\n\n${r.topics.length ? "## Built with\n" + r.topics.map(t => "- " + t).join("\n") + "\n" : ""}${r.homepage ? `\n[Live demo](${r.homepage})` : ""}`;
        }
        files.sort((a, b) => (a.type === "dir" ? 0 : 1) - (b.type === "dir" ? 0 : 1) || a.name.localeCompare(b.name));
        $(".gh__main", root).innerHTML = `
          <div class="gh__repo-head">
            <h2>${ghOct("repo")} <a data-tab="${tab}">${esc(data.user.login)}</a> / <b>${esc(r.name)}</b></h2>
            <span class="gh__badge">Public</span>
          </div>
          <p class="gh__muted">${esc(r.description)}</p>
          <div class="gh__repo-actions">
            ${r.html_url ? `<a class="gh__btn gh__btn--green" href="${esc(r.html_url)}" target="_blank" rel="noopener">${ghOct("code")} Code</a>` : ""}
            ${r.homepage ? `<a class="gh__btn" href="${esc(r.homepage)}" target="_blank" rel="noopener">Live demo</a>` : ""}
            ${lang(r.language)}${r.stars ? `<span class="gh__muted">${ghOct("star", 14)} ${r.stars}</span>` : ""}
          </div>
          ${files.length ? `<table class="gh__files"><tbody>${files.slice(0, 40).map(f => `<tr><td>${f.type === "dir" ? `<span class="gh__ico gh__ico--dir">${ghOct("dir")}</span>` : `<span class="gh__ico">${ghOct("file")}</span>`}${f.html_url ? `<a href="${esc(f.html_url)}" target="_blank" rel="noopener">${esc(f.name)}</a>` : esc(f.name)}</td></tr>`).join("")}</tbody></table>` : ""}
          <div class="gh__box gh__readme"><small class="gh__path">README.md</small>${mdToHtml(md)}</div>`;
      };
      root.addEventListener("click", e => {
        const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; draw(); return; }
        const r = e.target.closest("[data-repo]"); if (r) { openRepo(+r.dataset.repo); return; }
        const s = e.target.closest("[data-star]"); if (s) { s.classList.toggle("is-on"); s.innerHTML = s.classList.contains("is-on") ? `${ghOct("starFill")} Starred` : `${ghOct("star")} Star`; return; }
        if (e.target.closest("[data-follow]")) { store.set("ghFollow", !store.get("ghFollow", false)); draw(); }
      });
      root.addEventListener("input", e => {
        if (e.target.classList.contains("gh__filter")) {
          filter = e.target.value.toLowerCase();
          const pos = e.target.selectionStart;
          draw();
          const f = $(".gh__filter", root); f.focus(); f.setSelectionRange(pos, pos);
        }
      });
      root.addEventListener("keydown", e => {
        if (e.key === "Enter" && e.target.classList.contains("gh__search")) {
          filter = e.target.value.toLowerCase(); tab = "repos"; draw();
        }
      });
      ghData().then(d => {
        if (!WM.has("github")) return;
        data = d;
        if (!d.live && d.reason && d.reason !== "placeholder") console.info("[gh]", d.reason);
        win.setStatus([d.live ? `github.com/${d.user.login}` : "Done"]);
        draw();
      });
    },
  });
}

/* ---------- Solitaire ---------- */
const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"];
const RANKS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const redSuit = s => s === 1 || s === 2;
const SOL_PIPS = [0, [[.5, .5]], [[.5, 0], [.5, 1]], [[.5, 0], [.5, .5], [.5, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [.5, .5], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, .5], [1, .5], [0, 1], [1, 1]], [[0, 0], [1, 0], [.5, .25], [0, .5], [1, .5], [0, 1], [1, 1]], [[0, 0], [1, 0], [.5, .25], [0, .5], [1, .5], [.5, .75], [0, 1], [1, 1]], [[0, 0], [1, 0], [0, 1 / 3], [1, 1 / 3], [.5, .5], [0, 2 / 3], [1, 2 / 3], [0, 1], [1, 1]], [[0, 0], [1, 0], [.5, 1 / 6], [0, 1 / 3], [1, 1 / 3], [0, 2 / 3], [1, 2 / 3], [.5, 5 / 6], [0, 1], [1, 1]]];
function openSolitaire(o = {}) {
  WM.open("solitaire", {
    title: "Solitaire", icon: "solitaire", w: 660, h: 540, from: o.from, status: ["Score: 0", "Time: 0"],
    render(body, win) {
      body.classList.add("body--flush");
      body.innerHTML = `<div class="sol"><div class="sol__board"></div><canvas class="sol__fx" hidden></canvas></div>`;
      const wrap = $(".sol", body), board = $(".sol__board", body), fx = $(".sol__fx", body);
      const els = new Map(), pos = new Map();
      let st = null, undo = [], timer = null, raf = 0, lastClick = { id: -1, t: 0 };
      let cw = 64, ch = 88, gap = 12, fanUp = 20, fanDown = 6;
      const PAD = 12;
      const draw3 = () => store.get("solDraw3", false);
      const measure = () => {
        const W = Math.max(300, board.clientWidth || 620);
        cw = Math.max(38, Math.min(71, Math.floor((W - PAD * 2 - 6 * 8) / 7)));
        ch = Math.round(cw * 1.36);
        gap = Math.floor((W - PAD * 2 - cw * 7) / 6);
        fanUp = Math.round(ch * 0.23); fanDown = Math.round(ch * 0.07);
        board.style.setProperty("--cw", cw + "px"); board.style.setProperty("--ch", ch + "px");
      };
      const colX = i => PAD + i * (cw + gap);
      const tabY = () => PAD + ch + Math.round(ch * 0.2);
      const all = () => [st.stock, st.waste, ...st.found, ...st.tab];
      const byId = id => { for (const p of all()) for (const c of p) if (c.id === id) return c; return null; };
      const where = c => {
        if (st.stock.includes(c)) return { pile: "stock", idx: st.stock.indexOf(c) };
        if (st.waste.includes(c)) return { pile: "waste", idx: st.waste.indexOf(c) };
        for (let i = 0; i < 4; i++) if (st.found[i].includes(c)) return { pile: "found", i, idx: st.found[i].indexOf(c) };
        for (let i = 0; i < 7; i++) if (st.tab[i].includes(c)) return { pile: "tab", i, idx: st.tab[i].indexOf(c) };
        return null;
      };
      const pileOf = w => w.pile === "stock" ? st.stock : w.pile === "waste" ? st.waste : w.pile === "found" ? st.found[w.i] : st.tab[w.i];
      const cardHTML = c => {
        const r = RANKS[c.r], s = SUITS[c.s], face = c.r > 10;
        const mid = face ? `<span class="sol__pip sol__pip--face"><b>${r}</b><small>${s}</small></span>` : `<span class="sol__pips${c.r === 1 ? " sol__pips--a" : ""}">${SOL_PIPS[c.r].map(([x, y]) => `<i style="left:${x * 100}%;top:${y * 100}%${y > .5 ? ";transform:translate(-50%,-50%) rotate(180deg)" : ""}">${s}</i>`).join("")}</span>`;
        return `<span class="sol__face${redSuit(c.s) ? " is-red" : ""}"><span class="sol__corner">${r}<br>${s}</span>${mid}<span class="sol__corner sol__corner--b">${r}<br>${s}</span></span><span class="sol__back"></span>`;
      };
      const build = () => {
        board.innerHTML = `<div class="sol__slot sol__slot--stock" data-slot="stock"></div><div class="sol__slot" data-slot="waste"></div>` +
          [0, 1, 2, 3].map(i => `<div class="sol__slot sol__slot--found" data-slot="f${i}"></div>`).join("") +
          [0, 1, 2, 3, 4, 5, 6].map(i => `<div class="sol__slot" data-slot="t${i}"></div>`).join("");
        els.clear();
        all().flat().forEach(c => {
          const el = document.createElement("div");
          el.className = "sol__card no-anim";
          el.dataset.id = c.id;
          el.innerHTML = cardHTML(c);
          board.appendChild(el);
          els.set(c.id, el);
        });
      };
      const layout = (instant = false) => {
        measure();
        const place = (sel, x, y) => { const s = $(sel, board); s.style.transform = `translate(${x}px,${y}px)`; };
        place('[data-slot="stock"]', colX(0), PAD);
        place('[data-slot="waste"]', colX(1), PAD);
        for (let i = 0; i < 4; i++) place(`[data-slot="f${i}"]`, colX(3 + i), PAD);
        for (let i = 0; i < 7; i++) place(`[data-slot="t${i}"]`, colX(i), tabY());
        const set = (c, x, y, z) => {
          pos.set(c.id, { x, y });
          const el = els.get(c.id);
          if (!el) return;
          el.classList.toggle("no-anim", instant);
          el.classList.toggle("is-up", c.up);
          el.style.transform = `translate(${x}px,${y}px)`;
          el.style.zIndex = z;
        };
        st.stock.forEach((c, i) => set(c, colX(0) + Math.min(i, 6) * 0.4, PAD - Math.min(i, 6) * 0.4, 10 + i));
        const fanFrom = draw3() ? Math.max(0, st.waste.length - 3) : st.waste.length;
        st.waste.forEach((c, i) => set(c, colX(1) + (i >= fanFrom ? (i - fanFrom) * Math.round(cw * 0.22) : 0), PAD, 10 + i));
        st.found.forEach((f, fi) => f.forEach((c, i) => set(c, colX(3 + fi), PAD, 10 + i)));
        let maxY = 0;
        st.tab.forEach((t, ti) => {
          let y = tabY();
          t.forEach((c, i) => { set(c, colX(ti), y, 100 + i); y += c.up ? fanUp : fanDown; });
          maxY = Math.max(maxY, y);
        });
        board.style.minHeight = (maxY + ch + PAD) + "px";
        if (instant) requestAnimationFrame(() => requestAnimationFrame(() => els.forEach(el => el.classList.remove("no-anim"))));
      };
      const status = () => win.setStatus([`Score: ${st.score}`, `Time: ${st.t}`]);
      const save = () => { undo.push(JSON.stringify(st)); if (undo.length > 80) undo.shift(); };
      const startTimer = () => { if (!timer) timer = setInterval(() => { st.t++; status(); }, 1000); };
      const stopTimer = () => { clearInterval(timer); timer = null; };
      const stopFx = () => { cancelAnimationFrame(raf); raf = 0; fx.hidden = true; };
      win.stop = () => { stopTimer(); stopFx(); };

      win.deal = () => {
        stopFx(); stopTimer();
        const d = [];
        let id = 0;
        for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) d.push({ id: id++, s, r, up: false });
        for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
        st = { stock: [], waste: [], found: [[], [], [], []], tab: [[], [], [], [], [], [], []], score: 0, t: 0 };
        for (let t = 0; t < 7; t++) { for (let k = 0; k <= t; k++) st.tab[t].push(d.pop()); st.tab[t][t].up = true; }
        st.stock = d;
        undo = [];
        build();
        // deal animation: every card starts on the stock pile and slides out
        measure();
        els.forEach(el => { el.classList.add("no-anim"); el.style.transform = `translate(${colX(0)}px,${PAD}px)`; });
        requestAnimationFrame(() => requestAnimationFrame(() => { els.forEach(el => el.classList.remove("no-anim")); layout(); }));
        Sound.play("deal");
        status();
      };
      win.undo = () => { const s = undo.pop(); if (s) { st = JSON.parse(s); layout(); status(); } };
      win.relayout = () => { if (st) layout(true); };

      const afterMove = () => {
        st.tab.forEach(t => { const top = t[t.length - 1]; if (top && !top.up) { top.up = true; st.score += 5; } });
        startTimer();
        layout(); status();
        Sound.play("deal");
        if (st.found.every(f => f.length === 13)) celebrate();
      };
      const tryMove = (group, from, to) => {
        const c = group[0];
        if (to.pile === "found") {
          if (group.length !== 1) return false;
          const f = st.found[to.i], top = f[f.length - 1];
          if (!(top ? top.s === c.s && c.r === top.r + 1 : c.r === 1)) return false;
          save(); pileOf(from).splice(-1, 1); f.push(c);
          if (from.pile !== "found") st.score += 10;
          afterMove(); return true;
        }
        if (to.pile === "tab") {
          if (from.pile === "tab" && from.i === to.i) return false;
          const t = st.tab[to.i], top = t[t.length - 1];
          if (!(top ? top.up && redSuit(top.s) !== redSuit(c.s) && c.r === top.r - 1 : c.r === 13)) return false;
          save(); pileOf(from).splice(-group.length, group.length); t.push(...group);
          if (from.pile === "waste") st.score += 5;
          if (from.pile === "found") st.score = Math.max(0, st.score - 15);
          afterMove(); return true;
        }
        return false;
      };
      const toFoundation = c => {
        const w = where(c);
        if (!w || w.idx !== pileOf(w).length - 1) return false;
        for (let i = 0; i < 4; i++) if (tryMove([c], w, { pile: "found", i })) return true;
        return false;
      };
      const clickStock = () => {
        save();
        if (!st.stock.length) {
          if (!st.waste.length) { undo.pop(); return; }
          st.stock = st.waste.reverse().map(c => ({ ...c, up: false }));
          st.waste = [];
          build(); layout(true);
        } else {
          for (let k = 0; k < (draw3() ? 3 : 1) && st.stock.length; k++) { const c = st.stock.pop(); c.up = true; st.waste.push(c); }
          layout();
        }
        startTimer(); Sound.play("deal");
      };
      const dropTarget = (cx, cy) => {
        const col = Math.round((cx - PAD - cw / 2) / (cw + gap));
        if (col < 0 || col > 6 || Math.abs(cx - (colX(col) + cw / 2)) > cw * 0.9) return null;
        if (cy < tabY() - ch * 0.15) return col >= 3 ? { pile: "found", i: col - 3 } : null;
        return { pile: "tab", i: col };
      };

      board.addEventListener("contextmenu", e => e.preventDefault());
      board.addEventListener("pointerdown", e => {
        if (e.button !== 0) return;
        if (raf) { stopFx(); return; }
        const el = e.target.closest(".sol__card");
        if (!el) { if (e.target.closest('[data-slot="stock"]')) clickStock(); return; }
        const c = byId(+el.dataset.id), w = where(c);
        if (!c || !w) return;
        if (w.pile === "stock") { clickStock(); return; }
        if (!c.up) {
          if (w.pile === "tab" && w.idx === st.tab[w.i].length - 1) { save(); c.up = true; st.score += 5; layout(); status(); }
          return;
        }
        if (w.pile !== "tab" && w.idx !== pileOf(w).length - 1) return;
        const group = w.pile === "tab" ? st.tab[w.i].slice(w.idx) : [c];
        const gEls = group.map(g => els.get(g.id));
        const sx = e.clientX, sy = e.clientY;
        let moved = false;
        e.preventDefault();
        board.setPointerCapture(e.pointerId);
        const move = ev => {
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
          if (!moved) { moved = true; gEls.forEach((g, k) => { g.classList.add("is-drag"); g.style.zIndex = 1000 + k; }); }
          group.forEach((g, k) => { const p = pos.get(g.id); gEls[k].style.transform = `translate(${p.x + dx}px,${p.y + dy}px)`; });
        };
        const up = ev => {
          board.removeEventListener("pointermove", move);
          board.removeEventListener("pointerup", up);
          board.removeEventListener("pointercancel", up);
          gEls.forEach(g => g.classList.remove("is-drag"));
          if (!moved) {
            const now = Date.now();
            if (lastClick.id === c.id && now - lastClick.t < 420) { lastClick = { id: -1, t: 0 }; toFoundation(c); }
            else lastClick = { id: c.id, t: now };
            layout();
            return;
          }
          const p = pos.get(c.id), t = dropTarget(p.x + ev.clientX - sx + cw / 2, p.y + ev.clientY - sy + ch / 2);
          if (!(t && tryMove(group, w, t))) layout();
        };
        board.addEventListener("pointermove", move);
        board.addEventListener("pointerup", up);
        board.addEventListener("pointercancel", up);
      });

      // The classic bouncing-cards victory animation
      const celebrate = () => {
        stopTimer();
        Sound.play("win");
        const best = store.get("solBest", 0);
        if (st.score > best) store.set("solBest", st.score);
        fx.hidden = false;
        fx.width = wrap.clientWidth; fx.height = wrap.clientHeight;
        const g = fx.getContext("2d");
        g.clearRect(0, 0, fx.width, fx.height);
        const queue = [];
        for (let r = 13; r >= 1; r--) for (let f = 0; f < 4; f++) queue.push({ c: st.found[f][r - 1], f });
        let cur = null;
        const drawCard = (c, x, y) => {
          g.fillStyle = "#fff"; g.strokeStyle = "#000"; g.lineWidth = 1;
          g.beginPath(); g.roundRect ? g.roundRect(x + .5, y + .5, cw - 1, ch - 1, 4) : g.rect(x + .5, y + .5, cw - 1, ch - 1); g.fill(); g.stroke();
          g.fillStyle = redSuit(c.s) ? "#d00" : "#000";
          g.font = `bold ${Math.round(cw * 0.22)}px Arial`; g.textAlign = "left"; g.textBaseline = "top";
          g.fillText(RANKS[c.r], x + 4, y + 4);
          g.fillText(SUITS[c.s], x + 4, y + 4 + cw * 0.22);
          g.font = `${Math.round(cw * 0.55)}px Arial`; g.textAlign = "center"; g.textBaseline = "middle";
          g.fillText(SUITS[c.s], x + cw / 2, y + ch / 2);
        };
        const next = () => {
          const q = queue.shift();
          if (!q) { cur = null; return; }
          cur = { c: q.c, x: colX(3 + q.f) - board.parentElement.scrollLeft, y: PAD - wrap.scrollTop, vx: rand(2, 6) * (Math.random() < 0.5 ? -1 : 1), vy: rand(-8, -1) };
        };
        next();
        const step = () => {
          if (!cur) {
            raf = 0;
            setTimeout(async () => {
              if (!WM.has("solitaire")) return;
              const a = await msgBox({ title: "Solitaire", icon: "info", text: `You won! Score: ${st.score}, time: ${st.t} seconds.\n\nDeal again?`, buttons: ["Yes", "No"] });
              if (a === "Yes" && WM.has("solitaire")) win.deal(); else stopFx();
            }, 300);
            return;
          }
          for (let k = 0; k < 2; k++) {
            cur.vy += 0.55; cur.x += cur.vx; cur.y += cur.vy;
            if (cur.y + ch > fx.height) { cur.y = fx.height - ch; cur.vy = -cur.vy * 0.78; }
            drawCard(cur.c, cur.x, cur.y);
            if (cur.x + cw < 0 || cur.x > fx.width) { next(); break; }
          }
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      };

      win.deal();
    },
    menu: win => [
      { label: "Game", items: [
        { label: "Deal", hint: "F2", action: () => win.deal() },
        { label: "Undo", hint: "Ctrl+Z", action: () => win.undo() },
        { sep: true },
        { label: "Draw One", get checked() { return !store.get("solDraw3", false); }, action: () => { store.set("solDraw3", false); win.deal(); } },
        { label: "Draw Three", get checked() { return store.get("solDraw3", false); }, action: () => { store.set("solDraw3", true); win.deal(); } },
        { sep: true },
        { label: "Exit", action: () => win.close() },
      ] },
      { label: "Help", items: [{ label: "How to Play", action: () => msgBox({ title: "Solitaire Help", icon: "info", text: "Build four piles from Ace to King, one per suit, at the top right.\n\nOn the seven piles below, stack cards in descending order with alternating colors. Only a King can go in an empty spot.\n\nClick the deck to draw. Drag cards to move them. Double-click a card to send it up to its pile." }) }] },
    ],
    onResize: w => w.relayout && w.relayout(),
    onClose: w => w.stop && w.stop(),
  });
  const w = WM.get("solitaire");
  if (w && !w.onKey) w.onKey = e => {
    if (e.key === "F2") { e.preventDefault(); w.deal(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); w.undo(); }
  };
}

/* ---------- Snake ---------- */
function openSnake(o = {}) {
  WM.open("snake", {
    title: "Snake", icon: "snake", from: o.from, resizable: false,
    render(body, win) {
      const N = 20, S = isMobile() ? 14 : 16;
      body.classList.add("body--flush");
      body.innerHTML = `
        <div class="snk">
          <div class="snk__lcd">
            <div class="snk__bar"><span>SCORE <b data-s>0000</b></span><span>BEST <b data-b>${String(store.get("snakeBest", 0)).padStart(4, "0")}</b></span></div>
            <div class="snk__screen"><canvas width="${N * S}" height="${N * S}"></canvas><p class="snk__msg">SNAKE<small>Press an arrow key to start</small></p></div>
          </div>
          <div class="snk__pad">
            <button type="button" data-d="up" aria-label="Up">&#9650;</button>
            <button type="button" data-d="left" aria-label="Left">&#9664;</button>
            <button type="button" data-d="down" aria-label="Down">&#9660;</button>
            <button type="button" data-d="right" aria-label="Right">&#9654;</button>
          </div>
        </div>`;
      const cv = $("canvas", body), g = cv.getContext("2d"), msg = $(".snk__msg", body);
      const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }, OPP = { up: "down", down: "up", left: "right", right: "left" };
      const INK = "#2b3a1f", BG = "#9ead86";
      let snake, dir, queue, food, score, alive = false, paused = false, timer = 0, speed;
      const cell = (x, y, inset = 1) => g.fillRect(x * S + inset, y * S + inset, S - inset * 2, S - inset * 2);
      const draw = () => {
        g.fillStyle = BG; g.fillRect(0, 0, cv.width, cv.height);
        g.fillStyle = "rgba(43,58,31,.07)";
        for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) cell(x, y, 1);
        g.fillStyle = INK;
        const f = food; // little diamond
        g.fillRect(f.x * S + S / 2 - 1, f.y * S + 2, 2, S - 4);
        g.fillRect(f.x * S + 2, f.y * S + S / 2 - 1, S - 4, 2);
        g.fillRect(f.x * S + 4, f.y * S + 4, S - 8, S - 8);
        snake.forEach((p, i) => { g.fillStyle = INK; cell(p.x, p.y, i ? 1 : 0); });
        const h = snake[0];
        g.fillStyle = BG;
        const ex = dir === "left" ? 3 : dir === "right" ? S - 6 : 3, ey = dir === "up" ? 3 : dir === "down" ? S - 6 : 3;
        g.fillRect(h.x * S + ex, h.y * S + ey, 3, 3);
      };
      const place = () => { do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; } while (snake.some(p => p.x === food.x && p.y === food.y)); };
      const reset = () => { snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }]; dir = "right"; queue = []; score = 0; speed = 140; place(); $("[data-s]", body).textContent = "0000"; draw(); };
      const tick = () => {
        if (!alive || paused) return;
        if (win.min) { timer = setTimeout(tick, 200); return; }
        if (queue.length) dir = queue.shift();
        const h = { x: snake[0].x + DIRS[dir][0], y: snake[0].y + DIRS[dir][1] };
        if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some(p => p.x === h.x && p.y === h.y)) { die(); return; }
        snake.unshift(h);
        if (h.x === food.x && h.y === food.y) {
          score += 10; Sound.play("eat");
          $("[data-s]", body).textContent = String(score).padStart(4, "0");
          speed = Math.max(60, speed - 4); place();
        } else snake.pop();
        draw();
        timer = setTimeout(tick, speed);
      };
      const start = () => { clearTimeout(timer); reset(); alive = true; paused = false; msg.hidden = true; timer = setTimeout(tick, speed); };
      const die = () => {
        alive = false; Sound.play("error");
        const best = store.get("snakeBest", 0);
        if (score > best) { store.set("snakeBest", score); $("[data-b]", body).textContent = String(score).padStart(4, "0"); }
        msg.hidden = false;
        msg.innerHTML = `GAME OVER<small>Score ${score}${score > best ? " - new best!" : ""}<br>Press Enter or tap to play again</small>`;
      };
      const turn = d => {
        if (!alive) { start(); }
        const last = queue.length ? queue[queue.length - 1] : dir;
        if (d !== last && d !== OPP[last] && queue.length < 3) queue.push(d);
      };
      const pause = () => {
        if (!alive) return;
        paused = !paused;
        msg.hidden = !paused; msg.innerHTML = "PAUSED<small>Press Space to keep going</small>";
        clearTimeout(timer);
        if (!paused) timer = setTimeout(tick, speed);
      };
      win.newGame = start;
      win.pause = pause;
      win.stop = () => { clearTimeout(timer); alive = false; };
      win.onKey = e => {
        const k = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" }[e.key];
        if (k) { e.preventDefault(); turn(k); }
        else if (e.key === " ") { e.preventDefault(); pause(); }
        else if (e.key === "Enter" && !alive) { e.preventDefault(); start(); }
      };
      $(".snk__pad", body).addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (b) turn(b.dataset.d); });
      const screen = $(".snk__screen", body);
      let touch = null;
      screen.addEventListener("pointerdown", e => { touch = { x: e.clientX, y: e.clientY }; });
      screen.addEventListener("pointerup", e => {
        if (!touch) return;
        const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
        touch = null;
        if (Math.abs(dx) + Math.abs(dy) < 20) { if (!alive) start(); return; }
        turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
      });
      reset();
    },
    menu: win => [
      { label: "Game", items: [
        { label: "New Game", hint: "Enter", action: () => win.newGame() },
        { label: "Pause", hint: "Space", action: () => win.pause() },
        { sep: true },
        { label: "Exit", action: () => win.close() },
      ] },
      { label: "Help", items: [{ label: "How to Play", action: () => msgBox({ title: "Snake Help", icon: "info", text: "Steer with the arrow keys (or WASD). On a phone, swipe or use the buttons.\n\nEat the food to grow. Don't hit the walls or yourself. You get faster as you grow.\n\nSpace pauses." }) }] },
    ],
    onClose: w => w.stop && w.stop(),
  });
}

/* ---------- Recycle Bin ---------- */
const BIN_FILES = [
  { name: "final_FINAL_v2_REAL.js", type: "JavaScript File", from: "C:\\My Documents\\Projects", size: "4 KB", date: "6/12/98 11:42 PM", icon: "skills",
    text: "// final version (for real this time)\n// update: it was not the final version\n\nfunction main() {\n  // TODO: make it work\n  return \"it works on my machine\";\n}\n" },
  { name: "excuse_for_being_late.txt", type: "Text Document", from: "C:\\My Documents", size: "1 KB", date: "6/10/98 8:03 AM", icon: "skills",
    text: `To whom it may concern,\n\nI was late because my dial-up connection took 45 minutes to load one email, and my mom picked up the phone halfway through.\n\nSincerely,\n${NAME}\n` },
  { name: "definitely_not_a_virus.exe", type: "Application", from: "C:\\Downloads", size: "640 KB", date: "6/09/98 2:17 AM", icon: "terminal", text: null },
  { name: "homework_i_swear_i_did.txt", type: "Text Document", from: "C:\\School", size: "0 KB", date: "6/08/98 11:59 PM", icon: "skills", text: "" },
  { name: "untitled(37).html", type: "HTML Document", from: "C:\\Windows\\Desktop", size: "2 KB", date: "6/05/98 4:20 PM", icon: "chrome",
    text: "<html>\n<body bgcolor=\"black\">\n  <marquee><font color=\"lime\">UNDER CONSTRUCTION</font></marquee>\n  <blink>welcome 2 my site</blink>\n  <img src=\"dancing_baby.gif\">\n</body>\n</html>\n" },
  { name: "passwords.txt", type: "Text Document", from: "C:\\Windows\\Desktop", size: "1 KB", date: "6/01/98 9:00 AM", icon: "skills",
    text: "email: password123\nbank: password123\neverything else: password123\n\n(note to self: maybe change these)\n" },
];
const binState = () => ({ bin: store.get("binItems", BIN_FILES.map(f => f.name)), restored: store.get("restored", []) });
const hiddenApps = () => store.get("hiddenApps", []);
const docsAll = () => store.get("docs", []);
const binFile = name => BIN_FILES.find(f => f.name === name);
const kb = t => Math.max(1, Math.ceil(new Blob([t || ""]).size / 1024)) + " KB";
const binDate = key => store.get("binDates", {})[key] || "6/14/98, 12:00 PM";
function binSave(s) {
  store.set("binItems", s.bin); store.set("restored", s.restored);
  buildDesktopIcons();
  const w = WM.get("bin"); if (w && w.draw) w.draw();
}
// one entry in the bin: a seed file (plain name), a deleted desktop shortcut ("app:KEY") or a saved document ("doc:ID")
function binEntry(key) {
  if (key.startsWith("app:")) { const k = key.slice(4), a = APPS[k] || {}; return { key, name: a.label || k, type: "Shortcut", from: "C:\\Windows\\Desktop", size: "1 KB", date: binDate(key), icon: a.icon || k }; }
  if (key.startsWith("doc:")) { const d = docsAll().find(x => x.id === key.slice(4)); return d ? { key, name: d.name, type: "Text Document", from: "C:\\Windows\\Desktop", size: kb(d.text), date: binDate(key), icon: "skills" } : null; }
  const f = binFile(key);
  return f ? { ...f, key } : null;
}
// desktop key -> bin. Desktop keys: an app ("chrome"), a restored file ("file:NAME") or a document ("doc:ID")
function sendToBinKey(key) {
  if (!key || key === "bin") return;
  const s = binState(), dates = store.get("binDates", {});
  let bk;
  if (key.startsWith("file:")) { bk = key.slice(5); s.restored = s.restored.filter(n => n !== bk); }
  else if (key.startsWith("doc:")) bk = key;
  else { const h = hiddenApps(); if (!h.includes(key)) h.push(key); store.set("hiddenApps", h); bk = "app:" + key; }
  if (!s.bin.includes(bk)) s.bin.push(bk);
  dates[bk] = new Date().toLocaleString("en-US", { month: "numeric", day: "numeric", year: "2-digit", hour: "numeric", minute: "2-digit" });
  store.set("binDates", dates);
  Sound.play("crumple");
  binSave(s);
}
const sendToBin = name => sendToBinKey("file:" + name);
function restoreFromBin(bk) {
  const s = binState();
  s.bin = s.bin.filter(x => x !== bk);
  if (bk.startsWith("app:")) store.set("hiddenApps", hiddenApps().filter(x => x !== bk.slice(4)));
  else if (!bk.startsWith("doc:") && !s.restored.includes(bk)) s.restored.push(bk);
  binSave(s);
}
function purgeFromBin(keys) {
  const s = binState();
  s.bin = s.bin.filter(x => !keys.includes(x));
  const docIds = keys.filter(k => k.startsWith("doc:")).map(k => k.slice(4));
  if (docIds.length) store.set("docs", docsAll().filter(d => !docIds.includes(d.id)));
  binSave(s);
}
function openRestoredFile(name, o = {}) {
  const f = binFile(name);
  if (!f) return;
  if (f.text === null) {
    msgBox({ title: f.name, icon: "error", text: "This program has performed an illegal operation and will be shut down.\n\n(Relax, it's not a virus. Probably.)" });
    return;
  }
  openNotepad("file-" + slugify(f.name), f.name, f.text, o);
}
function openDoc(id, o = {}) {
  const d = docsAll().find(x => x.id === id);
  if (d) openNotepad("doc-" + id, d.name, d.text, { ...o, docId: id });
}
function openBin(o = {}) {
  WM.open("bin", {
    title: "Recycle Bin", icon: binState().bin.length ? "binfull" : "bin", w: 660, h: 390, from: o.from,
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      let sel = null, sort = { k: "date", dir: -1 };
      body.innerHTML = `
        <div class="toolbar">
          <button type="button" class="tool-btn tool-btn--row" data-act="restore">${icon("projects", 16)}<span>Restore</span></button>
          <button type="button" class="tool-btn tool-btn--row" data-act="delete"><span style="color:#c00;display:flex">${G.close}</span><span>Delete</span></button>
          <span class="toolbar__sep"></span>
          <button type="button" class="tool-btn tool-btn--row" data-act="empty">${icon("bin", 16)}<span>Empty Recycle Bin</span></button>
        </div>
        <div class="wv">
          <aside class="wv__pane">
            <div class="wv__head"><span class="wv__icon"></span><h2>Recycle Bin</h2></div>
            <div class="wv__rule"></div>
            <div class="wv__info"></div>
          </aside>
          <div class="explorer sunken-box" tabindex="0"></div>
        </div>`;
      const box = $(".explorer", body), info = $(".wv__info", body);
      const files = () => binState().bin.map(binEntry).filter(Boolean);
      win.draw = () => {
        const list = files().sort((a, b) => String(a[sort.k]).localeCompare(String(b[sort.k]), undefined, { numeric: true }) * sort.dir);
        if (sel && !list.some(f => f.key === sel)) sel = null;
        $(".wv__icon", body).innerHTML = icon(list.length ? "binfull" : "bin", 32);
        const ti = $(".title-bar__icon", win.el); if (ti) ti.innerHTML = icon(list.length ? "binfull" : "bin", 16);
        const f = sel && list.find(x => x.key === sel);
        win.setStatus([f ? `Selected: ${f.name}` : `${list.length} object(s)`, f ? f.size : ""]);
        info.innerHTML = f
          ? `<b class="wv__title">${esc(f.name)}</b><br>${esc(f.type)}<br><br><span class="wv__label">Original location:</span><br>${esc(f.from)}<br><br><span class="wv__label">Date deleted:</span><br>${esc(f.date)}<br><br><span class="wv__label">Size:</span> ${esc(f.size)}`
          : list.length
            ? `This folder contains things you have deleted.<br><br>Select one and click <b>Restore</b> to put it back on the desktop.<br><br>Click <b>Empty Recycle Bin</b> to delete everything for good.<br><br><span class="wv__label">Tip:</span> drag any desktop icon onto the Recycle Bin to delete it.`
            : `The Recycle Bin is empty.<br><br>Drag a desktop icon onto the Recycle Bin, or right-click it and choose <b>Delete</b>, to send it here.`;
        if (!list.length) { box.innerHTML = `<div class="bin-empty">${icon("bin", 32)}<p>The Recycle Bin is empty.</p></div>`; return; }
        const th = (k, l) => `<th data-sort="${k}">${l}${sort.k === k ? (sort.dir > 0 ? " \u25B4" : " \u25BE") : ""}</th>`;
        box.innerHTML = `<table class="details"><thead><tr>${th("name", "Name")}${th("from", "Original Location")}${th("date", "Date Deleted")}${th("type", "Type")}${th("size", "Size")}</tr></thead><tbody>${list.map(x => `
          <tr data-name="${esc(x.key)}" class="${x.key === sel ? "is-selected" : ""}"><td><span class="details__name">${icon(x.icon, 16)}${esc(x.name)}</span></td><td>${esc(x.from)}</td><td>${esc(x.date)}</td><td>${esc(x.type)}</td><td>${esc(x.size)}</td></tr>`).join("")}</tbody></table>`;
      };
      const need = () => { msgBox({ title: "Recycle Bin", icon: "info", text: "Select a file first." }); return false; };
      win.restore = () => {
        if (!sel) return need();
        const e = binEntry(sel);
        restoreFromBin(sel); sel = null; win.draw();
        win.setStatus([`Restored "${e ? e.name : ""}" to the desktop`, ""]);
      };
      win.del = async () => {
        if (!sel) return need();
        const key = sel, e = binEntry(key);
        const a = await msgBox({ title: "Confirm File Delete", icon: "question", text: `Are you sure you want to permanently delete '${e ? e.name : key}'?`, buttons: ["Yes", "No"] });
        if (a !== "Yes" || !WM.has("bin")) return;
        Sound.play("crumple"); purgeFromBin([key]); sel = null;
      };
      win.empty = async () => {
        const list = files();
        if (!list.length) { msgBox({ title: "Recycle Bin", icon: "info", text: "The Recycle Bin is already empty." }); return; }
        const a = await msgBox({ title: "Confirm Multiple File Delete", icon: "question", text: `Are you sure you want to delete all ${list.length} items in the Recycle Bin?`, buttons: ["Yes", "No"] });
        if (a !== "Yes" || !WM.has("bin")) return;
        Sound.play("crumple"); purgeFromBin(list.map(x => x.key)); sel = null;
      };
      win.reset = () => {
        const s = binState();
        store.set("binItems", BIN_FILES.map(f => f.name).concat(s.bin.filter(k => k.startsWith("doc:"))).filter((k, i, a) => a.indexOf(k) === i));
        store.set("restored", []); store.set("hiddenApps", []);
        buildDesktopIcons(); sel = null; win.draw();
      };
      box.addEventListener("click", e => {
        const h = e.target.closest("[data-sort]");
        if (h) { sort = { k: h.dataset.sort, dir: sort.k === h.dataset.sort ? -sort.dir : 1 }; win.draw(); return; }
        const tr = e.target.closest("tr[data-name]");
        sel = tr ? tr.dataset.name : null;
        win.draw();
      });
      box.addEventListener("dblclick", e => { if (e.target.closest("tr[data-name]")) win.restore(); });
      box.addEventListener("keydown", e => { if (e.key === "Delete") win.del(); if (e.key === "Enter") win.restore(); });
      $('[data-act="restore"]', body).addEventListener("click", () => win.restore());
      $('[data-act="delete"]', body).addEventListener("click", () => win.del());
      $('[data-act="empty"]', body).addEventListener("click", () => win.empty());
      win.draw();
    },
    menu: win => [
      { label: "File", items: [
        { label: "Restore", action: () => win.restore() },
        { label: "Delete", hint: "Del", action: () => win.del() },
        { sep: true },
        { label: "Empty Recycle Bin", action: () => win.empty() },
        { label: "Put Everything Back", action: () => win.reset() },
        { sep: true },
        { label: "Close", action: () => win.close() },
      ] },
      { label: "Help", items: [{ label: "About the Recycle Bin", action: () => msgBox({ title: "Recycle Bin", icon: "info", text: "Restored files land on your desktop. Open them, or right-click and Delete to send them back here." }) }] },
    ],
  });
}

/* ---------- Shut Down ---------- */
function openShutdown() {
  StartMenu.close();
  const dither = $("#dither");
  dither.hidden = false;
  $("#desktop").classList.add("is-dim");
  let choice = null;
  WM.open("shutdown", {
    title: "Shut Down Windows", modal: true, resizable: false, w: 400,
    render(body, win) {
      body.innerHTML = `
        <div class="sd">${icon("monitor", 32)}<div>
          <p>What do you want the computer to do?</p>
          <label class="radio"><input type="radio" name="sd" value="shutdown" checked><span><u>S</u>hut down</span></label>
          <label class="radio"><input type="radio" name="sd" value="restart"><span><u>R</u>estart</span></label>
          <label class="radio"><input type="radio" name="sd" value="dos"><span>Restart in <u>M</u>S-DOS mode</span></label>
        </div></div>
        <div class="dialog-buttons">
          <button type="button" class="btn btn--default" data-act="ok">OK</button>
          <button type="button" class="btn" data-act="cancel">Cancel</button>
          <button type="button" class="btn" data-act="help">Help</button>
        </div>`;
      $('[data-act="ok"]', body).addEventListener("click", () => { choice = $('input[name="sd"]:checked', body).value; win.close(); });
      $('[data-act="cancel"]', body).addEventListener("click", () => win.close());
      $('[data-act="help"]', body).addEventListener("click", () => msgBox({ title: "Shut Down", icon: "info", text: "Shut down: turns the computer off. Press the power button to turn it back on.\n\nRestart: shuts down and boots straight back up.\n\nRestart in MS-DOS mode: boots into a full-screen DOS prompt. Type EXIT to get back to Windows." }));
      body.addEventListener("keydown", e => { if (e.key === "Escape") win.close(); });
    },
    onOpen: w => $('[data-act="ok"]', w.body).focus(),
    onClose() {
      dither.hidden = true;
      $("#desktop").classList.remove("is-dim");
      if (choice) setTimeout(() => powerOff(choice), 60);
    },
  });
}
let powering = false;
async function powerOff(mode) {
  if (powering) return;
  powering = true;
  Menu.closeAll(); WM.closeAll(); Saver.stop();
  ensureSkyWallpaper();
  const off = $("#off"), desk = $("#desktop");
  $(".off__msg", off).textContent = mode === "shutdown" ? "Windows is shutting down..." : mode === "dos" ? "Preparing to restart in MS-DOS mode..." : "Windows is restarting...";
  off.className = "off";
  off.hidden = false;
  void off.offsetWidth;
  off.classList.add("is-shutting");
  Sound.play("shutdown");
  await sleep(reduceMotion() ? 300 : 2800);
  desk.classList.remove("is-on");
  off.classList.add("is-crt-off");
  Sound.play("power");
  await sleep(reduceMotion() ? 100 : 1100);
  powering = false;
  if (mode === "shutdown") {
    off.classList.add("is-dark");
    const wake = e => {
      if (e.type === "keydown" && ["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      off.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      powerOn(boot);
    };
    setTimeout(() => { off.addEventListener("pointerdown", wake); window.addEventListener("keydown", wake); }, 900);
    return;
  }
  await sleep(500);
  powerOn(mode === "dos" ? showDosMode : boot);
}
function powerOn(next) {
  const off = $("#off");
  Sound.play("power");
  off.classList.remove("is-dark");
  off.classList.add("is-crt-on");
  setTimeout(() => {
    off.hidden = true;
    off.className = "off";
    next();
  }, reduceMotion() ? 50 : 950);
}
function showDosMode() {
  const el = document.createElement("div");
  el.className = "dosmode";
  el.innerHTML = `<div class="dosmode__out"></div><div class="dos__line"><span class="dos__prompt">C:\\WINDOWS&gt;</span><input class="dos__input" autocomplete="off" spellcheck="false" aria-label="Command"></div>`;
  document.body.appendChild(el);
  const out = $(".dosmode__out", el), input = $("input", el);
  const print = t => String(t).split("\n").forEach(l => { const d = document.createElement("div"); d.textContent = l; out.appendChild(d); });
  print("\nMicrosoft(R) Windows 98\n   (C)Copyright Microsoft Corp 1981-1998.\n\nYou are in MS-DOS mode. Type EXIT to return to Windows.\n");
  setTimeout(() => input.focus(), 50);
  el.addEventListener("pointerup", () => input.focus());
  input.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = input.value.trim(), c = v.toLowerCase();
    input.value = "";
    print("C:\\WINDOWS>" + v);
    if (c === "exit" || c === "win") { el.remove(); setTimeout(boot, 0); return; }
    if (c === "help") print("EXIT    Return to Windows\nVER     Show the version\nDIR     List files\nCLS     Clear the screen\nMEM     Show memory\n");
    else if (c === "ver") print("\nWindows 98 [Version 4.10.1998]\n");
    else if (c === "cls") out.innerHTML = "";
    else if (c === "mem") print("\n   65,536K total memory\n   64,412K free\n\nPlenty of room for Minesweeper.\n");
    else if (c === "dir") print(" Volume in drive C is PORTFOLIO\n Directory of C:\\WINDOWS\n\nCOMMAND  COM        93,890  04-23-99\nWIN      COM        24,791  04-23-99\nSYSTEM         <DIR>        06-14-98\nDESKTOP        <DIR>        06-14-98\n         2 file(s)        118,681 bytes\n");
    else if (c) print("Bad command or file name");
    el.scrollTop = el.scrollHeight;
  });
}

/* ---------- Display Properties (wallpaper, screen saver, appearance) ---------- */
const BACKGROUNDS = [["clouds", "Windows 98 Clouds"], ["teal", "(None) Teal"], ["tiles", "Tiles"], ["bubbles", "Bubbles"], ["houndstooth", "Houndstooth"], ["plum", "Plum"], ["slate", "Slate"], ["black", "Black"]];
const SCHEMES = {
  standard: { label: "Windows Standard", a: "#000080", b: "#1084d0" },
  rainy: { label: "Rainy Day", a: "#4f657d", b: "#a4b9cf" },
  rose: { label: "Rose", a: "#800040", b: "#d97ba2" },
  eggplant: { label: "Eggplant", a: "#3f2a5c", b: "#8a6fb3" },
  spruce: { label: "Spruce", a: "#2e5a3e", b: "#79a88a" },
  desert: { label: "Desert", a: "#7a5a16", b: "#c8a96a" },
};
const SAVERS = [["none", "(None)"], ["starfield", "Starfield Simulation"], ["mystify", "Mystify Your Mind"]];
function applyBg(k) {
  ensureSkyWallpaper();
  $("#desktop").dataset.bg = BACKGROUNDS.some(b => b[0] === k) ? k : "clouds";
}
function applyCRT(on) { document.body.classList.toggle("crt", !!on); }
function applyScheme(k) {
  const s = SCHEMES[k] || SCHEMES.standard;
  document.documentElement.style.setProperty("--title-a", s.a);
  document.documentElement.style.setProperty("--title-b", s.b);
}
function openDisplay(o = {}) {
  WM.open("display", {
    title: "Display Properties", icon: "monitor", w: 380, from: o.from, resizable: false,
    render(body, win) {
      const st = { crt: store.get("crt", false), bg: store.get("bg", "clouds"), saver: store.get("saver", "starfield"), wait: store.get("saverWait", 3), scheme: store.get("scheme", "standard") };
      body.innerHTML = `
        <div class="tabs" role="tablist">
          <button type="button" class="tab is-active" data-tab="bg">Background</button>
          <button type="button" class="tab" data-tab="ss">Screen Saver</button>
          <button type="button" class="tab" data-tab="ap">Appearance</button>
        </div>
        <div class="tab-panel" data-panel="bg">
          <div class="monitor"><div class="monitor__case"><div class="monitor__screen" data-bg="${esc(st.bg)}"></div></div><div class="monitor__neck"></div><div class="monitor__base"></div></div>
          <fieldset class="groupbox"><legend>Wallpaper</legend>
            <select class="listbox" data-f="bg" size="7" aria-label="Wallpaper">${BACKGROUNDS.map(([k, l]) => `<option value="${k}"${k === st.bg ? " selected" : ""}>${l}</option>`).join("")}</select>
          </fieldset>
        </div>
        <div class="tab-panel" data-panel="ss" hidden>
          <fieldset class="groupbox"><legend>Screen Saver</legend>
            <div class="row"><select class="field" data-f="saver" style="flex:1;height:auto">${SAVERS.map(([k, l]) => `<option value="${k}"${k === st.saver ? " selected" : ""}>${l}</option>`).join("")}</select>
            <button type="button" class="btn btn--sm" data-act="preview">Preview</button></div>
            <div class="row" style="margin-top:10px">Wait: <input class="field" data-f="wait" type="number" min="1" max="60" value="${esc(st.wait)}" style="width:52px"> minutes</div>
          </fieldset>
          <p style="margin:10px 2px 0;color:#444">The screen saver starts when you leave the computer alone. It won't interrupt a playing video.</p>
        </div>
        <div class="tab-panel" data-panel="ap" hidden>
          <div class="window is-active" style="position:relative;pointer-events:none;margin:0 auto 10px;width:230px;min-width:0" aria-hidden="true">
            <div class="title-bar" data-preview><span class="title-bar__text">Active Window</span></div>
            <div class="window__body" style="padding:8px;background:#fff;box-shadow:var(--sunken)">Window Text</div>
          </div>
          <fieldset class="groupbox"><legend>Scheme</legend>
            <select class="listbox" data-f="scheme" size="6" aria-label="Color scheme">${Object.entries(SCHEMES).map(([k, s]) => `<option value="${k}"${k === st.scheme ? " selected" : ""}>${s.label}</option>`).join("")}</select>
          </fieldset>
          <fieldset class="groupbox"><legend>Effects</legend>
            <label class="check"><input type="checkbox" data-f="crt"${st.crt ? " checked" : ""}><span>CRT monitor effect (scanlines and glass)</span></label>
          </fieldset>
        </div>
        <div class="dialog-buttons">
          <button type="button" class="btn btn--default" data-act="ok">OK</button>
          <button type="button" class="btn" data-act="cancel">Cancel</button>
          <button type="button" class="btn" data-act="apply" disabled>Apply</button>
        </div>`;
      wireTabs(body);
      const f = k => $(`[data-f="${k}"]`, body);
      const apply = $('[data-act="apply"]', body);
      const preview = $("[data-preview]", body);
      const paintPreview = () => { const s = SCHEMES[f("scheme").value]; preview.style.background = `linear-gradient(90deg,${s.a},${s.b})`; };
      const dirty = () => { apply.disabled = false; };
      f("bg").addEventListener("change", () => { $(".monitor__screen", body).dataset.bg = f("bg").value; dirty(); });
      f("scheme").addEventListener("change", () => { paintPreview(); dirty(); });
      f("saver").addEventListener("change", dirty);
      f("wait").addEventListener("input", dirty);
      f("crt").addEventListener("change", dirty);
      paintPreview();
      const commit = () => {
        store.set("bg", f("bg").value); applyBg(f("bg").value);
        store.set("scheme", f("scheme").value); applyScheme(f("scheme").value);
        store.set("saver", f("saver").value);
        store.set("crt", f("crt").checked); applyCRT(f("crt").checked);
        store.set("saverWait", Math.max(1, Math.min(60, parseInt(f("wait").value, 10) || 3)));
        apply.disabled = true;
      };
      apply.addEventListener("click", commit);
      $('[data-act="preview"]', body).addEventListener("click", () => { if (f("saver").value !== "none") Saver.start(f("saver").value); });
      $('[data-act="ok"]', body).addEventListener("click", () => { commit(); win.close(); });
      $('[data-act="cancel"]', body).addEventListener("click", () => win.close());
    },
  });
}

/* ---------- Screen savers ---------- */
const Saver = {
  el: null, raf: 0, last: Date.now(), armedAt: 0,
  init() {
    const wake = () => { this.last = Date.now(); if (this.el && Date.now() > this.armedAt) this.stop(); };
    ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => window.addEventListener(ev, wake, { passive: true, capture: true }));
    setInterval(() => this.check(), 4000);
  },
  check() {
    const kind = store.get("saver", "starfield"), wait = +store.get("saverWait", 3);
    if (kind === "none" || this.el || booting || !$("#desktop").classList.contains("is-on")) return;
    const yt = WM.get("youtube");
    if (yt && !yt.min) return;
    if (Date.now() - this.last >= wait * 60000) this.start(kind);
  },
  start(kind) {
    if (this.el) return;
    Menu.closeAll();
    const el = document.createElement("div");
    el.className = "saver";
    el.innerHTML = "<canvas></canvas>";
    document.body.appendChild(el);
    this.el = el;
    this.armedAt = Date.now() + 800;
    const cv = el.firstChild, ctx = cv.getContext("2d");
    const fit = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    fit();
    this.onResize = fit;
    window.addEventListener("resize", fit);
    if (kind === "mystify") {
      const mk = () => ({ pts: Array.from({ length: 4 }, () => ({ x: rand(0, cv.width), y: rand(0, cv.height), vx: rand(2, 5) * (Math.random() < .5 ? -1 : 1), vy: rand(2, 5) * (Math.random() < .5 ? -1 : 1) })), hist: [], hue: rand(0, 360) });
      const shapes = [mk(), mk()];
      const step = () => {
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height);
        shapes.forEach(s => {
          s.pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > cv.width) p.vx *= -1;
            if (p.y < 0 || p.y > cv.height) p.vy *= -1;
          });
          s.hist.push(s.pts.map(p => ({ x: p.x, y: p.y })));
          if (s.hist.length > 10) s.hist.shift();
          s.hue = (s.hue + 0.6) % 360;
          s.hist.forEach((pts, i) => {
            ctx.strokeStyle = `hsla(${s.hue},100%,55%,${(i + 1) / s.hist.length})`;
            ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
            pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath(); ctx.stroke();
          });
        });
        this.raf = requestAnimationFrame(step);
      };
      step();
    } else {
      const stars = Array.from({ length: 300 }, () => ({ x: rand(-1, 1), y: rand(-1, 1), z: rand(0.05, 1) }));
      const step = () => {
        const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
        stars.forEach(s => {
          s.z -= 0.006;
          if (s.z <= 0.02) { s.x = rand(-1, 1); s.y = rand(-1, 1); s.z = 1; }
          const x = cx + (s.x / s.z) * cx * 0.5, y = cy + (s.y / s.z) * cy * 0.5;
          if (x < 0 || x > W || y < 0 || y > H) { s.x = rand(-1, 1); s.y = rand(-1, 1); s.z = 1; return; }
          const k = 1 - s.z, sz = Math.max(1, k * 3.2), c = Math.floor(120 + 135 * k);
          ctx.fillStyle = `rgb(${c},${c},${c})`;
          ctx.fillRect(x, y, sz, sz);
        });
        this.raf = requestAnimationFrame(step);
      };
      step();
    }
  },
  stop() {
    if (!this.el) return;
    cancelAnimationFrame(this.raf);
    this.el.remove();
    this.el = null;
    window.removeEventListener("resize", this.onResize);
    this.last = Date.now();
  },
};

/* ---------- Minesweeper ---------- */
const MS_LEVELS = { beginner: { w: 9, h: 9, m: 10, label: "Beginner" }, intermediate: { w: 16, h: 16, m: 40, label: "Intermediate" }, expert: { w: 30, h: 16, m: 99, label: "Expert" } };
function openMinesweeper(o = {}) {
  WM.open("minesweeper", {
    title: "Minesweeper", icon: "minesweeper", from: o.from, resizable: false,
    render(body, win) {
      body.classList.add("body--flush");
      let level = store.get("msLevel", "beginner");
      if (!MS_LEVELS[level] || (isMobile() && level === "expert")) level = "beginner";
      let W, H, M, cells, started, over, flags, opened, t, timer = null;
      body.innerHTML = `<div class="ms"><div class="ms__top"><span class="ms__led" data-led="mines" role="img"></span><button type="button" class="ms__face" aria-label="New game"></button><span class="ms__led" data-led="time" role="img"></span></div><div class="ms__grid" role="grid" aria-label="Minefield"></div></div>`;
      const grid = $(".ms__grid", body), face = $(".ms__face", body), ledM = $('[data-led="mines"]', body), ledT = $('[data-led="time"]', body);
      const led = n => n < 0 ? "-" + String(Math.min(99, -n)).padStart(2, "0") : String(Math.min(999, n)).padStart(3, "0");
      const SEG = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"], SEGP = { a: "3,1 4,0 9,0 10,1 9,2 4,2", b: "11,3 12,2 13,3 13,9 12,10 11,9", c: "11,13 12,12 13,13 13,19 12,20 11,19", d: "3,21 4,20 9,20 10,21 9,22 4,22", e: "0,13 1,12 2,13 2,19 1,20 0,19", f: "0,3 1,2 2,3 2,9 1,10 0,9", g: "3,11 4,10 9,10 10,11 9,12 4,12" };
      const setLed = (el, n) => { el.innerHTML = led(n).split("").map(ch => `<svg width="13" height="23" viewBox="0 0 13 23" shape-rendering="crispEdges" aria-hidden="true">${(ch === "-" ? "g" : SEG[+ch]).split("").map(k => `<polygon points="${SEGP[k]}"/>`).join("")}</svg>`).join(""); el.setAttribute("aria-label", led(n)); };
      const setFace = k => { face.innerHTML = pixelSvg(PIX[k], 17); };
      const nbrs = i => { const x = i % W, y = (i / W) | 0, out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(ny * W + nx); } return out; };
      const stopTimer = () => { clearInterval(timer); timer = null; };
      win.stopTimer = stopTimer;
      win.level = () => level;
      const cellEl = i => grid.children[i];
      const draw = i => {
        const c = cells[i], el = cellEl(i);
        el.className = "ms__c" + (c.open ? " is-open" : "");
        el.removeAttribute("data-n");
        if (c.open) { if (c.mine) el.innerHTML = pixelSvg(PIX.mine, 11); else if (c.n) { el.textContent = c.n; el.dataset.n = c.n; } else el.textContent = ""; }
        else el.innerHTML = c.flag ? pixelSvg(PIX.flag, 10) : "";
      };
      win.newGame = lv => {
        if (lv) { level = lv; store.set("msLevel", lv); }
        ({ w: W, h: H, m: M } = MS_LEVELS[level]);
        cells = Array.from({ length: W * H }, () => ({ mine: false, open: false, flag: false, n: 0 }));
        started = false; over = false; flags = 0; opened = 0; t = 0; stopTimer();
        setLed(ledM, M); setLed(ledT, 0); setFace("smile");
        grid.style.gridTemplateColumns = `repeat(${W},16px)`;
        grid.innerHTML = cells.map((_, i) => `<div class="ms__c" data-i="${i}"></div>`).join("");
        if (lv) WM.clamp(win);
      };
      const plant = safe => {
        const banned = new Set([safe, ...nbrs(safe)]);
        let placed = 0;
        while (placed < M) { const i = Math.floor(Math.random() * W * H); if (banned.has(i) || cells[i].mine) continue; cells[i].mine = true; placed++; }
        cells.forEach((c, i) => { c.n = nbrs(i).filter(j => cells[j].mine).length; });
      };
      const flood = i => {
        const stack = [i];
        while (stack.length) {
          const j = stack.pop(), c = cells[j];
          if (c.open || c.flag) continue;
          c.open = true; opened++; draw(j);
          if (c.n === 0 && !c.mine) nbrs(j).forEach(k => { if (!cells[k].open) stack.push(k); });
        }
      };
      const lose = i => {
        over = true; stopTimer(); setFace("dead"); Sound.play("boom");
        cells.forEach((c, j) => { if (c.mine && !c.flag) { c.open = true; draw(j); } else if (!c.mine && c.flag) { const e = cellEl(j); e.className = "ms__c is-open is-wrong"; e.innerHTML = pixelSvg(PIX.mine, 11); } });
        cellEl(i).classList.add("is-boom");
      };
      const won = () => {
        over = true; stopTimer(); setFace("cool"); Sound.play("win");
        cells.forEach((c, j) => { if (c.mine && !c.flag) { c.flag = true; draw(j); } });
        setLed(ledM, 0);
        const best = store.get("msBest", {});
        if (!best[level] || t < best[level].t) {
          best[level] = { t, name: FIRST };
          store.set("msBest", best);
          setTimeout(() => msgBox({ title: "Minesweeper", icon: "info", text: `You have the fastest time for ${MS_LEVELS[level].label} level: ${t} second${t === 1 ? "" : "s"}!` }), 350);
        }
      };
      const check = () => { if (!over && opened === W * H - M) won(); };
      const reveal = i => {
        const c = cells[i];
        if (over || c.open || c.flag) return;
        if (!started) {
          started = true; plant(i); t = 1; setLed(ledT, 1);
          timer = setInterval(() => { t = Math.min(999, t + 1); setLed(ledT, t); }, 1000);
        }
        if (c.mine) { c.open = true; draw(i); lose(i); return; }
        flood(i); check();
      };
      const chord = i => {
        const c = cells[i];
        if (!c.open || !c.n || over) return;
        const ns = nbrs(i);
        if (ns.filter(j => cells[j].flag).length !== c.n) return;
        ns.forEach(j => { const d = cells[j]; if (over || d.open || d.flag) return; if (d.mine) { d.open = true; draw(j); lose(j); } else flood(j); });
        check();
      };
      const toggleFlag = i => {
        const c = cells[i];
        if (over || c.open) return;
        c.flag = !c.flag; flags += c.flag ? 1 : -1;
        setLed(ledM, M - flags); draw(i);
      };
      let pressTimer = 0, longPressed = false, downI = -1;
      grid.addEventListener("contextmenu", e => e.preventDefault());
      grid.addEventListener("pointerdown", e => {
        const el = e.target.closest(".ms__c");
        if (!el || over) return;
        downI = +el.dataset.i;
        if (e.button === 2) { toggleFlag(downI); downI = -1; return; }
        if (e.button !== 0) return;
        setFace("oh"); longPressed = false;
        if (e.pointerType === "touch") pressTimer = setTimeout(() => { longPressed = true; toggleFlag(downI); setFace("smile"); if (navigator.vibrate) navigator.vibrate(20); }, 420);
      });
      grid.addEventListener("pointerup", e => {
        clearTimeout(pressTimer);
        if (downI < 0) return;
        const el = e.target.closest(".ms__c"), i = el ? +el.dataset.i : -1;
        if (!over) setFace("smile");
        const was = downI; downI = -1;
        if (longPressed || i !== was) return;
        if (cells[i].open) chord(i); else reveal(i);
      });
      grid.addEventListener("pointerleave", () => { clearTimeout(pressTimer); if (!over && downI >= 0) setFace("smile"); downI = -1; });
      face.addEventListener("click", () => win.newGame());
      win.newGame();
    },
    menu: win => [
      { label: "Game", items: [
        { label: "New", hint: "F2", action: () => win.newGame() },
        { sep: true },
        ...Object.keys(MS_LEVELS).map(k => ({ label: MS_LEVELS[k].label, disabled: isMobile() && k === "expert", get checked() { return win.level() === k; }, action: () => win.newGame(k) })),
        { sep: true },
        { label: "Best Times...", action: () => { const b = store.get("msBest", {}); msgBox({ title: "Fastest Mine Sweepers", icon: "info", text: Object.keys(MS_LEVELS).map(k => `${MS_LEVELS[k].label}:   ${b[k] ? `${b[k].t} seconds   ${b[k].name}` : "999 seconds   Anonymous"}`).join("\n") }); } },
        { sep: true },
        { label: "Exit", action: () => win.close() },
      ] },
      { label: "Help", items: [{ label: "How to Play", action: () => msgBox({ title: "Minesweeper Help", icon: "info", text: "Click a square to reveal it. Numbers tell you how many mines touch that square.\n\nRight-click (or long-press on a phone) to plant a flag.\n\nClick a number whose mines are all flagged to clear around it.\n\nClick the smiley to start over." }) }] },
    ],
    onClose: w => w.stopTimer && w.stopTimer(),
  });
}

/* ---------- Paint ---------- */
const PAINT_COLORS = ["#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080", "#808040", "#004040", "#0080ff", "#004080", "#8000ff", "#804000",
                      "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffff80", "#00ff80", "#80ffff", "#8080ff", "#ff0080", "#ff8040"];
const PAINT_TOOLS = [["picker", "Pick Color"], ["fill", "Fill With Color"], ["pencil", "Pencil"], ["brush", "Brush"], ["spray", "Airbrush"], ["eraser", "Eraser"], ["line", "Line"], ["rect", "Rectangle"], ["ellipse", "Ellipse"]];
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function openPaint(o = {}) {
  WM.open("paint", {
    title: "untitled - Paint", icon: "paint", w: 680, h: 510, from: o.from, status: ["For Help, click Help Topics on the Help Menu.", "", "520x330"],
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      body.innerHTML = `
        <div class="paint">
          <div class="paint__tools">
            ${PAINT_TOOLS.map(([id, label]) => `<button type="button" class="paint__tool" data-tool="${id}" title="${label}">${G[id]}</button>`).join("")}
            <div class="paint__sizes">${[1, 3, 5, 8].map(s => `<button type="button" data-size="${s}" title="Size ${s}"><i style="width:${s + 1}px;height:${s + 1}px"></i></button>`).join("")}</div>
          </div>
          <div class="paint__stage"><canvas></canvas></div>
        </div>
        <div class="paint__bottom">
          <div class="paint__current" title="Left-click a color for foreground, right-click for background"><i class="paint__fg"></i><i class="paint__bg"></i></div>
          <div class="paint__colors">${PAINT_COLORS.map(c => `<button type="button" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join("")}</div>
        </div>`;
      const cv = $("canvas", body), ctx = cv.getContext("2d", { willReadFrequently: true });
      cv.width = isMobile() ? Math.max(220, window.innerWidth - 110) : 520;
      cv.height = isMobile() ? 300 : 330;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
      const st = { tool: "pencil", size: 3, fg: "#000000", bg: "#ffffff" };
      const undo = [];
      const snap = () => { undo.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (undo.length > 25) undo.shift(); };
      win.undo = () => { const d = undo.pop(); if (d) ctx.putImageData(d, 0, 0); };
      win.clearImage = () => { snap(); ctx.fillStyle = st.bg; ctx.fillRect(0, 0, cv.width, cv.height); };
      win.newImage = () => { snap(); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); };
      win.save = () => cv.toBlob(b => downloadBlob("untitled.png", b));
      const drawSwatches = () => { $(".paint__fg", body).style.background = st.fg; $(".paint__bg", body).style.background = st.bg; };
      const setTool = id => { st.tool = id; $$(".paint__tool", body).forEach(b => b.classList.toggle("is-active", b.dataset.tool === id)); };
      const setSize = s => { st.size = s; $$(".paint__sizes button", body).forEach(b => b.classList.toggle("is-active", +b.dataset.size === s)); };
      setTool("pencil"); setSize(3); drawSwatches();
      $(".paint__tools", body).addEventListener("click", e => { const t = e.target.closest("[data-tool]"); if (t) setTool(t.dataset.tool); const s = e.target.closest("[data-size]"); if (s) setSize(+s.dataset.size); });
      const palette = $(".paint__colors", body);
      palette.addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (b) { st.fg = b.dataset.c; drawSwatches(); } });
      palette.addEventListener("contextmenu", e => { e.preventDefault(); const b = e.target.closest("[data-c]"); if (b) { st.bg = b.dataset.c; drawSwatches(); } });

      const pos = e => { const r = cv.getBoundingClientRect(); return { x: Math.floor((e.clientX - r.left) * cv.width / r.width), y: Math.floor((e.clientY - r.top) * cv.height / r.height) }; };
      const stamp = (x, y, size, color, round) => {
        ctx.fillStyle = color;
        if (round && size > 2) { ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, size / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(x - Math.floor(size / 2), y - Math.floor(size / 2), size, size);
      };
      const stroke = (x0, y0, x1, y1, size, color, round) => {
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;
        for (;;) {
          stamp(x0, y0, size, color, round);
          if (x0 === x1 && y0 === y1) break;
          const e2 = 2 * err;
          if (e2 >= dy) { err += dy; x0 += sx; }
          if (e2 <= dx) { err += dx; y0 += sy; }
        }
      };
      const floodFill = (x, y, color) => {
        const img = ctx.getImageData(0, 0, cv.width, cv.height), d = img.data, W = cv.width, H = cv.height;
        const at = (x, y) => (y * W + x) * 4;
        const i0 = at(x, y), tr = d[i0], tg = d[i0 + 1], tb = d[i0 + 2];
        const [r, g, b] = hexRgb(color);
        if (tr === r && tg === g && tb === b) return;
        const match = i => Math.abs(d[i] - tr) < 8 && Math.abs(d[i + 1] - tg) < 8 && Math.abs(d[i + 2] - tb) < 8;
        const stack = [[x, y]];
        while (stack.length) {
          let [cx, cy] = stack.pop();
          while (cy >= 0 && match(at(cx, cy))) cy--;
          cy++;
          let left = false, right = false;
          while (cy < H && match(at(cx, cy))) {
            const i = at(cx, cy);
            d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
            if (cx > 0) { if (match(at(cx - 1, cy))) { if (!left) { stack.push([cx - 1, cy]); left = true; } } else left = false; }
            if (cx < W - 1) { if (match(at(cx + 1, cy))) { if (!right) { stack.push([cx + 1, cy]); right = true; } } else right = false; }
            cy++;
          }
        }
        ctx.putImageData(img, 0, 0);
      };
      let drawing = null, sprayTimer = 0;
      win.stopSpray = () => clearInterval(sprayTimer);
      const shape = (a, b, color, base) => {
        ctx.putImageData(base, 0, 0);
        ctx.strokeStyle = color; ctx.lineWidth = st.size; ctx.lineCap = "round";
        ctx.beginPath();
        if (st.tool === "line") { ctx.moveTo(a.x + .5, a.y + .5); ctx.lineTo(b.x + .5, b.y + .5); }
        else if (st.tool === "rect") ctx.rect(Math.min(a.x, b.x) + .5, Math.min(a.y, b.y) + .5, Math.abs(b.x - a.x), Math.abs(b.y - a.y));
        else ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2 || 1, Math.abs(b.y - a.y) / 2 || 1, 0, 0, Math.PI * 2);
        ctx.stroke();
      };
      cv.addEventListener("contextmenu", e => e.preventDefault());
      cv.addEventListener("pointerdown", e => {
        if (e.button !== 0 && e.button !== 2) return;
        e.preventDefault();
        cv.setPointerCapture(e.pointerId);
        const p = pos(e), color = e.button === 2 ? st.bg : st.fg;
        if (st.tool === "picker") {
          const d = ctx.getImageData(p.x, p.y, 1, 1).data, hex = "#" + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, "0")).join("");
          if (e.button === 2) st.bg = hex; else st.fg = hex;
          drawSwatches(); setTool("pencil"); return;
        }
        snap();
        if (st.tool === "fill") { floodFill(p.x, p.y, color); return; }
        drawing = { last: p, start: p, color, base: ctx.getImageData(0, 0, cv.width, cv.height) };
        if (st.tool === "pencil") stamp(p.x, p.y, 1, color);
        else if (st.tool === "brush") stamp(p.x, p.y, st.size, color, true);
        else if (st.tool === "eraser") stamp(p.x, p.y, st.size * 2 + 4, st.bg);
        else if (st.tool === "spray") {
          const spray = () => {
            if (!drawing) return;
            ctx.fillStyle = drawing.color;
            const r = st.size * 3 + 4;
            for (let i = 0; i < st.size * 3 + 6; i++) { const a = Math.random() * Math.PI * 2, d = Math.random() * r; ctx.fillRect(Math.round(drawing.last.x + Math.cos(a) * d), Math.round(drawing.last.y + Math.sin(a) * d), 1, 1); }
          };
          spray(); clearInterval(sprayTimer); sprayTimer = setInterval(spray, 30);
        }
      });
      cv.addEventListener("pointermove", e => {
        const p = pos(e);
        win.setStatus(["For Help, click Help Topics on the Help Menu.", `${Math.max(0, p.x)},${Math.max(0, p.y)}`, `${cv.width}x${cv.height}`]);
        if (!drawing) return;
        if (st.tool === "pencil") stroke(drawing.last.x, drawing.last.y, p.x, p.y, 1, drawing.color);
        else if (st.tool === "brush") stroke(drawing.last.x, drawing.last.y, p.x, p.y, st.size, drawing.color, true);
        else if (st.tool === "eraser") stroke(drawing.last.x, drawing.last.y, p.x, p.y, st.size * 2 + 4, st.bg);
        else if (["line", "rect", "ellipse"].includes(st.tool)) shape(drawing.start, p, drawing.color, drawing.base);
        drawing.last = p;
      });
      const end = () => { drawing = null; clearInterval(sprayTimer); };
      cv.addEventListener("pointerup", end);
      cv.addEventListener("pointercancel", end);
      win.onKey = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); win.undo(); } };
    },
    menu: win => [
      { label: "File", items: [
        { label: "New", action: () => win.newImage() },
        { label: "Save As PNG...", action: () => win.save() },
        { sep: true },
        { label: "Exit", action: () => win.close() },
      ] },
      { label: "Edit", items: [
        { label: "Undo", hint: "Ctrl+Z", action: () => win.undo() },
        { label: "Clear Image", action: () => win.clearImage() },
      ] },
      { label: "Help", items: [{ label: "About Paint", action: () => msgBox({ title: "About Paint", icon: "info", text: "Paint\nWindows 98 Edition\n\nLeft-click draws with the foreground color, right-click with the background color.\nCtrl+Z undoes. File > Save saves a PNG." }) }] },
    ],
    onClose: w => w.stopSpray && w.stopSpray(),
  });
}

/* ---------- Date/Time Properties ---------- */
function openDateTime(o = {}) {
  WM.open("datetime", {
    title: "Date/Time Properties", icon: "clock", w: 440, from: o.from, resizable: false,
    render(body, win) {
      const view = new Date(); view.setDate(1);
      const ticks = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, x = 50 + Math.sin(a) * 40, y = 50 - Math.cos(a) * 40; return `<rect x="${x - (i % 3 ? 1 : 2)}" y="${y - (i % 3 ? 1 : 2)}" width="${i % 3 ? 2 : 4}" height="${i % 3 ? 2 : 4}" fill="${i % 3 ? "#008080" : "#000080"}"/>`; }).join("");
      body.innerHTML = `
        <div class="tabs"><button type="button" class="tab is-active" data-tab="dt">Date &amp; Time</button></div>
        <div class="tab-panel" data-panel="dt">
          <div class="dt">
            <fieldset class="groupbox dt__cal"><legend>Date</legend>
              <div class="dt__cal-head"><button type="button" class="btn btn--sm" data-m="-1" aria-label="Previous month">&laquo;</button><b class="dt__month"></b><button type="button" class="btn btn--sm" data-m="1" aria-label="Next month">&raquo;</button></div>
              <div class="dt__grid"></div>
            </fieldset>
            <fieldset class="groupbox dt__clock"><legend>Time</legend>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="47" fill="#c0c0c0"/>${ticks}
                <line class="dt__h" x1="50" y1="50" x2="50" y2="28" stroke="#000080" stroke-width="5" stroke-linecap="round"/>
                <line class="dt__mm" x1="50" y1="50" x2="50" y2="16" stroke="#000080" stroke-width="3.5" stroke-linecap="round"/>
                <line class="dt__s" x1="50" y1="56" x2="50" y2="12" stroke="#000" stroke-width="1"/>
                <circle cx="50" cy="50" r="2.5" fill="#000"/>
              </svg>
              <span class="dt__time"></span>
            </fieldset>
          </div>
          <p style="margin:10px 2px 0">Current time zone: ${esc(Intl.DateTimeFormat().resolvedOptions().timeZone || "Local")}</p>
        </div>
        <div class="dialog-buttons"><button type="button" class="btn btn--default" data-act="ok">OK</button></div>`;
      const cal = () => {
        $(".dt__month", body).textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        const today = new Date(), first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        let h = ["S", "M", "T", "W", "T", "F", "S"].map(d => `<span class="dow">${d}</span>`).join("");
        for (let i = 0; i < first; i++) h += "<span></span>";
        for (let d = 1; d <= days; d++) {
          const isToday = d === today.getDate() && view.getMonth() === today.getMonth() && view.getFullYear() === today.getFullYear();
          h += `<span${isToday ? ' class="today"' : ""}>${d}</span>`;
        }
        $(".dt__grid", body).innerHTML = h;
      };
      const tick = () => {
        const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, hr = (d.getHours() % 12) + m / 60;
        $(".dt__h", body).setAttribute("transform", `rotate(${hr * 30} 50 50)`);
        $(".dt__mm", body).setAttribute("transform", `rotate(${m * 6} 50 50)`);
        $(".dt__s", body).setAttribute("transform", `rotate(${s * 6} 50 50)`);
        $(".dt__time", body).textContent = d.toLocaleTimeString("en-US");
      };
      $$("[data-m]", body).forEach(b => b.addEventListener("click", () => { view.setMonth(view.getMonth() + +b.dataset.m); cal(); }));
      $('[data-act="ok"]', body).addEventListener("click", () => win.close());
      cal(); tick();
      win.timer = setInterval(tick, 1000);
    },
    onClose: w => clearInterval(w.timer),
  });
}

/* ---------- The "crash" easter egg ---------- */
function showBSOD() {
  const el = $("#bsod");
  if (document.activeElement) document.activeElement.blur();
  el.hidden = false;
  Sound.play("error");
  const done = e => { if (e) e.preventDefault(); window.removeEventListener("keydown", done, true); el.removeEventListener("pointerdown", done); el.hidden = true; };
  setTimeout(() => { window.addEventListener("keydown", done, true); el.addEventListener("pointerdown", done); }, 500);
}

/* ---------- MS-DOS Prompt ---------- */
const BOOT_TIME = Date.now();
const FORTUNES = [
  "A bug in the hand is worth two in production.",
  "You will soon have an opportunity to clear your cache.",
  "The best time to commit was an hour ago. The second best time is now.",
  "Today is a good day to read the documentation.",
  "Your next project will work on the first try. (Just kidding.)",
  "Someone is thinking about your portfolio right now.",
  "It works on your machine. That's a start.",
];
const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "I'd tell you a UDP joke, but you might not get it.",
  "A SQL query walks into a bar, sees two tables and asks: 'Can I join you?'",
  "Why did the developer go broke? Because they used up all their cache.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
];
function levenshtein(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function openTerminal(o = {}) {
  WM.open("terminal", {
    title: "MS-DOS Prompt", icon: "terminal", w: 680, h: 440, from: o.from,
    render(body, win) {
      body.classList.add("body--flush", "body--column");
      body.innerHTML = `<div class="dos"><div class="dos__out"></div><div class="dos__line"><span class="dos__prompt"></span><input class="dos__input" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Command"></div><canvas class="dos__fx" hidden></canvas></div>`;
      const dos = $(".dos", body), out = $(".dos__out", body), input = $(".dos__input", body), promptEl = $(".dos__prompt", body), fx = $(".dos__fx", body);
      win.input = input;
      const FS = {
        "C:\\": ["PORTFOLIO", "GAMES", "WINDOWS", "AUTOEXEC.BAT", "CONFIG.SYS"],
        "C:\\PORTFOLIO": ["PROJECTS", "ABOUT.TXT", "SKILLS.TXT", "CONTACT.TXT", ...(RESUME ? ["RESUME.PDF"] : [])],
        "C:\\PORTFOLIO\\PROJECTS": PROJECTS.map((p, i) => `${String(i + 1).padStart(2, "0")}_${slugify(p.title).toUpperCase().slice(0, 14)}.LNK`),
        "C:\\GAMES": ["MINES.EXE", "SOL.EXE", "SNAKE.EXE"],
        "C:\\WINDOWS": ["SYSTEM", "DESKTOP", "WIN.COM", "CHROME.EXE", "PAINT.EXE", "NOTEPAD.EXE"],
        "C:\\WINDOWS\\SYSTEM": ["IMPORTANT.DLL", "DONT_DELETE.SYS"],
        "C:\\WINDOWS\\DESKTOP": [],
      };
      let cwd = "C:\\PORTFOLIO", busy = false, cancel = false;
      const hist = store.get("dosHistory", []);
      let hi = hist.length;
      const setPrompt = () => { promptEl.textContent = cwd + ">"; };
      setPrompt();
      const scroll = () => { dos.scrollTop = dos.scrollHeight; };
      const line = (html = "") => { const d = document.createElement("div"); d.innerHTML = html; out.appendChild(d); scroll(); return d; };
      const print = (text = "", cls = "") => String(text).split("\n").forEach(l => line(cls ? `<span class="${cls}">${esc(l)}</span>` : esc(l)));
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const typeOut = async (text, cls = "", speed = 8) => {
        for (const l of String(text).split("\n")) {
          const d = line(), span = document.createElement("span");
          if (cls) span.className = cls;
          d.appendChild(span);
          for (let i = 0; i < l.length; i += 2) {
            if (cancel) { span.textContent = l; break; }
            span.textContent = l.slice(0, i + 2);
            scroll();
            await wait(speed);
          }
          if (!l) span.textContent = "";
        }
      };
      const bar = (n, max, width = 20) => "#".repeat(Math.round(n / max * width)).padEnd(width, ".");
      const levelName = l => ["", "Beginner", "Learning", "Comfortable", "Advanced", "Expert"][l] || "";
      const resolve = p => {
        if (!p) return cwd;
        let path = p.toUpperCase().replace(/\//g, "\\");
        if (path === "..") return cwd.split("\\").slice(0, -1).join("\\") || "C:\\";
        if (path === "\\" || path === "C:" || path === "C:\\") return "C:\\";
        if (!/^C:/.test(path)) path = (cwd.endsWith("\\") ? cwd : cwd + "\\") + path;
        return path.replace(/\\$/, "") || "C:\\";
      };
      const run = async raw => {
        const parts = raw.trim().split(/\s+/), cmd = (parts[0] || "").toLowerCase(), arg = parts.slice(1).join(" "), argl = arg.toLowerCase();
        switch (cmd) {
          case "": return;
          case "help": case "?":
            print("");
            print(" INFO     ", "c-yellow"); print("   about  skills  projects  project <n>  contact  mail  resume  whoami  neofetch", "c-white");
            print(" FILES    ", "c-yellow"); print("   dir  cd <folder>  type <file>  tree  cls", "c-white");
            print(" FUN      ", "c-yellow"); print("   matrix  hack  fortune  joke  cowsay <text>  weather <city>  8ball <q>  roll  calc <math>", "c-white");
            print(" SYSTEM   ", "c-yellow"); print("   open <program>  theme <green|amber|blue|white>  date  time  ver  ping <host>", "c-white");
            print("   history  shutdown  restart  exit", "c-white");
            print("");
            print(" TAB completes commands. Up/Down browses history. Ctrl+C stops an effect.", "c-dim");
            print("");
            return;
          case "cls": case "clear": out.innerHTML = ""; return;
          case "ver": print("\nWindows 98 [Version 4.10.1998]\n"); return;
          case "whoami": print(`${NAME}${ROLE ? " - " + ROLE : ""}`, "c-cyan"); return;
          case "about":
            print("");
            await typeOut(ABOUT_PARAS.join("\n\n") || "Nothing here yet.", "c-white");
            print("");
            return;
          case "skills": {
            print("\n SKILL              LEVEL", "c-yellow");
            print(" -----              -----", "c-dim");
            for (const s of SKILL_LIST) {
              if (cancel) break;
              const lv = s.level || 3;
              const d = line(` ${esc(s.name.padEnd(18).slice(0, 18))} <span class="c-green">[</span><span class="c-green dos__fill"></span><span class="c-green">]</span> <span class="c-dim">${s.level ? levelName(s.level) : ""}</span>`);
              const fill = $(".dos__fill", d), target = bar(lv, 5);
              for (let i = 0; i <= 20; i++) { fill.textContent = target.slice(0, i).padEnd(20, " "); if (!cancel) await wait(12); }
              fill.textContent = target;
            }
            print("");
            return;
          }
          case "projects":
            print("");
            if (!PROJECTS.length) print(" (no projects yet)");
            PROJECTS.forEach((p, i) => { line(` <span class="c-yellow">${i + 1}.</span> <span class="c-white">${esc(p.title)}</span> <span class="c-dim">${esc((p.tags || []).join(", "))}</span>`); if (p.description) print(`    ${p.description}`, "c-dim"); });
            print("\n Type PROJECT <n> to open one.\n", "c-cyan");
            return;
          case "project": {
            const n = parseInt(arg, 10);
            if (PROJECTS[n - 1]) { print(`Opening ${PROJECTS[n - 1].title}...`, "c-cyan"); openProject(n - 1); }
            else print("Usage: PROJECT <number>. Type PROJECTS to see the list.", "c-red");
            return;
          }
          case "contact":
            print("");
            CONTACTS.forEach(x => line(` <span class="c-yellow">${esc((x.label + ":").padEnd(10))}</span> <a class="c-cyan" href="${esc(x.href)}" target="_blank" rel="noopener">${esc(x.value)}</a>`));
            print("\n Type MAIL to write me a message.\n", "c-dim");
            return;
          case "mail": openApp("contact"); print("Opening Outlook Express...", "c-cyan"); return;
          case "resume": if (RESUME) { openApp("resume"); print("Opening Resume.pdf...", "c-cyan"); } else print("No resume set yet (add one in content.js).", "c-dim"); return;
          case "neofetch": {
            const up = Math.max(1, Math.round((Date.now() - BOOT_TIME) / 60000));
            const info = [
              `<span class="c-cyan">${esc(FIRST.toLowerCase())}</span>@<span class="c-cyan">portfolio98</span>`,
              "-----------------",
              `<span class="c-yellow">OS</span>: Windows 98 SE`,
              `<span class="c-yellow">Host</span>: ${esc(NAME)}'s Portfolio`,
              `<span class="c-yellow">Role</span>: ${esc(ROLE || "Developer")}`,
              `<span class="c-yellow">Uptime</span>: ${up} min`,
              `<span class="c-yellow">Shell</span>: COMMAND.COM`,
              `<span class="c-yellow">Resolution</span>: ${window.innerWidth}x${window.innerHeight}`,
              `<span class="c-yellow">CPU</span>: Pentium II 400MHz`,
              `<span class="c-yellow">Memory</span>: 12MB / 64MB`,
              `<span class="c-yellow">Skills</span>: ${SKILLS.length}`,
              `<span class="c-yellow">Projects</span>: ${PROJECTS.length}`,
            ];
            const logo = [
              '<span class="c-red">  ########  </span><span class="c-green">########</span>',
              '<span class="c-red">  ########  </span><span class="c-green">########</span>',
              '<span class="c-red">  ########  </span><span class="c-green">########</span>',
              '<span class="c-red">  ########  </span><span class="c-green">########</span>',
              "",
              '<span class="c-blue">  ########  </span><span class="c-yellow">########</span>',
              '<span class="c-blue">  ########  </span><span class="c-yellow">########</span>',
              '<span class="c-blue">  ########  </span><span class="c-yellow">########</span>',
              '<span class="c-blue">  ########  </span><span class="c-yellow">########</span>',
              "", "", "",
            ];
            line("");
            for (let i = 0; i < Math.max(logo.length, info.length); i++) { line(`<span class="dos__logo">${logo[i] || ""}</span>${info[i] || ""}`); if (!cancel) await wait(35); }
            line(`<span class="dos__logo"></span>${["c-red", "c-green", "c-yellow", "c-blue", "c-magenta", "c-cyan", "c-white"].map(c => `<span class="${c} dos__swatch">###</span>`).join("")}`);
            line("");
            return;
          }
          case "dir": {
            const p = resolve(arg), items = FS[p];
            if (!items) { print("File Not Found", "c-red"); return; }
            print(`\n Volume in drive C is PORTFOLIO\n Directory of ${p}\n`);
            items.forEach(n => { const isDir = FS[(p.endsWith("\\") ? p : p + "\\") + n]; line(`${esc(n.padEnd(26))}${isDir ? '<span class="c-yellow">&lt;DIR&gt;</span>' : '<span class="c-dim">' + (1024 + n.length * 337).toLocaleString().padStart(9) + "</span>"}  06-14-98  12:00a`); });
            print(`        ${items.length} item(s)       2,147,483,648 bytes free\n`);
            return;
          }
          case "cd": case "chdir": {
            if (!arg) { print(cwd); return; }
            const p = resolve(arg);
            if (FS[p]) { cwd = p; setPrompt(); } else print("Invalid directory", "c-red");
            return;
          }
          case "tree": {
            print("\nC:\\");
            const walk = (p, pre) => { (FS[p] || []).forEach((n, i, a) => { const last = i === a.length - 1, child = (p.endsWith("\\") ? p : p + "\\") + n; print(pre + (last ? "\\---" : "+---") + n, FS[child] ? "c-yellow" : ""); if (FS[child]) walk(child, pre + (last ? "    " : "|   ")); }); };
            walk("C:\\", "");
            print("");
            return;
          }
          case "type": case "cat": {
            const f = argl.replace(/^.*\\/, "");
            if (/^about(\.txt)?$/.test(f)) return run("about");
            if (/^skills(\.txt)?$/.test(f)) return run("skills");
            if (/^contact(\.txt)?$/.test(f)) return run("contact");
            if (/^autoexec\.bat$/.test(f)) { print("@ECHO OFF\nSET PATH=C:\\WINDOWS;C:\\GAMES\nWIN", "c-white"); return; }
            if (/^config\.sys$/.test(f)) { print("DEVICE=C:\\WINDOWS\\HIMEM.SYS\nFILES=40\nBUFFERS=30\nCOFFEE=ON", "c-white"); return; }
            if (/^dont_delete\.sys$/.test(f)) { print("I said don't.", "c-red"); return; }
            print(arg ? "File not found - " + arg.toUpperCase() : "Required parameter missing", "c-red");
            return;
          }
          case "matrix": {
            await typeOut("Wake up, Neo...", "c-green", 45);
            await wait(500);
            if (cancel) return;
            await typeOut("The Matrix has you...", "c-green", 45);
            await wait(400);
            if (cancel) return;
            fx.hidden = false;
            fx.width = dos.clientWidth; fx.height = dos.clientHeight;
            fx.style.top = dos.scrollTop + "px";
            const g = fx.getContext("2d"), size = 16, cols = Math.ceil(fx.width / size), drops = Array.from({ length: cols }, () => Math.random() * -40);
            const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789ABCDEF<>/{}";
            await new Promise(resolve => {
              const step = () => {
                if (cancel || !WM.has("terminal")) { resolve(); return; }
                g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(0, 0, fx.width, fx.height);
                g.font = `${size}px monospace`;
                drops.forEach((y, i) => {
                  g.fillStyle = Math.random() < 0.05 ? "#cfffcf" : "#22e05a";
                  g.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
                  drops[i] = y * size > fx.height && Math.random() > 0.975 ? 0 : y + 1;
                });
                setTimeout(() => requestAnimationFrame(step), 40);
              };
              step();
            });
            fx.hidden = true;
            print("\n(Matrix closed. Press any key next time to stop it.)\n", "c-dim");
            return;
          }
          case "hack": {
            const target = arg || "mainframe";
            await typeOut(`> Initializing hack.exe against ${target}...`, "c-green", 10);
            for (const [label, ms] of [["Bypassing firewall", 18], ["Decrypting passwords", 14], ["Downloading the internet", 10], ["Reticulating splines", 16]]) {
              if (cancel) break;
              const d = line(""), span = document.createElement("span");
              span.className = "c-green"; d.appendChild(span);
              for (let p = 0; p <= 100; p += 5) { if (cancel) break; span.textContent = `  ${label.padEnd(26)} [${bar(p, 100)}] ${String(p).padStart(3)}%`; scroll(); await wait(ms + Math.random() * 30); }
            }
            for (let i = 0; i < 6 && !cancel; i++) { print(`  ${[0, 0, 0, 0].map(() => Math.floor(Math.random() * 255)).join(".")}  ${Math.random().toString(16).slice(2, 18).toUpperCase()}`, "c-dim"); await wait(60); }
            if (cancel) return;
            print("");
            ["  +-------------------------------+", "  |                               |", "  |       ACCESS  GRANTED         |", "  |                               |", "  +-------------------------------+"].forEach(l => print(l, "c-green dos__glow"));
            Sound.play("win");
            await wait(300);
            await typeOut(`\n  Just kidding. Nothing was hacked. But you should still hire ${FIRST}.\n`, "c-white");
            return;
          }
          case "fortune": print("\n  " + dcPick("dos:fortune", FORTUNES) + "\n", "c-yellow"); return;
          case "joke": await typeOut("\n  " + dcPick("dos:joke", JOKES) + "\n", "c-white"); return;
          case "cowsay": {
            const msg = arg || "Moo. Hire " + FIRST + ".";
            const w = Math.min(40, msg.length), lines = msg.match(new RegExp(`.{1,${w}}(\\s|$)`, "g")) || [msg];
            print(" " + "_".repeat(w + 2));
            lines.forEach((l, i) => print(`${lines.length === 1 ? "<" : i === 0 ? "/" : i === lines.length - 1 ? "\\" : "|"} ${l.trim().padEnd(w)} ${lines.length === 1 ? ">" : i === 0 ? "\\" : i === lines.length - 1 ? "/" : "|"}`));
            print(" " + "-".repeat(w + 2));
            print("        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||", "c-white");
            return;
          }
          case "weather": {
            const city = arg || "";
            print(`Contacting weather satellite${city ? " for " + city : ""}...`, "c-dim");
            try {
              const ctrl = new AbortController(), tm = setTimeout(() => ctrl.abort(), 5000);
              const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%l:+%C+%t+(feels+like+%f),+wind+%w`, { signal: ctrl.signal });
              clearTimeout(tm);
              const txt = (await r.text()).trim();
              if (!r.ok || !txt || txt.length > 200 || /<html/i.test(txt)) throw new Error("bad");
              print("  " + txt, "c-cyan");
            } catch (e) {
              print("  Satellite out of range (no internet?). Forecast: 100% chance of nostalgia.", "c-yellow");
            }
            return;
          }
          case "8ball": print("  \u{1F3B1} " + pick(["It is certain.", "Ask again later.", "Don't count on it.", "Signs point to yes.", "My sources say no.", "Without a doubt.", "Reply hazy, try again."]), "c-magenta"); return;
          case "roll": { const n = Math.max(2, Math.min(1000, parseInt(arg, 10) || 6)); print(`  You rolled a ${1 + Math.floor(Math.random() * n)} (1-${n})`, "c-yellow"); return; }
          case "calc": {
            const e = arg.replace(/\^/g, "**").replace(/x/gi, "*");
            if (!e || !/^[\d\s+\-*/().%]+$/.test(e)) { print("Usage: CALC 12 * (3 + 4)", "c-red"); return; }
            try { const v = Function(`"use strict";return (${e})`)(); print(`  = ${Number.isFinite(v) ? +v.toFixed(10) : "Error"}`, "c-cyan"); } catch (err) { print("  Syntax error", "c-red"); }
            return;
          }
          case "theme": case "color": {
            const themes = { green: "t-green", amber: "t-amber", blue: "t-blue", white: "t-white", a: "t-green", e: "t-amber", "1f": "t-blue", f: "t-white", default: "", "7": "" };
            if (!(argl in themes)) { print("Usage: THEME green | amber | blue | white | default", "c-red"); return; }
            dos.className = "dos " + themes[argl];
            store.set("dosTheme", themes[argl]);
            return;
          }
          case "date": print("Current date is " + new Date().toDateString()); return;
          case "time": print("Current time is " + new Date().toLocaleTimeString("en-US")); return;
          case "echo": print(arg); return;
          case "history": hist.slice(-20).forEach((h, i) => print(`  ${String(i + 1).padStart(3)}  ${h}`, "c-dim")); return;
          case "ping": {
            const host = arg || "localhost";
            print(`\nPinging ${host} with 32 bytes of data:\n`);
            for (let k = 0; k < 4 && !cancel; k++) { await wait(500); print(`Reply from ${host}: bytes=32 time=${180 + Math.floor(Math.random() * 120)}ms TTL=128`); }
            print("\n(That's dial-up for you.)\n", "c-dim");
            return;
          }
          case "open": case "start": case "run": {
            const k = resolveApp(arg);
            if (k) { print(`Starting ${APPS[k].label}...`, "c-cyan"); openApp(k); } else print(arg ? `Can't find "${arg}". Try OPEN CHROME, OPEN PAINT or OPEN SOLITAIRE.` : "Which program? Try OPEN CHROME", "c-red");
            return;
          }
          case "format": case "crash": case "deltree":
            print(cmd === "crash" ? "Crashing..." : "WARNING: ALL DATA ON NON-REMOVABLE DISK DRIVE C: WILL BE LOST!\nProceed with Format (Y/N)? Y", "c-red");
            await wait(700); showBSOD(); return;
          case "shutdown": powerOff("shutdown"); return;
          case "restart": case "reboot": powerOff("restart"); return;
          case "sudo": print("Nice try. This is DOS. There is no sudo.", "c-red"); return;
          case "hello": case "hi": print(`Hello! I'm ${FIRST}'s computer. Type HELP to see what I can do.`, "c-cyan"); return;
          case "exit": win.close(); return;
          default: {
            const exe = cmd.replace(/\.(exe|com|bat)$/, ""), map = { mines: "minesweeper", sol: "solitaire", win: "welcome", notepad: "notepad", paint: "paint", chrome: "chrome", snake: "snake" };
            const k = resolveApp(map[exe] || exe);
            if (k) { print(`Starting ${APPS[k].label}...`, "c-cyan"); openApp(k); return; }
            Sound.play("error");
            const known = Object.keys(CMDS);
            const best = known.map(c => [c, levenshtein(cmd, c)]).sort((a, b) => a[1] - b[1])[0];
            print("Bad command or file name", "c-red");
            if (best && best[1] <= 2) print(`Did you mean ${best[0].toUpperCase()}?`, "c-dim");
          }
        }
      };
      const CMDS = { help: 1, cls: 1, ver: 1, whoami: 1, about: 1, skills: 1, projects: 1, project: 1, contact: 1, mail: 1, resume: 1, neofetch: 1, dir: 1, cd: 1, tree: 1, type: 1, matrix: 1, hack: 1, fortune: 1, joke: 1, cowsay: 1, weather: 1, "8ball": 1, roll: 1, calc: 1, theme: 1, date: 1, time: 1, echo: 1, history: 1, ping: 1, open: 1, shutdown: 1, restart: 1, exit: 1 };

      dos.className = "dos " + store.get("dosTheme", "");
      line('<span class="c-white">Microsoft(R) Windows 98</span>');
      line('<span class="c-white">   (C)Copyright Microsoft Corp 1981-1998.</span>');
      line("");
      line(`${esc(NAME)}'s computer. Type <span class="c-yellow">HELP</span> to see what you can do, or try <span class="c-yellow">NEOFETCH</span>.`);
      line("");
      dos.addEventListener("pointerup", () => { if (!String(window.getSelection())) input.focus(); });
      input.addEventListener("keydown", async e => {
        if (e.key === "c" && e.ctrlKey) { if (busy) { e.preventDefault(); cancel = true; print("^C", "c-dim"); } return; }
        if (busy) { if (fx.hidden === false) cancel = true; e.preventDefault(); return; }
        if (e.key === "Enter") {
          e.preventDefault();
          const cmd = input.value;
          input.value = "";
          line(`${esc(cwd)}&gt;${esc(cmd)}`);
          if (cmd.trim()) { hist.push(cmd); if (hist.length > 100) hist.shift(); store.set("dosHistory", hist); }
          hi = hist.length;
          busy = true; cancel = false; dos.classList.add("is-busy");
          try { await run(cmd); } catch (err) { print("Abnormal program termination", "c-red"); }
          busy = false; cancel = false; dos.classList.remove("is-busy");
          if (WM.has("terminal")) { scroll(); input.focus(); }
        } else if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) { hi--; input.value = hist[hi]; } }
        else if (e.key === "ArrowDown") { e.preventDefault(); if (hi < hist.length - 1) { hi++; input.value = hist[hi]; } else { hi = hist.length; input.value = ""; } }
        else if (e.key === "Tab") {
          e.preventDefault();
          const v = input.value, sp = v.lastIndexOf(" ");
          if (sp < 0) {
            const m = Object.keys(CMDS).filter(c => c.startsWith(v.toLowerCase()));
            if (m.length === 1) input.value = m[0] + " ";
            else if (m.length > 1) print(m.join("  "), "c-dim");
          } else {
            const pre = v.slice(sp + 1).toUpperCase(), m = (FS[cwd] || []).filter(n => n.startsWith(pre));
            if (m.length === 1) input.value = v.slice(0, sp + 1) + m[0];
            else if (m.length > 1) print(m.join("  "), "c-dim");
          }
        }
      });
      window.addEventListener("keydown", win.anyKey = () => { if (!fx.hidden) cancel = true; }, true);
    },
    onOpen: w => w.input.focus(),
    onClose: w => window.removeEventListener("keydown", w.anyKey, true),
  });
}

/* ---------- Run ---------- */
function openRun() {
  WM.open("run", {
    title: "Run", icon: "terminal", w: 380, center: true, resizable: false,
    render(body, win) {
      body.innerHTML = `
        <div class="run__top">${icon("terminal", 32)}<p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p></div>
        <label class="run__row"><span><u>O</u>pen:</span><input class="field" list="runList" spellcheck="false" autocomplete="off"></label>
        <datalist id="runList">${Object.keys(APPS).filter(k => !APPS[k].hidden || k === "notepad").map(k => `<option value="${k}">`).join("")}</datalist>
        <div class="dialog-buttons">
          <button type="button" class="btn btn--default" data-act="ok">OK</button>
          <button type="button" class="btn" data-act="cancel">Cancel</button>
        </div>`;
      const input = $("input", body);
      input.value = store.get("lastRun", "");
      win.input = input;
      const go = () => {
        const v = input.value.trim();
        if (!v) return;
        store.set("lastRun", v);
        if (/^(https?:\/\/|www\.)|\.(com|org|net|io|app|dev)(\/|$)/i.test(v)) { win.close(); openChrome({ url: v }); return; }
        const k = resolveApp(v);
        if (k) { win.close(); openApp(k); }
        else msgBox({ title: v, icon: "error", text: `Cannot find the file '${v}' (or one of its components). Make sure the path and filename are correct.\n\nTry: about, projects, chrome, youtube, spotify, discord, cmd, paint, minesweeper` });
      };
      $('[data-act="ok"]', body).addEventListener("click", go);
      $('[data-act="cancel"]', body).addEventListener("click", () => win.close());
      input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); go(); } if (e.key === "Escape") win.close(); });
    },
    onOpen: w => { w.input.focus(); w.input.select(); },
  });
}

/* ---------- Welcome ---------- */
const TIPS = [
  "Click any icon on the desktop to open it. Everything here actually works.",
  "Drag windows by their title bars, and double-click a title bar to maximize.",
  "Right-click the desktop to make a new text file or change the wallpaper.",
  "Open the MS-DOS Prompt and type HELP to see what it can do.",
  "Sign the guestbook in Chrome 98. It's what people did on the Internet in 1998.",
  "Click Start, then Run..., and type the name of a program, like youtube.",
  "My projects live in the My Projects folder. Click one for details and links.",
  "Drag desktop icons anywhere you like. They'll stay where you put them.",
  "Bored? Minesweeper and Paint are on the desktop. Right-click plants a flag.",
  "Leave the computer alone for a few minutes and the screen saver kicks in.",
  "Click the clock in the corner for the calendar.",
];
function openWelcome(o = {}) {
  let t = Math.floor(Math.random() * TIPS.length);
  WM.open("welcome", {
    title: "Welcome", icon: "about", w: 520, from: o.from, center: true, resizable: false,
    render(body, win) {
      body.innerHTML = `
        <h1 class="welcome__title">Welcome to <b>Windows</b><span>98</span></h1>
        <p class="welcome__sub">You're on ${esc(NAME)}'s computer. Have a look around.</p>
        <div class="welcome__row">
          <div class="welcome__tip sunken-box">
            <p class="welcome__tip-head">${icon("bulb", 32)}Did you know...</p>
            <p class="welcome__tip-text"></p>
          </div>
          <div class="welcome__actions">
            <button type="button" class="btn" data-app="about">About Me</button>
            <button type="button" class="btn" data-app="projects">My Projects</button>
            <button type="button" class="btn" data-app="contact">Contact Me</button>
            <span class="welcome__gap"></span>
            <button type="button" class="btn" data-act="tip">Next Tip</button>
          </div>
        </div>
        <div class="welcome__foot">
          <label class="check"><input type="checkbox"${store.get("welcome", true) ? " checked" : ""}><span>Show this Welcome Screen next time you start Windows</span></label>
          <button type="button" class="btn btn--default" data-act="close">Close</button>
        </div>`;
      const tip = $(".welcome__tip-text", body);
      const showTip = () => { tip.textContent = TIPS[t % TIPS.length]; tip.style.animation = "none"; void tip.offsetWidth; tip.style.animation = ""; };
      showTip();
      $('[data-act="tip"]', body).addEventListener("click", () => { t++; showTip(); });
      $('[data-act="close"]', body).addEventListener("click", () => win.close());
      $("input", body).addEventListener("change", e => store.set("welcome", e.target.checked));
      $$("[data-app]", body).forEach(b => b.addEventListener("click", () => openApp(b.dataset.app, { from: b.getBoundingClientRect() })));
    },
    onOpen: w => $('[data-act="close"]', w.body).focus(),
    onClose: () => showStartHint(),
  });
}

/* ---------- GitHub (real link) ---------- */
function openGitHub() {
  if (!GITHUB_URL) { msgBox({ title: "GitHub", icon: "warning", text: "There's no GitHub link in content.js yet." }); return; }
  window.open(GITHUB_URL, "_blank", "noopener");
}

/* ==========================================================================
   APP REGISTRY
   ========================================================================== */
const APPS = {
  about:       { label: "About Me",       open: openAbout },
  projects:    { label: "My Projects",    open: openProjects },
  skills:      { label: "Skills.txt",     open: openSkills },
  contact:     { label: "Contact Me",     open: openContact },
  resume:      { label: "Resume.pdf",     open: openResume, hidden: !RESUME },
  bin:         { label: "Recycle Bin",    open: openBin },
  terminal:    { label: "MS-DOS Prompt",  open: openTerminal },
  chrome:      { label: "Chrome 98",      open: openChrome },
  youtube:     { label: "YouTube",        open: openYouTube },
  spotify:     { label: "Spotify",        open: openSpotify },
  discord:     { label: "Discord",        open: openDiscord },
  github:      { label: "GitHub",         open: openGitHubApp },
  minesweeper: { label: "Minesweeper",    open: openMinesweeper },
  solitaire:   { label: "Solitaire",      open: openSolitaire },
  snake:       { label: "Snake",          open: openSnake },
  paint:       { label: "Paint",          open: openPaint },
  notepad:     { label: "Notepad",            icon: "notepad",  open: openNewNote,   hidden: true },
  display:     { label: "Display Properties", icon: "monitor",  open: openDisplay,   hidden: true },
  datetime:    { label: "Date/Time",          icon: "clock",    open: openDateTime,  hidden: true },
  run:         { label: "Run",                icon: "terminal", open: openRun,       hidden: true },
  welcome:     { label: "Welcome",            icon: "about",    open: openWelcome,   hidden: true },
};
const ALIASES = {
  me: "about", aboutme: "about", sysdm: "about", info: "about",
  project: "projects", explorer: "projects", folder: "projects", work: "projects",
  skill: "skills", cv: "resume", "resume.pdf": "resume",
  mail: "contact", email: "contact", outlook: "contact", msimn: "contact",
  cmd: "terminal", command: "terminal", dos: "terminal", prompt: "terminal", "ms-dos": "terminal",
  iexplore: "chrome", browser: "chrome", internet: "chrome", netscape: "chrome", web: "chrome",
  yt: "youtube", video: "youtube", videos: "youtube",
  chat: "discord", music: "spotify", songs: "spotify", playlist: "spotify",
  recycle: "bin", trash: "bin", "recycle bin": "bin", recyclebin: "bin",
  desk: "display", control: "display", wallpaper: "display", "display properties": "display", screensaver: "display",
  git: "github", "github.com": "github", write: "notepad", wordpad: "notepad", edit: "notepad",
  winmine: "minesweeper", mines: "minesweeper", mine: "minesweeper",
  mspaint: "paint", pbrush: "paint", draw: "paint",
  sol: "solitaire", cards: "solitaire", klondike: "solitaire", nibbles: "snake",
  clock: "datetime", time: "datetime", date: "datetime", timedate: "datetime", calendar: "datetime",
};
// Extension point: files in apps/ register themselves (window.W98_APPS) before this script runs.
// Each entry: { key, label, group: "games" | "programs", aliases: [], open(opts, W98) }.
// The icon is images/<key>.svg. W98 is the small toolkit apps may use.
const W98 = window.W98 = { WM, store, Sound, msgBox, icon, ui, esc, $, $$, sleep, pick, NAME, FIRST, ROLE, C };
const EXT_APPS = (window.W98_APPS || []).filter(a => a && a.key && typeof a.open === "function" && !APPS[a.key]);
EXT_APPS.forEach(a => {
  APPS[a.key] = { label: a.label || a.key, icon: a.icon, open: o => a.open(o || {}, W98) };
  (a.aliases || []).forEach(al => { ALIASES[String(al).toLowerCase()] = a.key; });
});
function resolveApp(name) {
  const n = String(name || "").trim().toLowerCase().replace(/\.(exe|com|bat|txt|cpl|lnk)$/, "");
  if (APPS[n] && !(n === "resume" && !RESUME)) return n;
  if (ALIASES[n]) return ALIASES[n];
  return null;
}
function appInfo(k) {
  if (k.startsWith("doc:")) { const d = docsAll().find(x => x.id === k.slice(4)) || {}; return { label: d.name || "Document", icon: "notepad" }; }
  if (k.startsWith("file:")) { const f = binFile(k.slice(5)) || {}; return { label: f.name || k.slice(5), icon: f.icon || "skills" }; }
  const a = APPS[k] || {};
  return { label: a.label || k, icon: k === "bin" ? (binState().bin.length ? "binfull" : "bin") : (a.icon || k) };
}
function openApp(key, opts = {}) {
  if (key.startsWith("file:")) { openRestoredFile(key.slice(5), opts); return true; }
  if (key.startsWith("doc:")) { openDoc(key.slice(4), opts); return true; }
  const a = APPS[key];
  if (!a) return false;
  a.open(opts);
  return true;
}

/* ==========================================================================
   DESKTOP (draggable icons, rubber-band select, right-click menu)
   ========================================================================== */
const DESKTOP_ORDER = ["about", "projects", "skills", "contact", "resume", "bin", "terminal", "chrome", "youtube", "spotify", "discord", "github", "minesweeper", "solitaire", "snake", "paint"].concat(EXT_APPS.map(a => a.key)).filter(k => !APPS[k].hidden);
const CELL = { w: 80, h: 76 };
let iconOrder = DESKTOP_ORDER.slice();

const allIcons = () => {
  const hidden = hiddenApps(), s = binState();
  return iconOrder.filter(k => !hidden.includes(k))
    .concat(s.restored.filter(binFile).map(n => "file:" + n))
    .concat(docsAll().filter(d => !s.bin.includes("doc:" + d.id)).map(d => "doc:" + d.id));
};
function buildDesktopIcons(order = iconOrder) {
  iconOrder = order.slice();
  $("#desktopIcons").innerHTML = allIcons().map((k, i) => { const a = appInfo(k); return `
    <button type="button" class="desk-icon" data-app="${esc(k)}" style="--i:${i}">
      <span class="desk-icon__img">${icon(a.icon, 32)}</span>
      <span class="desk-icon__label">${esc(a.label)}</span>
    </button>`; }).join("");
  layoutIcons();
}
function gridSize() {
  const wrap = $("#desktopIcons");
  return { cols: Math.max(1, Math.floor(wrap.clientWidth / CELL.w)), rows: Math.max(1, Math.floor(wrap.clientHeight / CELL.h)) };
}
function layoutIcons() {
  const wrap = $("#desktopIcons"), { cols, rows } = gridSize(), mobile = isMobile();
  const saved = mobile ? {} : store.get("iconPos", {});
  const taken = new Set(), pos = {};
  const keys = allIcons();
  keys.forEach(k => {
    const p = saved[k];
    if (p && p.c < cols && p.r < rows && !taken.has(p.c + "," + p.r)) { pos[k] = p; taken.add(p.c + "," + p.r); }
  });
  let i = 0;
  keys.forEach(k => {
    if (pos[k]) return;
    for (;;) {
      const c = mobile ? i % cols : Math.floor(i / rows), r = mobile ? Math.floor(i / cols) : i % rows;
      i++;
      if (!taken.has(c + "," + r)) { pos[k] = { c, r }; taken.add(c + "," + r); break; }
    }
  });
  const offX = mobile ? Math.max(0, (wrap.clientWidth - cols * CELL.w) / 2) : 0;
  $$(".desk-icon", wrap).forEach(el => {
    const p = pos[el.dataset.app];
    el.style.left = offX + p.c * CELL.w + "px";
    el.style.top = p.r * CELL.h + "px";
  });
  return pos;
}
function saveIconPositions() {
  const map = {};
  $$(".desk-icon").forEach(el => { map[el.dataset.app] = { c: Math.round(el.offsetLeft / CELL.w), r: Math.round(el.offsetTop / CELL.h) }; });
  store.set("iconPos", map);
}

function initDesktop() {
  const desk = $("#desktop"), wrap = $("#desktopIcons"), box = $("#selectBox");
  applyBg(store.get("bg", "clouds"));
  applyCRT(store.get("crt", false));
  applyScheme(store.get("scheme", "standard"));
  buildDesktopIcons();
  window.addEventListener("resize", () => layoutIcons());

  wrap.addEventListener("click", e => {
    const ic = e.target.closest(".desk-icon");
    if (!ic) return;
    if (ic.dataset.dragged) { delete ic.dataset.dragged; return; }
    $$(".desk-icon", wrap).forEach(i => i.classList.toggle("is-selected", i === ic));
    openApp(ic.dataset.app, { from: $(".desk-icon__img", ic).getBoundingClientRect() });
  });

  // drag icons to rearrange them (they snap to the grid and remember their spot)
  wrap.addEventListener("pointerdown", e => {
    const ic = e.target.closest(".desk-icon");
    if (!ic || e.button !== 0 || isMobile()) return;
    const sx = e.clientX, sy = e.clientY, ox = ic.offsetLeft, oy = ic.offsetTop;
    let dragging = false;
    const binEl = () => $('.desk-icon[data-app="bin"]', wrap);
    const overBin = ev => { const b = binEl(); if (!b || b === ic) return false; const r = b.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; };
    const move = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!dragging) {
        if (Math.abs(dx) + Math.abs(dy) < 6) return;
        dragging = true;
        ic.classList.add("is-dragging");
        $$(".desk-icon", wrap).forEach(i => i.classList.toggle("is-selected", i === ic));
      }
      ic.style.left = ox + dx + "px";
      ic.style.top = oy + dy + "px";
      const b = binEl(); if (b) b.classList.toggle("is-drop", overBin(ev));
    };
    const up = ev => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!dragging) return;
      const b = binEl(); if (b) b.classList.remove("is-drop");
      if (overBin(ev)) { ic.dataset.dragged = "1"; sendToBinKey(ic.dataset.app); return; }
      ic.dataset.dragged = "1";
      setTimeout(() => { delete ic.dataset.dragged; }, 50);
      ic.classList.remove("is-dragging");
      const { cols, rows } = gridSize();
      const c = Math.max(0, Math.min(cols - 1, Math.round(ic.offsetLeft / CELL.w)));
      const r = Math.max(0, Math.min(rows - 1, Math.round(ic.offsetTop / CELL.h)));
      const other = $$(".desk-icon", wrap).find(o => o !== ic && Math.round(o.offsetLeft / CELL.w) === c && Math.round(o.offsetTop / CELL.h) === r);
      if (other) { other.style.left = ox + "px"; other.style.top = oy + "px"; }
      ic.style.left = c * CELL.w + "px";
      ic.style.top = r * CELL.h + "px";
      saveIconPositions();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });

  // rubber-band selection on empty desktop
  desk.addEventListener("pointerdown", e => {
    if (e.button !== 0 || (e.target !== desk && e.target !== wrap && e.target !== $("#deskSky") && !e.target.closest(".desktop__sky"))) return;
    const icons = $$(".desk-icon", wrap);
    icons.forEach(i => i.classList.remove("is-selected"));
    const sx = e.clientX, sy = e.clientY;
    let moved = false;
    desk.setPointerCapture(e.pointerId);
    const move = ev => {
      const x = Math.min(sx, ev.clientX), y = Math.min(sy, ev.clientY);
      const w = Math.abs(ev.clientX - sx), h = Math.abs(ev.clientY - sy);
      if (!moved && w + h < 4) return;
      moved = true;
      Object.assign(box.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
      box.hidden = false;
      icons.forEach(i => { const r = i.getBoundingClientRect(); i.classList.toggle("is-selected", r.left < x + w && r.right > x && r.top < y + h && r.bottom > y); });
    };
    const up = () => {
      box.hidden = true;
      desk.removeEventListener("pointermove", move);
      desk.removeEventListener("pointerup", up);
      desk.removeEventListener("pointercancel", up);
    };
    desk.addEventListener("pointermove", move);
    desk.addEventListener("pointerup", up);
    desk.addEventListener("pointercancel", up);
  });

  desk.addEventListener("contextmenu", e => {
    if (e.target.closest(".window, .taskbar, .start-menu")) return;
    e.preventDefault();
    const ic = e.target.closest(".desk-icon");
    if (ic) {
      $$(".desk-icon", wrap).forEach(i => i.classList.toggle("is-selected", i === ic));
      const k = ic.dataset.app, label = appInfo(k).label;
      const isFile = k.startsWith("file:") || k.startsWith("doc:");
      const f = k.startsWith("file:") ? binFile(k.slice(5)) || {} : k.startsWith("doc:") ? { type: "Text Document", size: kb((docsAll().find(d => d.id === k.slice(4)) || {}).text) } : null;
      if (isFile) {
        Menu.open([
          { label: "Open", bold: true, action: () => openApp(k, { from: $(".desk-icon__img", ic).getBoundingClientRect() }) },
          { sep: true },
          { label: "Delete", action: () => sendToBinKey(k) },
          { sep: true },
          { label: "Properties", action: () => msgBox({ title: `${label} Properties`, icon: "info", text: `${label}\n\nType:  ${f.type}\nSize:  ${f.size}\nLocation:  C:\\WINDOWS\\Desktop` }) },
        ], e.clientX, e.clientY);
        return;
      }
      Menu.open([
        { label: "Open", bold: true, action: () => openApp(k, { from: $(".desk-icon__img", ic).getBoundingClientRect() }) },
        { sep: true },
        ...(k === "bin" ? [{ label: "Empty Recycle Bin", action: () => { openApp("bin"); setTimeout(() => { const w = WM.get("bin"); if (w) w.empty(); }, 250); } }] : [{ label: "Delete", action: () => sendToBinKey(k) }]),
        { sep: true },
        { label: "Properties", action: () => msgBox({ title: `${label} Properties`, icon: "info", text: `${label}\n\nType:  ${k === "bin" ? "System Folder" : "Application"}\nLocation:  C:\\WINDOWS\\Desktop\nCreated:  Sunday, June 14, 1998` }) },
      ], e.clientX, e.clientY);
      return;
    }
    Menu.open([
      { label: "Arrange Icons by Name", action: () => { store.del("iconPos"); buildDesktopIcons(DESKTOP_ORDER.slice().sort((a, b) => appInfo(a).label.localeCompare(appInfo(b).label))); } },
      { label: "Line up Icons", action: () => { store.del("iconPos"); buildDesktopIcons(DESKTOP_ORDER); } },
      { sep: true },
      { label: "Refresh", action: () => { wrap.style.visibility = "hidden"; setTimeout(() => { wrap.style.visibility = ""; }, 120); } },
      { sep: true },
      { label: "New Text Document", action: () => openApp("notepad") },
      { sep: true },
      { label: "Properties", action: () => openApp("display") },
    ], e.clientX, e.clientY);
  });

  document.addEventListener("pointerdown", () => { Menu.closeAll(); StartMenu.close(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { Menu.closeAll(); StartMenu.close(); }
    const w = WM.active && WM.get(WM.active);
    if (w && w.onKey) w.onKey(e);
    if (e.key === "F2" && WM.active === "minesweeper") { e.preventDefault(); WM.get("minesweeper").newGame(); }
    if (e.key === "Delete" && !WM.active && !/input|textarea/i.test(document.activeElement.tagName)) $$(".desk-icon.is-selected").forEach(s => sendToBinKey(s.dataset.app));
  });
}

/* ==========================================================================
   START MENU
   ========================================================================== */
const StartMenu = {
  el: null, btn: null, fly: null,
  SUBS: {
    programs: ["chrome", "youtube", "spotify", "discord", "github", "terminal", "notepad", "paint"].concat(EXT_APPS.filter(a => a.group !== "games").map(a => a.key)),
    games: ["minesweeper", "solitaire", "snake"].concat(EXT_APPS.filter(a => a.group === "games").map(a => a.key)),
    settings: ["display", "datetime", "welcome"],
  },
  init() {
    this.el = $("#startMenu");
    this.btn = $("#startBtn");
    const item = (attrs, ic, label, sub) => `<button type="button" class="sm-item" role="menuitem" ${attrs}>${icon(ic, 32)}<span>${label}</span>${sub ? `<i class="sm-arrow">${G.arrowR}</i>` : ""}</button>`;
    this.el.innerHTML = `
      <div class="start-menu__banner"><span><b>Windows</b>98</span></div>
      <div class="start-menu__items" role="menu">
        ${item('data-app="about"', "about", "About Me")}
        ${item('data-app="projects"', "projects", "My Projects")}
        ${item('data-app="skills"', "skills", "Skills")}
        ${RESUME ? item('data-app="resume"', "resume", "Resume") : ""}
        ${item('data-app="contact"', "contact", "Contact Me")}
        <div class="sm-sep"></div>
        ${item('data-sub="programs" aria-haspopup="true"', "projects", "<u>P</u>rograms", true)}
        ${item('data-sub="games" aria-haspopup="true"', "solitaire", "<u>G</u>ames", true)}
        ${item('data-sub="settings" aria-haspopup="true"', "monitor", "<u>S</u>ettings", true)}
        ${item('data-act="run"', "terminal", "<u>R</u>un...")}
        <div class="sm-sep"></div>
        ${item('data-act="shutdown"', "power", "Sh<u>u</u>t Down...")}
      </div>`;
    this.btn.addEventListener("pointerdown", e => e.stopPropagation());
    this.btn.addEventListener("click", () => { hideStartHint(); Sound.play("click"); this.toggle(); });
    this.el.addEventListener("pointerdown", e => e.stopPropagation());
    this.el.addEventListener("click", e => {
      const b = e.target.closest("[data-app],[data-sub],[data-act]");
      if (!b) return;
      if (b.dataset.sub) { this.showSub(b); return; }
      this.close();
      if (b.dataset.app) openApp(b.dataset.app);
      else if (b.dataset.act === "run") openApp("run");
      else if (b.dataset.act === "shutdown") openShutdown();
    });
    this.el.addEventListener("pointerover", e => {
      const b = e.target.closest(".sm-item");
      if (!b) return;
      if (b.dataset.sub) this.showSub(b); else this.hideSub();
    });
  },
  toggle() { if (this.el.hidden) this.open(); else this.close(); },
  open() {
    Menu.closeAll();
    this.el.hidden = false;
    this.btn.classList.add("is-pressed");
    this.btn.setAttribute("aria-expanded", "true");
  },
  close() {
    if (!this.el || this.el.hidden) return;
    this.hideSub();
    this.el.hidden = true;
    this.btn.classList.remove("is-pressed");
    this.btn.setAttribute("aria-expanded", "false");
  },
  showSub(b) {
    if (this.fly && this.fly.dataset.sub === b.dataset.sub) return;
    this.hideSub();
    b.classList.add("is-open");
    const f = document.createElement("div");
    f.className = "menu sm-fly";
    f.dataset.sub = b.dataset.sub;
    f.innerHTML = this.SUBS[b.dataset.sub].map(k => `<button type="button" class="menu__item menu__item--icon" data-app="${k}">${icon(APPS[k].icon || k, 16)}<span class="menu__label">${esc(APPS[k].label)}</span></button>`).join("");
    this.el.appendChild(f);
    f.style.left = (this.el.offsetWidth - 4) + "px";
    f.style.top = b.offsetTop + "px";
    const r = f.getBoundingClientRect(), maxBottom = window.innerHeight - 32;
    if (r.bottom > maxBottom) f.style.top = (b.offsetTop - (r.bottom - maxBottom)) + "px";
    if (r.right > window.innerWidth) f.style.left = (window.innerWidth - r.width - this.el.getBoundingClientRect().left - 4) + "px";
    this.fly = f;
  },
  hideSub() {
    if (this.fly) { this.fly.remove(); this.fly = null; }
    $$(".sm-item.is-open", this.el).forEach(x => x.classList.remove("is-open"));
  },
};

/* ==========================================================================
   TASKBAR (Quick Launch, volume, clock)
   ========================================================================== */
function initTaskbar() {
  const ql = $("#quickLaunch");
  ql.innerHTML = `
    <button type="button" class="ql-btn" data-ql="desktop" title="Show Desktop">${icon("showdesk", 16)}</button>
    <button type="button" class="ql-btn" data-ql="chrome" title="Launch Chrome 98">${icon("chrome", 16)}</button>
    <button type="button" class="ql-btn" data-ql="terminal" title="MS-DOS Prompt">${icon("terminal", 16)}</button>`;
  ql.addEventListener("click", e => {
    const b = e.target.closest("[data-ql]");
    if (!b) return;
    if (b.dataset.ql === "desktop") WM.showDesktop(); else openApp(b.dataset.ql);
  });

  const vol = $("#trayVol");
  const drawVol = () => { vol.innerHTML = Sound.muted ? G.muted : G.speaker; vol.title = Sound.muted ? "Volume (muted)" : "Volume"; };
  drawVol();
  vol.addEventListener("pointerdown", e => e.stopPropagation());
  vol.addEventListener("click", () => {
    if (Menu.stack.some(s => s.el.classList.contains("vol"))) { Menu.closeAll(); return; }
    Menu.closeAll();
    const p = document.createElement("div");
    p.className = "vol";
    p.innerHTML = `<p>Volume</p><input type="range" min="0" max="1" step="0.05" value="${store.get("volume", 0.8)}" aria-label="Volume"><label class="check"><input type="checkbox"${Sound.muted ? " checked" : ""}><span>Mute</span></label>`;
    $('input[type="range"]', p).addEventListener("input", e => Sound.setVolume(+e.target.value));
    $('input[type="range"]', p).addEventListener("change", () => Sound.play("ding"));
    $('input[type="checkbox"]', p).addEventListener("change", e => { Sound.muted = e.target.checked; store.set("muted", Sound.muted); drawVol(); });
    const r = vol.getBoundingClientRect();
    Menu.mount(p, r.left - 40, r.top - 170);
  });

  const clock = $("#clock");
  const tick = () => {
    const d = new Date();
    clock.textContent = fmtTime(d);
    clock.title = d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };
  tick();
  setInterval(tick, 10000);
  clock.addEventListener("click", () => openApp("datetime"));
}

function showStartHint() {
  if (session.get("hint")) return;
  session.set("hint", "1");
  $("#startHint").hidden = false;
  setTimeout(hideStartHint, 6000);
}
function hideStartHint() { $("#startHint").hidden = true; }

/* ==========================================================================
   BOOT
   ========================================================================== */
let booting = false;
async function boot() {
  if (booting) return;
  booting = true;
  const bootEl = $("#boot"), bios = $("#bios"), out = $("#biosText"), splash = $("#splash");
  $("#desktop").classList.remove("is-on");
  bootEl.hidden = false; bios.hidden = false; splash.hidden = true; splash.classList.remove("is-on");
  out.textContent = "";

  let skipped = false;
  const skip = () => { skipped = true; };
  bootEl.addEventListener("pointerdown", skip);
  window.addEventListener("keydown", skip);
  const fast = session.get("booted") === "1" || reduceMotion();
  const wait = ms => (skipped ? Promise.resolve() : sleep(fast ? ms * 0.4 : ms));
  const type = async (s, ms = 90) => { if (skipped) return; out.textContent += s + "\n"; await wait(ms); };

  // build the sky now so it's ready by the time the splash fades in
  const sky = $(".splash__sky", splash);
  if (!sky.firstChild) sky.innerHTML = skySvg(11);

  await wait(300);
  await type("Award Modular BIOS v4.51PG, An Energy Star Ally");
  await type("Copyright (C) 1984-98, Award Software, Inc.", 220);
  await type("");
  await type("PENTIUM-II CPU at 400MHz", 200);
  if (!skipped) {
    const base = out.textContent;
    for (let k = 0; k <= 65536 && !skipped; k += 2048) {
      out.textContent = base + "Memory Test :  " + String(k).padStart(5, " ") + "K";
      await sleep(fast ? 8 : 22);
    }
    out.textContent = base + "Memory Test :  65536K OK\n";
    await wait(250);
  }
  await type("");
  await type("Award Plug and Play BIOS Extension v1.0A");
  await type("Copyright (C) 1998, Award Software, Inc.", 200);
  await type("   Detecting Primary Master  ... QUANTUM FIREBALL 4.3GB", 230);
  await type("   Detecting Primary Slave   ... None", 150);
  await type("   Detecting Secondary Master... ATAPI CD-ROM 32X", 190);
  await type("   Detecting Secondary Slave ... None", 240);
  await type("");
  await type("Starting Windows 98...", 650);

  bios.hidden = true;
  if (!skipped) {
    await sleep(200);
    splash.hidden = false;
    await sleep(30);
    splash.classList.add("is-on");
    await wait(3200);
    splash.classList.remove("is-on");
    await wait(500);
  }
  bootEl.removeEventListener("pointerdown", skip);
  window.removeEventListener("keydown", skip);
  bootEl.hidden = true;
  splash.hidden = true;
  session.set("booted", "1");
  booting = false;

  document.body.classList.add("is-busy");
  buildDesktopIcons();
  $("#desktop").classList.add("is-on", "is-intro");
  setTimeout(() => $("#desktop").classList.remove("is-intro"), 1600);
  Sound.play("startup");
  await sleep(reduceMotion() ? 0 : 700);
  document.body.classList.remove("is-busy");
  if (store.get("welcome", true)) openApp("welcome");
  else showStartHint();
}

/* ==========================================================================
   START
   ========================================================================== */
document.title = `${NAME} - Portfolio`;
{
  const desc = [ROLE, C.tagline].filter(Boolean).join(". ") || "An interactive portfolio, built as a working Windows 98 desktop.";
  const setMeta = (sel, v) => { const m = document.querySelector(sel); if (m) m.setAttribute("content", v); };
  setMeta('meta[name="description"]', desc);
  setMeta('meta[property="og:title"]', `${NAME} - Portfolio`);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[name="apple-mobile-web-app-title"]', NAME);
}
WM.init();
StartMenu.init();
initDesktop();
initTaskbar();
Saver.init();
boot();

})();