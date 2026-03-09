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
// Post 1 — "How to Invoice as a Web Developer in Nigeria"
//   Meta title : "How to Invoice as a Web Developer in Nigeria | InvoiceGenerator.ng" (68 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian web developers: billing
//                 models, VAT at 7.5%, milestone invoices, WHT deductions,
//                 and how to protect your code." (153 chars)
//
// Post 2 — "Credit Note Nigeria"
//   Meta title : "Credit Note Nigeria: What It Is and How to Issue One | InvoiceGenerator.ng" (74 chars)
//   Meta desc  : "Learn what a credit note is in Nigeria, when to issue one, how to
//                 format it for FIRS compliance, and how it affects your VAT
//                 records and tax returns." (155 chars)
//
// Post 3 — "Invoice Number Format Nigeria"
//   Meta title : "Invoice Number Format Nigeria: How to Number Invoices Correctly" (63 chars)
//   Meta desc  : "FIRS requires sequential, unique invoice numbers in Nigeria. Learn
//                 the correct format, best practices, and how to avoid
//                 compliance problems with your invoice numbering." (160 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Invoice as a Web Developer in Nigeria
    // Target keyword: "how to invoice as a web developer Nigeria"  (~1,200 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Web Developer in Nigeria: Billing Models, VAT & Getting Paid',
        slug: 'how-to-invoice-as-a-web-developer-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian web developers: billing models, VAT at 7.5%, milestone invoices, WHT deductions, and how to protect your code.',
        coverImage: null,
        published: true,
        content: `Web development is one of the most in-demand skills in Nigeria's growing tech ecosystem. From solo freelancers building WordPress sites for local SMEs to full-stack developers delivering enterprise platforms for Lagos fintech startups, Nigerian web developers face the same challenge: how do you structure invoices, handle VAT, protect your work, and actually get paid?

This guide covers everything you need to know.

## Web Development Billing Models and How to Invoice Each

### 1. Fixed-Price Project
A single agreed fee for a defined deliverable — the most common model for website builds.

**Invoice structure — deposit:**
| Description | Amount |
|---|---|
| Website development deposit — 50% upfront (e-commerce site, 10 pages) | ₦375,000 |
| **Subtotal** | **₦375,000** |
| **VAT (7.5%)** | **₦28,125** |
| **Total** | **₦403,125** |

**Invoice structure — balance:**
| Description | Amount |
|---|---|
| Website development balance — 50% on delivery | ₦375,000 |
| Domain registration (.com.ng, 1 year) | ₦12,000 |
| Web hosting setup (cPanel, 1 year) | ₦35,000 |
| **Subtotal** | **₦422,000** |
| **VAT (7.5%)** | **₦31,650** |
| **Total** | **₦453,650** |

### 2. Milestone-Based Billing
For large projects, split payment across defined milestones. This protects both you and the client.

**Typical milestone structure:**
- **Milestone 1 (30%)** — Project kickoff, wireframes approved
- **Milestone 2 (30%)** — Design approved, development 50% complete
- **Milestone 3 (30%)** — Development complete, UAT sign-off
- **Final (10%)** — Launch, handover, and training

Issue a separate invoice for each milestone, referencing the milestone name and the overall project.

**Milestone invoice example:**
| Description | Amount |
|---|---|
| Milestone 2 payment — ERP portal development (design approved, 50% dev complete) | ₦450,000 |
| **Subtotal** | **₦450,000** |
| **VAT (7.5%)** | **₦33,750** |
| **Total** | **₦483,750** |

### 3. Hourly / Day Rate
Used for ongoing work, bug fixes, or projects with undefined scope.

**Invoice example:**
| Description | Rate | Hours | Amount |
|---|---|---|---|
| Backend API development — user authentication module | ₦15,000/hr | 12 hrs | ₦180,000 |
| Code review and documentation | ₦15,000/hr | 3 hrs | ₦45,000 |
| **Subtotal** | | | **₦225,000** |
| **VAT (7.5%)** | | | **₦16,875** |
| **Total** | | | **₦241,875** |

Keep a timesheet and attach it to hourly invoices — especially for corporate clients.

### 4. Monthly Retainer
For ongoing maintenance, feature additions, or dedicated developer time.

**Invoice example:**
| Description | Amount |
|---|---|
| Development retainer — April 2026 (40 hours, bug fixes, feature updates, monthly deploy) | ₦300,000 |
| **Subtotal** | **₦300,000** |
| **VAT (7.5%)** | **₦22,500** |
| **Total** | **₦322,500** |

---

## Mandatory Elements on a Nigerian Web Development Invoice

Every invoice must include:

1. **Your name or business name** — and your address
2. **TIN** — if VAT-registered with FIRS
3. **Client details** — name, company, address, TIN for corporate clients
4. **Invoice number** — unique and sequential (e.g., DEV-2026-019)
5. **Invoice date and due date**
6. **Itemised services** — not a single "web development" line item
7. **VAT at 7.5%** — as a separate line (if registered)
8. **Payment details** — bank account or Paystack link

---

## VAT for Nigerian Web Developers

**Register for VAT if your annual income exceeds ₦25 million.** You then charge 7.5% VAT on all development invoices and remit it monthly to FIRS.

Below the threshold, registration is optional — but many developers register voluntarily to work seamlessly with corporate clients who need VAT invoices for their own tax filings.

**Note on third-party costs:** If you purchase a domain, hosting, or plugin licences on the client's behalf and pass the cost through at cost price, those are **reimbursable expenses** — not your revenue. Invoice them separately without VAT (or with a note that VAT was paid by the supplier). Do not charge 7.5% on top of a Namecheap or cPanel invoice you are just passing on.

---

## Withholding Tax (WHT) on Web Development

Corporate clients deduct **5% WHT** from your development fees. They issue you a WHT credit note.

**Example:**
- Your invoice: ₦500,000 + ₦37,500 VAT = **₦537,500**
- WHT deducted: 5% × ₦500,000 = ₦25,000
- **Client pays:** ₦512,500
- WHT credit note: ₦25,000

---

## Protecting Your Code Before Final Payment

Never hand over production access, source code, or repository credentials before full payment. Use this approach:

1. **Deploy to a staging environment** for client review and sign-off
2. **Get written acceptance** (email or WhatsApp message confirming approval)
3. **Issue the final invoice** referencing the accepted milestone
4. **Transfer production access and source files** only after payment clears

Include this in your contract: *"Source code, Git repository access, and production credentials will be transferred to the client upon receipt of full and final payment."*

---

## Getting Paid as a Nigerian Web Developer

### Use Milestone Invoicing
Never do 100% of the work before any payment. Milestone invoicing aligns payment with delivery and protects your time.

### Paystack Payment Links
Add a Paystack link to every invoice. Corporate clients can pay by bank transfer; individual clients can use cards or USSD. The link removes the friction of manual bank transfers.

### Include Your Contract Reference
Always reference the signed contract or statement of work on every invoice: *"Re: Web Development Agreement signed 15 January 2026."* This makes disputes far harder to sustain.

### Late Payment Clause
Add to every invoice: *"Overdue balances attract interest at 3% per month. Development work will be paused on accounts overdue by more than 7 days."*

---

## Create Your Free Web Developer Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is built for Nigerian freelancers and tech professionals. Create milestone-based or retainer invoices with automatic VAT, Paystack links, and WhatsApp delivery — free.

See our full **[Nigerian Invoicing Guide](/guide)** for more on FIRS compliance, VAT registration, and getting paid faster.`,
    },

    // =========================================================================
    // POST 2 — Credit Note Nigeria
    // Target keyword: "credit note Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'Credit Note Nigeria: What It Is, When to Issue One & How to Format It Correctly',
        slug: 'credit-note-nigeria-what-it-is-how-to-issue',
        excerpt: 'Learn what a credit note is in Nigeria, when to issue one, how to format it for FIRS compliance, and how it affects your VAT records and tax returns.',
        coverImage: null,
        published: true,
        content: `Most Nigerian business owners know how to write an invoice — but far fewer know what to do when they need to cancel, reduce, or correct one. The answer is a **credit note**. Issuing credit notes correctly keeps your accounts accurate, your clients happy, and your VAT filings compliant with FIRS requirements.

## What Is a Credit Note?

A **credit note** (also called a credit memo) is a document issued by a seller to a buyer that reduces the amount the buyer owes. It is the opposite of an invoice — where an invoice says "you owe me this amount," a credit note says "I owe you this reduction."

A credit note does not replace the original invoice. Both documents remain in your records, with the credit note adjusting the balance.

---

## When Should You Issue a Credit Note in Nigeria?

Common situations that require a credit note:

### 1. Goods Returned
A customer returns damaged, incorrect, or unwanted goods. You issue a credit note for the value of the returned items.

### 2. Invoice Error — Overcharge
You invoiced ₦250,000 but the correct amount was ₦220,000. Issue a credit note for ₦30,000 (the overcharge) rather than cancelling and reissuing the invoice.

### 3. Service Not Delivered
You invoiced for work that was ultimately not completed or was cancelled by mutual agreement. Issue a credit note to cancel the relevant portion of the invoice.

### 4. Discount Agreed After Invoice Was Issued
You agreed a 10% loyalty discount after the invoice was already sent. Issue a credit note for the discount amount instead of reissuing the invoice.

### 5. Full Invoice Cancellation
If an entire invoice needs to be cancelled — for example, because the project was cancelled before any work began — issue a credit note for the full invoice amount (including VAT).

---

## Credit Note vs Refund: What Is the Difference?

A credit note and a refund are not the same thing:

| | Credit Note | Refund |
|---|---|---|
| **What it does** | Reduces the amount owed or creates a credit balance | Returns cash to the buyer |
| **Cash movement** | No immediate cash movement | Cash is transferred back |
| **Use** | Offset against future invoices or acknowledge an error | Settle a completed transaction |
| **Best for** | Ongoing relationships, future purchases | One-off transactions, order cancellations |

A client can use a credit note to offset it against their next invoice from you — or they can request a cash refund.

---

## What a Nigerian Credit Note Must Include

FIRS requires credit notes to be as detailed as the original invoice. A compliant Nigerian credit note must contain:

1. **The words "CREDIT NOTE"** clearly at the top
2. **Your business name, address, and TIN** (if VAT-registered)
3. **Client's name, address, and TIN**
4. **Credit note number** — unique and sequential (e.g., CN-2026-003)
5. **Credit note date**
6. **Reference to the original invoice number** — e.g., "Re: Invoice INV-2026-041 dated 15 February 2026"
7. **Reason for the credit** — brief but specific
8. **Itemised description** of what is being credited
9. **Amount of the credit** — broken down by item
10. **VAT adjustment** — if the original invoice included VAT, the credit note must include a corresponding VAT credit

---

## Credit Note Example — Nigeria

**Original invoice:** INV-2026-041 for ₦400,000 + ₦30,000 VAT = ₦430,000 (website development)

**Situation:** Client cancelled one module worth ₦80,000 before it was started.

---

**CREDIT NOTE**
**Adebayo Digital Ltd**
14 Admiralty Way, Lekki, Lagos | TIN: 1234567-0001

**Credit Note No:** CN-2026-003
**Date:** 10 March 2026
**Re: Invoice INV-2026-041 dated 1 March 2026**

**Issued to:**
XYZ Retail Ltd, Plot 5 Alausa, Ikeja, Lagos

| Description | Amount |
|---|---|
| Credit — e-commerce checkout module (cancelled, not delivered) | ₦80,000 |
| **VAT adjustment (7.5%)** | **₦6,000** |
| **Total credit** | **₦86,000** |

*Revised amount due on Invoice INV-2026-041: ₦344,000*

---

## VAT on Credit Notes in Nigeria

If the original invoice included VAT, the credit note must include a **VAT adjustment** at the same rate (7.5%).

**Your VAT filing impact:**
- You originally declared ₦30,000 output VAT on INV-2026-041
- The credit note reduces your output VAT by ₦6,000
- In your next monthly VAT return, you deduct this ₦6,000 from your output VAT

**Your client's VAT filing impact:**
- If your client claimed ₦30,000 as input VAT, they must now reduce their input VAT claim by ₦6,000
- The credit note is their documentation for this adjustment

This is why credit notes must be issued properly — not just informally agreed over WhatsApp. Without a formal credit note, your client has no documentation to support their VAT adjustment with FIRS.

---

## Credit Note Numbering

Credit notes should have their own sequential numbering series — separate from your invoices. Use a prefix like **CN-** (e.g., CN-2026-001, CN-2026-002).

This keeps your accounting clean and makes audits straightforward. FIRS auditors may request all credit notes issued during a period alongside the original invoices.

---

## Record-Keeping for Credit Notes

Under FIRS requirements, you must retain all credit notes (and the original invoices they reference) for a minimum of **6 years**. Store them in a way that allows you to match each credit note to its source invoice.

---

## Create Professional Invoices and Credit Notes

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** helps Nigerian businesses create FIRS-compliant invoices quickly and professionally. For more on VAT compliance, invoice requirements, and record-keeping, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — Invoice Number Format Nigeria
    // Target keyword: "invoice number format Nigeria"  (~900 words)
    // =========================================================================
    {
        title: 'Invoice Number Format Nigeria: How to Number Your Invoices Correctly',
        slug: 'invoice-number-format-nigeria',
        excerpt: 'FIRS requires sequential, unique invoice numbers in Nigeria. Learn the correct format, best practices, and how to avoid compliance problems with your invoice numbering.',
        coverImage: null,
        published: true,
        content: `Invoice numbering might seem like a minor administrative detail — but FIRS takes it seriously. Sequential, unique invoice numbers are a legal requirement for VAT-registered businesses in Nigeria, and poor numbering practices can cause problems during tax audits, client disputes, and VAT filings.

