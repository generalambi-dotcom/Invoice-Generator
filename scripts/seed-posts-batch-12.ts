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
// Post 1 — "Best Invoice App for Small Businesses in Nigeria"
//   Meta title : "Best Invoice App for Small Businesses in Nigeria (2026)" (55 chars)
//   Meta desc  : "Compare the best free and paid invoice apps for Nigerian small
//                 businesses. Covers Naira support, VAT, WhatsApp sharing,
//                 Paystack, and offline use." (153 chars)
//
// Post 2 — "How to Invoice as a Tailor or Fashion Designer in Nigeria"
//   Meta title : "How to Invoice as a Tailor in Nigeria | InvoiceGenerator.ng" (60 chars)
//   Meta desc  : "A complete invoicing guide for Nigerian tailors and fashion designers:
//                 pricing structures, deposits, fabric cost pass-throughs,
//                 VAT, and getting paid." (155 chars)
//
// Post 3 — "VAT Exemption in Nigeria"
//   Meta title : "VAT Exemption in Nigeria: Which Goods and Services Are Exempt?" (63 chars)
//   Meta desc  : "Not everything in Nigeria is subject to 7.5% VAT. Learn which goods
//                 and services are VAT-exempt under the VAT Act, and what
//                 this means for your invoices." (157 chars)
// ─────────────────────────────────────────────────────────────────────────────

