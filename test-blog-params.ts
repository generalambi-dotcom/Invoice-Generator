import 'dotenv/config';
import { prisma } from './lib/db';

async function main() {
    try {
        console.log('Testing connection via lib/db...');
        const posts = await prisma.blogPost.findMany({
            where: { published: true },
            select: { slug: true }
        });
        console.log(`Successfully fetched ${posts.length} posts.`);
        posts.forEach(p => console.log(`- ${p.slug}`));
    } catch (error) {
        console.error('Error fetching posts:', error);
        process.exit(1);
    }
}

main();
