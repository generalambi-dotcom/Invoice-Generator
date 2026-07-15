-- Email lifecycle preferences and delivery observability.
CREATE TABLE IF NOT EXISTS "EmailPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lifecycleEmails" BOOLEAN NOT NULL DEFAULT true,
  "weeklySummary" BOOLEAN NOT NULL DEFAULT true,
  "productUpdates" BOOLEAN NOT NULL DEFAULT false,
  "marketingConsentAt" TIMESTAMP(3),
  "unsubscribeToken" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailPreference_userId_key" ON "EmailPreference"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "EmailPreference_unsubscribeToken_key" ON "EmailPreference"("unsubscribeToken");
CREATE INDEX IF NOT EXISTS "EmailPreference_unsubscribeToken_idx" ON "EmailPreference"("unsubscribeToken");

ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "bouncedAt" TIMESTAMP(3);
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "complainedAt" TIMESTAMP(3);
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "clickedAt" TIMESTAMP(3);
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "providerMessageId" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "dedupeKey" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "templateKey" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS "EmailLog_providerMessageId_key" ON "EmailLog"("providerMessageId");
CREATE UNIQUE INDEX IF NOT EXISTS "EmailLog_dedupeKey_key" ON "EmailLog"("dedupeKey");

ALTER TABLE "InvoiceReminderSettings" ALTER COLUMN "enableEmail" SET DEFAULT false;
CREATE INDEX IF NOT EXISTS "EmailLog_providerMessageId_idx" ON "EmailLog"("providerMessageId");
