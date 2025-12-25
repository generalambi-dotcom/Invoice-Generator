# Self-Serve Invoice Generation Feature

This document describes the implementation of the self-serve invoice generation feature, allowing customers to create invoices themselves via a public link (similar to Zenvoice).

## Overview

Users can now share a public link that allows their customers to:
- Create invoices without logging in
- Fill in their own invoice details
- Add VAT, modify amounts, and customize invoices
- Download PDFs and pay directly
- All invoices are saved to the user's account

## Database Changes

### User Model
- Added `publicSlug` field (String, unique, nullable) - Stores the public username/slug for invoice links

### Invoice Model
- Added `createdBy` field (String, nullable) - Tracks who created the invoice: 'owner' or 'customer'
- Added `customerEmail` field (String, nullable) - Stores the email of the customer who created the invoice (if customer-created)

## New Files

### API Routes
1. **`app/api/public/invoice/[slug]/route.ts`**
   - `GET /api/public/invoice/[slug]` - Fetches company info for public invoice creation
   - `POST /api/public/invoice/[slug]` - Creates invoice via public link (customer-created)
   - `PATCH /api/public/invoice/[slug]` - Updates invoice via public link (customer editing)

2. **`app/api/user/public-slug/route.ts`**
   - `GET /api/user/public-slug` - Gets user's public slug and link
   - `POST /api/user/public-slug` - Creates or updates public slug

### Components
1. **`components/PublicInvoiceForm.tsx`**
   - Public-facing invoice creation form
   - Pre-fills company info from user's defaults
   - Allows customers to fill in their details
   - Saves invoices via public API endpoint

### Pages
1. **`app/i/[slug]/page.tsx`**
   - Public invoice creation page accessible at `/i/[username]`
   - Renders `PublicInvoiceForm` component

2. **`app/settings/public-link/page.tsx`**
   - Settings page for managing public invoice link
   - Allows users to create/update their public slug
   - Shows the public link to share with customers

### Utilities
1. **`lib/public-invoice.ts`**
   - `generatePublicSlug()` - Generates a slug from user's name/email
   - `isPublicSlugAvailable()` - Checks if a slug is available
   - `generateUniquePublicSlug()` - Generates a unique slug with number suffix if needed
   - `getUserByPublicSlug()` - Gets user by public slug

## Updated Files

### API Routes
1. **`app/api/invoices/route.ts`**
   - Updated to mark invoices as `createdBy: 'owner'` when created by authenticated users

### Components
1. **`components/Header.tsx`**
   - Added "Public Invoice Link" menu item in account dropdown

## Usage

### For Users (Invoice Creators)

1. **Create Your Public Link**
   - Go to Settings → Public Invoice Link
   - Create a custom slug (e.g., "company-name") or use auto-generated one
   - Copy your public link: `https://invoicegenerator.ng/i/company-name`

2. **Share with Customers**
   - Share the link via email, SMS, or embed on your website
   - Customers can access it without logging in

### For Customers (Invoice Creators)

1. **Access the Link**
   - Click on the public invoice link shared by the business
   - Company information is pre-filled automatically

2. **Create Invoice**
   - Fill in your details (name, email, address)
   - Add invoice details (date, due date, invoice number)
   - Add line items with descriptions, quantities, and rates
   - Add tax, discount, shipping as needed
   - Click "Save Invoice"

3. **Download & Pay**
   - Download PDF immediately
   - If payment link is configured, pay directly
   - Invoice is saved to the business owner's account

## Features

✅ **Public Access** - No login required for customers  
✅ **Company Pre-fill** - Company info automatically loaded  
✅ **Customer Editing** - Customers can add VAT, modify amounts  
✅ **Auto-payment Links** - Payment links auto-generated if configured  
✅ **Invoice Tracking** - All invoices saved to owner's account  
✅ **Source Tracking** - Invoices marked as customer-created vs owner-created  
✅ **Custom Slugs** - Users can choose custom public slugs  
✅ **PDF Generation** - Customers can download PDFs immediately  

## Database Migration

To apply the database changes, run:

```bash
npx prisma db push
# or
npx prisma migrate dev --name add_public_invoice_features
```

## Security Considerations

- Public links are scoped to specific users (slug-based)
- Only customer-created invoices can be edited via public link
- Company defaults are read-only for customers
- All invoice operations are validated and sanitized
- Rate limiting should be applied to public endpoints (recommended)

## Future Enhancements

- [ ] Customer invoice editing via unique invoice links
- [ ] Email notifications to owner when customer creates invoice
- [ ] Invoice approval workflow
- [ ] Rate limiting on public endpoints
- [ ] Analytics for public link usage
- [ ] Custom branding per public link
- [ ] Multiple public links per user (different purposes)

