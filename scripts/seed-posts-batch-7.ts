import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString,
    ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────────────────────
// SEO METADATA
//
// Post 1 — "How to Invoice as a Photographer in Nigeria"
//   Meta title : "How to Invoice as a Photographer in Nigeria | InvoiceGenerator.ng" (67 chars)
//   Meta desc  : "A complete guide for Nigerian photographers on creating professional
//                 invoices: pricing models, VAT at 7.5%, deposits, file release
//                 policies, and getting paid." (157 chars)
//
// Post 2 — "Business Invoice vs Commercial Invoice Nigeria"
//   Meta title : "Business Invoice vs Commercial Invoice Nigeria | InvoiceGenerator.ng" (69 chars)
//   Meta desc  : "Understand the difference between a business invoice and a commercial
//                 invoice in Nigeria — when to use each, what customs requires,
//                 and FIRS compliance rules." (157 chars)
//
// Post 3 — "How to Add a Payment Link to an Invoice in Nigeria"
//   Meta title : "How to Add a Payment Link to an Invoice in Nigeria" (51 chars)
//   Meta desc  : "Learn how to add a Paystack payment link to your Nigerian invoice so
//                 clients can pay instantly by card or bank transfer — and get
//                 paid faster." (153 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Invoice as a Photographer in Nigeria
    // Target keyword: "how to invoice as a photographer Nigeria"  (~1,200 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Photographer in Nigeria: Pricing, VAT & Getting Paid',
        slug: 'how-to-invoice-as-a-photographer-nigeria',
        excerpt: 'A complete guide for Nigerian photographers on creating professional invoices: pricing models, VAT at 7.5%, deposits, file release policies, and getting paid on time.',
        coverImage: null,
        published: true,
        content: `Photography is a thriving profession in Nigeria — from wedding and event photographers in Lagos and Abuja to commercial, fashion, and product photographers serving brands across the country. Yet many talented Nigerian photographers still send informal payment requests over WhatsApp or rely on verbal agreements that lead to disputes and late payments.

A professional invoice protects your work, documents your agreement, and dramatically improves your chances of getting paid on time. This guide covers everything Nigerian photographers need to know.

## Photography Pricing Models and How to Invoice Each

### 1. Event Photography (Weddings, Birthdays, Corporate Events)
Typically priced as a flat day rate or half-day rate, sometimes with add-ons.

**Invoice example:**
| Description | Amount |
|---|---|
| Wedding photography — 8-hour coverage (30 Nov 2026) | ₦350,000 |
| Second photographer — 8 hours | ₦80,000 |
| Photo album (30 pages, hardcover) | ₦75,000 |
| Online gallery (private link, 6-month access) | ₦15,000 |
| **Subtotal** | **₦520,000** |
| **VAT (7.5%)** | **₦39,000** |
| **Total** | **₦559,000** |

### 2. Commercial / Brand Photography
Priced per shoot day plus usage licensing fees.

**Invoice example:**
| Description | Amount |
|---|---|
| Commercial product shoot — full day (studio hire included) | ₦280,000 |
| Image licensing — 12-month digital usage rights (Nigeria) | ₦120,000 |
| Post-production — 30 edited images | ₦60,000 |
| **Subtotal** | **₦460,000** |
| **VAT (7.5%)** | **₦34,500** |
| **Total** | **₦494,500** |

### 3. Portrait / Headshot Photography
Session fee plus prints or digital files.

**Invoice example:**
| Description | Amount |
|---|---|
| Professional headshot session — 1 hour | ₦45,000 |
| Digital delivery — 10 retouched images | ₦30,000 |
| **Subtotal** | **₦75,000** |
| **VAT (7.5%)** | **₦5,625** |
| **Total** | **₦80,625** |

### 4. Retainer / Ongoing Content
Monthly retainer for brands needing regular visual content.

**Invoice example:**
| Description | Amount |
|---|---|
| Monthly content retainer — March 2026 (2 shoot days, 40 edited images) | ₦200,000 |
| **Subtotal** | **₦200,000** |
| **VAT (7.5%)** | **₦15,000** |
| **Total** | **₦215,000** |

---

## Mandatory Elements on a Nigerian Photography Invoice

Under FIRS guidelines, every commercial invoice must include:

1. **Your name or business name and address**
2. **Tax Identification Number (TIN)** — if VAT-registered
3. **Client name and address** — with TIN for corporate clients
4. **Unique invoice number** — sequential (e.g., PHO-2026-018)
5. **Invoice date and due date**
6. **Itemised services** — shoot type, post-production, extras
7. **VAT at 7.5%** — shown as a separate line item (if registered)
8. **Payment details** — bank account or Paystack link

---

## Do Nigerian Photographers Pay VAT?

If your annual photography income exceeds **₦25 million**, you must register for VAT with FIRS and charge 7.5% on all invoices. Below that threshold, registration is optional.

Even if you are not VAT-registered, your corporate clients may ask for your TIN for their own record-keeping. Register for a TIN with FIRS — it is free and takes minutes online.

### Image Licensing and VAT
**Usage licensing fees are also subject to VAT** when charged as part of a commercial photography invoice. Do not separate them to avoid VAT — all fees for your professional services and rights are taxable.

---

## Withholding Tax (WHT) for Photographers

When corporate clients (companies) pay you, they are required to deduct **5% Withholding Tax** and remit it to FIRS. They should issue you a WHT credit note for the amount deducted.

**Example:**
- Your invoice: ₦460,000 service fee + ₦34,500 VAT = ₦494,500
- WHT deducted: 5% × ₦460,000 = ₦23,000
- Client pays: ₦471,500
- WHT credit note: ₦23,000 (offsets your tax bill)

---

## Deposit Policy and File Release

### Always Take a Deposit
For event photography, collect a **non-refundable booking deposit** — typically 30–50% — to secure the date. No deposit, no booking.

For commercial shoots, collect 50% upfront before the shoot date.

Invoice structure for events:
1. **Booking deposit invoice** — issued immediately when the date is agreed
2. **Balance invoice** — issued 7–14 days before the event

### File Release Policy
Only release full-resolution, watermark-free images after full payment. Send low-resolution watermarked proofs for selection.

State this on your invoice: *"Full-resolution files will be delivered within [X] working days of receipt of full payment."*

This protects you from clients who take delivery and then dispute the bill.

---

## Getting Paid on Time

1. **Set specific due dates** — "Payment due 7 days from invoice date" is clearer than "Net 30"
2. **Include a Paystack link** — let clients pay by card or bank transfer instantly
3. **Send via WhatsApp and email** — most Nigerian clients are more responsive on WhatsApp
4. **Follow up 2 days before the due date** with a polite reminder
5. **Charge late fees** — state on every invoice: *"Overdue balances attract interest at 3% per month"*

---

## Photography Invoice Checklist

Before sending, confirm:

- [ ] Invoice number is unique and sequential
- [ ] Shoot date and deliverables are clearly described
- [ ] Usage rights (if applicable) are specified
- [ ] VAT is calculated at 7.5% (if registered)
- [ ] Deposit received is noted on the balance invoice
- [ ] Bank details or Paystack link is included
- [ ] File release policy is stated
- [ ] Due date is a specific calendar date

---

## Create Your Photography Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian photographers. Create professional, itemised invoices with automatic VAT, Paystack payment links, and instant WhatsApp sharing — no design skills needed.

Also see our full **[Nigerian Invoicing Guide](/guide)** covering FIRS compliance, VAT registration, and freelancer billing best practices.`,
    },

    // =========================================================================
    // POST 2 — Business Invoice vs Commercial Invoice Nigeria
    // Target keyword: "commercial invoice Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'Business Invoice vs Commercial Invoice Nigeria: Key Differences Explained',
        slug: 'business-invoice-vs-commercial-invoice-nigeria',
        excerpt: 'Understand the difference between a business invoice and a commercial invoice in Nigeria — when to use each, what customs requires, and FIRS compliance rules.',
        coverImage: null,
        published: true,
        content: `Many Nigerian business owners use the terms "business invoice" and "commercial invoice" interchangeably — but they are not the same document. Using the wrong one, or including incorrect information on either, can lead to customs delays, payment disputes, or FIRS compliance issues.

This guide explains the difference, when each applies, and what each must include under Nigerian law.

## What Is a Business Invoice?

A **business invoice** (also called a tax invoice or sales invoice) is a document issued by a seller to a buyer requesting payment for goods or services delivered within Nigeria. It is the standard invoice used for domestic commercial transactions.

**Used for:**
- Services rendered (consulting, design, legal, accounting)
- Goods sold within Nigeria
- Retainer and subscription billing
- Any domestic B2B or B2C transaction

**Key requirements under FIRS guidelines:**
- Seller's name, address, and TIN (if VAT-registered)
- Buyer's name and address
- Unique invoice number and date
- Itemised description of goods or services
- Amount in Naira (₦)
- VAT at 7.5% shown separately (if seller is VAT-registered)
- Payment terms and due date

---

## What Is a Commercial Invoice?

A **commercial invoice** is a specific document used in **international trade** — for the import or export of goods. It is required by Nigerian Customs Service (NCS) and the destination country's customs authority to:

- Determine the customs value of the goods (for duty calculation)
- Verify the contents of the shipment
- Establish the legal transaction between the exporter and importer

**Used for:**
- Importing goods into Nigeria
- Exporting goods from Nigeria
- Cross-border trade with other African countries
- Air freight and sea freight shipments

A commercial invoice is not a request for domestic payment — it is a trade document that accompanies the physical shipment.

---

## Side-by-Side Comparison

| | Business Invoice | Commercial Invoice |
|---|---|---|
| **Purpose** | Domestic payment request | International trade documentation |
| **Used for** | Services and goods within Nigeria | Import and export shipments |
| **Currency** | Nigerian Naira (₦) | Usually USD, EUR, or agreed currency |
| **Customs relevance** | None | Required by Nigerian Customs |
| **VAT** | 7.5% if seller is VAT-registered | Exports are zero-rated for VAT |
| **Shipping details** | Not required | Required (Incoterms, port, weight) |
| **Country of origin** | Not required | Required |
| **HS code** | Not required | Required for each product |

---

## What a Nigerian Commercial Invoice Must Include

If you are exporting goods from Nigeria or helping a client import, the commercial invoice must contain:

1. **Exporter details** — full name, address, country
2. **Importer details** — full name, address, country
3. **Invoice number and date**
4. **Description of goods** — specific, accurate, no abbreviations
5. **HS (Harmonised System) code** — the international tariff code for each product
6. **Quantity and unit of measure** — e.g., "500 units", "10 metric tonnes"
7. **Unit price and total value** — in the agreed currency (usually USD)
8. **Country of origin** — where the goods were manufactured
9. **Incoterms** — e.g., FOB Lagos, CIF Apapa, EXW Kano (defines who bears shipping costs and risk)
10. **Port of loading and port of destination**
11. **Gross weight and net weight**
12. **Shipping marks and container/airway bill reference**

**Example commercial invoice line items for a Nigerian exporter:**

| Description | HS Code | Qty | Unit Price (USD) | Total (USD) |
|---|---|---|---|---|
| Sesame seeds, raw, cleaned | 1207.40 | 20,000 kg | $0.85/kg | $17,000 |
| Packaging (jute sacks) | 6305.10 | 400 units | $2.50 | $1,000 |
| **Total FOB Apapa** | | | | **$18,000** |

---

## VAT on Commercial Invoices in Nigeria

Exports from Nigeria are **zero-rated for VAT** under the VAT Act. This means:
- Nigerian exporters charge **0% VAT** on exported goods
- They can claim back input VAT on costs incurred producing those goods
- The commercial invoice should show VAT at 0% or state "Zero-rated export"

Imports into Nigeria attract **import duty** and **VAT at 7.5%** on the customs value — but this is paid by the importer to Nigerian Customs, not shown on the commercial invoice issued by the foreign exporter.

---

## Common Mistakes on Nigerian Commercial Invoices

1. **Undervaluing goods** — declaring a lower value to reduce customs duty. This is customs fraud and attracts serious penalties from the Nigerian Customs Service.
2. **Vague descriptions** — writing "electronics" instead of specifying the exact product and HS code. This delays clearance.
3. **Wrong Incoterms** — using CIF when FOB was agreed. This creates disputes about who pays insurance and freight.
4. **Missing country of origin** — required for duty preference calculations under ECOWAS trade protocols.
5. **Currency mismatch** — invoicing in Naira for an international shipment when the contract specifies USD.

---

## When You Need Both Documents

If your Nigerian business sells goods locally and also exports:
- Use a **business invoice** for domestic customers (in Naira, with Nigerian VAT if applicable)
- Use a **commercial invoice** for export shipments (in agreed foreign currency, zero-rated for VAT)

They are separate documents for separate transactions — do not use the same template for both.

---

## Create Professional Nigerian Business Invoices

For your domestic transactions, **[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** generates fully compliant Nigerian business invoices with automatic VAT calculation, your TIN, and Paystack payment links — shareable via WhatsApp or email in seconds.

For more on Nigerian invoicing standards and FIRS compliance, see our complete **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — How to Add a Payment Link to an Invoice in Nigeria
    // Target keyword: "payment link invoice Nigeria"  (~900 words)
    // =========================================================================
    {
        title: 'How to Add a Payment Link to an Invoice in Nigeria (Paystack & Bank Transfer)',
        slug: 'how-to-add-payment-link-to-invoice-nigeria',
        excerpt: 'Learn how to add a Paystack payment link to your Nigerian invoice so clients can pay instantly by card or bank transfer — and get paid faster.',
        coverImage: null,
        published: true,
        content: `One of the biggest causes of late payment in Nigeria is friction. A client receives your invoice, intends to pay, then forgets because the process requires them to open their banking app, find your account number, type it in, and initiate a transfer. The more steps between intent and payment, the more likely they delay.

