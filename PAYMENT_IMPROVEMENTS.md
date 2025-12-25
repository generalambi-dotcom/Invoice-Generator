# Payment System Improvements

## Overview
Enhanced the payment system to automatically generate payment links when invoices are created or saved, with better user experience and guidance.

## Changes Made

### 1. **Auto-Generation of Payment Links** ✅
- Payment links are now automatically generated when invoices are saved (if payment credentials are configured)
- Works for both new invoice creation (`POST /api/invoices`) and invoice updates (`PATCH /api/invoices/[id]`)
- Only generates if:
  - User has active payment credentials configured
  - Invoice has a positive total amount
  - No payment link already exists (won't overwrite existing links)

### 2. **Default Payment Provider Selection** ✅
- Added `defaultPaymentProvider` field to `CompanyDefaults` model
- Users can set a default payment provider in Settings
- System uses default provider if set, otherwise falls back to first available active credential
- New API endpoint: `PUT /api/company-defaults/default-payment-provider`

### 3. **Improved UX Guidance** ✅
- Enhanced InvoiceForm UI with helpful messages about payment links
- Shows informational message that payment links are auto-generated
- Displays warning/guidance message if no payment methods are configured
- Includes link to Payment Methods settings page
- Better error messages when trying to create payment links without credentials

### 4. **Available Payment Providers API** ✅
- New endpoint: `GET /api/payment-providers/available`
- Returns list of user's active payment credentials
- Includes default provider setting
- Useful for UI components to show which providers are available

## Database Schema Changes

### Added to `CompanyDefaults`:
```prisma
defaultPaymentProvider String?  // 'paypal' | 'paystack' | 'stripe'
```

## Migration Required

You'll need to run a Prisma migration to add the new field:

```bash
npx prisma migrate dev --name add_default_payment_provider
```

Or if using `prisma db push`:
```bash
npx prisma db push
```

## How It Works

### Automatic Payment Link Generation Flow:

1. **User creates/saves an invoice**
   - Invoice is saved to database
   - System checks if user has active payment credentials

2. **Payment link generation**:
   - If credentials exist and invoice total > 0:
     - Gets default payment provider from CompanyDefaults (or first available)
     - Generates payment link using provider's API
     - Saves payment link and provider to invoice

3. **User experience**:
   - Payment link appears automatically in invoice form
   - Can copy/share the link immediately
   - Can still manually update to use different provider if needed

### Manual Payment Link Generation:

- Users can still manually generate payment links for specific providers
- Useful when they have multiple providers and want to use a different one
- Available in the InvoiceForm UI

## New API Endpoints

### `GET /api/payment-providers/available`
Get user's available payment providers and default setting.

**Response:**
```json
{
  "providers": [
    {
      "provider": "paystack",
      "isTestMode": false,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "defaultProvider": "paystack"
}
```

### `PUT /api/company-defaults/default-payment-provider`
Set default payment provider.

**Request:**
```json
{
  "defaultPaymentProvider": "paystack" // or "paypal" | "stripe" | null
}
```

## New Utility Functions

### `lib/auto-payment-link.ts`

- `getDefaultPaymentProvider(userId)`: Gets default payment provider
- `autoGeneratePaymentLink(invoiceId, userId, total)`: Auto-generates payment link

### `lib/api-client.ts`

- `getAvailablePaymentProvidersAPI()`: Get available providers (client-side)
- `updateDefaultPaymentProviderAPI(provider)`: Update default provider (client-side)

## UI Improvements

### InvoiceForm Component

- **Payment Link Section**: 
  - Shows existing payment link with copy button
  - Displays helpful message about auto-generation
  - Shows guidance if no credentials configured
  - Links to Settings page

- **Warning Banner**:
  - Appears when no payment methods are configured
  - Direct link to connect payment methods
  - Clear call-to-action

## Future Enhancements (Optional)

1. **Multiple Payment Links**: Allow invoices to have payment links for multiple providers simultaneously
2. **Provider Selection UI**: Dropdown to select provider when generating links manually
3. **Payment Link Status**: Show if payment link is active/expired
4. **Analytics**: Track which payment providers are most used

## Testing Checklist

- [ ] Create invoice with payment credentials configured → Link auto-generated
- [ ] Create invoice without credentials → No link, shows guidance message
- [ ] Update invoice → Link auto-generated if not present
- [ ] Set default payment provider → Used for auto-generation
- [ ] Manual payment link generation still works
- [ ] Payment methods settings page functions correctly
- [ ] Error handling when payment provider API fails

