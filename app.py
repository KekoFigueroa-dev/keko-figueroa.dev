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
        "title": "DEUNA Payments Flow",
        "status": "public",
        "oneliner": (
            "A payments integration + troubleshooting exercise documenting request "
            "shapes and a data-first RCA approach."
        ),
        "live_url": None,
        "repo_url": "https://github.com/KekoFigueroa-dev/DEUNA-payments-flow",
        "key_points": [
            "requests/ folder: step-by-step HTTP requests for main payment flow",
            "sql/ folder: example queries for declines, incident windows, V2 failure patterns",
            "Troubleshooting guide: DEUNA → PSP → issuer/network",
        ],
        "what": (
            "A docs-first payments integration reference that maps the full request "
            "lifecycle—from authorization to settlement—and provides SQL queries for "
            "incident investigation."
        ),
        "key_decisions": [
            "Organize by payment flow step, not by API endpoint alphabetically.",
            "Pair every request example with the expected response shape and failure modes.",
            "SQL queries target real incident patterns: declines, V2 failures, time windows.",
        ],
        "shipped": [
            "Step-by-step HTTP request collection for the main payment flow.",
            "Example SQL for decline analysis and incident window queries.",
            "Troubleshooting guide covering DEUNA → PSP → issuer/network chain.",
        ],
        "next": [
            "Webhook replay scenarios and idempotency key examples.",
            "Settlement reconciliation query templates.",
        ],
    },
    {
        "slug": "token-e-sports-betting",
        "title": "token_e-sports_betting",
        "status": "in_progress",
        "oneliner": (
            "Sandbox e-sports betting MVP proving wallet + betting + settlement, "
            "designed to be payment-ready with Nuvei (test mode) from day one."
        ),
        "live_url": None,
        "repo_url": "https://github.com/KekoFigueroa-dev/token_e-sports_betting",
        "key_points": [
            "Next.js + TypeScript; Django + DRF; Postgres; GRID Open Access API; Nuvei (test mode)",
            "Ledger-based wallet",
            "Idempotency",
            "Traceability",
        ],
        "what": (
            "A sandbox e-sports betting MVP that proves the full money loop—wallet, "
            "bet placement, settlement—built payment-ready from day one."
        ),
        "key_decisions": [
            "Ledger-based wallet for auditability over simple balance fields.",
            "Idempotency keys on all money-moving operations.",
            "Nuvei test-mode integration planned from the architecture phase.",
        ],
        "shipped": [],
        "next": [
            "Wallet ledger schema and deposit/withdraw flows.",
            "Bet placement with GRID Open Access API integration.",
            "Settlement engine and Nuvei test-mode hookup.",
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
