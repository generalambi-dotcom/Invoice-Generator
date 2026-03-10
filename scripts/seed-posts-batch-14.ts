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
// Post 1 — "How to Invoice as a Cleaning Company in Nigeria"
//   Meta title : "How to Invoice as a Cleaning Company in Nigeria | InvoiceGenerator.ng" (71 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian cleaning companies: contract
//                 billing, one-off jobs, VAT at 7.5%, WHT deductions, and
//                 getting paid on time." (152 chars)
//
// Post 2 — "Paystack Invoice Nigeria"
//   Meta title : "Paystack Invoice Nigeria: How to Create and Send One | InvoiceGenerator.ng" (74 chars)
//   Meta desc  : "Learn how to create a Paystack invoice in Nigeria, add payment links
//                 to your invoices, and get paid faster by card, bank
//                 transfer, or USSD." (151 chars)
//
// Post 3 — "How to Write a Business Proposal in Nigeria"
//   Meta title : "How to Write a Business Proposal in Nigeria (With Template)" (60 chars)
//   Meta desc  : "Step-by-step guide to writing a winning business proposal in Nigeria.
//                 Covers structure, pricing, VAT, how to present it, and
//                 when it becomes an invoice." (155 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Invoice as a Cleaning Company in Nigeria
    // Target keyword: "cleaning company invoice Nigeria"  (~1,100 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Cleaning Company in Nigeria: Contracts, VAT & Getting Paid',
        slug: 'how-to-invoice-as-a-cleaning-company-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian cleaning companies: contract billing, one-off jobs, VAT at 7.5%, WHT deductions, and getting paid on time.',
        coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `Nigeria's commercial and residential cleaning industry is growing rapidly. From office cleaning companies in Victoria Island to post-construction cleaners in Abuja and estate cleaning contractors across Port Harcourt, professional invoicing is what separates businesses that grow from those that struggle to collect payment.

This guide covers professional invoicing for Nigerian cleaning service providers.

## Cleaning Service Pricing Models and How to Invoice Each

### 1. Monthly Contract Cleaning (Most Common for Commercial)
A fixed monthly fee for regular cleaning services at a commercial or residential premises.

**Invoice example — office contract cleaning:**
| Description | Amount |
|---|---|
| Office cleaning contract — March 2026 | |
| Daily cleaning (Mon–Fri, 2 cleaners × 4 hours, 22 working days) | ₦220,000 |
| Weekly deep clean (4 sessions × ₦25,000) | ₦100,000 |
| Cleaning supplies — consumables (toilet paper, soap, refuse bags) | ₦35,000 |
| Supervisory management fee | ₦45,000 |
| **Subtotal** | **₦400,000** |
| **VAT (7.5%)** | **₦30,000** |
| **Total** | **₦430,000** |

### 2. One-Off / Deep Cleaning
Priced per session, per square metre, or as a flat rate.

**Invoice example — post-construction clean:**
| Description | Amount |
|---|---|
| Post-construction deep clean — 4-bedroom duplex, 450 sqm (Lekki) | ₦180,000 |
| Window cleaning (interior and exterior, 24 windows) | ₦36,000 |
| Waste removal and disposal | ₦25,000 |
| **Subtotal** | **₦241,000** |
| **VAT (7.5%)** | **₦18,075** |
| **Total** | **₦259,075** |

### 3. Estate / Facility Management Cleaning
Bulk contract covering multiple blocks or large facilities.

**Invoice example:**
| Description | Amount |
|---|---|
| Estate cleaning contract — Parkview Estate Lagos (March 2026) | |
| 8 cleaners × full month (₦55,000/cleaner) | ₦440,000 |
| Cleaning equipment maintenance | ₦20,000 |
| Waste collection and disposal (4 runs) | ₦60,000 |
| Estate manager liaison fee | ₦40,000 |
| **Subtotal** | **₦560,000** |
| **VAT (7.5%)** | **₦42,000** |
| **Total** | **₦602,000** |

### 4. Janitorial Supplies Pass-Through
If you supply consumables (soap, detergent, refuse bags) as part of the contract, invoice them clearly:
- Either include in your monthly fee (simpler)
- Or list as a separate line item at cost + handling margin

Never embed supplies costs invisibly — clients who see an itemised breakdown are less likely to dispute.

---

## The Cleaning Company Invoice Payment Structure

### Contract Clients
- Invoice on the **1st of each month** for that month's services
- Due within **7 days** — cleaning is an operational necessity and clients budget for it monthly
- Suspend services immediately if payment is 14+ days overdue (with contractual notice)

### One-Off Jobs
- **50% deposit** before commencing any one-off or deep cleaning job
- **Balance** on completion — ideally before the team leaves the site
- For post-construction and large one-off jobs: collect balance the same day

---

## Mandatory Elements on a Nigerian Cleaning Invoice

1. **Company name and registered address**
2. **TIN** — if VAT-registered
3. **Client name, address, and TIN** (for corporate clients)
4. **Invoice number** — sequential (e.g., CLN-2026-031)
5. **Invoice date and due date**
6. **Service period** — e.g., "Cleaning services: 1–31 March 2026"
7. **Itemised services** — number of cleaners, frequency, special services
8. **Consumables** — listed separately
9. **VAT at 7.5%** — if registered
10. **Contract reference** — for ongoing contracts
11. **Bank details or Paystack link**

---

## VAT for Nigerian Cleaning Companies

Cleaning services are fully VATable at 7.5%. If your annual cleaning turnover exceeds **₦25 million**, VAT registration is mandatory.

Most established commercial cleaning companies will exceed this threshold. Register early — FIRS can penalise retrospective VAT liability.

**Input VAT:** You can reclaim VAT on cleaning chemicals, equipment, and other business purchases from VAT-registered suppliers. Keep all purchase invoices.

---

## WHT on Cleaning Invoices

Corporate clients deduct **5% WHT** from cleaning company payments. For a monthly contract billing ₦400,000:

- WHT deducted: ₦20,000
- Client pays: ₦410,000 (₦430,000 − ₦20,000)
- WHT credit note: ₦20,000

Build this into your cash flow forecasting. When pricing contracts, ensure your margins account for the 5% WHT deduction.

---

## Getting Paid as a Nigerian Cleaning Company

1. **Invoice early** — bill on the 1st, not the 15th. Early billing means earlier payment.
2. **Include Paystack links** — make it one tap to pay.
3. **Build late fees into your contract** — 3% monthly interest on overdue balances.
4. **Photograph your work** — before-and-after photos protect against disputes on quality.
5. **Track consumables separately** — provides clear documentation if a client queries supplies costs.
6. **Suspend services for non-payment** — enforce this consistently; cleaning is easy to withhold and hard for clients to dispute needing.

---

## Create Your Cleaning Company Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian cleaning companies. Create professional monthly contract invoices or one-off job invoices with VAT, Paystack payment links, and WhatsApp sharing in minutes.

For more on invoicing compliance and FIRS requirements, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 2 — Paystack Invoice Nigeria
    // Target keyword: "Paystack invoice Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'Paystack Invoice Nigeria: How to Create One and Get Paid Faster',
        slug: 'paystack-invoice-nigeria',
        excerpt: 'Learn how to create a Paystack invoice in Nigeria, add payment links to your invoices, and get paid faster by card, bank transfer, or USSD.',
        coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `Paystack is Nigeria's most widely used payment gateway — and most Nigerian business owners know it as a tool for accepting payments on websites and apps. What many do not know is that Paystack also has built-in invoicing features, and that adding a Paystack payment link to any invoice dramatically reduces the time it takes to get paid.

