import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Setup Prisma Client for script execution
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: connectionString?.includes('supabase') ? { rejectUnauthorized: false } : undefined
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding fourth blog post...');

    // 1. Find the author "Olivia S"
    let author = await prisma.user.findFirst({
        where: { name: 'Olivia S' },
    });

    if (!author) {
        console.log('Author "Olivia S" not found. Falling back to any admin...');
        author = await prisma.user.findFirst({ where: { isAdmin: true } });
    }

    if (!author) {
        console.error('❌ No suitable author found.');
        process.exit(1);
    }

    console.log(`Found author: ${author.name} (${author.email})`);

    // 2. Define the blog post data
    const postData = {
        title: 'Why Every Nigerian Business Needs an Invoice Generator Tool in 2026',
        slug: 'why-nigerian-business-needs-invoice-generator-2026',
        excerpt: 'Running a business in Nigeria has always been about the hustle, but in 2026, the game has changed. With aggressive new FIRS digital compliance rules, a professional invoice generator is no longer a convenience—it’s a survival requirement.',
        content: `Running a business in Nigeria has always been about the hustle, but in 2026, the game has changed. With the Federal Inland Revenue Service (FIRS) rolling out aggressive new digital compliance rules and the Nigerian government updating tax laws to capture the digital economy, the days of scribbling totals on a piece of paper or sending a messy WhatsApp message are officially over.

Whether you are a freelancer in Lagos, a contractor in Abuja, or a retailer in Kano, a professional invoice generator tool isn’t just a convenience anymore. It is a survival requirement. Here is why your business needs to make the switch today to stay ahead of the curve.

## 1. Compliance with FIRS and New Tax Laws

The Nigerian government has significantly tightened the net on tax collection. New regulations now require businesses to maintain transparent, sequential, and verifiable records for Value Added Tax (VAT) and Withholding Tax (WHT) purposes.

Using a tool like **InvoiceGenerator.ng** helps you stay on the right side of the law by providing:

*   **Automatic VAT Calculation**: You no longer have to guess the current percentage. You can pop your tax rate into the dedicated "Additional Charges" field and the tool does the math for you.
*   **Sequential Numbering**: FIRS auditors look for consistency. A generator ensures your "Invoice Number" follows a logical order, which makes your tax filings much easier to defend during an audit.
*   **Detailed Records**: The "Detailed" view for company and client information allows you to include Tax Identification Numbers (TIN), which is increasingly mandatory for B2B transactions in Nigeria.

## 2. A Simple Guide to VAT and WHT on Your Invoices

One of the biggest headaches for Nigerian entrepreneurs is figuring out how to list taxes so that tax inspectors are satisfied. If you do not list these clearly, you risk fines or payment rejections from corporate clients.

### How to list VAT (Value Added Tax)
VAT is a consumption tax added to the price of your goods or services. On InvoiceGenerator.ng, you can use the Tax Rate (%) field under "Additional Charges". When you enter the current rate, the tool automatically adds a line item for VAT above the total. This shows the inspector exactly how much tax is being collected on behalf of the government.

### Handling WHT (Withholding Tax)
WHT is an advance payment of income tax that your client "withholds" and pays to the FIRS on your behalf. Since this is a deduction, you should mention it in the Notes or Terms & Conditions section. For example, you can write: *"Please note that a 5% WHT deduction applies to this invoice. Kindly provide the WHT credit note upon payment."* This ensures your bookkeeping stays clean and you don’t wonder why the money in your bank is less than your invoice total.

## 3. Professionalism in a Competitive Market

In a country where trust is the most valuable currency, how you present your bill matters. A polished invoice sent as a professional PDF signals that you are an established entity and not just a fly by night operation.

### Branding Your Business
The interface of InvoiceGenerator.ng allows you to upload your logo and choose professional themes like "Slate". This ensures that every time a client receives a bill, they see your brand identity front and center.

### Real-Time Accuracy
One of the best features is the "Auto-updates as you type" preview. You can see exactly how your branding, item descriptions, and totals look before you ever hit send. This eliminates those awkward follow up messages where you have to apologize for a mistake in the math.

## 4. Getting Paid Faster (The Liquidity Factor)

Cash flow is the lifeblood of any Nigerian SME. Payment delays are common, but they are often caused by unclear invoices that confuse the client's accounting department.

*   **Clear Bank Details**: Instead of typing your account number in an email body where it can be missed, use the dedicated Bank Details section. This keeps your payment info permanently anchored to the bill so it never gets lost.
*   **Specific Terms and Conditions**: Use the "Terms & Conditions" box to clearly state your late fee policy or your rules for "Payment on Delivery". Having this in writing reduces arguments and sets clear expectations from day one.
*   **Currency Support**: Since you can select NGN (₦) as your primary currency, there is zero confusion about the exchange rate or the final amount due for local transactions.

## 5. Better Record Keeping for the Future

When it’s time to apply for a bank loan or a government grant (like those offered by SMEDAN), the first thing they ask for is your financial history.

By using the **Show History** feature, you can keep track of what you’ve billed over time. Instead of digging through old emails or paper files, you have a digital trail of your business growth. This data is gold when you are trying to prove your turnover to a bank manager or an investor.

## Frequently Asked Questions (FAQ)

**Do I need to pay a subscription to stay compliant?**
No, you can use a free bill generator to create compliant invoices. The most important thing is that the information (TIN, VAT, Sequential Numbers) is present and accurate.

**Can I use this for international clients too?**
Yes, simply change the currency setting from NGN (₦) to USD ($) or any other currency required. The layout remains professional and globally accepted.

**What if I am not VAT-registered?**
If your business turnover is below the threshold required for VAT registration in Nigeria, you can simply leave the Tax Rate field at 0%. Your invoice will still look professional and remain valid for your records.

## Final Thoughts

The transition to a digital Nigeria is happening fast. Between the new FIRS digital filing requirements and the general shift toward professionalized SMEs, using a manual system is a liability.

A tool like **InvoiceGenerator.ng** gives you the power of a full accounting department for free. It handles the taxes, the formatting, and the record keeping so you can focus on what you do best: growing your business.

Ready to get compliant and get paid? Use our invoice generator tool to create your first professional, FIRS-ready invoice in seconds.`,
        coverImage: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=2000', // Business meeting / teamwork / Nigerian SME vibe
        published: true,
        authorId: author.id,
    };

    // 3. Upsert the post
    const post = await prisma.blogPost.upsert({
        where: { slug: postData.slug },
        update: postData,
        create: postData,
    });

    console.log(`✅ Blog post created: "${post.title}"`);
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
