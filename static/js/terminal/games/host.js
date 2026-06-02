/**
 * Terminal mini-game host — full-body game mode inside the overlay.
 *
 * Each game module is a factory: function createGame() { return instance; }
 *
 * Instance contract:
 *   start(ctx)         — mount into ctx.containerEl (full terminal body)
 *   handleKeyDown(ev)  — return true when the key was consumed
 *   destroy()          — clear timers/listeners and remove game DOM
 *
 * ctx also provides:
 *   readColors(), onGameOver(score) — called when the player loses
 */
(function () {
  "use strict";

  var loaded = {};
  var GAMES_BASE = null;

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

  /** Resolve /static/js/terminal/games/ from the terminal.js script tag. */
  function gamesBaseUrl() {
    if (GAMES_BASE) return GAMES_BASE;
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i += 1) {
      var src = scripts[i].src;
      if (!src) continue;
      if (src.indexOf("/terminal.js") !== -1 && src.indexOf("/terminal/games/") === -1) {
        GAMES_BASE = src.replace(/terminal\.js(\?.*)?$/, "terminal/games/");
        return GAMES_BASE;
      }
    }
    GAMES_BASE = "/static/js/terminal/games/";
    return GAMES_BASE;
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
        delete loaded[src];
        reject(new Error("Failed to load " + src));
      };
      document.body.appendChild(script);
    });
    return loaded[src];
  }

  function enterGameMode(terminal) {
    var body = terminal.root.querySelector(".terminal-body");
    body.classList.add("is-game-mode");

    var stage = document.createElement("div");
    stage.className = "terminal-game-stage";
    stage.setAttribute("data-terminal-game-stage", "");
    body.appendChild(stage);
    return stage;
  }

  function onGameKeyDown(terminal, event) {
    if (!terminal.activeGame || !terminal.isOpen) return;
    if (isTypingContext(document.activeElement)) return;

    var game = terminal.activeGame.instance;
    var key = event.key;

    if (key === "q" || key === "Q" || key === "Escape") {
      event.preventDefault();
      var quitScore = typeof game.getScore === "function" ? game.getScore() : undefined;
      window.KekoGameHost.stop(terminal, "quit", quitScore);
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
     * Take over the full terminal body for a game. Only one game at a time.
     */
    start: function (terminal, createGame) {
      if (!terminal || typeof createGame !== "function") return;
      if (terminal.activeGame) {
        window.KekoGameHost.stop(terminal, "replace");
      }

      var stage = enterGameMode(terminal);
      var instance = createGame();
      var keyHandler = function (event) {
        onGameKeyDown(terminal, event);
      };

      instance.start({
        containerEl: stage,
        colors: readThemeColors(),
        readColors: readThemeColors,
        onGameOver: function (score) {
          window.KekoGameHost.stop(terminal, "gameover", score);
        },
      });

      terminal.activeGame = {
        name: createGame.gameName || "game",
        instance: instance,
        stage: stage,
        keyHandler: keyHandler,
      };

      terminal.setGameInputLocked(true);
      document.addEventListener("keydown", keyHandler);
    },

    /**
     * Tear down the game and restore the normal terminal shell.
     */
    stop: function (terminal, reason, score) {
      if (!terminal || !terminal.activeGame) return;

      var active = terminal.activeGame;
      document.removeEventListener("keydown", active.keyHandler);

      if (typeof active.instance.destroy === "function") {
        active.instance.destroy();
      }
      if (active.stage && active.stage.parentNode) {
        active.stage.parentNode.removeChild(active.stage);
      }

      var body = terminal.root.querySelector(".terminal-body");
      if (body) body.classList.remove("is-game-mode");

      terminal.activeGame = null;
      terminal.setGameInputLocked(false);

      if (!terminal.printLine) return;

      if (reason === "gameover") {
        terminal.printLine("Game over — score: " + String(score == null ? 0 : score), "terminal-line-muted");
        terminal.printLine("Back at the prompt. Type help or snake to play again.", "terminal-line-muted");
      } else if (reason === "quit") {
        if (typeof score === "number" && score > 0) {
          terminal.printLine("Quit snake — score: " + score, "terminal-line-muted");
        } else {
          terminal.printLine("Exited snake.", "terminal-line-muted");
        }
      }
    },
  };
})();
