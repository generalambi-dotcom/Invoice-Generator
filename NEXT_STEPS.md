# Next Steps - Backend Integration

## ✅ Database Setup Complete!

Your Supabase PostgreSQL database is now connected and all tables have been created:
- ✅ User
- ✅ PaymentCredential  
- ✅ Invoice
- ✅ Payment
- ✅ EmailLog

## 🚀 Immediate Next Steps

### 1. Update Frontend to Use API (High Priority)

The frontend still uses `localStorage`. You need to update these files:

#### A. Update Invoice Form (`components/InvoiceForm.tsx`)
Replace `saveInvoice()` calls with API calls:

```typescript
// Replace this:
saveInvoice(completeInvoice);

// With this:
const response = await fetch('/api/invoices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': user?.id || '', // TODO: Replace with proper auth
  },
  body: JSON.stringify(completeInvoice),
});
```

#### B. Update Dashboard (`app/dashboard/page.tsx`)
Replace `loadInvoices()` with API call:

```typescript
// Replace this:
const invoices = loadInvoices();

// With this:
const response = await fetch('/api/invoices', {
  headers: {
    'x-user-id': user?.id || '',
  },
});
const data = await response.json();
const invoices = data.invoices;
```

### 2. Implement Authentication (Critical)

Currently API routes use `x-user-id` header which is insecure. You need:

**Option A: Use NextAuth.js (Recommended)**
```bash
npm install next-auth
```

**Option B: JWT Tokens**
- Create login API that returns JWT
- Store JWT in httpOnly cookies
- Verify JWT in API routes

### 3. Add Payment Methods Settings Link

Add a link in the header/navigation to `/settings/payment-methods` so users can connect their payment gateways.

### 4. Complete Payment Link Generation

Update `lib/payment-links.ts` to actually create payment links with:
- **Paystack**: Use Paystack API to create payment pages
- **Stripe**: Use Stripe Payment Links API
- **PayPal**: Use PayPal SDK

### 5. Set Up Email Sending

1. Sign up for Resend: https://resend.com (free tier available)
2. Get API key
3. Add to `.env`: `RESEND_API_KEY="re_..."`
4. Update `lib/email.ts` to use Resend SDK

### 6. Configure Webhooks

In your payment provider dashboards, set webhook URLs:
- **Paystack**: `https://invoicegenerator.ng/api/webhooks/paystack`
- **Stripe**: `https://invoicegenerator.ng/api/webhooks/stripe`

## 📋 Feature Checklist

### Payment Integration
- [ ] Users can connect Paystack credentials
- [ ] Users can connect Stripe credentials  
- [ ] Users can connect PayPal credentials
- [ ] Payment links are generated when invoice is created
- [ ] Customers can pay via payment link
- [ ] Payment status updates automatically via webhooks
- [ ] Dashboard shows real-time payment status

### Email Integration
- [ ] Users can send invoices via email
- [ ] Email includes invoice PDF attachment
- [ ] Email includes payment link
- [ ] Email delivery is tracked

### Database Migration
- [ ] Existing localStorage data can be migrated
- [ ] All new invoices save to database
- [ ] All invoices load from database
- [ ] Payment history is stored in database

## 🔧 Quick Wins

1. **Add "Payment Methods" link to header:**
   ```typescript
   <Link href="/settings/payment-methods">Payment Methods</Link>
   ```

2. **Add "Send Invoice" button to invoice form:**
   ```typescript
   <button onClick={handleSendInvoice}>
     Send Invoice via Email
   </button>
   ```

3. **Update dashboard to show payment status:**
   - Already implemented, just needs API integration

## 🎯 Priority Order

1. **Authentication** - Must be done before production
2. **Update Invoice Form** - Core functionality
3. **Update Dashboard** - User experience
4. **Payment Link Generation** - Premium feature
5. **Email Sending** - Premium feature
6. **Webhook Testing** - Payment automation

## 📝 Notes

- Database is ready and connected ✅
- API routes are created ✅
- Frontend pages are created ✅
- Need to connect frontend to backend APIs ⚠️
- Need proper authentication ⚠️

Your database connection string is saved in `.env` file. Make sure it's in `.gitignore` (already done).

