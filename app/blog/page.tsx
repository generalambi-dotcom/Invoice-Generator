import BlogCard from '../../components/blog/BlogCard';
import BlogListFilter from '../../components/blog/BlogListFilter';
import Link from 'next/link';
import Image from 'next/image';

import { Metadata } from 'next';
import { prisma } from '../../lib/db';

// Flagship posts shown in the featured hero section
const FEATURED_SLUGS = [
    'firs-invoice-requirements-nigeria-2026',
    'how-to-register-for-vat-nigeria-firs-guide',
    'vat-invoice-format-nigeria',
    'invoice-generator-freelancers-nigeria',
    'best-invoice-app-small-businesses-nigeria',
    'how-to-get-paid-faster-nigeria',
];

export const revalidate = 60; // Revalidate every minute

export const metadata: Metadata = {
    title: { absolute: 'Nigerian Business & Invoicing Blog | InvoiceGenerator.ng' },
    description: 'Guides, insights, and resources to help Nigerian businesses manage invoicing better. Learn about FIRS compliance, VAT, freelancing, and tax best practices.',
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Nigerian Business & Invoicing Blog | InvoiceGenerator.ng',
        description: 'Guides, insights, and resources to help Nigerian businesses manage invoicing better.',
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

    const featuredPosts = FEATURED_SLUGS
        .map(slug => posts.find(p => p.slug === slug))
        .filter(Boolean) as typeof posts;

    const regularPosts = posts.filter(p => !FEATURED_SLUGS.includes(p.slug));

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Blog',
                        name: 'InvoiceGenerator.ng Blog',
                        description: 'Guides, insights, and resources to help Nigerian businesses manage invoicing, VAT, and FIRS compliance.',
                        url: 'https://www.invoicegenerator.ng/blog',
                        blogPost: posts.slice(0, 20).map((post) => ({
                            '@type': 'BlogPosting',
                            headline: post.title,
                            description: post.excerpt,
                            image: post.coverImage || undefined,
                            datePublished: post.createdAt.toISOString(),
                            author: {
                                '@type': 'Organization',
                                name: 'InvoiceGenerator.ng',
                            },
                            url: `https://www.invoicegenerator.ng/blog/${post.slug}`,
                        })),
                    }),
                }}
            />

            {/* Page Header */}
            <div className="bg-white border-b border-gray-100 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
                        Nigerian Business &amp; Invoicing Blog
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        Practical guides on FIRS compliance, VAT, invoicing best practices, and getting paid faster in Nigeria.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-2 mb-8">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 text-teal-800">
                                Essential Reads
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900">Start Here</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredPosts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col bg-white rounded-2xl border-2 border-teal-100 hover:border-teal-500 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    {post.coverImage && (
                                        <div className="relative h-44 w-full overflow-hidden">
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-1">
                                        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">Featured</span>
                                        <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                                        )}
                                        <span className="mt-4 text-teal-600 text-sm font-semibold group-hover:underline">
                                            Read guide →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Divider */}
                {featuredPosts.length > 0 && regularPosts.length > 0 && (
                    <div className="flex items-center gap-4 mb-10">
                        <div className="flex-1 border-t border-gray-200" />
                        <h2 className="text-lg font-bold text-gray-700 whitespace-nowrap">All Articles</h2>
                        <div className="flex-1 border-t border-gray-200" />
                    </div>
                )}

                {/* All Other Posts with Filter mechanism */}
                {regularPosts.length > 0 ? (
                    <BlogListFilter initialPosts={regularPosts} />
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">No posts found. Please check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
