# ADR 0007: Terminal Console Overlay (Phase 4 — Ship A)

**Status:** Planned (not implemented)

## Context

The site already uses a terminal-inspired aesthetic (matrix green, mono prompts, CRT grid). [stripe.dev](https://stripe.dev) shows how a **draggable in-page terminal** can feel playful and useful without replacing the main UI. We want optional, contained interactivity: navigate the portfolio by typing commands, switch themes, and reinforce the brand—while keeping the site fully usable with zero JS.

Ship A covers **navigation + themes only**. Games and typed-output animations are out of scope for this ship.

## Decision

Add a **lazy-loaded, draggable terminal console overlay**:

- **Toggle:** press `c` to open/close (keyboard shortcut documented in overlay help)
- **Overlay:** fixed-position window, draggable via mouse and touch; does not replace page content
- **Command parser:** small in-browser shell with predictable, documented commands (see README Phase 4 section)
- **Persistence:** `localStorage` for window position and selected theme
- **Ship boundary:** no games, no snake, no typed character animations in Ship A

Planned commands (Ship A):

| Command | Behavior |
|---|---|
| `help` | List available commands |
| `clear` | Clear terminal output |
| `close` | Close overlay |
| `history` | Show command history |
| `ls` | List navigable routes |
| `cd <page>` | Navigate to a page (e.g. `cd projects`) |
| `open <path>` | Open a path (e.g. `open /blog`) |
| `projects` | List project slugs |
| `open project <slug>` | Navigate to `/projects/<slug>` |
| `theme <name>` | Switch console theme |

Engineering constraints:

- Lazy-load console JS/CSS on **first `c` press** — no terminal bundle on initial page load
- Full site navigation via normal links when JS is disabled
- Respect `prefers-reduced-motion` (reduce/disable drag animations and motion-heavy effects)
- Scope limited to the overlay; do not hijack global typing outside the console

## Consequences

- Adds JS (lazy-loaded) — acceptable tradeoff because the portfolio remains server-rendered and the console is optional
- Accessibility: overlay needs focus trap while open, Escape to close, visible focus states, and screen-reader-friendly command output
- Must not block core content or hurt Lighthouse scores on pages where the console is never opened
- Test checklist lives in `docs/testing.md` (Phase 4 — Ship A)
- Ship B (snake) is a separate ADR and must not land in the same PR as Ship A unless explicitly requested
