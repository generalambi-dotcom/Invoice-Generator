import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// One-time seeder for SEO blog posts
// Call: POST /api/admin/seed-blogs  (with secret key to prevent abuse)
// After running, DELETE this file.

const SECRET = process.env.SEED_SECRET || 'invoiceng-seed-2026';

const BLOG_POSTS = [
  {
    title: 'The Ultimate Guide to FIRS VAT Registration for Nigerian Businesses',
    slug: 'firs-vat-registration-guide-nigerian-businesses',
    excerpt: 'Learn exactly how to register for Value Added Tax (VAT) with the Federal Inland Revenue Service (FIRS) in Nigeria, including requirements, timelines, and penalties.',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    published: true,
    content: `# The Ultimate Guide to FIRS VAT Registration for Nigerian Businesses

Operating a business in Nigeria comes with specific tax obligations, and registering for Value Added Tax (VAT) with the Federal Inland Revenue Service (FIRS) is one of the most critical. Neglecting VAT obligations can lead to severe financial penalties and business interruptions.

## What is VAT in Nigeria?

Value Added Tax (VAT) is a consumption tax placed on a product whenever value is added at each stage of the supply chain. In Nigeria, the standard VAT rate is currently **7.5%**, following the Finance Act of 2020.

VAT is collected on behalf of the government by businesses and remitted to the FIRS by the **21st day of the following month**.

## Who Needs to Register for VAT?

Any individual, corporation, or organization doing business in Nigeria that supplies taxable goods or services must register for VAT. The Finance Act introduced a critical threshold: **businesses with an annual turnover of less than ₦25 million are exempted**.

If your business generates more than ₦25 million annually, registration is mandatory.

## Requirements for FIRS VAT Registration

### For Limited Liability Companies (LLCs):
1. Certificate of Incorporation (CAC)
2. Certified True Copy (CTC) of Memorandum and Articles of Association
3. CTC of Form CAC 1.1 (or CAC 2 and 7 for older registrations)
4. A formal application letter on company letterhead addressed to the Tax Controller
5. Utility bill of the business premises (Proof of Address)

### For Business Names (Enterprises):
1. Business Name Registration Certificate
2. Formal application letter
3. Utility bill for proof of address
4. Valid means of identification (NIN, Driver's License, International Passport)

## How to Register: Step-by-Step

**Step 1: Locate your nearest FIRS Tax Office (MSTO)**
Register at the Micro and Small Tax Office closest to your registered business address.

**Step 2: Submit your documents**
Take the documentation listed above to the Tax Controller's office.

**Step 3: Obtain your Taxpayer Identification Number (TIN)**
If you registered your company with the CAC recently, you may already have a TIN auto-assigned. Otherwise, FIRS will process your application and issue one.

**Step 4: Receive your VAT Certificate**
Once processed (usually 1–3 weeks), you will receive a VAT Registration Certificate. This must be displayed at your business premises.

## How to Invoice with VAT in Nigeria

Once registered, a valid Nigerian tax invoice must include:
- Your Company Name, Address, and TIN
- The Buyer's Name and Address
- Description of Goods/Services
- The 7.5% VAT amount clearly separated from the subtotal
- The phrase **"Tax Invoice"**

> **Pro Tip:** Use [InvoiceGenerator.ng](https://invoicegenerator.ng/invoice-generator-nigeria) to automatically calculate 7.5% Nigerian VAT on every invoice — no manual math, no compliance risk.

## Penalties for Non-Compliance

- **Failure to Register:** ₦50,000 for the first month, ₦25,000 for each subsequent month
- **Failure to Remit:** 10% of tax not remitted, plus interest at the current CBN lending rate

## Conclusion

By organizing your documents, registering promptly, and using automated invoicing tools to issue proper Tax Invoices, you guarantee FIRS compliance and avoid costly penalties.`,
  },
  {
    title: 'How to Get Your VAT Registration Number (TIN) in Nigeria',
    slug: 'how-to-get-vat-registration-number-tin-nigeria',
    excerpt: 'Learn the exact steps, requirements, and online processes for Nigerian businesses and individuals to acquire their Taxpayer Identification Number (TIN) from FIRS.',
    coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
    published: true,
    content: `# How to Get Your VAT Registration Number (TIN) in Nigeria

If you intend to open a corporate bank account, get a government loan, bid for contracts, or legally collect VAT, you need a **Taxpayer Identification Number (TIN)** — your unique identifier with the Federal Inland Revenue Service (FIRS) and the Joint Tax Board (JTB).

## What is a TIN?

A TIN is a unique 14-digit number assigned to individuals and businesses for tax record purposes. Without it, your invoices may be rejected by large corporations and government agencies who are required to remit Withholding Tax (WHT) on your behalf using it.

## Is TIN Registration Free?

**Yes, 100% free.** If anyone charges you for obtaining a TIN, they are acting fraudulently.

## For Recently-Registered Companies (Post-2020)

The CAC and FIRS integrated their systems — **your TIN is now generated automatically when you register with the CAC**.

To retrieve it:
1. Visit [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng)
2. Enter your CAC Registration Number (RC Number or BN Number)
3. Confirm your company name and download your TIN certificate

## For Older Companies or Freelancers

### Documents for Individuals:
- Completed TIN Application form (from any FIRS office)
- Valid Identification (National ID, Driver's License, or Passport)
- Passport Photograph
- Recent utility bill (proof of address)

### Documents for Companies:
- Certificate of Incorporation
- Memorandum and Articles of Association
- Form CAC 1.1 (or old CAC 2 and 7)
- Application letter on company letterhead
- Completed TIN form, stamped with company seal

## Processing Time

With all documents, TIN issuance typically takes **24 to 72 hours** at the FIRS office.

## TIN on Your Invoices

Nigerian corporate clients and all government agencies **will reject invoices that are missing your TIN**. Use [InvoiceGenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria) to save your TIN in your company defaults so it appears on every invoice automatically.

## Bottom Line

For most modern businesses, a TIN is generated at the point of CAC registration. For everyone else, a quick trip to your local FIRS office with the right documents is all you need.`,
  },
  {
    title: 'What is a Debit Note and When is it Issued? (With Nigerian Examples)',
    slug: 'what-is-debit-note-nigeria-when-issued-examples',
    excerpt: 'Understand the difference between a debit note, credit note, and invoice. Learn when a debit note is issued in Nigerian accounting with practical business examples.',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    published: true,
    content: `# What is a Debit Note and When is it Issued? (With Nigerian Examples)

If you have ever been undercharged by a supplier or issued an invoice for less than what was agreed, you might wonder how to correct it without voiding the entire transaction. This is exactly what a **Debit Note** is for.

## What is a Debit Note?

A **Debit Note** (or debit memo) is a commercial document issued to notify a trading partner that their account has been **debited** — meaning the amount they owe has increased.

- **Seller to buyer:** "You owe me more than the original invoice said."
- **Buyer to seller:** "I am returning damaged goods — reduce my payable accordingly."

## Debit Note vs. Credit Note vs. Invoice

| Document | Issued By | Purpose |
|---|---|---|
| **Invoice** | Seller | Original payment request |
| **Credit Note** | Seller | Reduces amount owed by the buyer |
| **Debit Note** | Seller or Buyer | Increases amount owed |

## When is a Debit Note Issued? Real Nigerian Scenarios

### Scenario 1: Seller Undercharged
Your Lagos agency quotes ₦500,000 for a campaign. The accountant invoices ₦450,000 by mistake. Instead of cancelling the original invoice, you issue a **Debit Note for ₦50,000** to recover the shortfall.

### Scenario 2: Post-Invoice Price Increases
A supply contract includes a fuel surcharge clause. After the invoice was sent, diesel prices spike 30%. The supplier issues a debit note to recover the cost differential.

### Scenario 3: Extra Freight Costs
A vendor ships goods from Kano to Port Harcourt. Actual shipping weight exceeds the estimate, incurring an extra ₦15,000. A debit note is issued for the freight difference.

### Scenario 4: Buyer Returning Damaged Goods
A buyer receives 10 laptops but 2 are broken. They return the units and issue a debit note to the supplier: *"Reduce my payable by ₦80,000 for 2 returned units."* The supplier responds with a Credit Note.

## What Must a Debit Note Include?

1. Clear header: **"DEBIT NOTE"**
2. Unique Debit Note Number
3. Reference to the original Invoice Number
4. Date of issue
5. Both parties' details (Name, Address, TIN)
6. Why the note is issued (reason/description)
7. The supplementary amount in ₦
8. VAT adjustments where applicable

## Best Practices

- Always notify clients verbally before sending — unexplained charges damage trust.
- Every debit note must reference its parent invoice for FIRS audit compliance.
- Keep all documents organized digitally using a tool like [InvoiceGenerator.ng](https://invoicegenerator.ng/invoice-generator-nigeria) to ensure a clean paper trail.`,
  },
  {
    title: 'The 5 Best Apps for Invoicing in Nigeria (2026 Rankings)',
    slug: 'best-invoicing-apps-software-nigeria',
    excerpt: 'Compare the top 5 invoicing apps for Nigerian businesses, freelancers, and agencies — ranked by Naira support, ease of use, WhatsApp sharing, and FIRS compliance.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    published: true,
    content: `# The 5 Best Apps for Invoicing in Nigeria (2026 Rankings)

Struggling with Word document invoices is holding your business back. Nigerian businesses need tools that handle Naira (₦) natively, apply 7.5% VAT automatically, and let you share invoices over WhatsApp instantly.

Here are the 5 best invoicing apps for Nigerian businesses right now.

---

## 1. InvoiceGenerator.ng — Best Overall for Nigerians

**Why it ranks first:**
- No account required to create your first invoice
- Built for Nigeria: ₦ formatting and automatic 7.5% VAT calculation
- **AI-powered:** type *"Invoice MTN ₦200,000 for 2 months social media management"* and it fills everything out
- **WhatsApp sharing:** send your PDF invoice directly to a client's chat in one click
- Free tier with no watermark restrictions

**Best for:** Freelancers, SMEs, and consultants wanting fast, professional PDF invoices. → [Try it free](https://invoicegenerator.ng)

---

## 2. Paystack Invoices — Best for Instant Payment Collection

**Strengths:**
- Invoice acts as an instant payment link (Card, USSD, Bank Transfer)
- Automated overdue payment reminders
- Syncs with your Paystack transaction history

**Best for:** E-commerce businesses primarily collecting instant digital payments.

---

## 3. Zoho Invoice — Best Free All-in-One

**Strengths:**
- Completely free regardless of the number of clients
- Built-in time tracker that converts hours to invoice line items
- Client portal where customers can view their full billing history

**Drawback:** Not tailored specifically to Nigerian tax workflows.

---

## 4. Wave Accounting — Best for Full Bookkeeping

**Strengths:**
- Free profit/loss statements and balance sheets alongside invoicing
- Recurring invoices for retainer clients
- Receipt scanning for expense tracking

**Drawback:** Payment processing unavailable in Nigeria.

---

## 5. Flutterwave Invoices — Best for International Billing

**Strengths:**
- Multi-currency invoicing (USD, GBP, KES, NGN) with local NGN settlement
- Ideal for Nigerian freelancers with international clients

---

## Quick Comparison

| Need | Best App |
|---|---|
| Fastest professional PDF + AI | InvoiceGenerator.ng |
| Instant payment collection | Paystack Invoices |
| Full bookkeeping | Wave Accounting |
| International billing | Flutterwave |
| Free client portal | Zoho Invoice |

For local tax compliance, AI features, and WhatsApp-first sharing, **[InvoiceGenerator.ng](https://invoicegenerator.ng)** is unmatched for Nigeria.`,
  },
  {
    title: 'How to Create a Free Professional Invoice in Naira (NGN) in 60 Seconds',
    slug: 'how-to-create-free-professional-invoice-naira',
    excerpt: 'Stop using messy Word templates. Learn the exact anatomy of a legal Nigerian invoice and how to generate a free, professional PDF in Naira in under 60 seconds.',
    coverImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d97?auto=format&fit=crop&w=1200&q=80',
    published: true,
    content: `# How to Create a Free Professional Invoice in Naira (NGN) in 60 Seconds

Sending a WhatsApp message saying *"Please pay 200k to my GTB account"* signals to corporate clients that you are an amateur. Meanwhile, wrestling with broken Microsoft Word invoice templates wastes time you cannot get back.

Here is the definitive guide to creating a free, legally sound, professional invoice in Nigerian Naira.

## The Legal Anatomy of a Nigerian Invoice

### 1. Document Title
Use **"INVOICE"** at the top. VAT-registered entities must use **"TAX INVOICE"**.

### 2. Unique Invoice Number
Every invoice needs a sequential unique identifier (e.g., INV-001, INV-002) for audit compliance.

### 3. Dates
- **Invoice Date:** Day the invoice is issued
- **Due Date:** Payment deadline (e.g., Net 30 = due in 30 days)

### 4. Your Company Details
- Logo, Business Name, Address, Phone/Email
- TIN (required on Tax Invoices)

### 5. Client Details (Bill To)
Full client name, address, and contact information.

### 6. Descriptive Line Items
Be specific: *"UI/UX Design: Homepage Redesign — 1 unit @ ₦250,000"* — not *"Work done"*.

### 7. Subtotal, VAT, and Total
- Subtotal of all items
- 7.5% VAT displayed separately (if VAT-registered)
- Grand Total clearly in ₦

### 8. Bank Details
Bank Name · Account Name · 10-digit NUBAN Account Number

---

## Step-by-Step: Generate Your Invoice for Free

### Step 1: Open InvoiceGenerator.ng
Go to **[invoicegenerator.ng/free-invoice-generator-nigeria](https://invoicegenerator.ng/free-invoice-generator-nigeria)** — no sign-up, no download.

### Step 2: Upload Your Logo
Click the logo placeholder. A branded logo immediately elevates your document's credibility.

### Step 3: Fill In Details
Click any field and type directly — it's a live WYSIWYG editor. Fill your company name, address, and client billing details.

### Step 4: Add Line Items
Click **"Add Item"** for each service. Totals calculate automatically.

### Step 5: Apply 7.5% VAT
In the right-hand panel, toggle **"Add Tax"** → enter **7.5%**. The engine handles calculations error-free.

### Step 6: Try the AI Feature (Optional)
Click **"✨ Create with AI"** and type:
> *"Invoice Dangote Cement for 3 months IT support at ₦150,000/month. My company is TechPros Ltd. Include 7.5% VAT."*
The AI fills the entire template in seconds.

### Step 7: Download or Share via WhatsApp
Hit **Download PDF** for a high-quality document. Or click the **WhatsApp button** to send directly to your client's chat.

---

## Tips for Getting Paid Faster

- **Add your bank details directly on the invoice** — don't make clients ask
- **Set clear due dates** — "Net 14" is standard for small Nigerian businesses
- **Use automated reminders** — register a free account to get overdue alerts sent to clients on your behalf

---

## Conclusion

A properly formatted Naira invoice with your TIN, 7.5% VAT, and bank details signals to clients that you run a legitimate, organized business.

[**Create your free invoice in Naira now →**](https://invoicegenerator.ng/free-invoice-generator-nigeria)`,
  },
];

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find admin author
    let author = await prisma.user.findFirst({ where: { isAdmin: true } });
    if (!author) author = await prisma.user.findFirst();
    if (!author) {
      return NextResponse.json({ error: 'No users found. Create an admin account first.' }, { status: 400 });
    }

    const results: { slug: string; action: string }[] = [];

    for (const post of BLOG_POSTS) {
      const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });

      if (existing) {
        await prisma.blogPost.update({
          where: { slug: post.slug },
          data: { ...post, authorId: author.id },
        });
        results.push({ slug: post.slug, action: 'updated' });
      } else {
        await prisma.blogPost.create({
          data: { ...post, authorId: author.id },
        });
        results.push({ slug: post.slug, action: 'inserted' });
      }
    }

    return NextResponse.json({
      success: true,
      author: author.name,
      results,
      message: `${results.filter(r => r.action === 'inserted').length} posts inserted, ${results.filter(r => r.action === 'updated').length} updated. DELETE /api/admin/seed-blogs after use.`,
    });
  } catch (error) {
    console.error('[seed-blogs] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
