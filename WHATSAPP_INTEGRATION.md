# WhatsApp Integration Guide

## Overview

WhatsApp integration allows users to:
1. **Connect their WhatsApp account** to the system
2. **Create invoices via WhatsApp** by sending natural language commands
3. **Receive invoice PDFs** via WhatsApp to forward to clients

## Features Implemented

### ✅ Admin Configuration
- Admin can configure WhatsApp API credentials (Twilio, Meta, or WhatsApp Web)
- Admin can enable/disable WhatsApp integration globally
- Admin can control whether users can connect their own WhatsApp accounts
- Admin can set rate limits for messages

### ✅ User Connection
- Users can connect their WhatsApp phone number
- Connection status and verification tracking
- Users can disconnect their WhatsApp at any time

### ✅ Invoice Creation via WhatsApp
- Natural language processing to parse invoice commands
- Supports various command formats:
  - "Create invoice for John Doe, 5 items at $100 each, due in 30 days"
  - "Invoice: Client: ABC Company, Items: Web Design $500, Development $1000"
  - "3 hours consulting at $150/hour for Jane Smith"
- Automatically extracts:
  - Client name, email, phone
  - Line items with quantities and prices
  - Due dates
  - Tax rates
  - Discounts
  - Currency

### ✅ Invoice Delivery
- Invoices are sent back to the user via WhatsApp
- Includes invoice PDF link
- Users can forward invoices to their clients

## Setup Instructions

### Step 1: Database Migration

Run the Prisma migration to add the new models:

```bash
npx prisma db push
npx prisma generate
```

### Step 2: Configure WhatsApp Provider (Admin)

1. Log in as admin
2. Go to **Admin Dashboard** → **WhatsApp Settings**
3. Choose your provider:
   - **Twilio** (Recommended for production)
   - **Meta WhatsApp Business API**
   - **WhatsApp Web** (Development only)

#### For Twilio:
1. Sign up at [Twilio](https://www.twilio.com)
2. Get your Account SID and Auth Token from the Twilio Console
3. Get a WhatsApp-enabled number (or use the sandbox number for testing)
4. Enter credentials in the admin settings
5. Configure webhook URL: `https://yourdomain.com/api/webhooks/whatsapp`

#### For Meta:
1. Create a Meta Business Account
2. Set up WhatsApp Business API
3. Get App ID, App Secret, Access Token, Phone Number ID, and Business Account ID
4. Enter credentials in the admin settings
5. Configure webhook URL in Meta dashboard

### Step 3: Enable WhatsApp Integration

1. In admin settings, toggle **"Enable WhatsApp Integration"** to ON
2. Optionally enable **"Allow User Connections"** if you want users to connect their own WhatsApp
3. Set rate limits (messages per minute/day)
4. Save settings

### Step 4: User Connection

1. Users go to **Settings** → **WhatsApp Connection**
2. Enter their WhatsApp phone number (with country code, e.g., +2348012345678)
3. Click "Connect WhatsApp"
4. Send a test message to verify the connection

## Usage

### Creating Invoices via WhatsApp

Users can send messages like:

```
Create invoice for ABC Company
Items: Web Design $500, Development $1000
Due in 30 days
```

Or:

```
Invoice for John Doe
5 items at $100 each
Tax: 10%
Due: 15 days
```

The system will:
1. Parse the message
2. Create the invoice
3. Send confirmation with invoice details
4. Send the invoice PDF link

### Supported Command Formats

1. **Simple format:**
   ```
   Create invoice for [Client Name]
   [Item Description] $[Amount]
   ```

2. **With quantities:**
   ```
   [Quantity] [Item] at $[Rate] each
   ```

3. **With due date:**
   ```
   Due in [X] days
   Due: [Date]
   ```

4. **With tax/discount:**
   ```
   Tax: [X]%
   Discount: [X]%
   ```

## API Endpoints

### Admin
- `GET /api/admin/whatsapp` - Get WhatsApp settings
- `PUT /api/admin/whatsapp` - Update WhatsApp settings

### User
- `GET /api/whatsapp/connect` - Get user's WhatsApp connection
- `POST /api/whatsapp/connect` - Connect user's WhatsApp
- `DELETE /api/whatsapp/connect` - Disconnect user's WhatsApp

### Webhook
- `POST /api/webhooks/whatsapp` - Receive WhatsApp messages
- `GET /api/webhooks/whatsapp` - Webhook verification (Meta)

## Files Created

### Database Models
- `WhatsAppCredential` - User WhatsApp connections
- `WhatsAppSettings` - Global WhatsApp configuration

### Pages
- `/app/admin/whatsapp/page.tsx` - Admin WhatsApp settings
- `/app/settings/whatsapp/page.tsx` - User WhatsApp connection

### API Routes
- `/app/api/admin/whatsapp/route.ts` - Admin settings API
- `/app/api/whatsapp/connect/route.ts` - User connection API
- `/app/api/webhooks/whatsapp/route.ts` - Webhook handler

### Utilities
- `/lib/whatsapp-nlp.ts` - Natural language processing
- `/lib/whatsapp-sender.ts` - WhatsApp message sending

## Security

- All sensitive credentials are encrypted in the database
- Webhook verification for Meta API
- Rate limiting support
- User authentication required for all operations
- Admin-only access for global settings

## Environment Variables

Add to `.env`:

```env
# Encryption key for sensitive data (generate a random 32-byte hex string)
ENCRYPTION_KEY=your-32-byte-hex-key-here

# For Meta webhook verification
WHATSAPP_VERIFY_TOKEN=your-verify-token-here

# Base URL for webhooks and links
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Testing

### Twilio Sandbox
1. Use Twilio's WhatsApp sandbox for testing
2. Send "join [code]" to the sandbox number to connect
3. Test invoice creation commands

### Meta Testing
1. Use Meta's test numbers for development
2. Configure webhook in Meta dashboard
3. Test with approved message templates

## Troubleshooting

### Connection Issues
- Verify phone number format (must include country code with +)
- Check that WhatsApp integration is enabled in admin settings
- Verify API credentials are correct

### Message Not Received
- Check webhook URL is correctly configured
- Verify webhook is accessible (not behind firewall)
- Check provider dashboard for delivery status

### Invoice Creation Fails
- Ensure company defaults are set up
- Check that message format is recognized
- Review webhook logs for errors

## Next Steps

1. **PDF Generation**: Implement server-side PDF generation and upload to cloud storage (S3, Cloudinary) for WhatsApp delivery
2. **AI Enhancement**: Integrate OpenAI GPT for better natural language understanding
3. **Template Messages**: Support for WhatsApp message templates (required for Meta)
4. **Multi-language**: Support for multiple languages in invoice creation
5. **Invoice Status Updates**: Send payment status updates via WhatsApp

## Support

For issues or questions:
1. Check webhook logs in your provider dashboard
2. Review server logs for error messages
3. Verify all credentials are correctly configured
4. Ensure database migration was successful

