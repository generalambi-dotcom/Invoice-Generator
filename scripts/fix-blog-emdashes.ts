/**
 * Fix all blog posts in the database:
 * 1. Replace em dashes (—) with regular dashes (-)
 * 2. Log which posts were affected
 */
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

function removeEmDashes(text: string): string {
    // Replace em dashes with regular hyphens
    // Handle various patterns:
    //   "word—word"    → "word - word"
    //   "word — word"  → "word - word"  
    //   "word —word"   → "word - word"
    //   "word— word"   → "word - word"
    return text.replace(/\s*—\s*/g, ' - ');
}

async function main() {
    console.log('Fixing em dashes in all blog posts...\n');

    const posts = await prisma.blogPost.findMany({
        select: { id: true, title: true, slug: true, content: true, excerpt: true },
    });

    console.log(`Found ${posts.length} blog posts to check.\n`);

    let updatedCount = 0;

    for (const post of posts) {
        const hasEmDashInContent = post.content.includes('—');
        const hasEmDashInExcerpt = post.excerpt?.includes('—') ?? false;
        const hasEmDashInTitle = post.title.includes('—');

        if (!hasEmDashInContent && !hasEmDashInExcerpt && !hasEmDashInTitle) {
            continue;
        }

        const newContent = removeEmDashes(post.content);
        const newExcerpt = post.excerpt ? removeEmDashes(post.excerpt) : post.excerpt;
        const newTitle = removeEmDashes(post.title);

        await prisma.blogPost.update({
            where: { id: post.id },
            data: {
                content: newContent,
                excerpt: newExcerpt,
                title: newTitle,
            },
        });

        updatedCount++;
        const locations: string[] = [];
        if (hasEmDashInContent) locations.push('content');
        if (hasEmDashInExcerpt) locations.push('excerpt');
        if (hasEmDashInTitle) locations.push('title');
        console.log(`✅  Fixed: "${post.title}" [${locations.join(', ')}]`);
    }

    console.log(`\nDone — updated ${updatedCount} of ${posts.length} posts.`);
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