This guide covers everything about using Paystack for invoicing in Nigeria — from creating invoices directly on Paystack to adding payment links to your existing invoice tool.

## Option 1: Create an Invoice Directly on Paystack

Paystack's dashboard includes a basic invoicing feature that generates a payment-linked invoice automatically.

### How to Create a Paystack Invoice
1. Log into your **Paystack dashboard** at dashboard.paystack.com
2. Go to **Products** → **Invoices** (or Payment Requests)
3. Click **"Create Invoice"**
4. Fill in:
   - Customer name and email address
   - Line items (description, quantity, unit price)
   - Due date
   - Tax (optional — you can add a percentage tax line)
5. Click **"Send Invoice"**

Paystack sends the invoice to your customer by email with a **Pay Now** button. When they click it, they land on a Paystack checkout page and can pay by:
- Debit or credit card (Visa, Mastercard, Verve)
- Bank transfer (Paystack generates a unique virtual account number)
- USSD (dial a short code from their phone)

You receive an instant notification and the funds settle to your Paystack balance.

### Limitations of Paystack's Native Invoicing
- Basic template — limited customisation (no logo, no brand colours on the free tier)
- No WhatsApp sharing — only email delivery
- No automatic Nigerian VAT calculation
- No sequential invoice numbering system
- Cannot add your TIN or full FIRS-compliant details easily
- Not ideal for sending via WhatsApp, which is how most Nigerian clients communicate

