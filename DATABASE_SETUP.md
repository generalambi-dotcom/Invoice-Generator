# Database Setup Guide

This project now uses PostgreSQL with Prisma ORM for data storage. This replaces the previous localStorage-based storage.

## Prerequisites

1. **PostgreSQL Database**
   - Local: Install PostgreSQL on your machine
   - Cloud: Use services like:
     - [Supabase](https://supabase.com) (Free tier available)
     - [Neon](https://neon.tech) (Free tier available)
     - [Railway](https://railway.app) (Free tier available)
     - [Vercel Postgres](https://vercel.com/storage/postgres)

## Setup Steps

### 1. Create Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb invoicegenerator
```

**Option B: Cloud Database (Recommended for Production)**
1. Sign up for a cloud PostgreSQL service
2. Create a new database
3. Copy the connection string

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/invoicegenerator?schema=public"

# For cloud databases, use the connection string provided:
# DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (Resend - get free API key from https://resend.com)
RESEND_API_KEY="re_..."

# Payment Providers (Global webhook secrets)
PAYSTACK_SECRET_KEY="sk_live_..." # For webhook verification
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Or if you prefer to push schema without migrations:
npx prisma db push
```

### 4. (Optional) View Database with Prisma Studio

```bash
npx prisma studio
```

This opens a GUI to view and edit your database.

## Database Schema

The database includes the following models:

- **User**: User accounts with subscription info
- **PaymentCredential**: User's payment gateway credentials (encrypted)
- **Invoice**: Invoices with full details
- **Payment**: Payment transactions and history
- **EmailLog**: Email sending history

## Migration from localStorage

To migrate existing localStorage data to the database:

1. Export data from localStorage (browser console)
2. Use Prisma to import data
3. Or create a migration script

## Production Deployment

### Vercel

1. Add `DATABASE_URL` to Vercel environment variables
2. Run migrations during build:
   ```bash
   npx prisma migrate deploy
   ```
3. Or use Vercel's Postgres integration

### Other Platforms

- Ensure `DATABASE_URL` is set in environment variables
- Run migrations before first deployment
- Use connection pooling for serverless functions

## Security Notes

- **Never commit `.env` file** - it's in `.gitignore`
- **Encrypt payment credentials** before storing (TODO: implement encryption)
- **Use environment variables** for all secrets
- **Enable SSL** for production database connections

## Troubleshooting

**Connection Error:**
- Check `DATABASE_URL` is correct
- Verify database is running (local) or accessible (cloud)
- Check firewall/network settings

**Migration Errors:**
- Drop and recreate database if in development
- Check schema.prisma for syntax errors
- Ensure Prisma Client is generated: `npx prisma generate`

