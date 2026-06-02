import os
from datetime import datetime, timezone

import requests
from flask import Flask, abort, jsonify, render_template, request
from flask_limiter import Limiter

app = Flask(__name__)

CONTACT_INTENTS = [
    "Work opportunity",
    "Project question",
    "Writing/speaking",
    "Other",
]

POSTMARK_API_URL = "https://api.postmarkapp.com/email"
TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def _client_ip() -> str:
    """Client IP for rate limits and audit trail.

    Cloudflare sets CF-Connecting-IP; Render/proxies may set X-Forwarded-For
    (first hop only — leftmost is the original client).
    """
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip.strip()
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


limiter = Limiter(
    key_func=_client_ip,
    app=app,
    default_limits=[],
    storage_uri="memory://",
)

# Project content is intentionally in code (static-first). Keep slugs stable for URLs.
PROJECTS = [
    {
        "slug": "keko-figueroa-dev-portfolio",
        "title": "keko-figueroa.dev",
        "type": "this_site",
        "status_label": "Live",
        "short_summary": (
            "This repo and live site: Flask/Jinja SSR, hardened contact pipeline, "
            "and a retro-style in-page terminal with themes and a lazy-loaded snake game—"
            "all without a CMS or database."
        ),
        "oneliner": (
            "A production portfolio that proves static-first back-end craft: "
            "server-rendered pages, layered bot protection on contact, and an optional "
            "terminal overlay that ships real engineering, not just CSS."
        ),
        "live_url": "https://keko-figueroa.dev",
        "repo_url": "https://github.com/KekoFigueroa-dev/keko-figueroa.dev",
        "repo_label": "Repo",
        "key_points": [
            "SSR: Flask + Jinja, in-memory PROJECTS/POSTS, Gunicorn on Render + Cloudflare",
            "Contact: Postmark HTTP API, Turnstile, Flask-Limiter (IP), honeypot field",
            "Terminal: lazy-loaded overlay, virtual cd/ls/open, 4 themes, canvas snake (B1)",
        ],
        "problem": (
            "Most portfolios optimize for visuals and hide how things are built. I needed "
            "a site that is fast on first paint, cheap to operate, honest about trade-offs, "
            "and deep enough that a back-end or fintech reviewer can see real system thinking—"
            "including where money-adjacent patterns (idempotency, abuse resistance) show up."
        ),
        "what_it_is": (
            "A server-rendered personal site and living engineering notebook. The same "
            "codebase hosts project case studies, a static-first blog, a production contact "
            "form, and an optional retro-style terminal console overlay. The terminal is "
            "enhancement-only: every route works with JavaScript disabled; the overlay lazy-loads "
            "on first `c` and can run a canvas snake game without polluting the initial bundle."
        ),
        "constraints": [
            "No database or CMS—content is Python data structures reviewed in git.",
            "Minimal JavaScript: zero terminal/game code on first load; lazy-load per feature.",
            "Contact must resist bots without storing submissions in-app (mailbox is the record).",
            "Deploy footprint must stay small (Render web service + Cloudflare DNS/TLS).",
            "Terminal must not hijack keyboard focus outside the overlay or break form inputs.",
        ],
        "architecture": (
            "Flask serves Jinja templates with shared layout and theme tokens in CSS. "
            "`PROJECTS` and `POSTS` in `app.py` drive cards, detail pages, and a JSON `site_index` "
            "embedded for the terminal. Contact posts to a Flask route that verifies Turnstile, "
            "applies per-IP rate limits, checks a honeypot, and sends mail via Postmark. "
            "The terminal loads from `static/js/terminal.js` on demand; games use a small host "
            "under `static/js/terminal/games/` with one script per title."
        ),
        "architecture_points": [
            "Runtime: Python 3.12, Flask, Gunicorn (`Procfile`), `/health` JSON probe",
            "Hosting: Render web service; Cloudflare for DNS, TLS, Turnstile widget",
            "Content: `PROJECTS`, `POSTS`, `SITE_PAGES` in `app.py`; templates in `templates/`",
            "Contact: `POST /contact` → Turnstile verify → Flask-Limiter → Postmark API",
            "Terminal (Ship A): overlay UI, command parser, virtual cwd, `localStorage` layout + theme",
            "Games (Ship B1): `KekoGameHost` + `snake` factory; full-body canvas; wrap-around edges",
            "Docs: ADRs `0001`–`0009`, deploy/testing checklists under `docs/`",
        ],
        "key_decisions": [
            "Flask/Jinja over SPA—first render is HTML; no client router or hydration tax.",
            "Postmark API instead of SMTP on Render—fewer moving parts, better deliverability.",
            "Layered abuse controls: Turnstile (when enabled), IP rate limits, honeypot silent drop.",
            "Terminal lazy-loaded on `c`—baseline pages stay free of console logic.",
            "Game host interface + per-game scripts—Ship B2/B3 can ship without refactoring Ship A.",
            "Themes via `data-theme` on `<html>` and CSS variables—terminal `theme set` persists.",
            "Architecture decisions recorded as short ADRs, not wiki sprawl.",
        ],
        "what_shipped": [
            "Phase 1: deployable scaffold, `/health`, `runtime.txt`, Render + Cloudflare wiring.",
            "Phase 2: home, projects, blog, about, contact shell; matrix-green design system; project detail template with pager.",
            "Phase 3: Postmark-powered `POST /contact` with Reply-To visitor email; Cloudflare Turnstile (managed mode); Flask-Limiter (per-IP minute/hour caps); honeypot field; env-gated local dev skip.",
            "Phase 3 docs: ADRs for Postmark, Turnstile/rate-limit, deploy and testing checklists.",
            "Phase 4 Ship A: press `c` or navbar hint → draggable/dockable terminal; commands help, clear, close, history, ls, cd, open, projects, theme list/set; layout + theme in `localStorage`; `prefers-reduced-motion` respected.",
            "Phase 4 Ship B1: `snake` command → lazy-load game host + snake; full-terminal play mode; wrap-around walls; theme-accent rendering; score on game over; clean teardown on quit/close.",
        ],
        "what_next": [
            "Phase 2.5: hero visual slidedeck (blocked on artwork; see `AGENTS.md`).",
            "Phase 4 Ship B2/B3: invaders and tetris via the same game host (separate ships).",
            "Ongoing: deeper case-study copy on other projects; blog posts as they ship.",
        ],
        "notes": [
            "Try it live: press `c`, run `help`, `theme list`, or `snake`.",
            "Implementation checklists: `docs/testing.md`. Security/delivery ADRs: `docs/decisions/0005`–`0009`.",
        ],
    },
    {
        "slug": "matrix-themed-sprint-planner",
        "title": "Matrix-themed Sprint Planner",
        "type": "deployed",
        "status_label": "Shipped",
        "short_summary": (
            "A production-depth sprint planner for small teams with deliberate "
            "design, clear permissions, and real multi-user workflows."
        ),
        "oneliner": (
            "A production-depth sprint planner for small teams with a deliberate "
            "design system and a real permission model."
        ),
        "live_url": "https://matrix-themed-sprint-planner.vercel.app",
        "repo_url": "https://github.com/KekoFigueroa-dev/matrix-themed-sprint-planner",
        "key_points": [
            "React + TypeScript (CRA)",
            "Supabase Auth + Postgres + RLS (permissions enforced at data layer)",
            "Domain model: Workspace → Project → Sprint → Task",
        ],
        "problem": (
            "Small teams often run planning in tools that look good in demos but "
            "break down on roles, accountability, and data integrity."
        ),
        "what_it_is": (
            "A sprint planner focused on production realities: role-aware access, "
            "clear data model boundaries, and docs that make onboarding/review fast."
        ),
        "constraints": [
            "Multi-user permissions had to be enforceable beyond UI state.",
            "MVP needed enough depth to demonstrate end-to-end product judgment.",
            "Performance and developer velocity had to stay practical on Vercel + Supabase.",
        ],
        "architecture": (
            "Client-heavy app on React/TypeScript with Supabase Auth + Postgres as "
            "source of truth; permission boundaries enforced through RLS and RPC patterns."
        ),
        "architecture_points": [
            "Frontend: React + TypeScript (CRA)",
            "Backend/data: Supabase Auth + Postgres + RLS",
            "Core domain: Workspace → Project → Sprint → Task",
        ],
        "key_decisions": [
            "RLS policies enforce workspace roles at the database layer, not just the UI.",
            "Workspace bootstrap handled via RPC for atomic setup.",
            "Documentation ships with code (specs, permission matrix, QA guides).",
        ],
        "what_shipped": [
            "Role-based auth and multi-user workspace support.",
            "Sprint/task flows with robust project hierarchy.",
            "Polished matrix visual system and reviewer-friendly docs.",
        ],
        "what_next": [
            "Velocity/burndown insights for planning quality.",
            "More team automation hooks around sprint lifecycle events.",
        ],
    },
    {
        "slug": "token-e-sports-betting",
        "title": "token_e-sports_betting (Token_name_esports)",
        "terminal_aliases": ["Token_name_esports", "token_name_esports"],
        "type": "private",
        "status_label": "In progress",
        "short_summary": (
            "Sandbox-first e-sports betting MVP validating wallet + betting + "
            "settlement while keeping payments architecture production-ready."
        ),
        "oneliner": (
            "Sandbox e-sports betting MVP built to prove the core loop (wallet + "
            "betting + settlement) while keeping the system payment-ready from day one."
        ),
        "live_url": None,
        # Private repository: no public URL by design.
        "repo_url": None,
        "repo_label": "Private repo",
        "key_points": [
            "Sandbox-first tokens (not real money, not crypto, not withdrawable cash)",
            "Nuvei included as orchestrator from day one in test mode",
            "Monorepo with frontend/, django-backend/, docs/, infra/",
        ],
        "problem": (
            "Betting MVPs often prototype too quickly, then need painful rewrites when "
            "wallet and payment constraints become real."
        ),
        "what_it_is": (
            "A sandbox e-sports betting MVP to prove the full loop—wallet, betting, "
            "settlement—while preserving a path to production payments."
        ),
        "constraints": [
            "Sandbox-first launch only (no real funds).",
            "Needs payment-grade controls even before go-live.",
            "Must remain implementation-friendly as a solo build.",
        ],
        "architecture": (
            "Split web and API apps in a monorepo, with payment and data contracts "
            "documented early to avoid cornering future production rollout."
        ),
        "architecture_points": [
            "Frontend: Next.js + TypeScript",
            "Backend: Django + Django REST Framework",
            "Auth: Django sessions",
            "Database: PostgreSQL",
            "Match data (initial): GRID Open Access API",
            "Payments orchestrator: Nuvei (test mode from early MVP)",
            "Repo shape: frontend/ + django-backend/ + docs/ + infra/",
        ],
        "key_decisions": [
            "Treat internal tokens as test units only (no real money semantics).",
            "Model payment orchestration early with Nuvei test mode, not as a late integration.",
            "Design wallet and settlement flows for traceability from day one.",
        ],
        "what_shipped": [
            "Core architecture skeleton and contracts for wallet + betting loop.",
            "Sandbox-first operational framing and payments integration plan.",
        ],
        "what_next": [
            "Public write-up and screenshots once milestones stabilize.",
            "Incremental hardening of ledger/idempotency/reconciliation paths.",
        ],
        "notes": [
            "Private repo — summary available here, details on request.",
            "Current state: in progress (active build).",
        ],
    },
    {
        "slug": "deuna-payments-flow",
        "title": "DEUNA Payments Flow (Case Study)",
        "type": "case_study",
        "status_label": "Case study",
        "short_summary": (
            "A documentation-first payments integration + troubleshooting case "
            "study focused on orchestrator mishaps and practical RCA."
        ),
        "oneliner": (
            "A documentation-first payments integration + troubleshooting case study—"
            "meant to help teams navigate the common mishaps of working with a "
            "payment orchestrator."
        ),
        "live_url": None,
        "repo_url": "https://github.com/KekoFigueroa-dev/DEUNA-payments-flow",
        "repo_label": "Repo",
        "key_points": [
            "Core flow request shapes (user → auth → order → purchase v1/v2 → refund)",
            "Failure map: sandbox inconsistencies, schema mismatches, PSP/issuer declines",
            "Data-first RCA with SQL analysis patterns",
        ],
        "problem": (
            "Teams integrating with orchestrators often lose time in ambiguous docs, "
            "inconsistent sandbox behavior, and unclear failure ownership."
        ),
        "what_it_is": (
            "A documentation-first case study and playbook for integration and "
            "troubleshooting workflows around DEUNA and downstream providers."
        ),
        "constraints": [
            "Must stay practical for operators under incident pressure.",
            "Needs to be useful without a full product UI around it.",
            "Has to connect request shapes with real-world failure diagnostics.",
        ],
        "architecture": (
            "Structured docs + request collections + SQL examples, organized as an "
            "operational troubleshooting reference instead of a deployed app."
        ),
        "architecture_points": [
            "requests/: step-by-step flow examples",
            "sql/: incident and decline analysis queries",
            "troubleshooting guide: DEUNA → PSP → issuer/network",
        ],
        "key_decisions": [
            "Treat this as a case study/playbook, not a deployed checkout.",
            "Organize by end-to-end flow sequence, not endpoint catalog.",
            "Pair request examples with failure patterns and RCA queries.",
        ],
        "what_shipped": [
            "Step-by-step request-shape guidance for core payment/refund flow.",
            "Common failure scenarios and where to investigate first.",
            "SQL templates for declines, incident windows, and V2 anomalies.",
        ],
        "what_next": [
            "Expand webhook replay and idempotency troubleshooting.",
            "Add deeper reconciliation templates for settlement operations.",
        ],
        "notes": [
            "This repo is a case study and playbook. It is not a deployed payment app.",
            "Purpose: help teams navigate common mishaps when integrating with a payment orchestrator.",
        ],
    },
]

