// ============================================================
// You don't need to edit this file — edit content.js instead.
// ============================================================

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");
}

function placeholderImage(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
      <rect width="100%" height="100%" fill="#d4d0c8"/>
      <text x="50%" y="50%" font-family="Tahoma, sans-serif" font-size="34"
            fill="#404040" text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function withImageFallback(src, label) {
  return src || placeholderImage(label);
}

// ============================================================
// BOOT SEQUENCE
// ============================================================
function runBootSequence(onDone) {
  const bootScreen = document.getElementById("bootScreen");
  const biosText = document.getElementById("biosText");
  const win95Splash = document.getElementById("win95Splash");

  const biosLines = [
    "Award Modular BIOS v4.51PG, An Energy Star Ally",
    "Copyright (C) 1984-96, Award Software, Inc.",
    "",
    "PORTFOLIO-PC CPU: Coffee Lake  Speed: 3.6GHz",
    "Memory Test: 65536K OK",
    "",
    "Detecting IDE drives ...",
    "  Primary Master   : PORTFOLIO_HDD",
    "  Primary Slave    : None",
    "",
    "Press DEL to enter SETUP, ESC to skip memory test",
    "",
    "Starting Windows 95...",
  ];

  let finished = false;

  function showLine(i) {
    if (i >= biosLines.length) { setTimeout(showSplash, 500); return; }
    const div = document.createElement("div");
    div.textContent = biosLines[i];
    biosText.appendChild(div);
    setTimeout(() => showLine(i + 1), biosLines[i] === "" ? 80 : 160);
  }

  function showSplash() {
    bootScreen.classList.add("hidden");
    win95Splash.classList.add("show");
    setTimeout(finish, 2600);
  }

  function finish() {
    if (finished) return;
    finished = true;
    bootScreen.classList.add("hidden");
    win95Splash.classList.remove("show");
    onDone();
  }

  bootScreen.addEventListener("click", finish);
  win95Splash.addEventListener("click", finish);
  showLine(0);
}

// ============================================================
// WINDOW MANAGER
// ============================================================
const WM = {
  windows: {},       // id -> { el, taskbarBtn, title }
  zCounter: 100,
  cascadeOffset: 0,

  open(id, title, icon, bodyHTML, opts = {}) {
    if (this.windows[id]) {
      this.restore(id);
      this.focus(id);
      return this.windows[id].el;
    }

    const layer = document.getElementById("windowsLayer");
    const win = document.createElement("div");
    win.className = "win";
    win.id = "win-" + id;
    win.style.width = (opts.width || 380) + "px";

    const isMobile = window.innerWidth < 720;
    if (!isMobile) {
      const x = 60 + (this.cascadeOffset % 6) * 30;
      const y = 40 + (this.cascadeOffset % 6) * 28;
      this.cascadeOffset++;
      win.style.left = x + "px";
      win.style.top = y + "px";
    }

    win.innerHTML = `
      <div class="win__titlebar">
        <span class="win__icon">${icon}</span>
        <span class="win__title">${title}</span>
        <div class="win__buttons">
          <button class="win__btn win__min" title="Minimize">_</button>
          <button class="win__btn win__close" title="Close">×</button>
        </div>
      </div>
      <div class="win__body">${bodyHTML}</div>
    `;
    layer.appendChild(win);

    // Dragging (desktop only)
    const titlebar = win.querySelector(".win__titlebar");
    if (!isMobile) {
      let dragging = false, offX = 0, offY = 0;
      titlebar.addEventListener("mousedown", (e) => {
        if (e.target.closest(".win__btn")) return;
        dragging = true;
        offX = e.clientX - win.offsetLeft;
        offY = e.clientY - win.offsetTop;
        this.focus(id);
      });
      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        win.style.left = Math.max(0, e.clientX - offX) + "px";
        win.style.top = Math.max(0, e.clientY - offY) + "px";
      });
      document.addEventListener("mouseup", () => { dragging = false; });
    }

    win.addEventListener("mousedown", () => this.focus(id));

    win.querySelector(".win__close").addEventListener("click", () => this.close(id));
    win.querySelector(".win__min").addEventListener("click", () => this.minimize(id));

    // Taskbar button
    const taskbarWindows = document.getElementById("taskbarWindows");
    const btn = document.createElement("button");
    btn.className = "taskbar__win-btn active";
    btn.textContent = icon + " " + title;
    btn.addEventListener("click", () => {
      if (win.classList.contains("hidden")) { this.restore(id); this.focus(id); }
      else if (this.windows[id].focused) { this.minimize(id); }
      else { this.focus(id); }
    });
    taskbarWindows.appendChild(btn);

    this.windows[id] = { el: win, taskbarBtn: btn, title };
    this.focus(id);
    return win;
  },

  focus(id) {
    Object.values(this.windows).forEach(w => w.focused = false);
    const w = this.windows[id];
    if (!w) return;
    w.focused = true;
    this.zCounter++;
    w.el.style.zIndex = this.zCounter;
    Object.values(this.windows).forEach(x => x.taskbarBtn.classList.remove("active"));
    w.taskbarBtn.classList.add("active");
  },

  minimize(id) {
    const w = this.windows[id];
    if (!w) return;
    w.el.classList.add("hidden");
    w.taskbarBtn.classList.remove("active");
    w.focused = false;
  },

  restore(id) {
    const w = this.windows[id];
    if (!w) return;
    w.el.classList.remove("hidden");
  },

  close(id) {
    const w = this.windows[id];
    if (!w) return;
    w.el.remove();
    w.taskbarBtn.remove();
    delete this.windows[id];
  },
};

