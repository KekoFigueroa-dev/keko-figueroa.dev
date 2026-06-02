/**
 * Terminal console — navigation, themes, and lazy-loaded mini-games.
 * Loaded lazily on first `c` press via inline bootstrap in base.html.
 */
(function () {
  "use strict";

  var STORAGE_THEME = "siteTheme";
  var STORAGE_LAYOUT = "terminalLayout";
  var THEMES = ["matrix", "solarized-dark", "high-contrast", "nord"];
  var DEFAULT_THEME = "matrix";
  var ROOT_DIRS = ["/projects", "/blog", "/about", "/contact"];

  var CD_ALIASES = {
    "/": "/",
    home: "/",
    projects: "/projects",
    blog: "/blog",
    about: "/about",
    contact: "/contact",
  };

  var HELP_CMD_WIDTH = 22;

  function readSiteIndex() {
    var el = document.getElementById("site-index");
    if (!el) return { pages: [], projects: [], posts: [] };
    try {
      var data = JSON.parse(el.textContent || "{}");
      if (!data.posts) data.posts = [];
      return data;
    } catch (e) {
      return { pages: [], projects: [], posts: [] };
    }
  }

  function normalizeInput(line) {
    return line.trim().replace(/\s+/g, " ");
  }

  function normalizeSlug(value) {
    return value.toLowerCase().trim().replace(/_/g, "-");
  }

  function normalizeCwd(path) {
    if (!path || path === "/") return "/";
    return path.replace(/\/+$/, "") || "/";
  }

  function findProject(siteIndex, slug) {
    for (var i = 0; i < siteIndex.projects.length; i += 1) {
      if (siteIndex.projects[i].slug === slug) return siteIndex.projects[i];
    }
    return null;
  }

  function findPost(siteIndex, slug) {
    for (var i = 0; i < siteIndex.posts.length; i += 1) {
      if (siteIndex.posts[i].slug === slug) return siteIndex.posts[i];
    }
    return null;
  }

  /** Match slug, alias, or title fragment (e.g. cd Token_name_esports). */
  function resolveProject(siteIndex, query) {
    if (!query) return null;
    var normalized = normalizeSlug(query);
    var needle = query.toLowerCase().trim();

    var exact = findProject(siteIndex, normalized);
    if (exact) return exact;

    for (var i = 0; i < siteIndex.projects.length; i += 1) {
      var project = siteIndex.projects[i];
      if (project.slug.toLowerCase() === normalized) return project;
      if (project.aliases) {
        for (var j = 0; j < project.aliases.length; j += 1) {
          if (project.aliases[j].toLowerCase() === needle) return project;
        }
      }
      if (project.title && project.title.toLowerCase().indexOf(needle) !== -1) return project;
    }

    var partial = siteIndex.projects.filter(function (project) {
      return project.slug.indexOf(normalized) !== -1 || normalized.indexOf(project.slug) !== -1;
    });
    if (partial.length === 1) return partial[0];
    return null;
  }

  function Terminal(root) {
    this.root = root;
    this.windowEl = root.querySelector(".terminal-window");
    this.outputEl = root.querySelector("[data-terminal-output]");
    this.inputEl = root.querySelector("[data-terminal-input]");
    this.promptEl = root.querySelector("[data-terminal-prompt]");
    this.formEl = root.querySelector("[data-terminal-form]");
    this.dragHandle = root.querySelector("[data-terminal-drag-handle]");
    this.minimizeBtn = root.querySelector("[data-terminal-minimize]");
    this.dockBtns = root.querySelectorAll("[data-terminal-dock]");
    this.closeBtn = root.querySelector("[data-terminal-close]");
    this.siteIndex = readSiteIndex();
    this.history = [];
    this.historyCursor = -1;
    this.cwd = "/";
    this.isOpen = false;
    this.isMinimized = false;
    this.dockSide = null;
    this.floatSnapshot = null;
    this.dragState = null;
    this.resizeObserver = null;
    this.activeGame = null;
    this.gameHostLoading = null;
  }

  Terminal.prototype.init = function () {
    this.cwd = this.cwdFromBrowserPath();
    this.restoreLayout();
    this.bindEvents();
    this.updateDockButtons();
    this.updateMinimizeButton();
    this.updatePrompt();
    this.printWelcome();
  };

  Terminal.prototype.cwdFromBrowserPath = function () {
    var path = normalizeCwd(window.location.pathname);
    if (this.pathExists(path)) return path;
    if (path.indexOf("/projects/") === 0) {
      var slug = path.slice("/projects/".length);
      if (findProject(this.siteIndex, slug)) return "/projects/" + slug;
      return "/projects";
    }
    if (path.indexOf("/blog/") === 0) {
      var postSlug = path.slice("/blog/".length);
      if (findPost(this.siteIndex, postSlug)) return "/blog/" + postSlug;
      return "/blog";
    }
    return "/";
  };

  Terminal.prototype.pathExists = function (path) {
    var normalized = normalizeCwd(path);
    if (normalized === "/") return true;
    if (ROOT_DIRS.indexOf(normalized) !== -1) return true;
    if (normalized.indexOf("/projects/") === 0) {
      return !!findProject(this.siteIndex, normalized.slice("/projects/".length));
    }
    if (normalized.indexOf("/blog/") === 0) {
      return !!findPost(this.siteIndex, normalized.slice("/blog/".length));
    }
    return false;
  };

  Terminal.prototype.setCwd = function (path) {
    this.cwd = normalizeCwd(path);
    this.updatePrompt();
  };

  Terminal.prototype.updatePrompt = function () {
    if (!this.promptEl) return;
    var label = this.cwd === "/" ? "~" : this.cwd;
    this.promptEl.textContent = "keko:" + label + "$";
  };

  Terminal.prototype.listDir = function () {
    var cwd = this.cwd;
    if (cwd === "/") return ROOT_DIRS.slice();
    if (cwd === "/projects") {
      return this.siteIndex.projects.map(function (project) {
        return "/projects/" + project.slug;
      });
    }
    if (cwd === "/blog") {
      return this.siteIndex.posts.map(function (post) {
        return "/blog/" + post.slug;
      });
    }
    return [];
  };

  Terminal.prototype.bindEvents = function () {
    var self = this;

    this.formEl.addEventListener("submit", function (event) {
      event.preventDefault();
      if (self.activeGame) return;
      var value = self.inputEl.value;
      self.inputEl.value = "";
      self.historyCursor = -1;
      if (!value.trim()) return;
      self.history.push(value);
      self.printLine("keko:" + (self.cwd === "/" ? "~" : self.cwd) + "$ " + value, "terminal-line-input");
      self.runCommand(value);
    });

    this.inputEl.addEventListener("keydown", function (event) {
      if (self.activeGame) return;
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

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        self.close();
      });
    }

    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        self.toggleMinimize();
      });
    }

    if (this.dockBtns.length) {
      this.dockBtns.forEach(function (btn) {
        btn.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var side = btn.getAttribute("data-terminal-dock");
          if (self.dockSide === side) self.undock();
          else self.dock(side);
        });
      });
    }

    if (this.dragHandle) {
      this.dragHandle.addEventListener("click", function () {
        if (self.isMinimized) self.restore();
      });
      this.setupDrag(this.dragHandle);
    }
    document.addEventListener("keydown", function (event) {
      if (!self.isOpen) return;
      if (self.activeGame) return;
      if (event.key === "Escape") {
        event.preventDefault();
        self.close();
      }
    });

    this.setupResizeObserver();
  };

  Terminal.prototype.setupResizeObserver = function () {
    var self = this;
    if (typeof ResizeObserver === "undefined") return;
    var timer;
    this.resizeObserver = new ResizeObserver(function () {
      if (!self.isOpen) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        self.saveLayout();
      }, 150);
    });
    this.resizeObserver.observe(this.root);
  };

  Terminal.prototype.setupDrag = function (handle) {
    var self = this;

    function onPointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest("[data-terminal-close], [data-terminal-minimize], [data-terminal-dock]")) return;
      if (self.dockSide) return;
      event.preventDefault();
      var rect = self.root.getBoundingClientRect();
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
      self.applyPosition(event.clientX - self.dragState.offsetX, event.clientY - self.dragState.offsetY);
    }

    function onPointerUp(event) {
      if (!self.dragState || self.dragState.pointerId !== event.pointerId) return;
      self.dragState = null;
      self.root.classList.remove("is-dragging");
      self.saveLayout();
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch (e) {}
    }

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);
  };

  Terminal.prototype.captureFloatLayout = function () {
    return {
      width: this.root.offsetWidth,
      height: this.root.offsetHeight,
      left: parseFloat(this.root.style.left),
      top: parseFloat(this.root.style.top),
      positioned: this.root.classList.contains("is-positioned"),
    };
  };

  Terminal.prototype.isDocked = function () {
    return this.dockSide === "left" || this.dockSide === "right";
  };

  Terminal.prototype.clearDockStyles = function () {
    this.root.classList.remove("is-docked-left", "is-docked-right");
    this.dockSide = null;
  };

  Terminal.prototype.applyFloatLayout = function (layout) {
    if (!layout) return;
    this.clearDockStyles();
    if (typeof layout.width === "number" && typeof layout.height === "number") {
      this.applySize(layout.width, layout.height);
    }
    if (layout.positioned && !isNaN(layout.left) && !isNaN(layout.top)) {
      this.applyPosition(layout.left, layout.top);
    } else {
      this.root.classList.remove("is-positioned");
      this.root.style.left = "";
      this.root.style.top = "";
      this.root.style.right = "";
      this.root.style.bottom = "";
    }
    this.updateDockButtons();
  };

  Terminal.prototype.applyPosition = function (left, top) {
    var maxLeft = Math.max(0, window.innerWidth - this.root.offsetWidth);
    var maxTop = Math.max(0, window.innerHeight - this.root.offsetHeight);
    this.root.style.left = Math.min(Math.max(0, left), maxLeft) + "px";
    this.root.style.top = Math.min(Math.max(0, top), maxTop) + "px";
    this.root.style.right = "auto";
    this.root.style.bottom = "auto";
    this.root.classList.add("is-positioned");
  };

  Terminal.prototype.applySize = function (width, height) {
    this.root.style.width = width + "px";
    this.root.style.height = height + "px";
  };

  Terminal.prototype.restoreLayout = function () {
    try {
      var raw = localStorage.getItem(STORAGE_LAYOUT);
      if (!raw) {
        raw = localStorage.getItem("terminalPosition");
      }
      if (!raw) return;
      var layout = JSON.parse(raw);

      if (layout.float) {
        this.floatSnapshot = layout.float;
      }

      if (layout.mode === "docked") {
        var side = layout.dockSide === "left" ? "left" : "right";
        this.dockSide = side;
        this.root.classList.remove("is-positioned");
        this.root.style.left = "";
        this.root.style.top = "";
        this.root.style.right = "";
        this.root.style.bottom = "";
        this.root.classList.add("is-docked-" + side);
        if (typeof layout.width === "number") {
          this.root.style.width = layout.width + "px";
        }
      } else if (layout.float) {
        this.applyFloatLayout(layout.float);
      } else {
        if (typeof layout.width === "number" && typeof layout.height === "number") {
          this.applySize(layout.width, layout.height);
        }
        if (typeof layout.left === "number" && typeof layout.top === "number") {
          this.applyPosition(layout.left, layout.top);
        }
      }

      if (layout.minimized) {
        this.minimize(false);
      }

      this.updateDockButtons();
    } catch (e) {}
  };

  Terminal.prototype.saveLayout = function () {
    try {
      var payload = {
        mode: this.isDocked() ? "docked" : "float",
        minimized: this.isMinimized,
      };

      if (this.isDocked()) {
        payload.dockSide = this.dockSide;
        payload.width = this.root.offsetWidth;
        if (this.floatSnapshot) payload.float = this.floatSnapshot;
      } else {
        payload.float = this.captureFloatLayout();
        this.floatSnapshot = payload.float;
        payload.height = this.root.offsetHeight;
      }

      localStorage.setItem(STORAGE_LAYOUT, JSON.stringify(payload));
    } catch (e) {}
  };

  Terminal.prototype.updateDockButtons = function () {
    var self = this;
    this.dockBtns.forEach(function (btn) {
      var side = btn.getAttribute("data-terminal-dock");
      var active = self.dockSide === side;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        active ? "Undock terminal (" + side + ")" : "Dock terminal to " + side
      );
    });
  };

  Terminal.prototype.updateMinimizeButton = function () {
    if (!this.minimizeBtn) return;
    this.minimizeBtn.setAttribute("aria-label", this.isMinimized ? "Restore terminal" : "Minimize terminal");
    this.minimizeBtn.setAttribute("aria-pressed", this.isMinimized ? "true" : "false");
    this.minimizeBtn.textContent = this.isMinimized ? "□" : "−";
  };

  Terminal.prototype.minimize = function (save) {
    this.stopGame("minimize");
    if (!this.isOpen) return;
    this.isMinimized = true;
    this.root.classList.add("is-minimized");
    this.updateMinimizeButton();
    if (save !== false) this.saveLayout();
  };

  Terminal.prototype.restore = function () {
    this.isMinimized = false;
    this.root.classList.remove("is-minimized");
    this.updateMinimizeButton();
    if (this.isOpen) this.inputEl.focus();
    this.saveLayout();
  };

  Terminal.prototype.toggleMinimize = function () {
    if (this.isMinimized) this.restore();
    else this.minimize();
  };

  Terminal.prototype.dock = function (side) {
    if (side !== "left" && side !== "right") return;
    if (this.dockSide === side) {
      this.undock();
      return;
    }
    if (!this.isDocked()) {
      this.floatSnapshot = this.captureFloatLayout();
    }
    this.clearDockStyles();
    this.root.classList.remove("is-positioned");
    this.root.style.left = "";
    this.root.style.top = "";
    this.root.style.right = "";
    this.root.style.bottom = "";
    this.dockSide = side;
    this.root.classList.add("is-docked-" + side);
    var width = (this.floatSnapshot && this.floatSnapshot.width) || this.root.offsetWidth || 480;
    width = Math.min(Math.max(width, 288), Math.floor(window.innerWidth * 0.45));
    this.root.style.width = width + "px";
    this.root.style.height = "";
    this.updateDockButtons();
    this.saveLayout();
  };

  Terminal.prototype.undock = function () {
    if (!this.isDocked()) return;
    this.clearDockStyles();
    this.applyFloatLayout(this.floatSnapshot);
    this.saveLayout();
  };

  Terminal.prototype.cmdDock = function (args) {
    if (!args.length) {
      this.printLine("Usage: dock left | dock right", "terminal-line-error");
      this.printLine(
        "Docked: " + (this.isDocked() ? this.dockSide : "none (floating)"),
        "terminal-line-muted"
      );
      return;
    }
    var side = args[0].toLowerCase();
    if (side !== "left" && side !== "right") {
      this.printLine('Usage: dock left | dock right  (got "' + args[0] + '")', "terminal-line-error");
      return;
    }
    if (this.dockSide === side) this.undock();
    else this.dock(side);
  };

  Terminal.prototype.getTheme = function () {
    var fromDom = document.documentElement.getAttribute("data-theme");
    if (fromDom) return fromDom;
    try {
      var stored = localStorage.getItem(STORAGE_THEME);
      if (stored) return stored;
    } catch (e) {}
    return DEFAULT_THEME;
  };

  Terminal.prototype.setTheme = function (name) {
    document.documentElement.setAttribute("data-theme", name);
    try {
      localStorage.setItem(STORAGE_THEME, name);
    } catch (e) {}
  };

  Terminal.prototype.stopGame = function (reason) {
    if (window.KekoGameHost && this.activeGame) {
      window.KekoGameHost.stop(this, reason);
    }
  };

  Terminal.prototype.setGameInputLocked = function (locked) {
    if (!this.inputEl || !this.formEl) return;
    this.inputEl.disabled = locked;
    this.formEl.classList.toggle("is-game-active", locked);
    if (!locked) this.inputEl.focus();
  };

  Terminal.prototype.ensureGameHost = function () {
    if (window.KekoGameHost) return Promise.resolve();
    if (this.gameHostLoading) return this.gameHostLoading;

    var self = this;
    var base = "/static/js/terminal/games/";
    if (window.KekoGameHost && window.KekoGameHost.gamesBaseUrl) {
      base = window.KekoGameHost.gamesBaseUrl();
    } else {
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i -= 1) {
        var src = scripts[i].src;
        if (src.indexOf("terminal.js") !== -1) {
          base = src.replace(/terminal\.js(\?.*)?$/, "terminal/games/");
          break;
        }
      }
    }

    this.gameHostLoading = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = base + "host.js";
      script.onload = function () {
        self.gameHostLoading = null;
        resolve();
      };
      script.onerror = function () {
        self.gameHostLoading = null;
        reject(new Error("host load failed"));
      };
      document.body.appendChild(script);
    });
    return this.gameHostLoading;
  };

  Terminal.prototype.printLine = function (text, className) {
    var line = document.createElement("div");
    line.className = className || "terminal-line";
    line.textContent = text;
    this.outputEl.appendChild(line);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  };

  Terminal.prototype.printHelpEntry = function (command, description) {
    var line = ("   " + command).padEnd(HELP_CMD_WIDTH, " ") + ": " + description;
    this.printLine(line, "terminal-line-help");
  };

  Terminal.prototype.printWelcome = function () {
    this.printLine("Keko-Figueroa.Dev terminal — type help", "terminal-line-muted");
    this.printLine("Header: − minimize · ⬅➡ dock · × close · drag title to move", "terminal-line-muted");
  };

  Terminal.prototype.clearOutput = function () {
    this.outputEl.textContent = "";
  };

  Terminal.prototype.open = function () {
    this.isOpen = true;
    this.root.hidden = false;
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden", "false");
    if (this.isMinimized) this.restore();
    else this.inputEl.focus();
  };

  Terminal.prototype.close = function () {
    this.stopGame("close");
    this.isOpen = false;
    this.isMinimized = false;
    this.root.classList.remove("is-open", "is-minimized");
    this.root.setAttribute("aria-hidden", "true");
    this.root.hidden = true;
    this.updateMinimizeButton();
    this.inputEl.blur();
    try {
      var raw = localStorage.getItem(STORAGE_LAYOUT);
      if (raw) {
        var layout = JSON.parse(raw);
        layout.minimized = false;
        localStorage.setItem(STORAGE_LAYOUT, JSON.stringify(layout));
      }
    } catch (e) {}
  };

  Terminal.prototype.toggle = function () {
    if (!this.isOpen) {
      this.open();
      return;
    }
    if (this.isMinimized) {
      this.restore();
      return;
    }
    this.close();
  };

  Terminal.prototype.navigate = function (path) {
    window.location.assign(path);
  };

  Terminal.prototype.runCommand = function (raw) {
    if (this.activeGame) {
      this.printLine("Game running — press q to quit.", "terminal-line-error");
      return;
    }
    var line = normalizeInput(raw);
    var parts = line.split(" ");
    var cmd = parts[0].toLowerCase();

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
      case "minimize":
        this.minimize();
        break;
      case "restore":
        this.restore();
        break;
      case "dock":
        this.cmdDock(parts.slice(1));
        break;
      case "undock":
        this.undock();
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
        this.cmdCd(parts.slice(1).join(" "));
        break;
      case "theme":
        this.cmdTheme(parts.slice(1));
        break;
      case "snake":
        this.cmdSnake();
        break;
      default:
        this.printLine('Unknown command: "' + cmd + '". Type help.', "terminal-line-error");
    }
  };

  Terminal.prototype.cmdHelp = function () {
    this.printHelpEntry("help", "Show this command reference");
    this.printHelpEntry("clear", "Clears the terminal");
    this.printHelpEntry("close", "Closes the terminal");
    this.printHelpEntry("minimize", "Collapse to the header bar");
    this.printHelpEntry("restore", "Expand a minimized terminal");
    this.printHelpEntry("dock left", "Dock to the left edge");
    this.printHelpEntry("dock right", "Dock to the right edge");
    this.printHelpEntry("undock", "Return to a floating window");
    this.printHelpEntry("history", "List commands from this session");
    this.printHelpEntry("ls", "List the current directory");
    this.printHelpEntry("projects", "List project slugs");
    this.printHelpEntry("cd", "Change directory in the terminal");
    this.printHelpEntry("open", "Open a path in the browser");
    this.printHelpEntry("open project", "Open a project detail page");
    this.printHelpEntry("theme list", "List available color themes");
    this.printHelpEntry("theme set", "Change the site color theme");
    this.printHelpEntry("snake", "Play snake in the terminal");
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
    var entries = this.listDir();
    if (!entries.length) {
      this.printLine("(empty)", "terminal-line-muted");
      return;
    }
    for (var i = 0; i < entries.length; i += 1) {
      this.printLine(entries[i]);
    }
  };

  Terminal.prototype.cmdProjects = function () {
    if (!this.siteIndex.projects.length) {
      this.printLine("(no projects)");
      return;
    }
    for (var i = 0; i < this.siteIndex.projects.length; i += 1) {
      var project = this.siteIndex.projects[i];
      this.printLine(project.slug + "  —  " + project.title);
    }
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
      var project = findProject(this.siteIndex, slug) || resolveProject(this.siteIndex, slug);
      if (!project) {
        this.printLine('Unknown project slug: "' + slug + '"', "terminal-line-error");
        this.printLine("Run projects to list slugs.", "terminal-line-muted");
        return;
      }
      this.navigate("/projects/" + project.slug);
      return;
    }

    var path = args.join(" ");
    if (!path.startsWith("/")) path = "/" + path;
    this.navigate(path);
  };

  Terminal.prototype.cmdCd = function (target) {
    if (!target) {
      this.printLine("Usage: cd <path>  (e.g. cd blog, cd /projects, cd ..)", "terminal-line-error");
      return;
    }

    if (target === "..") {
      if (this.cwd === "/") return;
      var segments = this.cwd.split("/").filter(Boolean);
      segments.pop();
      var parent = segments.length ? "/" + segments.join("/") : "/";
      if (this.pathExists(parent)) {
        this.setCwd(parent);
      }
      return;
    }

    if (target.startsWith("/")) {
      var absolute = normalizeCwd(target);
      if (this.pathExists(absolute)) {
        this.setCwd(absolute);
        return;
      }
      this.printLine('No such path: "' + target + '"', "terminal-line-error");
      return;
    }

    var alias = CD_ALIASES[target.toLowerCase()];
    if (alias) {
      this.setCwd(alias);
      return;
    }

    if (this.cwd === "/projects") {
      var inProjects = resolveProject(this.siteIndex, target);
      if (inProjects) {
        this.setCwd("/projects/" + inProjects.slug);
        return;
      }
    }

    var relative = normalizeCwd(this.cwd === "/" ? "/" + target : this.cwd + "/" + target);
    if (this.pathExists(relative)) {
      this.setCwd(relative);
      return;
    }

    var project = resolveProject(this.siteIndex, target);
    if (project) {
      this.setCwd("/projects/" + project.slug);
      return;
    }

    this.printLine('Unknown path: "' + target + '"', "terminal-line-error");
    this.printLine("At ~: try cd projects, cd blog, cd about, cd contact", "terminal-line-muted");
  };

  Terminal.prototype.cmdTheme = function (args) {
    if (!args.length) {
      this.printHelpEntry("theme list", "List available color themes");
      this.printHelpEntry("theme set", "Change the site color theme");
      this.printLine("   Current: " + this.getTheme(), "terminal-line-muted");
      return;
    }

    var sub = args[0].toLowerCase();
    if (sub === "list") {
      var current = this.getTheme();
      for (var i = 0; i < THEMES.length; i += 1) {
        var name = THEMES[i];
        var tags = [];
        if (name === DEFAULT_THEME) tags.push("default");
        if (name === current) tags.push("current");
        var suffix = tags.length ? " (" + tags.join(", ") + ")" : "";
        this.printLine("  " + name + suffix);
      }
      return;
    }

    if (sub === "set") {
      var themeName = args[1];
      if (!themeName) {
        this.printLine("Usage: theme set <name>", "terminal-line-error");
        return;
      }
      if (THEMES.indexOf(themeName) === -1) {
        this.printLine('Unknown theme: "' + themeName + '". Run theme list.', "terminal-line-error");
        return;
      }
      this.setTheme(themeName);
      this.printLine("Theme set to " + themeName);
      return;
    }

    this.printLine('Usage: theme list  |  theme set <name>', "terminal-line-error");
  };

  Terminal.prototype.cmdSnake = function () {
    var self = this;

    this.ensureGameHost()
      .then(function () {
        return window.KekoGameHost.loadGame("snake");
      })
      .then(function () {
        if (!window.KekoTerminalGames || !window.KekoTerminalGames.snake) {
          throw new Error("snake module missing");
        }
        window.KekoGameHost.start(self, window.KekoTerminalGames.snake);
      })
      .catch(function () {
        self.printLine("Could not load snake. Try again.", "terminal-line-error");
      });
  };

  window.KekoTerminal = {
    init: function () {
      if (window.__kekoTerminal) {
        window.__kekoTerminal.cwd = window.__kekoTerminal.cwdFromBrowserPath();
        window.__kekoTerminal.updatePrompt();
        return window.__kekoTerminal;
      }
      var root = document.getElementById("terminal-overlay");
      if (!root) return null;
      var terminal = new Terminal(root);
      terminal.init();
      window.__kekoTerminal = terminal;
      return terminal;
    },
  };
})();
