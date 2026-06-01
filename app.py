import os

from flask import Flask, abort, jsonify, render_template

app = Flask(__name__)

# Project content is intentionally in code (static-first). Keep slugs stable for URLs.
PROJECTS = [
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
    {
        "slug": "token-e-sports-betting",
        "title": "token_e-sports_betting (Token_name_esports)",
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
        "slug": "keko-figueroa-dev-portfolio",
        "title": "keko-figueroa.dev",
        "type": "this_site",
        "status_label": "Live",
        "short_summary": (
            "The portfolio itself: server-rendered Flask/Jinja site built for speed, "
            "clarity, and honest project storytelling."
        ),
        "oneliner": (
            "A fast, server-rendered portfolio built with Flask + Jinja to showcase "
            "back-end/data/AI work without front-end bloat."
        ),
        "live_url": "https://keko-figueroa.dev",
        "repo_url": "https://github.com/KekoFigueroa-dev/keko-figueroa.dev",
        "repo_label": "Repo",
        "key_points": [
            "Flask + Jinja + static CSS (no CMS, no database)",
            "Terminal-techy matrix aesthetic with minimal JS",
            "Content-as-code for projects and blog posts",
        ],
        "problem": (
            "Most portfolios look polished but hide technical depth. I needed one that "
            "is fast, maintainable, and explicit about engineering trade-offs."
        ),
        "what_it_is": (
            "A production-ready personal site that doubles as a case study in practical "
            "web architecture choices and clear technical communication."
        ),
        "constraints": [
            "Keep stack simple and deployment-friendly (Render + Cloudflare).",
            "Avoid DB/CMS overhead for content that changes infrequently.",
            "Preserve speed and readability across desktop and mobile.",
        ],
        "architecture": (
            "Server-rendered Flask routes with Jinja templates, static CSS for the "
            "visual system, and in-memory content models in Python."
        ),
        "architecture_points": [
            "App entry: app.py",
            "Templates: templates/",
            "Styles: static/styles.css",
            "Content source: PROJECTS + POSTS in code",
        ],
        "key_decisions": [
            "Flask/Jinja over SPA for performance, simplicity, and maintenance.",
            "Minimal JS to reduce failure modes and keep first render fast.",
            "No database; projects/posts are code-reviewed content.",
            "Deploy on Render with Cloudflare for DNS/SSL and straightforward ops.",
        ],
        "what_shipped": [
            "Phase 2: full site routes, project cards, blog, and terminal aesthetic.",
            "Phase 3: project detail pages and improved docs/ADRs.",
            "Operational baseline: /health endpoint, Render-ready config, mobile-friendly UI.",
        ],
        "what_next": [
            "Phase 2.5 hero visual slidedeck.",
            "Optional contact form with light anti-spam controls.",
            "Continuous polishing of case-study depth and writing.",
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
