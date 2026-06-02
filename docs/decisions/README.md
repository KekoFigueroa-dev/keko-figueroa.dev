# Architecture Decision Records (ADRs)

Short, durable notes on **why** we chose a path—not step-by-step how-tos.

## Format

Each ADR uses three sections:

| Section | Purpose |
|---|---|
| **Context** | Problem, constraints, or forces at play |
| **Decision** | What we chose (one clear statement) |
| **Consequences** | Tradeoffs, follow-ups, test expectations |

Number files sequentially: `0001-…`, `0002-…`, etc. Never renumber published ADRs; add a new file to supersede.

## Index

| ADR | Topic |
|---|---|
| [0001](0001-keep-flask-jinja.md) | Flask + Jinja stack |
| [0002](0002-terminal-aesthetic.md) | Terminal-techy visual language |
| [0003](0003-static-first-content.md) | In-memory PROJECTS/POSTS |
| [0004](0004-deploy-render-cloudflare.md) | Render + Cloudflare hosting |
| [0005](0005-contact-form-postmark.md) | Contact form via Postmark |
| [0006](0006-bot-protection-turnstile-rate-limit.md) | Turnstile + rate limit + honeypot |
| [0007](0007-terminal-console-overlay.md) | Phase 4 Ship A — terminal console overlay *(implemented)* |
| [0008](0008-terminal-console-games-snake.md) | Phase 4 Ship B1 — snake mini-game *(implemented)* |
| [0009](0009-terminal-console-games-framework.md) | Phase 4 Ship B — mini-game host framework *(implemented)* |