Adding a **payment link** to your invoice removes that friction. With one tap, your client lands on a payment page and completes the transaction by card, bank transfer, or USSD — in under a minute. This single change can reduce your average payment time from weeks to days.

## What Is a Payment Link?

A payment link is a URL that opens a hosted payment page where your client can pay a specific amount using their preferred method. In Nigeria, the most common payment link providers are:

- **Paystack** — the most widely used payment gateway in Nigeria; accepts cards, bank transfers, USSD, and mobile money
- **Flutterwave** — similar to Paystack; strong pan-African coverage
- **Moniepoint** — growing SME payment option
- **Squad by GTCo** — competitive rates, popular with tech businesses

This guide focuses on Paystack, which is integrated directly into [InvoiceGenerator.ng](https://www.invoicegenerator.ng/).

---

## Method 1: Use InvoiceGenerator.ng (Fastest)

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** has Paystack built in. When you create an invoice:

1. Fill in your client details, services, and amounts
2. The invoice automatically calculates VAT at 7.5% if enabled
3. A **Pay Now** button linked to a Paystack checkout page is included on the invoice
4. Share the invoice link via WhatsApp or email — your client clicks **Pay Now** and completes payment instantly

No Paystack developer account needed. No API keys. No setup. The payment link is generated automatically with each invoice.

---

## Method 2: Create a Paystack Payment Link Manually

If you use a different invoice tool, you can generate a Paystack payment link separately and paste it onto your invoice.

### Step 1: Create a Paystack Account
Go to paystack.com and register a business account. You will need:
- Business name and email
- BVN for identity verification
- CAC registration number (for registered businesses) or personal ID (for sole traders)

### Step 2: Generate a Payment Link
In your Paystack dashboard:
1. Go to **Payment Pages** > **Create Payment Page**
2. Enter:
   - Page name (e.g., "Invoice INV-2026-041 — Adebayo Design Studio")
   - Amount (enter the exact invoice total)
   - Description (optional — e.g., "Brand identity design, March 2026")
3. Click **Create**
4. Copy the payment link generated (e.g., "paystack.com/pay/adebayo-inv-041")

### Step 3: Add the Link to Your Invoice
Paste the Paystack link into your invoice as:
- A clickable URL in a PDF or digital invoice
- A **"Pay Now"** button if your invoice tool supports custom HTML
- A QR code (Paystack generates one automatically for each payment page)

**Invoice footer example:**
> *Pay securely online: paystack.com/pay/adebayo-inv-041*
> *Accepted: Visa, Mastercard, bank transfer, USSD*

---

## Method 3: Generate a Paystack Invoice Directly

Paystack has a built-in invoicing feature that generates a payment link automatically.

1. In your Paystack dashboard, go to **Invoices** > **Create Invoice**
2. Add the client's email, items, and amounts
3. Paystack generates a professional invoice with a built-in **Pay Now** button
4. Send via email directly from Paystack

**Limitation:** Paystack invoices are less customisable than dedicated invoice tools and do not support your own branding, custom terms, or WhatsApp sharing as easily.

---

## Payment Methods Available via Paystack

When your client clicks your Paystack payment link, they can pay via:

| Method | Details |
|---|---|
| **Debit/Credit Card** | Visa, Mastercard, Verve |
| **Bank Transfer** | Direct transfer to a virtual account number |
| **USSD** | Pay via *737#, *901#, *966#, and other bank codes |
| **Mobile Money** | Available for M-Pesa (cross-border) |
| **QR Code** | Scan to pay |

Bank transfer via Paystack is particularly popular in Nigeria — the client gets a unique virtual account number to transfer to, and the payment is confirmed instantly.

---

## Tips for Using Payment Links Effectively

### 1. Match the Amount Exactly
Create a payment link for the **exact invoice total** (including VAT). Clients paying a different amount creates reconciliation headaches.

### 2. Include the Invoice Number in the Payment Page Title
Name your Paystack payment page "Invoice INV-2026-041" so the payment appears with a clear reference in your Paystack dashboard.

### 3. Send a Reminder with the Link
When following up on overdue invoices, always include the payment link in your reminder message. Make it as easy as possible.

### 4. Confirm Receipt
Paystack sends you an email and dashboard notification when payment is received. Confirm with your client and mark the invoice paid.

### 5. Issue a Receipt
After payment, send a formal receipt — separate from the invoice. A receipt confirms payment was received; an invoice requests payment.

---

## Reduce Payment Friction, Get Paid Faster

Nigerian businesses that add payment links to their invoices consistently report faster payment — often within 24–48 hours of invoice delivery, compared to days or weeks for bank-transfer-only invoices.

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** includes Paystack payment links on every invoice automatically. Create your free invoice today and start getting paid faster.

For more on invoicing best practices and FIRS compliance, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 7 blog posts (${posts.length} posts)...\n`);

    const author = await prisma.user.findFirst({
        where: { email: 'adebayoadesokan@gmail.com' },
    });

    if (!author) {
        throw new Error('Author not found. Check the email address.');
    }

    console.log(`Author: ${author.name} (${author.email})\n`);

    for (const post of posts) {
        const result = await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: { ...post, authorId: author.id },
            create: { ...post, authorId: author.id },
        });
        console.log(`✅  ${result.title}`);
        console.log(`    /blog/${result.slug}\n`);
    }

    console.log(`Done — ${posts.length} posts live.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
