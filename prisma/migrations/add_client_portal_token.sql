-- Add ClientPortalToken table for client portal access
CREATE TABLE IF NOT EXISTS "ClientPortalToken" (
  "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
  "token"          TEXT NOT NULL,
  "userId"         TEXT NOT NULL,
  "clientEmail"    TEXT NOT NULL,
  "clientName"     TEXT,
  "expiresAt"      TIMESTAMP(3) NOT NULL,
  "lastAccessedAt" TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ClientPortalToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClientPortalToken_token_key"
  ON "ClientPortalToken"("token");

CREATE INDEX IF NOT EXISTS "ClientPortalToken_token_idx"
  ON "ClientPortalToken"("token");

CREATE INDEX IF NOT EXISTS "ClientPortalToken_userId_clientEmail_idx"
  ON "ClientPortalToken"("userId", "clientEmail");

-- Foreign key to User (optional — omit if Supabase RLS handles it)
ALTER TABLE "ClientPortalToken"
  ADD CONSTRAINT "ClientPortalToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
