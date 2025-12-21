# Environment Variables Setup

## ✅ Current Environment Variables

Your `.env` file should contain:

```bash
# Database
DATABASE_URL="postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Change to "https://invoicegenerator.ng" for production

# Email Service (Resend)
RESEND_API_KEY="re_As6S1bU4_McaejJ9RFZmTsbFiUJ2DAopt"

# JWT Secret (for production, generate a secure random string)
JWT_SECRET="your-secret-key-change-in-production"  # Generate with: openssl rand -base64 32
```

## 🔒 Security Notes

**Important**: API keys should NEVER be:
- ❌ Committed to Git
- ❌ Stored in the admin area
- ❌ Exposed in client-side code
- ❌ Shared publicly

**✅ Correct approach**:
- Store in `.env` file (already in `.gitignore`)
- Set in Vercel environment variables for production
- Keep them secret and secure

## 📝 For Production Deployment (Vercel)

When deploying to Vercel, add these environment variables in the Vercel dashboard:

1. Go to your project settings → Environment Variables
2. Add each variable:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL` (set to `https://invoicegenerator.ng`)
   - `RESEND_API_KEY`
   - `JWT_SECRET` (generate a secure random string)

## 🧪 Testing Email

Once `RESEND_API_KEY` is set, you can test email sending:
1. Create an invoice
2. Click "Send Invoice via Email"
3. The email will be sent using Resend

## 📧 Resend Domain Setup

For production, you'll need to:
1. Verify your domain in Resend dashboard
2. Update the `from` email in `lib/email.ts` to use your verified domain
3. Currently set to: `Invoice Generator <noreply@invoicegenerator.ng>`

