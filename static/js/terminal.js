/**
 * Ship A terminal console — navigation + themes only (no games).
 * Loaded lazily on first `c` press via inline bootstrap in base.html.
 */
(function () {
  "use strict";

  var STORAGE_THEME = "siteTheme";
  var STORAGE_POSITION = "terminalPosition";
  var THEMES = ["matrix", "solarized-dark", "high-contrast", "nord"];
  var DEFAULT_THEME = "matrix";

  var CD_ALIASES = {
    "/": "/",
    home: "/",
    projects: "/projects",
    blog: "/blog",
    about: "/about",
    contact: "/contact",
  };

  function readSiteIndex() {
    var el = document.getElementById("site-index");
    if (!el) return { pages: [], projects: [] };
    try {
      return JSON.parse(el.textContent || "{}");
    } catch (e) {
      return { pages: [], projects: [] };
    }
  }

  function normalizeInput(line) {
    return line.trim().replace(/\s+/g, " ");
  }

  function projectSlugs(siteIndex) {
    return siteIndex.projects.map(function (p) {
      return p.slug;
    });
  }

  function findProject(siteIndex, slug) {
    for (var i = 0; i < siteIndex.projects.length; i += 1) {
      if (siteIndex.projects[i].slug === slug) return siteIndex.projects[i];
    }
    return null;
  }

  function Terminal(root) {
    this.root = root;
    this.windowEl = root.querySelector(".terminal-window");
    this.outputEl = root.querySelector("[data-terminal-output]");
    this.inputEl = root.querySelector("[data-terminal-input]");
    this.formEl = root.querySelector("[data-terminal-form]");
    this.dragHandle = root.querySelector("[data-terminal-drag-handle]");
    this.closeBtn = root.querySelector("[data-terminal-close]");
    this.siteIndex = readSiteIndex();
    this.history = [];
    this.historyCursor = -1;
    this.isOpen = false;
    this.dragState = null;
  }

  Terminal.prototype.init = function () {
    this.restorePosition();
    this.bindEvents();
    this.printWelcome();
  };

  Terminal.prototype.bindEvents = function () {
    var self = this;

    this.formEl.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = self.inputEl.value;
      self.inputEl.value = "";
      self.historyCursor = -1;
      if (!value.trim()) return;
      self.history.push(value);
      self.printLine("$ " + value, "terminal-line-input");
      self.runCommand(value);
    });

    this.inputEl.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        self.close();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!self.history.length) return;
        if (self.historyCursor === -1) self.historyCursor = self.history.length;
        self.historyCursor = Math.max(0, self.historyCursor - 1);
        self.inputEl.value = self.history[self.historyCursor] || "";
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!self.history.length) return;
        if (self.historyCursor === -1) return;
        self.historyCursor += 1;
        if (self.historyCursor >= self.history.length) {
          self.historyCursor = -1;
          self.inputEl.value = "";
        } else {
          self.inputEl.value = self.history[self.historyCursor] || "";
        }
      }
    });

    this.closeBtn.addEventListener("click", function () {
      self.close();
    });

    document.addEventListener("keydown", function (event) {
      if (!self.isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        self.close();
      }
    });

    this.setupDrag(this.dragHandle);
  };

  Terminal.prototype.setupDrag = function (handle) {
    var self = this;

    function onPointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      var rect = self.windowEl.getBoundingClientRect();
      self.dragState = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      self.root.classList.add("is-dragging");
      handle.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
      if (!self.dragState || self.dragState.pointerId !== event.pointerId) return;
      var x = event.clientX - self.dragState.offsetX;
      var y = event.clientY - self.dragState.offsetY;
      self.applyPosition(x, y);
    }

    function onPointerUp(event) {
      if (!self.dragState || self.dragState.pointerId !== event.pointerId) return;
      self.dragState = null;
      self.root.classList.remove("is-dragging");
      self.savePosition();
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch (e) {}
    }

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);
  };

  Terminal.prototype.applyPosition = function (left, top) {
    var maxLeft = Math.max(0, window.innerWidth - this.windowEl.offsetWidth);
    var maxTop = Math.max(0, window.innerHeight - this.windowEl.offsetHeight);
    var clampedLeft = Math.min(Math.max(0, left), maxLeft);
    var clampedTop = Math.min(Math.max(0, top), maxTop);
    this.root.style.left = clampedLeft + "px";
    this.root.style.top = clampedTop + "px";
    this.root.style.right = "auto";
    this.root.style.bottom = "auto";
    this.root.classList.add("is-positioned");
  };

  Terminal.prototype.restorePosition = function () {
    try {
      var raw = localStorage.getItem(STORAGE_POSITION);
      if (!raw) return;
      var pos = JSON.parse(raw);
      if (typeof pos.left === "number" && typeof pos.top === "number") {
        this.applyPosition(pos.left, pos.top);
      }
    } catch (e) {}
  };

  Terminal.prototype.savePosition = function () {
    if (!this.root.classList.contains("is-positioned")) return;
    try {
      localStorage.setItem(
        STORAGE_POSITION,
        JSON.stringify({
          left: parseFloat(this.root.style.left) || 0,
          top: parseFloat(this.root.style.top) || 0,
        })
      );
    } catch (e) {}
  };

  Terminal.prototype.getTheme = function () {
    return document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
  };

  Terminal.prototype.setTheme = function (name) {
    document.documentElement.setAttribute("data-theme", name);
    try {
      localStorage.setItem(STORAGE_THEME, name);
    } catch (e) {}
  };

  Terminal.prototype.printLine = function (text, className) {
    var line = document.createElement("div");
    line.className = className || "terminal-line";
    line.textContent = text;
    this.outputEl.appendChild(line);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  };

  Terminal.prototype.printWelcome = function () {
    this.printLine("Keko-Figueroa.Dev terminal — type help", "terminal-line-muted");
    this.printLine("Esc or close to exit · c toggles when focus is outside input", "terminal-line-muted");
  };

  Terminal.prototype.clearOutput = function () {
    this.outputEl.textContent = "";
  };

  Terminal.prototype.open = function () {
    this.isOpen = true;
    this.root.hidden = false;
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden", "false");
    this.inputEl.focus();
  };

  Terminal.prototype.close = function () {
    this.isOpen = false;
    this.root.classList.remove("is-open");
    this.root.setAttribute("aria-hidden", "true");
    this.root.hidden = true;
    this.inputEl.blur();
  };

  Terminal.prototype.toggle = function () {
    if (this.isOpen) this.close();
    else this.open();
  };

  Terminal.prototype.navigate = function (path) {
    window.location.assign(path);
  };

  Terminal.prototype.runCommand = function (raw) {
    var line = normalizeInput(raw);
    var parts = line.split(" ");
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(" ");

    switch (cmd) {
      case "help":
        this.cmdHelp();
        break;
      case "clear":
        this.clearOutput();
        break;
      case "close":
        this.close();
        break;
      case "history":
        this.cmdHistory();
        break;
      case "ls":
        this.cmdLs();
        break;
      case "projects":
        this.cmdProjects();
        break;
      case "open":
        this.cmdOpen(parts.slice(1));
        break;
      case "cd":
        this.cmdCd(arg);
        break;
      case "theme":
        this.cmdTheme(arg);
        break;
      default:
        this.printLine('Unknown command: "' + cmd + '". Type help.', "terminal-line-error");
    }
  };

  Terminal.prototype.cmdHelp = function () {
    var lines = [
      "Commands:",
      "  help, clear, close, history",
      "  ls, projects",
      "  open <path>          e.g. open /blog",
      "  open project <slug>  e.g. open project deuna-payments-flow",
      "  cd <page>            /, projects, blog, about, contact",
      "  theme, theme <name>  matrix, solarized-dark, high-contrast, nord",
    ];
    for (var i = 0; i < lines.length; i += 1) this.printLine(lines[i]);
  };

  Terminal.prototype.cmdHistory = function () {
    if (!this.history.length) {
      this.printLine("(empty)");
      return;
    }
    for (var i = 0; i < this.history.length; i += 1) {
      this.printLine(String(i + 1) + "  " + this.history[i]);
    }
  };

  Terminal.prototype.cmdLs = function () {
    var self = this;
    this.siteIndex.pages.forEach(function (page) {
      self.printLine(page.path + "  (" + page.name + ")");
    });
    this.siteIndex.projects.forEach(function (project) {
      self.printLine("/projects/" + project.slug + "  (" + project.title + ")");
    });
  };

  Terminal.prototype.cmdProjects = function () {
    var self = this;
    if (!this.siteIndex.projects.length) {
      this.printLine("(no projects)");
      return;
    }
    this.siteIndex.projects.forEach(function (project) {
      self.printLine(project.slug + "  —  " + project.title);
    });
  };

  Terminal.prototype.cmdOpen = function (args) {
    if (!args.length) {
      this.printLine("Usage: open <path>  |  open project <slug>", "terminal-line-error");
      return;
    }

    if (args[0] === "project") {
      var slug = args.slice(1).join(" ");
      if (!slug) {
        this.printLine("Usage: open project <slug>", "terminal-line-error");
        return;
      }
      if (!findProject(this.siteIndex, slug)) {
        this.printLine('Unknown project slug: "' + slug + '"', "terminal-line-error");
        return;
      }
      this.navigate("/projects/" + slug);
      return;
    }

    var path = args.join(" ");
    if (!path.startsWith("/")) path = "/" + path;
    this.navigate(path);
  };

  Terminal.prototype.cmdCd = function (target) {
    if (!target) {
      this.printLine("Usage: cd <page>  (/ | projects | blog | about | contact)", "terminal-line-error");
      return;
    }
    var path = CD_ALIASES[target.toLowerCase()];
    if (!path) {
      this.printLine('Unknown page: "' + target + '"', "terminal-line-error");
      return;
    }
    this.navigate(path);
  };

  Terminal.prototype.cmdTheme = function (name) {
    if (!name) {
      this.printLine("Themes: " + THEMES.join(", "));
      this.printLine("Current: " + this.getTheme());
      return;
    }
    if (THEMES.indexOf(name) === -1) {
      this.printLine('Unknown theme: "' + name + '". Try: ' + THEMES.join(", "), "terminal-line-error");
      return;
    }
    this.setTheme(name);
    this.printLine("Theme set to " + name);
  };

  window.KekoTerminal = {
    init: function () {
      if (window.__kekoTerminal) return window.__kekoTerminal;
      var root = document.getElementById("terminal-overlay");
      if (!root) return null;
      var terminal = new Terminal(root);
      terminal.init();
      window.__kekoTerminal = terminal;
      return terminal;
    },
  };
})();
