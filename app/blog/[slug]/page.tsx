
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { prisma } from '../../../lib/db';
import BlogSidebar from '../../../components/blog/BlogSidebar';

/**
 * Sanitize markdown content for MDX rendering.
 * MDX treats curly braces as JSX expressions, so raw JSON/structured-data
 * blocks embedded in the markdown crash the renderer.
 * This strips JSON-LD blocks and escapes remaining stray braces.
 */
function sanitizeMdxContent(content: string): string {
  // 1. Remove full JSON-LD / schema blocks (multi-line JSON objects)
  let cleaned = content.replace(/```json[\s\S]*?```/g, (match) => match); // preserve fenced json
  
  // 2. Split by code fences so we only touch non-code content
  const parts = cleaned.split(/(```[\s\S]*?```|`[^`]+`)/g);
  
  const sanitized = parts.map((part, i) => {
    // Odd indices are code blocks — leave untouched
    if (i % 2 === 1) return part;
    
    // Remove standalone JSON-LD blocks (lines starting with { and ending with })
    let text = part.replace(/^\s*\{[\s\S]*?^\s*\}/gm, '');
    
    // Escape any remaining stray curly braces
    text = text.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    
    return text;
  });
  
  return sanitized.join('');
}

// Revalidate every 60 seconds so new/updated posts appear without a full redeploy
export const revalidate = 60;

// Allow slugs not pre-generated at build time to be rendered on-demand
export const dynamicParams = true;

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug: params.slug },
        });

        if (!post) {
            return {
                title: 'Post Not Found',
            };
        }

        // Trim excerpt to 150-160 chars for meta description
        const description = post.excerpt && post.excerpt.length > 160
            ? post.excerpt.substring(0, 157) + '...'
            : post.excerpt ?? undefined;

        return {
            title: { absolute: `${post.title} | InvoiceGenerator.ng` },
            description,
            alternates: {
                canonical: `/blog/${post.slug}`,
            },
            openGraph: {
                images: post.coverImage ? [post.coverImage] : [],
            },
        };
    } catch (error) {
        console.error(`Error generating metadata for ${params.slug}:`, error);
        return {
            title: 'Invoice Generator',
        };
    }
}

export async function generateStaticParams() {
    // Return empty array so pages are generated on-demand (ISR)
    // Prevents Vercel OOM errors during build time when processing 100+ MDX files
    return [];
}

export default async function BlogPostPage({ params }: PageProps) {
    let post;
    try {
        post = await prisma.blogPost.findUnique({
            where: { slug: params.slug },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
    } catch (error) {
        console.error(`Error fetching post for ${params.slug}:`, error);
        notFound();
    }

    if (!post) {
        notFound();
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: post.title,
                        description: post.excerpt || undefined,
                        image: post.coverImage ? [post.coverImage] : undefined,
                        datePublished: post.createdAt ? post.createdAt.toISOString() : undefined,
                        dateModified: post.updatedAt ? post.updatedAt.toISOString() : undefined,
                        url: `https://www.invoicegenerator.ng/blog/${post.slug}`,
                        author: {
                            '@type': 'Person',
                            name: post.author?.name || 'Invoice Generator Team',
                            url: 'https://www.invoicegenerator.ng',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'Invoice Generator',
                            url: 'https://www.invoicegenerator.ng',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://www.invoicegenerator.ng/logo.png',
                            },
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': `https://www.invoicegenerator.ng/blog/${post.slug}`,
                        },
                    }),
                }}
            />
            {/* Hero / Header - Full Width */}
            <div className="relative w-full h-[350px] md:h-[450px] bg-gray-900">
                {post.coverImage && (
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/90 to-transparent pt-32 pb-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Resources
                        </Link>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight max-w-4xl">
                            {post.title}
                        </h1>
                        <div className="flex items-center text-gray-300 space-x-4">
                            <div className="flex items-center">
                                <span className="font-medium">{post.author.name}</span>
                            </div>
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            <time dateTime={post.createdAt.toISOString()}>
                                {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                            </time>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Blog Content Column */}
                    <main className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-10">
                            <article className="prose prose-lg dark:prose-invert max-w-none 
                                    prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500
                                    prose-img:rounded-xl prose-img:shadow-lg
                                    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white">
                                <MDXRemote source={sanitizeMdxContent(post.content)} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
                            </article>
                        </div>
                    </main>

                    {/* Sidebar Column */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BlogSidebar />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
