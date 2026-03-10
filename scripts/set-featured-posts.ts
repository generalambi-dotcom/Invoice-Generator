import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// 6 flagship posts selected for maximum SEO and conversion impact
const featuredSlugs = [
    'firs-invoice-requirements-nigeria-2026',       // Top FIRS compliance post
    'how-to-register-for-vat-nigeria-firs-guide',   // High search volume VAT guide
    'vat-invoice-format-nigeria',                   // Core VAT topic
    'invoice-generator-freelancers-nigeria',        // High intent — freelancer audience
    'best-invoice-app-small-businesses-nigeria',    // High commercial intent comparison post
    'how-to-get-paid-faster-nigeria',              // Broad appeal, high shareability
];

async function main() {
    console.log('Setting featured posts...\n');

    // First unfeature everything
    await prisma.blogPost.updateMany({ data: { featured: false } });
    console.log('Cleared all existing featured flags.\n');

    for (const slug of featuredSlugs) {
        const post = await prisma.blogPost.update({
            where: { slug },
            data: { featured: true },
            select: { title: true, slug: true },
        });
        console.log(`⭐  ${post.title}`);
    }

    console.log(`\nDone — ${featuredSlugs.length} posts marked as featured.`);
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });
