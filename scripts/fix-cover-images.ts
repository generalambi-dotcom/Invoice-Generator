import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Curated Unsplash images — business/finance/Nigeria-appropriate
const coverImages: Record<string, string> = {
    'graphic-designer-invoice-template-nigeria':
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=2000',
    'how-to-write-a-quotation-in-nigeria':
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000',
    'late-payment-penalty-nigeria-interest-on-overdue-invoices':
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=2000',
    'how-to-invoice-as-a-consultant-nigeria':
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2000',
    'digital-marketing-invoice-template-nigeria':
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000',
    'how-to-create-a-recurring-invoice-nigeria':
        'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=2000',
    'how-to-invoice-as-a-photographer-nigeria':
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=2000',
    'business-invoice-vs-commercial-invoice-nigeria':
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000',
    'how-to-add-payment-link-to-invoice-nigeria':
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=2000',
    'how-to-invoice-as-a-web-developer-nigeria':
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2000',
    'credit-note-nigeria-what-it-is-how-to-issue':
        'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=2000',
    'invoice-number-format-nigeria':
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000',
    'how-to-write-invoice-for-services-rendered-nigeria':
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2000',
    'debit-note-nigeria-what-it-is-when-to-use':
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=2000',
    'how-to-invoice-international-clients-nigeria':
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=2000',
    'how-to-invoice-as-an-event-planner-nigeria':
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2000',
    'what-is-a-tax-invoice-nigeria':
        'https://images.unsplash.com/photo-1604594849809-dfedbc827105?auto=format&fit=crop&q=80&w=2000',
    'how-to-track-unpaid-invoices-nigeria':
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=2000',
    'how-to-invoice-as-a-caterer-nigeria':
        'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=2000',
    'invoice-template-sole-trader-nigeria':
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000',
    'how-to-write-a-receipt-nigeria':
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=2000',
    'best-invoice-app-small-businesses-nigeria':
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=2000',
    'how-to-invoice-as-a-tailor-fashion-designer-nigeria':
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=2000',
    'vat-exemption-nigeria-goods-and-services':
        'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?auto=format&fit=crop&q=80&w=2000',
};

async function main() {
    console.log('Updating cover images for posts missing them...\n');

    let updated = 0;
    let skipped = 0;

    for (const [slug, coverImage] of Object.entries(coverImages)) {
        const post = await prisma.blogPost.findUnique({ where: { slug } });
        if (!post) {
            console.log(`  ⚠️  Not found: ${slug}`);
            skipped++;
            continue;
        }
        if (post.coverImage) {
            console.log(`  ✓  Already has image: ${slug}`);
            skipped++;
            continue;
        }
        await prisma.blogPost.update({ where: { slug }, data: { coverImage } });
        console.log(`  ✅  Updated: ${slug}`);
        updated++;
    }

    console.log(`\nDone — ${updated} updated, ${skipped} skipped.`);
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });
