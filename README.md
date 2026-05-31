# keko-figueroa.dev

Flask-based personal portfolio for [keko-figueroa.dev](https://keko-figueroa.dev) (Render + Cloudflare).

**Positioning:** Back-end, Data & AI engineering—reliable systems, especially where money moves. Skills: Python, SQL, Linux.

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.py
flask run
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000). Health check: [http://127.0.0.1:5000/health](http://127.0.0.1:5000/health).

## Deploy on Render

1. Create a **Web Service** connected to this repo.
2. Render detects Python via `runtime.txt` and starts the app with the `Procfile`.
3. Gunicorn binds to `0.0.0.0:$PORT` (provided by Render).
4. Point Cloudflare DNS (A/CNAME) at the Render service URL or custom domain.

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Home — hero, featured projects, latest writing |
| `GET /projects` | Project case studies |
| `GET /blog` | Blog index |
| `GET /blog/<slug>` | Single blog post (static, in-memory) |
| `GET /about` | Bio, values, stack |
| `GET /contact` | Email + GitHub links |
| `GET /health` | JSON `{ "status": "ok" }` |

## Project lineup

| Project | Status | Links |
|---------|--------|-------|
| Matrix-themed Sprint Planner | Public | [Demo](https://matrix-themed-sprint-planner.vercel.app) · [Repo](https://github.com/KekoFigueroa-dev/matrix-themed-sprint-planner) |
| DEUNA Payments Flow | Public (docs-first) | [Repo](https://github.com/KekoFigueroa-dev/DEUNA-payments-flow) |
| token_e-sports_betting | In progress | [Repo](https://github.com/KekoFigueroa-dev/token_e-sports_betting) |

Project data lives in `PROJECTS` inside `app.py`—edit there to update cards and case-study sections.

## Blog (static-first)

Seed posts are defined in `POSTS` inside `app.py`. No database or CMS—add entries to the list and redeploy. Future option: move to YAML/JSON file if the list grows.

## Hero visual (current + planned)

The centered square on the home page is **`static/profile.svg`** — a static SVG placeholder (green “KF” initials). It is not a photo yet.

To use a real profile photo, add **`static/profile.jpg`**; the app prefers it automatically.

**Planned (Phase 2.5):** Replace this slot with a **hero slidedeck** — rotating slides with custom images for Home, Projects, Blog, About, and Contact. Details and constraints are in [AGENTS.md](AGENTS.md#hero-visual).

## Design

- Matrix-green terminal aesthetic; visual reference: [matrix-themed-sprint-planner](https://github.com/KekoFigueroa-dev/matrix-themed-sprint-planner)
- Visible **grid overlay** (`.site-grid`) + CRT scanlines — CSS only, no JS
- **Workflow:** test locally with `flask run` before any commit or push

## Architecture constraints

- Flask + Jinja templates, server-rendered
- No database, no CMS
- Minimal JS (none currently)
- CSS in `static/styles.css`
- Terminal-techy aesthetic (dark, matrix-green accent, monospace meta)

## License

MIT — see [LICENSE](LICENSE).
