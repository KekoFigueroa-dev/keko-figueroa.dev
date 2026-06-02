# Deploy Checklist (Render + Cloudflare)

## Render

1. Create/verify a Render Web Service pointing to this repository.
2. Confirm Render uses:
   - `runtime.txt` for Python version
   - `Procfile` start command:
     - `web: gunicorn --bind 0.0.0.0:$PORT app:app`
3. Set environment variables (see [Contact form env vars](#contact-form-env-vars-render)).
4. Trigger deploy from latest `main`.
5. Confirm service health at:
   - `/health` returns `{"status":"ok"}`

## Cloudflare

1. Ensure DNS points custom domain to Render target.
2. Verify SSL/TLS is active for `keko-figueroa.dev`.
3. Confirm site and route availability over HTTPS.
4. Configure Turnstile (see [Cloudflare Turnstile setup](#cloudflare-turnstile-setup)).

## Contact form env vars (Render)

| Variable | Purpose |
|---|---|
| `POSTMARK_SERVER_TOKEN` | Postmark server API token |
| `CONTACT_TO_EMAIL` | Inbox that receives submissions |
| `CONTACT_FROM_EMAIL` | Verified Postmark sender (e.g. `contact@keko-figueroa.dev`) |
| `CONTACT_SUBJECT_PREFIX` | Email subject prefix (e.g. `[keko-figueroa.dev]`) |
| `TURNSTILE_SITE_KEY` | Turnstile widget site key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile secret for server-side verification |
| `TURNSTILE_ENABLED` | `true` in production |

Do not commit values. Set them in the Render dashboard only.

## Cloudflare Turnstile setup

1. In Cloudflare dashboard → **Turnstile** → **Add widget**.
2. **Widget mode:** Managed (invisible/challenge as Cloudflare decides).
3. **Hostnames:** `keko-figueroa.dev` (add `www.keko-figueroa.dev` if you serve www).
4. Copy **Site key** → Render `TURNSTILE_SITE_KEY`.
5. Copy **Secret key** → Render `TURNSTILE_SECRET_KEY`.
6. Set `TURNSTILE_ENABLED=true` on Render and redeploy.

The contact template loads the Turnstile script only when `TURNSTILE_ENABLED` is true and a site key is present. The server verifies the `cf-turnstile-response` token on every POST.

## Terminal console (no extra deploy config)

Ship A + B1 ship as static assets (`static/js/terminal.js`, `static/js/terminal/games/*`). No Render env vars. Lazy-loaded in the browser; safe to verify after any deploy via `docs/testing.md`.

## Smoke test after deploy

- `/` — featured projects: portfolio → sprint planner → token → DEUNA (last)
- `/projects` — same order; DEUNA labeled **Case study**
- `/projects/<slug>` for each slug
- `/blog`, `/about`, `/contact`
- `/health` → `{"status":"ok"}`
- Optional: `c` → `snake` on production

## Contact form verification checklist

Run after deploy (or locally with env vars set). See also ADRs `0005-contact-form-postmark.md` and `0006-bot-protection-turnstile-rate-limit.md`.

### Happy path

1. Open `/contact`, fill name, email, intent, message.
2. Complete Turnstile (when enabled).
3. Submit → on-page success message.
4. Confirm email arrives at `CONTACT_TO_EMAIL`.
5. Confirm **Reply-To** is the visitor email (reply should go to them, not `CONTACT_FROM_EMAIL`).

### Turnstile enforced

With `TURNSTILE_ENABLED=true`:

1. Submit without completing the widget (or with an empty token) → on-page error: security check failed / complete the check.
2. Server logs Turnstile failure reason codes (no secrets printed).

Local dev: set `TURNSTILE_ENABLED=false` (or unset) to skip verification; a warning is logged.

### Rate limiting

From the same IP, submit valid requests repeatedly:

1. More than **2 per minute** or **5 per hour** → HTTP 429 with friendly on-page message.
2. No stack trace exposed to the user.

### Honeypot

1. Fill the hidden `company` field (via devtools or scripted POST).
2. Response shows success.
3. No email is sent (check inbox / Postmark activity).

### Postmark unavailable (local)

Unset `POSTMARK_SERVER_TOKEN` locally:

1. Submit valid form → "Email is temporarily unavailable."
2. App logs submission payload (no crash).

## Rollback note

If a deploy regresses rendering, redeploy the previous Render successful commit from dashboard history, then investigate locally before next push.
