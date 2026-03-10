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
// Post 1 — "How to Invoice as a Caterer in Nigeria"
//   Meta title : "How to Invoice as a Caterer in Nigeria | InvoiceGenerator.ng" (62 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian caterers: per-head pricing,
//                 deposits, vendor costs, VAT at 7.5%, WHT, and how to get
//                 paid before event day." (154 chars)
//
// Post 2 — "Nigerian Invoice Template for Sole Traders"
//   Meta title : "Nigerian Invoice Template for Sole Traders | InvoiceGenerator.ng" (65 chars)
//   Meta desc  : "Free invoice template for Nigerian sole traders and self-employed
//                 professionals. Learn what to include, whether you need VAT,
//                 and how to get paid faster." (155 chars)
//
// Post 3 — "How to Write a Receipt in Nigeria"
//   Meta title : "How to Write a Receipt in Nigeria — And When It's Not an Invoice" (65 chars)
//   Meta desc  : "Learn the difference between a receipt and an invoice in Nigeria,
//                 what a proper receipt must include, and why issuing both
//                 matters for FIRS compliance." (155 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Invoice as a Caterer in Nigeria
    // Target keyword: "caterer invoice Nigeria"  (~1,100 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Caterer in Nigeria: Per-Head Pricing, Deposits & VAT',
        slug: 'how-to-invoice-as-a-caterer-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian caterers: per-head pricing, deposits, vendor costs, VAT at 7.5%, WHT, and how to get paid before event day.',
        coverImage: null,
        published: true,
        content: `Catering is one of Nigeria's most active service industries. Whether you run a small home catering business in Ibadan or a large corporate catering company in Lagos, professional invoicing is critical — you are often spending significant money on food, staff, and logistics before the event happens, and getting paid in full before you show up is essential.

This guide covers everything Nigerian caterers need to know about invoicing professionally.

## Catering Pricing Models and How to Invoice Each

### Per-Head (Per-Person) Pricing
The most common model for event catering. You charge a fixed amount per guest, multiplied by the confirmed guest count.

**Invoice example — wedding catering:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| 3-course sit-down dinner — confirmed guests | 250 | ₦18,500/head | ₦4,625,000 |
| Cocktail hour canapés | 250 | ₦3,500/head | ₦875,000 |
| Service staff (10 waiters × 8 hours) | 80 hrs | ₦3,500/hr | ₦280,000 |
| Equipment hire (chafing dishes, linens, crockery) | 1 | ₦150,000 | ₦150,000 |
| **Subtotal** | | | **₦5,930,000** |
| **VAT (7.5%)** | | | **₦444,750** |
| **Total** | | | **₦6,374,750** |

### Buffet / Package Pricing
A fixed package price for a defined menu and service level.

**Invoice example — corporate buffet:**
| Description | Amount |
|---|---|
| Executive buffet package — 80 guests (3 proteins, 4 sides, drinks, service) | ₦960,000 |
| **Subtotal** | **₦960,000** |
| **VAT (7.5%)** | **₦72,000** |
| **Total** | **₦1,032,000** |

### Small Chops / Appetiser Catering
Often priced per platter or per person for cocktail events.

**Invoice example:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| Small chops platters (assorted — 20 pieces each) | 15 | ₦35,000 | ₦525,000 |
| Puff-puff station | 1 | ₦45,000 | ₦45,000 |
| Service staff (2 × 5 hours) | 1 | ₦35,000 | ₦35,000 |
| **Subtotal** | | | **₦605,000** |
| **VAT (7.5%)** | | | **₦45,375** |
| **Total** | | | **₦650,375** |

---

## The Catering Invoice Payment Structure

Never cater an event on credit. Structure your invoices as follows:

### 1. Booking Deposit Invoice — 50% upfront
Issued when the client confirms the event date and menu. Non-refundable for cancellations within 14 days of event.

> *Deposit invoice covers: date reservation, menu planning, initial ingredient procurement*

### 2. Balance Invoice — 50% due 5–7 days before the event
No balance payment, no catering. This rule must be stated in your contract AND on the invoice.

> *"Final balance is due by [specific date]. Food preparation and logistics commence upon receipt of balance payment. We reserve the right to cancel the booking if payment is not received by this date."*

### 3. Post-Event Extras Invoice (if applicable)
If the guest count increased on the day, extra dishes were added, or overtime was worked, issue a supplementary invoice within 48 hours of the event with full documentation.

---

## Handling Guest Count Changes

Guest count changes are one of the biggest sources of catering invoice disputes in Nigeria. Protect yourself:

1. **Lock in the final count** at least 5 days before the event on the balance invoice
2. **State clearly** that count increases after this date are billed at a premium rate
3. **Bill increases on the day** with a quick WhatsApp note and a formal invoice within 24 hours
4. **Never reduce your price** for last-minute count reductions — your costs are already committed

---

## Mandatory Elements on a Nigerian Catering Invoice

Every invoice must include:

1. **Your business name and address**
2. **TIN** — if VAT-registered with FIRS
3. **Client name and address**
4. **Invoice number** — sequential (e.g., CAT-2026-014)
5. **Invoice date and due date**
6. **Event date, venue, and name** — always reference the specific event
7. **Itemised menu and services** — per-head rates, staff, equipment
8. **Confirmed guest count** — state the count the invoice is based on
9. **VAT at 7.5%** — if registered, shown as a separate line
10. **Cancellation and count-change policy**
11. **Bank details or Paystack link**

---

## VAT for Nigerian Caterers

If your annual catering turnover exceeds **₦25 million**, you must register for VAT with FIRS and charge 7.5% on all catering invoices.

Catering is fully VATable — food prepared and served at events is a supply of services, not a food retail sale (which may attract different treatment). Consult your tax adviser if unsure about your specific situation.

---

## WHT on Catering Fees

Corporate clients (companies) deduct **5% Withholding Tax** from your catering fee. They issue a WHT credit note. For event catering billed to a company, expect to receive 95% of the invoice amount — factor this into your pricing and cash flow planning.

---

## Getting Paid as a Nigerian Caterer

1. **50% deposit on booking — non-negotiable.** Food costs, staff bookings, and equipment hire all require upfront cash.
2. **Balance due before the event** — not on the day, not after.
3. **Use Paystack** — include a payment link so clients can pay by card or bank transfer instantly.
4. **WhatsApp your invoices** — most Nigerian clients respond faster on WhatsApp than email.
5. **Photograph your setup** — visual proof of service helps resolve any post-event disputes.

---

## Create Your Catering Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian caterers. Create itemised, professional invoices with VAT, Paystack links, and WhatsApp sharing — in minutes.

For the full guide to Nigerian invoicing and FIRS compliance, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 2 — Nigerian Invoice Template for Sole Traders
    // Target keyword: "invoice template sole trader Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'Nigerian Invoice Template for Sole Traders: What to Include & How to Get Paid',
        slug: 'invoice-template-sole-trader-nigeria',
        excerpt: 'Free invoice template for Nigerian sole traders and self-employed professionals. Learn what to include, whether you need VAT, and how to get paid faster.',
        coverImage: null,
        published: true,
        content: `The vast majority of Nigerian businesses are sole traders — individuals running their own business without incorporating a company. Artisans, freelancers, traders, service providers, and self-employed professionals all operate as sole traders. If you are one of them, this guide covers exactly what your invoices should look like, what you legally need to include, and how to get paid reliably.

