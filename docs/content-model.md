# Content Model

## Projects (`PROJECTS` in `app.py`)

Each project object is expected to include:

- `slug`: URL segment for `/projects/<slug>`
- `title`: display title
- `type`: one of `deployed`, `case_study`, `private`, `this_site`
- `status_label`: short badge text
- `short_summary`: card/lead summary
- `oneliner`: concise project descriptor
- `live_url`: optional public live URL
- `repo_url`: optional public repository URL
- `repo_label`: optional label text when repo is missing/private
- `key_points`: short bullets for cards
- Detail sections:
  - `problem`
  - `what_it_is`
  - `constraints` (list)
  - `architecture`
  - `architecture_points` (list)
  - `key_decisions` (list)
  - `what_shipped` (list)
  - `what_next` (list)
  - `notes` (optional list)

### Private repo behavior

If `repo_url` is missing and `repo_label` is present, templates render a non-link badge instead of a broken/unauthorized repository link.

## Posts (`POSTS` in `app.py`)

Each post object includes:

- `slug`
- `title`
- `date`
- `excerpt`
- `body` (list of paragraph strings)

Posts are static-first and rendered at `/blog` and `/blog/<slug>`.
