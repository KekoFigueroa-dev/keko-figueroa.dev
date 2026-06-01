# ADR 0004: Deploy on Render + Cloudflare

## Context

The site needs simple deployment, health monitoring, and straightforward DNS/SSL management.

## Decision

Use Render for app hosting and Cloudflare for DNS and edge TLS.

## Consequences

- Quick deploy workflow for Python services
- Clear separation between app runtime and domain control
- Dependency on managed platform conventions (`Procfile`, `$PORT`, dashboard-based rollbacks)
