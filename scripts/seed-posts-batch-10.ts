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
// Post 1 — "How to Invoice as an Event Planner in Nigeria"
//   Meta title : "How to Invoice as an Event Planner in Nigeria | InvoiceGenerator.ng" (70 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian event planners: deposit
//                 structures, vendor pass-throughs, VAT at 7.5%, WHT, and
//                 how to get paid before event day." (155 chars)
//
// Post 2 — "What Is a Tax Invoice in Nigeria"
//   Meta title : "What Is a Tax Invoice in Nigeria — And Do You Need One?" (56 chars)
//   Meta desc  : "A tax invoice is required for all VAT-registered businesses in
//                 Nigeria. Learn what it must include, how it differs from a
//                 regular invoice, and FIRS rules." (156 chars)
//
// Post 3 — "How to Track Unpaid Invoices in Nigeria"
//   Meta title : "How to Track Unpaid Invoices in Nigeria | InvoiceGenerator.ng" (61 chars)
//   Meta desc  : "Learn how to track, chase, and recover unpaid invoices in Nigeria.
//                 Covers aging reports, reminder templates, late fees, small
//                 claims court, and prevention tips." (159 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Invoice as an Event Planner in Nigeria
    // Target keyword: "event planner invoice Nigeria"  (~1,200 words)
    // =========================================================================
    {
        title: 'How to Invoice as an Event Planner in Nigeria: Deposits, VAT & Getting Paid',
        slug: 'how-to-invoice-as-an-event-planner-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian event planners: deposit structures, vendor pass-throughs, VAT at 7.5%, WHT, and how to get paid before event day.',
        coverImage: null,
        published: true,
        content: `Event planning is one of Nigeria's most vibrant service industries. From corporate conferences in Lagos to elaborate Abuja weddings and Portharcourt product launches, Nigerian event planners coordinate thousands of moving parts — and invoice for all of them. Getting your billing structure right is essential for protecting your cash flow and avoiding disputes with clients.

This guide covers exactly how to structure event planning invoices in Nigeria, from the initial deposit to the final settlement.

## The Event Planner Invoice Structure

Unlike most service businesses that invoice after delivery, event planners invoice across multiple stages — because you are spending money on behalf of clients long before the event happens. A typical structure:

### Stage 1: Booking Deposit Invoice (30–50%)
Issued immediately when the client confirms the booking. This secures the date and covers your initial planning time.

**Example — Booking Deposit Invoice:**
| Description | Amount |
|---|---|
| Event planning deposit — 40th birthday celebration (15 June 2026) | ₦750,000 |
| *Note: This deposit is non-refundable if cancelled within 30 days of event date* | |
| **Subtotal** | **₦750,000** |
| **VAT (7.5%)** | **₦56,250** |
| **Total Due Now** | **₦806,250** |

### Stage 2: Vendor Mobilisation Invoice (30–40%)
Issued 4–6 weeks before the event, once you have confirmed vendors and need to make deposits to caterers, decorators, AV companies, and venues.

**Example — Vendor Mobilisation Invoice:**
| Description | Amount |
|---|---|
| Event planning — second instalment (vendor mobilisation) | ₦562,500 |
| **Subtotal** | **₦562,500** |
| **VAT (7.5%)** | **₦42,188** |
| **Total Due** | **₦604,688** |

### Stage 3: Balance / Final Invoice (remaining %)
Issued 7–14 days before the event. No balance, no event.

**Example — Final Balance Invoice:**
| Description | Amount |
|---|---|
| Event planning — final balance (due 7 days before event) | ₦187,500 |
| Additional décor upgrade (agreed 20 May 2026) | ₦85,000 |
| **Subtotal** | **₦272,500** |
| **VAT (7.5%)** | **₦20,438** |
| **Total Due** | **₦292,938** |

### Stage 4: Post-Event Reconciliation (if applicable)
For cost-plus engagements where you manage the full event budget, issue a final reconciliation invoice after the event covering any approved variations not in the original scope.

---

## How to Handle Vendor Costs on Your Invoice

This is where many Nigerian event planners make costly mistakes. There are two ways to handle vendor costs:

### Option A: Inclusive Pricing (Most Common)
You quote a single event management fee that covers your fee plus all vendor costs. You are responsible for paying vendors from your fee. Simple for the client, but you bear the financial risk if vendors charge more than expected.

**Invoice shows:** Total event management fee only (your markup included).

### Option B: Cost-Plus / Pass-Through Pricing
You charge a management fee (your profit) separately from vendor costs, which are passed through at actual cost or with a disclosed markup.

**Invoice shows:**
| Description | Amount |
|---|---|
| Event management fee (planning, coordination, on-site management) | ₦500,000 |
| Catering — 200 guests at ₦8,500/head (pass-through at cost) | ₦1,700,000 |
| Venue hire — Eko Hotels, Lagos (pass-through at cost) | ₦850,000 |
| AV and lighting | ₦320,000 |
| Décor and florals | ₦450,000 |
| **Subtotal** | **₦3,820,000** |
| **VAT (7.5%) on management fee** | **₦37,500** |
| **VAT (7.5%) on taxable vendor services** | **₦189,750** |
| **Total** | **₦4,047,250** |

**Important:** VAT applies to your management fee and to vendor services that are themselves VATable. If a vendor is not VAT-registered, their cost is not subject to VAT on your invoice — you simply pass the cost through.

---

## Mandatory Invoice Elements for Nigerian Event Planners

Every invoice must include:

1. **Your business name and address**
2. **TIN** — if VAT-registered
3. **Client name and address**
4. **Invoice number** — sequential (e.g., EVT-2026-008)
5. **Invoice date and due date**
6. **Event name and date** — always reference the specific event
7. **Itemised services** — stage of payment and what it covers
8. **VAT at 7.5%** — if registered, shown separately
9. **Bank details or Paystack link**
10. **Cancellation/refund policy** — stated on every deposit invoice

---

## VAT for Nigerian Event Planners

If your annual event planning income exceeds **₦25 million**, VAT registration with FIRS is mandatory. You charge 7.5% on your service fees and on vendor costs you pass through (where those vendors would themselves charge VAT).

Common VATable event services:
- Catering (VATable if caterer is registered)
- AV and technical production
- Photography and videography
- Event management fees

Not VATable:
- Government venue hire (e.g., public halls) — government bodies are generally exempt
- Small informal vendors who are not VAT-registered

---

## WHT on Event Planning Fees

Corporate clients deduct **5% WHT** from your event management fee (not from vendor pass-throughs, which are your clients' payments for third-party services). Ensure your contract distinguishes your fee from pass-through costs so WHT is calculated correctly.

---

## Never Run an Event Without Full Payment

The golden rule of Nigerian event planning: **no balance, no event.** State this explicitly in your contract and on your final invoice.

Events are not reversible. Once you have paid vendors, booked venues, and mobilised staff, a non-paying client puts your entire business at risk. Enforce your payment schedule without exception.

---

## Create Your Event Planning Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** lets you create professional, staged event planning invoices with automatic VAT, Paystack payment links, and WhatsApp sharing — free for Nigerian event planners.

For more on invoicing compliance and payment terms, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 2 — What Is a Tax Invoice in Nigeria
    // Target keyword: "tax invoice Nigeria"  (~900 words)
    // =========================================================================
    {
        title: 'What Is a Tax Invoice in Nigeria — And Do You Need One?',
        slug: 'what-is-a-tax-invoice-nigeria',
        excerpt: 'A tax invoice is required for all VAT-registered businesses in Nigeria. Learn what it must include, how it differs from a regular invoice, and FIRS rules.',
        coverImage: null,
        published: true,
        content: `The term "tax invoice" is used frequently in Nigerian business — but many business owners are unsure exactly what it means, whether they are required to issue one, and how it differs from a regular invoice. This guide answers all of those questions clearly.

## What Is a Tax Invoice?

A **tax invoice** is a specific type of invoice issued by a VAT-registered business in Nigeria. It is required by FIRS under the Value Added Tax Act and serves as the official document for:

- Charging VAT on goods or services supplied
- Allowing the buyer to claim input VAT (to reclaim VAT they paid)
- Supporting your monthly VAT return with FIRS

In simple terms: if you are registered for VAT, every invoice you issue is (and must be) a tax invoice. If you are not VAT-registered, you issue a standard commercial invoice — not a tax invoice.

---

## Tax Invoice vs Regular Invoice: What Is the Difference?

| | Tax Invoice | Regular Invoice |
|---|---|---|
| **Who issues it** | VAT-registered businesses only | Any business |
| **VAT shown** | Yes — 7.5% as a separate line item | No VAT (or stated as not applicable) |
| **TIN required** | Yes — mandatory | Recommended but not legally required |
| **Buyer can claim input VAT** | Yes | No |
| **FIRS requirement** | Mandatory for VAT-registered businesses | Standard best practice |

The practical difference matters most for your **buyers**. A corporate buyer who is VAT-registered can only claim back the VAT they paid if they hold a valid tax invoice from a VAT-registered supplier. If you are VAT-registered but issue a regular invoice (without VAT and TIN), your client cannot reclaim input VAT — and they will likely demand a corrected tax invoice.

---

## Who Must Issue a Tax Invoice in Nigeria?

You are legally required to issue a tax invoice if:

- You are registered for VAT with FIRS (mandatory once turnover exceeds ₦25 million per year)
- You are making a **taxable supply** of goods or services in Nigeria

Even below the ₦25 million threshold, if you have voluntarily registered for VAT, you must issue tax invoices.

---

## What Must a Nigerian Tax Invoice Include?

Under the VAT Act and FIRS administrative guidelines, a compliant tax invoice must contain:

1. **The words "TAX INVOICE"** — clearly stated at the top (some businesses write "VAT Invoice")
2. **Your business name and address**
3. **Your Tax Identification Number (TIN)** — this is your VAT registration number
4. **Your VAT registration number** (in practice this is the same as your TIN)
5. **The buyer's name and address**
6. **The buyer's TIN** — required for B2B supplies
7. **Invoice number** — unique and sequential
8. **Invoice date**
9. **Description of goods or services** — itemised, not a lump sum
10. **Quantity and unit price** — for goods
11. **Taxable value** — the subtotal before VAT
12. **VAT amount** — 7.5% of the taxable value, shown as a separate line
13. **Total amount payable** — including VAT

---

## Tax Invoice Example — Nigeria

---

**TAX INVOICE**

**Adunola Consulting Ltd**
22 Broad Street, Lagos Island, Lagos
TIN: 1234567-0001 | VAT Reg No: 1234567-0001

**Invoice No:** INV-2026-044
**Date:** 10 March 2026
**Due:** 24 March 2026

**Bill To:**
Okafor Manufacturing Plc
Plot 12, Trans-Amadi Industrial Layout, Port Harcourt
TIN: 9876543-0002

| Description | Qty | Unit Price (₦) | Amount (₦) |
|---|---|---|---|
| Business process audit — operations division (Feb–Mar 2026) | 1 | 350,000 | 350,000 |
| Staff efficiency training — 2-day workshop | 1 | 150,000 | 150,000 |
| **Taxable Value (Subtotal)** | | | **500,000** |
| **VAT @ 7.5%** | | | **37,500** |
| **TOTAL DUE** | | | **537,500** |

Bank: Guaranty Trust Bank | Account: 0123456789 | Account Name: Adunola Consulting Ltd

---

## What Happens If You Don't Issue a Tax Invoice?

If you are VAT-registered and fail to issue proper tax invoices, FIRS can:

- **Disallow your client's input VAT claim** — causing a dispute with your client
- **Impose penalties** during a VAT audit — failure to maintain proper records attracts fines
- **Assess additional VAT** — FIRS can estimate your VAT liability if your records are incomplete

Your clients also have a practical incentive to demand correct tax invoices — their own FIRS compliance depends on it.

---

## Do Small Businesses Need to Issue Tax Invoices?

**No — only if you are VAT-registered.** If your annual turnover is below ₦25 million and you have not voluntarily registered for VAT, you issue standard invoices (not tax invoices) and do not charge VAT.

However, many Nigerian SMEs register voluntarily even below the threshold because:
- Corporate clients expect VAT invoices
- It signals credibility and professionalism
- You can reclaim input VAT on your own business costs

---

## Create FIRS-Compliant Tax Invoices

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** automatically generates properly formatted invoices for Nigerian businesses — with VAT calculated at 7.5%, sequential invoice numbers, and your TIN prominently displayed.

For the full guide to VAT registration, FIRS compliance, and invoicing requirements, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — How to Track Unpaid Invoices in Nigeria
    // Target keyword: "track unpaid invoices Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'How to Track Unpaid Invoices in Nigeria (And Actually Get Paid)',
        slug: 'how-to-track-unpaid-invoices-nigeria',
        excerpt: 'Learn how to track, chase, and recover unpaid invoices in Nigeria. Covers aging reports, reminder templates, late fees, small claims court, and prevention tips.',
        coverImage: null,
        published: true,
        content: `Late and unpaid invoices are one of the most common cash flow problems for Nigerian freelancers and small businesses. You deliver the work, send the invoice, and then — silence. Chasing payment is uncomfortable, but leaving money on the table is worse. The good news: with the right tracking system and escalation process, you can recover most overdue invoices without damaging client relationships.

## Why Invoice Tracking Matters

Without a tracking system, invoices get lost — not just by your clients, but by you. Busy freelancers often forget which invoices are outstanding until they are weeks or months overdue. By that point, the client may have mentally written off the expense, and collection becomes exponentially harder.

A simple tracking habit — even just a spreadsheet — can reduce your average payment time significantly.

---

## Step 1: Build an Invoice Register

Your invoice register is a simple log of every invoice you issue. Track:

| Column | What to record |
|---|---|
| Invoice No | INV-2026-041 |
| Client | Zenith Foods Ltd |
| Issue Date | 1 March 2026 |
| Due Date | 15 March 2026 |
| Amount | ₦322,500 |
| Status | Overdue |
| Days Overdue | 12 |
| Last Action | Reminder sent 16 Mar |
| Notes | Awaiting finance sign-off |

Review this register every Monday morning. Any invoice marked overdue should trigger an action that day.

---

## Step 2: Use an Invoice Aging Report

An **aging report** groups your outstanding invoices by how overdue they are:

| Age Bucket | Action Required |
|---|---|
| Current (not yet due) | No action — monitor |
| 1–7 days overdue | Friendly reminder |
| 8–14 days overdue | Formal follow-up with late fee notice |
| 15–30 days overdue | Escalation call + written demand |
| 30+ days overdue | Formal demand letter / legal action |

Running an aging report weekly tells you at a glance where your cash flow risk is concentrated.

---

## Step 3: Reminder Templates That Work in Nigeria

Nigerian business culture values relationships — your reminders should be firm but respectful. Here are three templates for each escalation stage:

### Day 1 Overdue — WhatsApp Reminder
> *"Hi [Name], hope you're well. Just a friendly reminder that Invoice No. INV-2026-041 for ₦322,500 was due on 15 March 2026. Please let me know if you need anything from my end to process payment. Bank details are on the invoice. Thank you!"*

### Day 7 Overdue — Formal Email
> *Subject: Overdue Invoice INV-2026-041 — ₦322,500*
>
> *Dear [Name/Finance Team],*
>
> *This is a formal reminder that Invoice No. INV-2026-041 for ₦322,500 (due 15 March 2026) remains unpaid. Per our agreed payment terms, interest of 3% per month now applies to the outstanding balance.*
>
> *Please arrange payment within the next 5 working days. Bank details: [Bank] | [Account No] | [Account Name].*
>
> *Alternatively, pay via: [Paystack link]*
>
> *Regards, [Your Name]*

### Day 14 Overdue — Demand Notice
> *Subject: FINAL NOTICE — Invoice INV-2026-041 overdue 14 days*
>
> *Dear [Name],*
>
> *Invoice INV-2026-041 for ₦322,500 (due 15 March 2026) remains unpaid despite previous reminders. Interest of ₦9,675 (3% × 14 days pro-rated) has accrued.*
>
> *Unless payment of ₦332,175 is received within 7 days of this notice, we will pursue recovery through the appropriate legal channels without further notice.*
>
> *[Your Name | Your Business]*

---

## Step 4: Make a Direct Phone Call

WhatsApp messages and emails are easy to ignore. A direct phone call to the client's finance manager or decision-maker is often the single most effective step in recovering overdue Nigerian invoices.

Keep the call professional:
- Reference the specific invoice number and amount
- Ask for a specific payment commitment date
- Follow up the call with a WhatsApp message confirming what was agreed

---

## Step 5: Apply Late Payment Interest

If your invoice terms include a late payment clause (and they should), calculate and communicate the accruing interest. Most clients will pay the principal quickly once they realise the total is growing.

**Example:** ₦500,000 overdue for 45 days at 3%/month = ₦22,500 interest. Total now due: ₦522,500.

Send a **revised invoice** or **debit note** for the interest amount so your client has a formal document to process.

---

## Step 6: Escalate to Small Claims Court

For invoices under ₦5 million, Nigeria's **Small Claims Courts** (operational in Lagos, Abuja, Rivers State, and others) offer a fast, low-cost debt recovery path:

- **No lawyer required** — you represent yourself
- **Filing fees** are low (typically a few thousand Naira)
- **Judgment timelines** — often 2–4 weeks
- **Enforcement** — court can order bank account attachment or asset seizure

To file, you need:
- Copies of the original invoice(s)
- Your contract or service agreement
- Evidence of service delivery (emails, WhatsApp messages, signed delivery notes)
- Records of your payment reminders

Small claims court is also a powerful negotiating tool — many clients settle immediately once they receive a court summons.

---

## Prevention: Stop the Problem Before It Starts

The best unpaid invoice strategy is prevention:

1. **Collect deposits** — 30–50% upfront before starting any work
2. **Use milestone billing** — never complete 100% of a project before receiving any payment
3. **Check client credit** — for large B2B contracts, ask for trade references or check if the company has a history of late payment
4. **Set clear due dates** — not "Net 30" but a specific calendar date
5. **Make payment effortless** — include a Paystack payment link on every invoice
6. **Stop work on overdue retainers** — do not continue delivering work to a client who owes you money

---

## Track All Your Invoices in One Place

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** keeps a record of every invoice you create, so you can track what is paid and what is outstanding — without spreadsheets.

For more on payment terms, late fees, and FIRS compliance, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 10 blog posts (${posts.length} posts)...\n`);

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
