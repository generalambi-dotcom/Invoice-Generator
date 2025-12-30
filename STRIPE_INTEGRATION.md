# Stripe Subscription Integration

## Overview

Stripe has been integrated as a payment option for subscription upgrades. Users can now pay for premium subscriptions using Stripe in addition to PayPal and Paystack.

## Features Implemented

### ✅ Stripe Checkout Integration
- Users can click "Upgrade with Stripe" button on the upgrade page
- Creates a Stripe Checkout Session for one-time subscription payment
- Redirects to Stripe's secure payment page
- Handles success and cancel redirects

### ✅ Webhook Handler
- Processes `checkout.session.completed` events
- Automatically activates premium subscription when payment succeeds
- Updates user subscription status in database
- Sets subscription end date (30 days from payment)

### ✅ Admin Configuration
- Admin can configure Stripe Publishable Key in Admin Dashboard
- Secret key must be set in environment variable `STRIPE_SECRET_KEY`
- Configuration stored in localStorage (for Publishable Key only)

## Setup Instructions

### Step 1: Get Stripe API Keys

1. Sign up at [Stripe](https://stripe.com)
2. Go to Developers → API keys
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### Step 2: Configure Environment Variables

Add to your `.env` file:

```env
# Stripe Secret Key (REQUIRED for webhooks and checkout)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...

# Stripe Webhook Secret (REQUIRED for webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://invoicegenerator.ng
```

### Step 3: Configure Stripe in Admin Dashboard

1. Log in as admin
2. Go to **Admin Dashboard** → **Payment API Configuration**
3. Scroll to **Stripe Configuration** section
4. Enter your **Stripe Publishable Key**
5. Click **Save Configuration**

**Note**: The Secret Key field is disabled - it must be set in environment variables for security.

### Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. Set endpoint URL: `https://invoicegenerator.ng/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed` (for subscription payments)
   - `payment_intent.succeeded` (for invoice payments)
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your `.env` as `STRIPE_WEBHOOK_SECRET`

## How It Works

### User Flow

1. User clicks "Upgrade with Stripe" on upgrade page
2. System creates a Stripe Checkout Session
3. User is redirected to Stripe's payment page
4. User enters card details and pays
5. Stripe redirects back to `/upgrade?success=true&session_id=...`
6. Webhook processes payment and activates subscription
7. User sees success message and subscription is active

### Webhook Flow

1. Stripe sends `checkout.session.completed` event to webhook
2. Webhook verifies signature using `STRIPE_WEBHOOK_SECRET`
3. Extracts user ID and plan from session metadata
4. Updates user subscription in database:
   - Sets `subscriptionPlan` to 'premium'
   - Sets `subscriptionStatus` to 'active'
   - Sets `subscriptionStartDate` to now
   - Sets `subscriptionEndDate` to 30 days from now
   - Sets `subscriptionPaymentMethod` to 'stripe'
5. Logs payment for record keeping

## API Endpoints

### Create Checkout Session
- **Endpoint**: `POST /api/subscriptions/create-checkout`
- **Auth**: Required (JWT token)
- **Body**:
  ```json
  {
    "userId": "user_id",
    "plan": "premium",
    "amount": 9.99,
    "currency": "usd",
    "userEmail": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_..."
  }
  ```

### Webhook Handler
- **Endpoint**: `POST /api/webhooks/stripe`
- **Auth**: Verified via Stripe signature
- **Events Handled**:
  - `checkout.session.completed` - Subscription payments
  - `payment_intent.succeeded` - Invoice payments

## Testing

### Test Mode

1. Use Stripe test keys (start with `pk_test_` and `sk_test_`)
2. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date, any CVC

### Production

1. Switch to live keys (start with `pk_live_` and `sk_live_`)
2. Update webhook endpoint to production URL
3. Test with real card (use small amount first)

## Security Notes

- **Secret Key**: Never commit to Git, always use environment variables
- **Webhook Secret**: Required for webhook signature verification
- **HTTPS**: Required for production webhooks
- **Signature Verification**: All webhook requests are verified

## Troubleshooting

### Payment Not Processing
- Check `STRIPE_SECRET_KEY` is set correctly
- Verify webhook is configured in Stripe dashboard
- Check webhook logs in Stripe dashboard
- Verify webhook URL is accessible

### Subscription Not Activating
- Check webhook is receiving events
- Verify webhook secret is correct
- Check server logs for errors
- Ensure user ID in metadata matches database

### Checkout Session Not Creating
- Verify `STRIPE_SECRET_KEY` is set
- Check API endpoint logs
- Verify user is authenticated
- Check Stripe dashboard for API errors

## Files Modified

- `types/subscription.ts` - Added Stripe to PaymentConfig
- `lib/payments.ts` - Added Stripe support to initiatePayment
- `lib/admin.ts` - Added Stripe keys to payment config
- `app/api/subscriptions/create-checkout/route.ts` - New endpoint
- `app/api/webhooks/stripe/route.ts` - Added subscription handling
- `app/upgrade/page.tsx` - Added Stripe button and success handling
- `app/admin/page.tsx` - Added Stripe configuration UI

## Next Steps

1. Set `STRIPE_SECRET_KEY` in environment variables
2. Configure Stripe webhook in Stripe dashboard
3. Add `STRIPE_WEBHOOK_SECRET` to environment variables
4. Test with Stripe test mode
5. Switch to live mode when ready

