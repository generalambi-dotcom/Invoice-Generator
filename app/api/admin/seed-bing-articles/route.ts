import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Bing Keyword Gap Article Seeder — 6 SEO articles (published: false)
 * Call: POST /api/admin/seed-bing-articles?secret=invoiceng-seed-2026
 * Articles target gaps identified from Bing Webmaster Tools keyword data.
 */

const SECRET = process.env.SEED_SECRET || 'invoiceng-seed-2026';

const BING_ARTICLES = [
  // ─────────────────────────────────────────────────────────────────────────
  // Article 1: VAT Exempt Goods and Services Nigeria 2026
  // Target: "what makes a vat exempt", "vat exempt items nigeria", "vat exemptions"
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'VAT Exempt Goods and Services in Nigeria 2026: The Complete List',
    slug: 'vat-exempt-goods-services-nigeria-2026-complete-list',
    excerpt: 'Not everything attracts 7.5% VAT in Nigeria. This is the definitive 2026 list of VAT-exempt goods and services under the Nigeria Tax Act 2025 — including food, healthcare, education, and exports — with clear guidance on what this means for your invoices.',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# VAT Exempt Goods and Services in Nigeria 2026: The Complete List

One of the most common invoicing mistakes Nigerian businesses make is charging VAT on goods and services that are legally exempt — or failing to charge it when they should.

Under the **Nigeria Tax Act 2025 (NTA 2025)**, which consolidated the VAT Act, Finance Acts, and related legislation, certain goods and services are either **exempt** from VAT entirely or **zero-rated** (VAT applies at 0%). Understanding the difference matters for your invoices.

---

## VAT Exempt vs Zero-Rated: What Is the Difference?

Before the list, it helps to understand two distinct categories:

**VAT Exempt goods and services:**
- No VAT is charged at all
- The supplier cannot claim back input VAT on purchases related to these supplies
- Example: basic food items

**Zero-Rated goods and services:**
- VAT is charged at 0%
- The supplier CAN still claim back input VAT on related purchases
- Example: exported goods and services

In practice, for invoice purposes, neither results in VAT being added to your invoice. The distinction mainly affects your VAT return calculations.

---

## Complete List of VAT Exempt Goods in Nigeria (2026)

### 1. Basic Food Items and Agricultural Produce

The following are VAT-exempt under the NTA 2025:

- **Unprocessed agricultural products**: raw grains, tubers, vegetables, fruits, nuts in their natural state
- **Meat and fish**: unprocessed meat and fish (not packaged, frozen, or processed)
- **Staple foods**: rice, maize, millet, sorghum, beans, cassava, yam, plantain
- **Bread and locally-produced flour**: subject to meeting NAFDAC standards
- **Cooking oils**: groundnut oil, palm oil, palm kernel oil
- **Salt**: table salt and unrefined salt
- **Milk and dairy products**: fresh milk, though processed dairy products may attract VAT
- **Eggs**: unprocessed eggs

**Practical note:** "Unprocessed" is key. If you are a restaurant, food processor, or packaged food brand, your products are likely VATable even if the raw ingredients are not. The exemption applies to primary agricultural supply — not to cooked food, restaurant meals, or packaged snacks.

**Are drinks exempted from VAT in Nigeria?**
Non-alcoholic drinks and bottled water are generally NOT exempt — they attract the standard 7.5% VAT. Water from a tap or natural source is exempt; commercially packaged or bottled water is not.

---

### 2. Medical and Healthcare Services

The following healthcare items and services are VAT-exempt:

- **Medical and pharmaceutical products**: drugs registered by NAFDAC
- **Basic veterinary drugs and medicines**
- **Medical and surgical equipment**
- **Baby products**: diapers, baby food, baby feeding bottles, and related infant products
- **Healthcare services**: hospital consultations, surgical procedures, nursing care, laboratory services

**Are medical and therapeutic services exempt from VAT in Nigeria in 2026?**
Yes. Under the NTA 2025, medical services provided by licensed healthcare professionals and institutions remain VAT-exempt. This includes consultations, surgeries, physiotherapy, and therapeutic services delivered by registered practitioners.

**For healthcare businesses:** Your invoices for medical services should show no VAT. If you supply both exempt medical services and taxable items (e.g., a pharmacy that also sells cosmetics), you need to separate the two on your invoices.

---

### 3. Educational Materials and Services

- **Educational books and materials**: textbooks, academic journals, exercise books
- **Baby products**: also covered here as educational toys for infants
- **Educational services**: tuition fees for nursery, primary, secondary, and tertiary institutions are generally exempt
- **Educational institutions**: universities, polytechnics, and vocational schools providing formal education

**Note:** Private tutoring businesses, online course platforms, and professional training providers may not qualify for this exemption — the exemption is primarily aimed at formal educational institutions and their core supplies.

---

### 4. Exported Goods and Services (Zero-Rated)

Goods and services exported from Nigeria are **zero-rated**, meaning:
- 0% VAT is charged on the invoice to the foreign customer
- The Nigerian exporter can still claim back input VAT on production and operating costs

This applies to:
- Physical goods exported from Nigeria
- Services rendered to non-Nigerian clients and consumed outside Nigeria
- Professional services (consulting, software, design) billed to foreign companies

**For freelancers billing international clients:** If your client is based outside Nigeria and the service is consumed abroad, your invoice should show 0% VAT. Document the foreign nature of the supply carefully for your VAT records.

---

### 5. Financial Services

Certain financial services are VAT-exempt:
- **Interest on loans**: interest charged by banks and financial institutions
- **Insurance premiums**: life insurance premiums
- **Pension fund management**: contributions and fund management fees
- **Foreign exchange transactions**

However, fees charged by banks for services (account maintenance, wire transfer fees, card fees) are NOT exempt and attract 7.5% VAT.

---

### 6. Residential Accommodation

- **Rent on residential property**: rent paid for homes and apartments is VAT-exempt
- **Land sales**: sale of undeveloped land is generally exempt

Commercial property rents ARE VATable.

---

### 7. Locally Manufactured Products (Incentive Exemptions)

Certain locally manufactured goods may benefit from VAT exemptions as government incentives to support local industry. These vary by sector and are published in official government gazettes. Check the NRS website for the current approved list.

---

## VAT-Exempt Services Summary Table

| Category | Exempt? | Notes |
|---|---|---|
| Raw/unprocessed food | ✅ Yes | Must be unprocessed |
| Restaurant meals | ❌ No | Processed food is VATable |
| Medical services | ✅ Yes | Licensed practitioners only |
| Pharmaceutical drugs (NAFDAC) | ✅ Yes | Registered drugs |
| Bottled water | ❌ No | Commercially packaged |
| Tap water | ✅ Yes | Utility supply |
| Educational tuition | ✅ Yes | Formal institutions |
| Online courses / training | ❌ Usually No | Professional training is VATable |
| Exported services | ✅ Zero-rated | 0% VAT, can claim input VAT |
| Life insurance | ✅ Yes | Insurance premiums |
| Bank service fees | ❌ No | Account fees, transfer fees |
| Residential rent | ✅ Yes | Homes and apartments |
| Commercial rent | ❌ No | Office and retail space |
| Baby products | ✅ Yes | Diapers, baby food, etc. |
| Cosmetics | ❌ No | Standard 7.5% VAT |

---

## What This Means for Your Invoices

**If you supply only VAT-exempt goods or services:**
- Do not register for VAT (unless your turnover exceeds ₦25 million — you should still register but charge no VAT)
- Issue invoices without a VAT line
- You cannot claim back input VAT on your costs

**If you supply a mix of VATable and exempt items:**
- Show exempt items clearly labelled as "VAT Exempt" on the invoice
- Calculate VAT only on the taxable portion
- Keep separate records of taxable and exempt supplies for your VAT return

**If your customer asks whether VAT applies:**
If you are not sure whether your service is exempt, err on the side of charging VAT and remitting it. Charging VAT when exempt is less damaging than not charging it and being found liable later — though ideally you should get this right.

---

## How to Show VAT Exemptions on a Nigerian Invoice

A correctly formatted invoice for mixed supplies looks like this:

- **Web Design Services** — ₦500,000 (VAT: 7.5% = ₦37,500)
- **Educational Workbooks Supplied** — ₦50,000 (VAT Exempt)
- **Subtotal:** ₦550,000
- **VAT (on taxable items only):** ₦37,500
- **Total Due:** ₦587,500

[InvoiceGenerator.ng](https://invoicegenerator.ng) handles this automatically — add a line item, mark it as exempt, and the system calculates VAT only on the applicable lines.

---

## Recent Changes Under Nigeria Tax Act 2025

The NTA 2025 (which came into effect January 2025) made some adjustments to VAT exemptions:

1. **Clarified the definition of "exported services"** — services must be consumed outside Nigeria to qualify for zero-rating. Simply billing a foreign company for work performed in Nigeria does not automatically make it zero-rated.

2. **Maintained the ₦25 million registration threshold** — businesses below this turnover are not required to register but may do so voluntarily.

3. **Phased e-invoicing** — VAT invoices increasingly need to be e-invoice compliant for larger businesses, with QR codes and NRS authentication. Smaller businesses are exempt from this requirement for now.

---

## Frequently Asked Questions

**Do small businesses charge VAT on exempt goods?**
No business — large or small — should charge VAT on genuinely exempt goods or services. If your entire business deals in exempt supplies, you are not required to register for VAT at all (though you may register voluntarily if it benefits you through input VAT claims on the non-exempt portion of your business).

**Is rice VAT-exempt in Nigeria?**
Yes. Raw/unprocessed rice is a staple food and is VAT-exempt. Packaged, branded, or pre-cooked rice products may attract VAT depending on their processing level.

**Do security companies charge VAT in Nigeria?**
Yes. Security services are not on the exempt list and attract 7.5% VAT. A security company invoicing a client must include VAT if it is VAT-registered.

---

*Sources: Nigeria Tax Act 2025; VAT Act Cap V1 LFN 2004 as amended; NRS VAT guidance (nrs.gov.ng); Finance Acts 2019–2023.*

[**Create a VAT-correct invoice for your Nigerian business — free →**](https://invoicegenerator.ng)`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 2: Nigerian Consultant Invoice Guide
  // Target: "should consultant add vat to invoice", "wht fee for consultant",
  //         "client paid without deducting wht from consultancy"
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Nigerian Consultant\'s Invoice Guide 2026: VAT, Withholding Tax, and Getting Paid',
    slug: 'nigerian-consultant-invoice-guide-vat-withholding-tax-2026',
    excerpt: 'Should you add VAT to your consulting invoice? What happens if a client pays you without deducting WHT? This is the complete invoicing guide for Nigerian consultants — covering VAT thresholds, WHT rates, the ₦2M exemption, and what to do when clients get it wrong.',
    coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Nigerian Consultant's Invoice Guide 2026: VAT, Withholding Tax, and Getting Paid

Two questions come up constantly for Nigerian consultants when raising invoices:

1. **Should I add VAT to this invoice?**
2. **The client paid me the full amount without deducting WHT — what do I do?**

This guide answers both, along with everything else you need to create correct, professional consulting invoices in Nigeria in 2026.

---

## Part 1: Should You Add VAT to Your Consulting Invoice?

### The Short Answer

Add VAT **only if you are VAT-registered**. If you are not registered, do not charge VAT — doing so without registration is a criminal offence under the NTA 2025 with penalties up to 100% of the VAT amount shown.

### When Must You Register for VAT as a Consultant?

You **must** register for VAT when your annual consulting revenue exceeds **₦25 million**. You may register voluntarily below this threshold.

Registration is done through the NRS (Nigeria Revenue Service, formerly FIRS) TaxPro Max portal at [taxpromax.gov.ng](https://taxpromax.gov.ng).

### VAT Rate for Consulting Services

The VAT rate on consulting services is **7.5%**. Consulting services are not on the VAT exempt list — whether you are a management consultant, IT consultant, legal consultant, marketing consultant, or any other type, your services attract standard VAT when billed by a VAT-registered supplier.

### How to Show VAT on a Consulting Invoice

A VAT-registered consultant's invoice looks like this:

**Consulting Invoice — VAT Registered**

| Service | Amount |
|---|---|
| Strategic Planning Consultancy (3 days) | ₦750,000 |
| Market Research Report | ₦300,000 |
| **Subtotal** | ₦1,050,000 |
| **VAT (7.5%)** | ₦78,750 |
| **Total Due** | ₦1,128,750 |

Your VAT registration number must appear on the invoice.

### What If You Are Not VAT-Registered?

Simply omit the VAT line. Your invoice shows only the fee and total — no mention of VAT at all. Do not write "VAT: N/A" or "VAT: 0%" — that implies you are VAT-registered. Just leave it out.

---

## Part 2: Withholding Tax (WHT) on Consulting Invoices

### What Is Withholding Tax?

Withholding Tax (WHT) is a tax deducted **by the paying company** before settling your invoice. The company deducts WHT from what it pays you, then remits it directly to the NRS on your behalf. You receive less cash, but you get a WHT credit that reduces your annual income tax liability.

WHT is not your tax to collect — it is your client's obligation to deduct and remit.

### WHT Rates for Nigerian Consultants (2026)

Under the Nigeria Tax Act 2025:

| Recipient Type | WHT Rate |
|---|---|
| Individual consultant / sole trader | 5% |
| Company (limited liability) | 10% |

### The ₦2 Million WHT Exemption (NTA 2025)

This is the big change from 2025. Under the new rules, **WHT does not apply to consulting invoices below ₦2 million** — provided the consultant supplies a valid **Tax Identification Number (TIN)**.

This means:
- Invoice amount: ₦1,800,000 + a valid TIN → **no WHT deducted**
- Invoice amount: ₦2,100,000 → **WHT applies** (5% individual = ₦105,000 deducted)
- Invoice amount: ₦1,800,000 but **no TIN supplied** → **WHT applies**

Always include your TIN on your invoices. It is a simple line that can save your clients paperwork and you a cash flow delay.

### How WHT Affects Your Invoice Amount

If WHT applies, here is what a correctly paid consulting invoice looks like:

**Your invoice:** ₦1,500,000 (VAT-exclusive, assume not VAT-registered)

**Client pays you:** ₦1,500,000 − (5% WHT × ₦1,500,000) = ₦1,500,000 − ₦75,000 = **₦1,425,000**

**Client remits to NRS:** ₦75,000 (on your behalf, credited to your TIN)

You receive less cash now, but ₦75,000 is credited against your income tax bill at year-end. Keep records of all WHT deductions — request a WHT credit note or receipt from each client.

---

## Part 3: What Happens When the Client Pays the Full Amount Without Deducting WHT?

This is one of the most common consulting invoice problems in Nigeria. The client pays ₦1,500,000 in full without deducting the ₦75,000 WHT.

**What should have happened:** The client deducts WHT and remits it to NRS.

**What actually happened:** You received ₦75,000 more than you should have, and the client has a tax compliance problem.

### Your Options:

**Option 1 — Refund the WHT amount to the client**
Return ₦75,000 to the client so they can deduct it from their books and remit it properly to NRS. This is the cleanest approach and keeps both parties compliant.

**Option 2 — Include WHT in your next invoice**
Agree with the client to deduct the unremitted WHT amount from the next invoice. For example, next invoice is ₦1,500,000 — client pays ₦1,350,000 (₦1,425,000 minus the ₦75,000 owed from last time).

**Option 3 — The client remits it anyway (gross basis)**
Some large companies will still remit WHT to NRS even if they paid you in full, treating it as an additional cost. This is their compliance problem to manage, though it means NRS shows ₦75,000 credited to your TIN for which you received the same amount in cash — a net benefit to you.

**What you should NOT do:** Simply ignore it and hope no one notices. If NRS audits your client and finds unpaid WHT, the liability traces back to the consulting payments. It is better to resolve it promptly.

### Practical Advice

Add a note to your invoice to remind clients:

*"Note: Withholding Tax (WHT) at the applicable rate (5% for individuals / 10% for companies) should be deducted before payment and remitted to NRS. Please provide a WHT credit note after remittance."*

---

## Part 4: Building a Complete Consulting Invoice

Here is everything your consulting invoice should include in 2026:

**Your details (top of invoice):**
- Full name or business name
- Address and contact details
- Tax Identification Number (TIN)
- VAT registration number (if registered)
- Logo (optional but professional)

**Client details:**
- Company name and address
- Contact person
- Client's TIN (request this — needed for WHT processing)

**Invoice details:**
- Unique sequential invoice number (e.g., CONS-2026-047)
- Invoice date
- Due date (typically 14–30 days)
- Purchase Order or LPO number (if the client issued one)

**Service breakdown:**
- Description of each deliverable (be specific — not just "consulting" but "Brand Strategy Workshop — 2 days, 15–16 May 2026")
- Daily/hourly rate or fixed fee
- Quantity and unit
- Line total

**Totals section:**
- Subtotal
- VAT at 7.5% (if VAT-registered)
- Total Due
- WHT note (reminding client to deduct before payment)

**Payment details:**
- Bank name, account name, account number, sort code
- Or Paystack payment link for online payment

---

## Part 5: Standard Consulting Rates in Nigeria (2026 Reference)

Rates vary widely by sector and experience, but these are general market ranges for Nigerian independent consultants:

| Consulting Type | Daily Rate Range |
|---|---|
| Management / Strategy | ₦150,000 – ₦500,000+ |
| IT / Software Development | ₦120,000 – ₦400,000 |
| HR / Training | ₦100,000 – ₦300,000 |
| Financial / Accounting | ₦120,000 – ₦350,000 |
| Legal / Compliance | ₦150,000 – ₦600,000+ |
| Marketing / Branding | ₦80,000 – ₦250,000 |
| Engineering / Technical | ₦100,000 – ₦400,000 |

For **training manual development** specifically, the typical rate is ₦80,000 – ₦200,000 per day, depending on the complexity of the subject matter and the seniority of the consultant.

These are guidelines. Actual rates depend on the client's budget, your experience, the project scope, and your track record. Rates for international clients (World Bank, USAID, EU-funded projects) are typically higher and may be quoted in USD.

---

## Quick Reference: Consulting Invoice Rules at a Glance

| Scenario | VAT? | WHT? |
|---|---|---|
| You are not VAT-registered, invoice below ₦2M, have TIN | No VAT | No WHT |
| You are not VAT-registered, invoice above ₦2M, individual client paying | No VAT | 5% WHT |
| You are VAT-registered, invoice to a company above ₦2M | Add 7.5% VAT | 10% WHT on subtotal (not on VAT) |
| You invoice a foreign client outside Nigeria | 0% VAT (zero-rated) | No WHT (they are not in Nigeria's tax system) |

**Important:** WHT is calculated on the **pre-VAT amount** (the consultant's fee), not on the total including VAT.

---

*Sources: Nigeria Tax Act 2025 (NTAA 2025); NRS WHT rate schedule; ICAN Nigeria Practice Guide; PwC Nigeria Tax Summary 2026.*

[**Create your consulting invoice now — free →**](https://invoicegenerator.ng)`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 3: Industry-Specific Invoice Templates Nigeria
  // Target: "event planning invoice nigeria", "haulage invoice template nigeria",
  //         "car sales invoice nigeria", "electrical invoice lagos"
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Invoice Templates for Every Nigerian Business: Event Planning, Haulage, Car Sales, and More',
    slug: 'nigerian-business-invoice-templates-event-haulage-car-sales-2026',
    excerpt: 'Industry-specific invoice templates for Nigerian businesses — with correct line items, VAT treatment, and Naira amounts for event planners, haulage companies, car dealers, electrical contractors, fashion businesses, and security firms.',
    coverImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Invoice Templates for Every Nigerian Business: Event Planning, Haulage, Car Sales, and More

Different businesses invoice differently. An event planner's invoice looks nothing like a haulage company's, and a car dealer needs different line items from an electrical contractor. This guide provides ready-to-use invoice templates for the most common Nigerian business types — with realistic Naira amounts, correct VAT treatment, and the specific line items each industry uses.

For each template, you can recreate it instantly at [InvoiceGenerator.ng](https://invoicegenerator.ng) — free, no sign-up, downloads as PDF in seconds.

---

## 1. Event Planning Invoice Template (Nigeria)

Event planners in Nigeria typically invoice across multiple service categories. Clients expect a detailed breakdown — especially for corporate events where procurement teams approve costs line by line.

**What to include:**

| Line Item | Description | Unit | Rate | Amount |
|---|---|---|---|---|
| Event Coordination | Lead planner fee for 2-day corporate conference | 1 event | ₦800,000 | ₦800,000 |
| Venue Sourcing & Negotiation | Venue selection, site visits, contract review | 1 | ₦150,000 | ₦150,000 |
| Décor & Styling | Theme design, floral, draping, centrepieces | 1 | ₦600,000 | ₦600,000 |
| Audio Visual Equipment | Projectors, microphones, stage lighting, screens | 1 event | ₦400,000 | ₦400,000 |
| Catering Coordination | 250 guests, 3 meals + refreshments management fee | 1 | ₦250,000 | ₦250,000 |
| Photography & Videography | Full-day coverage, edited highlights reel | 1 event | ₦350,000 | ₦350,000 |
| MC / Entertainment | Professional MC, 4-hour entertainment | 1 | ₦200,000 | ₦200,000 |
| **Subtotal** | | | | **₦2,750,000** |
| **VAT (7.5%)** | | | | **₦206,250** |
| **Total Due** | | | | **₦2,956,250** |

**Event planner invoice tips:**
- Clearly state the event date and venue in the invoice description
- Specify whether catering is included in your fee or billed separately by the caterer
- Include a deposit structure: 50% on confirmation, 40% two weeks before the event, 10% on completion
- Add a cancellation clause: refund policy if the event is cancelled within X days

---

## 2. Haulage and Logistics Invoice Template (Nigeria)

Haulage companies invoice differently depending on whether they charge per trip, per tonne, or per day. Most Nigerian haulage invoices combine a base trip rate with variable surcharges.

**What to include:**

| Line Item | Description | Unit | Rate | Amount |
|---|---|---|---|---|
| Haulage Service | Lagos–Kano cargo transport, 30-tonne truck | 1 trip | ₦650,000 | ₦650,000 |
| Fuel Surcharge | Long-distance supplement (NNPC pump price applicable) | 1 | ₦85,000 | ₦85,000 |
| Loading & Offloading | Labour at origin and destination | 2 | ₦25,000 | ₦50,000 |
| Goods-in-Transit Insurance | 1% of declared cargo value ₦5,000,000 | 1% | ₦50,000 | ₦50,000 |
| Toll Charges | Estimated expressway tolls, Lagos–Kano route | 1 trip | ₦22,000 | ₦22,000 |
| **Subtotal** | | | | **₦857,000** |
| **VAT (7.5%)** | | | | **₦64,275** |
| **Total Due** | | | | **₦921,275** |

**Haulage invoice tips:**
- Specify the truck type and registration number (clients need this for their records)
- Note the cargo weight and description (goods type, number of bags/units)
- Fuel surcharges should reference the current NNPC pump price to justify the amount
- For cross-border haulage (ECOWAS countries), clearly state the origin and destination country and note any customs charges billed separately

---

## 3. Car Sales Invoice Template (Nigeria)

Car dealers in Nigeria — whether selling new, Tokunbo (used imported), or locally manufactured vehicles — need invoices that capture vehicle-specific details. This is important for buyers who need the invoice for vehicle registration at the state licensing office.

**What to include:**

| Line Item | Description | Amount |
|---|---|---|
| Vehicle | 2022 Toyota Camry XSE 2.5L, Colour: Silver, VIN: 4T1BZ1HK0NU071234 | ₦19,500,000 |
| Pre-delivery Inspection | Mechanical and electrical inspection, fluid top-up | ₦50,000 |
| Vehicle Registration Assistance | FRSC plate number processing, Lagos State | ₦85,000 |
| Comprehensive Insurance (1 Year) | Activa Insurance, arranged by dealer | ₦180,000 |
| Documentation Fee | Change of ownership, customs documentation | ₦45,000 |
| **Subtotal** | | **₦19,860,000** |
| **VAT (7.5%)** | | **₦1,489,500** |
| **Total Due** | | **₦21,349,500** |
| Less: Deposit Paid | Bank transfer receipt no. BT20260510 | −₦5,000,000 |
| **Balance Due** | | **₦16,349,500** |

**Car sales invoice tips:**
- Always include the Vehicle Identification Number (VIN) — buyers need it for registration
- State the vehicle's year, make, model, engine size, colour, and mileage (for Tokunbo vehicles)
- Separate the vehicle cost from registration, insurance, and documentation fees — some buyers finance the vehicle but pay extras separately
- For Tokunbo vehicles, note "imported used vehicle" and include the date of importation if available

---

## 4. Electrical Contractor / Electronics Shop Invoice (Lagos and Nigeria)

Electrical contractors and electronics retailers need to distinguish between supply (goods) and installation (labour), as the VAT treatment and WHT implications may differ.

**What to include — Electrical Contractor:**

| Line Item | Qty | Unit Price | Amount |
|---|---|---|---|
| Automatic Transfer Switch (ATS) 200A | 1 | ₦380,000 | ₦380,000 |
| Armoured Cable 16mm (per metre) | 50m | ₦4,500 | ₦225,000 |
| Distribution Board (3-phase, 12-way) | 2 | ₦85,000 | ₦170,000 |
| Earthing Kit & Installation | 1 | ₦65,000 | ₦65,000 |
| Electrical Installation Labour (5 days) | 5 | ₦35,000 | ₦175,000 |
| Testing & Commissioning | 1 | ₦50,000 | ₦50,000 |
| **Subtotal** | | | **₦1,065,000** |
| **VAT (7.5%)** | | | **₦79,875** |
| **Total Due** | | | **₦1,144,875** |

**Electrical contractor tips:**
- Separate materials (supply) from labour — some contracts specify the client supplies materials and pays only for labour
- For generator installation jobs, include the generator make, model, KVA rating, and serial number
- Add a warranty clause: "Workmanship warranty: 12 months from installation date. Equipment warranty: per manufacturer terms."
- For large industrial jobs, reference the electrical drawing number or project specification document

---

## 5. Fashion / Clothing Boutique Invoice (Nigeria)

Fashion businesses — from designers to boutiques to tailors — often do a mix of bespoke orders and retail sales. Bespoke design work should be invoiced differently from off-the-rack retail.

**Bespoke tailoring invoice:**

| Item | Description | Qty | Rate | Amount |
|---|---|---|---|---|
| Agbada Set | 3-piece: buba, sokoto, agbada. Fabric: Asoke. Colour: Navy | 2 sets | ₦95,000 | ₦190,000 |
| Kaftan | Single kaftan, embroidered collar and sleeves | 3 | ₦55,000 | ₦165,000 |
| Senator Set | 2-piece, plain white, machine embroidery | 5 | ₦35,000 | ₦175,000 |
| Alteration Service | 4 existing garments let out and re-stitched | 4 | ₦8,000 | ₦32,000 |
| **Subtotal** | | | | **₦562,000** |
| **VAT (7.5%)** | | | | **₦42,150** |
| **Total Due** | | | | **₦604,150** |

**Fashion invoice tips:**
- Specify fabric type, colour, and size details — disputes often arise from vague descriptions
- State the delivery/collection date clearly
- Note any balance due on collection (if 50% deposit was taken upfront)
- For wholesale orders, reference the buyer's Purchase Order number

---

## 6. Security Services Company Invoice (Nigeria)

Security companies invoice on a monthly retainer basis for guarding services, plus additional charges for one-off deployments. Note that security services are fully VATable — the VAT exemption does not cover security.

**Monthly retainer invoice:**

| Service | Description | Unit | Rate | Amount |
|---|---|---|---|---|
| Manned Guarding | 3 armed guards, 24/7 coverage, May 2026 | 3 guards/month | ₦180,000 | ₦540,000 |
| Supervisor | 1 sector supervisor, May 2026 | 1/month | ₦250,000 | ₦250,000 |
| Control Room Monitoring | Remote CCTV monitoring, May 2026 | 1 month | ₦120,000 | ₦120,000 |
| Alarm Response | 4 emergency responses during May | 4 calls | ₦25,000 | ₦100,000 |
| **Subtotal** | | | | **₦1,010,000** |
| **VAT (7.5%)** | | | | **₦75,750** |
| **Total Due** | | | | **₦1,085,750** |

*Note: WHT at 10% (company) or 5% (individual) will be deducted by the client before payment in accordance with NTA 2025.*

**Security invoice tips:**
- State the coverage period (month and year) clearly
- Include the deployment address
- List the number of guards and their certification level (unarmed/armed/licensed)
- For WHT-aware clients, add the WHT note so they deduct correctly

---

## 7. Catering / Restaurant Invoice (Nigeria)

Caterers invoice differently for walk-in customers (receipts) versus corporate catering events (formal invoices). For corporate catering, a full invoice with line items is standard.

**Corporate catering event invoice:**

| Item | Description | Qty | Rate | Amount |
|---|---|---|---|---|
| Small Chops | Assorted: puff-puff, spring rolls, samosas (per person) | 150 | ₦3,500 | ₦525,000 |
| Main Course | Jollof rice + 2 proteins (chicken & fish), salad | 150 | ₦8,000 | ₦1,200,000 |
| Dessert | Chin-chin, cake slice, fresh fruit platter | 150 | ₦2,500 | ₦375,000 |
| Drinks | Soft drinks and water (2 per person) | 300 | ₦800 | ₦240,000 |
| Setup & Service Staff | 5 waitstaff for 6 hours | 5 | ₦15,000 | ₦75,000 |
| Equipment Rental | Chafing dishes, serving tables, linen | 1 | ₦85,000 | ₦85,000 |
| **Subtotal** | | | | **₦2,500,000** |
| **VAT (7.5%)** | | | | **₦187,500** |
| **Total Due** | | | | **₦2,687,500** |

---

## Create Any of These Invoices Instantly

Every template above can be built in under 60 seconds at [InvoiceGenerator.ng](https://invoicegenerator.ng):

1. Enter your business details (saved for future invoices)
2. Add the client's name and address
3. Add line items with descriptions, quantities, and rates
4. The system calculates VAT automatically
5. Download as PDF or send directly via WhatsApp

No sign-up required. No watermarks. Completely free.

[**Create your industry-specific invoice now →**](https://invoicegenerator.ng)`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 4: LPO vs Invoice in Nigeria
  // Target: "local purchase order vs invoice", "lpo vs invoice nigeria"
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'LPO vs Invoice in Nigeria: Key Differences and How They Work Together',
    slug: 'lpo-vs-invoice-nigeria-local-purchase-order-differences',
    excerpt: 'What is an LPO in Nigeria and how is it different from an invoice? This guide explains the Local Purchase Order process used by Nigerian government agencies, banks, and large companies — and exactly what to do when you receive one.',
    coverImage: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# LPO vs Invoice in Nigeria: Key Differences and How They Work Together

If you have ever done business with a Nigerian government agency, a bank, a telecoms company, or a large corporation, you have almost certainly encountered an **LPO** — a Local Purchase Order. Many suppliers receive one and are unsure: *do I send an invoice now, or wait? What is the LPO for? How does it relate to my invoice?*

This guide clarifies exactly how LPOs work in Nigeria, how they differ from invoices, and how to navigate the LPO-to-payment cycle correctly.

---

## What Is an LPO (Local Purchase Order)?

A **Local Purchase Order (LPO)** is an official document issued by a buying organisation (a company or government agency) to a supplier, authorising the supplier to provide specified goods or services up to a stated value.

It is called "local" to distinguish it from international purchase orders, which involve cross-border procurement and foreign exchange.

An LPO is essentially a **pre-authorisation**: the buyer is saying *"we have approved this purchase, go ahead and supply — and then invoice us for it."*

### Key characteristics of an LPO:
- Issued **by the buyer** (not the supplier)
- Comes **before** goods are supplied or services are rendered
- Specifies what is being purchased, the quantity, and the agreed price
- Is signed and stamped by an authorised officer in the buying organisation
- Carries an LPO number that must be referenced on the subsequent invoice
- Is NOT a payment — it is an instruction to supply

---

## LPO vs Invoice: The Core Differences

| Feature | LPO | Invoice |
|---|---|---|
| Who creates it | The **buyer** | The **supplier** |
| When it is issued | **Before** supply | **After** supply |
| Purpose | Authorise the purchase | Request payment |
| Is it legally binding? | Yes — it is a contract to buy | Yes — it is a payment demand |
| Does it transfer money? | No | No (but triggers payment) |
| VAT shown? | Sometimes (estimated) | Yes (actual) |
| Signed by? | Buyer's authorised officer | Supplier |

---

## The Typical LPO-to-Payment Cycle in Nigeria

Here is the standard process for Nigerian companies and government agencies:

**Step 1: Request for Quotation (RFQ)**
The buyer invites you (and usually other suppliers) to submit a quotation for goods or services.

**Step 2: You submit your quotation / proforma invoice**
You send the buyer a formal price offer — either a quotation letter or a proforma invoice.

**Step 3: Buyer issues the LPO**
If your quotation is accepted, the buyer issues a formal LPO referencing your quotation, specifying the quantity, price, and delivery requirements. You receive this LPO before doing any work.

**Step 4: You supply the goods or deliver the service**
You proceed to deliver only after receiving the LPO. Delivering without an LPO from a government agency or large company is risky — if there is no approved LPO, payment may be refused.

**Step 5: You raise and submit your invoice**
After delivery, you raise a commercial invoice referencing the LPO number. The invoice must match the LPO in terms of items, quantities, and prices.

**Step 6: The buyer processes payment**
The buyer's accounts department matches your invoice to the LPO and to the delivery note or goods received note (GRN). When all three match, payment is processed.

---

## What Must Your Invoice Include When Billing Against an LPO?

When you invoice against an LPO, your invoice should include the LPO reference number prominently. This is non-negotiable for government agencies and most large companies — their accounts systems will reject an invoice that cannot be matched to an LPO.

A proper LPO-referenced invoice includes:

- **Your business name and address** (as registered with CAC)
- **Your TIN** and VAT registration number (if applicable)
- **Invoice number** (your own sequential reference)
- **Invoice date**
- **LPO reference number** (e.g., *"As per LPO No. FMW/2026/LPO/00342 dated 5 May 2026"*)
- **Goods/services supplied** — matching exactly the descriptions in the LPO
- **Quantities and unit prices** — must match the LPO
- **VAT** — at 7.5% if you are VAT-registered
- **Total due**
- **Your bank account details** (NUBAN)
- **Delivery note number** or reference (if applicable)

If there is any discrepancy between your invoice and the LPO — even a difference in description or quantity — expect delays in payment while the buyer investigates.

---

## LPO vs Proforma Invoice: Are They the Same?

No, and this is a common point of confusion.

| Document | Who Issues It | When | Purpose |
|---|---|---|---|
| **Proforma invoice** | **Supplier** | Before supply (in response to enquiry) | Quote the price to the buyer so they can seek approval |
| **LPO** | **Buyer** | After approving the proforma invoice | Formally authorise the supplier to proceed |

The typical sequence: buyer enquires → supplier sends proforma invoice → buyer approves and issues LPO → supplier delivers → supplier sends commercial invoice.

---

## LPO vs Invoice Discounting: What Is the Difference?

**Invoice discounting** is a financing product where a supplier sells its unpaid invoices to a financier at a discount in exchange for immediate cash. For example:

- You have an invoice for ₦5,000,000 due in 60 days from a government agency
- A finance company pays you ₦4,600,000 now (8% discount)
- The finance company collects ₦5,000,000 from the government agency in 60 days
- You lose ₦400,000 but gain immediate cash flow

Invoice discounting is common in Nigeria for suppliers to government agencies where payment delays of 60–180 days are typical.

**An LPO, by contrast, is not a financing product** — it is simply a purchase authorisation. Some financiers also offer **LPO financing** (also called LPO funding), where they advance cash to a supplier to fulfil an LPO when the supplier lacks the working capital to do so upfront. This is different from invoice discounting — LPO financing happens before supply; invoice discounting happens after.

---

## Government Procurement LPOs: Special Rules

For LPOs from federal ministries, departments, and agencies (MDAs) and state government bodies, additional rules apply:

- **Budget appropriation**: the LPO must be backed by an approved budget line — if the government has not appropriated funds, the LPO may be invalid
- **Due process**: the procurement must follow the Public Procurement Act 2007 (for federal entities) or the relevant state procurement law
- **Certificate of No Objection (CNO)**: some high-value contracts require a CNO from the Bureau of Public Procurement (BPP) before an LPO is issued
- **Variation orders**: if the scope or price changes after the LPO is issued, a formal variation order must be issued before you can invoice for the additional amount

Delivering against a government LPO without following these steps can result in the invoice being rejected even after delivery.

---

## Common LPO Problems and How to Handle Them

**Problem: The LPO amount is less than your quoted price**
Clarify in writing before delivering. Do not assume the difference will be resolved later.

**Problem: The client asks you to start work before the LPO is issued ("verbal LPO")**
Request a formal LPO in writing before commencing. A verbal instruction from a procurement officer has no legal standing if the invoice is later disputed.

**Problem: The LPO has expired (some LPOs have validity dates)**
Request a new or extended LPO before delivering. Expired LPOs can invalidate your invoice.

**Problem: Your invoice does not match the LPO exactly**
Accounts departments will return the invoice. Reissue it matching the LPO details precisely, or request a revised LPO from the buyer if the scope changed.

---

## Create Your LPO-Referenced Invoice

Once your LPO arrives, creating the corresponding invoice takes under two minutes at [InvoiceGenerator.ng](https://invoicegenerator.ng). Add the LPO reference number in the invoice notes field, match your line items to the LPO, and download the PDF ready for submission.

[**Create your invoice against an LPO — free →**](https://invoicegenerator.ng)`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 5: TaxPro Max Complete Guide
  // Target: "taxpromax login", "taxpromax", "taxpro max admin"
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'TaxPro Max Nigeria: Complete Guide to Login, VAT Registration, and Filing (2026)',
    slug: 'taxpromax-nigeria-complete-guide-login-vat-registration-filing-2026',
    excerpt: 'Everything you need to know about TaxPro Max — Nigeria\'s NRS tax portal. How to log in, reset your password, register for VAT, file monthly VAT returns, download your VAT certificate, and avoid the most common errors.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# TaxPro Max Nigeria: Complete Guide to Login, VAT Registration, and Filing (2026)

TaxPro Max is Nigeria's official online tax administration portal, operated by the **Nigeria Revenue Service (NRS)** — formerly the Federal Inland Revenue Service (FIRS), renamed under the Nigeria Tax Act 2025.

If you pay company income tax, register for VAT, file monthly VAT returns, or manage your Tax Identification Number (TIN) online, you do it through TaxPro Max. This guide covers everything a Nigerian business owner, accountant, or consultant needs to know.

---

## What Is TaxPro Max?

TaxPro Max (formerly TaxPro-Max, sometimes written TaxProMax) is the NRS's integrated tax administration platform. Launched in 2021 to replace the older e-TaxPay and ITAS systems, it consolidates:

- TIN registration and management
- VAT registration and filing
- Company Income Tax (CIT) returns
- Withholding Tax (WHT) remittance
- Stamp duty payment
- Tax clearance certificate applications
- Payment of all federal taxes

**URL:** [taxpromax.gov.ng](https://taxpromax.gov.ng)

---

## TaxPro Max Login: Step by Step

**Step 1: Go to the official portal**
Navigate to [taxpromax.gov.ng](https://taxpromax.gov.ng). Bookmark this URL. There are unofficial lookalike sites — always verify you are on the .gov.ng domain.

**Step 2: Click "Login"**
The login button is in the top right corner of the homepage.

**Step 3: Enter your credentials**
- **Username:** Your email address registered with NRS, or your TIN number
- **Password:** The password you set during registration

**Step 4: Complete multi-factor authentication (if enabled)**
NRS has introduced optional MFA. If you set this up, you will receive an OTP on your registered phone number.

**Step 5: Dashboard access**
After logging in, you land on your taxpayer dashboard showing your registered taxes, outstanding filings, and recent payments.

### Forgotten Password — Reset Process

1. Click "Forgot Password" on the login page
2. Enter your registered email address or TIN
3. NRS sends a password reset link to your email
4. Click the link (valid for 30 minutes) and set a new password
5. If you do not receive the email within 10 minutes, check your spam folder

If you cannot access your registered email, visit the nearest NRS tax office in person with your TIN and a valid ID for a manual password reset.

---

## TaxPro Max Admin Access

**TaxPro Max Admin** refers to the administrative roles within the system:

- **Individual taxpayer (self):** Standard access to your own filings and payments
- **Tax Agent / Accountant:** Can file on behalf of multiple clients after obtaining a Tax Agent accreditation from NRS
- **Company administrator:** One person in a company can have administrator rights and delegate sub-users (e.g., the company accountant can set up junior staff to prepare returns, while the CFO retains approval rights)

To add sub-users to your company's TaxPro Max account: Login → Settings → User Management → Add New User → Assign roles (prepare, review, approve).

---

## How to Register for VAT on TaxPro Max

If your annual taxable turnover exceeds ₦25 million, you are required to register for VAT. Here is the step-by-step process on TaxPro Max.

**Prerequisites:**
- Active TIN (if you do not have a TIN, register at any NRS office or online via the Joint Tax Board portal at [jtb.gov.ng](https://www.jtb.gov.ng))
- CAC registration documents (for companies and businesses)
- Bank account details (for remittances)
- Contact information (business email and phone number)

**Steps:**

1. Log in to TaxPro Max
2. From your dashboard, click **"Register New Tax"**
3. Select **"Value Added Tax (VAT)"**
4. Complete the registration form:
   - Business name (must match CAC certificate)
   - Business address and state of operation
   - Nature of business (select your sector)
   - Estimated annual turnover
   - Bank account details
   - Authorised signatory details
5. Upload required documents: CAC certificate, memorandum of association (for companies), utility bill for business address
6. Submit the application
7. NRS reviews the application — typically 5–10 working days
8. Upon approval, your VAT registration number is generated and your VAT certificate is available for download from your TaxPro Max dashboard

**Your VAT registration number format:**
Nigerian VAT registration numbers follow the format: **TIN-0001** where TIN is your existing Tax Identification Number. In practice, your TIN and VAT registration number are linked under the same profile on TaxPro Max.

---

## How to File Monthly VAT Returns on TaxPro Max

VAT returns must be filed and any VAT payable must be remitted **by the 21st day of each month** for the previous month's transactions.

**Step 1: Gather your records**
Before filing, you need:
- Total value of VATable sales for the month
- Total VAT collected (output VAT) = sales value × 7.5%
- Total VATable purchases and expenses for the month
- Total VAT paid on purchases (input VAT) = purchases × 7.5%
- Net VAT payable = output VAT minus input VAT

Your invoices are the source of your output VAT figures. This is why creating proper VAT invoices throughout the month — using a tool like [InvoiceGenerator.ng](https://invoicegenerator.ng) — makes filing your VAT return significantly easier.

**Step 2: Log in and navigate to VAT filing**
Dashboard → Tax Obligations → VAT → File Return → Select the period (month and year)

**Step 3: Complete the VAT return form**
- **Box 1 (Output Tax):** Total VAT collected on sales
- **Box 2 (Input Tax):** Total VAT paid on qualifying business purchases
- **Box 3 (Net VAT Payable/Refundable):** Box 1 minus Box 2

If Box 3 is positive, you owe this amount to NRS. If negative, you have an input VAT credit (though VAT refunds in Nigeria are rare in practice — most businesses carry credits forward).

**Step 4: Submit and pay**
- Click Submit Return
- You are redirected to the payment gateway
- Pay via bank transfer, Remita, or card

**Step 5: Download your VAT receipt**
After payment, download and save the payment receipt. This is your proof of compliance.

### Filing a NIL VAT Return

If you had no VATable sales in a particular month, you still MUST file a NIL return by the 21st. Failure to file (even a NIL return) attracts a penalty of ₦50,000 per month under the NTA 2025.

To file a NIL return: follow the same steps above, enter ₦0 in all boxes, and submit. No payment is required.

---

## How to Download Your VAT Certificate from TaxPro Max

After VAT registration is approved, your VAT certificate is available on TaxPro Max.

Steps:
1. Log in to TaxPro Max
2. Go to **Profile** or **Registered Taxes**
3. Select **Value Added Tax**
4. Click **Download Certificate**
5. The certificate downloads as a PDF

Your VAT certificate shows your business name, TIN, VAT registration number, and the date of registration. Some large companies and government agencies request this certificate before doing business with you.

---

## Common TaxPro Max Errors and Fixes

**"Invalid TIN" error on login**
Your TIN may not be linked to a TaxPro Max account yet. Visit the nearest NRS office to link your existing TIN to the portal.

**Returns showing as "pending" for weeks**
This usually means a document uploaded during registration was rejected. Check your TaxPro Max inbox/messages for a rejection notice and re-upload the correct document.

**Payment made but return still shows as "outstanding"**
Bank payments can take 24–48 hours to reflect. If it does not update after 48 hours, contact NRS with your Remita Retrieval Reference (RRR) number as proof of payment.

**Cannot access after password reset**
Clear your browser cache and try in an incognito/private window. TaxPro Max has known issues with cached login sessions.

---

## TaxPro Max and Your Invoices: The Connection

Every naira of VAT you file on TaxPro Max should trace back to the invoices you issued during that month. Your invoices are your VAT audit trail.

Before you can accurately complete your monthly VAT return, you need:
1. A complete record of all invoices issued that month
2. The VAT amount on each invoice
3. A record of all purchase invoices received (for input VAT)

[InvoiceGenerator.ng](https://invoicegenerator.ng) keeps all your issued invoices in one place, with VAT calculated automatically. At month-end, your total output VAT for the TaxPro Max return is right there in your dashboard.

[**Create VAT-compliant invoices ready for TaxPro Max filing →**](https://invoicegenerator.ng)

---

*Sources: NRS TaxPro Max user guide; Nigeria Tax Act 2025; FIRS VAT Regulations; NRS official guidance (nrs.gov.ng).*`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 6: How to File VAT Return Nigeria Step-by-Step
  // Target: "how to file vat return online in nigeria step by step",
  //         "steps to pay vat in nigeria", "nrs nigeria vat filing requirements"
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'How to File Your VAT Return in Nigeria: Step-by-Step Guide (2026)',
    slug: 'how-to-file-vat-return-nigeria-step-by-step-2026',
    excerpt: 'A plain-English step-by-step guide to filing your monthly VAT return in Nigeria on TaxPro Max. Covers what records you need, how to calculate output and input VAT, what to do when you have no sales, penalties for late filing, and how to avoid the most common mistakes.',
    coverImage: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# How to File Your VAT Return in Nigeria: Step-by-Step Guide (2026)

Filing your monthly VAT return does not have to be complicated. Once you understand the structure — collect VAT from customers, pay VAT on your purchases, remit the difference to NRS — the process is straightforward.

This guide walks you through every step, from gathering your invoices to getting your payment receipt on TaxPro Max.

---

## Who Needs to File a VAT Return?

Every VAT-registered business in Nigeria must file a monthly VAT return, even if:
- You made no sales that month (file a NIL return)
- The VAT you collected is less than the VAT you paid (you still file, and your credit carries forward)
- You are a small business that registered voluntarily

**Filing deadline:** The 21st of each month for the previous month's transactions.

If the 21st falls on a weekend or public holiday, the deadline extends to the next working day.

**Penalty for late filing:** ₦50,000 per month under the Nigeria Tax Act 2025, plus interest on any unpaid VAT at the NRS prescribed rate.

---

## Before You Start: What You Need

Gather the following before logging on to TaxPro Max:

**1. Your sales invoices for the month**
Every invoice you issued to customers in the period. These are your source for **output VAT** (the VAT you collected).

**2. Your purchase invoices and expense receipts**
Every invoice you received from suppliers for business-related purchases where VAT was charged. These are your source for **input VAT** (the VAT you paid out).

**3. Your TaxPro Max login credentials**
Username (email or TIN) and password. If you have forgotten your password, reset it at [taxpromax.gov.ng](https://taxpromax.gov.ng) before the deadline.

**4. Your bank account and Remita access (for payment)**
If you owe VAT, you will need to pay online through Remita or your bank.

---

## Step 1: Calculate Your Output VAT

**Output VAT** is the VAT you collected from your customers during the month.

For each VAT invoice you issued:
- Identify the VATable amount (the pre-VAT price of goods or services)
- Multiply by 7.5%
- Sum all these figures across all invoices

**Example — May 2026:**

| Invoice | Customer | Taxable Amount | VAT (7.5%) |
|---|---|---|---|
| INV-2026-031 | ABC Ltd | ₦800,000 | ₦60,000 |
| INV-2026-032 | XYZ Bank | ₦1,200,000 | ₦90,000 |
| INV-2026-033 | Federal Ministry of Works | ₦500,000 | ₦37,500 |
| **Total** | | **₦2,500,000** | **₦187,500** |

Your output VAT for May 2026 is **₦187,500**.

**Did not issue any invoices?** Your output VAT is ₦0. You will file a NIL return.

---

## Step 2: Calculate Your Input VAT

**Input VAT** is the VAT you paid to suppliers on business-related purchases during the month.

Only VAT paid on goods and services used **for your business** qualifies. Personal expenses do not qualify.

**Qualifying input VAT examples:**
- VAT paid on office supplies
- VAT paid on professional services (legal, accounting)
- VAT paid on business equipment
- VAT paid on telecommunications and internet services

**Non-qualifying examples:**
- Personal meals and entertainment
- Private vehicle expenses
- Costs related to VAT-exempt supplies you make

**Example — May 2026:**

| Supplier Invoice | Description | VAT Paid |
|---|---|---|
| Office supplies (Staples Nigeria) | Printer cartridges, stationery | ₦4,500 |
| Accountant's fee | Monthly bookkeeping | ₦18,750 |
| Data and internet | MTN business data plan | ₦3,375 |
| **Total Input VAT** | | **₦26,625** |

---

## Step 3: Calculate Net VAT Payable

**Net VAT payable = Output VAT minus Input VAT**

Using the examples above:

- Output VAT: ₦187,500
- Input VAT: ₦26,625
- **Net VAT Payable: ₦160,875**

This is the amount you owe NRS for May 2026.

**What if input VAT exceeds output VAT?**
This gives you a VAT credit (excess input VAT). In theory, you can claim a VAT refund from NRS — but in practice, NRS refunds are slow and administratively complex in Nigeria. Most businesses carry the credit forward to offset against next month's output VAT.

---

## Step 4: Log Into TaxPro Max

Go to [taxpromax.gov.ng](https://taxpromax.gov.ng) and log in with your registered email address (or TIN) and password.

From your dashboard, navigate to:

**Tax Obligations → VAT → File Return**

Select the filing period — in this case, **May 2026**.

---

## Step 5: Complete the VAT Return Form

The TaxPro Max VAT return form has the following key fields:

**Section A — Output Tax**
- Total taxable supplies (your total pre-VAT sales): ₦2,500,000
- VAT on taxable supplies (output VAT): ₦187,500
- Zero-rated supplies (exports): enter separately if applicable
- Exempt supplies: enter if you made any VAT-exempt sales

**Section B — Input Tax**
- Total taxable purchases (your total pre-VAT business purchases): enter the relevant figure
- VAT on taxable purchases (input VAT): ₦26,625
- Only include input VAT on business purchases — not personal

**Section C — Net Position**
This is calculated automatically by the system:
- Net VAT payable: ₦160,875 (or your calculated figure)
- Credit brought forward from previous months: if applicable

Check all figures carefully before proceeding.

---

## Step 6: Submit the Return

Click **"Submit Return"**.

You will see a summary screen showing:
- Filing period
- Output VAT
- Input VAT
- Net amount payable

If everything is correct, click **"Confirm and Submit"**.

TaxPro Max generates a **Return Reference Number** — save this. It is your proof that you filed, even before payment.

---

## Step 7: Make the Payment

After submission, you are redirected to the payment screen.

**Payment options on TaxPro Max:**
- **Remita:** Generate a Remita Retrieval Reference (RRR) and pay at any bank, through internet banking, or via the Remita app
- **Card payment:** Debit or credit card directly on the portal (Visa, Mastercard)
- **Bank transfer:** Some banks allow direct TaxPro Max payment from your business account

**After payment:**
- Download the **payment receipt** immediately
- The receipt shows the RRR, amount paid, date, and the filing period it covers
- Store this receipt — it is your proof of VAT compliance for that month

---

## Step 8: File a NIL Return (If No Sales)

If you had zero VATable sales in the month:

1. Log in → Tax Obligations → VAT → File Return → Select period
2. Enter ₦0 in all sales fields
3. Enter any input VAT you paid (you can still claim this)
4. Net position will show either ₦0 (if no input VAT) or a credit (if you paid input VAT)
5. Submit — no payment required if net is ₦0

You must still submit this NIL return by the 21st. Many businesses skip NIL returns thinking they have nothing to pay — this is wrong and incurs the ₦50,000 per month penalty.

---

## Common VAT Return Mistakes to Avoid

**1. Including VAT on exempt supplies**
If some of your sales are VAT-exempt, do not include them in your taxable supplies figure. List them separately in the exempt supplies section.

**2. Claiming input VAT on personal expenses**
Only business expenses qualify. If you mixed personal and business spending on a card, carefully separate them before calculating input VAT.

**3. Filing after the 21st**
Even a day late attracts ₦50,000. Set a calendar reminder for the 18th of each month to give yourself three days to gather records and file.

**4. Not reconciling your invoices before filing**
If your invoice records are incomplete or your VAT calculations differ from your accounting records, the return may be queried. Keep all invoices in one system throughout the month.

**5. Forgetting to download the payment receipt**
The TaxPro Max session times out. Download your receipt immediately after payment — re-downloading later is possible but cumbersome.

---

## How Your Invoices Connect to Your VAT Return

Every figure on your VAT return traces back to your invoices:

- **Output VAT** comes from the invoices you issued to customers
- **Input VAT** comes from the invoices suppliers issued to you

This is why maintaining clean invoice records throughout the month is essential — not just for getting paid, but for accurate VAT compliance.

[InvoiceGenerator.ng](https://invoicegenerator.ng) tracks all your issued invoices with VAT amounts calculated automatically. At month-end, your total output VAT is visible in your reports dashboard — ready to enter directly into TaxPro Max.

---

## VAT Filing Calendar 2026

| Month Filed | Period Covered | Deadline |
|---|---|---|
| January 2026 | December 2025 | 21 January 2026 |
| February 2026 | January 2026 | 21 February 2026 |
| March 2026 | February 2026 | 21 March 2026 |
| April 2026 | March 2026 | 21 April 2026 |
| May 2026 | April 2026 | 21 May 2026 |
| June 2026 | May 2026 | 21 June 2026 |
| July 2026 | June 2026 | 21 July 2026 |
| August 2026 | July 2026 | 21 August 2026 |
| September 2026 | August 2026 | 21 September 2026 |
| October 2026 | September 2026 | 21 October 2026 |
| November 2026 | October 2026 | 21 November 2026 |
| December 2026 | November 2026 | 21 December 2026 |

---

*Sources: Nigeria Tax Act 2025; NRS VAT Regulations; TaxPro Max User Guide; ICAN Nigeria Tax Practice Notes.*

[**Create VAT invoices that make your monthly return easy →**](https://invoicegenerator.ng)`,
  },
];

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized — pass ?secret= to proceed' }, { status: 401 });
  }

  try {
    let author = await prisma.user.findFirst({ where: { isAdmin: true } });
    if (!author) author = await prisma.user.findFirst();
    if (!author) {
      return NextResponse.json(
        { error: 'No users found in the database. Create an admin account first.' },
        { status: 400 }
      );
    }

    const results: { slug: string; title: string; action: string }[] = [];

    for (const post of BING_ARTICLES) {
      const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });

      if (existing) {
        if (!existing.published) {
          await prisma.blogPost.update({
            where: { slug: post.slug },
            data: { ...post, authorId: author.id },
          });
          results.push({ slug: post.slug, title: post.title, action: 'updated (draft)' });
        } else {
          results.push({ slug: post.slug, title: post.title, action: 'skipped (already published)' });
        }
      } else {
        await prisma.blogPost.create({
          data: { ...post, authorId: author.id },
        });
        results.push({ slug: post.slug, title: post.title, action: 'created (draft)' });
      }
    }

    const created = results.filter(r => r.action === 'created (draft)').length;
    const updated = results.filter(r => r.action === 'updated (draft)').length;
    const skipped = results.filter(r => r.action.startsWith('skipped')).length;

    return NextResponse.json({
      success: true,
      author: author.name || author.email,
      summary: `${created} created, ${updated} updated, ${skipped} skipped (already published).`,
      message: 'All 6 Bing-gap articles are now in the admin blog list at /admin/blog.',
      results,
    });
  } catch (error) {
    console.error('[seed-bing-articles] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