This guide explains what FIRS requires, the most common numbering formats used in Nigeria, and best practices to keep your invoicing records clean.

## Why Invoice Numbers Matter in Nigeria

FIRS (Federal Inland Revenue Service) requires that every invoice issued by a VAT-registered business be **uniquely and sequentially numbered**. This is because:

1. **VAT audit trail** — FIRS auditors verify that all output VAT declared matches numbered invoices in your records. Gaps or duplicates raise red flags.
2. **Dispute resolution** — When a client disputes a payment, both parties reference the invoice number. Ambiguous or duplicated numbers complicate resolution.
3. **Record-keeping compliance** — The Companies and Allied Matters Act (CAMA) and FIRS regulations require businesses to maintain complete, sequential invoice records for 6 years.

Even if you are not VAT-registered, sequential numbering is best practice and is required if you ever become VAT-registered (auditors may review historical invoices).

---

## FIRS Requirements for Invoice Numbers

Under FIRS VAT invoicing rules, every tax invoice must have:

- A **unique reference number** — no two invoices can share the same number
- **Sequential issuance** — numbers must follow a logical order without gaps (missing numbers should be documented as voided invoices)
- The invoice number must appear **prominently** on the invoice document

There is no single mandated format — FIRS allows businesses to choose their own numbering system, provided it is consistent and sequential.