POSTS = [
    {
        "slug": "idempotency-isnt-optional-in-fintech-systems",
        "title": "Idempotency isn't optional in fintech systems",
        "date": "2026-05-15",
        "excerpt": (
            "Why every money-moving endpoint needs an idempotency key—and what "
            "breaks when you skip it."
        ),
        "body": [
            (
                "In fintech, the same request can arrive twice: network retries, "
                "user double-clicks, webhook replays. Without idempotency, you "
                "charge twice, settle twice, or credit twice."
            ),
            (
                "The fix is straightforward: accept an idempotency key on every "
                "state-changing endpoint. Store the key with the result. On "
                "duplicate, return the stored result—don't re-execute."
            ),
            (
                "This isn't edge-case handling. It's the baseline contract for "
                "any API that moves money. Design it in from day one; retrofitting "
                "is painful and error-prone."
            ),
        ],
    },
    {
        "slug": "designing-a-ledger-wallet-auditability-first",
        "title": "Designing a ledger wallet: auditability first",
        "date": "2026-05-01",
        "excerpt": (
            "Why a balance column isn't enough—and how double-entry thinking "
            "pays off in debugging and compliance."
        ),
        "body": [
            (
                "A wallet with a single balance field is simple until something "
                "goes wrong. Where did the money go? When? Why is the balance "
                "off by $0.01?"
            ),
            (
                "A ledger records every debit and credit as an immutable entry. "
                "Balance is derived, not stored. You can replay history, audit "
                "any transaction, and reconcile against external systems."
            ),
            (
                "The tradeoff is schema complexity and write volume. For any "
                "system where money moves and regulators ask questions, "
                "auditability first is the right default."
            ),
        ],
    },
    {
        "slug": "pragmatic-rag-moving-data-safely-between-services",
        "title": "Pragmatic RAG: moving data safely between services",
        "date": "2026-04-18",
        "excerpt": (
            "Combining services with retrieval-augmented generation—without "
            "leaking data or hallucinating answers."
        ),
        "body": [
            (
                "RAG shines when you need to combine knowledge from multiple "
                "sources into a coherent answer. The risk is pulling in data "
                "the user shouldn't see, or generating confident nonsense."
            ),
            (
                "Pragmatic RAG starts with strict retrieval boundaries: scope "
                "embeddings per tenant, filter at query time, and never trust "
                "the model to self-censor."
            ),
            (
                "I like building agents that orchestrate APIs and RAG pipelines "
                "where data boundaries are enforced at the retrieval layer—not "
                "hoped for in the prompt."
            ),
        ],
    },
]

