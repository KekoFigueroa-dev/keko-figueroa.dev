/**
 * Terminal mini-game host — mounts canvas games inside the overlay.
 *
 * Each game module is a factory: function createGame() { return instance; }
 *
 * Instance contract:
 *   start(ctx)         — mount into ctx.containerEl; ctx has colors, readColors(), onExit()
 *   handleKeyDown(ev)  — return true when the key was consumed (movement, etc.)
 *   restart()          — optional; reset state without unmounting
 *   destroy()          — clear timers/listeners and remove game DOM
 */
(function () {
  "use strict";

  var loaded = {};

  function isTypingContext(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  function readThemeColors() {
    var style = getComputedStyle(document.documentElement);
    function pick(name, fallback) {
      var value = style.getPropertyValue(name).trim();
      return value || fallback;
    }
    return {
      bg: pick("--terminal-bg", "#0a120d"),
      fg: pick("--terminal-fg", "#c8f5d8"),
      accent: pick("--terminal-accent", "#00ff41"),
      muted: pick("--terminal-muted", "#4a9f68"),
      border: pick("--terminal-border", "rgba(0, 255, 65, 0.35)"),
      food: pick("--accent-0", "#ff4fd8"),
    };
  }

  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        loaded[src] = null;
        reject(new Error("Failed to load " + src));
      };
      document.body.appendChild(script);
    });
    return loaded[src];
  }

  function gamesBaseUrl() {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      var src = scripts[i].src;
      if (src.indexOf("terminal.js") !== -1) {
        return src.replace(/terminal\.js(\?.*)?$/, "terminal/games/");
      }
    }
    return "/static/js/terminal/games/";
  }

  function attachPanel(terminal) {
    var body = terminal.root.querySelector(".terminal-body");
    var panel = document.createElement("div");
    panel.className = "terminal-game-panel";
    panel.setAttribute("data-terminal-game-panel", "");
    body.insertBefore(panel, terminal.formEl);
    return panel;
  }

  function onGameKeyDown(terminal, event) {
    if (!terminal.activeGame || !terminal.isOpen) return;
    if (isTypingContext(document.activeElement)) return;

    var game = terminal.activeGame.instance;
    var key = event.key;

    if (key === "q" || key === "Q" || key === "Escape") {
      event.preventDefault();
      window.KekoGameHost.stop(terminal, "quit");
      return;
    }

    if (key === "r" || key === "R") {
      event.preventDefault();
      if (typeof game.restart === "function") game.restart();
      return;
    }

    if (typeof game.handleKeyDown === "function" && game.handleKeyDown(event)) {
      event.preventDefault();
    }
  }

  window.KekoGameHost = {
    gamesBaseUrl: gamesBaseUrl,

    loadScript: loadScript,

    loadGame: function (name) {
      return loadScript(gamesBaseUrl() + name + ".js");
    },

    /**
     * Mount a game factory inside the terminal. Only one game at a time.
     */
    start: function (terminal, createGame) {
      if (!terminal || typeof createGame !== "function") return;
      if (terminal.activeGame) {
        window.KekoGameHost.stop(terminal, "replace");
      }

      var panel = attachPanel(terminal);
      var instance = createGame();
      var keyHandler = function (event) {
        onGameKeyDown(terminal, event);
      };

      instance.start({
        containerEl: panel,
        colors: readThemeColors(),
        readColors: readThemeColors,
        onExit: function () {
          window.KekoGameHost.stop(terminal, "exit");
        },
      });

      terminal.activeGame = {
        name: createGame.gameName || "game",
        instance: instance,
        panel: panel,
        keyHandler: keyHandler,
      };

      terminal.setGameInputLocked(true);
      document.addEventListener("keydown", keyHandler);
    },

    /**
     * Tear down the active game and restore the command prompt.
     */
    stop: function (terminal, reason) {
      if (!terminal || !terminal.activeGame) return;

      var active = terminal.activeGame;
      document.removeEventListener("keydown", active.keyHandler);

      if (typeof active.instance.destroy === "function") {
        active.instance.destroy();
      }
      if (active.panel && active.panel.parentNode) {
        active.panel.parentNode.removeChild(active.panel);
      }

      terminal.activeGame = null;
      terminal.setGameInputLocked(false);

      if (reason === "quit" && terminal.printLine) {
        terminal.printLine("Exited " + active.name + ".", "terminal-line-muted");
      }
    },
  };
})();