---

## Common Invoice Number Formats in Nigeria

### Format 1: Simple Sequential Number
The most basic format. Suitable for very small businesses just starting out.

> INV-001, INV-002, INV-003...

**Limitation:** Does not indicate the year, so when you reach 1,000 invoices (or restart numbering annually), context is lost.

### Format 2: Year + Sequential Number
Includes the year for easy filing and audit reference.

> INV-2026-001, INV-2026-002...

This is the most widely used format among Nigerian SMEs and freelancers. At the start of each new year, reset to 001.

### Format 3: Year + Month + Sequential Number
Ideal if you issue many invoices monthly and want granular tracking.

> INV-2026-03-001 (March 2026, invoice 1)
> INV-2026-03-002 (March 2026, invoice 2)

### Format 4: Client Code + Sequential Number
Some businesses use client codes for easy cross-referencing.

> ZEN-2026-001 (first invoice to Zenith Bank client)
> GTB-2026-001 (first invoice to GTBank client)

**Limitation:** Client codes can get unwieldy if you have many clients.

### Format 5: Department or Service Code
For businesses offering multiple service lines.

> DEV-2026-001 (development services)
> DES-2026-001 (design services)
> CON-2026-001 (consulting services)

---

## Recommended Format for Nigerian Businesses

For most Nigerian freelancers and SMEs, this format strikes the best balance of simplicity and compliance:

