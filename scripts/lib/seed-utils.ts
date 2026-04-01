import 'dotenv/config';
import { prisma } from '../../lib/db';

export type SeoArticle = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  content: string;
};

export async function bulkSeedArticles(articles: SeoArticle[]) {
  console.log(`Starting bulk seed for ${articles.length} articles...`);

  try {
    // 1. Find or create an author
    let author = await prisma.user.findFirst({
      where: { isAdmin: true }
    });

    if (!author) {
      author = await prisma.user.findFirst();
    }

    if (!author) {
      console.log("No users found. Creating Editorial Team user...");
      author = await prisma.user.create({
        data: {
          name: 'InvoiceGenerator Editorial Team',
          email: 'editor@invoicegenerator.ng',
          password: 'hashed-password-placeholder', // Dummy
          isAdmin: true,
          emailVerified: true
        }
      });
    }

    console.log(`Using Author: ${author.name} (${author.id})`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const article of articles) {
      const existing = await prisma.blogPost.findUnique({ where: { slug: article.slug } });
      
      const payload = {
        ...article,
        published: true,
        authorId: author.id
      };

      if (!existing) {
        await prisma.blogPost.create({ data: payload });
        console.log(`[Inserted]: ${article.title}`);
        insertedCount++;
      } else {
        await prisma.blogPost.update({
          where: { slug: article.slug },
          data: payload
        });
        console.log(`[Updated]: ${article.title}`);
        updatedCount++;
      }
    }

    console.log(`Successfully inserted ${insertedCount} new articles and updated ${updatedCount} existing articles.`);
  } catch (error) {
    console.error("Error during bulk seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
