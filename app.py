import os

from flask import Flask, abort, jsonify, render_template

app = Flask(__name__)

PROJECTS = [
    {
        "slug": "matrix-themed-sprint-planner",
        "title": "Matrix-themed Sprint Planner",
        "status": "public",
        "oneliner": (
            "A production-depth sprint planner for small teams with a deliberate "
            "design system and a real permission model."
        ),
        "live_url": "https://matrix-themed-sprint-planner.vercel.app",
        "repo_url": "https://github.com/KekoFigueroa-dev/matrix-themed-sprint-planner",
        "key_points": [
            "React + TypeScript (CRA)",
            "Supabase Auth + Postgres + RLS (permissions enforced at data layer)",
            "Workspace bootstrap via RPC patterns",
            "Domain model: Workspace → Project → Sprint → Task",
            "Strong docs: spec phases, permission matrix, QA/ship guides",
        ],
        "what": (
            "A sprint planning tool for small teams that treats permissions and "
            "data integrity as first-class concerns—not afterthoughts bolted onto "
            "a UI prototype."
        ),
        "key_decisions": [
            "RLS policies enforce workspace roles at the database layer, not just the UI.",
            "RPC-based workspace bootstrap keeps onboarding atomic and auditable.",
            "Domain hierarchy (Workspace → Project → Sprint → Task) mirrors how teams actually work.",
        ],
        "shipped": [
            "Full auth flow with role-based access (owner, admin, member, viewer).",
            "Sprint board with drag-and-drop task management.",
            "Permission matrix documentation and phased spec guides.",
        ],
        "next": [
            "Burndown charts and velocity tracking.",
            "Notification hooks for sprint events.",
        ],
    },
    {
        "slug": "deuna-payments-flow",
        "title": "DEUNA Payments Flow (Case Study)",
        "status": "public",
        "oneliner": (
            "A documentation-first payments integration + troubleshooting case study—"
            "meant to help teams navigate the common mishaps of working with a "
            "payment orchestrator."
        ),
        "live_url": None,
        "repo_url": "https://github.com/KekoFigueroa-dev/DEUNA-payments-flow",
        "repo_label": "Repo",
        "note": "This repo is a case study and playbook. It is not a deployed payment app.",
        "key_points": [
            "Step-by-step request shapes for the core flow (user → auth → order → purchase v1/v2 → refund)",
            "What can go wrong: sandbox inconsistencies, schema mismatches, PSP/issuer declines",
            "A data-first RCA approach using example SQL patterns",
        ],
        "what": (
            "A documentation-first integration and troubleshooting playbook for teams "
            "working with a payment orchestrator. It clarifies request/response "
            "shapes and failure investigation patterns without claiming to be a live "
            "checkout implementation."
        ),
        "key_decisions": [
            "Treat this as a case study/playbook instead of a deployed app.",
            "Organize by flow sequence (user → auth → order → purchase → refund), not endpoint list.",
            "Pair integration guidance with troubleshooting paths (DEUNA → PSP → issuer/network).",
        ],
        "shipped": [
            "Request-shape walkthroughs for core purchase and refund flow (v1/v2).",
            "Troubleshooting reference for sandbox mismatches and decline analysis.",
            "SQL examples for incident windows and root-cause analysis.",
        ],
        "next": [
            "Extend playbook with webhook replay scenarios and idempotency examples.",
            "Add deeper settlement/reconciliation templates for ops workflows.",
        ],
    },
    {
        "slug": "token-e-sports-betting",
        "title": "token_e-sports_betting (Token_name_esports)",
        "status": "in_progress",
        "oneliner": (
            "Sandbox e-sports betting MVP built to prove the core loop (wallet + "
            "betting + settlement) while keeping the system payment-ready from day one."
        ),
        "live_url": None,
        "repo_url": None,
        "repo_label": "Private repo (details on request)",
        "subtitle": (
            "Sandbox e-sports betting MVP built to prove the core loop (wallet + "
            "betting + settlement) while keeping the system payment-ready from day one."
        ),
        "note": (
            "Current state: In progress (active build). More screenshots and a "
            "public write-up will be added later."
        ),
        "key_points": [
            "Sandbox-first: test balances only at first",
            "Tokens are internal test units (not real money, not crypto, not withdrawable cash)",
            "Payments are designed around Nuvei (test mode) so going live later is a controlled step, not a rewrite",
        ],
        "what": (
            "Even if we start sandbox-only, it is crucial that we treat Nuvei as "
            "the payment orchestrator from the beginning (using test mode), so the "
            "architecture and data model don't paint us into a corner."
        ),
        "key_decisions": [
            "Frontend: Next.js + TypeScript",
            "Backend: Django + Django REST Framework",
            "Auth: Django sessions",
            "Database: PostgreSQL",
            "Match data (initial): GRID Open Access API",
            "Payments (orchestrator): Nuvei (test mode from early MVP)",
            "Repo: Monorepo (frontend/ + django-backend/)",
        ],
        "shipped": [],
        "next": [
            "frontend/ — Next.js app",
            "django-backend/ — Django app + API",
            "docs/ — product + architecture + API contracts + compliance notes",
            "infra/ — deployment/ops planning notes",
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
    }


@app.route("/")
def home():
    return render_template("home.html", projects=PROJECTS, posts=POSTS[:3])


@app.route("/projects")
def projects():
    return render_template("projects.html", projects=PROJECTS)


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


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
