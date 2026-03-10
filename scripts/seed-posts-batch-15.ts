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
// Post 1 — "How to Invoice as a Nurse or Healthcare Professional in Nigeria"
//   Meta title : "How to Invoice as a Healthcare Professional in Nigeria" (54 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian nurses, doctors, and
//                 healthcare professionals: VAT exemptions, private practice
//                 billing, and getting paid." (152 chars)
//
// Post 2 — "Purchase Order vs Invoice Nigeria"
//   Meta title : "Purchase Order vs Invoice Nigeria: Key Differences Explained" (60 chars)
//   Meta desc  : "Learn the difference between a purchase order and an invoice in
//                 Nigeria, when each is used, and how they work together in
//                 Nigerian B2B transactions." (156 chars)
//
// Post 3 — "How to Invoice as a Teacher or Tutor in Nigeria"
//   Meta title : "How to Invoice as a Teacher or Tutor in Nigeria | InvoiceGenerator.ng" (70 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian private tutors and teachers:
//                 session rates, monthly retainers, VAT rules, and how to
//                 get paid on time." (151 chars)
//
// Post 4 — "Invoice Generator for Abuja Businesses"
//   Meta title : "Free Invoice Generator for Abuja Businesses | InvoiceGenerator.ng" (66 chars)
//   Meta desc  : "The best free invoice generator for Abuja businesses and freelancers.
//                 Create Naira invoices with VAT, Paystack payments, and
//                 WhatsApp sharing — free." (153 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — How to Invoice as a Nurse or Healthcare Professional in Nigeria
    // Target keyword: "healthcare professional invoice Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Nurse or Healthcare Professional in Nigeria',
        slug: 'how-to-invoice-as-a-healthcare-professional-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian nurses, doctors, and healthcare professionals: VAT exemptions, private practice billing, and getting paid on time.',
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `Nigerian healthcare professionals increasingly work outside of traditional hospital employment — as private practice doctors, freelance nurses providing home care, occupational health consultants, locum practitioners, and medical training facilitators. Invoicing for these private engagements requires understanding both standard Nigerian invoicing rules and the specific VAT treatment that applies to medical services.

## Types of Healthcare Professional Invoicing in Nigeria

### 1. Private Consultation / Clinical Services
Fees charged directly to patients or their corporate health insurance providers.

**Invoice example — private clinic consultation:**
| Description | Amount |
|---|---|
| General practitioner consultation (30 minutes) | ₦15,000 |
| Blood pressure and blood glucose monitoring | ₦5,000 |
| Prescription writing fee | ₦3,000 |
| **Total** | **₦23,000** |

*Note: Medical services are VAT-exempt — no VAT charged (see VAT section below).*

### 2. Corporate Occupational Health Services
Many Nigerian companies retain doctors or nurses to provide workplace health services — annual medicals, first aid training, health screening days.

**Invoice example — corporate health day:**
| Description | Amount |
|---|---|
| Employee health screening — 50 staff (BP, BMI, glucose, vision) | ₦375,000 |
| Occupational health report and recommendations | ₦75,000 |
| Medical consumables (gloves, lancets, test strips) — pass-through | ₦35,000 |
| **Total** | **₦485,000** |

*VAT treatment: Medical services component is exempt. If the occupational health report is classified as consulting (not direct medical service), FIRS may treat it as VATable — seek professional advice.*

### 3. Home Care Nursing
Freelance nurses providing home care to patients — wound dressing, post-surgical care, elderly care.

**Invoice example — home care nursing:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| Post-surgical wound care visits | 10 | ₦12,000 | ₦120,000 |
| Medication administration and monitoring | 10 | ₦5,000 | ₦50,000 |
| **Total** | | | **₦170,000** |

### 4. Medical Training and CPD Facilitation
Nurses and doctors who deliver first aid training, CPD courses, or health education workshops.

**Invoice example:**
| Description | Amount |
|---|---|
| Basic Life Support (BLS) training — 20 staff (4-hour session) | ₦180,000 |
| Training materials and certificates | ₦40,000 |
| **Subtotal** | **₦220,000** |
| **VAT (7.5%)** | **₦16,500** |
| **Total** | **₦236,500** |

*Note: Training and education services may be VATable (unlike direct medical services) — especially if delivered by a training company rather than a registered medical practitioner in a clinical capacity.*

---

## VAT on Healthcare Services in Nigeria

This is the most important compliance question for Nigerian healthcare professionals:

**Medical and healthcare services are VAT-exempt** under the First Schedule of the VAT Act. This means:

- A doctor charging for consultations: **no VAT**
- A nurse charging for home care: **no VAT**
- A hospital billing for in-patient care: **no VAT**
- A pharmacist dispensing prescribed medication: **no VAT** (pharmaceutical products are also exempt)

**However, the following ARE VATable:**
- Medical training and CPD facilitation (classified as professional training services)
- Occupational health consulting reports (grey area — seek FIRS guidance)
- Health software and medical equipment rentals
- Administrative management fees charged by healthcare management companies

**Practical rule:** If the activity is direct patient care by a registered medical practitioner, it is likely exempt. If it is training, consulting, or management, it is likely VATable.

---

## Invoice Elements for Nigerian Healthcare Professionals

1. **Your full name and professional registration number** (MDCN number for doctors, NMCN number for nurses)
2. **Practice name and address** (if applicable)
3. **TIN** — if VAT-registered (for VATable activities)
4. **Client or patient name**
5. **Invoice number** — sequential
6. **Invoice date and due date**
7. **Itemised services** — each consultation, visit, or procedure listed separately
8. **VAT treatment** — either 0% (exempt medical services) or 7.5% (VATable services)
9. **Payment details**

---

## Getting Paid as a Nigerian Healthcare Professional

### For Individual/Private Patients
- Collect payment at the point of service where possible
- For home care: collect a weekly or fortnightly advance
- Accept Paystack card payments or bank transfers — do not rely on cash only

### For Corporate Clients
- Issue a formal invoice within 5 days of service delivery
- Include your professional registration number for credibility
- Due dates of 14–21 days are standard for corporate health billings
- Deduct WHT (5%) from payments by corporate clients is applicable to your consulting fees

### For HMO Billing
Health Maintenance Organisations (HMOs) operate on their own billing schedules — typically monthly. Register as a provider, submit claim forms per their requirements, and follow up consistently on outstanding claims.

---

## Create Your Healthcare Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian healthcare professionals. Create professional invoices — with or without VAT depending on service type — with Paystack payment links and WhatsApp delivery.

For more on Nigerian invoicing requirements and VAT exemptions, see our **[Nigerian Invoicing Guide](/guide)** and our post on **[VAT exemptions in Nigeria](/blog/vat-exemption-nigeria-goods-and-services)**.`,
    },

    // =========================================================================
    // POST 2 — Purchase Order vs Invoice Nigeria
    // Target keyword: "purchase order vs invoice Nigeria"  (~950 words)
    // =========================================================================
    {
        title: 'Purchase Order vs Invoice Nigeria: Key Differences and How They Work Together',
        slug: 'purchase-order-vs-invoice-nigeria',
        excerpt: 'Learn the difference between a purchase order and an invoice in Nigeria, when each is used, and how they work together in Nigerian B2B transactions.',
        coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `In Nigerian B2B transactions, especially with large companies, government agencies, and multinationals, you will frequently hear about purchase orders (POs) and invoices. Many small business owners and freelancers are unclear about the difference — and that confusion can delay payment or create compliance issues.

This guide explains what each document is, when each is used, and how they fit together in a proper Nigerian B2B procurement cycle.

## What Is a Purchase Order (LPO)?

A **Purchase Order** — often called an **LPO (Local Purchase Order)** in Nigeria — is a formal document issued by a **buyer** to a **supplier** that authorises the purchase of specific goods or services at an agreed price and quantity.

The PO is the buyer's commitment. It says: *"We agree to buy X from you at price Y, under these terms."*

When a supplier receives and accepts a PO, a binding contract exists — even before any goods change hands or invoice is issued.

**Key characteristics:**
- Issued by the **buyer** (not the supplier)
- Issued **before** delivery of goods or services
- Authorises the purchase
- Contains a PO/LPO number that both parties reference throughout the transaction

---

## What Is an Invoice?

An **invoice** is a document issued by the **supplier** to the **buyer** requesting payment for goods or services already delivered (or, in some cases, being delivered in stages).

The invoice is the supplier's payment request. It says: *"I have delivered what was agreed. Please pay me."*

**Key characteristics:**
- Issued by the **supplier** (not the buyer)
- Issued **after** delivery (or per agreed milestone)
- Requests payment
- References the original PO/LPO number

---

## Side-by-Side Comparison

| | Purchase Order (LPO) | Invoice |
|---|---|---|
| **Issued by** | Buyer | Supplier |
| **Timing** | Before delivery | After delivery |
| **Purpose** | Authorise the purchase | Request payment |
| **Creates obligation** | Buyer commits to purchase | Buyer commits to pay |
| **Contains** | Item specs, agreed price, delivery terms | Items delivered, payment due, due date |
| **References** | Can reference a quotation | Must reference the PO number |
| **VAT** | May show expected VAT | Must show actual VAT if supplier is registered |

---

## The Full Nigerian B2B Procurement Cycle

Understanding where POs and invoices fit in the full cycle helps avoid delays:

**Step 1:** Supplier sends a **quotation** with itemised pricing.

**Step 2:** Buyer's procurement team reviews and approves the quotation internally.

**Step 3:** Buyer's finance/procurement issues an **LPO/PO** to the supplier, referencing the quotation. The PO includes a PO number.

**Step 4:** Supplier receives the PO, confirms acceptance (in writing or by commencing delivery), and delivers goods or services.

**Step 5:** Supplier issues an **invoice** referencing the PO number.

**Step 6:** Buyer's finance team matches the invoice against the PO (and often a goods received note/GRN) — this is called **three-way matching**.

**Step 7:** Buyer approves and processes payment.

**Common delay point:** Invoice is rejected because it does not reference the correct PO number, the amount does not match the PO, or the description does not align with what was ordered. Always match your invoice exactly to the PO.

---

## What If a Client Has Not Issued a PO?

Many small Nigerian businesses and informal clients do not issue POs. In this case:
- Reference the email or WhatsApp message where the purchase was agreed
- Or create your own **quotation** and ask the client to confirm acceptance in writing before delivering
- Do not begin work on a large order without some form of written agreement — a PO is the ideal form, but a signed quotation or email confirmation is better than nothing

For corporate and government clients, **never deliver without an LPO**. Nigerian corporate policy often requires a PO before payment can be processed — invoices without PO references may be refused by finance departments.

---

## Invoice Requirements When You Have an LPO

When invoicing against an LPO, ensure your invoice includes:

1. **The LPO/PO number** — prominently, near the top of the invoice
2. **The LPO date**
3. **Exact matching descriptions** — items on your invoice must match item descriptions on the PO
4. **Exact matching prices** — do not invoice above the PO value without a revised PO
5. **VAT** — if the PO included VAT, your invoice must show the same VAT breakdown
6. **Your TIN** — corporate buyers require this for WHT processing

**Invoice footer example:**
> *Re: LPO No. GTB-LPO-2026-0412 dated 1 March 2026*

---

## What Is a Goods Received Note (GRN)?

A **GRN** is a document the buyer signs to acknowledge receipt of delivered goods. Together with the PO and invoice, it forms the **three-way match** that most Nigerian corporate finance departments require before approving payment.

If your client uses GRNs:
- Ensure the client signs and returns the GRN on delivery
- Keep a copy — it is proof of delivery and may be required to resolve payment disputes

---

## Create Invoices That Match Your LPO

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** makes it easy to create professional, itemised invoices that reference your client's LPO — with VAT, TIN, and sequential numbering. Share via WhatsApp or email in seconds.

For more on the full Nigerian invoicing process, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — How to Invoice as a Teacher or Tutor in Nigeria
    // Target keyword: "tutor invoice Nigeria"  (~950 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Teacher or Tutor in Nigeria: Rates, Billing & Getting Paid',
        slug: 'how-to-invoice-as-a-teacher-tutor-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian private tutors and teachers: session rates, monthly retainers, VAT rules, and how to get paid on time.',
        coverImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `Private tutoring is one of Nigeria's fastest-growing informal service industries. From home tutors helping primary school children in Surulere to corporate trainers delivering professional development in Abuja, Nigerian teachers and tutors are in high demand. But most operate without formal invoices — and that makes it harder to get paid reliably and harder to track income at tax time.

This guide covers professional invoicing for Nigerian tutors and private teachers.

## Tutoring Pricing Models and How to Invoice Each

### 1. Hourly Rate (Most Common)
Charge per hour of teaching. Bill weekly or monthly depending on the regularity of sessions.

**Weekly invoice example:**
| Description | Sessions | Rate | Amount |
|---|---|---|---|
| Mathematics tutoring — Week of 10 March 2026 (Mon, Wed, Fri) | 3 | ₦8,500/hr | ₦25,500 |
| **Total Due** | | | **₦25,500** |

**Monthly invoice example:**
| Description | Sessions | Rate | Amount |
|---|---|---|---|
| English Language tutoring — March 2026 (12 sessions × 1.5 hrs) | 18 hrs | ₦8,500/hr | ₦153,000 |
| **Total Due** | | | **₦153,000** |

### 2. Monthly Flat Rate (Retainer)
A fixed monthly fee regardless of exact session count — ideal for predictable scheduling.

**Invoice example:**
| Description | Amount |
|---|---|
| Private tutoring retainer — March 2026 (3 subjects, 3× per week) | ₦120,000 |
| **Total Due** | **₦120,000** |

### 3. Per-Subject Pricing
Charge a fixed fee per subject per month or per term.

**Invoice example — end of term:**
| Description | Months | Rate | Amount |
|---|---|---|---|
| Mathematics (JSS3) — January to March 2026 | 3 | ₦45,000/month | ₦135,000 |
| Further Mathematics (SS1) — January to March 2026 | 3 | ₦50,000/month | ₦150,000 |
| Physics (SS1) — January to March 2026 | 3 | ₦45,000/month | ₦135,000 |
| **Total Due** | | | **₦420,000** |

### 4. Corporate / Professional Training
Training sessions delivered to company staff — priced per day or per programme.

**Invoice example:**
| Description | Amount |
|---|---|
| Excel for Finance training — 1-day workshop, 15 participants (20 Feb 2026) | ₦280,000 |
| Training materials (printed workbooks, 15 copies) | ₦22,500 |
| **Subtotal** | **₦302,500** |
| **VAT (7.5%)** | **₦22,688** |
| **Total** | **₦325,188** |

---

## VAT for Nigerian Tutors

### Private Tutoring (Individual Students)
Private tutoring by individual tutors is generally treated similarly to **educational services** — which are VAT-exempt under the VAT Act. However, the exemption is clearest for registered educational institutions.

**Practical guidance:**
- Most individual private tutors are below the ₦25 million VAT threshold — no VAT registration required
- If you are below the threshold, do not charge VAT
- If your tutoring income is substantial and you have voluntarily registered for VAT, charge 7.5%

### Corporate Training and Professional Development
This is clearly VATable at 7.5% — it is a professional training service, not exempt education. If you deliver corporate training and are (or should be) VAT-registered, charge VAT.

---

## Mandatory Invoice Elements for Tutors

1. **Your full name** or training company name
2. **Address and contact details**
3. **TIN** — if VAT-registered
4. **Student/client name** — and parent name for minors
5. **Invoice number** — sequential (e.g., TUT-2026-007)
6. **Invoice date and due date**
7. **Subjects tutored and period covered**
8. **Number of sessions and hours**
9. **Rate and total**
10. **Bank details or Paystack link**

---

## Payment Structure for Tutors

### Private Students — Pay in Advance
Collect tutoring fees **before** the month or term begins. Never tutor on credit — it is nearly impossible to recover tutoring fees from parents after the service has been delivered.

**Best practice:**
> *"Tuition fees for [Month] are due by the 25th of the preceding month. Sessions will not commence until fees are received."*

### Corporate Training — Milestone Payment
- 50% deposit before the training date
- 50% balance within 7 days after delivery

### Suspension Policy
State clearly in your agreement: *"If monthly fees are not received by the due date, sessions will be suspended until payment is made."* Apply this consistently.

---

## Tracking Sessions and Attendance

For hourly billing, keep a simple session log:

| Date | Subject | Duration | Notes |
|---|---|---|---|
| 3 March | Maths | 1.5 hrs | Quadratic equations |
| 5 March | Maths | 1.5 hrs | Exam practice |
| 7 March | Maths | 1.5 hrs | Past questions review |

Share a monthly summary with parents alongside the invoice. This transparency reduces disputes and builds trust.

---

## Getting Paid as a Nigerian Tutor

1. **Collect fees upfront** — the golden rule
2. **Use Paystack** — parents can pay by card or bank transfer instantly; much faster than bank-to-bank transfers
3. **Send invoices via WhatsApp** — most Nigerian parents communicate on WhatsApp
4. **Issue receipts** — always send a receipt when payment is received; parents may need it for school records
5. **Term vs monthly billing** — term billing (collecting 3 months at once) improves your cash flow significantly

---

## Create Your Tutoring Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian tutors and teachers. Create professional session invoices or monthly retainer bills with Paystack payment links and WhatsApp sharing in seconds.

For more on invoicing best practices, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 4 — Invoice Generator for Abuja Businesses
    // Target keyword: "invoice generator Abuja"  (~900 words)
    // =========================================================================
    {
        title: 'Free Invoice Generator for Abuja Businesses: Create Naira Invoices in Minutes',
        slug: 'invoice-generator-abuja-businesses',
        excerpt: 'The best free invoice generator for Abuja businesses and freelancers. Create Naira invoices with VAT, Paystack payments, and WhatsApp sharing — free.',
        coverImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=2000',
        published: true,
        content: `Abuja is Nigeria's capital and one of its fastest-growing business hubs. From government contractors and consulting firms in Maitama and Central Business District to freelancers, caterers, and service businesses across Wuse, Garki, Gwarinpa, and Jabi — Abuja businesses need professional, FIRS-compliant invoices every day.

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is the free, purpose-built invoicing tool for Nigerian businesses, including the thousands of sole traders, SMEs, and freelancers operating in Abuja.

## Why Abuja Businesses Need Professional Invoices

Abuja's economy is dominated by government, corporate services, real estate, hospitality, and professional services. Clients in Abuja — from federal ministries to international NGOs, diplomatic missions, and large corporates — typically require:

- **Formal, itemised invoices** — not informal payment requests
- **TIN and VAT details** — for their own procurement and tax records
- **LPO references** — most government and corporate clients will not process payment without an LPO reference on your invoice
- **Professional formatting** — a well-presented invoice signals a reliable supplier

Informal invoicing (sending bank details over WhatsApp without a proper document) is particularly risky in Abuja's corporate-dominated market — it can delay payment by weeks while clients chase finance department approvals.

---

## What InvoiceGenerator.ng Offers Abuja Businesses

### Naira-First Invoicing
Every invoice defaults to Nigerian Naira (₦). No configuration required — unlike international tools that require you to set up NGN manually.

### Automatic VAT at 7.5%
Toggle VAT on or off per invoice. When enabled, 7.5% is calculated automatically and shown as a separate line item — exactly as FIRS requires.

### Paystack Payment Links
Every invoice includes a built-in Paystack payment link. Your Abuja clients can pay instantly by:
- Bank transfer (most common in Abuja's corporate sector)
- Debit card
- USSD

### WhatsApp Invoice Sharing
Share your invoice directly on WhatsApp — the primary business communication channel in Abuja and across Nigeria.

### Sequential Invoice Numbering
Invoices are automatically numbered sequentially. This satisfies FIRS requirements and makes LPO matching straightforward for corporate clients.

### Free Forever
No subscription. No credit card. No premium tier required for essential features.

---

## Common Abuja Business Types and Their Invoicing Needs

### Government Contractors and Suppliers
Abuja hosts a huge concentration of government procurement activity. If you supply goods or services to federal ministries, agencies, or parastatals:

- Always reference the LPO/contract number on your invoice
- Include your TIN — government finance departments will not process payment without it
- Show VAT at 7.5% if you are VAT-registered (most government contracts require VAT-registered suppliers)
- Submit original and one copy of the invoice to the relevant finance department

### Consulting Firms (Management, IT, Finance, HR)
Abuja's consulting sector is substantial. Professional services invoices should:
- Itemise by deliverable or by day rate (not lump sum)
- Reference the engagement letter or contract
- Account for 5% WHT deductions by corporate clients

### Hospitality and Catering
Abuja's events industry — corporate dinners, conferences, weddings at Transcorp, Sheraton, Sandralia — requires professional catering and event invoices. Always collect deposits and bill before the event.

### Real Estate and Property Management
Monthly property management and rental invoices for Abuja's active commercial property market. Recurring invoice structure works well for property managers.

### NGOs and International Organisations
Abuja hosts dozens of international NGOs, embassies, and development organisations. These clients often:
- Have their own procurement systems requiring PO references
- May request USD invoices (for foreign-funded projects)
- Have strict documentation requirements for audit purposes

For USD billing, InvoiceGenerator.ng supports foreign currency invoice creation — with clear labelling of the invoice currency.

---

## FIRS Compliance for Abuja Businesses

The FIRS Abuja Integrated Tax Office (ITO) serves businesses in the Federal Capital Territory. Compliance requirements are the same as nationally:

- VAT registration mandatory above ₦25 million annual turnover
- Monthly VAT returns due by the 21st of the following month
- Annual income/company tax returns
- WHT credit notes must be issued by corporate clients for all applicable payments

The FIRS Abuja ITO is located at:
**FIRS Headquarters, Revenue House, 15 Sokode Crescent, Wuse Zone 5, Abuja**

You can also manage all filings via the FIRS e-Tax portal at **etax.firs.gov.ng** without visiting in person.

---

## How to Create Your First Abuja Invoice in 2 Minutes

1. Go to **[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)**
2. Enter your business name, address, and TIN
3. Add your client's details and LPO reference (if applicable)
4. List your services or goods with quantities and rates
5. Toggle VAT on if you are VAT-registered
6. Set a due date and add your payment terms
7. Click **Generate Invoice** — a professional PDF invoice is created instantly
8. Share via WhatsApp or email with one click

No account required. No subscription. Free for Nigerian businesses.

---

## Start Invoicing Professionally in Abuja

Whether you are a freelancer in Gwarinpa, a contractor supplying a federal ministry, a consultant in Central Business District, or a caterer serving Abuja events — **[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** gives you professional, FIRS-compliant invoices in minutes.

For the complete guide to Nigerian invoicing requirements, VAT, and FIRS compliance, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 15 blog posts (${posts.length} posts)...\n`);

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
