import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting SEO Blog Seed Script...");

  // 1. Find or create an author
  let author = await prisma.user.findFirst({
    where: { isAdmin: true }
  });

  if (!author) {
    author = await prisma.user.findFirst();
  }

  if (!author) {
    console.log("No users found. Creating a generic 'Editorial Team' user...");
    author = await prisma.user.create({
      data: {
        name: 'InvoiceGenerator Editorial Team',
        email: 'editor@invoicegenerator.ng',
        password: 'hashed-password-placeholder', // Dummy
        isAdmin: true,
        emailVerified: true
      }
    });
  }

  console.log(`Using Author: ${author.name} (${author.id})`);

  // 2. Define the 5 SEO posts
  const postsToSeed = [
    {
      title: 'The Ultimate Guide to FIRS VAT Registration for Nigerian Businesses',
      slug: 'firs-vat-registration-guide-nigerian-businesses',
      excerpt: 'Learn exactly how to register for Value Added Tax (VAT) with the Federal Inland Revenue Service (FIRS) in Nigeria, including requirements, timelines, and penalties.',
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `
# The Ultimate Guide to FIRS VAT Registration for Nigerian Businesses

Operating a business in Nigeria comes with specific tax obligations, and registering for Value Added Tax (VAT) with the Federal Inland Revenue Service (FIRS) is one of the most critical. If you are selling goods or services, neglecting your VAT obligations can lead to severe financial penalties and business interruptions.

In this comprehensive guide, we will break down everything you need to know about FIRS VAT registration in Nigeria.

## What is VAT in Nigeria?

Value Added Tax (VAT) is a consumption tax placed on a product whenever value is added at each stage of the supply chain, from production to the point of sale. In Nigeria, the standard VAT rate is currently **7.5%**, following the Finance Act of 2020 (increased from the previous 5%).

VAT is collected on behalf of the government by businesses and remitted to the FIRS by the 21st day of the following month.

## Who Needs to Register for VAT?

According to the FIRS, any individual, corporation, or organization doing business in Nigeria that supplies taxable goods or services must register for VAT. 

However, the Finance Act introduced a critical threshold: **Businesses with an annual turnover of less than ₦25 million are exempted** from VAT registration, charging VAT, and filing monthly VAT returns. 

If your business consistently generates more than ₦25 million annually, or you project you will cross that threshold, registration is mandatory.

## Requirements for FIRS VAT Registration

To initiate your VAT registration, you will generally need the following documents depending on your business type:

### For Limited Liability Companies (LLCs):
1. Certificate of Incorporation (CAC)
2. Certified True Copy (CTC) of Memorandum and Articles of Association
3. CTC of Form CAC 1.1 (or CAC 2 and 7 for older registrations)
4. A formal application letter on your official company letterhead addressed to the Tax Controller.
5. Utility bill of the business premises (Proof of Address)

### For Business Names (Enterprises):
1. Business Name Registration Certificate
2. Formal application letter
3. Utility bill for proof of address
4. Valid means of identification of the proprietor (NIN, Driver's License, International Passport)

## How to Register: Step-by-Step

**Step 1: Locate your nearest FIRS Tax Office (MSTO)**
You must register at the Micro and Small Tax Office (MSTO) or Medium Tax Office (MTO) closest to your registered business address.

**Step 2: Submit your documents**
Take the documents listed above, along with your application letter, to the Tax Controller's office.

**Step 3: Obtain your Taxpayer Identification Number (TIN)**
If you registered your company recently with the Corporate Affairs Commission (CAC), you may already have a TIN issued automatically. If not, the FIRS will process your documents and issue you a TIN.

**Step 4: Receive your VAT Certificate**
Once your application is processed (usually within 1-3 weeks), you will be issued a VAT Registration Certificate. This certificate must be displayed clearly at your business premises.

## How to Invoice with VAT in Nigeria

Once registered, you must include the 7.5% VAT on all your invoices for taxable goods and services. A valid tax invoice in Nigeria must display:
* Your Company Name and Address
* Your Taxpayer Identification Number (TIN)
* The Buyer's Name and Address
* Description of Goods/Services
* The VAT Rate (7.5%) and the specific VAT amount clearly separated from the subtotal.
* The explicit phrase "Tax Invoice"

> **Efficiency Tip:** Instead of calculating this manually on Word documents or Excel, use [InvoiceGenerator.ng](https://invoicegenerator.ng) to automatically calculate the 7.5% Nigerian VAT on all your invoices in seconds.

## Penalties for Non-Compliance

The FIRS takes VAT non-compliance very seriously. Penalties include:
* **Failure to Register:** ₦50,000 for the first month of default, and ₦25,000 for every subsequent month.
* **Failure to Remit VAT:** A penalty of 10% of the tax not remitted, plus interest at the prevailing Central Bank of Nigeria (CBN) lending rate.

## Conclusion

VAT registration is a vital sign of your business maturing in the Nigerian ecosystem. By organizing your documents, registering promptly, and using automated invoicing tools to issue proper Tax Invoices, you guarantee compliance and avoid costly FIRS penalties.
      `
    },
    {
      title: 'How to Get Your VAT Registration Number (TIN) in Nigeria',
      slug: 'how-to-get-vat-registration-number-tin-nigeria',
      excerpt: 'Learn the exact steps, requirements, and online processes for Nigerian individuals and companies to acquire their Taxpayer Identification Number (TIN).',
      coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `
# How to Get Your VAT Registration Number (TIN) in Nigeria

If you intend to open a corporate bank account, get a government loan, bid for contracts, or be fully registered to collect Value Added Tax (VAT), you absolutely need a **Taxpayer Identification Number (TIN)**.

Often referred to interchangeably as a VAT Registration Number, your TIN is your unique identifier with the Federal Inland Revenue Service (FIRS) and the Joint Tax Board (JTB) of Nigeria.

## What is a TIN?

A TIN (Taxpayer Identification Number) is a unique 14-digit number assigned to individuals, businesses, and registered companies by the government for tax records. Without a TIN, you are technically invisible to the Nigerian tax system, which means you cannot legally operate as a registered corporate entity.

## Do You Need to Pay for a TIN?

**No.** Applying for and obtaining a Taxpayer Identification Number in Nigeria is **100% free**. If anyone attempts to charge you a fee for a TIN certificate, they are acting fraudulently. You only pay professional fees if you hire an accountant or lawyer to do the running around on your behalf.

## How to Get Your TIN: For Companies Registered After 2020

In an effort to make doing business in Nigeria easier, the Corporate Affairs Commission (CAC) and the FIRS integrated their systems. 

**If you registered your company with the CAC recently, your TIN is generated automatically.**

To find your automatically generated TIN:
1. Visit the Joint Tax Board (JTB) TIN Verification Portal at [tinverification.jtb.gov.ng](https://tinverification.jtb.gov.ng).
2. Enter your CAC Registration Number (RC Number or BN Number).
3. Confirm your company name.
4. The system will display your official TIN and allow you to print the certificate directly.

## How to Get Your TIN: For Older Companies or Individuals

If your business was registered years ago and you never applied for a TIN, or if you are applying as an unregistered individual (freelancer, sole proprietor), follow these steps:

### The Physical Application Process
1. Locate the nearest FIRS Tax Office (MSTO or MTO) to your registered address.
2. Request the official TIN application form.
3. Complete the form accurately.

### Documents Required for Individuals:
* Completed TIN Application form.
* Valid Identification (National ID Card, Driver's License, or International Passport).
* Passport Photograph.
* Proof of address (recent utility bill).

### Documents Required for Companies:
* Certificate of Incorporation.
* Memorandum and Articles of Association.
* Form CAC 1.1 (or combination of CAC 2 and 7).
* Official application letter on company letterhead addressed to the Tax Controller.
* Completed TIN Application form (stamped with company seal).

## How Quickly Will I Get My TIN?

If you are applying directly at the FIRS office, the process usually takes between **24 to 72 hours** depending on the workload of that specific tax office. Once processed, you will be issued a printout containing your unique 14-digit TIN.

## Invoicing with Your TIN

Once you have your TIN, it is legally required that you include it on all your commercial invoices if you are charging VAT. When sending invoices to large multinational corporations or government agencies in Nigeria, they will **reject** your invoice if your TIN is missing, because they use it to remit Withholding Tax (WHT) on your behalf.

Make sure your invoicing system is equipped to handle this. For an easy way to automatically embed your TIN on all professional invoices, you can set it up once as a default field inside [InvoiceGenerator.ng](https://invoicegenerator.ng).

## Bottom Line

Getting a TIN is no longer the stressful, week-long process it used to be. For most modern businesses, it is generated at the point of CAC registration. For everyone else, a quick trip to the local FIRS office with the right documents will have you compliant and ready to do business legally in Nigeria.
      `
    },
    {
      title: 'What is a Debit Note and When is it Issued? (With Examples)',
      slug: 'what-is-debit-note-nigeria-when-issued-examples',
      excerpt: 'Understand the difference between a debit note, credit note, and an invoice. Learn when a debit note is issued in accounting and see practical Nigerian examples.',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `
# What is a Debit Note and When is it Issued? (With Examples)

If you have ever been undercharged by a supplier or accidentally issued an invoice for an amount lower than what was agreed, you might have wondered how to legally correct the mistake without voiding the entire transaction.

This is where a **Debit Note** (sometimes called a debit memo) comes in. Understanding how and when to use debit notes is essential for accurate bookkeeping and maintaining good relationships with clients.

## What is a Debit Note?

A **Debit Note** is a commercial document issued by a buyer to a seller, or by a seller to a buyer, to indicate that the recipient’s account balance has been debited (increased). In simple terms:

* **When a seller sends it:** "You owe me more money than the original invoice stated."
* **When a buyer sends it:** "I am returning these damaged goods, so I owe you less money, please adjust your records."

## Debit Note vs. Credit Note vs. Invoice

Before diving deeper, it helps to distinguish a debit note from its siblings:

* **Invoice:** The primary request for payment for goods or services provided.
* **Credit Note:** A document issued by the seller to reduce the amount the buyer owes (e.g., giving a discount after the fact, or acknowledging a return).
* **Debit Note:** A document issued by the seller to *increase* the amount the buyer owes (e.g., correcting an undercharge).

## Common Scenarios: When is a Debit Note Issued?

### Scenario 1: The Seller Undercharged the Buyer
Imagine your marketing agency in Lagos quotes a client ₦500,000 for a campaign. By mistake, your accountant issues an invoice for ₦450,000. The invoice has already been sent to the client's procurement department. 
Instead of canceling the invoice (which messes up their filing system), you issue a **Debit Note for the remaining ₦50,000**. This officially alerts them of the outstanding balance.

### Scenario 2: Post-Invoice Price Increases
If an ongoing supply contract includes a clause that accounts for inflation or foreign exchange fluctuations, and the price of goods (e.g., diesel or raw materials) spikes after an initial invoice was sent but before delivery, a seller can issue a debit note to cover the differential cost.

### Scenario 3: Calculating Extra Logistics Costs
A vendor ships products from Kano to Port Harcourt. After the original invoice (which estimated delivery costs) was paid, the actual shipping weight turned out to be higher, incurring an extra ₦15,000 in courier fees. The vendor issues a debit note to the buyer to recover the ₦15,000 freight difference.

### Scenario 4: Buyer Returning Goods (Purchase Return)
If a buyer receives 10 laptops from a supplier, but 2 are broken, the buyer will return the 2 laptops and issue a debit note to the supplier. This debit note tells the supplier: "I am debiting my accounts payable ledger, meaning I will pay you less for the original invoice." The supplier usually responds by sending a Credit Note back.

## What Should a Debit Note Include?

To be legally and financially valid, a debit note should contain:
1. The clear title: "DEBIT NOTE"
2. Date of issue
3. A unique Debit Note Number
4. Reference to the original Invoice Number
5. Buyer and Seller details (Names, Addresses, TINs)
6. A clear description of why the note is issued (e.g., "Undercharge error on Invoice #1002")
7. The exact supplementary amount to be paid
8. VAT adjustments (if the original amount lacked appropriate VAT)

## Best Practices for Managing Debit Notes in Nigeria

1. **Clear Communication Policy:** Always call or email the client to explain *why* a debit note is coming before simply sending it. Unexplained debit notes can cause friction.
2. **Keep an Audit Trail:** Ensure every debit note links back explicitly to its parent invoice for FIRS compliance and easy end-of-year auditing.
3. **Automate Document Generation:** Tracking endless paper memos leads to lost revenue. Use an organized digital system to manage your invoices and subsequent financial notes. 

When you need to send professional addendums or entirely new invoices to cover discrepancies, using a tool like [InvoiceGenerator.ng](https://invoicegenerator.ng) ensures your documents look highly professional and contain all necessary legal information.
      `
    },
    {
      title: 'The 5 Best Apps for Invoicing in Nigeria (2026 Rankings)',
      slug: 'best-invoicing-apps-software-nigeria',
      excerpt: 'Compare the top 5 invoicing and billing applications for Nigerian businesses, freelancers, and agencies. Find out which tool is best for Naira (NGN) billing, ease of use, and local tax compliance.',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `
# The 5 Best Apps for Invoicing in Nigeria

Whether you are a freelance graphic designer in Yaba, a consulting firm in Abuja, or a boutique in Lekki, manual Microsoft Word invoices are holding your business back. They look unprofessional, are hard to track, and present massive headaches when it’s time to calculate VAT.

Nigerian businesses need invoicing apps that understand local nuances: dealing in Naira (₦), adhering to FIRS 7.5% VAT rules, and providing ease-of-use without overwhelming small business owners with complex ERP features.

Here are the 5 best invoicing apps for Nigerian businesses.

## 1. InvoiceGenerator.ng

If you need a highly professional, beautiful invoice in less than 30 seconds without the friction of complex accounting software, **InvoiceGenerator.ng** is the undisputed top choice for Nigerians.

**Why it ranks #1:**
* **Instant Creation:** No sign-up required. You land on the page and start typing. 
* **Locally Optimized:** Built ground-up for Nigerians. Seamlessly handles Naira (₦) formatting and automatic 7.5% VAT calculation.
* **AI Features:** You can literally type "Create an invoice for 2 tech consulting sessions at 100k each" and the internal AI will format a perfect invoice for you.
* **WhatsApp Integration:** Built-in sharing tools let you instantly send the generated PDF to your client's WhatsApp—a critical feature for Nigerian commerce.

**Best For:** Freelancers, SMEs, and consultants who want fast, stunningly professional PDFs without paying monthly SaaS subscriptions.

## 2. Paystack Invoices

Paystack is synonymous with Nigerian payments. Beyond their core payment gateway, they offer a very functional "Invoices" feature directly inside the Paystack Dashboard.

**Why it’s great:**
* **Direct Payment Links:** When you send an invoice via Paystack, the client gets a secure link to pay immediately via Card, USSD, or Bank Transfer.
* **Automated Reminders:** It can automatically ping your client when the invoice is overdue.
* **Dashboard Sync:** If you already use Paystack for your online store, everything sits in one dashboard.

**Best For:** E-commerce businesses and agencies primarily looking to collect instant digital payments alongside their invoice.

## 3. Zoho Invoice

Zoho Invoice is an incredibly powerful global tool that recently made its core invoicing product 100% free for small businesses.

**Why it’s great:**
* **Completely Free:** No hidden costs, regardless of how many clients you have.
* **Time Tracking:** If you bill by the hour, Zoho has a built-in timer that automatically converts tracked hours into line items on your invoice.
* **Client Portal:** Your clients can log in to a portal to view their transaction history with you.

**Drawbacks:** It can be slightly overwhelmingly complex to set up initially compared to local lightweight options, and it wasn't built specifically with Nigerian tax workflows in mind.

## 4. Wave Accounting

Wave is famous globally for providing free, fully-fledged accounting software designed specifically for very small businesses with 1 to 9 employees.

**Why it’s great:**
* **Full Accounting:** It’s not just an invoice generator; it handles bank reconciliation, profit/loss statements, and balance sheets.
* **Recurring Invoices:** Easily set up automatic billing for retainer clients.
* **Receipt Scanning:** Allows you to upload expenses to offset against your invoiced income.

**Drawbacks:** Wave officially caters more to the US/Canada market. You cannot use their built-in payment processing in Nigeria; you can only use it to generate the PDF and track the bookkeeping.

## 5. Flutterwave Invoices

A direct competitor to Paystack, Flutterwave also provides a robust invoicing solution to merchants using its platform.

**Why it’s great:**
* **Multi-Currency:** If you are a Nigerian freelancer billing clients in USD, GBP, or KES, Flutterwave makes it incredibly easy to issue an invoice in a foreign currency and get settled locally.
* **Instant Checkout:** Similar to Paystack, the invoice acts as a payment gateway portal.
* **Payment Links:** Generates quick shareable links for social media commerce.

**Best For:** Freelancers or agencies dealing heavily in cross-border transactions and international clients.

---

### Conclusion

Your choice of app depends entirely on your needs. 
* If you need heavily complex ledger accounting, look to **Wave** or **Zoho**.
* If you need an invoice strictly to act as a digital payment gateway, look to **Paystack** or **Flutterwave**.
* If you want the fastest, most professional PDF with AI assistance, local VAT handling, and no-login friction, **[InvoiceGenerator.ng](https://invoicegenerator.ng)** is the definitive tool.
      `
    },
    {
      title: 'How to Create a Free Professional Invoice in Naira (NGN)',
      slug: 'how-to-create-free-professional-invoice-naira',
      excerpt: 'Stop using messy Word documents. Learn the exact anatomy of a professional Nigerian invoice and how to generate one in Naira for free in under 60 seconds.',
      coverImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d97?auto=format&fit=crop&w=1200&q=80',
      published: true,
      authorId: author.id,
      content: `
# How to Create a Free Professional Invoice in Naira (NGN)

First impressions matter. When you complete a project or supply goods, the format of your request for payment speaks volumes about your brand's professionalism. 

Sending a hastily typed WhatsApp message saying *"Please pay 200k to this GTB account"* signals to corporate clients that you are an amateur. Conversely, fighting with Microsoft Word templates where the table margins keep breaking is a frustrating waste of time.

Here is the ultimate guide on how to effortlessly create a free, highly professional invoice localized for Nigeria in the Naira (₦) currency.

## The Anatomy of a Professional Invoice

Before you generate your invoice, you must ensure it contains all the legal and commercial requirements expected by Nigerian businesses and accounting departments:

**1. The Word "INVOICE"**
This must be clearly written at the top. If you are a VAT-registered entity, use "TAX INVOICE".

**2. Unique Invoice Number**
Every invoice must have a sequential, unique identifier (e.g., INV-001, INV-002) to prevent accounting duplicates.

**3. Crucial Dates**
* **Invoice Date:** The day the invoice is issued.
* **Due Date:** The deadline for payment (e.g., "Net 30" means payment is due in 30 days).

**4. Your Company Details**
* Your Logo
* Business Name
* Address (City/State)
* Phone Number/Email

**5. Client Details (Bill To)**
* Client Name / Company
* Client Address
* Client Contact Info

**6. Line Items Breakdown**
Provide a crystal-clear description of the goods or services. Avoid vague terms like *"Work done"*. Instead, use *"Web Design: Complete redesign of homepage (1 unit) @ ₦150,000"*.

**7. Subtotal, VAT, and Total**
Calculate the subtotal of the items. If applicable, calculate 7.5% Nigerian VAT on that subtotal, and summarize the Final Total in NGN.

**8. Bank Account Details & Terms**
Provide explicit payment instructions:
* Bank Name (e.g., Zenith Bank)
* Account Name 
* Account Number (NUBAN)
* Notes indicating any late fees or "Thank you for your business."

## How to Generate One for Free in Seconds

You don't need to pay for expensive subscriptions or download heavy software to get a Wall Street-level invoice. Follow these exact steps using a free tool:

### Step 1: Open Your Browser
Navigate to **[InvoiceGenerator.ng](https://invoicegenerator.ng)** on your phone or laptop. You do not need to create an account or sign in.

### Step 2: Upload Your Logo
Click the logo placeholder at the top left of the invoice to upload your high-resolution company logo. This instantly elevates the document's credibility.

### Step 3: Enter the Details
The platform is designed as a direct WYSIWYG (What You See Is What You Get) editor. Just click on any field (like "Your Company Name" or "Item Description") and start typing directly onto the invoice template. 

### Step 4: Add Naira Line Items and Tax
Click **"Add Item"** for every separate service you provided. The tool will automatically calculate the math. In the settings panel on the right, you can toggle **"Add Tax"** and set it to 7.5%. The engine handles the percentage calculations flawlessly, ensuring no mathematical errors.

### Step 5: (Optional) Use AI to Do It For You
If you are in a rush, just click the **"✨ Create with AI"** button. Type a prompt like: *"Create an invoice to Dangote Cement for 5 laptops at 400,000 Naira each, include 7.5% VAT, and make my company name TechSolutions Ltd."* The artificial intelligence will magically fill out the beautiful template for you.

### Step 6: Download PDF or Share via WhatsApp
Once you review the invoice, click the **Download PDF** button to save a high-quality copy to your device. Alternatively, click the WhatsApp button to shoot a highly professional, formatted message and link directly to your client’s chat.

## Conclusion

Getting paid shouldn't be the hardest part of your job. By standardizing your billing process using free, localized tools that output the Naira symbol correctly, you drastically reduce back-and-forth emails, eliminate math errors, and position your brand as a premium service provider.
      `
    }
  ];

  console.log(`Preparing to insert ${postsToSeed.length} highly optimized SEO blog posts...`);

  // 3. Upsert them into the database based on the slug to avoid duplicates
  let insertedCount = 0;
  for (const post of postsToSeed) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    
    if (!existing) {
      await prisma.blogPost.create({ data: post });
      console.log(`[Inserted]: ${post.title}`);
      insertedCount++;
    } else {
      console.log(`[Skipped]: ${post.title} (already exists)`);
      // Update if we want to force changes
      await prisma.blogPost.update({
        where: { slug: post.slug },
        data: post
      });
      console.log(`[Updated]: ${post.title}`);
    }
  }

  console.log(`Successfully generated and published ${insertedCount} new SEO blog posts!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
