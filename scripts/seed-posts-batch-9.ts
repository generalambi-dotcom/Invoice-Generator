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
// Post 1 — "How to Write an Invoice for Services Rendered in Nigeria"
//   Meta title : "How to Write an Invoice for Services Rendered in Nigeria" (56 chars)
//   Meta desc  : "Step-by-step guide to writing a services invoice in Nigeria.
//                 Covers mandatory elements, VAT at 7.5%, FIRS compliance,
//                 payment terms, and a free template." (153 chars)
//
// Post 2 — "Debit Note Nigeria"
//   Meta title : "Debit Note Nigeria: What It Is and When to Use One | InvoiceGenerator.ng" (72 chars)
//   Meta desc  : "Learn what a debit note is in Nigeria, how it differs from a credit
//                 note and an invoice, when to issue one, and how to format it
//                 for FIRS compliance." (154 chars)
//
// Post 3 — "How to Invoice International Clients from Nigeria"
//   Meta title : "How to Invoice International Clients from Nigeria | InvoiceGenerator.ng" (71 chars)
//   Meta desc  : "A guide for Nigerian freelancers and businesses on invoicing foreign
//                 clients: USD billing, CBN FX rules, domiciliary accounts,
//                 Wise, Payoneer, and VAT." (155 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Write an Invoice for Services Rendered in Nigeria
    // Target keyword: "invoice for services rendered Nigeria"  (~1,100 words)
    // =========================================================================
    {
        title: 'How to Write an Invoice for Services Rendered in Nigeria (With Template)',
        slug: 'how-to-write-invoice-for-services-rendered-nigeria',
        excerpt: 'Step-by-step guide to writing a services invoice in Nigeria. Covers mandatory elements, VAT at 7.5%, FIRS compliance, payment terms, and a free template.',
        coverImage: null,
        published: true,
        content: `Whether you are a freelancer, sole trader, or registered business, knowing how to write a correct invoice for services rendered in Nigeria is a fundamental business skill. A proper invoice protects you legally, keeps your FIRS records clean, and — most importantly — gets you paid.

This guide walks you through every element of a Nigerian services invoice, step by step.

## What Is an Invoice for Services Rendered?

An invoice for services rendered is a formal payment request issued after you have completed work for a client. Unlike a proforma invoice (which is sent before work begins) or a quotation (which is a price offer), a services invoice confirms that the work has been done and payment is now due.

---

## Step-by-Step: How to Write a Services Invoice in Nigeria

### Step 1: Add Your Business Information

At the top of the invoice, include:

- **Full name** or registered business name
- **Business address** (physical address, not just a P.O. Box)
- **Phone number** and **email address**
- **Tax Identification Number (TIN)** — mandatory if you are VAT-registered; recommended even if not
- **CAC Registration Number** — if your business is registered with the Corporate Affairs Commission

### Step 2: Add the Client's Information

- Client's full name or company name
- Client's physical address
- Client's email and phone number
- Client's TIN — required for B2B invoices where the client will deduct WHT or claim input VAT

### Step 3: Assign an Invoice Number and Date

- **Invoice number** — unique and sequential (e.g., INV-2026-022). Never reuse numbers.
- **Invoice date** — the date you issue the invoice
- **Due date** — the specific calendar date payment is expected (e.g., "Due: 25 March 2026")

Avoid vague terms like "Due on receipt" or "Net 30" without a specific date — these create ambiguity and delay payment.

### Step 4: Describe the Services Rendered

This is the most important section. Be specific and itemised. Vague descriptions like "Services rendered — ₦200,000" invite disputes.

**Good example:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| Brand strategy workshop facilitation (3-hour session, 10 Feb 2026) | 1 | ₦120,000 | ₦120,000 |
| Competitor analysis report (delivered 20 Feb 2026) | 1 | ₦85,000 | ₦85,000 |
| Brand positioning document (delivered 28 Feb 2026) | 1 | ₦95,000 | ₦95,000 |
| **Subtotal** | | | **₦300,000** |
| **VAT (7.5%)** | | | **₦22,500** |
| **Total Due** | | | **₦322,500** |

**Bad example:**
> Professional services — March 2026: ₦300,000

### Step 5: Calculate and Show VAT

If you are VAT-registered with FIRS:
- Calculate VAT at **7.5%** on the subtotal (before VAT)
- Show VAT as a **separate line item** — do not roll it into the total
- Your VAT registration number must appear on the invoice

If you are not VAT-registered, do not include a VAT line. Charging VAT without FIRS registration is a compliance violation.

### Step 6: Add Payment Details

- **Bank name**
- **Account number**
- **Account name** (must match your registered business or personal name exactly)
- Or a **Paystack payment link** for instant card or bank transfer payment

### Step 7: Add Payment Terms

State your terms clearly:

> *"Payment is due by 25 March 2026. Overdue balances attract interest at 3% per month. Please reference invoice number INV-2026-022 with your payment."*

### Step 8: Add Your Signature (Optional but Recommended)

For formal B2B invoices, a signature or stamp adds credibility. For digital invoices, your name and title is sufficient.

---

## Free Services Invoice Template — Nigeria

---

**INVOICE**

**[Your Business Name]**
[Address] | [Phone] | [Email]
TIN: [Your TIN] | CAC No: [Your RC Number]

**Invoice No:** INV-2026-XXX
**Invoice Date:** [Date]
**Due Date:** [Due Date]

**Bill To:**
[Client Name / Company]
[Client Address]
[Client TIN]

| Description | Qty | Rate (₦) | Amount (₦) |
|---|---|---|---|
| [Service description — be specific] | | | |
| [Service description — be specific] | | | |
| **Subtotal** | | | |
| **VAT (7.5%)** | | | |
| **TOTAL DUE** | | | |

**Payment Details:**
Bank: [Bank Name]
Account Number: [Account Number]
Account Name: [Account Name]

**Payment Terms:** Payment due by [specific date]. Overdue balances attract 3% monthly interest.

*Thank you for your business.*

---

## Common Mistakes on Nigerian Services Invoices

1. **No due date** — "Payment due on receipt" is not enforceable. Use a specific date.
2. **Lump-sum description** — always itemise; do not bundle services into one line
3. **Wrong VAT calculation** — VAT is 7.5% of the subtotal, not of the total
4. **No invoice number** — required by FIRS for VAT invoices; essential for record-keeping
5. **Missing TIN** — if VAT-registered, your TIN must appear on every invoice
6. **No payment reference instruction** — tell clients what reference to use so you can match incoming payments

---

## Send Your Invoice via WhatsApp

Most Nigerian clients respond faster on WhatsApp than email. Save your invoice as a PDF and send it on WhatsApp — then follow up on email for formal documentation.

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** lets you create a professional services invoice in under 2 minutes, with automatic VAT calculation, Paystack payment links, and direct WhatsApp sharing.

For the full guide to Nigerian invoicing compliance, payment terms, and FIRS requirements, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 2 — Debit Note Nigeria
    // Target keyword: "debit note Nigeria"  (~950 words)
    // =========================================================================
    {
        title: 'Debit Note Nigeria: What It Is, When to Use One & How to Format It',
        slug: 'debit-note-nigeria-what-it-is-when-to-use',
        excerpt: 'Learn what a debit note is in Nigeria, how it differs from a credit note and an invoice, when to issue one, and how to format it for FIRS compliance.',
        coverImage: null,
        published: true,
        content: `Many Nigerian business owners are familiar with invoices and receipts, but debit notes remain poorly understood — even though they are a standard tool in B2B accounting. Knowing when and how to use a debit note can save you from invoice disputes, keep your VAT records accurate, and maintain professional relationships with clients and suppliers.

## What Is a Debit Note?

A **debit note** is a document issued by a buyer to a seller (or by a seller to a buyer in specific circumstances) to formally request an adjustment that increases the amount owed.

The most common use: a **buyer issues a debit note to a seller** when the seller has undercharged, when goods were returned to a supplier and a refund is owed, or when there is a price discrepancy between the purchase order and the invoice received.

Conversely, a **seller can issue a debit note** as an alternative to raising a supplementary invoice — for example, to charge for additional work not included in the original invoice.

---

## Debit Note vs Credit Note vs Invoice

These three documents are closely related. Here is how they differ:

| Document | Issued by | Effect on balance | Common use |
|---|---|---|---|
| **Invoice** | Seller | Increases amount buyer owes | Billing for goods or services |
| **Credit note** | Seller | Reduces amount buyer owes | Overcharge, return, cancellation |
| **Debit note** | Buyer or Seller | Increases amount owed | Undercharge correction, price dispute, returns to supplier |

Think of a debit note as the buyer's equivalent of the seller's invoice — it formally records that an additional amount is owed or a credit is due from the supplier.

---

## Common Situations Requiring a Debit Note in Nigeria

### 1. Undercharge on a Supplier Invoice
You receive an invoice from your supplier for ₦150,000, but the agreed price was ₦175,000. Rather than asking the supplier to reissue the invoice, you issue a debit note for the ₦25,000 difference, formally notifying the supplier to charge you the correct amount.

### 2. Returning Goods to a Supplier
You return ₦40,000 worth of defective goods to your Lagos supplier. You issue a debit note for ₦40,000 (plus VAT adjustment) to inform the supplier that they owe you this credit.

### 3. Price Variation on a Construction Contract
A contractor completes additional work not covered in the original contract. Rather than issuing a new invoice, the contractor issues a debit note to document the variation and request payment for the extra work.

### 4. Inter-Company Charges
Within a group of related companies, debit notes are commonly used to allocate shared costs — e.g., a parent company issues a debit note to a subsidiary for management fees or shared IT costs.

---

## What a Nigerian Debit Note Must Include

A compliant debit note should contain:

1. **The words "DEBIT NOTE"** — clearly at the top of the document
2. **Your business name, address, and TIN**
3. **Recipient's business name, address, and TIN**
4. **Debit note number** — unique and sequential (e.g., DN-2026-004)
5. **Date of issue**
6. **Reference to the original invoice or purchase order** — e.g., "Re: Invoice INV-2026-031 dated 1 February 2026"
7. **Reason for the debit note** — clear and specific
8. **Itemised amounts** — what is being charged and why
9. **VAT adjustment** — if the underlying transaction attracts VAT

---

## Debit Note Example — Nigeria

**Situation:** Emeka Supplies Ltd received Invoice INV-2026-031 from Eze Traders for ₦200,000 + VAT. The agreed contract price was ₦230,000 + VAT. Emeka Supplies issues a debit note to Eze Traders for the ₦30,000 shortfall.

---

**DEBIT NOTE**
**Emeka Supplies Ltd**
22 Industrial Avenue, Apapa, Lagos | TIN: 9876543-0001

**Debit Note No:** DN-2026-004
**Date:** 15 March 2026
**Re: Invoice INV-2026-031 from Eze Traders, dated 1 February 2026**

**To:**
Eze Traders Ltd
Plot 7 Trans-Amadi, Port Harcourt
TIN: 1122334-0002

**Reason:** Undercharge on Invoice INV-2026-031. Agreed contract price per LPO No. PH-2026-009 was ₦230,000. Invoice received was ₦200,000.

| Description | Amount |
|---|---|
| Price shortfall — Invoice INV-2026-031 | ₦30,000 |
| **VAT (7.5%)** | **₦2,250** |
| **Total amount due** | **₦32,250** |

*Please issue a revised invoice or supplementary invoice for ₦32,250 at your earliest convenience.*

---

## VAT on Debit Notes in Nigeria

When a debit note relates to a VATable transaction, the VAT adjustment must be included. FIRS requires that VAT records (both output VAT for the seller and input VAT for the buyer) reflect the debit note adjustment.

The seller receiving the debit note should:
- Issue a supplementary invoice or confirm the additional amount
- Declare the additional output VAT in their next monthly VAT return

The buyer issuing the debit note should:
- Retain the debit note as documentation for an increased input VAT claim (once the supplier confirms)

---

## Debit Note Numbering

Use a separate sequential series for debit notes — distinct from your invoices and credit notes. A common prefix is **DN-** (e.g., DN-2026-001).

---

## Create FIRS-Compliant Invoices and Documents

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** helps Nigerian businesses create professional invoices for services and goods — with automatic VAT, sequential numbering, and WhatsApp delivery. For a full overview of Nigerian invoicing requirements, see our **[Nigerian Invoicing Guide](/guide)** and our companion post on **[credit notes in Nigeria](/blog/credit-note-nigeria-what-it-is-how-to-issue)**.`,
    },

    // =========================================================================
    // POST 3 — How to Invoice International Clients from Nigeria
    // Target keyword: "invoice international clients Nigeria"  (~1,200 words)
    // =========================================================================
    {
        title: 'How to Invoice International Clients from Nigeria: USD Billing, FX Rules & Getting Paid',
        slug: 'how-to-invoice-international-clients-nigeria',
        excerpt: 'A guide for Nigerian freelancers and businesses on invoicing foreign clients: USD billing, CBN FX rules, domiciliary accounts, Wise, Payoneer, and VAT treatment.',
        coverImage: null,
        published: true,
        content: `Nigeria has one of Africa's largest communities of remote workers and freelancers billing international clients. Developers, designers, writers, consultants, and digital marketers are earning in USD, GBP, and EUR — but navigating the foreign exchange rules, receiving international payments, and structuring invoices correctly remains confusing for many.

This guide covers everything Nigerian freelancers and businesses need to know about invoicing foreign clients correctly.

## Can Nigerian Businesses Invoice in Foreign Currency?

**Yes.** Nigerian businesses can issue invoices denominated in foreign currency (USD, GBP, EUR, etc.) to international clients. The invoice currency should match the currency agreed in your contract.

However, there are important CBN (Central Bank of Nigeria) rules about how you receive and hold that foreign currency:

- Foreign earnings must be received through **CBN-approved channels** — banks, licensed fintech platforms
- You can hold foreign currency in a **domiciliary account** (dom account) at a Nigerian bank
- You are permitted to convert to Naira through authorised dealers (your bank or a licensed BDC) at the current market rate
- The CBN's **Revised FX Policy (2023)** unified the official and parallel rates — always receive funds through official banking channels to avoid compliance issues

---

## What Currency Should Your International Invoice Be In?

**Always invoice in the currency your client agreed to pay in.** For most Nigerian freelancers, this is:

- **USD** — most common for US clients and global platforms
- **GBP** — common for UK-based clients
- **EUR** — common for European clients
- **NGN** — for diaspora clients or international businesses with Nigerian operations

Avoid quoting in Naira for foreign clients who will be paying from abroad — the FX conversion on their end creates uncertainty and may put them off. Quote in USD or their local currency.

---

## What Your International Invoice Must Include

An invoice to a foreign client should contain all the same elements as a domestic invoice, plus some additional details:

1. **Your full name or business name** and address (Nigeria)
2. **Your TIN** (if applicable)
3. **Client name and address** (foreign country)
4. **Invoice number** — unique and sequential
5. **Invoice date and due date**
6. **Currency** — state clearly: "All amounts in USD"
7. **Itemised services** — described clearly in English
8. **Amount** — in the agreed foreign currency
9. **VAT treatment** — see section below
10. **Payment instructions** — your preferred receiving method (wire transfer, Paystack, Wise, Payoneer, etc.)
11. **SWIFT/BIC code** — if receiving via international wire transfer to your Nigerian bank
12. **IBAN or account number** — your dom account details

---

## VAT on International Invoices from Nigeria

**Services exported from Nigeria are zero-rated for VAT** under the VAT Act. This means:

- If you are VAT-registered and providing services to a foreign client who receives the benefit outside Nigeria, you charge **0% VAT**
- You still file your monthly VAT return and declare the zero-rated supply
- You can still claim input VAT on your business costs in Nigeria

**Practical note:** Most Nigerian freelancers billing international clients are below the ₦25 million VAT registration threshold and therefore do not register for VAT at all — in which case VAT is simply not applicable to their invoices.

If you are unsure, state on your invoice: *"Services provided by a Nigerian entity. VAT not applicable — zero-rated export of services."*

---

## How to Receive International Payments in Nigeria

### Option 1: Domiciliary Account (Dom Account)
Open a foreign currency account at a Nigerian commercial bank (GTBank, Zenith, Access, UBA, etc.). Your client wire transfers payment to your dom account using your SWIFT code and account number.

**Pros:** Fully CBN-compliant, funds arrive in foreign currency, you convert when ready.
**Cons:** Wire transfers can take 2–5 business days; some banks charge receiving fees.

**To receive a wire transfer, provide your client:**
- Bank name
- Bank address
- SWIFT/BIC code
- Account number (dom account)
- Account name
- Correspondent bank details (your bank will provide these)

### Option 2: Payoneer
Payoneer provides Nigerian freelancers with USD, GBP, and EUR receiving accounts that function like local bank accounts in those countries. Your client pays as if paying a local US/UK/EU bank.

**Pros:** Faster than wire transfers, widely accepted by international clients, easy to withdraw to Nigerian banks.
**Cons:** Fees apply on withdrawal; CBN requires you to repatriate funds to a Nigerian account within a reasonable period.

### Option 3: Wise (formerly TransferWise)
Wise provides multi-currency accounts and is popular for receiving GBP and EUR payments. Direct USD receiving to Nigerian accounts has limitations — check current availability.

### Option 4: Paystack (for Diaspora/International Cards)
Paystack supports international card payments and is ideal if your client has a foreign card. You receive the Naira equivalent minus fees. Best for smaller transactions.

### Option 5: International Platforms
If you work through Upwork, Fiverr, Toptal, or similar platforms, they handle the payment receipt — you withdraw to your Nigerian bank or dom account. The platform's invoice system handles billing on your behalf.

---

## International Invoice Example

---

**INVOICE**

**Chukwuemeka Digital Ltd**
14 Admiralty Way, Lekki, Lagos, Nigeria
Email: emeka@chukwuemekadigital.com | Tel: +234 801 234 5678
TIN: 1234567-0001

**Invoice No:** INV-2026-031
**Invoice Date:** 1 March 2026
**Due Date:** 15 March 2026

**Bill To:**
Brightfield Media Inc.
450 Park Avenue, New York, NY 10022, USA

**All amounts in USD**

| Description | Amount (USD) |
|---|---|
| Brand identity design — logo, colour palette, typography guide | $2,500.00 |
| Brand style guide (PDF, 20 pages) | $800.00 |
| **Subtotal** | **$3,300.00** |
| **VAT** | **$0.00 (zero-rated export of services)** |
| **Total Due** | **$3,300.00** |

**Payment Instructions:**
Wire transfer to:
Bank: Zenith Bank Plc, Lagos, Nigeria
SWIFT/BIC: ZEIBNGLA
Account Name: Chukwuemeka Digital Ltd
Account Number: 1234567890 (USD Domiciliary Account)

*Alternatively, pay via Payoneer to: emeka@chukwuemekadigital.com*

**Payment Terms:** Due 15 March 2026. Please reference invoice number INV-2026-031.

---

## Tax Obligations on Foreign Earnings in Nigeria

Foreign earnings are **taxable income** in Nigeria. Whether you pay Personal Income Tax (as a sole trader) or Company Income Tax (as a registered company), your foreign-currency earnings must be declared.

Convert your USD/GBP earnings to Naira at the exchange rate on the date of receipt when filing your tax returns. Keep records of all incoming international payments and the exchange rates applied.

Consult a Nigerian tax adviser if your international income is significant — the interaction between foreign income, WHT credit notes (less common in international contracts), and Nigerian income tax can be complex.

---

## Create Professional International Invoices

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** helps Nigerian businesses create professional invoices for both domestic and international clients — with clean formatting, proper VAT treatment, and easy PDF export for email delivery.

For more on Nigerian invoicing requirements, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 9 blog posts (${posts.length} posts)...\n`);

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