**[PREFIX]-[YEAR]-[SEQUENTIAL NUMBER]**

Examples:
- INV-2026-001
- INV-2026-002
- INV-2026-099
- INV-2026-100

**Rules to follow:**
- Use the same prefix consistently (INV, not alternating between INV and INVOICE)
- Zero-pad the sequential number (001 not 1) for clean sorting
- Never reuse a number — even for cancelled invoices (void them instead)
- Never issue two invoices with the same number to different clients

---

## What to Do With Voided Invoices

Sometimes you create an invoice, then need to cancel it before sending. Do not delete it — void it.

A **voided invoice** keeps its number in your sequence but is marked "VOID" and retained in your records. This prevents gaps in your sequence that could trigger FIRS audit questions.

If a gap exists in your sequence, document the reason: *"INV-2026-007: voided — incorrect client details. Replaced by INV-2026-008."*

---

## Invoice Numbers for Credit Notes and Proforma Invoices

Keep separate numbering series for different document types:

| Document Type | Prefix Example |
|---|---|
| Tax invoice | INV-2026-001 |
| Credit note | CN-2026-001 |
| Proforma invoice | PRO-2026-001 |
| Receipt | REC-2026-001 |
| Quotation | Q-2026-001 |

This keeps your accounting clean and makes FIRS audits straightforward.

---

## Invoice Numbering for VAT Returns

When filing your monthly VAT return with FIRS, you declare all output VAT by reference to your sales invoices. A clean, sequential numbering system makes this straightforward.

If your numbers are messy — duplicated, missing, or inconsistent — reconciling your VAT return against your invoice register becomes a painful manual exercise. Sequential numbering automates this.

---

## Common Invoice Numbering Mistakes in Nigeria

1. **Restarting numbers mid-year** — without documenting the restart, this looks like invoice suppression during a FIRS audit
2. **Using dates as invoice numbers** — e.g., "20260315" — not sequential, not unique if you issue multiple invoices per day
3. **Different formats for different clients** — inconsistency raises audit questions
4. **Deleting cancelled invoices** — always void, never delete
5. **Duplicate numbers** — the most serious error; can imply VAT fraud even if unintentional

---

## Start With a Clean System

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** automatically assigns sequential invoice numbers to every invoice you create — so you never have to worry about numbering errors or gaps.

For more on FIRS invoicing requirements, VAT compliance, and best practices, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 8 blog posts (${posts.length} posts)...\n`);

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
