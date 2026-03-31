/**
 * SEO Blog Post Seeder
 * Run via: node --env-file=.env.local scripts/seed-seo-blogs.mjs
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('amazonaws.com')
    ? { rejectUnauthorized: false }
    : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n🚀 Starting SEO Blog Post Seeder...\n');

  // 1. Find an admin author
  let author = await prisma.user.findFirst({ where: { isAdmin: true } });
  if (!author) author = await prisma.user.findFirst();
  if (!author) {
    console.error('❌  No users found in database. Please create an admin account first.');
    process.exit(1);
  }
  console.log(`✅  Author: ${author.name} (${author.id})\n`);

  // 2. The 5 SEO posts
  const posts = [
    {
      title: 'The Ultimate Guide to FIRS VAT Registration for Nigerian Businesses',
      slug: 'firs-vat-registration-guide-nigerian-businesses',
      excerpt: 'Learn exactly how to register for Value Added Tax (VAT) with the Federal Inland Revenue Service (FIRS) in Nigeria, including requirements, timelines, and penalties.',
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `# The Ultimate Guide to FIRS VAT Registration for Nigerian Businesses

Operating a business in Nigeria comes with specific tax obligations, and registering for Value Added Tax (VAT) with the Federal Inland Revenue Service (FIRS) is one of the most critical. Neglecting VAT obligations can lead to severe financial penalties and business interruptions.

# What is VAT in Nigeria?

Value Added Tax (VAT) is a consumption tax placed on a product whenever value is added at each stage of the supply chain. In Nigeria, the standard VAT rate is currently **7.5%**, following the Finance Act of 2020.

VAT is collected on behalf of the government by businesses and remitted to the FIRS by the **21st day of the following month**.

## Who Needs to Register for VAT?

Any individual, corporation, or organization doing business in Nigeria that supplies taxable goods or services must register for VAT. The Finance Act introduced a threshold: **businesses with an annual turnover of less than ₦25 million are exempted**.

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
You must register at the Micro and Small Tax Office closest to your registered business address.

**Step 2: Submit your documents**
Take the documents listed above to the Tax Controller's office.

**Step 3: Obtain your Taxpayer Identification Number (TIN)**
If you registered your company with the CAC recently, you may already have a TIN. Otherwise, FIRS will process your documents and issue one.

**Step 4: Receive your VAT Certificate**
Once processed (usually 1–3 weeks), you receive a VAT Registration Certificate. This must be displayed at your business premises.

## How to Invoice with VAT in Nigeria

Once registered, a valid Nigerian tax invoice must include:
- Your Company Name, Address, and TIN
- The Buyer's Name and Address
- Description of Goods/Services
- The 7.5% VAT amount clearly separated from the subtotal
- The phrase **"Tax Invoice"**

> **Tip:** Use [InvoiceGenerator.ng](https://invoicegenerator.ng/invoice-generator-nigeria) to automatically calculate 7.5% Nigerian VAT on all invoices in seconds — no manual errors.

## Penalties for Non-Compliance

- **Failure to Register:** ₦50,000 for the first month, ₦25,000 for each subsequent month.
- **Failure to Remit:** 10% penalty on unremitted tax, plus CBN lending rate interest.

## Conclusion

By organizing your documents, registering promptly, and using automated invoicing tools to issue proper Tax Invoices, you guarantee compliance and avoid costly FIRS penalties.`,
    },
    {
      title: 'How to Get Your VAT Registration Number (TIN) in Nigeria',
      slug: 'how-to-get-vat-registration-number-tin-nigeria',
      excerpt: 'Learn the exact steps, requirements, and online processes for Nigerian businesses and individuals to acquire their Taxpayer Identification Number (TIN) from FIRS.',
      coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `# How to Get Your VAT Registration Number (TIN) in Nigeria

If you intend to open a corporate bank account, get a government loan, bid for contracts, or collect Value Added Tax (VAT), you need a **Taxpayer Identification Number (TIN)**.

Your TIN is your unique identifier with the Federal Inland Revenue Service (FIRS) and the Joint Tax Board (JTB) of Nigeria.

## What is a TIN?

A TIN is a unique 14-digit number assigned to individuals, businesses, and registered companies by the government for tax records. Without a TIN, you cannot legally operate as a registered corporate entity, and your invoices may be rejected by government agencies and large corporations.

## Is TIN Registration Free?

**Yes, 100% free.** If anyone charges you for a TIN certificate, they are acting fraudulently. You only pay fees if you hire a professional to process it on your behalf.

## For Recently-Registered Companies (Post-2020)

The CAC and FIRS integrated their systems, so **your TIN is generated automatically when you register a company with the CAC**.

To retrieve your automatically generated TIN:
1. Visit the JTB TIN Verification Portal: [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng)
2. Enter your CAC Registration Number (RC Number or BN Number)
3. Your TIN will be displayed — print it directly from the portal

## For Older Companies or Individuals

If your business was registered before the CAC-FIRS merger, or you are a sole proprietor/freelancer:

### Documents Required for Individuals:
- Completed TIN Application form (obtained from any FIRS office)
- Valid Identification (National ID, Driver's License, or Passport)
- Passport Photograph
- Proof of address (recent utility bill)

### Documents Required for Companies:
- Certificate of Incorporation
- Memorandum and Articles of Association
- Form CAC 1.1 (or old CAC 2 and 7)
- Official application letter on company letterhead
- Completed TIN Application form (stamped with company seal)

## Processing Time

With all documents in order, TIN issuance at the FIRS office typically takes **24 to 72 hours**.

## Why TIN Matters on Your Invoice

Nigerian corporate clients and all government agencies **will reject your invoice** if your TIN is missing, because they are legally required to remit Withholding Tax (WHT) on your behalf using it.

Make sure your invoicing tool supports embedding your TIN by default. With [InvoiceGenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria), you enter your TIN once in your company defaults and it appears on every invoice automatically.

## Bottom Line

For most modern businesses, a TIN is generated at the point of CAC registration. For everyone else, a quick trip to the local FIRS office with the right documents is all you need to become fully tax-compliant.`,
    },
    {
      title: 'What is a Debit Note and When is it Issued? (With Nigerian Examples)',
      slug: 'what-is-debit-note-nigeria-when-issued-examples',
      excerpt: 'Understand the difference between a debit note, credit note, and invoice. Learn when a debit note is issued in Nigerian accounting with practical business examples.',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `# What is a Debit Note and When is it Issued? (With Nigerian Examples)

If you have ever been undercharged by a supplier or accidentally issued an invoice for less than agreed, you might wonder how to legally correct the shortfall without voiding the entire transaction. This is where a **Debit Note** comes in.

## What is a Debit Note?

A **Debit Note** (also called a debit memo) is a commercial document used to notify a trading partner that their account has been **debited** — meaning the amount they owe has increased.

- **When a seller sends it to a buyer:** "You owe me more than the original invoice stated."
- **When a buyer sends it to a seller:** "I am returning these goods, so reduce what I owe you."

## Debit Note vs. Credit Note vs. Invoice

| Document | Issued By | Purpose |
|---|---|---|
| **Invoice** | Seller | Original payment request |
| **Credit Note** | Seller | Reduces amount the buyer owes |
| **Debit Note** | Seller or Buyer | Increases amount owed |

## Common Scenarios: When is a Debit Note Issued?

### Scenario 1: Seller Undercharged the Buyer
Your Lagos marketing agency quotes a client ₦500,000 for a campaign. The accountant accidentally invoices ₦450,000. Instead of cancelling the original invoice (disrupting the client's records), you issue a **Debit Note for ₦50,000** to cover the shortfall.

### Scenario 2: Post-Invoice Price Increases
A supply contract includes a fuel surcharge clause. After an invoice was issued, diesel prices spike 30%. The supplier issues a debit note to recover the difference before delivery.

### Scenario 3: Extra Logistics Costs
A vendor ships goods from Kano to Port Harcourt. The actual freight cost exceeds the estimate by ₦15,000. The vendor issues a debit note for the ₦15,000 freight difference.

### Scenario 4: Buyer Returning Damaged Goods
A buyer receives 10 laptops, but 2 are defective. They return the 2 units and issue a debit note to the supplier stating: "Reduce my payable by ₦80,000 for 2 returned units." The supplier typically responds with a Credit Note.

## What Must a Debit Note Include?

To be commercially and legally valid in Nigeria, a debit note must contain:

1. The header: **"DEBIT NOTE"**
2. Date of issue
3. A unique Debit Note Number
4. Reference to the original Invoice Number
5. Both parties' details (Name, Address, TIN)
6. Clear description of the reason for the debit
7. The supplementary amount in NGN
8. VAT adjustments where applicable

## Best Practices

- Always notify the client verbally before sending a debit note — unexplained charges damage relationships.
- Ensure every debit note explicitly references the original invoice for audit trail purposes.
- Use a professional invoicing system to generate and track these documents. [InvoiceGenerator.ng](https://invoicegenerator.ng/invoice-generator-nigeria) keeps your billing documents organized and client-ready.`,
    },
    {
      title: 'The 5 Best Apps for Invoicing in Nigeria (2026 Rankings)',
      slug: 'best-invoicing-apps-software-nigeria',
      excerpt: 'Compare the top 5 invoicing and billing apps for Nigerian businesses, freelancers, and agencies. Ranked by Naira (NGN) support, ease of use, and FIRS tax compliance.',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `# The 5 Best Apps for Invoicing in Nigeria (2026 Rankings)

Whether you are a freelance designer in Yaba, a consulting firm in Abuja, or a boutique in Lekki, struggling with Word document invoices is holding your business back. Nigerian businesses need invoicing tools that understand local realities: billing in Naira (₦), handling FIRS 7.5% VAT, and sharing documents quickly over WhatsApp.

Here are the 5 best invoicing apps for Nigerian businesses in 2026.

---

## 1. InvoiceGenerator.ng — Best Overall

If you need a beautiful, professional invoice in under 60 seconds without signing up for complex accounting software, **InvoiceGenerator.ng** is the #1 choice for Nigerians.

**Why it ranks first:**
- **No account required** to create your first invoice
- **Built for Nigeria:** handles ₦ formatting and automatic 7.5% VAT calculation natively
- **AI-powered:** type a plain English prompt like *"Invoice MTN ₦200,000 for 2 months social media management"* and the tool fills everything out
- **WhatsApp sharing:** send PDF invoices directly to your client's chat in one click
- **Free tier:** unlimited free invoices with no watermark restrictions

**Best for:** Freelancers, SMEs, and consultants who want fast, professional PDF invoices.

---

## 2. Paystack Invoices — Best for Instant Payment Collection

Paystack is synonymous with Nigerian digital payments. Their invoicing feature sits directly inside the Paystack Dashboard.

**Strengths:**
- Invoice acts as an instant payment link (Card, USSD, Bank Transfer)
- Automated overdue reminders
- Syncs with your Paystack transaction history

**Best for:** E-commerce businesses and agencies primarily collecting instant digital payments.

---

## 3. Zoho Invoice — Best Free All-in-One

Zoho Invoice is a powerful global tool that recently became **100% free** for small businesses.

**Strengths:**
- Completely free regardless of number of clients
- Built-in time tracker that converts hours into invoice line items
- Client portal where customers can view their full billing history

**Drawback:** Steeper learning curve; not tailored specifically to Nigerian tax workflows.

---

## 4. Wave Accounting — Best for Full Bookkeeping

Wave is ideal for very small businesses (1–9 staff) that want accounting, not just invoicing.

**Strengths:**
- Free profit/loss statements and balance sheets
- Recurring invoices for retainer clients
- Receipt scanning for expense tracking

**Drawback:** Payment processing is unavailable in Nigeria; use it strictly for document generation and bookkeeping.

---

## 5. Flutterwave Invoices — Best for International Billing

A direct Paystack competitor, Flutterwave shines for cross-border invoicing.

**Strengths:**
- Multi-currency invoicing (USD, GBP, KES, NGN) with local NGN settlement
- Works seamlessly for Nigerian freelancers with international clients
- Instant shareable payment links

**Best for:** Freelancers and agencies billing in foreign currencies.

---

## Conclusion

| Need | Best App |
|---|---|
| Fastest professional PDF | InvoiceGenerator.ng |
| Instant payment collection | Paystack Invoices |
| Full bookkeeping suite | Wave Accounting |
| International billing | Flutterwave Invoices |
| Free client portal | Zoho Invoice |

For the fastest, most localized experience with AI assistance and WhatsApp sharing, **[InvoiceGenerator.ng](https://invoicegenerator.ng)** is unmatched for the Nigerian market.`,
    },
    {
      title: 'How to Create a Free Professional Invoice in Naira (NGN) in 60 Seconds',
      slug: 'how-to-create-free-professional-invoice-naira',
      excerpt: 'Stop using messy Word documents. Learn the anatomy of a legal Nigerian invoice and how to generate a free, professional PDF invoice in Naira in under 60 seconds.',
      coverImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d97?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `# How to Create a Free Professional Invoice in Naira (NGN) in 60 Seconds

First impressions matter. Sending a WhatsApp message saying *"Please pay 200k to my GTB account"* signals to corporate clients that you are an amateur. Meanwhile, wrestling with broken Microsoft Word invoice templates wastes time you could spend doing actual work.

Here is the definitive guide to generating a free, legally sound, and highly professional invoice in Nigerian Naira.

## The Legal Anatomy of a Nigerian Invoice

Before generating your invoice, ensure it contains all elements required by Nigerian business standards and FIRS:

### 1. Document Title
Use **"INVOICE"** at the top. VAT-registered entities must use **"TAX INVOICE"**.

### 2. Unique Invoice Number
Every invoice needs a sequential unique identifier (e.g., INV-001, INV-002) to prevent accounting duplicates and satisfy audit requirements.

### 3. Dates
- **Invoice Date:** The day the invoice is issued
- **Due Date:** The payment deadline (e.g., Net 30 = due in 30 days)

### 4. Your Company Details
- Logo
- Business Name
- Address (City, State)
- Phone / Email
- TIN (required for Tax Invoices)

### 5. Client Details (Bill To)
- Client Company Name
- Client Address and Contact

### 6. Line Items
Be specific. Instead of *"Work done"*, write *"UI/UX Design: Homepage Redesign — 1 unit @ ₦250,000"*. Vague descriptions cause payment delays.

### 7. Subtotal, VAT, and Total in ₦
- Subtotal of all line items
- 7.5% VAT (if registered) shown separately
- Grand Total in Nigerian Naira

### 8. Payment Details
- Bank Name (e.g., Zenith Bank, GTBank)
- Account Name
- Account Number (10-digit NUBAN)

---

## Step-by-Step: Generate Your Invoice for Free

### Step 1: Open InvoiceGenerator.ng
Go to **[invoicegenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria)** on any device — phone, tablet, or laptop. **No sign-up or download required.**

### Step 2: Upload Your Logo
Click the logo placeholder on the top left. Uploading your logo immediately elevates the document from generic to branded.

### Step 3: Fill In Your Details
Click on any field and type directly — it works like a WYSIWYG editor. Fill in your company name, address, client name, and billing address.

### Step 4: Add Line Items
Click **"Add Item"** for each service or product. The platform calculates running totals automatically. No manual math.

### Step 5: Add 7.5% VAT
In the right-hand settings panel, toggle **"Add Tax"** and enter **7.5%**. The engine applies the correct amount to your subtotal instantly.

### Step 6: Try the AI Feature (Optional)
Click **"✨ Create with AI"** and type:
> *"Invoice Dangote Cement for 3 months IT support at ₦150,000/month. My company is TechPros Ltd. Include 7.5% VAT."*

The AI fills the entire invoice template for you in seconds.

### Step 7: Download PDF or Send via WhatsApp
Hit **Download PDF** for a high-quality, print-ready document. Or use the **WhatsApp button** to send it directly to your client's chat — ideal for Nigeria's WhatsApp-first business culture.

---

## Pro Tips for Getting Paid Faster

- **Add your bank details** directly on the invoice — clients should not need to ask.
- **Set clear due dates** — "Net 14" (14 days) is standard for small Nigerian businesses.
- **Follow up automatically** — register a free account on InvoiceGenerator.ng to get automated payment reminder emails sent to your clients on your behalf.

---

## Conclusion

Getting paid faster starts with looking professional from the very first touchpoint. A properly formatted Naira invoice with your TIN, 7.5% VAT, and clear bank details signals to clients that you run a legitimate, organized operation.

[Create your free invoice in Naira now →](https://invoicegenerator.ng/free-invoice-generator-nigeria)`,
    },
  ];

  // 3. Upsert posts
  let inserted = 0;
  let updated = 0;

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      await prisma.blogPost.update({ where: { slug: post.slug }, data: post });
      console.log(`  🔄  Updated:  "${post.title}"`);
      updated++;
    } else {
      await prisma.blogPost.create({ data: post });
      console.log(`  ✅  Inserted: "${post.title}"`);
      inserted++;
    }
  }

  console.log(`\n🎉  Done! Inserted: ${inserted} | Updated: ${updated}\n`);
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
