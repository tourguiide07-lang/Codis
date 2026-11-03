-- CODIS persistent-memory foundation.
-- This migration intentionally creates storage only; no HTTP route may expose it
-- until authenticated user identity and per-user authorization are implemented.

CREATE TABLE IF NOT EXISTS codis_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider TEXT NOT NULL,
  auth_subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auth_provider, auth_subject)
);

CREATE TABLE IF NOT EXISTS codis_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES codis_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (char_length(category) BETWEEN 1 AND 64),
  content TEXT NOT NULL
    CHECK (char_length(content) BETWEEN 1 AND 10000),
  source TEXT NOT NULL DEFAULT 'conversation'
    CHECK (char_length(source) BETWEEN 1 AND 64),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (pg_column_size(metadata) <= 16384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS codis_memories_user_recent_idx
  ON codis_memories (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS codis_memories_user_category_idx
  ON codis_memories (user_id, category)
  WHERE deleted_at IS NULL;

-- Retrieval is deliberately scoped by user_id. The application must derive
-- user_id from a verified authentication token, never from request-body input.
