import BlogCard from '../../components/blog/BlogCard';

import { Metadata } from 'next';
import { prisma } from '../../lib/db';

export const revalidate = 60; // Revalidate every minute

export const metadata: Metadata = {
    title: 'Blog - Invoice Generator',
    description: 'Insights, updates, and resources to help you manage your business better. Learn about invoicing, tax compliance, and freelancing in Nigeria.',
    openGraph: {
        title: 'Blog - Invoice Generator',
        description: 'Insights, updates, and resources to help you manage your business better.',
        type: 'website',
    },
};

export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: { name: true },
            },
        },
    });

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 sm:py-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Blog',
                        name: 'Invoice Generator Blog',
                        description: 'Insights, updates, and resources to help you manage your business better.',
                        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://invoicenaija.com'}/blog`,
                        blogPost: posts.map((post) => ({
                            '@type': 'BlogPosting',
                            headline: post.title,
                            description: post.excerpt,
                            image: post.coverImage || undefined,
                            datePublished: post.createdAt.toISOString(),
                            author: {
                                '@type': 'Person',
                                name: post.author.name,
                            },
                            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://invoicenaija.com'}/blog/${post.slug}`,
                        })),
                    }),
                }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Latest from the Blog
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Insights, updates, and resources to help you manage your business better.
                    </p>
                </div>

                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <BlogCard key={post.slug} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500 dark:text-gray-400">
                            No posts found. Please check back later.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
