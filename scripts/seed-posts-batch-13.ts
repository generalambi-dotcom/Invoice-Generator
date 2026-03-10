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
// Post 1 — "How to Register for VAT in Nigeria"
//   Meta title : "How to Register for VAT in Nigeria: Step-by-Step FIRS Guide" (60 chars)
//   Meta desc  : "A complete step-by-step guide to VAT registration in Nigeria.
//                 Learn who must register, what documents FIRS requires,
//                 how to file returns, and avoid penalties." (157 chars)
//
// Post 2 — "Invoice Discounting Nigeria"
//   Meta title : "Invoice Discounting Nigeria: Get Paid Early on Your Invoices" (61 chars)
//   Meta desc  : "Learn how invoice discounting and invoice financing work in Nigeria.
//                 Compare banks and fintechs, understand the costs, and
//                 improve your business cash flow." (157 chars)
//
// Post 3 — "How to Invoice as a Security Company in Nigeria"
//   Meta title : "How to Invoice as a Security Company in Nigeria | InvoiceGenerator.ng" (70 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian security companies: monthly
//                 retainer billing, VAT at 7.5%, WHT deductions, contract
//                 pricing, and getting paid." (154 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Register for VAT in Nigeria
    // Target keyword: "how to register for VAT in Nigeria"  (~1,200 words)
    // =========================================================================
    {
        title: 'How to Register for VAT in Nigeria: Step-by-Step FIRS Guide (2026)',
        slug: 'how-to-register-for-vat-nigeria-firs-guide',
        excerpt: 'A complete step-by-step guide to VAT registration in Nigeria. Learn who must register, what documents FIRS requires, how to file returns, and avoid penalties.',
        coverImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `VAT registration is a legal obligation for Nigerian businesses that cross the ₦25 million annual turnover threshold. It is also a smart voluntary step for smaller businesses working with corporate clients. This guide walks you through the complete registration process, your ongoing obligations, and how to avoid costly mistakes.

## Who Must Register for VAT in Nigeria?

Under the VAT Act (as amended by the Finance Act 2020), **every person or business that makes taxable supplies in Nigeria with an annual turnover of ₦25 million or more must register for VAT** with FIRS.

"Person" in this context includes:
- Individuals (sole traders, freelancers)
- Partnerships
- Limited liability companies
- NGOs making taxable supplies
- Foreign companies making supplies in Nigeria

**Voluntary registration** is also allowed for businesses below the threshold — and is often advisable if you:
- Work primarily with VAT-registered corporate clients who need input VAT claims
- Want to reclaim input VAT on your own business purchases
- Want to appear more established and credible

---

## VAT Registration: What You Need Before You Start

Gather these documents before beginning your FIRS registration:

### For Individuals / Sole Traders
- Valid government-issued ID (NIN, national passport, or driver's licence)
- Bank Verification Number (BVN)
- Tax Identification Number (TIN) — if not yet registered, get a TIN first
- Proof of business address (utility bill, lease agreement, or bank statement)
- Evidence of business activity (a few recent invoices or contracts)

### For Registered Companies (Limited Liability)
- Certificate of Incorporation (CAC)
- Memorandum and Articles of Association
- Form CAC 1.1 (formerly Form CO2/CO7) — list of directors
- Company TIN
- Directors' IDs and BVNs
- Proof of registered office address
- Evidence of taxable turnover (management accounts, bank statements)

---

## Step-by-Step: How to Register for VAT with FIRS

### Step 1: Get a TIN (if you do not already have one)
A Tax Identification Number is a prerequisite for VAT registration. You can obtain a TIN:
- **Online:** via the FIRS TIN registration portal at tin.firs.gov.ng
- **In person:** at your nearest FIRS office
- **For individuals:** your NIN-linked TIN can be retrieved via USSD (*346#) or the FIRS portal

### Step 2: Register on the FIRS e-Tax Portal
Go to **etax.firs.gov.ng** and create an account (or log in if you already have one).

1. Select **"VAT Registration"** from the services menu
2. Complete the VAT registration form — you will need:
   - TIN
   - Business name and address
   - Nature of business / ISIC code
   - Annual turnover (estimated if new business)
   - Bank account details
3. Upload the required supporting documents (see list above)
4. Submit the application

### Step 3: FIRS Review and Verification
FIRS will review your application. For most applications:
- **Online applications:** processed within 5–10 working days
- **In-person applications:** may be processed same-day or within a few days

FIRS may contact you to verify documents or conduct a premises inspection for larger businesses.

### Step 4: Receive Your VAT Registration Certificate
Once approved, FIRS issues a **VAT Registration Certificate** showing your VAT registration number (which is your TIN). Display this certificate at your business premises.

Your VAT registration number must appear on every tax invoice you issue from the date of registration.

---

## Your Ongoing VAT Obligations After Registration

Registration is just the beginning. As a VAT-registered business, you must:

### 1. Charge VAT on All Taxable Supplies
Add 7.5% VAT to every invoice for taxable goods or services. Show it as a separate line item. Do not blend it into your price.

### 2. Collect and Hold VAT for FIRS
The VAT you collect from clients is not your money — it is FIRS's. Hold it separately from your operating funds.

### 3. File Monthly VAT Returns
VAT returns are due by the **21st of the following month**. For example, March VAT is due by 21 April.

Your monthly return declares:
- **Output VAT** — VAT you charged on your sales invoices
- **Input VAT** — VAT you paid on qualifying business purchases
- **Net VAT payable** — output VAT minus input VAT

### 4. Remit Net VAT to FIRS
Pay the net VAT due via the FIRS e-Tax portal or at a designated bank. Late remittance attracts a penalty of **10% of the tax due** plus interest at the CBN MPR rate.

### 5. Maintain VAT Records for 6 Years
Keep copies of:
- All sales invoices issued (output VAT records)
- All purchase invoices received (input VAT records)
- Monthly VAT returns filed
- VAT payment receipts

---

## Input VAT: What You Can Reclaim

As a VAT-registered business, you can reclaim VAT paid on **business purchases** — this is called **input VAT**. Examples:

- VAT on office supplies and stationery
- VAT on professional services (legal, accounting)
- VAT on business equipment and software
- VAT on marketing and advertising costs

You **cannot** reclaim input VAT on:
- Personal or non-business expenses
- Purchases used to make VAT-exempt supplies
- Entertainment expenses (in most cases)

You need a valid tax invoice from a VAT-registered supplier to support every input VAT claim.

---

## Common VAT Registration Mistakes in Nigeria

1. **Registering late** — once you cross ₦25 million turnover, registration is mandatory. Penalties apply for late registration.
2. **Charging VAT before registration is confirmed** — only charge VAT once FIRS has issued your certificate.
3. **Not separating VAT from revenue in your accounts** — VAT collected is a liability, not income. It must be tracked separately.
4. **Missing the monthly filing deadline** — 10% penalty plus interest for late filing, even if there is no VAT due.
5. **Issuing VAT invoices without your registration number** — your TIN/VAT number must appear on every tax invoice.

---

## Create FIRS-Compliant VAT Invoices

Once you are VAT-registered, every invoice you issue must be a proper **tax invoice** with your TIN, itemised services, and VAT shown at 7.5%.

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** automatically formats your invoices for FIRS compliance — with VAT calculated, your TIN field, and sequential numbering built in.

For a complete overview of Nigerian invoicing requirements, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 2 — Invoice Discounting Nigeria
    // Target keyword: "invoice discounting Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'Invoice Discounting Nigeria: How to Get Paid Early on Your Outstanding Invoices',
        slug: 'invoice-discounting-nigeria-get-paid-early',
        excerpt: 'Learn how invoice discounting and invoice financing work in Nigeria. Compare banks and fintechs, understand the costs, and improve your business cash flow.',
        coverImage: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `You have done the work, issued the invoice, and are now waiting 30, 60, or 90 days for a corporate client to pay. Meanwhile, you have staff to pay, supplies to buy, and new projects to fund. Invoice discounting is a solution that lets you unlock cash tied up in outstanding invoices — without waiting for your clients to pay.

This guide explains how invoice discounting works in Nigeria, which providers offer it, and what it costs.

## What Is Invoice Discounting?

**Invoice discounting** (also called invoice financing or receivables financing) is a type of short-term business finance where a lender advances you a percentage of the value of your unpaid invoices — typically 70–90% — immediately. When your client eventually pays the invoice, the lender takes back their advance plus a fee, and you receive the remainder.

You get cash now. The lender gets paid later from your client's payment.

---

## Invoice Discounting vs Invoice Factoring

These two terms are often confused:

| | Invoice Discounting | Invoice Factoring |
|---|---|---|
| **Who collects payment** | You collect from your client | The lender (factor) collects directly |
| **Client awareness** | Often confidential | Client usually knows |
| **Control** | You retain credit control | Lender manages debtor book |
| **Best for** | Businesses with strong credit control | Businesses that want to outsource collections |

Most Nigerian SMEs prefer **confidential invoice discounting** — your clients never know you have financed the invoice, and your business relationship is preserved.

---

## How Invoice Discounting Works in Nigeria

1. **You issue an invoice** to your corporate client — e.g., ₦5,000,000 due in 60 days
2. **You approach a lender** and present the invoice as collateral
3. **The lender advances** 80% of the invoice value: ₦4,000,000 — paid to you within 24–72 hours
4. **Your client pays** the invoice on the due date — ₦5,000,000 goes to the lender
5. **The lender deducts** their fee (e.g., 3–5% of the invoice value = ₦150,000–₦250,000)
6. **You receive the balance**: ₦5,000,000 − ₦4,000,000 − ₦250,000 = ₦750,000

Net result: you received ₦4,750,000 over the course of 60 days, paying ₦250,000 for 60 days of liquidity.

---

## Who Offers Invoice Discounting in Nigeria?

### Commercial Banks
Most major Nigerian banks offer trade finance and invoice discounting through their SME or corporate banking divisions:

- **GTBank** — invoice discounting and LPO financing
- **Access Bank** — supply chain finance and receivables discounting
- **Zenith Bank** — trade and structured finance
- **UBA** — SME financing including invoice discounting
- **First Bank** — LPO and contract financing

**Requirements typically include:**
- Minimum 1–2 years of business operations
- Audited accounts or management accounts
- The underlying contract or purchase order
- Corporate client with good credit standing

### Fintech Lenders
Several Nigerian fintechs have made invoice financing faster and more accessible:

- **Moniepoint** — business financing for SMEs
- **Carbon for Business** — quick-turnaround SME loans
- **Brass** — business banking with embedded financing
- **Prospa** — SME-focused invoice and LPO financing

Fintechs typically process applications faster (24–72 hours vs weeks for banks) but may charge higher rates.

### Government Schemes
- **NIRSAL Microfinance Bank** — government-backed SME financing
- **Development Bank of Nigeria (DBN)** — wholesale lender providing funds to PFIs for SME lending
- **Bank of Industry (BOI)** — sector-specific financing with lower rates

---

## What Invoice Discounting Costs in Nigeria

Fees vary by lender, invoice size, client creditworthiness, and tenor:

| Cost Element | Typical Range |
|---|---|
| Discount fee (% of invoice value) | 2–6% per 30 days |
| Processing/administration fee | ₦10,000–₦50,000 flat |
| Advance rate (% of invoice advanced) | 70–90% |

**Example calculation:**

Invoice value: ₦3,000,000 | Tenor: 45 days | Discount fee: 4%

- Advance (80%): ₦2,400,000 (received immediately)
- Discount fee (4% × ₦3,000,000): ₦120,000
- Balance on client payment: ₦3,000,000 − ₦2,400,000 − ₦120,000 = **₦480,000**
- Total received: ₦2,880,000 on a ₦3,000,000 invoice

Annualised cost: approximately 32–48% APR — expensive compared to a bank loan, but fast and unsecured.

---

## When Does Invoice Discounting Make Sense?

Invoice discounting is **not cheap** — the annualised rates are high. It makes sense when:

- You have a large, creditworthy corporate client with long payment terms (60–90 days)
- You need cash for a new project or to meet payroll before the invoice clears
- The cost of financing is less than the opportunity cost of waiting (e.g., you would lose a new contract without the cash)
- You have exhausted cheaper financing options

It does **not** make sense for:
- Small invoices (fees eat too much of the value)
- Invoices from clients with poor payment track records (lenders may decline)
- Businesses that can simply collect a deposit or shorten payment terms instead

---

## The Better First Step: Prevent the Problem

Before financing your invoices, try these approaches first:

1. **Negotiate shorter payment terms** — push for Net 14 or Net 30 instead of 60–90 days
2. **Collect deposits** — 30–50% upfront reduces the amount you are financing
3. **Include Paystack links** — make it easier for clients to pay on time
4. **Charge late payment interest** — incentivise timely payment

If these steps still leave you with cash flow gaps on large corporate invoices, invoice discounting from a reputable Nigerian bank or fintech is a legitimate tool.

---

## Create Invoices That Lenders Will Accept

When applying for invoice discounting, lenders need clear, professional invoices with all the required details — client TIN, your TIN, itemised services, sequential numbering, and proper VAT treatment.

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** generates professionally formatted, FIRS-compliant invoices that meet bank and fintech requirements. For more on Nigerian invoicing and cash flow management, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — How to Invoice as a Security Company in Nigeria
    // Target keyword: "security company invoice Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Security Company in Nigeria: Retainer Billing, VAT & WHT',
        slug: 'how-to-invoice-as-a-security-company-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian security companies: monthly retainer billing, VAT at 7.5%, WHT deductions, contract pricing, and getting paid on time.',
        coverImage: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `Security services are among Nigeria's most essential B2B industries. From guarding residential estates and commercial properties in Lagos to providing armed escort and cash-in-transit services, Nigerian security companies operate under long-term contracts with significant monthly billing. Getting your invoicing right is critical to cash flow and compliance.

This guide covers professional invoicing for Nigerian security service providers.

## Security Service Pricing Models and How to Invoice Each

### 1. Monthly Guarding Retainer (Most Common)
A fixed monthly fee for a defined number of guards, shifts, and locations.

**Invoice example — commercial property guarding:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| Day guards (12-hour shift, 26 days) | 2 | ₦85,000/guard/month | ₦170,000 |
| Night guards (12-hour shift, 30 days) | 2 | ₦95,000/guard/month | ₦190,000 |
| Supervisor (full month, all shifts) | 1 | ₦150,000/month | ₦150,000 |
| Patrol vehicle fuel allowance | 1 | ₦35,000/month | ₦35,000 |
| **Subtotal** | | | **₦545,000** |
| **VAT (7.5%)** | | | **₦40,875** |
| **Total** | | | **₦585,875** |

### 2. Event Security
Per-event pricing based on the number of guards, event duration, and risk profile.

**Invoice example:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| Event security guards (10-hour shift) | 8 | ₦25,000 | ₦200,000 |
| Team supervisor | 1 | ₦40,000 | ₦40,000 |
| Crowd control equipment provision | 1 | ₦30,000 | ₦30,000 |
| **Subtotal** | | | **₦270,000** |
| **VAT (7.5%)** | | | **₦20,250** |
| **Total** | | | **₦290,250** |

### 3. Armed Escort / Cash-in-Transit
Priced per trip or per kilometre, with a risk premium.

**Invoice example:**
| Description | Amount |
|---|---|
| Armed escort — bank branch to head office (March 2026, 20 trips) | ₦1,200,000 |
| **Subtotal** | **₦1,200,000** |
| **VAT (7.5%)** | **₦90,000** |
| **Total** | **₦1,290,000** |

### 4. Electronic Security (CCTV, Access Control)
Installation priced as a project; monitoring priced as a monthly retainer.

**Invoice example — installation:**
| Description | Amount |
|---|---|
| CCTV system installation — 16 cameras, DVR, cabling (20 locations) | ₦4,800,000 |
| **Subtotal** | **₦4,800,000** |
| **VAT (7.5%)** | **₦360,000** |
| **Total** | **₦5,160,000** |

**Invoice example — monthly monitoring retainer:**
| Description | Amount |
|---|---|
| Remote CCTV monitoring — March 2026 (24/7, 16 cameras) | ₦85,000 |
| **Subtotal** | **₦85,000** |
| **VAT (7.5%)** | **₦6,375** |
| **Total** | **₦91,375** |

---

## Mandatory Elements on a Nigerian Security Company Invoice

1. **Company name and address** — registered address as per CAC
2. **TIN and VAT registration number** — security companies billing large corporate clients are almost always VAT-registered
3. **Client name and TIN**
4. **Invoice number** — sequential (e.g., SEC-2026-041)
5. **Invoice date and due date** — typically invoiced monthly on the 1st, due by the 7th
6. **Service period** — e.g., "Security services: 1–31 March 2026"
7. **Itemised personnel and services** — number of guards, shift type, location
8. **VAT at 7.5%** — as a separate line
9. **Bank details or Paystack link**
10. **Contract reference** — e.g., "Re: Security Services Agreement dated 1 January 2026"

---

## VAT for Nigerian Security Companies

Security services are fully VATable at 7.5%. If your annual billing exceeds ₦25 million — which most commercial security companies will — VAT registration is mandatory.

**Important:** FIRS closely monitors security companies because of the large monthly invoice volumes. Ensure your VAT returns match your issued invoices exactly.

---

## Withholding Tax (WHT) on Security Invoices

Corporate clients deduct **5% WHT** from security company invoices. This is one of the most common WHT transactions in Nigerian B2B billing.

**Example:**
- Monthly invoice: ₦545,000 + VAT ₦40,875 = **₦585,875**
- WHT deducted: 5% × ₦545,000 = **₦27,250**
- Client pays: **₦558,625**
- WHT credit note: ₦27,250

Ensure your contract explicitly acknowledges WHT deductions. Some security companies gross up their pricing to account for WHT — e.g., quoting ₦573,684 as the base so that after 5% WHT the net received is ₦545,000. This is acceptable but must be disclosed.

---

## Billing Cycle Best Practices for Security Companies

1. **Invoice in advance** — bill at the start of each month for that month's services. Do not wait until month-end.
2. **Collect a deposit** on new contracts — one month's fee upfront before guards are deployed.
3. **Include a stop-service clause** — state that services will be suspended if invoice is not paid within 7 days of due date. Enforce it.
4. **Reference the contract** on every invoice — this prevents disputes about rates or scope.
5. **Maintain guard deployment logs** — evidence of service delivery to support every invoice.

---

## Create Your Security Company Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian security companies. Create professional monthly retainer invoices with VAT, Paystack links, and WhatsApp delivery — fast and FIRS-compliant.

For more on invoicing compliance, VAT returns, and payment terms, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 13 blog posts (${posts.length} posts)...\n`);

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
