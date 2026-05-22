-- Two-Factor Authentication fields on User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "twoFactorSecret"  TEXT;
