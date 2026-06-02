# ADR 0007: Terminal Console Overlay (Phase 4 — Ship A)

**Status:** Implemented (Ship A — navigation + themes)

## Context

The site already uses a terminal-inspired aesthetic (matrix green, mono prompts, CRT grid). [stripe.dev](https://stripe.dev) shows how a **draggable in-page terminal** can feel playful and useful without replacing the main UI. We want optional, contained interactivity: navigate the portfolio by typing commands, switch themes, and reinforce the brand—while keeping the site fully usable with zero JS.

Ship A covers **navigation + themes only**. Games and typed-output animations are out of scope for this ship.

## Decision

Add a **lazy-loaded, draggable terminal console overlay**:

- **Toggle:** press `c` to open/close (ignored while focus is in `input`, `textarea`, `select`, or `contenteditable`)
- **Overlay:** fixed-position window, draggable via pointer (mouse + touch); does not replace page content
- **Command parser:** vanilla JS shell with the command set below
- **Persistence:** `localStorage` keys `terminalPosition` (window position) and `siteTheme` (site-wide CSS theme)
- **Lazy-load:** inline bootstrap in `base.html` loads `static/js/terminal.js` on first `c` press only
- **Data:** `site_index` JSON embedded from Flask (`SITE_PAGES` + `PROJECTS` slugs)
- **Ship boundary:** no games, no snake, no typed character animations in Ship A

Commands (Ship A):

| Command | Behavior |
|---|---|
| `help` | List available commands |
| `clear` | Clear terminal output |
| `close` | Close overlay (same as Esc) |
| `history` | Print command history |
| `ls` | List pages + project paths |
| `cd <page>` | Navigate to `/`, `/projects`, `/blog`, `/about`, `/contact` |
| `open <path>` | Navigate to a URL path |
| `projects` | List project slugs |
| `open project <slug>` | Navigate to `/projects/<slug>` |
| `theme` | List themes + show current |
| `theme <name>` | Switch theme (`matrix`, `solarized-dark`, `high-contrast`, `nord`) |

Engineering constraints:

- **No external JS libraries** — vanilla only
- Lazy-load on first `c` — no terminal bundle on initial page load
- Full site navigation via normal links when JS is disabled
- Respect `prefers-reduced-motion` (no open/close transitions when reduced)
- Output via `textContent` (not `innerHTML`) to avoid XSS from echoed input
- Scope limited to the overlay; bootstrap `c` listener is the only always-on JS

## Consequences

- Adds lazy-loaded JS — acceptable because the portfolio remains server-rendered and the console is optional
- Accessibility: dialog role, Esc to close, focus input on open, visible focus rings
- Themes apply site-wide via `html[data-theme]` CSS variables
- Open/closed state is **not** persisted — terminal starts closed on each page load
- Test checklist: `docs/testing.md` (Phase 4 — Ship A)
- Ship B (snake) remains a separate ADR and must not ship in the same PR as Ship A
