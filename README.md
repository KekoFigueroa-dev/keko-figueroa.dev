# keko-figueroa.dev

Flask-based personal portfolio for [keko-figueroa.dev](https://keko-figueroa.dev) (Render + Cloudflare).

## Local development

```bash
python -m venv .venv
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

## Phase 1 routes

| Route     | Response                          |
|-----------|-----------------------------------|
| `GET /`   | Under construction homepage       |
| `GET /health` | JSON `{ "status": "ok" }`     |

## License

MIT — see [LICENSE](LICENSE).
