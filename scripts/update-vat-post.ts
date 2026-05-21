import { prisma } from '../lib/db';

const newSlug = 'firs-vat-registration-certificate-online-nigeria';
const oldSlug = 'how-to-register-for-vat-nigeria-firs-guide';

const updatedContent = `
# How to Apply for a FIRS VAT Registration Certificate Online in Nigeria

If you are a business owner or freelancer in Nigeria, navigating tax compliance can feel overwhelming. However, getting your **VAT Registration Certificate** is a legal requirement if your business meets the threshold, and it is crucial for building trust with corporate clients. 

With the Federal Inland Revenue Service (FIRS) digitizing its processes, applying for your VAT registration online is now easier than ever. In this ultimate guide, we will walk you through exactly how to get your VAT registration number and certificate without leaving your desk.

## What is a VAT Registration Certificate?

A VAT (Value Added Tax) Registration Certificate is an official document issued by FIRS that authorizes your business to charge and collect the standard 7.5% VAT on your goods and services. It contains your unique Tax Identification Number (TIN) and your VAT registration number.

Having this certificate is not just about compliance—many corporate entities and government agencies will refuse to process your invoices if you cannot provide a valid VAT number.

## Do I Need to Register for VAT?

According to the Nigerian Finance Act, businesses with an annual turnover of **₦25 Million and above** are required by law to register for VAT, charge VAT on their invoices, and remit it to the FIRS. 

However, even if you earn below ₦25 Million, you can voluntarily register for VAT if you frequently deal with large corporate clients who require it on their vendor invoices.

## Step-by-Step Guide: How to Register for VAT Online in Nigeria

FIRS has streamlined the registration process through the TaxPro Max portal. Here is how you can apply:

### Step 1: Get Your Tax Identification Number (TIN)
Before you can get a VAT certificate, you must have a TIN. If you registered your business with the Corporate Affairs Commission (CAC) recently, your TIN is automatically generated and printed on your CAC certificate. If you do not have one, you can verify or request it via the Joint Tax Board (JTB) TIN Verification Portal.

### Step 2: Access the FIRS TaxPro Max Portal
Visit the official FIRS TaxPro Max portal at \`taxpromax.firs.gov.ng\`. This is the central hub for all tax administration in Nigeria, including VAT registration, filing, and payment.

### Step 3: Complete Your Profile Update
Log in using your TIN as your username. If it is your first time, you will need to reset your password and update your company profile. You will be asked to provide:
- Your CAC Registration Number (RC or BN Number)
- Business address and contact details
- Directors' details (for LLCs)
- Principal business activity

### Step 4: Navigate to the VAT Registration Section
Once your profile is 100% updated and verified, navigate to the **Taxes** section on your dashboard. Select "Value Added Tax (VAT)" and follow the prompts to register. You will need to confirm your branch locations and business sectors.

### Step 5: Download Your VAT Registration Certificate
Upon successful registration and approval by your local FIRS tax office (which usually takes a few business days), you will be able to download and print your official VAT Registration Certificate directly from the TaxPro Max portal. 

## How to Create a Valid VAT Invoice in Nigeria

Once you have your VAT number, you must ensure all your business invoices clearly display it. A standard Nigerian VAT invoice must include:

1. Your Business Name and Address
2. Your **VAT Registration Number** / **TIN**
3. The Customer's Name and Address
4. A clear description of the goods or services
5. The subtotal amount
6. The **7.5% VAT** calculated as a separate line item
7. The total amount due (including VAT)

### Automate Your VAT Invoicing with InvoiceNaija
Calculating 7.5% VAT manually on every invoice leaves room for error. With [InvoiceNaija](https://www.invoicegenerator.ng/free-invoice-generator-nigeria), you can generate FIRS-compliant invoices in seconds. 

Our **Free Invoice Generator** explicitly supports the **Naira (₦)** and allows you to add your VAT number and automatically calculate the 7.5% tax with a single click. 

**Stop wrestling with Excel templates.** [Create your first professional Naira invoice today](https://www.invoicegenerator.ng/free-invoice-generator), completely free!
`;

async function main() {
    console.log(`Looking for existing post with slug: ${oldSlug}`);
    
    const existingPost = await prisma.blogPost.findUnique({
        where: { slug: oldSlug }
    });

    if (!existingPost) {
        console.error(`Post with slug '${oldSlug}' not found!`);
        console.log('You might need to create it manually or check if the slug is correct.');
        return;
    }

    console.log(`Found post: "${existingPost.title}". Updating...`);

    const updated = await prisma.blogPost.update({
        where: { id: existingPost.id },
        data: {
            slug: newSlug,
            title: 'How to Apply for a FIRS VAT Registration Certificate Online in Nigeria',
            content: updatedContent,
            excerpt: 'Learn the exact step-by-step process to apply for your FIRS VAT Registration Certificate online in Nigeria, including TIN requirements and FIRS TaxPro Max guide.',
        }
    });

    console.log(`Successfully updated post!`);
    console.log(`New title: ${updated.title}`);
    console.log(`New slug: ${updated.slug}`);
    console.log('Please make sure to update any hardcoded slugs in your frontend code (e.g., app/blog/page.tsx).');
}

main()
    .catch((e) => {
        console.error('Error updating blog post:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