## What Is a Sole Trader in Nigeria?

A **sole trader** (also called a sole proprietor) is an individual who runs a business in their own name or under a business name registered with the Corporate Affairs Commission (CAC). Unlike a limited liability company, there is no legal separation between you and your business.

Common sole trader professions in Nigeria:
- Freelance designers, writers, developers, and photographers
- Independent consultants and coaches
- Artisans and tradespeople (plumbers, electricians, tailors)
- Market traders and small retailers
- Home-based caterers and bakers
- Independent tutors and trainers

---

## Do Sole Traders Need to Issue Invoices?

**Yes** — for any business transaction where payment is not made immediately at the point of sale. Invoices:

- Create a legal record of the transaction
- Establish the agreed price and payment terms
- Support your tax returns and business records
- Protect you if a client disputes payment

For cash-at-point-of-sale transactions (e.g., a market trader selling goods immediately), a receipt is sufficient. But for any credit transaction — where you deliver first and expect payment later — an invoice is essential.

---

## What Must a Nigerian Sole Trader Invoice Include?

You do not need to be a registered company to issue a professional invoice. Here is what your invoice should contain:

### Required Elements
1. **Your name** (or your registered business name, if you have one)
2. **Your address** — physical address or at minimum your city and state
3. **Your phone number and email**
4. **Your TIN** — if VAT-registered (see VAT section below)

5. **Client name and address**

6. **Invoice number** — assign a unique, sequential number to every invoice (e.g., INV-2026-001)
7. **Invoice date** — the date you issue the invoice
8. **Due date** — the specific date payment is expected

