# ADR 0001: Keep Flask + Jinja

## Context

This portfolio mostly serves static-ish content (projects, writing, profile) with low runtime complexity.

## Decision

Use Flask + Jinja server rendering instead of a JS-heavy SPA framework.

## Consequences

- Faster first render and simpler hosting model
- Easier maintenance and fewer client-side failure modes
- Less front-end dynamism out of the box (acceptable for this project)
