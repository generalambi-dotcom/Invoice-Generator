# Backend Implementation Guide

## ✅ What's Been Set Up

### 1. Database Schema (Prisma)
- ✅ User model with subscription tracking
- ✅ PaymentCredential model for user payment gateway connections
- ✅ Invoice model with full invoice data
- ✅ Payment model for transaction tracking
- ✅ EmailLog model for email history

### 2. API Routes Created
- ✅ `/api/payment-credentials` - Manage user payment credentials
- ✅ `/api/invoices` - Create and list invoices
- ✅ `/api/invoices/[id]` - Get single invoice (public)
- ✅ `/api/invoices/[id]/payment-link` - Generate payment links
- ✅ `/api/invoices/send-email` - Send invoices via email
- ✅ `/api/payments/verify` - Verify payment transactions
- ✅ `/api/webhooks/paystack` - Paystack webhook handler
- ✅ `/api/webhooks/stripe` - Stripe webhook handler

### 3. Frontend Pages Created
- ✅ `/settings/payment-methods` - Connect payment gateways
- ✅ `/pay/[id]` - Customer payment page

### 4. Utilities Created
- ✅ `lib/db.ts` - Prisma client singleton
- ✅ `lib/payment-links.ts` - Payment link generation
- ✅ `lib/email.ts` - Email sending (Resend integration)

## 🚧 What Still Needs to Be Done

### 1. Database Setup
1. **Set up PostgreSQL database:**
   - Local: Install PostgreSQL and create database
   - Cloud: Use Supabase, Neon, or Vercel Postgres (recommended)

2. **Configure environment variables:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   RESEND_API_KEY="re_..."
   NEXT_PUBLIC_APP_URL="https://invoicegenerator.ng"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

### 2. Authentication System
Currently API routes use `x-user-id` header. You need to:
- Implement proper JWT authentication
- Or use NextAuth.js for session management
- Update all API routes to use authenticated sessions

### 3. Frontend Integration
Update these components to use API instead of localStorage:
- `components/InvoiceForm.tsx` - Save invoices via API
- `app/dashboard/page.tsx` - Load invoices from API
- `app/history/page.tsx` - Load from API
- Add "Send Invoice" button to invoice form
- Add "Connect Payment Method" link in settings

### 4. Email Integration
- Sign up for Resend (https://resend.com) - free tier available
- Configure email templates
- Set up domain verification (for production)

### 5. Payment Gateway Integration
Complete the payment link generation:
- **Paystack**: Use Paystack API to create payment links
- **Stripe**: Use Stripe Checkout or Payment Links
- **PayPal**: Use PayPal SDK for payment buttons

### 6. Webhook Configuration
- Configure webhook URLs in payment provider dashboards:
  - Paystack: `https://invoicegenerator.ng/api/webhooks/paystack`
  - Stripe: `https://invoicegenerator.ng/api/webhooks/stripe`
  - PayPal: (configure in PayPal dashboard)

## 📋 Step-by-Step Implementation

### Step 1: Database Setup
```bash
# 1. Create database (local or cloud)
# 2. Update .env with DATABASE_URL
# 3. Run migrations
npx prisma migrate dev --name init

# 4. (Optional) View database
npx prisma studio
```

### Step 2: Update Invoice Form
Replace localStorage calls with API calls:
```typescript
// Instead of: saveInvoice(invoice)
const response = await fetch('/api/invoices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': user.id, // Replace with proper auth
  },
  body: JSON.stringify(invoice),
});
```

### Step 3: Add Send Invoice Feature
Add button in invoice form:
```typescript
const handleSendInvoice = async () => {
  const response = await fetch('/api/invoices/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': user.id,
    },
    body: JSON.stringify({
      invoiceId: invoice.id,
      recipientEmail: invoice.clientInfo.email,
      message: 'Please find your invoice attached.',
    }),
  });
};
```

### Step 4: Connect Payment Methods
Users can now:
1. Go to `/settings/payment-methods`
2. Click "Add Payment Method"
3. Select provider (Paystack/Stripe/PayPal)
4. Enter API keys
5. Save credentials (encrypted in database)

### Step 5: Generate Payment Links
When creating invoice:
1. User connects payment method first
2. When saving invoice, generate payment link
3. Payment link is: `/pay/{invoiceId}`
4. Customer clicks link, pays, status updates automatically

## 🔐 Security Considerations

1. **Encrypt Payment Credentials**
   - Currently stored as plain text (TODO)
   - Use encryption library like `crypto` or `@noble/cipher`

2. **Authentication**
   - Implement proper JWT or session auth
   - Don't use `x-user-id` header in production

3. **Webhook Security**
   - Verify webhook signatures (implemented for Paystack/Stripe)
   - Use HTTPS in production

4. **API Rate Limiting**
   - Add rate limiting to prevent abuse
   - Use middleware like `@upstash/ratelimit`

## 🎯 Next Steps Priority

1. **High Priority:**
   - Set up database and run migrations
   - Implement authentication system
   - Update invoice form to use API

2. **Medium Priority:**
   - Complete payment link generation
   - Set up email sending
   - Update dashboard to show real-time payments

3. **Low Priority:**
   - Add encryption for payment credentials
   - Implement rate limiting
   - Add payment analytics

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Resend Docs](https://resend.com/docs)
- [Paystack API](https://paystack.com/docs/api)
- [Stripe API](https://stripe.com/docs/api)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

