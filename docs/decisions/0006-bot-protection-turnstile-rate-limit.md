# ADR 0006: Bot Protection — Turnstile, Rate Limit, Honeypot

## Context

The public contact form will be scraped and spammed. We want protection that is credible for a portfolio (showcase-worthy security) without a SPA, database, or heavy middleware.

## Decision

Layer three defenses on `POST /contact`:

1. **Cloudflare Turnstile (Managed mode)** — widget injects `cf-turnstile-response`; server verifies against `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Client tokens are never trusted alone.
2. **Flask-Limiter** — 2 submissions per minute and 5 per hour per client IP (keyed via `CF-Connecting-IP` / `X-Forwarded-For`). Returns HTTP 429 with an on-page message.
3. **Honeypot field** (`company`) — hidden from humans; if filled, respond with fake success and do not send email.

When `TURNSTILE_ENABLED` is false (typical local dev), skip captcha verification and log a warning.

## Consequences

- Contact page loads one small Turnstile script when enabled (minimal JS exception)
- Requires Turnstile site/secret keys and widget hostnames in Cloudflare dashboard
- In-memory rate limit storage resets on process restart (acceptable for a single Render instance)
- Verification failures and rate limits degrade gracefully — no stack traces to users
