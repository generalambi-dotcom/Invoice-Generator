# Fix Login Error - Database Schema Sync

## Problem
The login is failing because we added a new `publicSlug` field to the User model, but the production database hasn't been updated yet. Prisma is expecting this field to exist, causing the error.

## Solution

You need to sync your production database schema with the Prisma schema. Here are the steps:

### Option 1: Using Prisma DB Push (Recommended for quick fix)

1. **Set your production database URL** in your `.env` file or environment variables:
   ```bash
   DATABASE_URL="your-production-database-url"
   ```

2. **Push the schema to production database:**
   ```bash
   npx prisma db push
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Redeploy your application** (if on Vercel, it should auto-deploy after you push changes)

### Option 2: Using Prisma Migrate (Recommended for production)

1. **Create a migration:**
   ```bash
   npx prisma migrate dev --name add_public_slug_field
   ```

2. **Apply migration to production:**
   ```bash
   npx prisma migrate deploy
   ```

   Make sure your `DATABASE_URL` environment variable is set to your production database URL.

### Important Notes

- ⚠️ **Backup your database first** before running migrations in production
- The `publicSlug` field is nullable, so existing users won't be affected
- After running the migration, login should work again
- All new fields (`publicSlug` on User, `createdBy` and `customerEmail` on Invoice) will be added

### If you're using Vercel

1. Set the `DATABASE_URL` environment variable in Vercel dashboard
2. Run the migration locally pointing to production:
   ```bash
   DATABASE_URL="your-production-url" npx prisma db push
   ```
3. Or use Vercel's CLI:
   ```bash
   vercel env pull .env.production
   npx prisma db push
   ```

### Verification

After running the migration, verify by:
1. Trying to login again
2. The error should be gone
3. You can now use the public invoice link feature

