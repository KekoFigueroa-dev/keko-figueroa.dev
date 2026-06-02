# ADR 0009: Terminal Console Games Framework (Phase 4 — Ship B)

**Status:** Accepted (Ship B1 snake implemented)

## Context

Ship A delivered a lazy-loaded terminal overlay with navigation, themes, and layout persistence. We want playful mini-games inside that pane—starting with snake—without turning the portfolio into a game site or bloating the initial page load.

Future games (invaders, tetris) should share the same mount/teardown pattern so each ships in its own PR.

## Decision

Introduce a small **game host** (`static/js/terminal/games/host.js`) with a documented instance contract:

| Method | Purpose |
|---|---|
| `start(ctx)` | Mount into `ctx.containerEl`; read theme colors from CSS variables |
| `handleKeyDown(event)` | Consume game keys (movement, etc.) |
| `restart()` | Optional reset without unmounting |
| `destroy()` | Clear timers/listeners and DOM |

**Integration rules:**

- Each game is a separate script under `static/js/terminal/games/` and is **lazy-loaded only when its command runs** (e.g. `snake`).
- The host mounts a canvas panel above the command input, disables terminal input, and registers a document-level key handler **only while a game is active**.
- Universal controls: **`q`** and **Escape** quit; **`r`** restarts (when the game implements `restart()`).
- Closing or minimizing the terminal calls `destroy()` so no intervals or listeners survive.

Ship games incrementally: **B1 snake**, **B2 invaders** (planned), **B3 tetris** (planned, after framework is proven).

## Consequences

- Extra JS bytes load only when a user runs a game command—core site stays fast.
- Consistent exit/restart UX across games; new games only implement the instance contract + their command wiring in `terminal.js`.
- Document-level key handler is gated on `terminal.isOpen`, `activeGame`, and “not typing in a form field” so contact-form input stays safe.
- ADR [0008](0008-terminal-console-games-snake.md) remains the snake-specific scope note; this ADR owns the shared framework.

**Test expectations:** See `docs/testing.md` — Ship B1 snake checklist.
