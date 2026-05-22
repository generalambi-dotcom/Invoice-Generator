import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Draft Article Seeder — 12 SEO articles (published: false)
 * Call: POST /api/admin/seed-draft-articles?secret=invoiceng-seed-2026
 * Articles will appear in the admin blog list ready to review and publish.
 * DELETE or DISABLE this file after first use.
 */

const SECRET = process.env.SEED_SECRET || 'invoiceng-seed-2026';

const DRAFT_ARTICLES = [
  // ─────────────────────────────────────────────────────────────────────────
  // Article 1: E-Invoicing 2026
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Nigeria E-Invoicing 2026: What Small Businesses and Freelancers Actually Need to Do',
    slug: 'nigeria-e-invoicing-2026-small-business-freelancer-guide',
    excerpt: 'E-invoicing is now mandatory in Nigeria. But what does that actually mean for a freelancer or small business with under ₦100M turnover? Here is the plain-English breakdown — including who is exempt and what you should do right now.',
    coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Nigeria E-Invoicing 2026: What Small Businesses and Freelancers Actually Need to Do

If you have seen headlines about "mandatory e-invoicing in Nigeria" and wondered whether it applies to your freelance practice or small business, you are not alone. The regulation is real — but the phased rollout means most small businesses have more time than the headlines suggest.

This guide cuts through the legal language and tells you exactly where you stand and what to do.

---

## What Is E-Invoicing?

An e-invoice is not simply a PDF sent by email. Under Nigeria's new framework, a true e-invoice is:

1. **Generated electronically** from a business system or accounting software
2. **Submitted through an Access Point Provider (APP)** — a certified intermediary approved by NITDA
3. **Validated and digitally stamped by the Nigeria Revenue Service (NRS)**
4. **Returned with a QR Code and a Cryptographic Stamp Identifier (CSID)**

The end result looks similar to your current invoice, but it has a QR code your client can scan to verify its authenticity on the NRS portal.

The legal framework is the **Nigeria Tax Administration Act 2025 (NTAA 2025)**, which mandated e-invoicing and moved the Federal Inland Revenue Service (FIRS) into the new Nigeria Revenue Service (NRS).

---

## The Phased Rollout: Who Must Comply and When

This is the part most articles get wrong. E-invoicing is **not immediately mandatory for everyone**. The NRS is rolling it out in phases based on annual turnover:

| Business Size | Annual Turnover | Mandatory From |
|---|---|---|
| Large taxpayers | Above ₦5 billion | November 2025 — already live |
| Upper medium | ₦1 billion – ₦5 billion | July 1, 2026 (pilot from Q2 2026) |
| Lower medium | ₦100 million – ₦1 billion | July 1, 2027 |
| Small / Emerging | Under ₦100 million | 2028 (engagement from Jan 2027) |

**The bottom line for most freelancers and small businesses:** if your annual turnover is below ₦100 million, you are not required to implement the NRS e-invoicing system until 2028 at the earliest.

---

## What About the VAT Threshold Change?

The Nigeria Tax Act 2025 also raised the VAT registration threshold from ₦25 million to **₦50 million** annually. This means:

- If your turnover is below ₦50 million per year, you are **not required to register for VAT** and are therefore outside the scope of mandatory e-invoicing entirely.
- If your turnover is between ₦50 million and ₦100 million and you are VAT-registered, you will enter the e-invoicing system in the 2028 phase.
- Small companies with turnover ≤ ₦100M **and** fixed assets ≤ ₦250M are also exempt from charging VAT even if they choose to register.

---

## What Should Small Businesses Do Right Now?

Even if you are not in the mandatory phase yet, there are sensible steps to take in 2026:

### 1. Get Your TIN in Order
Every business operating in Nigeria needs a valid **Tax Identification Number (TIN)** from the NRS. Under the 2026 reforms, suppliers without a valid TIN lose certain Withholding Tax exemptions. Visit [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng) to retrieve yours, or register at your nearest NRS office.

### 2. Start Using a Digital Invoicing System
Even before e-invoicing is mandatory for you, moving from Word documents and WhatsApp messages to a proper digital invoicing tool creates a clean audit trail and prepares you for future compliance.

[InvoiceGenerator.ng](https://invoicegenerator.ng) generates professional, FIRS-compliant Naira invoices with your TIN and 7.5% VAT applied automatically — at no cost. [Try it free here](https://invoicegenerator.ng/free-invoice-generator-nigeria).

### 3. Know Your Access Point Provider (APP) Options
When your phase arrives, you will need to connect to an NRS-approved APP. A list of accredited providers will be published by NITDA. Plan ahead rather than scramble when the deadline hits.

### 4. Watch for Enforcement Updates
The NRS has indicated that enforcement (penalties) will begin approximately six months after each group's go-live date. Stay subscribed to NRS communications at [nrs.gov.ng](https://www.nrs.gov.ng).

---

## What Does an NRS-Compliant E-Invoice Look Like?

For businesses in the mandatory phases, a valid e-invoice must:

- Be structured in **UBL XML or JSON** (Peppol BIS Billing 3.0 format)
- Include your **TIN and VAT Registration Number**
- Show the **NRS Cryptographic Stamp Identifier (CSID)**
- Contain a **scannable QR Code** linking to the NRS verification portal
- Show **7.5% VAT** calculated correctly on taxable line items

Businesses in the large taxpayer category are already using accredited software and APPs to generate these automatically. SME-focused tools will follow.

---

## Penalties for Non-Compliance (Once Your Phase is Live)

The NTAA 2025 sets penalties for failure to comply once your phase's enforcement begins:

- **Failure to issue a valid e-invoice:** Up to ₦100,000 per occurrence
- **Falsifying invoice data:** Criminal liability under the NTAA 2025
- **Failure to remit VAT on time:** 10% surcharge plus NRS lending rate interest

---

## The Opportunity for Small Businesses

Here is what this change actually means for smaller businesses: **clients in mandatory phases need their suppliers to also issue valid e-invoices to claim input VAT**. That creates real commercial pressure for you to adopt digital invoicing even before it is technically required.

Businesses that adopt clean digital invoicing now will win more contracts from large corporations and government agencies that need compliant invoices.

---

## Summary

| Question | Answer |
|---|---|
| Is e-invoicing mandatory for me right now? | Only if turnover > ₦5B. Others have until 2027–2028. |
| Does the new VAT threshold affect me? | If turnover < ₦50M, you no longer need to register for VAT |
| What should I do now? | Get your TIN, switch to digital invoicing, monitor NRS guidance |
| What format is required? | UBL XML/JSON + QR code + CSID stamp via an accredited APP |

The e-invoicing reform is significant, but the NRS has been deliberate about phasing it in. For freelancers and small businesses, the immediate action is simply to modernise your invoicing — [InvoiceGenerator.ng](https://invoicegenerator.ng) is the fastest way to do that for free.

---

*Sources: Nigeria Tax Administration Act 2025; NRS e-invoicing guidance (nrs.gov.ng); NITDA accreditation framework; VATupdate Nigeria e-invoicing briefing, February 2026.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 2: VAT Certificate
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'How to Get Your VAT Certificate and Registration Number in Nigeria (2026)',
    slug: 'how-to-get-vat-certificate-registration-number-nigeria-2026',
    excerpt: 'Step-by-step guide to obtaining your VAT registration certificate and number from the NRS (formerly FIRS) in Nigeria in 2026 — including the new ₦50 million threshold, TaxPro Max portal steps, and what your VAT number looks like.',
    coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# How to Get Your VAT Certificate and Registration Number in Nigeria (2026)

Your **VAT Registration Certificate** is the official document issued by the Nigeria Revenue Service (NRS) — formerly the Federal Inland Revenue Service (FIRS) — confirming that your business is registered to collect, charge, and remit Value Added Tax at 7.5%.

Without it, you cannot legally charge VAT on your invoices. And many large corporations and government agencies will reject your invoices entirely if they are not VAT-compliant.

This guide walks you through the exact process in 2026, including the new threshold changes under the Nigeria Tax Act 2025.

---

## First: Do You Need to Register for VAT?

Under the **Nigeria Tax Act 2025**, the VAT registration threshold was raised from ₦25 million to **₦50 million** in annual turnover.

| Annual Turnover | VAT Registration |
|---|---|
| Below ₦50 million | Not required (optional) |
| ₦50 million and above | Mandatory |
| Small company (≤ ₦100M turnover AND ≤ ₦250M assets, non-professional) | Exempt from charging VAT even if registered |

**Voluntary registration:** Even if your turnover is below ₦50 million, you may register voluntarily. Many freelancers and small businesses do so because large corporate clients require VAT invoices to claim input VAT credit.

---

## What Is a VAT Registration Number?

Your VAT registration number is a unique identifier tied to your business. In Nigeria, it is linked to your **Tax Identification Number (TIN)** — a 14-digit number assigned by the NRS/JTB. When you register for VAT, the NRS issues a specific VAT registration number which appears on your VAT certificate.

A valid Nigerian VAT number format looks like: **12345678-0001** (TIN prefix + branch code).

This number must appear on every Tax Invoice you issue.

---

## What You Need Before You Apply

### For Limited Liability Companies:
- Certificate of Incorporation (CAC)
- Certified True Copy (CTC) of Memorandum and Articles of Association
- CTC of Form CAC 1.1 (the combined statement replacing the old CAC 2 and CAC 7)
- Valid means of ID for director(s): NIN, driver's licence, or international passport
- Utility bill for business premises (not older than 3 months)
- Company letterhead application letter addressed to the Tax Controller

### For Business Names (Sole Proprietors / Partnerships):
- CAC Business Name Registration Certificate
- Valid means of ID (NIN, driver's licence, or passport)
- Utility bill for address verification
- Application letter

### For Individuals / Freelancers:
- NIN or BVN
- Valid government-issued ID
- Recent utility bill
- Completed NRS registration form

---

## Option 1: Register Online via TaxPro Max (Recommended)

The NRS TaxPro Max portal is now the **primary platform** for all federal tax registrations and filings. The portal is accessible at **[nrs.gov.ng](https://www.nrs.gov.ng)**.

**Step 1 — Create your TaxPro Max account**
Visit nrs.gov.ng and click "Register." You will need your TIN. If you do not have one, companies registered with CAC after 2020 have a TIN auto-assigned — retrieve it at [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng).

**Step 2 — Log in and navigate to VAT Registration**
From the dashboard, go to **Registration → Add Tax → VAT (Value Added Tax)**.

**Step 3 — Fill the VAT Registration Form**
Complete all fields including:
- Business name and address
- Nature of business (select the closest ISIC classification)
- Bank account details (required for refund processing)
- Turnover estimate for the current year

**Step 4 — Upload Documents**
Attach scanned copies of your required documents. Files must be PDF or JPEG, under 2MB each.

**Step 5 — Submit and await processing**
The NRS typically processes VAT registrations within **14 working days**. You will receive an email notification when your certificate is ready for download.

**Step 6 — Download Your VAT Certificate**
Log back into TaxPro Max → Registration → Registered Taxes → VAT → Download Certificate.

---

## Option 2: Walk-In at an NRS Office

If you prefer in-person registration or do not have reliable internet access:

1. Visit the **Micro and Small Tax Office (MSTO)** closest to your registered business address
2. Collect and complete the VAT registration form
3. Submit with all required documents to the Tax Controller's desk
4. Collect your acknowledgment slip with a reference number
5. Return after 14 working days (or check TaxPro Max using your reference number)

---

## What Your VAT Certificate Contains

Your NRS VAT Certificate will show:
- Your full business name
- Registered business address
- Your Tax Identification Number (TIN)
- Your VAT Registration Number
- Date of registration
- The NRS stamp and authorized signature

**You are required to display this certificate at your business premises.** A scanned copy is also acceptable for most corporate clients requesting proof of VAT registration.

---

## Using Your VAT Number on Invoices

Once registered, every invoice you issue for taxable goods or services must be a **Tax Invoice** and must include:

- The words **"TAX INVOICE"** prominently
- Your VAT Registration Number
- Your TIN
- The 7.5% VAT amount clearly separated from the subtotal
- The buyer's VAT number (if they are also VAT-registered)

[InvoiceGenerator.ng](https://invoicegenerator.ng) has a dedicated field for your TIN and automatically calculates 7.5% VAT. [Create your first compliant Tax Invoice here](https://invoicegenerator.ng/free-invoice-generator-nigeria) — it takes under two minutes.

---

## Monthly VAT Filing Obligations

VAT registration comes with a recurring obligation: you must file and remit VAT by the **21st of every month** for the previous month's transactions.

Filing is done through TaxPro Max. Failure to file attracts:
- ₦50,000 penalty for the first month
- ₦25,000 for each subsequent month of non-compliance
- 10% surcharge plus interest on any unpaid VAT

---

## Frequently Asked Questions

**How long does VAT registration take?**
14 working days via TaxPro Max. Walk-in registrations may take slightly longer.

**Is VAT registration free?**
Yes. Any agent charging a fee is not acting on behalf of the NRS. The process is free.

**Can I deregister from VAT?**
Yes, if your turnover drops below the ₦50 million threshold, you may apply for deregistration through TaxPro Max.

**What if my client says my invoice is invalid?**
Ensure your Tax Invoice includes your TIN, VAT registration number, and the 7.5% VAT clearly itemised. Use a proper invoicing tool to avoid formatting errors.

---

*Sources: Nigeria Tax Act 2025; NRS TaxPro Max portal guidelines (nrs.gov.ng); Joint Tax Board TIN verification portal (jtb.gov.ng); VAT Act Cap V1 LFN 2004 as amended.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 3: New Tax Laws 2026
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: "Nigeria's New Tax Laws 2026: The Complete Plain-English Guide for Small Businesses",
    slug: 'nigeria-new-tax-laws-2026-small-business-plain-english-guide',
    excerpt: "Nigeria's Tax Act 2025 brought the biggest tax changes in a generation. Here is what actually changed for small businesses and freelancers in 2026 — VAT thresholds, withholding tax rules, e-invoicing, and what you must do differently.",
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Nigeria's New Tax Laws 2026: The Complete Plain-English Guide for Small Businesses

The **Nigeria Tax Act 2025** — signed into law by President Tinubu — is the most significant overhaul of Nigeria's tax system since the Finance Act era. It consolidated multiple tax legislation, renamed FIRS to the **Nigeria Revenue Service (NRS)**, and introduced changes that directly affect how you invoice, how much VAT you charge, and what gets deducted from your payments.

Here is everything a Nigerian small business owner, freelancer, or contractor needs to know — with no accountancy jargon.

---

## 1. The VAT Threshold Doubled: ₦25M → ₦50M

**What changed:** The minimum annual turnover at which VAT registration becomes mandatory was raised from ₦25 million to **₦50 million**.

**What this means for you:**
- If your annual revenue is below ₦50 million, you are **not required to charge VAT** on your invoices
- If you were previously registered because you crossed the old ₦25M threshold but are below ₦50M, you may apply to deregister (though many choose to remain registered to serve large corporate clients)
- If you are above ₦50M, registration is mandatory and you must charge 7.5% VAT

**New small company exemption:** Businesses with turnover ≤ ₦100M **and** fixed assets ≤ ₦250M are classified as "small companies" and are exempt from charging VAT even if VAT-registered — provided they are not a professional services firm. This is a significant relief for product-based SMEs.

---

## 2. Withholding Tax (WHT) Rules Completely Overhauled

Withholding Tax is one of the most confusing topics for Nigerian freelancers. The 2025 Act made two big changes:

### Change 1: The ₦2 Million Exemption
If a supplier has a valid **Tax Identification Number (TIN)** and the transaction value is **₦2 million or less per month**, the client is no longer required to deduct Withholding Tax.

**Example:** You are a designer invoicing a corporate client ₦500,000 for a logo redesign. Your TIN is on file with them. Under the new rules, they should pay you the full ₦500,000 — no 5% WHT deduction. Verify your TIN is registered at [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng).

### Change 2: Revised WHT Rates

The NTA 2025 published updated Withholding Tax rates across professions:

| Service Type | Old Rate | New Rate |
|---|---|---|
| Professional services (consulting, legal, medical) | 10% | 5% |
| Technical / management services | 5% | 5% |
| Construction contracts | 5% | 2.5% |
| Rent | 10% | 10% |
| Dividends | 10% | 10% |
| Interest | 10% | 10% |

**For contractors:** Construction contract WHT dropped from 5% to 2.5% — significant on large projects.

### What to Include on Invoices to Minimize WHT
Always include your TIN on every invoice. Clients cannot apply the ₦2M exemption without it. Use [InvoiceGenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria) to save your TIN in your company defaults — it prints on every invoice automatically.

---

## 3. FIRS Is Now the Nigeria Revenue Service (NRS)

The Nigeria Revenue Service replaced the Federal Inland Revenue Service as the federal tax authority. Practically speaking:
- The TaxPro Max portal remains the filing platform (now at nrs.gov.ng)
- All TINs, VAT numbers, and registration certificates remain valid — no reregistration needed
- Correspondence now comes from "NRS" not "FIRS"
- Penalties and rates are unchanged for most small businesses

---

## 4. Zero-Rated VAT Items Expanded

The NTA 2025 expanded the list of zero-rated goods and services. If your business sells any of these, you charge **0% VAT** (not 7.5%) while still being able to reclaim input VAT on your own purchases:

- **Basic food items** (expanded definition — now includes more staples)
- **Medical and pharmaceutical products**
- **Educational books and materials**
- **Electricity generation and transmission services**
- **Medical equipment**
- **Agricultural produce and equipment**

If you supply any zero-rated items, ensure your invoices clearly mark these lines as "0% VAT — Zero Rated" to avoid queries from VAT audits.

---

## 5. E-Invoicing: Mandatory but Phased

E-invoicing became law from January 2026, but the rollout is staged:
- **Large taxpayers (> ₦5B turnover):** Mandatory since November 2025
- **Upper medium (₦1B–₦5B):** Mandatory July 2026
- **Lower medium (₦100M–₦1B):** Mandatory July 2027
- **Small businesses (< ₦100M):** Required from 2028

For the vast majority of small businesses and freelancers, there is no immediate action required — but transitioning to digital invoicing now is the smart move. See our [full e-invoicing guide](https://invoicegenerator.ng/blog/nigeria-e-invoicing-2026-small-business-freelancer-guide) for details.

---

## 6. Company Income Tax Changes for Small Businesses

Under the NTA 2025:
- **Zero CIT** for companies with annual turnover below ₦50 million
- **15% CIT** for companies with turnover between ₦50M and ₦100M (previously 20%)
- **30% CIT** for companies with turnover above ₦100M (unchanged)

This means the smallest businesses pay **no federal income tax at all** — a major change from the previous 20% minimum rate.

---

## 7. Personal Income Tax: Relief for Low Earners

For sole proprietors and individuals:
- Minimum wage (₦70,000/month) earners are now **fully exempt** from personal income tax
- Consolidated relief allowance increased — more of your income is shielded from tax
- Tax residency rules clarified for remote workers and diaspora earners

---

## 8. What You Should Do Right Now

**✅ Step 1: Verify your TIN**
Visit [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng) and download your certificate. Share it with all regular clients who deduct WHT.

**✅ Step 2: Review your VAT status**
Are you below the new ₦50M threshold? Consider whether to deregister or maintain registration for commercial reasons.

**✅ Step 3: Update your invoices**
Make sure your TIN appears on every invoice. If you are VAT-registered, ensure the 7.5% is clearly itemised and your VAT registration number is included.

**✅ Step 4: Switch to digital invoicing**
[InvoiceGenerator.ng](https://invoicegenerator.ng) automates VAT calculations, stores your TIN, and generates audit-ready PDFs for free.

**✅ Step 5: File monthly if VAT-registered**
VAT returns are due by the 21st of each month via TaxPro Max. Missing even one filing incurs a ₦50,000 penalty.

---

## The Bottom Line

The NTA 2025 is broadly positive for small businesses:
- Higher VAT threshold means fewer small businesses bear the compliance burden
- Lower WHT on professional services improves cash flow for freelancers
- Zero CIT for sub-₦50M businesses eliminates federal income tax entirely
- E-invoicing is real but not yet a small business concern

The era of "I don't know what taxes I owe" is over. The NRS is modernising its systems and enforcement. Getting your records, TIN, and invoicing sorted now costs nothing — and saves you from penalties later.

---

*Sources: Nigeria Tax Act 2025 (NTAA 2025); NRS official guidelines; PwC Nigeria Tax Reform Analysis 2026; Kuda Business Tax Guide 2026.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 4: Receipt Generator
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Free Online Receipt Generator Nigeria: Create Professional Receipts in Seconds',
    slug: 'free-receipt-generator-nigeria-create-receipts-online',
    excerpt: 'Need to issue a professional receipt in Nigeria? Our free online receipt generator creates FIRS-accepted digital receipts in Naira instantly — no app to download, no sign-up required. Send via WhatsApp, email, or PDF.',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Free Online Receipt Generator Nigeria: Create Professional Receipts in Seconds

Whether you run a market stall in Lagos, a consulting practice in Abuja, or an online business serving clients across Nigeria, one question comes up constantly from customers: **"Can you send me a receipt?"**

A proper receipt — not a WhatsApp message saying "paid received" — protects your business, satisfies FIRS requirements, and builds the kind of professional credibility that earns repeat clients.

This guide explains the difference between an invoice and a receipt, what a valid Nigerian receipt must contain, and how to generate one for free in under 60 seconds.

---

## Invoice vs Receipt: The Key Difference

Before generating your receipt, it helps to understand when to use each:

| Document | When to Issue | Purpose |
|---|---|---|
| **Invoice** | Before payment — as a payment request | Tells the client what they owe and when |
| **Receipt** | After payment is received | Confirms payment was made |

**Common mistake:** Many Nigerian business owners issue an invoice and never send a receipt. Both documents are important — the invoice creates a payment obligation; the receipt closes it.

---

## Is a Digital Receipt Valid in Nigeria?

Yes. The FIRS — now the Nigeria Revenue Service (NRS) — accepts **digital receipts as valid proof of payment**, provided they contain the required information. There is no legal requirement for a paper receipt for most commercial transactions.

A digital receipt sent via WhatsApp, email, or PDF is fully valid for:
- Client records
- FIRS audit purposes
- Expense claim documentation
- VAT input credit claims (if issued as a Tax Receipt with your VAT number)

---

## What Must a Valid Nigerian Receipt Include?

A proper receipt for a Nigerian business must contain:

1. **"RECEIPT" or "PAYMENT RECEIPT"** as the document title
2. **Unique Receipt Number** (sequential, e.g., REC-001)
3. **Receipt Date** — the date payment was received
4. **Your Business Name, Address, and Contact Details**
5. **Your TIN** (required for businesses above ₦50M turnover or VAT-registered)
6. **Client Name** and contact details
7. **Description of goods/services paid for**
8. **Amount paid** clearly stated in ₦ Naira
9. **Payment Method** (bank transfer, cash, card, POS)
10. **VAT breakdown** (if applicable — 7.5% shown separately)
11. **Reference number** (bank transfer reference or POS transaction code)
12. **"PAID IN FULL"** or the specific amount paid if partial

---

## How to Generate a Free Receipt on InvoiceGenerator.ng

[InvoiceGenerator.ng](https://invoicegenerator.ng) lets you create a professional payment receipt in Naira for free — no account required, no downloads.

**Step 1:** Go to [invoicegenerator.ng/free-invoice-generator-nigeria](https://invoicegenerator.ng/free-invoice-generator-nigeria)

**Step 2:** Change the document type to "Receipt" using the document selector at the top

**Step 3:** Fill in your business details — or load them from your saved company profile if you have an account

**Step 4:** Enter the client's name and the payment details:
- Date payment was received
- Description of what was paid for
- Amount received in ₦
- Payment method (transfer, cash, POS)
- Bank transfer reference number (if applicable)

**Step 5:** Add your 7.5% VAT breakdown if you are VAT-registered

**Step 6:** Download as PDF or share directly via WhatsApp

The whole process takes under 60 seconds.

---

## Receipt for Different Types of Nigerian Businesses

### For Freelancers and Consultants
After a client pays your invoice, issue a receipt confirming the payment. Reference the original invoice number: *"Receipt for payment of Invoice INV-2026-047."* This closes the transaction cleanly in your records.

### For Retail and Product Businesses
Issue a receipt at point of sale for every transaction, especially for POS or cash sales. Include the item descriptions and unit prices. This is your primary protection in case of refund or warranty disputes.

### For Service Businesses (Salons, Repairs, Events)
A receipt confirms the service was rendered and paid for. For large deposits (like event bookings), issue a **Deposit Receipt** stating: *"₦150,000 received as 50% deposit. Balance of ₦150,000 due on date of event."*

### For Landlords
A **Rent Receipt** should include: the property address, the rental period covered (e.g., January–December 2026), the tenant's name, and the amount paid. Store copies for LIRS tax filings.

---

## VAT Receipt vs Standard Receipt

If your business is VAT-registered (annual turnover above ₦50 million), your receipt must also function as a **Tax Receipt**, showing:

- Your VAT Registration Number
- The subtotal before VAT
- The 7.5% VAT amount
- The total amount including VAT

This is important because your client needs this information to reclaim input VAT on their own tax filings.

---

## Sending Receipts via WhatsApp: The Nigerian Way

Most Nigerian businesses share receipts over WhatsApp — and that is completely valid. Best practice:

1. Generate the receipt as a PDF
2. Name it clearly: **Receipt-REC-001-ClientName.pdf**
3. Send via WhatsApp (not just as a photo — send as a document for better readability)
4. Keep a copy in your own records (download to Google Drive or your email)

[InvoiceGenerator.ng](https://invoicegenerator.ng) has a one-click WhatsApp sharing button that formats and shares your receipt directly.

---

## Common Receipt Mistakes to Avoid

❌ **Saying "payment received" in a WhatsApp chat without a formal document** — not professional, creates disputes
❌ **Issuing a receipt without a receipt number** — makes record-keeping impossible
❌ **Forgetting to include your TIN on large-value receipts** — may cause issues at audit
❌ **Writing amounts in words only without figures** — always include the numeric amount in ₦
❌ **Not specifying what the payment was for** — "₦200,000 received" is useless; "₦200,000 received for website redesign project (March 2026)" is not

---

## Frequently Asked Questions

**Can I use the same tool for both invoices and receipts?**
Yes. [InvoiceGenerator.ng](https://invoicegenerator.ng) creates both invoices and payment receipts from the same platform.

**Is a handwritten receipt still valid in Nigeria?**
Yes, for informal transactions. But for anything above ₦50,000, a printed or digital receipt provides far better protection.

**Do I need to issue a receipt for every transaction?**
For VAT-registered businesses, yes — for every taxable supply. For non-VAT businesses, it is best practice even if not legally required.

**What if a client loses their receipt?**
With a digital system, you can regenerate and resend any receipt at any time. [Create a free account](https://invoicegenerator.ng) to store all your receipt history.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 5: Sole Trader Invoice
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Sole Trader Invoice Nigeria: The 2026 Complete Guide + Free Template',
    slug: 'sole-trader-invoice-nigeria-2026-complete-guide-template',
    excerpt: 'Everything a Nigerian sole trader needs to know about issuing invoices in 2026 — from whether you need CAC registration to what a legal invoice must include, plus a free downloadable Naira template.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Sole Trader Invoice Nigeria: The 2026 Complete Guide + Free Template

As a sole trader in Nigeria — whether you are a freelance graphic designer in Port Harcourt, an independent accountant in Abuja, or a one-person IT consultant in Lagos — invoicing is how you get paid. Yet many sole traders either skip formal invoices entirely or use informal alternatives that create real problems when dealing with corporate clients or in FIRS audits.

This guide answers every question a Nigerian sole trader has about invoicing in 2026.

---

## Do You Need to Be CAC-Registered to Issue an Invoice?

**No.** You do not need a Certificate of Incorporation or a Business Name registration to issue a valid invoice in Nigeria. You can invoice as an individual under your personal name.

However, there are strong commercial reasons to register your business name with the CAC:
- Corporate clients often require a registered business name before they will raise a purchase order
- A registered business name lets you open a **dedicated business bank account** — which makes your invoices look more professional ("Pay to: TechPros Solutions" vs "Pay to: John Adeyemi")
- Business Name registration with CAC costs ₦10,000–₦15,000 and can be done online at [pre.cac.gov.ng](https://pre.cac.gov.ng)

---

## Do Sole Traders in Nigeria Need to Register for VAT?

Under the **Nigeria Tax Act 2025**, VAT registration is only mandatory if your annual turnover exceeds **₦50 million**. Most sole traders operate well below this threshold and are therefore **not required to charge VAT**.

If you choose to register voluntarily (because your corporate clients want VAT invoices to claim input credit), you must then file monthly VAT returns and remit 7.5% of your taxable turnover to the NRS by the 21st of each month.

**Practical advice:** Register voluntarily only if the majority of your clients are large companies or government agencies. The filing obligation is significant for a one-person business.

---

## What Must a Sole Trader Invoice Include in Nigeria?

A legally valid and professionally presentable invoice for a Nigerian sole trader should include:

### Mandatory Fields
1. **Document title:** "INVOICE" (or "TAX INVOICE" if VAT-registered)
2. **Invoice Number:** Sequential and unique (e.g., INV-2026-001)
3. **Invoice Date:** When the invoice is issued
4. **Due Date:** When payment is expected (e.g., "Payment due within 14 days")
5. **Your Full Name** (and business name if registered)
6. **Your Address and Contact Details** (phone, email)
7. **Your TIN** — strongly recommended; required for VAT invoices and large transactions
8. **Client Name and Address**
9. **Description of Services/Goods** — be specific
10. **Quantity and Unit Rate** for each line item
11. **Subtotal**
12. **VAT (7.5%)** — only if VAT-registered
13. **Total Amount Due in ₦**
14. **Payment Details:** Bank name, account name, and 10-digit NUBAN account number

### Strongly Recommended
- Your logo (even a simple text logo improves perception)
- Payment terms (e.g., "Late payment incurs 2% per month after due date")
- Purchase Order number (if the client issued one)

---

## How to Number Your Invoices as a Sole Trader

Many sole traders ask what invoice numbering system to use. Here are three popular formats:

| Format | Example | Best For |
|---|---|---|
| Simple sequential | INV-001, INV-002 | Just starting out |
| Year-based | INV-2026-001 | Makes audits easier — year is clear |
| Client-based | DANGOTE-001, MTN-002 | If you have few regular clients |

**Important:** Once you pick a format, **never restart the sequence**. Gaps in invoice numbers (e.g., jumping from 015 to 020) can trigger FIRS audit queries. If you void an invoice, note it as "VOID" rather than deleting it.

---

## Sample Sole Trader Invoice (Nigeria)

Here is what a proper sole trader invoice looks like:

---
**INVOICE**

**From:**
Amara Okafor Creative Studio
14 Adeola Odeku Street, Victoria Island, Lagos
Phone: +234 803 456 7890 | Email: amara@amaracreative.com
TIN: 12345678-0001

**To:**
Zenith Bank PLC — Marketing Department
Plot 84, Ajose Adeogun Street, Victoria Island, Lagos

**Invoice No:** INV-2026-028
**Invoice Date:** 15 May 2026
**Due Date:** 29 May 2026 (Net 14)

| Description | Qty | Rate (₦) | Amount (₦) |
|---|---|---|---|
| Brand Identity Design — Full Rebrand | 1 | 350,000 | 350,000 |
| Social Media Templates (10 designs) | 1 | 80,000 | 80,000 |
| Business Card Design | 500 | 150 | 75,000 |

**Subtotal:** ₦505,000
**Total Due:** ₦505,000

**Payment:**
Bank: Access Bank
Account Name: Amara Okafor
Account Number: 0123456789

*Payment terms: Due within 14 days. Late payments attract 2% per month.*

---

## Generating Your Invoice for Free

Rather than building this template manually every time, [InvoiceGenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria) lets you fill in your details once, add your logo, and generate a professional PDF in under two minutes — at no cost.

Features that sole traders specifically find useful:
- **Save your company details** — your name, address, and bank details auto-fill on every new invoice
- **AI invoice generation** — describe the project in plain English and the AI fills the form
- **WhatsApp sharing** — send the PDF directly from the tool to your client's chat
- **Recurring invoices** — set up monthly retainer invoices that send automatically

[Create your free sole trader invoice now →](https://invoicegenerator.ng/free-invoice-generator-nigeria)

---

## Payment Terms for Sole Traders

The most common payment terms used by Nigerian sole traders:

- **Due on receipt** — payment expected immediately. Use for small transactions.
- **Net 7** — payment due within 7 days. Good for short-turnaround work.
- **Net 14** — standard for most Nigerian freelancers.
- **Net 30** — standard for corporate clients with formal PO processes.
- **50% upfront, 50% on delivery** — recommended for projects above ₦500,000.

**Late payment clause:** Add a late payment penalty to your invoices: *"Invoices unpaid after the due date attract a 2% monthly fee on the outstanding balance."* Even if you never enforce it, it encourages prompt payment.

---

## Do Sole Traders in Nigeria Pay Income Tax?

Yes, sole traders pay **Personal Income Tax (PIT)** at state level (managed by your State Internal Revenue Service). Federal income tax (CIT) is only for incorporated companies.

Under the NTA 2025:
- Monthly earnings up to ₦70,000 (the new minimum wage) are fully exempt
- Relief allowances reduce your taxable income further
- Tax rates are graduated from 7% to 24% on income above thresholds

File your annual PIT return by March 31 each year with your state IRS (e.g., LIRS in Lagos, AIRS in Abuja).

---

## Sole Trader Invoice Checklist

Before sending any invoice, run through this list:

- [ ] Invoice number included and sequential?
- [ ] Invoice date and due date both specified?
- [ ] Your full name/business name and address correct?
- [ ] TIN included (especially for corporate clients)?
- [ ] Client name and address correct?
- [ ] Service descriptions are specific (not just "work done")?
- [ ] Naira amounts clearly formatted (₦)?
- [ ] Bank details complete (name, account number, bank)?
- [ ] VAT shown separately if you are VAT-registered?
- [ ] Payment terms stated?

All ten ticked? Hit send.`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 6: Withholding Tax
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Withholding Tax on Invoices Nigeria: A Freelancer and Contractor Guide (2026)',
    slug: 'withholding-tax-invoices-nigeria-freelancer-contractor-guide-2026',
    excerpt: 'Why do corporate clients deduct money from your invoice? This guide explains Withholding Tax (WHT) for Nigerian freelancers and contractors — new 2026 rates, the ₦2M exemption, how to claim your credit, and how to invoice to minimise deductions.',
    coverImage: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Withholding Tax on Invoices Nigeria: A Freelancer and Contractor Guide (2026)

You invoice a corporate client ₦500,000. They pay ₦450,000. You ask why, and they say "WHT" — and you are left confused about what just happened to ₦50,000 of your money.

Withholding Tax is one of the most misunderstood aspects of doing business as a Nigerian freelancer or contractor. This guide explains exactly what it is, what changed in 2026, and crucially — how to minimise how much gets deducted from your invoices.

---

## What Is Withholding Tax (WHT)?

Withholding Tax is a **tax collected at source** — the paying company deducts a percentage of your invoice before paying you and remits it directly to the NRS (formerly FIRS) on your behalf.

Think of it as a prepaid income tax. The amount deducted is not lost — it becomes a **tax credit** you can use to reduce your final tax bill when you file your annual return.

**Who deducts it:** Corporate clients — registered companies, government agencies, banks, and large organisations — are required by law to deduct WHT from certain payments.

**Who does not deduct it:** Individual clients and businesses below the VAT threshold typically do not deduct WHT (and are not required to).

---

## 2026 WHT Rates Under the Nigeria Tax Act 2025

The NTA 2025 revised several rates. Here is what applies to common freelance and contractor scenarios:

| Payment Type | WHT Rate (2026) |
|---|---|
| Professional services (consulting, legal, accounting, IT) | 5% |
| Management and technical services | 5% |
| Construction and building contracts | 2.5% |
| Supply of goods (above ₦10,000) | 2.5% |
| Rent / Lease payments | 10% |
| Dividends | 10% |
| Interest / Loan repayments | 10% |
| Commissions | 5% |

**Key change from previous law:** Professional services WHT dropped from 10% to 5%. Construction contracts dropped from 5% to 2.5%. This is a significant improvement in cash flow for affected freelancers.

---

## The ₦2 Million Exemption (New for 2026)

This is the biggest WHT change for small businesses and freelancers:

**If you have a valid TIN and the transaction value is ₦2 million or less in any calendar month, the client is NOT required to deduct WHT.**

This means:
- A designer invoicing ₦800,000 to a corporate client → **No WHT** (if TIN is provided)
- A consultant invoicing ₦1.5 million → **No WHT** (if TIN is provided)
- A developer invoicing ₦3 million → WHT applies (above the ₦2M threshold)

**The catch:** You must have a valid, verifiable TIN. The client will ask for it before processing payment without WHT.

Get your TIN at [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng) — free and takes minutes if you have a CAC-registered business.

---

## How WHT Appears on Your Invoice

When issuing an invoice to a WHT-deducting client, you have two options:

### Option 1: Invoice at your full rate, note WHT in the footer
Most freelancers invoice the full amount and note in the footer:

*"NRS Withholding Tax (5%) may be deducted. Please provide WHT credit note upon remittance."*

The client pays you ₦475,000 (on a ₦500,000 invoice) and issues you a **WHT Credit Note** for ₦25,000.

### Option 2: Gross up your invoice to account for WHT
Some experienced freelancers increase their quoted rate so that after WHT, they receive their target amount.

Formula: **Invoice Amount = Target Amount ÷ (1 - WHT Rate)**

Example: To receive ₦500,000 net after 5% WHT:
₦500,000 ÷ 0.95 = **Invoice ₦526,316**
WHT deducted: ₦26,316
Net received: ₦500,000 ✓

---

## How to Claim Your WHT as a Tax Credit

The WHT deducted from your invoices is not gone — it is waiting for you as a credit when you file your annual tax return.

### Step 1: Collect WHT Credit Notes Promptly
After each payment with WHT deducted, request the **WHT Credit Note** from your client immediately. Do not wait until year-end — some corporate accounts teams lose or delay them.

A WHT Credit Note must show:
- Your name and TIN
- The contract/invoice reference
- The gross amount
- The WHT rate and amount deducted
- The NRS e-remittance receipt number (proof they actually paid the NRS)

### Step 2: Verify the Remittance
You can verify that your client actually remitted your WHT to the NRS via the TaxPro Max portal. Enter the remittance receipt number from the WHT Credit Note to confirm it was filed.

### Step 3: Use the Credit Notes at Filing
When filing your annual tax return (Personal Income Tax for individuals/sole traders, or CIT for companies), your total WHT credits reduce the tax you owe.

**Example:**
- Annual profit: ₦3,000,000
- Estimated tax due: ₦450,000
- Total WHT credits collected: ₦250,000
- **Tax payable: ₦200,000**

---

## WHT on Construction Contracts: A Practical Example

You are a building contractor in Abuja. A real estate company gives you a ₦5,000,000 renovation contract.

Under the NTA 2025:
- WHT rate for construction: **2.5%** (down from 5%)
- WHT deducted: ₦125,000 (down from ₦250,000 under the old law)
- You receive: ₦4,875,000

The ₦125,000 is a tax credit you can offset against your corporate income tax. The savings versus the old rate: ₦125,000 more in your pocket on this one contract.

---

## Including Your TIN on Every Invoice: The Most Important Step

The single most important thing you can do to protect your WHT position is to include your **TIN on every invoice** to corporate clients. This:

1. Qualifies you for the ₦2M monthly exemption
2. Ensures WHT credits are filed under your name (not "unknown supplier")
3. Reduces client hesitancy to process your payments

[InvoiceGenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria) lets you save your TIN in your company profile so it auto-prints on every invoice. [Set it up here](https://invoicegenerator.ng/free-invoice-generator-nigeria) — free, takes two minutes.

---

## WHT: What to Do If a Client Refuses to Give You a Credit Note

This is unfortunately common. Steps to take:

1. **Write formally:** Send a written request via email referencing the invoice number and payment date
2. **Escalate within their accounts:** Request to speak with the Head of Finance
3. **Request the remittance receipt directly:** Ask them to forward the NRS remittance receipt so you can verify it yourself
4. **File a complaint with the NRS:** If a client deducts WHT but does not remit it to the NRS (a surprisingly common fraud), you can report this at nrs.gov.ng

---

## Summary: 2026 WHT Checklist for Freelancers

- [ ] Get and share your TIN with all corporate clients
- [ ] Invoice amounts below ₦2M/month? Request WHT-free payment (with TIN)
- [ ] Note on all invoices: "WHT credit note required upon payment"
- [ ] Collect WHT credit notes within 2 weeks of each payment
- [ ] Verify remittances on TaxPro Max
- [ ] Include all WHT credits in your annual tax return filing

---

*Sources: Nigeria Tax Act 2025 (NTAA 2025); NRS Withholding Tax guidance; PWC Nigeria WHT rate schedule 2026; KeepAm Nigeria WHT guide.*`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 7: Invoice Templates
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Free Invoice Templates Nigeria: Download for Word, Excel, and PDF (2026)',
    slug: 'free-invoice-templates-nigeria-word-excel-pdf-download-2026',
    excerpt: 'Download free Nigerian invoice templates for Microsoft Word, Excel, and PDF. All templates include Naira (₦) formatting, 7.5% VAT fields, TIN, and bank details — FIRS compliant and ready to use in 2026.',
    coverImage: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Free Invoice Templates Nigeria: Download for Word, Excel, and PDF (2026)

Searching for a Nigerian invoice template that actually works — one with Naira (₦) formatting, space for your TIN, the 7.5% VAT field, and Nigerian bank details? This guide covers exactly what to include and where to get the best free templates for Word, Excel, and PDF.

---

## Why Most Generic Invoice Templates Fail Nigerian Businesses

Templates downloaded from international sites often:
- Use dollar ($) or pound (£) signs instead of ₦
- Have no field for TIN (Tax Identification Number)
- Lack a VAT line using the Nigerian 7.5% rate
- Show "Sort Code + Account Number" instead of NUBAN account format
- Use unfamiliar date formats (MM/DD/YYYY vs DD/MM/YYYY)

A proper Nigerian invoice template must be built with local compliance in mind.

---

## What Every Nigerian Invoice Template Must Include

### Mandatory Elements

| Field | Notes |
|---|---|
| Document Title | "INVOICE" or "TAX INVOICE" (if VAT-registered) |
| Invoice Number | Sequential: INV-2026-001 |
| Invoice Date | DD/MM/YYYY format |
| Due Date | e.g., "14 days from invoice date" |
| Seller Name & Address | Your business name, address, phone, email |
| TIN | 14-digit NRS Tax Identification Number |
| Buyer Name & Address | Client/company billing details |
| Line Items | Description, quantity, unit rate, amount |
| Subtotal | Sum of all line items |
| VAT (7.5%) | Only if VAT-registered — shown separately |
| Total | Grand total in ₦ |
| Bank Details | Bank name, account name, 10-digit NUBAN number |

### Recommended Additions
- Logo
- Payment terms
- Purchase Order reference
- Late payment policy
- Notes field for project references

---

## Template Types: Which Do You Need?

### Standard Service Invoice
**Best for:** Consultants, designers, developers, lawyers, accountants
Includes: single rate per service line, total in ₦, bank transfer details

### Product / Goods Invoice
**Best for:** Suppliers, manufacturers, retailers
Includes: unit price × quantity per line, delivery address field, goods description

### VAT Tax Invoice
**Best for:** VAT-registered businesses
Includes: VAT Registration Number, subtotal, 7.5% VAT, gross total — mandatory for claiming input VAT

### Proforma Invoice
**Best for:** Providing quotes before work begins, import/export
Includes: "PROFORMA INVOICE" header, validity period, estimated delivery date

### Recurring Invoice
**Best for:** Retainer clients, subscription services, monthly maintenance
Includes: billing period, recurring amount, cumulative billing to date

### Contractor Invoice
**Best for:** Construction, IT projects, event management
Includes: project name, phase/milestone, materials breakdown, WHT note

---

## Free Nigerian Invoice Templates: Where to Get Them

### Option 1: InvoiceGenerator.ng (Best Option — No Downloads Needed)

Rather than maintaining a static template, [InvoiceGenerator.ng](https://invoicegenerator.ng) gives you a live, browser-based invoice generator that:
- Handles all Naira formatting automatically
- Calculates 7.5% VAT with one toggle
- Stores your TIN and bank details permanently
- Generates a professional PDF instantly
- Shares via WhatsApp in one click

This is better than a template because it never has calculation errors and updates with new compliance requirements automatically. [Start creating here — free, no account needed](https://invoicegenerator.ng/free-invoice-generator-nigeria).

### Option 2: Microsoft Word Template

A Word template gives you full formatting control. Key tips for setting up a Nigerian Word invoice template:

1. **Currency:** Set the currency symbol to ₦ (type ₦ or use Insert → Symbol → Unicode 20A6)
2. **Date format:** Use DD/MM/YYYY throughout
3. **Calculations:** Word does not calculate totals — use formula fields (Insert → Quick Parts → Field → =(formula)) or accept that you will calculate manually
4. **Save as .dotx:** Save your finished template as a Word Template file so a new blank copy opens each time

Word templates are available from invoice.ng and proinvoice.co — search "Nigerian invoice template Word download."

### Option 3: Microsoft Excel Template

Excel is popular for Nigerian product sellers because it handles calculations automatically. To set up a Nigerian Excel invoice template:

1. **Format currency cells:** Select amount cells → Format Cells → Currency → ₦ symbol → 2 decimal places
2. **Auto-total formula:** In the Total cell, enter `=SUM(D10:D20)` (adjust range for your line items)
3. **VAT formula:** `=B_subtotal_cell * 0.075` for the 7.5% VAT cell
4. **Grand total:** `=subtotal + vat - discount + shipping`
5. **Invoice number auto-increment:** Use `=TEXT(ROW()-9,"INV-2026-000")` to generate sequential numbers

Save as an Excel Template (.xltx) and share with colleagues.

### Option 4: PDF Template

PDF templates are ideal for filling in and sending without risk of the recipient accidentally editing your figures. Use:
- **Adobe Acrobat** (paid) for fillable PDF templates
- **Canva.com** — search "Nigeria invoice" for free editable templates you can save as PDF
- **InvoiceGenerator.ng** — generates a download-ready PDF directly

---

## Free Invoice Template Download: Google Docs Version

If you prefer Google Docs (ideal for remote collaboration and online access from any device):

1. Go to Google Docs → Template Gallery
2. Search "invoice"
3. Choose a clean template and customise:
   - Change $ to ₦
   - Add a TIN row under your business name
   - Add a VAT (7.5%) row in the totals section
   - Replace "Sort Code / Account Number" with your NUBAN details
4. Save to Google Drive and duplicate for each new invoice

---

## Template Naming and Filing Best Practice

Whether you use Word, Excel, or PDF, adopt a consistent filing system:

```
Invoices/
  2026/
    Clients/
      ClientName-INV-2026-001.pdf
      ClientName-INV-2026-002.pdf
    Templates/
      Nigerian-Invoice-Template-2026.docx
      Nigerian-VAT-Invoice-Template-2026.xlsx
```

Keep templates in a separate "Templates" folder so they are never accidentally edited.

---

## Beyond Templates: When to Switch to a Proper Invoicing Tool

Templates are fine when you have fewer than 10 clients. Once you are beyond that:

- **Tracking which invoices are unpaid** becomes impossible with file-based templates
- **Sending reminders** must be done manually
- **Tax reports** (required for annual filing) require manually adding up every invoice

[InvoiceGenerator.ng](https://invoicegenerator.ng) solves all three — it tracks payment status, sends automated reminders, and generates monthly revenue summaries automatically. The free plan handles most freelancer and small business needs. [Sign up free here](https://invoicegenerator.ng).`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 8: Proforma Invoice
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Proforma Invoice in Nigeria: What It Is, When to Use It, and How to Create One',
    slug: 'proforma-invoice-nigeria-what-is-when-to-use-how-to-create',
    excerpt: 'A proforma invoice is not a payment request — but it is essential for Nigerian businesses doing import/export, large contracts, and formal quoting. Learn what a proforma invoice is, when to use it, and how to create one free.',
    coverImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Proforma Invoice in Nigeria: What It Is, When to Use It, and How to Create One

Many Nigerian business owners confuse a proforma invoice with a standard invoice. They look similar — but they serve completely different purposes, carry different legal weight, and are used at different stages of a transaction.

This guide explains exactly what a proforma invoice is, when Nigerian businesses use them (including the import/export context), and how to create one in minutes.

---

## What Is a Proforma Invoice?

A **proforma invoice** is a preliminary document issued before a transaction is completed. It provides the buyer with an advance estimate or confirmation of the cost, quantity, and terms of a proposed sale — but it is **not a demand for payment and has no accounting value**.

Key characteristics:
- **Not a tax document** — no VAT is applied (it is not a final sale)
- **Not a legal payment obligation** — the buyer has not yet committed to pay
- **Subject to change** — prices may be adjusted in the final invoice
- **Has an expiry** — typically valid for 30–90 days

The simplest way to remember it: a proforma invoice is a **formal, detailed price quote**.

---

## Proforma Invoice vs Standard Invoice vs Quotation

| Aspect | Quotation | Proforma Invoice | Standard Invoice |
|---|---|---|---|
| Stage | Pre-sale discussion | Before confirmed order | After sale/delivery |
| Legal obligation | None | None | Yes — buyer must pay |
| VAT applied | No | No | Yes (if VAT-registered) |
| Accounting entry | No | No | Yes |
| Common format | Email / informal | Formal document | Formal document |

A proforma invoice is more formal than a quotation but less legally binding than a standard invoice.

---

## When Do Nigerian Businesses Use Proforma Invoices?

### 1. Import and Export (Most Common Nigerian Use Case)
In Nigerian import/export trade, the proforma invoice is essential:

- **Form M application:** A Nigerian importer must submit a proforma invoice to their bank to apply for a Form M (import licence). Without it, the Form M process cannot begin.
- **Pre-shipment customs:** Nigerian Customs Service (NCS) uses the proforma invoice to pre-calculate import duties before goods arrive.
- **Letter of Credit (LC):** Banks issuing Letters of Credit require a proforma invoice to understand the transaction before committing funds.

### 2. Large Project Contracts (Services)
Before a construction company, IT firm, or events company begins a ₦5M+ project, they typically issue a proforma invoice so the client can:
- Get internal budget approval
- Raise a purchase order against a specific document
- Remit an upfront deposit in advance of the final invoice

### 3. Government and NGO Procurement
Government agencies and NGOs require a formal proforma invoice before raising a Local Purchase Order (LPO). Many small businesses lose government contracts because they send informal quotes via WhatsApp instead of a proper proforma invoice.

### 4. International Payments (Forex Transactions)
Nigerian businesses billing international clients often use a proforma invoice first to lock in the Naira/USD exchange rate at the time of quoting. The final invoice confirms the actual rate.

### 5. New Supplier Relationships
When approaching a new corporate client for the first time, a proforma invoice demonstrates professionalism and gives their procurement team something formal to file for vendor onboarding.

---

## What Must a Nigerian Proforma Invoice Include?

A proforma invoice should contain essentially the same information as a standard invoice, with two key differences:

1. **The header must say "PROFORMA INVOICE"** — never just "Invoice"
2. **It must show an expiry or validity date** — e.g., "This proforma is valid for 30 days from the date of issue"

### Required Fields

- "PROFORMA INVOICE" as the document title
- Proforma Invoice Number (e.g., PI-2026-001)
- Date of issue
- Validity / expiry date
- Your company name, address, TIN
- Client name and address
- Detailed line items (description, quantity, unit price, total)
- Subtotal
- Estimated delivery date or completion timeframe
- Payment terms (percentage deposit, balance on delivery, etc.)
- Estimated shipping/freight costs (for goods)
- HS Code (for import/export transactions)
- Currency (₦ or foreign currency)
- Total estimated value

### What to Exclude
- VAT (this is not a tax invoice — no VAT should appear)
- "TAX INVOICE" wording
- Any language implying this is a demand for payment

---

## Sample Proforma Invoice (Nigeria)

---
**PROFORMA INVOICE**

**Issued by:**
BuildRight Construction Ltd
15 Adetokunbo Ademola Street, Victoria Island, Lagos
TIN: 98765432-0001 | Email: accounts@buildright.com.ng

**Issued to:**
Stallion Group — Projects Division
42 Marina Street, Lagos Island, Lagos

**PI Number:** PI-2026-015
**Date of Issue:** 15 May 2026
**Valid Until:** 14 June 2026 (30 days)

**Subject:** Proposed Office Renovation — Floors 3 & 4

| Description | Qty | Unit Price (₦) | Total (₦) |
|---|---|---|---|
| Electrical rewiring — full floor | 2 floors | 750,000 | 1,500,000 |
| Ceiling board installation | 400 sqm | 4,500 | 1,800,000 |
| Painting — wall and ceiling | 400 sqm | 1,800 | 720,000 |
| Tiling — executive offices | 200 sqm | 8,500 | 1,700,000 |
| Plumbing fixtures (bathrooms) | 4 units | 180,000 | 720,000 |
| Project management fee | 1 | 300,000 | 300,000 |

**Estimated Total:** ₦6,740,000

**Payment Terms:**
- 40% deposit required to mobilise: ₦2,696,000
- 40% at mid-point (structural completion): ₦2,696,000
- 20% on final handover: ₦1,348,000

**Estimated Project Duration:** 8 weeks from mobilisation
**Validity:** This proforma is valid for 30 days. Prices may change after expiry.

*This is a proforma invoice only. No VAT is applicable at this stage. A formal tax invoice will be issued upon contract execution.*

---

## How to Create a Proforma Invoice for Free

[InvoiceGenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria) lets you create a proforma invoice by selecting the "Proforma Invoice" document type from the selector at the top of the form. Your line items, company details, and Naira formatting all carry over — you simply change the title and add the validity date.

The output is a clean, professional PDF you can email or share via WhatsApp. [Create your proforma invoice here →](https://invoicegenerator.ng/free-invoice-generator-nigeria)

---

## Converting a Proforma Invoice to a Final Invoice

When the client confirms the order and work begins:

1. Create a new standard invoice referencing the proforma: *"As per Proforma Invoice PI-2026-015"*
2. Adjust any line items that changed during execution
3. Apply VAT if applicable (7.5% for VAT-registered businesses)
4. Send as the official payment demand

Keep the proforma invoice on file alongside the final invoice — auditors and clients may request to see both.

---

## Key Takeaways

- A proforma invoice is a **formal price estimate**, not a payment demand
- It is **essential for import/export, government procurement, and large contracts** in Nigeria
- It must say **"PROFORMA INVOICE"** and include a **validity date**
- No VAT is applied until the final invoice
- Convert it to a standard invoice once the client confirms the order`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 9: Invoice vs Receipt
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Invoice vs Receipt: Key Differences Every Nigerian Business Must Know',
    slug: 'invoice-vs-receipt-difference-nigeria-when-to-use',
    excerpt: 'Invoice or receipt — which do you issue and when? This guide explains the key differences between an invoice and a receipt for Nigerian businesses, with practical examples and FIRS compliance notes.',
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Invoice vs Receipt: Key Differences Every Nigerian Business Must Know

"Please send your invoice." "Can I get a receipt?" Two documents — and many Nigerian business owners treat them as the same thing. They are not. Using the wrong document at the wrong time creates confusion, delays payment, and can cause headaches during a FIRS audit.

This guide settles the invoice vs receipt question once and for all.

---

## The One-Sentence Difference

**An invoice is a payment request.** A receipt is a payment confirmation.

That is the core distinction. Everything else follows from it.

---

## Side-by-Side Comparison

| Feature | Invoice | Receipt |
|---|---|---|
| **When issued** | Before or at time of payment request | After payment is received |
| **Purpose** | To request payment | To confirm payment was made |
| **Legal status** | Creates a payment obligation | Closes the payment obligation |
| **Payment status** | Outstanding (owed) | Settled (paid) |
| **Who issues it** | The seller/service provider | The seller (confirming receipt) |
| **Accounting entry** | Accounts Receivable (you are owed money) | Cash/Bank (money received) |
| **FIRS relevance** | Required for VAT purposes on taxable supplies | Required as proof of transaction |
| **Contents** | Invoice number, due date, payment instructions | Receipt number, payment method, reference |

---

## When to Issue an Invoice

Issue an invoice when:

### 1. You Have Completed a Service or Delivered Goods
The most common scenario. You finish a project for a client and issue an invoice to request payment. The invoice tells the client:
- Exactly what you delivered
- How much they owe
- When they need to pay (due date)
- Where to pay (your bank details)

### 2. For Recurring / Retainer Work
Monthly invoices for retained clients go out at the start or end of each month. Use recurring invoice features to automate this.

### 3. For Milestone Payments
On large projects, you invoice at agreed milestones (e.g., 30% on project start, 40% at mid-point, 30% on delivery). Each milestone gets its own invoice.

### 4. When Requesting a Deposit
Issue an invoice for the deposit amount before work begins. Label it clearly: *"Deposit Invoice — 50% advance payment required to commence work."*

---

## When to Issue a Receipt

Issue a receipt when:

### 1. After a Client Pays Your Invoice
Once payment arrives in your account, issue a payment receipt referencing the original invoice. This closes the transaction.

### 2. For Cash or POS Transactions
Any time a customer pays at a physical location — market, store, service counter — issue a receipt immediately. This is especially important for VAT-registered businesses, which are legally required to issue receipts for every taxable sale.

### 3. For Deposits Received
When a client pays a deposit before you issue the final invoice, issue a **Deposit Receipt**: *"₦150,000 received as 50% deposit for brand identity project. Balance due on delivery."*

### 4. For Rent Payments
Landlords must issue a rent receipt for every payment received, clearly showing the property address, period covered, and amount paid.

---

## Real-World Nigerian Examples

**Example 1: Freelance Web Developer**
- ✅ Sends an **invoice** to StartupX Ltd for ₦800,000 website development — due in 14 days
- ✅ Receives full payment; sends a **receipt** confirming ₦800,000 received on [date]

**Example 2: Event Catering Business**
- ✅ Issues a **proforma invoice** for ₦350,000 catering package — valid 30 days
- ✅ Client confirms and pays 50% deposit — issues a **Deposit Receipt** for ₦175,000
- ✅ Delivers catering, issues final **invoice** for balance ₦175,000
- ✅ Receives balance — issues final **receipt** for ₦175,000

**Example 3: Retail Shop (VAT-Registered)**
- ✅ Customer buys electronics worth ₦420,000 (including ₦29,333 VAT)
- ✅ Issues a **Tax Receipt** immediately — no invoice needed for over-the-counter retail
- ✅ Customer uses the Tax Receipt to claim input VAT

---

## FIRS / NRS Compliance: Which Documents to Keep?

For FIRS audit purposes, Nigerian businesses should retain:

- **All invoices issued** — proof of taxable supplies made
- **All receipts issued** — proof that payment was received and acknowledged
- **All invoices received** — proof of business expenses (for input VAT claims)
- **All receipts received** — proof of payments made to suppliers

Retention period: **6 years** minimum (or longer if a tax dispute is open).

---

## Do You Always Need Both Documents?

Not necessarily.

| Scenario | Invoice? | Receipt? |
|---|---|---|
| Consulting services, corporate client | ✅ Yes | ✅ Yes |
| Retail sale, walk-in customer | ❌ Not required | ✅ Yes |
| Deposit before project begins | ✅ Deposit invoice | ✅ Deposit receipt |
| Government contract | ✅ Yes (with TIN) | ✅ Yes |
| Recurring subscription | ✅ Monthly invoice | Optional if auto-paid |
| Cash market sale | ❌ Not typical | ✅ Best practice |

---

## Creating Both Documents Free

[InvoiceGenerator.ng](https://invoicegenerator.ng) handles both invoices and receipts in one place:

- Create a professional **invoice** with VAT, TIN, and bank details
- Once paid, generate a matching **receipt** referencing the invoice number
- Download as PDF or share directly via WhatsApp
- Store both in your invoice history for easy reference

[Create your free invoice or receipt now →](https://invoicegenerator.ng/free-invoice-generator-nigeria)

---

## The Summary

| Question | Answer |
|---|---|
| I finished a project and need to ask for payment | Issue an **invoice** |
| A client just paid me | Issue a **receipt** |
| I received a deposit before starting work | Issue a **deposit receipt** |
| A walk-in customer bought something in my shop | Issue a **receipt** (skip the invoice) |
| A client asks for "proof of payment" | Send the **receipt** |
| A client asks for "proof of the transaction" | Send both the invoice and receipt |`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 10: Free Invoice Generator in Naira
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Free Invoice Generator in Naira: Create ₦ Invoices for Any Nigerian Business',
    slug: 'free-invoice-generator-naira-create-ngn-invoices-online',
    excerpt: 'Create professional invoices in Nigerian Naira (₦) for free — online, in seconds, with automatic 7.5% VAT, your TIN, WhatsApp sharing, and no watermarks. Nigeria\'s fastest Naira invoice generator.',
    coverImage: 'https://images.unsplash.com/photo-1621501103258-d81935628a86?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Free Invoice Generator in Naira: Create ₦ Invoices for Any Nigerian Business

Creating a professional invoice in Nigerian Naira should not require an accountant, a download, or a monthly subscription. Whether you are a freelancer in Ibadan, a contractor in Kano, or a startup in Lagos, you should be able to produce a clean, FIRS-compliant ₦ invoice in under two minutes — for free.

This page explains how to do exactly that.

---

## Why Naira-Specific Invoicing Matters

Most generic invoice generators online default to USD or GBP and lack key Nigerian requirements:

❌ No ₦ symbol (they use $ or £)
❌ No field for TIN (Tax Identification Number)
❌ No 7.5% VAT toggle matching Nigerian rates
❌ No NUBAN bank account format for payment details
❌ No WhatsApp sharing (the primary business communication channel in Nigeria)
❌ No FIRS-compliant field ordering

[InvoiceGenerator.ng](https://invoicegenerator.ng) was built specifically for Nigeria — every feature exists because Nigerian businesses need it.

---

## What You Can Create with the Naira Invoice Generator

### Standard Service Invoice in ₦
The most common use. Bill clients for consulting, design, development, legal, accounting, marketing, or any professional service — in Naira, with full line-item breakdown.

### Tax Invoice (VAT-Registered Businesses)
If your annual turnover exceeds ₦50 million, you are required to issue **Tax Invoices** with 7.5% VAT clearly shown. Toggle the VAT field on, enter 7.5%, and the calculator handles everything automatically.

### Naira Product Invoice
For businesses selling physical goods — include product codes, quantities, unit prices in ₦, subtotals, and total. Suitable for wholesalers, retailers, and manufacturers.

### Mixed Currency Invoice
Billing an international client in USD but your costs are in ₦? InvoiceGenerator.ng supports multiple currencies including USD, GBP, EUR, and NGN simultaneously.

### Recurring ₦ Invoice
Monthly retainer clients in Nigeria? Set up a recurring invoice that generates and sends automatically on the first of each month.

---

## How to Create a Naira Invoice in 5 Steps

**Step 1 — Open the Generator**
Visit [invoicegenerator.ng/free-invoice-generator-nigeria](https://invoicegenerator.ng/free-invoice-generator-nigeria). No download, no sign-up required.

**Step 2 — Add Your Business Details**
Fill in your company name, address, phone, email, and TIN. Upload your logo for a professional finish. These details save for future invoices if you create a free account.

**Step 3 — Add Your Client's Details**
Enter the client's business name, address, and email. If they are a corporate client, include their TIN if you have it (useful for WHT purposes).

**Step 4 — Add Your Line Items**
Click "Add Item" for each service or product:
- Description: Be specific (*"Monthly social media management — March 2026"* not *"Services"*)
- Quantity: Hours, units, or project count
- Rate: Your price per unit in ₦
- The amount calculates automatically

**Step 5 — Apply VAT and Download**
If you are VAT-registered, toggle "Add Tax" and enter 7.5%. The subtotal, VAT amount, and total all update automatically.

Hit **Download PDF** for a high-resolution PDF, or click the **WhatsApp button** to share directly with your client.

---

## Naira Invoice Examples for Different Business Types

### Freelance Designer
```
Logo Design (1 concept + 3 revisions)  1 × ₦180,000  = ₦180,000
Brand Guidelines Document              1 × ₦70,000   = ₦70,000
Business Card Design                   1 × ₦35,000   = ₦35,000
─────────────────────────────────────────────────────────────────
Subtotal                                                ₦285,000
Total Due                                               ₦285,000
```

### IT Consultant (VAT-Registered)
```
Network Infrastructure Audit           1 × ₦500,000  = ₦500,000
Security Assessment Report             1 × ₦250,000  = ₦250,000
─────────────────────────────────────────────────────────────────
Subtotal                                                ₦750,000
VAT (7.5%)                                              ₦56,250
Total Due                                               ₦806,250
```

### Events Planner
```
Event Coordination (2-day conference)  1 × ₦800,000  = ₦800,000
Venue Sourcing                         1 × ₦150,000  = ₦150,000
Catering Management (250 guests)       250 × ₦4,500  = ₦1,125,000
─────────────────────────────────────────────────────────────────
Subtotal                                              ₦2,075,000
Deposit Received                                       -₦1,000,000
Balance Due                                            ₦1,075,000
```

---

## Features Nigerian Businesses Use Most

### ✨ AI Invoice Generation
Type a description like *"Invoice Coca-Cola Nigeria ₦750,000 for 3-month marketing retainer. My company is MediaPro Ltd. Add 7.5% VAT."* and the AI fills the entire invoice form instantly.

### 📱 WhatsApp Sharing
Send the PDF invoice directly from the browser to any WhatsApp number — no need to download and re-upload. Essential for the way Nigerian businesses actually communicate.

### 🔁 Recurring Invoices
Set up monthly invoices for retainer clients. They generate and send automatically on the date you choose. Never forget to invoice a client again.

### 📊 Payment Tracking
See which invoices are paid, overdue, or pending. Your receivables in one view, not scattered across WhatsApp chats.

### 🏦 Saved Bank Details
Your NUBAN account number, account name, and bank name save once and print on every invoice automatically.

---

## Naira Formatting: How It Works

All amounts on InvoiceGenerator.ng are formatted in standard Nigerian Naira format:
- Symbol: ₦ (Unicode: U+20A6)
- Thousands separator: comma (₦1,250,000)
- Decimal separator: period (₦1,250,000.00)
- No space between symbol and amount (₦250,000 not ₦ 250,000)

This matches CBN and FIRS formatting standards.

---

## Frequently Asked Questions

**Is InvoiceGenerator.ng really free?**
Yes. Create invoices, download PDFs, and share via WhatsApp at no cost. Premium features (recurring invoices, payment tracking, client reminders) are available on paid plans.

**Can I use it without creating an account?**
Yes. Create and download a Naira invoice without signing up. An account lets you save your details and access invoice history.

**Is it FIRS / NRS compliant?**
Yes. Invoices include all mandatory fields for Nigerian compliance: TIN field, 7.5% VAT calculation, sequential invoice numbers, and proper date formatting.

**Can I invoice in USD but show the ₦ equivalent?**
Yes. Select your billing currency and the tool handles formatting. You can add a Naira conversion note in the notes field.

---

[**Create your free Naira invoice now — no sign-up required →**](https://invoicegenerator.ng/free-invoice-generator-nigeria)`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 11: Sample Invoice Nigeria
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'Sample Invoice Nigeria: 8 Real Examples for Different Business Types (2026)',
    slug: 'sample-invoice-nigeria-examples-different-business-types-2026',
    excerpt: 'See 8 real sample Nigerian invoices across different industries — freelancer, contractor, VAT-registered, retail, sole trader, NGO, consultant, and construction. All formatted in Naira with TIN, 7.5% VAT, and FIRS-compliant fields.',
    coverImage: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# Sample Invoice Nigeria: 8 Real Examples for Different Business Types (2026)

The fastest way to understand what a proper Nigerian invoice looks like is to see a real one. Below are 8 working sample invoices covering the most common Nigerian business scenarios — formatted correctly, with Naira amounts, TINs, and FIRS-compliant structure.

Use these as a reference to check your own invoices, or [generate your own free invoice](https://invoicegenerator.ng/free-invoice-generator-nigeria) using these as a model.

---

## What Every Valid Nigerian Invoice Must Contain

Before the samples, here is the required anatomy:

- Document title: "INVOICE" or "TAX INVOICE"
- Unique sequential invoice number
- Invoice date and due date
- Seller's name, address, TIN
- Buyer's name and address
- Itemised services/goods with quantities and rates in ₦
- Subtotal, VAT (if applicable), total
- Bank details (account name, number, bank)
- Payment terms

---

## Sample 1: Freelance Designer Invoice

---
**INVOICE**
**Invoice No:** INV-2026-032
**Date:** 20 May 2026 | **Due:** 3 June 2026 (Net 14)

**From:**
Emeka Designs Studio
12B Ozumba Mbadiwe Avenue, Victoria Island, Lagos
Tel: +234 810 234 5678 | emeka@emekadesigns.ng
TIN: 22345678-0001

**To:**
Guarantee Trust Bank PLC — Marketing Department
Plot 635, Akin Adesola Street, Victoria Island, Lagos

| Service | Qty | Rate (₦) | Amount (₦) |
|---|---|---|---|
| Annual Report Design (80 pages) | 1 | 650,000 | 650,000 |
| Photography Editing (200 images) | 1 | 120,000 | 120,000 |
| Print-Ready PDF Preparation | 1 | 80,000 | 80,000 |

**Subtotal:** ₦850,000
**Total Due:** ₦850,000

**Bank:** Access Bank | **Account Name:** Emeka Chukwuemeka | **Account No:** 0987654321

*WHT credit note required upon payment. TIN provided above.*

---

## Sample 2: VAT-Registered Consultancy Tax Invoice

---
**TAX INVOICE**
**Invoice No:** INV-2026-117
**Date:** 15 May 2026 | **Due:** 14 June 2026 (Net 30)

**From:**
Apex Strategy Consulting Ltd
Plot 24, Adeola Hopewell Street, Victoria Island, Lagos
TIN: 11234567-0001 | VAT Reg: VAT-11234567

**To:**
Dangote Industries Ltd — Finance Department
Union Marble House, 1 Alfred Rewane Road, Ikoyi, Lagos

| Service | Qty | Rate (₦) | Amount (₦) |
|---|---|---|---|
| Strategic Market Analysis — Q1 2026 | 1 | 1,500,000 | 1,500,000 |
| Competitive Intelligence Report | 1 | 750,000 | 750,000 |
| Stakeholder Presentation (2 sessions) | 2 | 200,000 | 400,000 |

**Subtotal:** ₦2,650,000
**VAT (7.5%):** ₦198,750
**Total Due:** ₦2,848,750

**Bank:** Zenith Bank | **Account Name:** Apex Strategy Consulting Ltd | **Account No:** 1023456789

---

## Sample 3: Sole Trader / Freelance Writer

---
**INVOICE**
**Invoice No:** INV-2026-009
**Date:** 18 May 2026 | **Due:** 1 June 2026

**From:**
Chioma Adeyemi (Content Writer)
15 Opebi Road, Ikeja, Lagos
Tel: +234 703 456 7890 | chioma@contentng.com
TIN: 33456789-0001

**To:**
Cowrywise Financial Services Ltd
22A Karimu Kotun Street, Victoria Island, Lagos

| Description | Qty | Rate (₦) | Amount (₦) |
|---|---|---|---|
| Blog Posts (1,500 words each) | 8 | 45,000 | 360,000 |
| Email Newsletter Copy (4 editions) | 4 | 35,000 | 140,000 |
| Social Media Copy (30 posts) | 30 | 5,000 | 150,000 |

**Subtotal:** ₦650,000
**Total Due:** ₦650,000

**Bank:** First Bank | **Account Name:** Chioma Adeyemi | **Account No:** 3021456780

---

## Sample 4: Construction Contractor Invoice (WHT Note)

---
**INVOICE**
**Invoice No:** INV-2026-CONST-044
**Date:** 10 May 2026 | **Due:** 25 May 2026

**From:**
BuildStrong Civil Engineering Ltd
14 Ahmadu Bello Way, Abuja
TIN: 44567890-0001 | RC: 987654

**To:**
Federal Capital Development Authority (FCDA)
Area 11, Garki, Abuja FCT

**Project:** Renovation of Staff Quarters Block B — Phase 2

| Work Description | Unit | Qty | Rate (₦) | Amount (₦) |
|---|---|---|---|---|
| Structural reinforcement works | Lump sum | 1 | 3,200,000 | 3,200,000 |
| Electrical installation — 20 units | Units | 20 | 85,000 | 1,700,000 |
| Plumbing works — full block | Lump sum | 1 | 950,000 | 950,000 |
| Painting and finishing | Sq. metre | 800 | 2,200 | 1,760,000 |

**Subtotal:** ₦7,610,000
**Total Due:** ₦7,610,000

**Bank:** Union Bank | **Account Name:** BuildStrong Civil Engineering Ltd | **Account No:** 0011223344

*Note: WHT applicable at 2.5% per NTA 2025 (construction contracts). Please provide WHT credit note referencing this invoice upon payment. TIN: 44567890-0001.*

---

## Sample 5: IT Service Provider (Monthly Retainer)

---
**INVOICE — MONTHLY RETAINER**
**Invoice No:** INV-2026-RET-048
**Billing Period:** May 2026
**Date:** 1 May 2026 | **Due:** 7 May 2026

**From:**
TechCore Solutions Ltd
4 Bode Thomas Street, Surulere, Lagos
TIN: 55678901-0001 | VAT Reg: VAT-55678901

**To:**
Moniepoint Inc — IT Department
Plot 12, St. Finbarr's College Road, Lagos

| Service | Description | Amount (₦) |
|---|---|---|
| IT Infrastructure Management | Monthly managed services — 24/7 monitoring, 8hr response SLA | 850,000 |
| Cybersecurity Monitoring | Firewall management + monthly security report | 250,000 |
| Helpdesk Support | Up to 50 tickets/month — remote and on-site | 200,000 |

**Subtotal:** ₦1,300,000
**VAT (7.5%):** ₦97,500
**Total Due:** ₦1,397,500

**Bank:** GTBank | **Account Name:** TechCore Solutions Ltd | **Account No:** 0123450987

---

## Sample 6: Event Planner — Deposit Invoice

---
**DEPOSIT INVOICE**
**Invoice No:** INV-2026-EVT-DEP-012
**Date:** 12 May 2026 | **Due:** 20 May 2026

**From:**
Lagos Event Masters
27 Balogun Street, Lagos Island, Lagos
TIN: 66789012-0001

**To:**
Flour Mills of Nigeria PLC — HR Department
2 Old Dock Road, Apapa, Lagos

**Event:** Annual Staff Day 2026 — 500 Guests
**Event Date:** Saturday, 20 June 2026

**Deposit Invoice (50% Advance):**

| Description | Full Amount (₦) | Deposit 50% (₦) |
|---|---|---|
| Full event management package | 4,500,000 | 2,250,000 |

**Total Deposit Due:** ₦2,250,000
**Balance Due on Event Day:** ₦2,250,000

**Bank:** FCMB | **Account Name:** Lagos Event Masters | **Account No:** 2234567890

*This deposit secures your event date. The balance is due before 5pm on the event day. Full event invoice will be issued post-event.*

---

## Sample 7: Import/Export — Proforma Invoice

---
**PROFORMA INVOICE**
**PI No:** PI-2026-EXP-008
**Date:** 18 May 2026 | **Valid Until:** 17 June 2026

**Exporter:**
NaijaCraft Export Ltd
Plot 5, Export Processing Zone, Calabar, Cross River State
TIN: 77890123-0001

**Importer:**
Global Artisans UK Ltd
14 Commercial Street, London, E1 6NT, United Kingdom

| Item | HS Code | Qty | Unit Price (USD) | Total (USD) |
|---|---|---|---|---|
| Handwoven Baskets (Assorted) | 4602.19 | 500 pcs | $12.00 | $6,000.00 |
| Hand-Carved Wooden Sculptures | 9703.00 | 100 pcs | $45.00 | $4,500.00 |
| Adire Fabric (5-yard bolts) | 5208.31 | 200 bolts | $28.00 | $5,600.00 |

**Total Estimated Value:** USD $16,100.00
**Estimated Naira Equivalent (@ ₦1,600/USD):** ₦25,760,000

*This proforma invoice is issued for the purpose of Form M application and import licence processing. Payment terms: 30% deposit, 70% against shipping documents.*

---

## Sample 8: NGO / Non-Profit Invoice

---
**INVOICE**
**Invoice No:** INV-2026-NGO-003
**Date:** 14 May 2026 | **Due:** 28 May 2026

**From:**
Heal Africa Foundation (Registered NGO)
CAC/IT/22345 | TIN: 88901234-0001
8 Yakubu Gowon Crescent, Asokoro, Abuja

**To:**
USAID Nigeria Mission
Plot 1075, Diplomatic Drive, Central District, Abuja

**Project:** Community Health Outreach — Kogi State Q2 2026

| Budget Line | Description | Amount (₦) |
|---|---|---|
| Personnel costs | 4 field officers × ₦120,000 × 2 months | 960,000 |
| Transportation | Vehicle hire + fuel — 8 weeks | 380,000 |
| Medical supplies | As per approved procurement list | 1,200,000 |
| Community engagement | Meeting facilitation, refreshments | 160,000 |
| Administrative overhead (10%) | Per grant agreement | 270,000 |

**Total Claim:** ₦2,970,000

**Bank:** Ecobank | **Account Name:** Heal Africa Foundation | **Account No:** 5566778899

*This invoice is submitted per Grant Agreement Ref: USAID-NG-2026-0143.*

---

## Create Your Own Invoice Using These as a Guide

Each of these sample invoices can be replicated in minutes using [InvoiceGenerator.ng](https://invoicegenerator.ng/free-invoice-generator-nigeria):

- Select your invoice type (standard, tax invoice, proforma)
- Fill in your Nigerian business details once — they save for every future invoice
- Add line items with ₦ amounts
- Toggle 7.5% VAT if you are registered
- Download PDF or send via WhatsApp

[Create your free Nigerian invoice now →](https://invoicegenerator.ng/free-invoice-generator-nigeria)`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Article 12: AI Invoice Generator
  // ─────────────────────────────────────────────────────────────────────────
  {
    title: 'AI Invoice Generator Nigeria: Create a Professional Invoice from a Text Description (Free)',
    slug: 'ai-invoice-generator-nigeria-create-from-text-description-free',
    excerpt: 'Nigeria\'s first AI-powered invoice generator lets you describe your work in plain English or Pidgin and instantly creates a complete, professional Naira invoice — with VAT, TIN, and WhatsApp sharing. Free to use.',
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80',
    published: false,
    content: `# AI Invoice Generator Nigeria: Create a Professional Invoice from a Text Description (Free)

What if you could create a professional Nigerian invoice just by describing what you did?

*"Invoice Access Bank for three months of HR consulting at ₦350,000 per month. Add 7.5% VAT. My company is Talent First Ltd."*

That one sentence — typed into [InvoiceGenerator.ng's AI feature](https://invoicegenerator.ng/invoice-generator-ai) — produces a complete, formatted invoice in under five seconds. No form-filling. No mental arithmetic. No formatting.

This guide explains how Nigeria's first AI invoice generator works, who it is for, and how to get the best results from it.

---

## Why AI Invoicing Makes Sense for Nigerian Businesses

Nigerian freelancers and business owners lose significant time to administrative invoicing tasks:
- Filling in the same business details on every invoice
- Manually calculating subtotals, VAT, and totals
- Formatting line items from client briefs or meeting notes
- Converting WhatsApp scope discussions into formal documents

The AI invoice generator solves all four. You describe the project in plain language — the way you would explain it in a WhatsApp message — and the AI creates the structured invoice automatically.

---

## How the AI Invoice Generator Works

The AI at [invoicegenerator.ng/invoice-generator-ai](https://invoicegenerator.ng/invoice-generator-ai) is powered by a large language model trained to understand invoicing terminology, Nigerian business contexts, and local currency formatting.

**Here is the process:**

1. **You type a description** of what you are invoicing for
2. **The AI parses your text** and extracts: client name, service descriptions, quantities, rates, currency, VAT preference, due date, and any notes
3. **It populates the full invoice form** — all fields, calculated totals, formatted in ₦
4. **You review and adjust** any details that need correcting
5. **Download as PDF or share via WhatsApp**

The AI understands:
- Nigerian business names and industries
- Naira currency context (₦, NGN)
- 7.5% VAT requests
- Relative dates ("due in 30 days", "end of month", "next Friday")
- Milestone billing language ("50% deposit", "balance on delivery")
- Multi-line projects ("three items: X at Y, Z at W, and Q at R")

---

## Sample AI Prompts and What They Generate

### Prompt 1: Simple Freelance Invoice
**You type:**
> *"Invoice Konga for website redesign — ₦1.2 million. My company is WebNaija Studio. Due in 14 days."*

**AI generates:**
- Seller: WebNaija Studio
- Client: Konga
- Line item: Website Redesign — ₦1,200,000
- Due date: 14 days from today
- Total: ₦1,200,000

### Prompt 2: Multi-Item Consulting Invoice with VAT
**You type:**
> *"Invoice MTN Nigeria for: brand strategy session ₦500k, market research report ₦300k, and competitive analysis ₦250k. Add 7.5% VAT. My company is Meridian Consulting, TIN is 12345678. Due in 30 days."*

**AI generates:**
- 3 line items with correct ₦ amounts
- Subtotal: ₦1,050,000
- VAT (7.5%): ₦78,750
- Total: ₦1,128,750
- TIN pre-filled
- Due date: 30 days from today

### Prompt 3: Construction Milestone Payment
**You type:**
> *"Invoice FCDA for Phase 2 construction of Block C staff quarters. Structural work ₦2.8 million, electrical ₦1.4 million, plumbing ₦850,000. My company is BuildPro Nig Ltd. Note that 2.5% WHT applies."*

**AI generates:**
- 3 construction line items
- Total: ₦5,050,000
- Footer note about 2.5% WHT under NTA 2025

### Prompt 4: Recurring Retainer
**You type:**
> *"Monthly invoice for social media management for Fidelity Bank — ₦250,000 per month. Content creation ₦150,000, community management ₦100,000. Billing period May 2026. My company is SocialFirst Ltd."*

**AI generates:**
- Two-line retainer invoice
- Billing period header
- Total: ₦250,000

---

## Tips for Getting the Best Results from the AI

### Be Specific About Rates
- ✅ *"3 hours at ₦50,000 per hour"* → AI calculates ₦150,000 correctly
- ❌ *"some hours of work"* → AI cannot calculate without a rate

### Mention Currency Explicitly
- ✅ *"₦500,000"* or *"500k naira"* → correct currency
- For USD: *"$2,000"* or *"2000 dollars"*

### Include VAT Preference
- ✅ *"Add 7.5% VAT"* → VAT line appears
- ✅ *"No VAT"* or silence → no VAT added

### Specify Your Company Name
- Always say *"My company is [Name]"* so the AI knows who the sender is
- If your details are saved in your account, the AI uses them automatically

### Use Relative Dates
- ✅ *"due in 14 days"*, *"due end of month"*, *"Net 30"*
- ✅ Specific dates: *"due 1 June 2026"*

---

## AI Invoice Generator vs Manual Invoice Generator: Which Should You Use?

| Situation | Use AI | Use Manual |
|---|---|---|
| You know exactly what to invoice | Either works | ✅ Faster for simple invoices |
| You have meeting notes to convert | ✅ AI is much faster | Slow — lots of copy-pasting |
| Complex multi-line project | ✅ AI parses it all | Works but tedious |
| You want full control of formatting | ✅ AI then edit | ✅ Manual |
| You are on mobile, typing quickly | ✅ AI is ideal | Can feel clunky |
| First invoice for a new client | Either | ✅ Manual ensures nothing missed |

The AI generator and the manual form are both available on InvoiceGenerator.ng — switch between them freely.

---

## Is the AI Accurate?

The AI is highly accurate for standard invoicing scenarios. It is especially strong at:
- Parsing Naira amounts in various formats (₦1.2m, 1,200,000, 1.2 million naira)
- Identifying client and company names
- Understanding Nigerian business context and terminology
- Calculating VAT correctly

**Always review the output before sending** — especially for:
- Very large or complex invoices
- Exact due dates (double-check relative date calculations)
- Unusual line items or niche industry terminology

---

## Privacy and Data

Your invoice prompts are processed to generate the invoice content and are not stored permanently or used to train the AI model. Invoice data you save in your account is encrypted and stored securely.

---

## AI Invoicing + WhatsApp: The Nigerian Workflow

The full workflow for Nigerian freelancers looks like this:

1. **Client briefs you on WhatsApp** → project scope discussed
2. **You open InvoiceGenerator.ng AI** → paste a summary of what was agreed
3. **AI generates the invoice** → review takes 30 seconds
4. **WhatsApp share button** → PDF sent directly to client's chat
5. **Client pays** → you issue a receipt and mark as paid

Total time from WhatsApp discussion to invoice sent: **under 3 minutes**.

[**Try the AI Invoice Generator free →**](https://invoicegenerator.ng/invoice-generator-ai)

No sign-up required. No watermarks. Full PDF download.`,
  },
];

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized — pass ?secret= to proceed' }, { status: 401 });
  }

  try {
    // Use first admin account as author
    let author = await prisma.user.findFirst({ where: { isAdmin: true } });
    if (!author) author = await prisma.user.findFirst();
    if (!author) {
      return NextResponse.json(
        { error: 'No users found in the database. Create an admin account first.' },
        { status: 400 }
      );
    }

    const results: { slug: string; title: string; action: string }[] = [];

    for (const post of DRAFT_ARTICLES) {
      const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });

      if (existing) {
        // Update existing draft (do not overwrite if already published)
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
      message: 'All drafts are now visible in the admin blog list at /admin/blog. Publish each article when ready.',
      results,
    });
  } catch (error) {
    console.error('[seed-draft-articles] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