// ============================================================
// BUILD WINDOW CONTENT FROM content.js
// ============================================================
function windowBodyFor(id, c) {
  if (id === "about") {
    return `
      <div class="win-about">
        <img class="win-about__photo" src="${withImageFallback(c.heroImage, initials(c.name))}" alt="${c.name}">
        <h2>${c.name}</h2>
        <p class="role">${c.role}</p>
        <p>${c.about}</p>
      </div>`;
  }

  if (id === "skills") {
    const items = c.skills.map(s => `<li>${s}</li>`).join("");
    return `<ul class="skills-list">${items}</ul>`;
  }

  if (id === "projects") {
    const icons = c.projects.map((p, i) => `
      <div class="project-icon" data-project="${i}">
        <div class="project-icon__img">📁</div>
        <div class="project-icon__label">${p.title}</div>
      </div>`).join("");
    return `<div class="projects-grid">${icons}</div>`;
  }

  if (id === "contact") {
    const rows = c.contact.map(item => `
      <tr>
        <td class="label">${item.label}</td>
        <td><input type="text" readonly value="${item.value}"></td>
      </tr>`).join("");
    return `
      <p>${c.contactIntro}</p>
      <table class="contact-table">${rows}</table>
      <div style="margin-top:12px; display:flex; gap:8px;">
        ${c.contact[0] ? `<a class="win95-btn" href="${c.contact[0].href}" style="text-decoration:none;color:#000;">Send Message</a>` : ""}
      </div>`;
  }

  return "";
}

function terminalLines(c) {
  return [
    "C:\\Users\\Guest> whoami",
    c.name,
    "",
    "C:\\Users\\Guest> cat about.txt",
    c.about,
    "",
    "C:\\Users\\Guest> dir skills",
    c.skills.join("   "),
    "",
    "C:\\Users\\Guest> _",
  ];
}

function typeLines(container, lines, lineDelay = 220) {
  let i = 0;
  function next() {
    if (i >= lines.length) return;
    const div = document.createElement("div");
    div.textContent = lines[i];
    container.appendChild(div);
    i++;
    setTimeout(next, lines[i - 1] === "" ? 100 : lineDelay);
  }
  next();
}

