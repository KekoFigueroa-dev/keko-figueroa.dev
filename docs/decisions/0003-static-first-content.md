# ADR 0003: Static-First Content in Code

## Context

Project and blog content changes infrequently and benefits from versioned review.

## Decision

Store `PROJECTS` and `POSTS` directly in `app.py` (no database/CMS).

## Consequences

- Content updates are explicit and code-reviewed
- Zero operational overhead for data infrastructure
- Non-technical content editing requires code edits
