import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
    const posts = await prisma.blogPost.findMany({
        select: { slug: true, title: true, coverImage: true },
        orderBy: { createdAt: 'asc' },
    });

    const missing = posts.filter((p) => !p.coverImage);
    const present = posts.filter((p) => p.coverImage);

    console.log(`Total posts: ${posts.length}`);
    console.log(`With cover image: ${present.length}`);
    console.log(`Missing cover image: ${missing.length}\n`);

    if (missing.length > 0) {
        console.log('Posts missing cover image:');
        missing.forEach((p) => console.log(`  - ${p.slug}`));
    }
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });
