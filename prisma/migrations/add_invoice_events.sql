-- Invoice audit trail / event log
CREATE TABLE IF NOT EXISTS "InvoiceEvent" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
  "invoiceId"   TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "eventType"   TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "oldValue"    TEXT,
  "newValue"    TEXT,
  "actor"       TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InvoiceEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InvoiceEvent_invoiceId_idx" ON "InvoiceEvent"("invoiceId");
CREATE INDEX IF NOT EXISTS "InvoiceEvent_userId_idx"    ON "InvoiceEvent"("userId");
CREATE INDEX IF NOT EXISTS "InvoiceEvent_createdAt_idx" ON "InvoiceEvent"("createdAt");

ALTER TABLE "InvoiceEvent"
  ADD CONSTRAINT "InvoiceEvent_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE;
