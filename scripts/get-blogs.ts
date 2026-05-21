import { prisma } from '../lib/db';
async function main() {
    const posts = await prisma.blogPost.findMany({ select: { slug: true, title: true }});
    console.log(JSON.stringify(posts, null, 2));
}
main().catch(console.error).finally(() => process.exit(0));
