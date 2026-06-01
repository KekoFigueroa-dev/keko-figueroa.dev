# Deploy Checklist (Render + Cloudflare)

## Render

1. Create/verify a Render Web Service pointing to this repository.
2. Confirm Render uses:
   - `runtime.txt` for Python version
   - `Procfile` start command:
     - `web: gunicorn --bind 0.0.0.0:$PORT app:app`
3. Trigger deploy from latest `main`.
4. Confirm service health at:
   - `/health` returns `{"status":"ok"}`

## Cloudflare

1. Ensure DNS points custom domain to Render target.
2. Verify SSL/TLS is active for `keko-figueroa.dev`.
3. Confirm site and route availability over HTTPS.

## Smoke test after deploy

- `/`
- `/projects`
- `/projects/<slug>` (all project slugs)
- `/blog`
- `/about`
- `/contact`
- `/health`

## Rollback note

If a deploy regresses rendering, redeploy the previous Render successful commit from dashboard history, then investigate locally before next push.