const posts = [

    // =========================================================================
    // POST 1 — Best Invoice App for Small Businesses in Nigeria
    // Target keyword: "best invoice app Nigeria"  (~1,100 words)
    // =========================================================================
    {
        title: 'Best Invoice App for Small Businesses in Nigeria (2026): Free & Paid Options',
        slug: 'best-invoice-app-small-businesses-nigeria',
        excerpt: 'Compare the best free and paid invoice apps for Nigerian small businesses. Covers Naira support, VAT, WhatsApp sharing, Paystack, and offline use.',
        coverImage: null,
        published: true,
        content: `Creating invoices in Word or Excel is slow, error-prone, and unprofessional. Nigerian small businesses need invoicing tools that understand local requirements — Naira currency, 7.5% VAT, Paystack integration, and WhatsApp delivery. Here is an honest comparison of the best options available in 2026.

## What to Look for in a Nigerian Invoice App

Before comparing tools, here are the features that matter most for Nigerian businesses:

- **Naira (₦) currency support** — the tool should default to or support NGN
- **VAT calculation at 7.5%** — automatic, not manual
- **WhatsApp sharing** — most Nigerian clients communicate on WhatsApp
- **Paystack integration** — for instant online payment collection
- **Offline or low-bandwidth use** — internet connectivity is variable in Nigeria
- **Free tier** — most Nigerian SMEs cannot justify expensive monthly subscriptions
- **Mobile-friendly** — many Nigerian business owners manage invoicing on their phones

---

## 1. InvoiceGenerator.ng — Best Free Option for Nigeria

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is purpose-built for the Nigerian market. It is free, requires no account to get started, and handles all Nigeria-specific requirements out of the box.

**Standout features:**
- Naira-first interface with ₦ as the default currency
- Automatic VAT at 7.5% — toggle on or off per invoice
- Direct WhatsApp sharing — send the invoice link straight to your client's WhatsApp
- Paystack payment links — clients pay by card, bank transfer, or USSD instantly
- FIRS-compliant invoice format — sequential numbering, itemised lines, TIN field
- No installation — works in any browser on phone or desktop
- Free to use

**Best for:** Nigerian freelancers, sole traders, SMEs, and anyone who wants a fast, free, Nigeria-specific invoicing tool.

**Limitations:** Focused on invoice creation rather than full accounting features.

---

## 2. Wave Accounting — Best Free Full Accounting Suite

Wave is a free cloud accounting platform popular with small businesses globally. It has been widely adopted in Nigeria because the core features (invoicing, expenses, basic accounting) are genuinely free.

**Standout features:**
- Free invoicing with professional templates
- Expense tracking and basic bookkeeping
- Accepts multiple currencies including NGN
- Invoice reminders

**Nigeria limitations:**
- No Paystack integration — online payment collection requires Wave Payments, which is not available in Nigeria
- No WhatsApp sharing
- VAT must be configured manually
- Interface designed for US/Canada market — some localisation gaps

**Best for:** Nigerian businesses that want basic bookkeeping alongside invoicing and do not need WhatsApp or Paystack integration.

---

## 3. Zoho Invoice — Best for Growing Nigerian Businesses

Zoho Invoice is a professional invoicing tool with a generous free tier (up to 1,000 invoices/year for 1 user). It integrates with the broader Zoho business suite.

**Standout features:**
- Professional invoice templates
- Client portal — clients can view and pay invoices online
- Recurring invoices and automatic reminders
- Multi-currency including NGN
- Mobile app (iOS and Android)

**Nigeria limitations:**
- No native Paystack integration
- No WhatsApp sharing
- VAT must be set up manually
- Paid plans are priced in USD — exchange rate makes them relatively expensive

**Best for:** Nigerian businesses with multiple clients needing automated reminders and a client portal.

---

## 4. QuickBooks — Best for Established Nigerian Businesses

QuickBooks is the world's most popular small business accounting software. It offers full double-entry accounting, payroll, tax filing, and invoicing.

**Nigeria limitations:**
- Expensive — plans start at around $15/month (approximately ₦23,000/month at current rates)
- No Paystack integration
- No WhatsApp sharing
- Over-engineered for businesses that just need simple invoicing

**Best for:** Nigerian businesses with dedicated accountants or bookkeepers who need full accounting functionality.

---

## 5. Excel / Google Sheets Invoice Templates — Best for Zero Budget

Many Nigerian businesses use manually maintained Excel or Google Sheets invoice templates. This is free but comes with real costs:

- Time-consuming to create and update
- Error-prone (wrong VAT calculations, duplicate invoice numbers)
- Not professional-looking
- No payment links or WhatsApp sharing
- No automated reminders

**Best for:** Businesses with very occasional invoicing needs (1–2 invoices per month maximum).

---

## Feature Comparison Table

| Feature | InvoiceGenerator.ng | Wave | Zoho Invoice | QuickBooks |
|---|---|---|---|---|
| Free tier | Yes — fully free | Yes | Yes (1,000/yr) | No |
| Naira support | Native | Yes | Yes | Yes |
| VAT at 7.5% | Automatic | Manual | Manual | Manual |
| WhatsApp sharing | Yes | No | No | No |
| Paystack integration | Yes | No | No | No |
| Mobile-friendly | Yes | Yes | Yes (app) | Yes (app) |
| Recurring invoices | No | No | Yes | Yes |
| Full accounting | No | Yes | Partial | Yes |
| Nigeria-specific | Yes | No | No | No |

---

## Which Invoice App Should Nigerian Small Businesses Use?

**Just starting out or invoicing occasionally:** [InvoiceGenerator.ng](https://www.invoicegenerator.ng/) — free, fast, built for Nigeria.

**Need basic bookkeeping too:** Wave — free accounting + invoicing, though without Paystack/WhatsApp.

**Growing business with multiple clients:** Zoho Invoice — professional features, free tier is generous.

**Established business needing full accounting:** QuickBooks — if budget allows and you have an accountant.

For most Nigerian freelancers, sole traders, and small businesses, **InvoiceGenerator.ng** is the right starting point. It handles all Nigeria-specific requirements — VAT, WhatsApp, Paystack — for free, with no setup required.

For more on Nigerian invoicing compliance and best practices, see our **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 2 — How to Invoice as a Tailor or Fashion Designer in Nigeria
    // Target keyword: "tailor invoice Nigeria"  (~1,100 words)
    // =========================================================================
    {
        title: 'How to Invoice as a Tailor or Fashion Designer in Nigeria',
        slug: 'how-to-invoice-as-a-tailor-fashion-designer-nigeria',
        excerpt: 'A complete invoicing guide for Nigerian tailors and fashion designers: pricing structures, deposits, fabric cost pass-throughs, VAT, and getting paid on time.',
        coverImage: null,
        published: true,
        content: `Nigeria has one of Africa's most vibrant fashion industries. From high-street tailors in Aba and Lagos markets to luxury fashion designers dressing celebrities and corporate clients, Nigerian fashion professionals face the same challenge as any creative service business: how do you get paid reliably, handle fabric costs, and stay compliant with FIRS?

This guide covers professional invoicing for Nigerian tailors and fashion designers at every scale.

## Tailoring and Fashion Design Pricing Models

### Per-Garment / Per-Outfit Pricing
The most common model. You charge a fixed fee per piece, which may or may not include fabric.

**Invoice example — bespoke tailoring:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| Bespoke agbada (fabric supplied by client) | 1 | ₦85,000 | ₦85,000 |
| Bespoke senator suit (fabric supplied by client) | 2 | ₦45,000 | ₦90,000 |
| Bespoke kaftan | 1 | ₦35,000 | ₦35,000 |
| **Subtotal** | | | **₦210,000** |
| **VAT (7.5%)** | | | **₦15,750** |
| **Total** | | | **₦225,750** |

### Fabric + Labour (All-In) Pricing
You source the fabric and charge a single price covering materials and workmanship.

**Invoice example:**
| Description | Qty | Rate | Amount |
|---|---|---|---|
| Aso-oke set (fabric sourced + sewing) | 1 | ₦120,000 | ₦120,000 |
| Gele tying (event day service) | 1 | ₦15,000 | ₦15,000 |
| **Subtotal** | | | **₦135,000** |
| **VAT (7.5%)** | | | **₦10,125** |
| **Total** | | | **₦145,125** |

### Corporate / Uniform Orders
Bulk orders for companies — priced per unit with volume discounts.

**Invoice example:**
| Description | Qty | Unit Price | Total |
|---|---|---|---|
| Corporate uniform (shirt + trousers, branded fabric) | 50 | ₦18,500 | ₦925,000 |
| Embroidery — company logo per piece | 50 | ₦1,500 | ₦75,000 |
| **Subtotal** | | | **₦1,000,000** |
| **VAT (7.5%)** | | | **₦75,000** |
| **Total** | | | **₦1,075,000** |

### Fashion Design (Luxury / Ready-to-Wear)
Design fees charged separately from production costs for high-end fashion designers.

**Invoice example:**
| Description | Amount |
|---|---|
| Design consultation and concept development | ₦150,000 |
| Pattern drafting and toile | ₦80,000 |
| Final garment construction (3 pieces) | ₦350,000 |
| Fabric and notions (pass-through at cost) | ₦220,000 |
| **Subtotal** | **₦800,000** |
| **VAT (7.5%) on services** | **₦43,500** |
| **Total** | **₦843,500** |

---

## How to Handle Fabric Costs on Your Invoice

Fabric is where many Nigerian tailors lose money. Two approaches:

### Option 1: Client Supplies Fabric
The client brings their own fabric. You charge only for labour/sewing. Simple — no fabric procurement risk for you.

### Option 2: You Source the Fabric
You purchase fabric on the client's behalf and charge them the cost. Invoice this as a **pass-through line item** — ideally at cost price or with a stated markup (e.g., "Fabric sourcing: cost + 10% handling").

**Important:** Keep receipts for all fabric purchases. If you are VAT-registered, you can claim input VAT on fabric bought from VAT-registered fabric suppliers.

Never absorb surprise fabric cost increases. If the client selects a more expensive fabric after the initial quote, issue a revised quotation before purchasing.

---

## The Deposit Structure for Tailors

**Never start cutting fabric without a deposit.** Nigerian tailoring culture is moving towards professional deposit practices — adopt them early.

**Recommended structure:**
- **50–70% deposit** when the client places the order and fabric is selected
- **Balance** on collection of the completed garment

Do not hand over garments without full payment. If a client collects a garment without paying the balance, recovery is very difficult.

**State on your invoice:**
> *"A deposit of [X]% is required to commence work. Completed garments will be released only upon receipt of full payment."*

---

## Mandatory Invoice Elements for Nigerian Tailors

1. **Your name or business name** and address
2. **TIN** — if VAT-registered
3. **Client name and contact details**
4. **Invoice number** — sequential (e.g., TAI-2026-022)
5. **Invoice date and collection/due date**
6. **Itemised garments** — type, quantity, rate
7. **Fabric costs** — listed separately if you sourced them
8. **VAT at 7.5%** — if registered
9. **Deposit received** — deducted from balance invoice
10. **Bank details or Paystack link**

---

## VAT for Nigerian Tailors and Fashion Designers

Tailoring and fashion design services are **subject to VAT at 7.5%** if your annual income exceeds ₦25 million and you are VAT-registered.

Most small-scale tailors are below this threshold — no VAT registration required. But if you run a fashion label with significant turnover, or supply corporate uniforms in bulk, VAT registration is likely required.

**Note on fabric:** The retail sale of fabric by market traders is often not subject to VAT (basic food and agricultural products are exempt; fabric sits in a grey area for small traders). However, if you are a VAT-registered fashion business purchasing fabric as an input, you can reclaim input VAT from VAT-registered fabric suppliers.

---

## Getting Paid as a Nigerian Tailor

1. **Deposit before cutting** — no exceptions
2. **Set a collection deadline** — state a date by which uncollected garments attract a storage fee
3. **Use Paystack** — add a payment link so clients can pay instantly by card or transfer
4. **Send invoices on WhatsApp** — most clients communicate and pay more reliably via WhatsApp
5. **Photograph completed garments** — visual proof of delivery protects against disputes

---

## Create Your Free Tailoring Invoice

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** is free for Nigerian tailors and fashion designers. Create itemised invoices with VAT, Paystack links, and instant WhatsApp sharing in minutes.

For more on invoicing compliance and FIRS requirements, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },

    // =========================================================================
    // POST 3 — VAT Exemption in Nigeria
    // Target keyword: "VAT exemption Nigeria"  (~1,000 words)
    // =========================================================================
    {
        title: 'VAT Exemption in Nigeria: Which Goods and Services Are Exempt from VAT?',
        slug: 'vat-exemption-nigeria-goods-and-services',
        excerpt: 'Not everything in Nigeria is subject to 7.5% VAT. Learn which goods and services are VAT-exempt under the VAT Act, and what this means for your invoices.',
        coverImage: null,
        published: true,
        content: `Nigeria's Value Added Tax (VAT) rate is 7.5%, introduced in the Finance Act 2019 (up from 5%). But not everything is subject to VAT. The VAT Act specifically exempts certain goods and services — and misunderstanding these exemptions can lead to either overcharging clients or underreporting to FIRS.

This guide covers what is VAT-exempt in Nigeria, the difference between exempt and zero-rated, and what this means for your invoices.

## Exempt vs Zero-Rated: An Important Distinction

Before listing exemptions, it is critical to understand the difference between **exempt** and **zero-rated** supplies — two terms often confused:

| | Exempt | Zero-Rated |
|---|---|---|
| **VAT charged** | 0% | 0% |
| **Can claim input VAT?** | No | Yes |
| **Must register for VAT?** | Not if all supplies are exempt | Yes |
| **Examples** | Medical services, education | Exports |

**Exempt:** No VAT charged on the supply. But because the supply is exempt, the supplier cannot reclaim input VAT on their own costs related to that supply.

**Zero-rated:** No VAT charged on the supply, but the supplier can still reclaim input VAT on their costs. This is more favourable for the supplier.

---

## Goods Exempt from VAT in Nigeria

The First Schedule of the VAT Act lists the following goods as VAT-exempt:

### Food and Agricultural Products
- All **unprocessed agricultural products** — raw crops, fruits, vegetables, grains in their natural state
- **Basic food items** — the Act exempts items like agric products, livestock, and fish
- Note: **Processed and packaged food** is generally VATable — e.g., bottled water, packaged snacks, restaurant meals

### Medical and Pharmaceutical Products
- **Pharmaceutical products** — medicines and drugs listed on the essential drugs list
- **Medical and veterinary services** — hospital services, medical consultations, veterinary care
- **Medical equipment and devices** — certain medical devices as approved by FIRS

### Educational Materials
- **Educational materials** — books, newspapers, magazines (though interpretation has varied)
- Exemption applies more clearly to **tuition fees** for educational institutions

### Baby Products
- **Baby products** — certain basic baby items (this has been subject to varying interpretation — seek FIRS guidance for specific products)

### Financial Services
- Most core **banking and financial services** — interest on loans, insurance premiums (though insurance has had varying treatment under recent Finance Acts)

### Exports
- **Exported goods** — zero-rated (not exempt — the distinction above applies; exporters can reclaim input VAT)
- **Services exported from Nigeria** — also zero-rated under the VAT Act

---

## Services Exempt from VAT in Nigeria

### Medical Services
Hospital care, doctor consultations, nursing care, and other professional medical services are VAT-exempt.

### Educational Services
School fees and tuition from **educational institutions** (primary, secondary, tertiary) are VAT-exempt. Private tutoring and training by non-educational-institution businesses may not qualify.

### Government Services
Services provided by **government bodies** in their governmental capacity — this is a complex area; some government-owned commercial entities are VAT-registered.

---

## What Is NOT Exempt from VAT in Nigeria

The following are fully VATable at 7.5%:

- **Professional services** — consulting, legal, accounting, engineering, IT, marketing
- **Catering and restaurant meals** — processed food and beverages served at events or restaurants
- **Construction and real estate services** — building contracts, property management
- **Telecommunications** — airtime, data, internet services
- **Rent on commercial property** — commercial leases are VATable (residential leases may be exempt)
- **Software and digital services** — including imported digital services (Netflix, Zoom, etc. now subject to VAT under recent Finance Acts)
- **Transportation** — road, air, and sea transport services (some exemptions exist for specific modes)
- **Retail goods** — most manufactured goods and imports

---

## VAT on Imported Digital Services

The Finance Act 2023 extended VAT to **non-resident suppliers** of digital services to Nigerian consumers. This means international tech companies providing software, streaming, cloud services, and other digital products to Nigerian users are now required to register for VAT in Nigeria and charge 7.5%.

Practical impact: if your Nigerian business subscribes to foreign SaaS tools (e.g., Figma, Slack, AWS), those suppliers should be charging Nigerian VAT. Whether they do in practice varies.

---

## How Exemptions Affect Your Invoice

### If you supply only exempt goods/services:
- You do not register for VAT (unless you also make taxable supplies)
- You do not charge VAT on your invoices
- You cannot reclaim input VAT on your business costs

### If you supply a mix of exempt and taxable goods/services:
- You must register for VAT (if above the ₦25 million threshold)
- You only charge VAT on the taxable portion
- You can only reclaim input VAT proportionally (apportioned between taxable and exempt supplies)
- This "partial exemption" calculation can be complex — consult a tax adviser

### If you supply zero-rated goods/services (exports):
- You register for VAT
- You charge 0% VAT on exports
- You can reclaim all input VAT on costs related to those exports
- Declare zero-rated supplies on your monthly VAT return

---

## Practical Examples for Nigerian Businesses

**Nigerian hospital charging a patient for treatment:** No VAT — medical services are exempt.

**Pharmacy selling prescription drugs:** No VAT on the drugs (pharmaceutical products are exempt).

**Pharmacy selling cosmetics:** VAT applies — cosmetics are not pharmaceutical products.

**Private school charging tuition:** No VAT — educational institution fees are exempt.

**Private training company charging for a business course:** VAT applies — this is a professional training service, not a tuition fee from a registered educational institution.

**Nigerian exporter selling cassava flour overseas:** Zero-rated — exporter charges 0% VAT and can reclaim input VAT on production costs.

**Restaurant serving jollof rice:** VAT applies — processed food served at a restaurant is VATable.

---

## Get Your Invoices Right

Understanding VAT exemptions ensures you charge the correct amount — and avoid the compliance risk of under or overcharging VAT.

**[InvoiceGenerator.ng](https://www.invoicegenerator.ng/)** makes it easy to create FIRS-compliant invoices with or without VAT, depending on your business type. For more on VAT, FIRS registration, and Nigerian invoicing requirements, see our full **[Nigerian Invoicing Guide](/guide)**.`,
    },
];

async function main() {
    console.log(`Seeding batch 12 blog posts (${posts.length} posts)...\n`);

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
