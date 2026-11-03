# CODIS persistent memory: implementation plan

## Goal
Give CODIS durable, user-controlled memory across devices without mixing users' data or treating arbitrary conversation text as trusted instructions.

## Current state
- Chat history is stored locally on the Android device.
- The backend has no persistent database and no user authentication.
- Therefore, the backend must not yet accept or return private long-term memories.

## Foundation added
The first PostgreSQL migration creates:
- `codis_users`: maps a verified identity-provider subject to an internal user ID.
- `codis_memories`: stores bounded memory records, categories, provenance, timestamps, and soft deletion.
- indexes for per-user recent and category retrieval.

## Required before enabling memory endpoints
1. Choose and configure an authentication provider.
2. Verify access tokens server-side; never trust a user ID supplied by the client.
3. Derive the internal user ID from the verified token on every request.
4. Enforce per-user filtering on every read, update, and delete.
5. Add explicit memory controls: view, add, edit, delete, and disable.
6. Treat retrieved memories as untrusted context, not system instructions.
7. Add tests proving one user cannot read or change another user's memories.
8. Configure database backups/retention and document deletion behavior.

## Deployment decision
Do not provision a temporary/free database as permanent storage: it may have expiry or retention limits. Do not store personal memories in Render's ephemeral service filesystem. Connect a durable PostgreSQL instance only after its plan and retention are confirmed.

## Initial data limits
- Memory content: 1–10,000 characters.
- Category: 1–64 characters.
- Metadata: at most 16 KiB.
- Soft deletion timestamp supports user recovery workflows; final deletion policy must be documented before launch.

## Next milestone
Add authenticated account access and a durable PostgreSQL connection, then implement memory APIs and cross-user isolation tests.