# ADR 0008: Terminal Console Games — Snake (Phase 4 — Ship B)

**Status:** Planned (not implemented)

## Context

After Ship A ships a stable console (navigation, themes, persistence), a small easter egg can add personality without changing how the portfolio works. Snake is a familiar terminal mini-game that fits the aesthetic—but it is **novelty**, not core UX.

## Decision

Implement **snake as a separate ship (Ship B)** that runs **only inside the terminal overlay window**:

- Entry via an explicit command (e.g. `snake`) — not auto-started
- Game loop and rendering contained within the console pane; no full-page canvas takeover
- Ship B PRs must not refactor Ship A navigation/parser unless fixing a shared bug
- No typed-output animations or other games in this ship unless added as future ADRs

Ship A must be merged and stable before Ship B work begins.

## Consequences

- Extra JS surface area — keep snake module self-contained and lazy-loaded with (or after) the console bundle
- Must not degrade site performance when the console is closed or snake is not running
- Pause/exit paths required so snake never traps the user (`q` / `close` / overlay close)
- Test checklist for Ship B will be added to `docs/testing.md` when implementation starts
- If snake bundle size or frame timing hurts mobile, cap FPS or disable on narrow viewports (document in Ship B PR)
