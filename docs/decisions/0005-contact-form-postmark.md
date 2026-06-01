# ADR 0005: Contact Form via Postmark

## Context

A `mailto:` link is unreliable for in-site contact: it depends on the visitor's mail client, offers no structured fields, and cannot be protected from abuse. We want on-page messaging without adding a database, CMS, or heavy backend.

## Decision

Send contact submissions through the Postmark HTTP API:

- **From** = `CONTACT_FROM_EMAIL` (verified sender on the domain)
- **To** = `CONTACT_TO_EMAIL` (inbox that receives submissions)
- **Reply-To** = visitor's email (so a direct reply reaches them)
- No persistence of messages in this app — Postmark delivers and the inbox is the record

Local/dev failure-safe behavior: if Postmark env vars are missing, log the payload and show a friendly "temporarily unavailable" message (no stack traces).

## Consequences

- Requires Postmark server token and verified sender domain in production
- Deliverability is better than self-hosted SMTP on a small VPS
- Submissions are not queryable from the app; ops rely on the mailbox
- See ADR 0006 for bot protection layered on the same endpoint