For Nigerian businesses that need FIRS-compliant invoices with VAT, TIN, sequential numbering, and WhatsApp delivery, **[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is a better primary invoice tool — with Paystack links built in.

---

## Option 2: Create a Paystack Payment Page (Pay Link)

For maximum flexibility, create a Paystack Payment Page — a shareable URL that opens a checkout for a specific amount.

### How to Create a Paystack Payment Page
1. In your Paystack dashboard, go to **Products** → **Payment Pages**
2. Click **"Create Payment Page"**
3. Enter:
   - Page name (e.g., "Invoice INV-2026-044 — Adunola Consulting")
   - Amount (enter the exact invoice total)
   - Description (brief service description)
   - Redirect URL (optional — where to send the client after payment)
4. Click **"Create"**
5. Copy the payment link and/or QR code

Paste this link into your invoice document — in the bank details section or as a standalone "Pay Now" button.

**Example invoice footer:**
> Pay online: pay.paystack.com/invoiceinv2026044
> Accepted: Visa, Mastercard, Verve, bank transfer, USSD
> Or pay via bank transfer: GTBank | 0123456789 | Adunola Consulting Ltd

---

## Option 3: Use InvoiceGenerator.ng with Built-In Paystack

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** has Paystack integrated directly. Every invoice you create automatically includes a Paystack payment link — no manual copy-pasting required.

Benefits over manual Paystack invoicing:
- Full FIRS-compliant invoice format with TIN, VAT, sequential numbering
- Nigerian Naira as default currency with 7.5% VAT toggle
- Direct WhatsApp sharing — send the invoice link straight to your client's chat
- Professional templates with your business details
- No Paystack developer account needed

This is the fastest way for Nigerian businesses to send a professional invoice with a built-in Paystack payment link.

---

## What Paystack Charges for Invoice Payments

Understanding Paystack's transaction fees helps you decide whether to absorb them or pass them on:

| Payment Method | Paystack Fee |
|---|---|
| Local cards (Verve, Naira Mastercard/Visa) | 1.5% + ₦100 (capped at ₦2,000) |
| International cards | 3.9% + ₦100 |
| Bank transfer | 1.5% (capped at ₦1,000) |
| USSD | 1.5% (capped at ₦1,000) |

**Example:** Client pays ₦322,500 via local card:
- Paystack fee: 1.5% × ₦322,500 + ₦100 = ₦4,938 (capped at ₦2,000 + ₦100 = ₦2,100)
- You receive: ₦320,400

For most B2B invoices, the Paystack fee is a small price for receiving payment on the day rather than chasing bank transfers for weeks.

---

## Should You Pass Paystack Fees to Your Clients?

There are three approaches:

### 1. Absorb the Fee (Recommended for most B2B)
Build a small margin into your pricing to cover the ~1.5% Paystack fee. Do not mention it — the convenience of instant payment is worth it.

### 2. Add a Payment Processing Fee Line
Add a line to your invoice: "Online payment processing fee (1.5%): ₦X." Transparent but may reduce the likelihood of clients using the link.

### 3. Offer a Discount for Instant Payment
"Pay within 24 hours via card or bank transfer and receive a 2% early payment discount." This incentivises fast payment while offsetting your convenience cost.

---

## Setting Up Paystack for Your Business

If you do not yet have a Paystack account:

1. Go to **paystack.com** and click "Create a free account"
2. Enter your business name, email, and phone number
3. Verify your email
4. Complete KYC — provide BVN, business registration documents (if applicable), and bank account details
5. Your account is activated — start accepting payments immediately (settlement within 24–48 hours)

Paystack accounts are free to open. You only pay when you receive a transaction.

---

## Get Paid Faster with Paystack-Linked Invoices

The single most effective change most Nigerian businesses can make to reduce payment time is adding a Paystack payment link to their invoices. **[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** does this automatically — create your invoice, share it on WhatsApp, and let clients pay in one tap.

For more on invoicing best practices and FIRS compliance, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — How to Write a Business Proposal in Nigeria
    // Target keyword: "how to write a business proposal Nigeria"  (~1,100 words)
    // =========================================================================
    {
        title: 'How to Write a Business Proposal in Nigeria: Structure, Pricing & Template',
        slug: 'how-to-write-a-business-proposal-nigeria',
        excerpt: 'Step-by-step guide to writing a winning business proposal in Nigeria. Covers structure, pricing, VAT, how to present it, and when it becomes an invoice.',
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `A business proposal is how you win contracts in Nigeria. Whether you are responding to a tender, pitching a corporate client, or presenting a solution to a potential partner, a well-structured proposal is often the difference between getting the job and losing to a competitor who presented better — not necessarily who could deliver better.

This guide covers the complete structure of a winning Nigerian business proposal, how to price it correctly, and when it transitions into a quotation or invoice.

## Business Proposal vs Quotation vs Invoice

These three documents exist on a continuum:

| Document | Purpose | Timing |
|---|---|---|
| **Business proposal** | Persuade the client to choose you | Before scope is agreed |
| **Quotation** | Confirm price for an agreed scope | After scope is defined |
| **Invoice** | Request payment for delivered work | After work is done |

A proposal is more detailed and persuasive than a quotation. It explains *why* you are the right choice, *how* you will deliver, and *what* it will cost. When the client says yes and agrees the scope, you issue a quotation to formalise the price. When the work is done, you issue an invoice.

---

## Structure of a Winning Nigerian Business Proposal

### 1. Cover Page
- Your business name and logo
- Proposal title: e.g., "Proposal for Digital Marketing Services — ABC Foods Ltd"
- Prepared for: client name
- Prepared by: your name/business
- Date
- Proposal reference number (for tracking)

### 2. Executive Summary (1 page maximum)
The most important section — many Nigerian executives read only this. Summarise:
- The client's problem or need (show you understand them)
- Your proposed solution
- The key benefits of choosing you
- Total investment (headline price) and timeline

Write this last, after you have completed the full proposal.

### 3. Understanding of the Brief
Demonstrate that you fully understand what the client needs. Paraphrase their requirement back to them — this builds confidence that your solution is relevant.

> *"ABC Foods Ltd is seeking to increase brand awareness among 25–45-year-old urban consumers in Lagos and Abuja, with a specific goal of driving 30% more traffic to the website by Q4 2026."*

### 4. Proposed Solution
Explain exactly what you will do. Be specific — vague proposals lose to specific ones.

Structure it as:
- **Phase 1:** What you will do first (and when)
- **Phase 2:** What comes next
- **Phase 3:** Delivery and handover

Include a simple timeline or Gantt chart if the project is complex.

### 5. Your Credentials and Experience
- Relevant past projects (with client names if permitted, or anonymised case studies)
- Team profiles — who will work on this engagement
- Any certifications, awards, or accreditations relevant to the brief
- Client testimonials or references (with permission)

### 6. Investment (Pricing)
Present your pricing clearly and professionally. Never bury the price — Nigerian clients want to find it easily.

**For service-based proposals:**
| Deliverable | Description | Investment (₦) |
|---|---|---|
| Phase 1: Strategy and Planning | Brand audit, competitor analysis, 3-month content strategy | 450,000 |
| Phase 2: Content Production | 12 blog posts, 36 social media posts, 3 email newsletters | 780,000 |
| Phase 3: Paid Advertising Management | Google Ads + Meta Ads management (3 months, excl. ad spend) | 450,000 |
| **Subtotal** | | **1,680,000** |
| **VAT (7.5%)** | | **126,000** |
| **Total Investment** | | **1,806,000** |

**Payment terms to include:**
- 40% on acceptance of proposal (kickoff payment)
- 30% at Phase 2 completion
- 30% on final delivery

### 7. Terms and Conditions
Keep this brief but cover:
- Proposal validity period (e.g., "This proposal is valid for 30 days")
- What is excluded from the price
- IP ownership
- Revision policy
- Cancellation terms

### 8. Next Steps
End with a clear call to action — do not leave the client wondering what to do next:

> *"To proceed, please sign and return this proposal by 20 March 2026 and make the kickoff payment of ₦[amount]. We will schedule a project kick-off meeting within 3 working days of receiving payment."*

---

## Pricing Your Nigerian Business Proposal

### Research Before You Price
- Understand the client's budget if possible (ask at the briefing stage)
- Know your competitors' approximate rates for similar work
- Price for value delivered, not just time spent

### Include VAT Correctly
If you are VAT-registered, show VAT at 7.5% as a separate line — do not roll it into your price. Corporate clients need to see VAT separately for their own accounting.

If you are not VAT-registered, state: *"VAT not applicable — [Your Business] is not currently VAT-registered."* Do not leave it ambiguous.

### Account for WHT
Corporate clients will deduct 5% WHT from your payments. Factor this into your cash flow — you will receive 95% of the agreed fee upfront, with a WHT credit note for the remainder.

### Validity Period
Always state how long your pricing is valid. In Nigeria's inflationary environment, a proposal with no expiry date is a risk. Use 14–30 days as standard.

---

## How to Present a Business Proposal in Nigeria

### PDF, Not Word
Always send proposals as PDF documents — they look more professional, cannot be easily edited, and display consistently on any device.

### Deliver Personally if Possible
For high-value proposals, request a presentation meeting rather than just emailing the document. Walking the client through your proposal is far more effective than hoping they read it carefully.

### Follow Up Relentlessly
In Nigeria, silence after sending a proposal usually means it has not been read yet — not that it has been rejected. Follow up by phone within 48 hours of sending, then every 3–5 days until you get a decision.

---

## From Proposal to Invoice

Once the client accepts your proposal:
1. Issue a **formal quotation** confirming the final scope and price
2. Get the quotation signed or confirmed in writing
3. Issue your **first invoice** (kickoff payment) with a Paystack payment link
4. Commence work only after the kickoff payment is received

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** makes it fast to issue that first invoice after a proposal is accepted — with VAT, Paystack links, and WhatsApp sharing built in.

For more on the full invoicing process — from proposal to payment — see our **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 14 blog posts (${posts.length} posts)...\n`);

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
