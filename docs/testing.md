# Testing Checklists

Manual verification for features that need a browser or DevTools.

---

## Phase 4 — Terminal console (Ship A)

**Status:** Done on `main` — run after terminal or layout changes.

### Toggle and overlay

- [ ] Press `c` opens the console (ignored while typing in form fields)
- [ ] Navbar **Press c — terminal** button opens the console
- [ ] Press `c` again (or `close`) closes the overlay
- [ ] Escape closes the overlay when no game is running
- [ ] Drag title bar repositions the floating window (mouse + touch)
- [ ] Site remains usable when the overlay is closed

### Layout chrome

- [ ] `minimize` / `restore` collapse and expand the body
- [ ] `dock left` / `dock right` pin full-height side panels
- [ ] `undock` returns to a floating window
- [ ] Position and theme persist in `localStorage` across reload

### Commands (Ship A)

- [ ] `help` — single-line command reference
- [ ] `clear`, `close`, `history`
- [ ] `ls`, `cd`, `open`, `open project <slug>`, `projects` (order matches `PROJECTS` in `app.py`)
- [ ] `theme list`, `theme set <name>` update site + terminal colors
- [ ] Unknown commands show a friendly error

### Performance and fallback

- [ ] **Lazy-load:** no `terminal.js` until first `c` (Network tab)
- [ ] **JS disabled:** header/footer navigation still works
- [ ] **`prefers-reduced-motion`:** no essential motion required
- [ ] Overlay closed: no runaway timers or listeners

---

## Phase 4 — Snake (Ship B1)

**Status:** Done on `main` — run after game or host changes.

- [ ] `snake` fills the terminal body (output + prompt hidden)
- [ ] Arrow keys / WASD move; edges wrap (no wall death)
- [ ] Snake uses theme accent color (`--terminal-accent`)
- [ ] Self-collision ends run; score prints in the terminal log
- [ ] `q` or Escape quits; closing or minimizing the terminal stops the game
- [ ] **Lazy-load:** no `host.js` / `snake.js` until first `snake`
- [ ] After exit, Ship A commands work normally

---

## Contact form

See [docs/deploy.md — Contact form verification](deploy.md#contact-form-verification-checklist).

## Deploy smoke test

See [docs/deploy.md — Smoke test after deploy](deploy.md#smoke-test-after-deploy).
