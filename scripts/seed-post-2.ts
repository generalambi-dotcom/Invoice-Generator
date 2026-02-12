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
    console.log('Seeding second blog post...');

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
        title: 'Stop Stressing Over Paperwork: The Ultimate Guide to Using a Free Bill Generator',
        slug: 'stop-stressing-over-paperwork-ultimate-guide-free-bill-generator',
        excerpt: 'Let’s be real: nobody starts a business because they love paperwork. A free bill generator takes the "ugh" out of invoicing so you can get back to the work you actually enjoy. Here is how to look like a pro without spending a dime.',
        content: `Let’s be real for a second: nobody starts a business because they’re excited about paperwork. Whether you’re a freelance designer, a plumber, or just starting your own online shop, you’re in it for the craft, not the spreadsheets.

But then the work is done, and you’re hit with the "admin wall." You need to get paid, but the thought of opening Word or Excel to manually type out another invoice is enough to make anyone procrastinate. We’ve all been there, squinting at a screen and hoping we didn't mess up the math.

This is exactly why a free bill generator is a total game-changer. It takes the "ugh" out of invoicing so you can get back to the work you actually enjoy. In this guide, we’re going to break down how these tools work, why they’re a lifesaver for small businesses, and how you can use one to look like a total pro (without spending a dime).

## What is a Free Bill Generator?

Think of a free bill generator as your personal billing assistant that doesn’t take a lunch break. It’s an online tool designed to help you create polished, professional invoices without needing to master complex accounting software or pay for a monthly subscription.

Instead of starting from a blank page, you just fill in the blanks. The tool does the heavy lifting by formatting everything into a clean PDF that’s ready to send to your client in seconds.

## How It Works

1.  **Pick a Look**: Choose a template that fits your brand.
2.  **Fill in the Blanks**: Pop in your info, the client’s details, and what you’re charging for.
3.  **Let the Tool Do the Math**: It automatically adds up the subtotals, taxes, and discounts for you.
4.  **Send It Off**: Download it as a PDF or email it straight from the site.

## Why Every Small Business Needs One

Manual invoicing isn’t just slow; it’s risky. Did you know that nearly 39% of manual invoices have mistakes? Whether it’s a typo in the price or a math error, these little slips make you look less professional and, more importantly, they delay your payment.

### 1. You’ll Look Much More Professional

First impressions matter, but last impressions do too. Your invoice is often the final interaction a client has with you. A sleek, well-branded invoice shows that you’re a serious professional and not just someone doing a hobby on the side.

### 2. No More Math Headaches

The best part is automated math. You don’t have to pull out a calculator to figure out the tax or the total. The software handles the numbers, so you can be 100% confident that your bill is accurate every single time.

## Legal Requirements: What Must Your Invoice Include?

To make sure your invoice is "official" and helps you get paid without any legal hiccups, make sure it includes these essentials:

*   **The Word "Invoice"**: This needs to be right at the top.
*   **Invoice Number**: Keep these in order (001, 002, etc.) so you can track them easily.
*   **Your Info**: Your business name, address, and how to reach you.
*   **Client Info**: This is who you are billing, including their name and address.
*   **Itemized List**: A clear breakdown of what they’re paying for.
*   **The Total**: The subtotal, any tax, and the final "bottom line" amount.
*   **Payment Terms**: When is the money due and how should they send it?

## Frequently Asked Questions (FAQ)

**Is a free bill generator actually free?**
Yes! While some platforms offer "pro" versions for heavy-duty accounting, many tools allow you to create and download unlimited professional invoices at no cost.

**Do I need to create an account to use an invoice generator?**
It depends on the tool. Some allow you to generate a one-off PDF instantly, while others ask you to sign up so they can save your business info and client list for next time.

**Can I add my own logo to the invoice?**
Most high-quality generators allow you to upload your logo. This is highly recommended because it builds trust and makes your business look established.

**Is a PDF invoice legally valid?**
Absolutely. As long as it contains the required information (like your business details, tax info, and an itemized list of services), a PDF generated online is a perfectly legal document for tax and accounting purposes.

**Can I use a bill generator on my phone?**
Most modern generators are "mobile-responsive," meaning you can fill out the details and send an invoice right from your smartphone while you are still at a job site.

## Final Thoughts

At the end of the day, a free bill generator is about making your life easier. It cuts down on the boring stuff, keeps your records organized, and helps you get paid faster.

Ready to streamline your business? Use our free bill generator to create professional invoices in seconds and take the hassle out of getting paid.`,
        coverImage: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=2000', // Different stock image (office/paperwork vibe)
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
