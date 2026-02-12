import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // Load env vars

// Setup Prisma Client for script execution
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding initial blog post...');

    // 1. Find an admin user to be the author
    // Prioritize users with isAdmin=true, fallback to any user if none found (for dev/test)
    let author = await prisma.user.findFirst({
        where: { isAdmin: true },
    });

    if (!author) {
        console.log('No admin user found. Checking for any user...');
        author = await prisma.user.findFirst();
    }

    if (!author) {
        console.error('❌ No users found in database. Cannot create blog post without an author.');
        console.log('Please sign up a user in the application first.');
        process.exit(1);
    }

    console.log(`Found author: ${author.name} (${author.email})`);

    // Update author name to Olivia S if it's not already
    if (author.name !== 'Olivia S') {
        console.log(`Updating author name from "${author.name}" to "Olivia S"...`);
        author = await prisma.user.update({
            where: { id: author.id },
            data: { name: 'Olivia S' },
        });
    }

    // 2. Define the blog post data
    const postData = {
        title: 'Create Invoice Free: The Ultimate 2026 Guide for Nigerian Businesses',
        slug: 'create-invoice-free-ultimate-2026-guide-nigeria',
        excerpt: 'In the bustling economy of Nigeria, 2026 has brought about the most significant shift in business operations in over a decade. This comprehensive guide will show you how to navigate the 2026 tax landscape, maintain professional standards, and choose the best free tools available today.',
        content: `In the bustling economy of Nigeria, 2026 has brought about the most significant shift in business operations in over a decade. Whether you are a creative freelancer in the heart of Yaba or a merchant in Onitsha, the way you "bill" is no longer just about getting paid—it’s about staying legal.

The question is no longer just how to create an invoice for free, but how to do it in a way that aligns with the new Nigeria Revenue Service (NRS) standards. This comprehensive guide will show you how to navigate the 2026 tax landscape, maintain professional standards, and choose the best free tools available today.

## 1. The 2026 Shift: Why "Free" Must Also Mean "Digital"

For years, many Nigerian small businesses relied on paper receipt booklets bought at local stationery stores. However, as of January 1, 2026, the Federal Inland Revenue Service (now the Nigeria Revenue Service - NRS) has fully implemented the Merchant-Buyer Solution (MBS).

### The Death of the Paper Invoice

Under the new mandate, manual paper invoices are largely being phased out for VAT-registered businesses. The government now requires Electronic Invoicing (e-invoicing). This means:

*   **Real-time Reporting**: Transactions must be reported to the NRS within 24 hours (for B2C) or validated instantly (for B2B).
*   **The QR Code Requirement**: A valid invoice in 2026 must carry a unique QR code and an Invoice Reference Number (IRN).
*   **Input VAT Claims**: If you sell to other businesses, they cannot claim their tax back unless you provide a digitally validated invoice. If you don't go digital, you lose corporate clients.

Why search for "Create Invoice Free" now? Because the cost of compliance shouldn't break your business. While many "Access Point Providers" charge high fees, there are still ways to generate professional, compliant invoices for free.

## 2. What Every Nigerian Invoice Must Include in 2026

To ensure your "free" invoice is actually legal, it must contain specific data points required by Nigerian law. Use this checklist:

### Header Information

*   **Business Name & Logo**: Professionalism starts here.
*   **TIN (Tax Identification Number)**: This is now mandatory for every business transaction in Nigeria.
*   **RC/BN Number**: Your Corporate Affairs Commission (CAC) registration number.
*   **Contact Details**: Physical address and a functional phone number.

### Transaction Details

*   **Unique Invoice Number**: Never repeat numbers. Use a system like INV-2026-001.
*   **Issue Date & Due Date**: Crucial for tracking the 72-hour buyer review window introduced in 2026.
*   **Description of Goods/Services**: Be specific to avoid "rejections" in the NRS portal.

### The Financials

*   **Subtotal**: The cost before tax.
*   **VAT (Value Added Tax)**: In 2026, ensure you are using the current rate of 7.5% (unless your turnover is below the ₦25 million threshold).
*   **Total Amount Due**: Bold and easy to read.
*   **Bank Details**: Include your Bank Name, Account Name, and NUBAN Account Number.

## 3. Top 5 Free Invoicing Tools for Nigerians in 2026

Not all "free" tools are created equal. Some are international but lack Naira support; others are local but lack features. Here is the 2026 breakdown:

### A. Zoho Invoice (The Global Standard)
Zoho made a bold move by making their invoicing platform 100% free for small businesses.
*   **Pros**: Professional templates, mobile app, and supports multiple currencies (USD/Naira).
*   **Best for**: Freelancers working with international clients.

### B. Invoice.ng (The Local Champion)
A Nigerian-made platform specifically designed for our local market.
*   **Pros**: Pre-configured with Nigerian tax settings and local bank transfer instructions.
*   **Best for**: Small shops and local service providers.

### C. Wave Accounting
Wave offers unlimited invoicing for free, though they make their money on payment processing.
*   **Pros**: No limit on the number of customers or invoices.
*   **Best for**: Businesses that want a clean, minimalist look.

### D. Google Sheets (The Manual Powerhouse)
If you want 100% control, a spreadsheet is still a valid way to "create invoice free."
*   **Pros**: No software to learn; complete design freedom.
*   **Best for**: Micro-businesses with very low volume.

### E. ProInvoice
A rising star in the Nigerian tech space, ProInvoice offers a "Free Forever" tier for startups.
*   **Pros**: Very fast mobile interface; optimized for slow internet connections.

## 4. Step-by-Step: How to Create Your First Digital Invoice

Let’s walk through the process of creating a compliant invoice in under 5 minutes.

1.  **Choose Your Platform**: Select one of the tools mentioned above (e.g., Zoho or Invoice.ng).
2.  **Input Business Data**: Enter your TIN and CAC number immediately. In 2026, an invoice without a TIN is often considered a "draft."
3.  **Add Your Client**: Ensure you have their correct email. Under the new NRS rules, the "Buyer" often receives a notification to "Accept" the invoice digitally.
4.  **Itemize Your Work**: Instead of writing "Consultancy," write "4 Hours of Marketing Strategy - Feb 2026." Clarity prevents payment delays.
5.  **Calculate Tax**: Use the automated tax settings to apply 7.5% VAT.
6.  **Review & Send**: Before hitting send, check the 72-hour rule. Once a B2B invoice is validated by the NRS portal, you only have a small window to make corrections before it's locked for tax purposes.

## 5. Common Pitfalls to Avoid (The "Nigeria Factor")

Invoicing in Nigeria comes with unique challenges. Avoid these mistakes to keep your cash flow moving:

*   **Forgetting the "NUBAN"**: Always double-check your account number. A single typo means the money goes nowhere.
*   **Ignoring the 24-Hour B2C Rule**: If you are a retail business, the 2026 mandate requires you to report high-value sales to the NRS within 24 hours. Don't wait until the end of the month!
*   **Mixing Personal & Business Accounts**: Using a personal bank account for business invoices is a major red flag for the NRS in 2026. Open a dedicated business account.
*   **Vague Payment Terms**: Don't just say "Pay Soon." Say "Payment due within 7 days. 2% late fee applies after 14 days."

## 6. Frequently Asked Questions (FAQs)

**Can I still use a paper receipt in 2026?**
Technically, yes for very small, non-VAT registered informal sales. However, for any formal business transaction, a digital e-invoice is required for tax compliance.

**Is "Create Invoice Free" really free?**
Yes. Tools like Zoho Invoice and basic Excel templates are completely free. However, if you need advanced features like "Direct NRS Integration" (which automatically sends data to the government), some providers may charge a small monthly fee.

**What happens if my client rejects the invoice?**
In the 2026 MBS system, the buyer has 72 hours to reject an invoice. If they do, you must issue a "Credit Note" or a corrected invoice and resubmit it for validation.

## Conclusion: Take Action Today

The transition to digital invoicing isn't just a government requirement; it’s a professional upgrade. By choosing to create your invoices for free using digital tools, you are:

*   Saving money on printing and paper.
*   Protecting yourself from NRS penalties.
*   Positioning your business as a modern, trustworthy brand.

Don't wait until the tax office sends a notice to your door. The tools are free, the process is simple, and the benefits are endless.`,
        coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=2000', // Stock business image
        published: true,
        authorId: author.id,
    };

    // 3. Upsert the post (create or update if exists)
    const post = await prisma.blogPost.upsert({
        where: { slug: postData.slug },
        update: postData,
        create: postData,
    });

    console.log(`✅ Blog post created/updated: "${post.title}"`);
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