function projectWindowBody(p) {
  const tags = (p.tags || []).map(t => `<li>${t}</li>`).join("");
  return `
    <div class="win-project">
      <img class="win-project__media" src="${withImageFallback(p.image, initials(p.title))}" alt="${p.title}">
      <h2>${p.title}</h2>
      <p>${p.description}</p>
      <ul class="win-project__tags">${tags}</ul>
      <div class="win-project__links">
        ${p.github ? `<a class="win95-btn" style="text-decoration:none;color:#000;" href="${p.github}" target="_blank" rel="noopener">GitHub</a>` : ""}
        ${p.demo ? `<a class="win95-btn" style="text-decoration:none;color:#000;" href="${p.demo}" target="_blank" rel="noopener">Live Demo</a>` : ""}
      </div>
    </div>`;
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const c = CONTENT;
  document.title = c.name + " — Portfolio";

  const ICONS = { about: "🌐", skills: "🛠️", projects: "🗂️", contact: "✉️", terminal: "⌨️" };
  const TITLES = { about: "About Me", skills: "Skills.txt", projects: "Projects", contact: "Contact.exe", terminal: "Terminal" };

  function openProgram(id) {
    if (id === "terminal") {
      const win = WM.open("terminal", "Terminal", "⌨️", '<div class="win-terminal" id="terminalBody"></div>', { width: 420 });
      const body = win.querySelector("#terminalBody");
      if (!body.dataset.typed) {
        body.dataset.typed = "1";
        typeLines(body, terminalLines(c));
      }
      return;
    }
    const win = WM.open(id, TITLES[id], ICONS[id], windowBodyFor(id, c), { width: id === "about" ? 420 : 380 });
    if (id === "projects") {
      win.querySelectorAll(".project-icon").forEach(el => {
        el.addEventListener("dblclick", () => {
          const p = c.projects[Number(el.dataset.project)];
          WM.open("project-" + el.dataset.project, p.title, "📄", projectWindowBody(p), { width: 380 });
        });
      });
    }
  }

  // Desktop icons — double click to open (apps) or open link in new tab (social)
  document.querySelectorAll(".icon[data-window]").forEach(el => {
    el.addEventListener("dblclick", () => openProgram(el.dataset.window));
  });
  document.querySelectorAll(".icon[data-social]").forEach(el => {
    el.addEventListener("dblclick", () => {
      const url = c.social && c.social[el.dataset.social];
      if (url) window.open(url, "_blank", "noopener");
    });
  });
  document.querySelectorAll(".icon").forEach(el => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".icon").forEach(i => i.classList.remove("selected"));
      el.classList.add("selected");
    });
  });

  // Recycle bin — just a fun dead-end
  document.getElementById("binIcon").addEventListener("dblclick", () => {
    WM.open("bin", "Recycle Bin", "🗑️", "<p>The Recycle Bin is empty.</p>", { width: 260 });
  });

  // Start menu
  const startBtn = document.getElementById("startBtn");
  const startMenu = document.getElementById("startMenu");
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    startMenu.classList.toggle("open");
    startBtn.classList.toggle("active");
  });
  document.addEventListener("click", () => {
    startMenu.classList.remove("open");
    startBtn.classList.remove("active");
  });
  startMenu.querySelectorAll("li[data-window]").forEach(li => {
    li.addEventListener("click", () => {
      openProgram(li.dataset.window);
      startMenu.classList.remove("open");
      startBtn.classList.remove("active");
    });
  });

  // Shutdown
  const shutdownScreen = document.getElementById("shutdownScreen");
  document.getElementById("shutdownBtn").addEventListener("click", () => {
    shutdownScreen.classList.add("show");
  });
  document.getElementById("restartBtn").addEventListener("click", () => {
    location.reload();
  });

  // Clock
  function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    document.getElementById("clock").textContent = `${h}:${m} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000 * 15);

  // Boot, then reveal the desktop and auto-open the About window
  runBootSequence(() => {
    document.getElementById("desktop").classList.add("visible");
    openProgram("about");
  });
});