-- Migration: Add Product catalogue table
-- Run with: prisma db push  OR  execute this SQL directly on your database

CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "defaultRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit"        TEXT,
  "taxable"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Foreign key
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "Product_userId_idx" ON "Product"("userId");
CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "Product"("name");
