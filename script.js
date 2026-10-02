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
    "Starting Windows 96...",
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
        <div class="project-icon__img">
          ${p.image ? `<img src="${p.image}" alt="${p.title}">` : `<span class="icon__plus">+</span>`}
        </div>
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

  if (id === "chrome") {
    const slug = c.name.trim().toLowerCase().replace(/\s+/g, "");
    return `
      <div class="browser">
        <div class="browser-toolbar">
          <button class="browser-btn" disabled>&#8592; Back</button>
          <button class="browser-btn" disabled>Forward &#8594;</button>
          <button class="browser-btn" disabled>&#8635; Reload</button>
          <button class="browser-btn" disabled>&#8962; Home</button>
        </div>
        <div class="browser-address">
          <span>Address</span>
          <input type="text" readonly value="http://www.geocities.com/SiliconValley/Lab/1998/~${slug}/index.html">
          <button class="browser-btn">Go</button>
        </div>
        <div class="browser-page">
          <marquee class="browser-marquee" scrollamount="4">&#128679; WELCOME TO MY HOMEPAGE &#128679; THANKS FOR STOPPING BY &#128679; SIGN MY GUESTBOOK &#128679;</marquee>
          <h1 class="browser-page__title">${c.name}'s Homepage</h1>
          <p class="browser-page__blink">&#9733; Under Construction &#9733;</p>
          <nav class="browser-nav">
            <a href="#" onclick="return false;">Home</a> |
            <a href="#" onclick="return false;">About Me</a> |
            <a href="#" onclick="return false;">Guestbook</a> |
            <a href="#" onclick="return false;">Webring</a>
          </nav>
          <hr>
          <p>${c.tagline}</p>
          <div class="browser-counter">You are visitor number: <span>004217</span></div>
          <p class="browser-footer">Best viewed in Netscape Navigator&trade; at 800&times;600 &mdash; <a href="#" onclick="return false;">Get Internet Explorer!</a></p>
        </div>
        <div class="browser-status"><span>Done</span></div>
      </div>`;
  }

  if (id === "youtube") {
    // A few confirmed real CoryxKenshin video IDs (sourced from his
    // Wikipedia page citations) — one is picked at random each time
    // this window opens, and embedded via YouTube's own embed player.
    const CORYXKENSHIN_VIDEOS = [
      { id: "GsxdZ-3n0GQ", title: "Ectodermal Dysplasia (We need to talk.)" },
      { id: "t44TtAswYug", title: "Chasing My Dream. (The 'Big' Announcement)" },
      { id: "4wZ5Sd2LbfA", title: "2020 is the worst year of my life" },
    ];
    const pick = CORYXKENSHIN_VIDEOS[Math.floor(Math.random() * CORYXKENSHIN_VIDEOS.length)];
    return `
      <div class="win-video">
        <div class="win-video__frame">
          <iframe
            src="https://www.youtube.com/embed/${pick.id}?autoplay=1"
            title="${pick.title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        <p class="win-video__title">${pick.title}</p>
        <p class="win-video__channel">CoryxKenshin</p>
      </div>`;
  }

  return "";
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

  const ICONS = { about: "🌐", skills: "🛠️", projects: "🗂️", contact: "✉️", chrome: "🌐", youtube: "▶️" };
  const TITLES = { about: "About Me", skills: "Skills.txt", projects: "Projects", contact: "Contact.exe", chrome: "Chrome - 1998 Edition", youtube: "YouTube" };
  const WIDTHS = { about: 420, chrome: 520, youtube: 480 };

  function openProgram(id) {
    const win = WM.open(id, TITLES[id], ICONS[id], windowBodyFor(id, c), { width: WIDTHS[id] || 380 });
    if (id === "projects") {
      win.querySelectorAll(".project-icon").forEach(el => {
        el.addEventListener("click", () => {
          const p = c.projects[Number(el.dataset.project)];
          WM.open("project-" + el.dataset.project, p.title, "📄", projectWindowBody(p), { width: 380 });
        });
      });
    }
  }

  // Only About / Skills / Projects / Contact are actually openable.
  // Chrome, YouTube, Discord, GitHub, Terminal and the Recycle Bin are
  // decorative (class "icon--static") — no click behavior attached.
  // A single click opens the window directly (and shows the selection highlight).
  document.querySelectorAll(".icon[data-window]").forEach(el => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".icon[data-window]").forEach(i => i.classList.remove("selected"));
      el.classList.add("selected");
      openProgram(el.dataset.window);
    });
  });

  // Load each desktop icon's picture from CONTENT.icons.
  // If the file is missing (or the path is left blank), the dashed
  // placeholder with a "+" just stays visible.
  document.querySelectorAll(".icon__img[data-icon-key]").forEach(slot => {
    const key = slot.dataset.iconKey;
    const path = c.icons && c.icons[key];
    if (!path) return;
    const img = slot.querySelector("img");
    img.src = path;
    img.onload = () => { img.style.display = "block"; slot.classList.add("has-image"); };
    img.onerror = () => { img.style.display = "none"; slot.classList.remove("has-image"); };
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

  // Boot, then just reveal the empty desktop — no window auto-opens,
  // so it never sits on top of the icon grid and blocks clicks.
  runBootSequence(() => {
    document.getElementById("desktop").classList.add("visible");
  });
});