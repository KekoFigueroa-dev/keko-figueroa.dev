/**
 * Snake — canvas mini-game for the terminal overlay (full-body mode).
 * Factory: KekoTerminalGames.snake()
 */
(function () {
  "use strict";

  var GRID = 20;
  var TICK_MS = 140;

  var KEY_TO_DIR = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    D: { x: 1, y: 0 },
  };

  function sameCell(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function createSnakeGame() {
    var gameCtx = null;
    var canvas = null;
    var hud = null;
    var colors = null;
    var cellSize = 14;
    var snake = [];
    var direction = { x: 1, y: 0 };
    var pendingDir = null;
    var food = { x: 0, y: 0 };
    var score = 0;
    var tickTimer = null;
    var gameOver = false;
    var resizeHandler = null;

    function randomFood() {
      var spot;
      do {
        spot = {
          x: Math.floor(Math.random() * GRID),
          y: Math.floor(Math.random() * GRID),
        };
      } while (snake.some(function (part) {
        return sameCell(part, spot);
      }));
      food = spot;
    }

    function resetState() {
      snake = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 },
      ];
      direction = { x: 1, y: 0 };
      pendingDir = null;
      score = 0;
      gameOver = false;
      randomFood();
      updateHud();
    }

    function resizeCanvas() {
      if (!canvas || !gameCtx) return;
      var stage = canvas.parentElement;
      if (!stage) return;

      var maxWidth = stage.clientWidth - 16;
      var maxHeight = stage.clientHeight - 56;
      if (maxWidth < 40 || maxHeight < 40) return;

      cellSize = Math.max(8, Math.floor(Math.min(maxWidth / GRID, maxHeight / GRID)));
      canvas.width = cellSize * GRID;
      canvas.height = cellSize * GRID;
      draw();
    }

    function updateHud() {
      if (!hud) return;
      hud.textContent = "Snake — score: " + score + "  ·  Arrow/WASD move  ·  q quit";
    }

    function setDirection(next) {
      if (gameOver) return;
      var active = pendingDir || direction;
      if (active.x + next.x === 0 && active.y + next.y === 0) return;
      pendingDir = next;
    }

    function step() {
      if (gameOver) return;

      if (pendingDir) {
        direction = pendingDir;
        pendingDir = null;
      }

      var head = snake[0];
      var next = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      if (next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID) {
        endGame();
        return;
      }

      if (snake.some(function (part) {
        return sameCell(part, next);
      })) {
        endGame();
        return;
      }

      snake.unshift(next);

      if (sameCell(next, food)) {
        score += 1;
        randomFood();
        updateHud();
      } else {
        snake.pop();
      }

      draw();
    }

    function endGame() {
      if (gameOver) return;
      gameOver = true;
      stopLoop();
      draw();
      if (gameCtx && typeof gameCtx.onGameOver === "function") {
        window.setTimeout(function () {
          gameCtx.onGameOver(score);
        }, 450);
      }
    }

    function drawGrid(context) {
      context.strokeStyle = colors.border;
      context.lineWidth = 1;
      for (var i = 0; i <= GRID; i += 1) {
        var offset = i * cellSize + 0.5;
        context.beginPath();
        context.moveTo(offset, 0);
        context.lineTo(offset, canvas.height);
        context.stroke();
        context.beginPath();
        context.moveTo(0, offset);
        context.lineTo(canvas.width, offset);
        context.stroke();
      }
    }

    function draw() {
      if (!canvas || !gameCtx) return;
      colors = gameCtx.readColors();
      var canvasCtx = canvas.getContext("2d");
      canvasCtx.fillStyle = colors.bg;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid(canvasCtx);

      canvasCtx.fillStyle = colors.food;
      canvasCtx.fillRect(
        food.x * cellSize + 1,
        food.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );

      for (var i = 0; i < snake.length; i += 1) {
        canvasCtx.fillStyle = i === 0 ? colors.accent : colors.fg;
        canvasCtx.fillRect(
          snake[i].x * cellSize + 1,
          snake[i].y * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );
      }

      if (gameOver) {
        canvasCtx.fillStyle = "rgba(0, 0, 0, 0.55)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = colors.fg;
        canvasCtx.font = "bold 14px monospace";
        canvasCtx.textAlign = "center";
        canvasCtx.fillText("Game over", canvas.width / 2, canvas.height / 2 - 6);
        canvasCtx.font = "12px monospace";
        canvasCtx.fillStyle = colors.muted;
        canvasCtx.fillText("score: " + score, canvas.width / 2, canvas.height / 2 + 14);
      }
    }

    function startLoop() {
      stopLoop();
      tickTimer = window.setInterval(step, TICK_MS);
    }

    function stopLoop() {
      if (tickTimer !== null) {
        window.clearInterval(tickTimer);
        tickTimer = null;
      }
    }

    return {
      start: function (startCtx) {
        gameCtx = startCtx;
        colors = startCtx.colors;
        startCtx.containerEl.textContent = "";

        hud = document.createElement("div");
        hud.className = "terminal-game-hud mono";

        var canvasWrap = document.createElement("div");
        canvasWrap.className = "terminal-game-canvas-wrap";

        canvas = document.createElement("canvas");
        canvas.className = "terminal-game-canvas";
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", "Snake game");

        canvasWrap.appendChild(canvas);
        startCtx.containerEl.appendChild(hud);
        startCtx.containerEl.appendChild(canvasWrap);

        resetState();
        resizeCanvas();
        startLoop();
        draw();

        resizeHandler = function () {
          resizeCanvas();
        };
        window.addEventListener("resize", resizeHandler);
      },

      handleKeyDown: function (event) {
        var next = KEY_TO_DIR[event.key];
        if (!next) return false;
        setDirection(next);
        return true;
      },

      getScore: function () {
        return score;
      },

      destroy: function () {
        stopLoop();
        if (resizeHandler) {
          window.removeEventListener("resize", resizeHandler);
          resizeHandler = null;
        }
        gameCtx = null;
        canvas = null;
        hud = null;
      },
    };
  }

  createSnakeGame.gameName = "snake";

  window.KekoTerminalGames = window.KekoTerminalGames || {};
  window.KekoTerminalGames.snake = createSnakeGame;
})();