NAV_LINKS = [
    ("Home", "home"),
    ("Projects", "projects"),
    ("Blog", "blog"),
    ("About", "about"),
    ("Contact", "contact"),
]

# Terminal `ls` / `cd` — static pages (projects come from PROJECTS).
SITE_PAGES = [
    {"name": "home", "path": "/"},
    {"name": "projects", "path": "/projects"},
    {"name": "blog", "path": "/blog"},
    {"name": "about", "path": "/about"},
    {"name": "contact", "path": "/contact"},
]


@app.context_processor
def inject_globals():
    static_dir = app.static_folder or "static"
    profile_file = (
        "profile.jpg"
        if os.path.isfile(os.path.join(static_dir, "profile.jpg"))
        else "profile.svg"
    )
    return {
        "nav_links": NAV_LINKS,
        "site_name": "Keko-Figueroa.Dev",
        "site_email": "keko@keko-figueroa.dev",
        "site_github": "https://github.com/KekoFigueroa-dev",
        "site_linkedin": "https://www.linkedin.com/in/sergio-figueroa-98a9112b4/",
        "hero_prompt": "keko@keko-figueroa.dev:~$ whoami",
        "profile_file": profile_file,
        "site_index": {
            "pages": SITE_PAGES,
            "projects": [
                {
                    "slug": project["slug"],
                    "title": project["title"],
                    "aliases": project.get("terminal_aliases", []),
                }
                for project in PROJECTS
            ],
            "posts": [
                {"slug": post["slug"], "title": post["title"]}
                for post in POSTS
            ],
        },
    }


