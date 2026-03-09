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
// Post 1 — "How to Invoice as a Consultant in Nigeria"
//   Meta title : "How to Invoice as a Consultant in Nigeria | InvoiceGenerator.ng" (65 chars)
//   Meta desc  : "A complete guide for Nigerian consultants on invoicing: billing
//                 models, VAT at 7.5%, WHT deductions, retainer fees, and how
//                 to get paid on time." (155 chars)
//
// Post 2 — "Digital Marketing Invoice Template Nigeria"
//   Meta title : "Digital Marketing Invoice Template Nigeria | InvoiceGenerator.ng" (65 chars)
//   Meta desc  : "Create a professional digital marketing invoice in Nigeria. Covers
//                 social media, SEO, PPC, VAT at 7.5%, WHT, retainer billing,
//                 and getting paid on time." (158 chars)
//
// Post 3 — "How to Create a Recurring Invoice in Nigeria"
//   Meta title : "How to Create a Recurring Invoice in Nigeria | InvoiceGenerator.ng" (67 chars)
//   Meta desc  : "Learn how to set up recurring invoices in Nigeria for retainers and
//                 subscriptions. Covers billing cycles, VAT, automation, and
//                 how to manage repeat clients." (158 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Invoice as a Consultant in Nigeria
    // Target keyword: "how to invoice as a consultant Nigeria"  (~1,200 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Consultant in Nigeria: Billing Models, VAT & Getting Paid',
        slug: 'how-to-invoice-as-a-consultant-nigeria',
        excerpt: 'A complete guide for Nigerian consultants on invoicing: billing models, VAT at 7.5%, WHT deductions, retainer fees, and how to get paid on time.',
        coverImage: null,
        published: true,
        content: `Consulting is one of the fastest-growing professional service categories in Nigeria. Strategy consultants, HR advisers, IT consultants, financial advisers, and management consultants all face the same challenge: how do you bill clients professionally, stay FIRS-compliant, and get paid on time?

This guide covers everything Nigerian consultants need to know about invoicing — from billing structures to VAT, withholding tax, and enforcement.

## Consulting Billing Models and How to Invoice Each

The right invoice format depends on how you price your consulting work.

### 1. Day Rate / Hourly Rate Consulting
The most common billing model for independent Nigerian consultants.

**Invoice structure:**
| Description | Rate | Days/Hours | Amount |
|---|---|---|---|
| Strategy consulting — market entry assessment | ₦75,000/day | 5 days | ₦375,000 |
| **Subtotal** | | | **₦375,000** |
| **VAT (7.5%)** | | | **₦28,125** |
| **Total** | | | **₦403,125** |

Always specify: the period covered, the number of days or hours worked, and your agreed rate. Do not simply write "Consulting fees — ₦375,000."

### 2. Project-Based (Fixed Fee)
A single fixed price for a defined deliverable — e.g., a market feasibility study, a process audit, or a business plan.

**Invoice structure:**
| Description | Amount |
|---|---|
| Organisational restructuring review — report and recommendations (delivered 28 Feb 2026) | ₦1,200,000 |
| **Subtotal** | **₦1,200,000** |
| **VAT (7.5%)** | **₦90,000** |
| **Total** | **₦1,290,000** |

For large fixed-fee projects, split into milestone invoices:
- 40% on project commencement
- 30% at mid-point deliverable
- 30% on final delivery

### 3. Monthly Retainer
A fixed monthly fee for ongoing availability and advisory services. Common for board advisers, outsourced CFOs, and IT consultants.

**Invoice structure:**
| Description | Amount |
|---|---|
| Monthly retainer — financial advisory services (March 2026) | ₦350,000 |
| **Subtotal** | **₦350,000** |
| **VAT (7.5%)** | **₦26,250** |
| **Total** | **₦376,250** |

Send retainer invoices on the same date each month — ideally 5 days before the month starts or on the first working day of the month.

### 4. Success / Contingency Fee
A percentage of the value delivered — common in fundraising, M&A advisory, and sales consulting.

**Invoice structure:**
| Description | Amount |
|---|---|
| Success fee — 3% of ₦50,000,000 transaction value (per signed agreement dated 10 Jan 2026) | ₦1,500,000 |
| **Subtotal** | **₦1,500,000** |
| **VAT (7.5%)** | **₦112,500** |
| **Total** | **₦1,612,500** |

Always reference the agreement or engagement letter that defines the success fee terms.

---

## Mandatory Elements on a Nigerian Consulting Invoice

Under FIRS guidelines, every consulting invoice should include:

1. **Your name or business name** and address
2. **Tax Identification Number (TIN)** — if VAT-registered
3. **Client name and address** — including their TIN for B2B invoices
4. **Unique invoice number** — sequential (e.g., CONS-2026-014)
5. **Invoice date and due date**
6. **Itemised services** — not a lump sum
7. **VAT calculated separately** at 7.5% (if registered)
8. **Payment details** — bank account or Paystack link

---

## VAT for Nigerian Consultants

If your annual consulting income exceeds **₦25 million**, you must register for VAT with FIRS and charge 7.5% on all invoices.

If you are below the threshold, VAT registration is optional — but you cannot charge VAT without being registered. Many consultants register voluntarily to appear more credible with corporate clients.

**Tip:** Corporate clients who are VAT-registered can reclaim the VAT you charge as input VAT. This means your VAT is not a cost to them — registering removes a potential objection to your rates.

---

## Withholding Tax (WHT) on Consulting Fees

Corporate clients in Nigeria are legally required to deduct **Withholding Tax (WHT)** from payments to consultants:

- **5% WHT** on payments to companies
- **5% WHT** on payments to individuals (for management and consulting services)

This is deducted from your invoice total (pre-VAT) and remitted to FIRS by your client. Your client must issue you a **WHT credit note**, which you use to offset your annual income tax or company tax bill.

**Practical example:**

Your consulting invoice: ₦500,000 + VAT (₦37,500) = **₦537,500**

Client deducts WHT (5% of ₦500,000): ₦25,000

**Client pays you: ₦512,500**

You receive a WHT credit note for ₦25,000, reducing your tax liability at year-end.

---

## Getting Your Consulting Invoices Paid

### Use a Formal Engagement Letter
Before starting any consulting engagement, issue a signed engagement letter or contract that specifies:
- Scope of work
- Fee structure and billing schedule
- Payment terms (due date, late fees)
- Cancellation terms

This document is your legal basis for enforcing payment.

### Collect a Deposit
For new clients, require **30–50% upfront** before work commences. Never start a consulting engagement without a signed agreement and deposit in your account.

### Set Clear Due Dates
"Net 30" is standard in corporate Nigeria, but freelance consultants should aim for "Net 14" or "Net 7". Always state the specific due date on the invoice — not just "30 days."

### Add Late Payment Terms
State on every invoice: *"Overdue balances attract interest at 3% per month from the due date."* This is legally enforceable and encourages timely payment.

### Make Payment Easy
Include a **Paystack payment link** on your invoice so clients can pay instantly by card or bank transfer — no need to visit a bank or initiate a USSD transfer.

---

## Create Professional Consulting Invoices

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is built for Nigerian professionals. Create itemised consulting invoices with automatic VAT calculation, payment terms, and Paystack integration — shareable via WhatsApp or email in seconds.

See also our full **[Nigerian Invoicing Guide](/guide)** covering FIRS compliance, VAT registration, and best billing practices for service professionals.`,
    },

    // =========================================================================
    // POST 2 — Digital Marketing Invoice Template Nigeria
    // Target keyword: "digital marketing invoice template Nigeria"  (~1,100 words)
    // =========================================================================
    {
        title: 'Digital Marketing Invoice Template Nigeria: What to Include & How to Bill Clients',
        slug: 'digital-marketing-invoice-template-nigeria',
        excerpt: 'Create a professional digital marketing invoice in Nigeria. Covers social media, SEO, PPC, VAT at 7.5%, WHT, retainer billing, and getting paid on time.',
        coverImage: null,
        published: true,
        content: `Nigeria's digital marketing industry is booming. Social media managers, SEO specialists, Google Ads experts, content creators, and email marketers are all in high demand as Nigerian businesses invest more in digital channels. But billing for digital marketing services requires care — especially when it comes to VAT, managing ad spend separately, and structuring retainer invoices.

This guide shows Nigerian digital marketers exactly how to invoice clients professionally.

## Digital Marketing Service Types and How to Invoice Each

### Social Media Management
Monthly retainer covering content creation, posting, community management, and reporting.

**Invoice example:**
| Description | Amount |
|---|---|
| Social media management — Instagram & Facebook (March 2026) | ₦120,000 |
| Content creation — 20 posts (static graphics + captions) | ₦80,000 |
| Monthly analytics report | ₦20,000 |
| **Subtotal** | **₦220,000** |
| **VAT (7.5%)** | **₦16,500** |
| **Total** | **₦236,500** |

### SEO Services
Monthly retainer or project-based depending on scope.

**Invoice example:**
| Description | Amount |
|---|---|
| SEO retainer — February 2026 (on-page optimisation, link building, monthly report) | ₦180,000 |
| **Subtotal** | **₦180,000** |
| **VAT (7.5%)** | **₦13,500** |
| **Total** | **₦193,500** |

### Paid Advertising (Google Ads / Meta Ads)
Critical: **always separate your management fee from the ad spend budget.** Ad spend goes directly from the client to Google/Meta — it is not your income and you must not include it in your invoice as revenue.

**Invoice example:**
| Description | Amount |
|---|---|
| Google Ads management fee — March 2026 (campaign setup, optimisation, reporting) | ₦95,000 |
| **Ad spend budget (paid directly by client to Google)** | **NOT on this invoice** |
| **Subtotal** | **₦95,000** |
| **VAT (7.5%)** | **₦7,125** |
| **Total** | **₦102,125** |

If you run ads on the client's behalf using your own card and seek reimbursement, invoice the ad spend as a **pass-through cost** with zero markup and zero VAT on that line — it is a reimbursable expense, not a service fee.

### Content Marketing / Copywriting
Project-based invoicing per deliverable.

**Invoice example:**
| Description | Qty | Unit Price | Total |
|---|---|---|---|
| Blog articles (1,000–1,200 words, SEO-optimised) | 4 | ₦35,000 | ₦140,000 |
| Email newsletter copy (monthly, 3 sends) | 3 | ₦25,000 | ₦75,000 |
| **Subtotal** | | | **₦215,000** |
| **VAT (7.5%)** | | | **₦16,125** |
| **Total** | | | **₦231,125** |

---

## Mandatory Elements on a Nigerian Digital Marketing Invoice

Every invoice you issue must include:

1. **Your business name and address**
2. **Your TIN** (if VAT-registered)
3. **Client name, company, and address**
4. **Invoice number** — unique, sequential (e.g., DM-2026-022)
5. **Invoice date and payment due date**
6. **Itemised services** — broken down by deliverable, not a single line
7. **VAT at 7.5%** shown as a separate line (if registered)
8. **Bank account details or Paystack link**
9. **Payment terms** — including late fee clause

---

## VAT and WHT for Digital Marketers in Nigeria

### VAT
If your annual digital marketing income exceeds **₦25 million**, register for VAT with FIRS and charge 7.5% on all service invoices.

Below the threshold, registration is optional — but never charge VAT without being registered.

### Withholding Tax (WHT)
When billing corporate clients (companies), they will deduct **5% WHT** from your service fee (not from VAT). They issue you a WHT credit note to offset against your taxes.

**Example:**
- Your invoice: ₦200,000 service fee + ₦15,000 VAT = ₦215,000
- WHT deducted: 5% × ₦200,000 = ₦10,000
- Client pays: ₦205,000 (₦215,000 − ₦10,000)
- You receive a WHT credit note for ₦10,000

---

## Structuring Your Digital Marketing Retainer

Most digital marketing relationships are retainer-based. Use this structure:

**Month 1:**
1. Onboarding invoice — strategy, account setup, first month's fee (pay upfront)
2. Send on or before the 1st of the month

**Ongoing:**
- Invoice on the same date each month (e.g., 25th of the prior month or 1st of the current month)
- Include a breakdown of deliverables for the month covered
- Attach a brief performance summary as a PDF alongside the invoice

**Retainer Invoice Tips:**
- Specify the **month being billed** (e.g., "Social media management — April 2026")
- List the deliverables included (posts, reports, campaigns)
- State what is **excluded** (ad spend, third-party tool subscriptions)

---

## Managing Ad Spend Billing Properly

One of the most common billing mistakes Nigerian digital marketers make is mixing ad spend with service fees. This creates:
- Incorrect VAT calculations (you are charging VAT on money that is not yours)
- Tax compliance issues (inflated revenue in your accounts)
- Client confusion and disputes

**Correct approach:**
1. Ask clients to set up their own Google Ads and Meta Ads accounts — you just manage them
2. Or: clients top up a dedicated ad spend account monthly — billed separately as a pass-through
3. Your management fee is the only thing on your invoice

---

## Getting Paid as a Nigerian Digital Marketer

### Collect Upfront
Never start work without a deposit. For new clients: 50% upfront minimum. For ongoing retainers: pay by the 1st of the month, no work delivered on credit.

### Include Paystack Links
Add a Paystack payment link to every invoice so clients can pay instantly. The easier you make payment, the faster you get paid.

### Enforce Retainer Stop-Work
State clearly in your contract: *"Services will be paused if the monthly retainer invoice is not settled within 5 working days of the due date."* Follow through consistently.

### Charge Late Fees
Include a late payment clause on every invoice: *"Overdue balances attract interest at 3% per month."* Document this in your contract too.

---

## Create Your Digital Marketing Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** lets Nigerian digital marketers create professional, itemised invoices with VAT, Paystack payment links, and WhatsApp sharing — in under 2 minutes.

Also see our **[Nigerian Invoicing Guide](/guide)** for more on FIRS compliance, VAT registration, and freelancer billing best practices.`,
    },

    // =========================================================================
    // POST 3 — How to Create a Recurring Invoice in Nigeria
    // Target keyword: "recurring invoice Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'How to Create a Recurring Invoice in Nigeria: Retainers, Subscriptions & Automation',
        slug: 'how-to-create-a-recurring-invoice-nigeria',
        excerpt: 'Learn how to set up recurring invoices in Nigeria for retainers and subscriptions. Covers billing cycles, VAT, automation, and how to manage repeat clients.',
        coverImage: null,
        published: true,
        content: `If you have clients who pay you monthly — whether for retainer services, software subscriptions, maintenance contracts, or ongoing supply agreements — you are probably spending more time creating invoices than you need to. Recurring invoicing automates this process and ensures you get paid reliably every cycle.

This guide explains how recurring invoices work in Nigeria, what to include, how VAT applies, and how to set them up efficiently.

## What Is a Recurring Invoice?

A **recurring invoice** is an invoice that repeats automatically on a fixed schedule — weekly, monthly, or quarterly — for the same amount (or an amount that updates based on usage). It is ideal for:

- **Retainer agreements** — consultants, lawyers, accountants, digital agencies
- **Maintenance contracts** — IT support, generator servicing, cleaning contracts
- **Software-as-a-Service (SaaS)** — Nigerian tech companies billing subscription customers
- **Rental agreements** — commercial property, equipment leasing
- **Ongoing supply contracts** — regular delivery of goods

---

## Recurring vs One-Time Invoice: Key Differences

| | One-Time Invoice | Recurring Invoice |
|---|---|---|
| **Frequency** | Single billing event | Repeats on a fixed schedule |
| **Setup effort** | Created each time | Set up once, auto-generates |
| **Best for** | Project work, ad hoc sales | Retainers, subscriptions, contracts |
| **Risk** | N/A | Must update if scope or price changes |

---

## What to Include on a Nigerian Recurring Invoice

Each recurring invoice should include:

1. **Invoice number** — must be unique and sequential, even for recurring invoices (e.g., RET-2026-001, RET-2026-002)
2. **Billing period** — clearly state what period the invoice covers: *"Services: 1 March 2026 – 31 March 2026"*
3. **Service description** — itemise what is included in this billing cycle
4. **Amount** — consistent with the agreed retainer/contract
5. **VAT at 7.5%** — if VAT-registered, calculated on the service fee
6. **Due date** — typically 5–7 days from issue for retainers
7. **Payment method** — bank transfer or Paystack link

**Example — Monthly IT Support Retainer:**

| Description | Amount |
|---|---|
| IT support retainer — March 2026 (helpdesk, remote monitoring, monthly visit) | ₦250,000 |
| **Subtotal** | **₦250,000** |
| **VAT (7.5%)** | **₦18,750** |
| **Total** | **₦268,750** |

*Invoice period: 1 March 2026 – 31 March 2026*
*Due: 5 March 2026*

---

## VAT on Recurring Invoices in Nigeria

If you are VAT-registered with FIRS, you must charge **7.5% VAT** on every recurring invoice for taxable services. This applies whether the invoice is generated manually or automatically.

Key rules:
- VAT is charged on the **service fee**, not on any pass-through costs (e.g., third-party software subscriptions billed at cost)
- Each invoice must show VAT as a **separate line item** — not rolled into the total
- You must file and remit VAT monthly to FIRS, regardless of when your clients pay

**Annual price reviews:** If you increase your retainer rate annually, update the VAT calculation accordingly on the new invoices. Notify clients in writing before the increase takes effect.

---

## WHT on Recurring Invoices

Corporate clients will deduct **5% Withholding Tax** from each recurring payment. Ensure your contract and invoice acknowledge this so there are no disputes when they pay less than the invoice total.

Include a line in your invoice footer: *"WHT (5%) will be deducted by corporate clients as required by FIRS. A credit note must be issued."*

---

## Setting Up Recurring Invoices: Best Practices

### 1. Define the Billing Cycle in Your Contract
Your service agreement or retainer contract should specify:
- Billing frequency (monthly, quarterly, annually)
- Invoice issue date (e.g., "Invoice issued on the 25th of each month for the following month")
- Payment due date (e.g., "Payment due by the 1st of the billing month")
- Price escalation clause (e.g., "Rates subject to annual review in January each year")

### 2. Create an Invoice Template
Build a master invoice template with all the fixed information (your details, client details, service description, VAT formula). Update only the:
- Invoice number
- Billing period
- Issue date and due date

### 3. Send at the Same Time Every Cycle
Consistency builds trust and makes budgeting easier for your clients. If you invoice on the 25th each month, always invoice on the 25th. Set a calendar reminder.

### 4. Use Paystack for Automatic Collection
For subscription billing, **Paystack Subscriptions** allows you to set up automatic card charges on a recurring schedule. Your customer authorises the card once, and Paystack charges it automatically each billing cycle.

This eliminates the manual follow-up cycle entirely and dramatically reduces late payments for Nigerian SaaS and subscription businesses.

### 5. Archive Every Invoice
Keep a record of every recurring invoice issued — in a folder organised by client and year. FIRS requires businesses to maintain invoice records for at least 6 years. Good record-keeping also makes VAT filing and annual tax returns much easier.

---

## Handling Changes to Recurring Invoices

### Price Increase
Issue a **formal notice** to the client at least 30 days before the new rate takes effect. Reference the clause in your contract. Issue the first invoice at the new rate with a note: *"Rate updated per [date] notice. New retainer rate: ₦[X]/month."*

### Scope Change
If the client adds or removes services, issue an **amended service agreement** before updating the invoice. Never change the invoice amount without documented agreement.

### Client Cancels
As per your contract terms, issue a final invoice covering any notice period. If a deposit or advance was collected, reconcile it against the final invoice.

---

## Create Recurring Invoices with InvoiceGenerator.ng

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** makes it easy to create professional recurring invoices for Nigerian clients — with automatic VAT, Paystack payment links, and instant WhatsApp or email delivery.

For more on invoicing best practices, payment terms, and FIRS compliance, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 6 blog posts (${posts.length} posts)...\n`);

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
