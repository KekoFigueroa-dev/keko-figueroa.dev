# Architecture

## Overview

This portfolio is a server-rendered Flask app designed for speed and low complexity.

## Structure

- `app.py` — routes + in-memory content (`PROJECTS`, `POSTS`)
- `templates/` — Jinja templates for pages and shared layout
- `static/styles.css` — visual system (matrix/terminal aesthetic)
- `static/js/terminal.js` — lazy-loaded console (first `c` press); games under `static/js/terminal/games/`
- `Procfile` + `runtime.txt` — Render runtime configuration

## Request flow

1. Request hits Flask route in `app.py`
2. Route renders a Jinja template with content from in-memory structures
3. Template uses shared `base.html` shell (nav/footer/theme)
4. CSS from `static/styles.css` styles the page

## Content locations

- Projects: `PROJECTS` in `app.py`
- Blog posts: `POSTS` in `app.py`

No database or CMS is used by design.
