# Cursor AI Guide

This guide shows you how to use Cursor AI to extend and customize the Invoice Generator project.

## Quick Examples

### Adding a New Field

**Example: Add a "Purchase Order" field**

Just ask Cursor:
```
Add a "Purchase Order" field in the invoice details section
```

Cursor will:
1. Update `types/invoice.ts` to add the field
2. Add the input in `components/InvoiceForm.tsx`
3. Update the PDF template in `lib/pdf-generator.tsx`
4. Update the preview section

### Changing Theme Colors

**Example: Add an Orange theme**

Ask Cursor:
```
Add an orange theme option to the invoice generator
```

Cursor will:
1. Add 'orange' to the Theme type
2. Add orange colors to `themeColors` in `types/invoice.ts`
3. Add the option to the theme selector dropdown

### Customizing the Layout

**Example: Move preview to the left**

Ask Cursor:
```
Move the invoice preview to the left side instead of right
```

Cursor will update the grid layout in `components/InvoiceForm.tsx`.

## Common Tasks

### 1. Add Client Management

**Ask:**
```
Add a client management feature where I can save and select from a list of clients
```

**What Cursor will do:**
- Create a client storage system
- Add a client selector dropdown
- Create a "Save Client" button
- Add client management UI

### 2. Add Email Functionality

**Ask:**
```
Add functionality to email invoices directly to clients
```

**What Cursor will do:**
- Add email input validation
- Integrate email service (you'll need to provide API keys)
- Add "Send Email" button
- Handle email sending logic

### 3. Create Invoice History Page

**Ask:**
```
Create a separate page for viewing invoice history with search and filter options
```

**What Cursor will do:**
- Create new route in `app/invoices/page.tsx`
- Add search functionality
- Add filter options (by date, client, amount)
- Create detailed invoice view

### 4. Add Database Integration

**Ask:**
```
Replace localStorage with a database. Use Prisma with SQLite for local development.
```

**What Cursor will do:**
- Set up Prisma
- Create database schema
- Replace storage functions with database calls
- Add migration files

### 5. Add Invoice Templates

**Ask:**
```
Add invoice templates - create 3 different PDF layouts that users can choose from
```

**What Cursor will do:**
- Create multiple PDF template components
- Add template selector
- Update PDF generation to use selected template

### 6. Add Multi-language Support

**Ask:**
```
Add multi-language support for English, Spanish, and French
```

**What Cursor will do:**
- Set up i18n library
- Create translation files
- Add language selector
- Update all text to use translations

### 7. Add Invoice Numbering System

**Ask:**
```
Add automatic invoice numbering with customizable format (e.g., INV-2024-001)
```

**What Cursor will do:**
- Create invoice number generator
- Add format configuration
- Auto-increment invoice numbers
- Save last used number

### 8. Add Recurring Invoices

**Ask:**
```
Add functionality to create recurring invoices that generate automatically
```

**What Cursor will do:**
- Add recurring invoice settings
- Create scheduler logic
- Add recurring invoice management UI

### 9. Customize PDF Styling

**Ask:**
```
Make the PDF background white and add a colored header bar
```

**What Cursor will do:**
- Update styles in `lib/pdf-generator.tsx`
- Modify PDF layout
- Add custom styling

### 10. Add Invoice Status Tracking

**Ask:**
```
Add invoice status tracking (Draft, Sent, Paid, Overdue) with color coding
```

**What Cursor will do:**
- Add status field to Invoice type
- Add status selector
- Add status display in history
- Add color coding logic

## Advanced Customization

### Modifying Calculations

**Example: Add early payment discount**

Ask:
```
Add an early payment discount feature that applies if invoice is paid within 10 days
```

### Adding New Sections

**Example: Add payment schedule**

Ask:
```
Add a payment schedule section where I can break down the total into multiple payments
```

### Integrating External Services

**Example: Add Stripe payment link**

Ask:
```
Add a Stripe payment link generator that creates a payment link for the invoice total
```

## Tips for Working with Cursor

1. **Be Specific**: The more specific your request, the better the result
   - Good: "Add a date picker for invoice date with validation"
   - Less helpful: "Add date thing"

2. **Reference Files**: Mention specific files when needed
   - "Update the PDF template in lib/pdf-generator.tsx to add a footer"

3. **Ask for Explanations**: If you don't understand the code, ask
   - "Explain how the invoice calculations work"

4. **Iterate**: Start with small changes, then build up
   - First: "Add a notes field"
   - Then: "Make the notes field support markdown"

5. **Test as You Go**: After each change, test the functionality
   - "Test the PDF generation with the new field"

## Code Patterns Cursor Understands

Cursor is familiar with:
- React hooks (useState, useEffect, etc.)
- TypeScript types and interfaces
- Next.js App Router patterns
- Tailwind CSS classes
- React PDF components

## Common Issues and Solutions

### Issue: Cursor suggests wrong file
**Solution**: Specify the exact file path in your request

### Issue: Changes break existing functionality
**Solution**: Ask Cursor to "fix the broken functionality" and it will analyze the error

### Issue: Need to understand existing code
**Solution**: Ask "Explain how [component/function] works"

## Example Conversation Flow

```
You: Add a company email field to the invoice form

Cursor: [Adds email field to company section]

You: Make it required and add email validation

Cursor: [Adds validation and required attribute]

You: Update the PDF to show the email in the company header

Cursor: [Updates PDF template]
```

## Getting Help

If Cursor doesn't understand your request:
1. Break it into smaller steps
2. Be more specific about what you want
3. Reference similar existing features
4. Ask Cursor to explain what it thinks you want

---

**Happy Coding with Cursor AI!** 🚀

