# ADR 0008: Terminal Console Games — Snake (Phase 4 — Ship B1)

**Status:** Accepted (implemented in Ship B1)

## Context

After Ship A shipped a stable console (navigation, themes, persistence), a small easter egg can add personality without changing how the portfolio works. Snake is a familiar terminal mini-game that fits the aesthetic—but it is **novelty**, not core UX.

The multi-game plan splits Ship B into incremental PRs: **B1 snake**, **B2 invaders**, **B3 tetris**. This ADR covers snake only.

## Decision

Implement **snake as Ship B1** inside the terminal overlay, using the shared game host ([ADR 0009](0009-terminal-console-games-framework.md)):

- Entry via explicit `snake` command — not auto-started
- Canvas rendering in a panel above the command input; no full-page takeover
- Vanilla JS only; lazy-load `host.js` then `snake.js` on first `snake` invocation
- Universal quit/restart: `q`, Escape, `r` (handled by host + game)
- Theme colors read from `--terminal-*` and `--accent-0` CSS variables

Ship B1 must not implement invaders or tetris.

## Consequences

- Snake module is self-contained in `static/js/terminal/games/snake.js`.
- No timers or listeners when the overlay is closed or snake is not running.
- Pause/exit paths required so snake never traps the user (`q` / Escape / overlay close).
- If snake bundle size or tick timing hurts mobile, cap grid size or tick rate in a follow-up (document in PR).

**Supersedes:** “Planned (not implemented)” status from the original ADR draft.
