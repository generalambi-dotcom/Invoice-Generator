# Database Schema Sync Instructions

## Issue
The production database schema is out of sync with the Prisma schema. The error "The column `(not available)` does not exist in the current database" indicates that the database is missing recently added columns.

## Solution: Sync Database Schema

You need to push the Prisma schema changes to your production database.

### Option 1: Using Prisma DB Push (Recommended for Quick Fix)

1. **Make sure your `.env` file has the production `DATABASE_URL`:**
   ```bash
   DATABASE_URL="your-production-database-connection-string"
   ```

2. **Push the schema to production:**
   ```bash
   npx prisma db push
   ```

   This will:
   - Compare your Prisma schema with the database
   - Create any missing columns/tables
   - Apply the changes directly

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Option 2: Using Prisma Migrations (Better for Production)

If you want to use migrations (recommended for production):

1. **Create a migration:**
   ```bash
   npx prisma migrate dev --name add_missing_invoice_fields
   ```

2. **Apply migrations to production:**
   ```bash
   npx prisma migrate deploy
   ```

### Important Notes

⚠️ **Warning**: `prisma db push` will modify your production database. Make sure:
- You have a backup of your database
- You're connected to the correct database
- You've tested the changes locally first

### What Columns Are Missing?

Based on the schema, these fields were recently added and may be missing:
- `approvalStatus` (Invoice model)
- `approvedBy` (Invoice model)
- `approvedAt` (Invoice model)
- `rejectionReason` (Invoice model)
- `editableToken` (Invoice model)
- `editableTokenExpiry` (Invoice model)
- `createdBy` (Invoice model)
- `customerEmail` (Invoice model)

### After Syncing

1. Restart your Vercel deployment
2. Test invoice creation/saving
3. Verify all features work correctly

