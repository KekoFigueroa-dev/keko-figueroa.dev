# Testing Checklists

Manual verification steps for features that need human eyes or browser DevTools.

---

## Phase 4 — Terminal console (Ship A)

**Status:** Planned — run this checklist when Ship A is implemented (not before).

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

## Phase 4 — Snake mini-game (Ship B)

**Status:** Planned — add checklist when Ship B is implemented.

- [ ] `snake` starts game inside console only
- [ ] `q` or `close` exits game and returns to shell
- [ ] Game does not run when overlay is closed
- [ ] No console errors after exit; navigation commands still work

---

## Contact form

See [docs/deploy.md — Contact form verification checklist](deploy.md#contact-form-verification-checklist).

## Deploy smoke test

See [docs/deploy.md — Smoke test after deploy](deploy.md#smoke-test-after-deploy).