@app.route("/")
def home():
    return render_template("home.html", projects=PROJECTS, posts=POSTS[:3])


@app.route("/projects")
def projects():
    return render_template("projects.html", projects=PROJECTS)


@app.route("/projects/<slug>")
def project_detail(slug):
    # Unknown slugs intentionally return the global 404 template.
    project_index = next((i for i, p in enumerate(PROJECTS) if p["slug"] == slug), None)
    if project_index is None:
        abort(404)
    project = PROJECTS[project_index]
    prev_project = PROJECTS[project_index - 1] if project_index > 0 else None
    next_project = PROJECTS[project_index + 1] if project_index < len(PROJECTS) - 1 else None
    return render_template(
        "project_detail.html",
        project=project,
        prev_project=prev_project,
        next_project=next_project,
    )


@app.route("/about")
def about():
    return render_template("about.html")


def _turnstile_enabled() -> bool:
    return os.environ.get("TURNSTILE_ENABLED", "").lower() in ("true", "1", "yes")


def _turnstile_active() -> bool:
    return _turnstile_enabled() and bool(os.environ.get("TURNSTILE_SITE_KEY"))


def _verify_turnstile(token: str) -> tuple[bool, str | None]:
    """Server-side Turnstile check — client tokens are never trusted alone."""
    if not _turnstile_enabled():
        app.logger.warning("Turnstile verification skipped (TURNSTILE_ENABLED is false or missing)")
        return True, None

    secret = os.environ.get("TURNSTILE_SECRET_KEY")
    if not secret:
        app.logger.warning("Turnstile enabled but TURNSTILE_SECRET_KEY is missing")
        return False, "Security check unavailable. Please try again later."

    if not token:
        return False, "Please complete the security check."

    try:
        response = requests.post(
            TURNSTILE_VERIFY_URL,
            data={"secret": secret, "response": token, "remoteip": _client_ip()},
            timeout=10,
        )
        data = response.json()
    except requests.RequestException:
        app.logger.warning("Turnstile verification request failed")
        return False, "Security check failed. Please try again."

    if not data.get("success"):
        error_codes = data.get("error-codes", [])
        app.logger.warning("Turnstile verification failed: %s", error_codes)
        return False, "Security check failed. Please try again."

    return True, None


