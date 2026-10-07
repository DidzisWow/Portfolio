// calc: registers with window.W98_APPS (see script.js "Extension point")
(function () {
  "use strict";
  const INVALID = "Invalid input for function", DIV0 = "Cannot divide by zero", UNDEF = "Result of function is undefined", OVERFLOW = "Overflow";
  const PREC = { pow: 7, root: 7, mul: 6, div: 6, mod: 6, add: 5, sub: 5, lsh: 4, and: 3, or: 2, xor: 1 };
  const BINARY = ["add", "sub", "mul", "div", "mod", "and", "or", "xor", "lsh", "pow"];
  const STD_W = 250, SCI_W = 452;
  let clip = "";                                // fallback clipboard when the system one is not available

  /* ====================================================================
     ENGINE: all of the calculator behaviour, no DOM
     ==================================================================== */
  function createEngine() {
    const S = {
      sci: false, base: 10, word: 64, ang: "deg", inv: false, hyp: false, fe: false, group: false,
      entry: null,          // the number being typed (a string), or null while a result is showing
      val: 0,               // the number shown when entry is null
      stack: [],            // pending operators: { v, op, pr } or { paren: true }
      lastOp: false, err: null, rep: null,
      mem: 0, data: [], statOpen: false,
    };
    let onStat = () => {};
    const big = v => BigInt(Math.trunc(v));
    const wrap = v => Number(BigInt.asIntN(S.word, big(v)));
    const cur = () => S.err ? 0 : S.entry !== null ? parseEntry(S.entry) : S.val;
    function parseEntry(e) {
      if (S.base === 10) return parseFloat(e);
      return Number(BigInt.asIntN(S.word, BigInt(({ 16: "0x", 8: "0o", 2: "0b" })[S.base] + e)));
    }
    const fin = v => {
      if (Number.isNaN(v)) throw INVALID;
      if (!Number.isFinite(v)) throw OVERFLOW;
      return S.base !== 10 ? wrap(v) : v;
    };
    const depth = () => S.stack.filter(s => s.paren).length;
    const toRad = x => S.ang === "deg" ? x * Math.PI / 180 : S.ang === "grad" ? x * Math.PI / 200 : x;
    const fromRad = x => S.ang === "deg" ? x * 180 / Math.PI : S.ang === "grad" ? x * 200 / Math.PI : x;
    const digitLimit = () => S.base === 10 ? 32 : S.base === 16 ? S.word / 4 : S.base === 8 ? Math.ceil(S.word / 3) : S.word;

    /* ---------- formatting ---------- */
    function expStr(a) {                          // 1.5e+21 style, always with the decimal point
      const [m, ex] = a.toExponential(14).split("e");
      return m.replace(/(\.\d*?)0+$/, "$1") + "e" + ex;
    }
    function fmtNum(v) {
      if (v === 0) return "0";
      const neg = v < 0, a = Math.abs(v);
      if (S.fe) return (neg ? "-" : "") + expStr(a);
      let s;
      if (Number.isInteger(a) && a <= 18446744073709551616) s = BigInt(a).toString();
      else {
        const [m, ex] = a.toExponential(14).split("e"), exp = +ex;
        if (exp >= 32 || exp < -24) return (neg ? "-" : "") + expStr(a);
        const digits = m.replace(".", "").replace(/0+$/, "") || "0";
        if (exp >= 0) s = digits.length <= exp + 1 ? digits.padEnd(exp + 1, "0") : digits.slice(0, exp + 1) + "." + digits.slice(exp + 1);
        else s = "0." + "0".repeat(-exp - 1) + digits;
      }
      return (neg ? "-" : "") + s;
    }
    const entryText = e => e.includes(".") ? e : e.includes("e") ? e.replace("e", ".e") : e + ".";
    const bigStr = v => BigInt.asUintN(S.word, big(v)).toString(S.base).toUpperCase();
    const groupInt = s => /e/.test(s) ? s : s.replace(/^(-?)(\d+)/, (m, sg, d) => sg + d.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    function text(grouped = true) {
      if (S.err) return S.err;
      if (S.base !== 10) return S.entry !== null ? S.entry.toUpperCase() : bigStr(S.val);
      let t = S.entry !== null ? entryText(S.entry) : fmtNum(S.val);
      if (S.entry === null && !/[.e]/.test(t)) t += ".";
      return grouped && S.group ? groupInt(t) : t;
    }

    /* ---------- errors ---------- */
    function guard(fn) {
      try { fn(); } catch (e) {
        if (typeof e !== "string") throw e;
        S.err = e; S.stack = []; S.entry = null; S.rep = null; S.lastOp = false;
      }
    }

    /* ---------- number entry ---------- */
    function digit(ch) {
      if (parseInt(ch, 16) >= S.base) return;
      let e = S.entry === null ? "" : S.entry;
      if (S.base === 10 && e.includes("e")) {                       // typing an exponent
        const i = e.indexOf("e"), ex = e.slice(i + 2);
        if (ex.length >= 3 && ex !== "0") return;
        S.entry = e.slice(0, i + 2) + (ex === "0" ? ch : ex + ch);
      } else {
        if (e.replace(/[-.]/g, "").length >= digitLimit()) return;
        S.entry = e === "" || e === "0" ? ch : e + ch;
      }
      S.lastOp = false;
    }
    function dot() {
      if (S.base !== 10) return;
      if (S.entry === null) S.entry = "0.";
      else if (!S.entry.includes(".") && !S.entry.includes("e")) S.entry += ".";
      S.lastOp = false;
    }
    function exp() {
      if (S.base !== 10) return;
      if (S.entry === null) { const t = fmtNum(S.val); if (/e/.test(t)) return; S.entry = t; }
      if (!S.entry.includes("e")) S.entry = (S.entry.includes(".") ? S.entry : S.entry + ".") + "e+0";
      S.lastOp = false;
    }
    function negate() {
      if (S.entry !== null && S.base === 10) {
        const e = S.entry;
        if (e.includes("e")) S.entry = e.replace(/e([+-])/, (m, s) => "e" + (s === "+" ? "-" : "+"));
        else if (e === "0") return;
        else S.entry = e[0] === "-" ? e.slice(1) : "-" + e;
      } else { const x = cur(); S.val = S.base === 10 ? -x : wrap(-x); S.entry = null; }
    }
    function back() {
      if (S.entry === null) return;
      let e = S.entry.slice(0, -1);
      if (/e[+-]$/.test(e)) e = e.slice(0, -2);
      if (e === "" || e === "-" || e === "-0") e = "0";
      S.entry = e.endsWith(".") ? e.slice(0, -1) || "0" : e;
    }

    /* ---------- arithmetic ---------- */
    function apply(op, a, b) {
      let r;
      switch (op) {
        case "add": case "sub": {
          r = op === "add" ? a + b : a - b;
          if (Math.abs(r) <= 1e-15 * Math.max(Math.abs(a), Math.abs(b))) r = 0;   // 0.3 - 0.1 - 0.2 is 0, not 2.7e-17
          break;
        }
        case "mul": r = a * b; break;
        case "div": if (b === 0) throw a === 0 ? UNDEF : DIV0; r = S.base === 10 ? a / b : Math.trunc(a / b); break;
        case "mod": if (b === 0) throw DIV0; r = a % b; break;
        case "pow": if (a === 0 && b < 0) throw DIV0; r = Math.pow(a, b); break;
        case "root": if (b === 0) throw DIV0; r = a < 0 && Number.isInteger(b) && b % 2 !== 0 ? -Math.pow(-a, 1 / b) : Math.pow(a, 1 / b); break;
        case "lsh": { const n = Math.trunc(b); r = n < 0 || n >= S.word ? 0 : Number(BigInt.asIntN(S.word, big(a) << BigInt(n))); break; }
        default: { const x = big(a), y = big(b); r = Number(BigInt.asIntN(S.word, op === "and" ? x & y : op === "or" ? x | y : x ^ y)); }
      }
      return fin(r);
    }
    const prec = op => S.sci ? PREC[op] : 1;
    function binary(op) {
      if (op === "pow" && S.inv) op = "root";
      let x;
      const top = S.stack[S.stack.length - 1];
      if (S.lastOp && top && !top.paren) x = S.stack.pop().v; else x = cur();
      const p = prec(op);
      while (S.stack.length) {
        const t = S.stack[S.stack.length - 1];
        if (t.paren || t.pr < p) break;
        S.stack.pop();
        x = apply(t.op, t.v, x);
      }
      S.stack.push({ v: x, op, pr: p });
      S.val = x; S.entry = null; S.lastOp = true; S.rep = null;
      S.inv = false;
    }
    function equals() {
      let x = cur();
      if (S.stack.length) {
        const last = [...S.stack].reverse().find(s => !s.paren);
        const rep = last ? { op: last.op, n: x } : null;
        while (S.stack.length) { const t = S.stack.pop(); if (!t.paren) x = apply(t.op, t.v, x); }
        S.rep = rep;
      } else if (S.rep) x = apply(S.rep.op, x, S.rep.n);
      S.val = x; S.entry = null; S.lastOp = false;
    }
    function openParen() {
      if (depth() >= 25) return;
      S.stack.push({ paren: true }); S.entry = "0"; S.lastOp = false;
    }
    function closeParen() {
      if (!depth()) return;
      let x = cur();
      while (S.stack.length) {
        const t = S.stack.pop();
        if (t.paren) break;
        x = apply(t.op, t.v, x);
      }
      S.val = x; S.entry = null; S.lastOp = false;
    }
    function result(r) { S.val = fin(r); S.entry = null; S.lastOp = false; }
    function trig(name) {
      const x = cur();
      let r;
      if (S.hyp) {
        if (S.inv) {
          if ((name === "cos" && x < 1) || (name === "tan" && Math.abs(x) >= 1)) throw INVALID;
          r = Math["a" + name + "h"](x);
        } else r = Math[name + "h"](x);
      } else if (S.inv) {
        if (name !== "tan" && Math.abs(x) > 1) throw INVALID;
        r = fromRad(Math["a" + name](x));
      } else {
        const t = toRad(x);
        if (name === "tan" && Math.abs(Math.cos(t)) < 1e-10) throw DIV0;
        r = Math[name](t);
        if (Math.abs(r) < 1e-14 && Math.abs(t) > 1e-3) r = 0;         // sin(180 deg) is 0, not 1.2e-16
      }
      result(r);
    }
    function gamma(z) {
      if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
      z -= 1;
      const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
      let a = c[0];
      const t = z + 7.5;
      for (let i = 1; i < 9; i++) a += c[i] / (z + i);
      return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * a;
    }
    function fact() {
      const x = cur();
      if (x < 0) throw INVALID;
      if (x > 170) throw OVERFLOW;
      let r;
      if (Number.isInteger(x)) { r = 1; for (let i = 2; i <= x; i++) r *= i; }
      else r = Number(gamma(x + 1).toPrecision(14));
      result(r);
    }
    function dms() {
      const x = cur(), s = x < 0 ? -1 : 1, a = Math.abs(x);
      let r;
      if (!S.inv) {
        const d = Math.floor(a), rem = (a - d) * 60, m = Math.floor(rem + 1e-9), sec = (rem - m) * 60;
        r = d + m / 100 + sec / 10000;
      } else {
        const d = Math.floor(a), rem = (a - d) * 100, m = Math.floor(rem + 1e-9), sec = (rem - m) * 100;
        r = d + m / 60 + sec / 3600;
      }
      result(s * Number(r.toPrecision(14)));
    }
    function stats(kind) {
      const d = S.data, n = d.length;
      if (!n) throw INVALID;
      const sum = d.reduce((a, b) => a + b, 0), sq = d.reduce((a, b) => a + b * b, 0);
      if (kind === "sum") return result(S.inv ? sq : sum);
      if (kind === "ave") return result(S.inv ? sq / n : sum / n);
      const mean = sum / n, ss = d.reduce((a, b) => a + (b - mean) * (b - mean), 0);
      if (S.inv) return result(Math.sqrt(ss / n));
      if (n < 2) throw DIV0;
      result(Math.sqrt(ss / (n - 1)));
    }

    /* ---------- the key dispatcher ---------- */
    const FUNCS = { sin: 1, cos: 1, tan: 1, ln: 1, log: 1, sq: 1, cube: 1, pi: 1, dms: 1, int: 1, ave: 1, sum: 1, sd: 1 };
    function press(k) {
      if (S.err && k !== "C" && k !== "CE") return;
      guard(() => {
        if (/^d[0-9A-F]$/.test(k)) return digit(k[1]);
        if (BINARY.includes(k)) return binary(k);
        const x = () => cur();
        switch (k) {
          case "dot": return dot();
          case "eq": return equals();
          case "neg": return negate();
          case "Back": return back();
          case "CE": S.err = null; S.entry = "0"; S.lastOp = false; return;
          case "C": S.err = null; S.entry = null; S.val = 0; S.stack = []; S.rep = null; S.lastOp = false; return;
          case "MC": S.mem = 0; return;
          case "MR": S.val = S.mem; S.entry = null; S.lastOp = false; return;
          case "MS": S.mem = x(); S.val = S.mem; S.entry = null; return;
          case "M+": S.mem = fin(S.mem + x()); S.val = x(); S.entry = null; return;
          case "sqrt": if (x() < 0) throw INVALID; return result(Math.sqrt(x()));
          case "recip": if (x() === 0) throw DIV0; return result(1 / x());
          case "pct": {
            const top = S.stack[S.stack.length - 1];
            return result(top && !top.paren ? top.v * x() / 100 : 0);
          }
          case "lp": return openParen();
          case "rp": return closeParen();
          case "sin": case "cos": case "tan": trig(k); break;
          case "ln": if (S.inv) result(Math.exp(x())); else { if (x() <= 0) throw INVALID; result(Math.log(x())); } break;
          case "log": if (S.inv) result(Math.pow(10, x())); else { if (x() <= 0) throw INVALID; result(Math.log10(x())); } break;
          case "sq": if (S.inv) { if (x() < 0) throw INVALID; result(Math.sqrt(x())); } else result(x() * x()); break;
          case "cube": result(S.inv ? Math.cbrt(x()) : x() * x() * x()); break;
          case "fact": return fact();
          case "pi": if (S.base !== 10) return; S.val = S.inv ? 2 * Math.PI : Math.PI; S.entry = null; S.lastOp = false; break;
          case "dms": dms(); break;
          case "int": { const v = x(); result(S.inv ? Number((v - Math.trunc(v)).toPrecision(14)) : Math.trunc(v)); break; }
          case "not": return result(Number(BigInt.asIntN(S.word, ~big(x()))));
          case "fe": S.fe = !S.fe; return;
          case "exp": return exp();
          case "dat": S.data.push(x()); S.val = x(); S.entry = null; onStat(); return;
          case "ave": case "sum": stats(k); break;
          case "sd": stats("sd"); break;
          default: return;
        }
        if (FUNCS[k]) { S.inv = false; S.hyp = false; }
      });
    }

    return {
      S, press, text, depth, guard,
      setOnStat(fn) { onStat = fn; },
      plain() { return S.err ? "" : text(false).replace(/\.$/, ""); },
      setBase(b) {
        if (S.err) return;
        const v = cur();
        S.base = b; S.entry = null; S.lastOp = false; S.inv = S.hyp = false;
        S.val = b === 10 ? v : wrap(v);
      },
      setWord(w) { S.word = w; S.val = wrap(cur()); S.entry = null; },
      setAngle(a) { S.ang = a; },
      toggle(name) { if (S.base === 10 && (name === "inv" || name === "hyp")) S[name] = !S[name]; },
      setSci(on) {
        S.sci = on;
        if (!on) { if (S.base !== 10) this.setBase(10); S.inv = S.hyp = false; S.stack = []; S.lastOp = false; S.fe = false; }
      },
      paste(str) {
        if (S.err) return false;
        let s = String(str).trim().replace(/[,\s]/g, "");
        if (!s) return false;
        if (S.base === 10) {
          if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return false;
          const v = parseFloat(s);
          if (!Number.isFinite(v)) return false;
          if (/e/i.test(s) || s.replace(/[-+.]/g, "").length > 32) { S.entry = null; S.val = v; }
          else {
            s = s.replace(/^\+/, "").replace(/^(-?)0+(?=\d)/, "$1").replace(/^(-?)\./, "$10.");
            S.entry = s === "-0" ? "0" : s;
          }
        } else {
          if (!/^[0-9a-f]+$/i.test(s) || s.length > digitLimit()) return false;
          for (const ch of s) if (parseInt(ch, 16) >= S.base) return false;
          S.entry = s.toUpperCase().replace(/^0+(?=.)/, "");
        }
        S.lastOp = false;
        return true;
      },
    };
  }

  /* ====================================================================
     UI
     ==================================================================== */
  const STD = [
    ["MC", "d7", "d8", "d9", "div", "sqrt"],
    ["MR", "d4", "d5", "d6", "mul", "pct"],
    ["MS", "d1", "d2", "d3", "sub", "recip"],
    ["M+", "d0", "neg", "dot", "add", "eq"],
  ];
  const SCI = [
    ["sta", "fe", "lp", "rp", "MC", "d7", "d8", "d9", "div", "mod", "and"],
    ["ave", "dms", "exp", "ln", "MR", "d4", "d5", "d6", "mul", "or", "xor"],
    ["sum", "sin", "pow", "log", "MS", "d1", "d2", "d3", "sub", "lsh", "not"],
    ["sd", "cos", "cube", "fact", "M+", "d0", "neg", "dot", "add", "eq", "int"],
    ["dat", "tan", "sq", "recip", "pi", "dA", "dB", "dC", "dD", "dE", "dF"],
  ];
  const SCI_COLS = [1, 3, 4, 5, 7, 9, 10, 11, 12, 14, 15];
  const LABEL = {
    MC: "MC", MR: "MR", MS: "MS", "M+": "M+", div: "/", mul: "*", sub: "-", add: "+", eq: "=", sqrt: "sqrt", pct: "%", recip: "1/x", neg: "+/-", dot: ".",
    mod: "Mod", and: "And", or: "Or", xor: "Xor", lsh: "Lsh", not: "Not", int: "Int", sta: "Sta", fe: "F-E", lp: "(", rp: ")", ave: "Ave", dms: "dms",
    exp: "Exp", ln: "ln", sum: "Sum", sin: "sin", pow: "x^y", log: "log", sd: "s", cos: "cos", cube: "x^3", fact: "n!", dat: "Dat", tan: "tan", sq: "x^2", pi: "pi",
  };
  const RED = new Set(["MC", "MR", "MS", "M+", "div", "mul", "sub", "add", "eq", "mod", "and", "or", "xor", "lsh", "not", "int", "sta", "ave", "sum", "sd", "dat", "lp", "rp", "Back", "CE", "C"]);
  const NEEDS_DEC = new Set(["dot", "fe", "dms", "sin", "cos", "tan", "exp", "ln", "log", "pi", "recip", "fact", "int", "sqrt", "pct"]);
  const STAT_KEYS = new Set(["ave", "sum", "sd", "dat"]);

  const KEYMAP = {
    ".": "dot", ",": "dot", "+": "add", "-": "sub", "*": "mul", "/": "div", "Enter": "eq", "=": "eq", "Backspace": "Back", "Escape": "C", "Delete": "CE", "@": "sqrt", "r": "recip", "F9": "neg",
  };
  const SCI_KEYMAP = { s: "sin", o: "cos", t: "tan", l: "log", n: "ln", p: "pi", "!": "fact", q: "sq", "#": "cube", "(": "lp", ")": "rp", "^": "pow", y: "pow", x: "exp", v: "fe", m: "dms", ";": "int", "&": "and", "|": "or", "~": "not", "<": "lsh", "%": "mod" };

  const kbtn = (id, row, col, cls) => `<button type="button" class="calc__k ${RED.has(id) ? "calc__k--r" : "calc__k--b"}${cls ? " " + cls : ""}" data-k="${id}" style="grid-row:${row};grid-column:${col}">${LABEL[id] || id.slice(1)}</button>`;
  const radio = (name, val, label) => `<label class="radio calc__r"><input type="radio" name="${name}" value="${val}"><span>${label}</span></label>`;

  function open(opts, W98) {
    const { WM, store, msgBox } = W98;
    const E = createEngine();
    E.S.sci = !!store.get("calcSci", false);
    E.S.group = !!store.get("calcGroup", false);

    WM.open("calc", {
      title: "Calculator", icon: "calc", from: opts.from, resizable: false, w: E.S.sci ? SCI_W : STD_W,
      render(body, win) {
        body.classList.add("body--flush");
        const root = document.createElement("div");
        body.appendChild(root);
        let disp, txt, memEl, parenEl, btns = [];

        function build() {
          const sci = E.S.sci;
          root.className = "calc " + (sci ? "calc--sci" : "calc--std");
          let h = `<div class="calc__disp" role="status" aria-live="polite"><span class="calc__txt">0.</span></div><div class="calc__keys">`;
          if (sci) {
            h += `<fieldset class="calc__grp" style="grid-row:1;grid-column:1/8">${radio("calc-base", 16, "Hex")}${radio("calc-base", 10, "Dec")}${radio("calc-base", 8, "Oct")}${radio("calc-base", 2, "Bin")}</fieldset>`;
            h += `<fieldset class="calc__grp" data-grp="ang" style="grid-row:1;grid-column:9/16">${radio("calc-ang", "deg", "Degrees")}${radio("calc-ang", "rad", "Radians")}${radio("calc-ang", "grad", "Grads")}</fieldset>`;
            h += `<fieldset class="calc__grp" data-grp="word" style="grid-row:1;grid-column:9/16" hidden>${radio("calc-word", 64, "Qword")}${radio("calc-word", 32, "Dword")}${radio("calc-word", 16, "Word")}${radio("calc-word", 8, "Byte")}</fieldset>`;
            h += `<div class="calc__opts" style="grid-row:2;grid-column:1/5"><label class="check"><input type="checkbox" data-chk="inv"><span>Inv</span></label><label class="check"><input type="checkbox" data-chk="hyp"><span>Hyp</span></label></div>`;
            h += `<div class="calc__ind calc__ind--paren" style="grid-row:2;grid-column:5"></div><div class="calc__ind calc__ind--mem" style="grid-row:2;grid-column:7"></div>`;
            h += `<div class="calc__top" style="grid-row:2;grid-column:9/16">${["Back", "CE", "C"].map(k => `<button type="button" class="calc__k calc__k--r" data-k="${k}">${k === "Back" ? "Backspace" : k}</button>`).join("")}</div>`;
            SCI.forEach((row, r) => row.forEach((id, c) => { h += kbtn(id, r + 3, SCI_COLS[c], id === "eq" ? "calc__k--eq" : ""); }));
          } else {
            h += `<div class="calc__ind calc__ind--mem" style="grid-row:1;grid-column:1"></div>`;
            h += `<div class="calc__top" style="grid-row:1;grid-column:3/8">${["Back", "CE", "C"].map(k => `<button type="button" class="calc__k calc__k--r" data-k="${k}">${k === "Back" ? "Backspace" : k}</button>`).join("")}</div>`;
            STD.forEach((row, r) => row.forEach((id, c) => { h += kbtn(id, r + 2, c === 0 ? 1 : c + 2); }));
          }
          h += `</div>`;
          root.innerHTML = h;
          disp = root.querySelector(".calc__disp"); txt = root.querySelector(".calc__txt");
          memEl = root.querySelector(".calc__ind--mem"); parenEl = root.querySelector(".calc__ind--paren");
          btns = Array.from(root.querySelectorAll("[data-k]"));
        }

        const enabled = k => {
          const S = E.S;
          if (S.err) return k === "C" || k === "CE";
          if (/^d[0-9A-F]$/.test(k)) return parseInt(k[1], 16) < S.base;
          if (S.base !== 10 && NEEDS_DEC.has(k)) return false;
          if (STAT_KEYS.has(k)) return S.statOpen;
          return true;
        };
        function fit() {
          let size = 16;
          disp.style.fontSize = "";
          while (size > 8 && txt.getBoundingClientRect().width > disp.clientWidth - 10) disp.style.fontSize = (--size) + "px";
        }
        function refresh() {
          const S = E.S;
          txt.textContent = E.text();
          fit();
          if (memEl) memEl.textContent = S.mem !== 0 ? "M" : "";
          if (parenEl) parenEl.textContent = E.depth() ? "(=" + E.depth() : "";
          btns.forEach(b => { b.disabled = !enabled(b.dataset.k); });
          if (S.sci) {
            const sync = (name, val) => root.querySelectorAll(`input[name="${name}"]`).forEach(i => { i.checked = String(i.value) === String(val); });
            sync("calc-base", S.base); sync("calc-ang", S.ang); sync("calc-word", S.word);
            root.querySelector('[data-grp="ang"]').hidden = S.base !== 10;
            root.querySelector('[data-grp="word"]').hidden = S.base === 10;
            root.querySelectorAll("[data-chk]").forEach(c => { c.checked = S[c.dataset.chk]; c.disabled = S.base !== 10 || !!S.err; });
          }
        }
        const press = k => { E.press(k); refresh(); };
        const flash = k => {
          const b = btns.find(x => x.dataset.k === k);
          if (!b || b.disabled) return;
          b.classList.add("is-down");
          setTimeout(() => b.classList.remove("is-down"), 90);
        };

        /* ---------- view switching ---------- */
        function setView(sci) {
          if (E.S.sci === sci) return;
          E.setSci(sci);
          store.set("calcSci", sci);
          if (!sci && WM.has("calc-stat")) WM.close("calc-stat");
          build(); refresh();
          if (!win.max) {
            const b = WM.bounds(), w = Math.min(sci ? SCI_W : STD_W, b.w - 8);
            win.el.style.width = w + "px";
            win.el.style.left = Math.max(4, Math.min(win.el.offsetLeft, b.w - w - 4)) + "px";
            win.el.style.top = Math.max(0, Math.min(win.el.offsetTop, b.h - win.el.offsetHeight - 4)) + "px";
          }
        }
        function setGroup(on) { E.S.group = on; store.set("calcGroup", on); refresh(); }

        /* ---------- clipboard ---------- */
        function copy() {
          const t = E.plain();
          if (!t) return;
          clip = t;
          try { if (navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {}); } catch (e) { /* no clipboard */ }
        }
        function paste() {
          const apply = s => { if (E.paste(s)) refresh(); };
          try {
            if (navigator.clipboard && navigator.clipboard.readText) { navigator.clipboard.readText().then(s => apply(s || clip), () => apply(clip)); return; }
          } catch (e) { /* fall through */ }
          apply(clip);
        }

        /* ---------- Statistics Box ---------- */
        function statRows(w) {
          const list = w.body.querySelector(".calc-stat__list");
          list.innerHTML = E.S.data.map((v, i) => `<div class="calc-stat__row${i === w.sel ? " is-sel" : ""}" data-i="${i}">${v}</div>`).join("");
          w.body.querySelector(".calc-stat__n").textContent = "n=" + E.S.data.length;
          const sel = list.querySelector(".is-sel");
          if (sel) sel.scrollIntoView({ block: "nearest" }); else list.scrollTop = list.scrollHeight;
        }
        function openStat() {
          const had = WM.has("calc-stat");
          const sw = WM.open("calc-stat", {
            title: "Statistics Box", icon: "calc", w: 236, resizable: false, minimizable: false,
            render(sb, w) {
              w.sel = -1;
              sb.innerHTML = `<div class="calc-stat"><div class="calc-stat__list" tabindex="0" role="listbox" aria-label="Data"></div>
                <div class="calc-stat__side">${["RET", "LOAD", "CD", "CAD"].map(b => `<button type="button" class="btn btn--sm" data-b="${b}">${b}</button>`).join("")}</div>
                <div class="calc-stat__n">n=0</div></div>`;
              statRows(w);
              sb.addEventListener("click", e => {
                const row = e.target.closest(".calc-stat__row"), b = e.target.closest("[data-b]");
                if (row) { w.sel = +row.dataset.i; statRows(w); }
                if (!b) return;
                const d = E.S.data;
                if (b.dataset.b === "RET") WM.focus("calc");
                else if (b.dataset.b === "LOAD" && d[w.sel] !== undefined) { E.S.val = d[w.sel]; E.S.entry = null; refresh(); WM.focus("calc"); }
                else if (b.dataset.b === "CD" && d[w.sel] !== undefined) { d.splice(w.sel, 1); w.sel = -1; statRows(w); }
                else if (b.dataset.b === "CAD") { d.length = 0; w.sel = -1; statRows(w); }
              });
            },
            onClose() { E.S.statOpen = false; E.setOnStat(() => {}); refresh(); },
          });
          if (!had) {
            E.S.statOpen = true;
            E.setOnStat(() => { sw.sel = -1; statRows(sw); });
            const b = WM.bounds(), r = win.el;
            sw.el.style.left = Math.max(4, Math.min(r.offsetLeft + r.offsetWidth + 6, b.w - sw.el.offsetWidth - 4)) + "px";
            sw.el.style.top = Math.max(0, Math.min(r.offsetTop, b.h - sw.el.offsetHeight - 4)) + "px";
            WM.focus("calc");
          }
          refresh();
        }

        /* ---------- wiring ---------- */
        root.addEventListener("mousedown", e => { if (e.target.closest(".calc__k")) e.preventDefault(); });
        root.addEventListener("click", e => {
          const b = e.target.closest("[data-k]");
          if (!b || b.disabled) return;
          if (b.dataset.k === "sta") openStat(); else press(b.dataset.k);
        });
        root.addEventListener("change", e => {
          const t = e.target;
          if (t.name === "calc-base") E.setBase(+t.value);
          else if (t.name === "calc-ang") E.setAngle(t.value);
          else if (t.name === "calc-word") E.setWord(+t.value);
          else if (t.dataset.chk) E.S[t.dataset.chk] = t.checked;
          refresh();
          t.blur();                               // keep the keyboard on the calculator, not on the radio button
        });

        win.onKey = e => {
          const k = e.key, S = E.S;
          if (e.altKey) return;
          if (e.ctrlKey || e.metaKey) {
            const c = k.toLowerCase();
            const map = { l: "MC", r: "MR", m: "MS", p: "M+" };
            if (c === "c") { e.preventDefault(); copy(); }
            else if (c === "v") { e.preventDefault(); paste(); }
            else if (map[c]) { e.preventDefault(); flash(map[c]); press(map[c]); }
            return;
          }
          let id = null;
          if (/^[0-9]$/.test(k)) id = "d" + k;
          else if (S.base === 16 && /^[a-fA-F]$/.test(k)) id = "d" + k.toUpperCase();
          else if (KEYMAP[k]) id = KEYMAP[k];
          else if (k === "%") id = S.sci ? "mod" : "pct";
          else if (S.sci && SCI_KEYMAP[k]) id = SCI_KEYMAP[k];
          else if (S.sci && (k === "i" || k === "h")) { e.preventDefault(); E.toggle(k === "i" ? "inv" : "hyp"); refresh(); return; }
          if (!id) return;
          e.preventDefault();
          if ((e.repeat && id !== "Back") || !btns.some(b => b.dataset.k === id) || !enabled(id)) return;
          flash(id);
          press(id);
        };

        build(); refresh();
        win.calc = { E, press, refresh, setView, setGroup, copy, paste, openStat, get text() { return E.text(); } };
      },
      menu: win => [
        { label: "Edit", items: [
          { label: "Copy", hint: "Ctrl+C", action: () => win.calc.copy() },
          { label: "Paste", hint: "Ctrl+V", action: () => win.calc.paste() },
        ] },
        { label: "View", get items() {
          const c = win.calc;
          return [
            { label: "Standard", checked: !c.E.S.sci, action: () => c.setView(false) },
            { label: "Scientific", checked: c.E.S.sci, action: () => c.setView(true) },
            { sep: true },
            { label: "Digit grouping", checked: c.E.S.group, action: () => c.setGroup(!c.E.S.group) },
          ];
        } },
        { label: "Help", items: [
          { label: "Help Topics", action: () => msgBox({ title: "Calculator Help", icon: "info", text: "Click the buttons, or type on the keyboard.\n\nEnter or = equals, Esc clears all (C), Del clears the entry (CE), Backspace deletes a digit.\n@ is square root, R is 1/x, F9 changes the sign, % is percent.\nCtrl+L, Ctrl+R, Ctrl+M and Ctrl+P are MC, MR, MS and M+.\nCtrl+C copies the display and Ctrl+V pastes a number.\n\nScientific view: S, O, T are sin, cos, tan (I = Inv, H = Hyp), L is log, N is ln, P is pi, ! is n!, Q is x^2, # is x^3, ^ is x^y, ( and ) are brackets." }) },
          { sep: true },
          { label: "About Calculator", action: () => msgBox({ title: "About Calculator", icon: "info", text: "Calculator 4.10\n\nA working replica of the Windows 98 Calculator, with Standard and Scientific views, memory, statistics and Hex/Dec/Oct/Bin." }) },
        ] },
      ],
      onClose() { if (WM.has("calc-stat")) WM.close("calc-stat"); },
    });
  }

  (window.W98_APPS = window.W98_APPS || []).push({
    key: "calc", label: "Calculator", group: "programs", aliases: ["calculator", "calc.exe"],
    open, engine: createEngine,
  });
})();
