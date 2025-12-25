# Prisma Migration Guide for Production

## The Problem
Your database schema has been updated in code, but the actual database hasn't been updated yet. This causes errors like:
- "The column does not exist in the current database"
- Registration/login failures

## Solution: Apply Migrations to Production Database

### Step 1: Create the Migration (if not already created)

If you haven't created the migration file yet, run this locally:

```bash
npx prisma migrate dev --name add_company_defaults --create-only
```

This creates the migration file without applying it.

### Step 2: Apply Migration to Production Database

You have two options:

#### Option A: Using `prisma migrate deploy` (Recommended for Production)

This applies all pending migrations to your production database:

```bash
# Make sure your DATABASE_URL points to production
export DATABASE_URL="postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres"

# Apply migrations
npx prisma migrate deploy
```

Or in one line:
```bash
DATABASE_URL="postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres" npx prisma migrate deploy
```

#### Option B: Using `prisma db push` (Quick sync, not for production)

⚠️ **Warning**: `db push` doesn't create migration files. Only use for quick fixes:

```bash
DATABASE_URL="postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres" npx prisma db push
```

### Step 3: Verify Migration

Check that the migration was applied:

```bash
DATABASE_URL="postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres" npx prisma migrate status
```

You should see "Database schema is up to date!"

### Step 4: Generate Prisma Client

After migration, regenerate the Prisma client:

```bash
npx prisma generate
```

## For Vercel Deployment

### Automatic Migrations on Deploy

You can set up Vercel to run migrations automatically. Add this to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

Then in Vercel settings:
1. Go to your project → Settings → Build & Development Settings
2. Set "Build Command" to: `npm run vercel-build`

### Manual Migration via Vercel CLI

Alternatively, you can run migrations via Vercel CLI:

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Link your project
vercel link

# Run migration in production environment
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy
```

## Important Notes

1. **Backup First**: Always backup your production database before running migrations
2. **Test Locally**: Test migrations on a copy of production data first
3. **Environment Variables**: Make sure `DATABASE_URL` in Vercel matches your production database
4. **Migration Files**: Migration files in `prisma/migrations/` should be committed to git

## Troubleshooting

### Error: "Can't reach database server"
- Check your DATABASE_URL is correct
- Verify your database is accessible from your network
- For Supabase, check connection pooling settings

### Error: "Migration already applied"
- Check migration status: `npx prisma migrate status`
- If migration shows as applied but error persists, try: `npx prisma generate`

### Error: "Table already exists"
- Your database might already have the table
- Use `prisma migrate resolve --applied <migration_name>` to mark as applied
- Or drop the table manually and re-run migration (⚠️ data loss)

## Current Required Migration

The current migration needed is:
- **Name**: `add_company_defaults`
- **Changes**: Adds `CompanyDefaults` table and relationship to `User` model