def _validate_contact_form(form: dict) -> str | None:
    name = (form.get("name") or "").strip()
    email = (form.get("email") or "").strip()
    intent = (form.get("intent") or "").strip()
    message = (form.get("message") or "").strip()

    if not name or len(name) > 120:
        return "Please enter a name (max 120 characters)."
    if not email or len(email) > 254 or "@" not in email:
        return "Please enter a valid email address."
    if intent not in CONTACT_INTENTS:
        return "Please select an intent."
    if not message or len(message) < 10 or len(message) > 5000:
        return "Please enter a message (10–5000 characters)."
    return None


def _send_contact_email(name: str, email: str, intent: str, message: str) -> bool:
    """Send via Postmark: From=verified domain, Reply-To=visitor (so replies reach them)."""
    token = os.environ.get("POSTMARK_SERVER_TOKEN")
    from_email = os.environ.get("CONTACT_FROM_EMAIL")
    to_email = os.environ.get("CONTACT_TO_EMAIL")
    subject_prefix = os.environ.get("CONTACT_SUBJECT_PREFIX", "[keko-figueroa.dev]")

    if not token or not from_email or not to_email:
        app.logger.warning(
            "Postmark not configured; contact message not sent (name=%r email=%r intent=%r message_len=%d)",
            name,
            email,
            intent,
            len(message),
        )
        return False

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    text_body = (
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Intent: {intent}\n"
        f"Message:\n{message}\n\n"
        f"---\n"
        f"Timestamp: {timestamp}\n"
        f"IP: {_client_ip()}\n"
        f"User-Agent: {request.headers.get('User-Agent', 'unknown')}\n"
    )

    try:
        response = requests.post(
            POSTMARK_API_URL,
            headers={
                "X-Postmark-Server-Token": token,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "From": from_email,
                "To": to_email,
                "ReplyTo": email,
                "Subject": f"{subject_prefix} {intent} — {name}",
                "TextBody": text_body,
            },
            timeout=10,
        )
    except requests.RequestException:
        app.logger.warning("Postmark request failed for contact submission")
        return False

    if not response.ok:
        app.logger.warning("Postmark returned HTTP %s", response.status_code)
    return response.ok