9. **Itemised services or goods** — what you delivered, how much, at what rate
10. **Subtotal**
11. **VAT** — only if you are VAT-registered with FIRS
12. **Total amount due**

13. **Your bank details** — bank name, account number, account name
14. **Payment terms** — due date and any late fee policy

---

## Free Sole Trader Invoice Template — Nigeria

---

**INVOICE**

**[Your Full Name]** *or* **[Your Business Name]**
[City, State, Nigeria] | [Phone] | [Email]
*(TIN: [Your TIN] — include only if VAT-registered)*

**Invoice No:** INV-2026-001
**Date:** [Date]
**Due:** [Due Date]

**To:**
[Client Name]
[Client Address]

| Description | Qty | Rate (₦) | Amount (₦) |
|---|---|---|---|
| [What you did — be specific] | | | |
| [Second item if applicable] | | | |
| **Subtotal** | | | |
| **VAT (7.5%)** *(only if VAT-registered)* | | | |
| **TOTAL DUE** | | | |

**Pay to:**
Bank: [Bank Name]
Account Number: [Account Number]
Account Name: [Your Name / Business Name]

**Payment Terms:** Due [specific date]. Overdue balances attract interest at 3% per month.

*Thank you for your business.*

---

## Do Sole Traders in Nigeria Need to Charge VAT?

Only if your annual business turnover exceeds **₦25 million**. Below that threshold, VAT registration is optional.

**If you are not VAT-registered:**
- Do not include a VAT line on your invoice
- Do not charge 7.5% VAT
- Simply show the total amount due

**If you are VAT-registered (voluntarily or because turnover exceeds ₦25 million):**
- Show VAT at 7.5% as a separate line
- Include your TIN on every invoice
- File monthly VAT returns with FIRS

Most Nigerian sole traders with moderate incomes are below the VAT threshold and do not need to register. However, many register voluntarily because corporate clients often require VAT invoices.

---

## What About a CAC Business Name Registration?

You do not need to be CAC-registered to issue invoices. However, registering your business name with CAC (for as little as ₦10,000–₦25,000) lets you:

- Open a business bank account in your business name
- Invoice under your brand name rather than your personal name
- Appear more credible to corporate clients
- Access certain government contracts and tenders

If you are not yet registered, you can still invoice using your personal name and a personal bank account — just ensure the account name matches the name on your invoice exactly.

---

## Practical Tips for Sole Trader Invoicing in Nigeria

### Use Sequential Invoice Numbers
Start at INV-2026-001 and increment with every invoice. This keeps your records clean and makes it easy to reference specific invoices in disputes.

### Set Due Dates, Not "Payment on Delivery"
"Payment on delivery" is often ignored. A specific due date (e.g., "Due: 20 March 2026") creates a clear obligation.

### Send via WhatsApp
Most Nigerian clients respond faster on WhatsApp. Send your invoice as a PDF — not a screenshot or a voice note with bank details.

### Collect Deposits for Large Jobs
For any job over ₦50,000, ask for 30–50% upfront. This protects you from non-payment and covers your material costs.

### Keep Your Invoice Records
Store copies of all invoices — paid and unpaid — for at least 6 years. If FIRS ever audits your income, your invoice records are your proof of earnings.

---

## Create Your Sole Trader Invoice for Free

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian sole traders. Create professional invoices with automatic VAT, Paystack payment links, and WhatsApp sharing — no accounting knowledge required.

