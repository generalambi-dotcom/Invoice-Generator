-- Expense tracking table
CREATE TABLE IF NOT EXISTS "Expense" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
  "userId"      TEXT NOT NULL,
  "amount"      DOUBLE PRECISION NOT NULL,
  "currency"    TEXT NOT NULL DEFAULT 'NGN',
  "category"    TEXT NOT NULL,
  "date"        TIMESTAMP(3) NOT NULL,
  "description" TEXT NOT NULL,
  "vendor"      TEXT,
  "notes"       TEXT,
  "receiptUrl"  TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Expense_userId_idx"      ON "Expense"("userId");
CREATE INDEX IF NOT EXISTS "Expense_category_idx"    ON "Expense"("category");
CREATE INDEX IF NOT EXISTS "Expense_date_idx"        ON "Expense"("date");
CREATE INDEX IF NOT EXISTS "Expense_userId_date_idx" ON "Expense"("userId", "date");

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