def _contact_page_context(
    form_values=None,
    form_success=False,
    form_error=None,
):
    if form_values is None:
        form_values = {"name": "", "email": "", "intent": "", "message": ""}
    return {
        "contact_intents": CONTACT_INTENTS,
        "form_values": form_values,
        "form_success": form_success,
        "form_error": form_error,
        "turnstile_enabled": _turnstile_active(),
        "turnstile_site_key": os.environ.get("TURNSTILE_SITE_KEY", ""),
    }


@app.route("/contact", methods=["GET", "POST"])
@limiter.limit("5 per hour", methods=["POST"])
@limiter.limit("2 per minute", methods=["POST"])
def contact():
    """Contact flow: validate → bot checks → rate limit → Postmark send → friendly UX."""
    form_values = {"name": "", "email": "", "intent": "", "message": ""}
    form_success = False
    form_error = None

    if request.method == "POST":
        form_values = {
            "name": (request.form.get("name") or "").strip(),
            "email": (request.form.get("email") or "").strip(),
            "intent": (request.form.get("intent") or "").strip(),
            "message": (request.form.get("message") or "").strip(),
        }

        # Honeypot: pretend success so bots don't adapt; never send email.
        if (request.form.get("company") or "").strip():
            form_success = True
        else:
            validation_error = _validate_contact_form(form_values)
            if validation_error:
                form_error = validation_error
            else:
                turnstile_ok, turnstile_error = _verify_turnstile(
                    (request.form.get("cf-turnstile-response") or "").strip()
                )
                if not turnstile_ok:
                    form_error = turnstile_error
                elif not _send_contact_email(
                    form_values["name"],
                    form_values["email"],
                    form_values["intent"],
                    form_values["message"],
                ):
                    form_error = (
                        "Email is temporarily unavailable. "
                        "Please try again later."
                    )
                else:
                    form_success = True
                    form_values = {"name": "", "email": "", "intent": "", "message": ""}

    return render_template(
        "contact.html",
        **_contact_page_context(form_values, form_success, form_error),
    )


@app.errorhandler(429)
def rate_limit_exceeded(_error):
    if request.endpoint == "contact":
        return (
            render_template(
                "contact.html",
                **_contact_page_context(
                    form_error=(
                        "Too many messages from this address. "
                        "Please try again later."
                    ),
                ),
            ),
            429,
        )
    return _error.get_response()


@app.route("/blog")
def blog():
    return render_template("blog.html", posts=POSTS)


@app.route("/blog/<slug>")
def blog_post(slug):
    post = next((p for p in POSTS if p["slug"] == slug), None)
    if post is None:
        abort(404)
    return render_template("blog_post.html", post=post)


@app.route("/health")
def health():
    return jsonify(status="ok")


@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404
