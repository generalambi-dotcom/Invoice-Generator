const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching published blog posts...');
        const posts = await prisma.blogPost.findMany({
            where: { published: true },
            select: { slug: true, title: true }
        });
        console.log(`Found ${posts.length} published posts:`);
        posts.forEach(p => console.log(`- ${p.title} (${p.slug})`));
    } catch (e) {
        console.error('Error fetching posts:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