For more on invoicing, tax compliance, and getting paid, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — How to Write a Receipt in Nigeria
    // Target keyword: "how to write a receipt Nigeria"  (~900 words)
    // =========================================================================
    {
        title: 'How to Write a Receipt in Nigeria — And When It Is Not an Invoice',
        slug: 'how-to-write-a-receipt-nigeria',
        excerpt: 'Learn the difference between a receipt and an invoice in Nigeria, what a proper receipt must include, and why issuing both matters for FIRS compliance.',
        coverImage: null,
        published: true,
        content: `Many Nigerian business owners use "invoice" and "receipt" interchangeably — but they are two different documents with different purposes, different timing, and different legal implications. Using the wrong one (or skipping one entirely) can cause payment disputes, tax complications, and FIRS compliance issues.

This guide explains the difference, when to issue each, and what a proper Nigerian receipt must contain.

## Invoice vs Receipt: The Core Difference

| | Invoice | Receipt |
|---|---|---|
| **Purpose** | Request for payment | Confirmation that payment was received |
| **When issued** | Before payment | After payment |
| **Payment status** | Payment is due | Payment is complete |
| **Legal effect** | Creates a payment obligation | Extinguishes the payment obligation |
| **Who needs it** | Buyer (to know what to pay) | Buyer (proof of payment) |

**The simple rule:** Invoice first, receipt after.

You issue an **invoice** when you deliver goods or services and expect payment. You issue a **receipt** when you receive that payment.

---

## Do You Always Need Both?

Not always — it depends on the transaction:

### You need both an invoice AND a receipt when:
- You bill on credit (deliver now, pay later)
- The client pays in instalments
- The transaction is B2B and both parties need records
- The amount is significant

### A receipt alone may be sufficient when:
- Payment is made immediately at the point of sale (e.g., a shop sale)
- It is a small cash transaction

### An invoice alone is not sufficient when:
- Payment has been received — always confirm with a receipt

---

## What a Nigerian Receipt Must Include

A proper receipt is not just "I received ₦50,000 from Mr. Ade." A compliant Nigerian receipt should contain:

1. **The word "RECEIPT"** — clearly at the top
2. **Your business name and address**
3. **Your TIN** — if VAT-registered
4. **Receipt number** — unique and sequential (e.g., REC-2026-019)
5. **Date of receipt** — the date you received the payment
6. **Client name** — who made the payment
7. **Amount received** — in figures AND words (e.g., ₦322,500 — Three Hundred and Twenty-Two Thousand, Five Hundred Naira)
8. **Payment method** — bank transfer, cash, card, Paystack
9. **Reference to the original invoice** — e.g., "Payment for Invoice INV-2026-041"
10. **Description of what was paid for** — brief but specific
11. **Authorised signature or stamp** — for formal receipts

---

## Receipt Example — Nigeria

---

**RECEIPT**

**Adunola Consulting Ltd**
22 Broad Street, Lagos Island | TIN: 1234567-0001

**Receipt No:** REC-2026-019
**Date:** 18 March 2026

**Received from:** Okafor Manufacturing Plc

**Amount received:** ₦537,500
*(Five Hundred and Thirty-Seven Thousand, Five Hundred Naira only)*

**Payment method:** Bank transfer (GTBank, 18 March 2026)

**In respect of:** Invoice INV-2026-044 — Business process audit and staff training (March 2026)

**Balance outstanding:** NIL — Invoice INV-2026-044 fully settled.

*Authorised by: Adunola Fashola, Managing Director*

---

## VAT on Receipts

If the original invoice included VAT, the receipt should reflect the total amount received — which includes the VAT. You do not re-calculate VAT on a receipt; you simply confirm you received the invoiced total.

If a client paid only part of the invoice (a deposit or instalment), the receipt should clearly state:
- The amount received
- What invoice it relates to
- The outstanding balance remaining

---

## Electronic Receipts in Nigeria

A receipt does not need to be a printed paper document. Electronic receipts — sent via WhatsApp, email, or as a PDF — are valid and widely used in Nigerian business. What matters is that the receipt:

- Is issued promptly after payment (same day is best practice)
- Contains all the required elements listed above
- Is retained by both parties

**Automatic receipts:** Payment processors like Paystack automatically send email receipts to buyers when a payment is completed. These are valid receipts — but you should still issue your own formal receipt referencing the invoice number for your records.

---

## Common Receipt Mistakes in Nigerian Business

1. **Issuing a receipt without referencing the invoice** — makes reconciliation impossible
2. **Handwritten receipts with no receipt number** — cannot be tracked or audited
3. **Showing only the cash amount, not the invoice total** — hides whether VAT was included
4. **Not issuing a receipt at all** — the client has no proof of payment; disputes become your word against theirs
5. **Using one document as both invoice and receipt** — writing "PAID" on an invoice is not a receipt. Issue a separate receipt document.

---

## Record-Keeping for Receipts

Keep copies of all receipts you issue for **at least 6 years** — the same retention period FIRS requires for invoices. Receipts and their corresponding invoices should be stored together so you can match every payment to its original invoice.

If FIRS audits your business, they will cross-reference your issued invoices against your received payments. Clean, matched records dramatically reduce your audit risk.

---

## Create Professional Invoices and Receipts

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** helps Nigerian businesses create properly formatted invoices for every transaction — with automatic VAT, sequential numbering, and instant WhatsApp or email delivery.

For more on FIRS compliance and Nigerian invoicing best practices, see our **[Nigerian Invoicing Guide](/guide)** and our post on **[invoice vs receipt — what is the difference in Nigeria](/blog/invoice-vs-receipt-difference-nigeria)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 11 blog posts (${posts.length} posts)...\n`);

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
