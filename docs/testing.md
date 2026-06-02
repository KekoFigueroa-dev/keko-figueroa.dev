# Testing Checklists

Manual verification steps for features that need human eyes or browser DevTools.

---

## Phase 4 — Terminal console (Ship A)

**Status:** Implemented on `main` — run when validating Ship A or after console changes.

### Toggle and overlay

- [ ] Press `c` opens the console overlay
- [ ] Press `c` again (or run `close`) closes the overlay
- [ ] Escape closes the overlay while focused inside it
- [ ] Overlay is draggable with **mouse** (title bar or designated handle)
- [ ] Overlay is draggable with **touch** on mobile/tablet
- [ ] Site content remains readable and clickable when overlay is closed

### Persistence

- [ ] Drag position is saved to `localStorage` and restored on reload
- [ ] Selected theme is saved to `localStorage` and restored on reload
- [ ] Clearing site data resets to defaults without errors

### Commands (Ship A)

- [ ] `help` lists commands
- [ ] `clear` clears output
- [ ] `close` closes overlay
- [ ] `history` shows recent commands
- [ ] `ls` lists routes
- [ ] `cd <page>` navigates correctly (e.g. `cd projects` → `/projects`)
- [ ] `open <path>` navigates correctly (e.g. `open /about`)
- [ ] `projects` lists project slugs from site data
- [ ] `open project <slug>` navigates to `/projects/<slug>`
- [ ] `theme <name>` switches console theme visibly
- [ ] Unknown commands show a friendly error, not a stack trace

### Performance and fallback

- [ ] **Lazy-load:** Network tab shows no terminal JS until first `c` press
- [ ] **JS disabled:** full site navigation works via header/footer links; no broken layout
- [ ] **`prefers-reduced-motion`:** reduced or no motion on open/drag/theme transitions
- [ ] Console closed: no measurable impact on scroll/interaction (no runaway timers)

### Accessibility (Ship A)

- [ ] Focus moves into overlay when opened; returns on close
- [ ] Tab order is logical inside overlay
- [ ] Command output is perceivable (not color-only)

---

## Phase 4 — Snake mini-game (Ship B1)

**Status:** Implemented — run when validating snake or after game-host changes.

- [ ] Running `snake` opens a canvas in the terminal
- [ ] Arrow keys and WASD control the snake
- [ ] `q` quits back to the terminal prompt
- [ ] `r` restarts after game over (and during play)
- [ ] Escape quits back to the terminal prompt
- [ ] Closing the terminal exits the game cleanly (no timers continue)
- [ ] Minimizing the terminal exits the game cleanly
- [ ] Theme colors match the current site theme (`theme set` then `snake`)
- [ ] No console errors after exit; navigation commands still work
- [ ] **Lazy-load:** Network tab shows no `host.js` / `snake.js` until first `snake` command
- [ ] Contact form typing unaffected (`c` ignored in inputs; game keys inactive when terminal closed)

---

## Contact form

See [docs/deploy.md — Contact form verification checklist](deploy.md#contact-form-verification-checklist).

## Deploy smoke test

See [docs/deploy.md — Smoke test after deploy](deploy.md#smoke-test-after-deploy).
