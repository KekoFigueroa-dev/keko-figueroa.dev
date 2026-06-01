# keko-figueroa.dev

Personal portfolio site for [keko-figueroa.dev](https://keko-figueroa.dev), built with Flask + Jinja and deployed on Render behind Cloudflare.

## What This Site Is

This repository is a server-rendered portfolio focused on back-end/data/AI projects and case studies. The goal is fast load times, clear technical storytelling, and low operational overhead.

**Live:** [https://keko-figueroa.dev](https://keko-figueroa.dev)

## Design Goals

- Fast first render (no SPA runtime required)
- Minimal JavaScript (Turnstile widget on contact page only when enabled)
- Terminal-techy visual language without sacrificing readability
- Content-as-code for transparent edits and review

## Stack

- Python 3.12
- Flask + Jinja templates
- Static CSS in `static/styles.css`
- Gunicorn (production)
- Render (hosting) + Cloudflare (DNS/SSL)

## Local Development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.py
flask run
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

Health check:

```bash
curl http://127.0.0.1:5000/health
```

## Route Map

| Route | Description |
|---|---|
| `GET /` | Home + featured projects + latest writing |
| `GET /projects` | Project index (cards) |
| `GET /projects/<slug>` | Project detail page |
| `GET /blog` | Blog index |
| `GET /blog/<slug>` | Blog post detail |
| `GET /about` | About page |
| `GET /contact` | Contact page |
| `POST /contact` | Contact form submission (Postmark + bot protection) |
| `GET /health` | JSON health endpoint |

## Editing Project Content

Project data is defined in `PROJECTS` inside `app.py`.

Each project entry includes:

- `slug`, `title`, `type`, `status_label`
- `short_summary`, `oneliner`
- `live_url` and/or `repo_url` (optional)
- detail sections used by `templates/project_detail.html`:
  - `problem`, `what_it_is`, `constraints`
  - `architecture`, `architecture_points`
  - `key_decisions`, `what_shipped`, `what_next`, `notes`

To add a project:

1. Add a new object to `PROJECTS` in `app.py`
2. Choose a unique `slug`
3. Ensure section keys exist so the detail template renders cleanly
4. Visit `/projects/<slug>` locally

## Editing Blog Content

Blog entries are static-first and live in `POSTS` inside `app.py`.

To add a post:

1. Add an entry with `slug`, `title`, `date`, `excerpt`, and `body` (list of paragraphs)
2. Check `/blog` and `/blog/<slug>` locally

## Contact form (security + deliverability)

The contact page posts to `POST /contact`. Submissions are sent via **Postmark** (HTTP API) — not `mailto:` — for reliable delivery and structured fields.

| Design choice | Why |
|---|---|
| Postmark API | Strong deliverability, simple integration, no SMTP daemon on Render |
| **From** = `CONTACT_FROM_EMAIL` | Must be a Postmark-verified sender on the domain (SPF/DKIM alignment) |
| **To** = `CONTACT_TO_EMAIL` | Inbox that receives submissions |
| **Reply-To** = visitor email | Your reply goes directly to the person who wrote in |
| No DB storage | Keeps the stack static-first; the mailbox is the record |

### Required environment variables (names only)

**Postmark**

- `POSTMARK_SERVER_TOKEN`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_SUBJECT_PREFIX` (optional; defaults to `[keko-figueroa.dev]`)

**Turnstile**

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_ENABLED` (`true` in production; `false` or unset locally to skip captcha)

### Local dev behavior

- `TURNSTILE_ENABLED` false/missing → captcha verification skipped (warning logged)
- `POSTMARK_SERVER_TOKEN` missing → friendly on-page error; payload logged, app does not crash

### Verification checklist

Copy this when testing locally or after deploy (full detail in `docs/deploy.md`):

- [ ] Happy path: submit form → email arrives at `CONTACT_TO_EMAIL`
- [ ] Reply-To header points to the visitor's email
- [ ] Turnstile enforced (when enabled): missing/invalid token blocks send with on-page error
- [ ] Rate limit: repeated submissions from same IP return friendly 429 / on-page message
- [ ] Honeypot: filling hidden `company` field shows success but does not send email

## Deploy Notes (Render + Cloudflare)

- Render starts via `Procfile`:
  - `web: gunicorn --bind 0.0.0.0:$PORT app:app`
- Python version comes from `runtime.txt`
- Cloudflare fronts the custom domain and TLS

See detailed deployment checklist in `docs/deploy.md`.

## Additional Docs

- `docs/architecture.md` — app structure and responsibilities
- `docs/content-model.md` — PROJECTS/POSTS schema
- `docs/deploy.md` — Render + Cloudflare checklist
- `docs/decisions/` — short ADRs (why this architecture)

## License

MIT — see [LICENSE](LICENSE)
