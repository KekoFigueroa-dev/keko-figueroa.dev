# Agent guide — keko-figueroa.dev

Portfolio repo for **Keko-Figueroa.Dev** (domain: keko-figueroa.dev).

## Goals

- Showcase craftsmanship and technical depth for **back-end / data / AI** roles.
- Terminal-techy aesthetic (retro in-page console + subtle 90s throwback).
- Fast, server-rendered, minimal JS.

## Hard constraints

- **No database or CMS** in this repo.
- **Flask + Jinja templates** only.
- **Minimal JS** — lazy-loaded terminal (`c`) and per-game scripts (`snake`, etc.); no bundle on first paint.
- Keep `/health` returning `{ "status": "ok" }`.
- CSS lives in `static/styles.css`.

## Stack

- Python 3.12, Flask, gunicorn
- Hosting: Render (Procfile + runtime.txt)
- DNS: Cloudflare

## Content source

- `PROJECTS` and `POSTS` are in-memory lists in `app.py`.
- Edit those structures to update project cards, case studies, and blog posts.
- No external content files unless explicitly requested.

## Routes

| Route | Template |
|-------|----------|
| `/` | `home.html` |
| `/projects` | `projects.html` |
| `/blog` | `blog.html` |
| `/blog/<slug>` | `blog_post.html` |
| `/about` | `about.html` |
| `/contact` | `contact.html` |
| `/health` | JSON (no template) |

## Project lineup (`PROJECTS` order in `app.py`)

1. **keko-figueroa.dev** (this site) — live + repo; terminal + snake
2. **Matrix-themed Sprint Planner** — live demo + repo
3. **token_e-sports_betting** (in progress) — private repo
4. **DEUNA Payments Flow** (case study) — last; repo only, docs-first

## Blog (static-first)

Three seed posts on fintech/idempotency, ledger wallets, and pragmatic RAG. Add entries to `POSTS` in `app.py`.

## Deployment

- Do **not** commit/push unless the user explicitly says "commit" or "push".
- Gunicorn: `gunicorn --bind 0.0.0.0:$PORT app:app`
- Local dev: `export FLASK_APP=app.py && flask run`

## Phase plan

- **Phase 1** (done): Under-construction page, health check, Render config.
- **Phase 2** (done): Full portfolio routes, project cards, blog, matrix-green terminal aesthetic.
- **Phase 2.5** (planned): Hero visual slidedeck — see [Hero visual](#hero-visual) below.
- **Phase 3** (done): Contact form POST (Postmark + Turnstile + rate limit).
- **Phase 4** (Ship A + B1 done; B2/B3 planned): draggable terminal + lazy-loaded mini-games.
  - **Ship A:** navigation, themes, dock/minimize — done
  - **Ship B1:** `snake` — done (ADR 0008, 0009)
  - **Ship B2/B3:** invaders, tetris — not started
  - Test: `docs/testing.md`

## Hero visual

The home hero center slot (`.profile-avatar` in `templates/home.html`) is intentionally a **static placeholder** today.

| Asset | Purpose |
|-------|---------|
| `static/profile.svg` | Default — matrix-green “KF” square (SVG, committed) |
| `static/profile.jpg` | Optional — drop a real photo; `app.py` auto-prefers it over the SVG |

**Planned (Phase 2.5 — not implemented yet):** Replace the single static image with a **hero slidedeck** — a small rotating visual carousel in that slot, with one slide per site section (e.g. Home, Projects, Blog, About, Contact). Each slide would use a custom matrix-themed image or screenshot.

Constraints when we build it:

- Keep **minimal JS** (CSS-only autoplay preferred; tiny vanilla JS only if needed).
- Images live under `static/hero/` (e.g. `home.webp`, `projects.webp`, …).
- Slides defined in `app.py` (in-memory list, same pattern as `PROJECTS` / `POSTS`).
- Must remain fast and server-rendered (first slide in HTML; enhancement optional).

Visual reference: [matrix-themed-sprint-planner](https://github.com/KekoFigueroa-dev/matrix-themed-sprint-planner) (matrix green, CRT grid, vaporwave accents).

## Design system

- **Theme reference:** [matrix-themed-sprint-planner](https://github.com/KekoFigueroa-dev/matrix-themed-sprint-planner) — matrix green (`#00ff41`), dark surfaces, magenta CTA accents, CRT grid + scanlines.
- **Grid background:** `.site-grid` in `base.html` — 2rem visible grid overlay (matrix-green tint) + `body::after` scanlines in `static/styles.css`.
- **Workflow:** Always test locally (`flask run`) before commit/push.

## Positioning copy (use verbatim unless polishing)

- Name / brand: Keko-Figueroa.Dev
- Email: keko@keko-figueroa.dev
- Skills: Python, SQL, Linux
- Hero prompt: `keko@keko-figueroa.dev:~$ whoami`
- Hero subhead: "Back-end, Data & AI engineer building reliable systems—especially where money moves."
- Support: "Python · SQL · Linux • APIs, pipelines, and AI agents that ship."
