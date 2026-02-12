import Link from 'next/link';
import { prisma } from '../../lib/db';
import { format } from 'date-fns';

export default async function BlogSidebar() {
    const recentPosts = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { title: true, slug: true, createdAt: true }
    });

    return (
        <div className="space-y-8">
            {/* Recent Posts Widget */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
                <div className="space-y-4">
                    {recentPosts.map((post) => (
                        <div key={post.slug} className="flex flex-col border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 last:pb-0">
                            <Link
                                href={`/blog/${post.slug}`}
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium line-clamp-2 transition-colors"
                            >
                                {post.title}
                            </Link>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {format(new Date(post.createdAt), 'MMM d, yyyy')}
                            </span>
                        </div>
                    ))}
                    {recentPosts.length === 0 && (
                        <p className="text-gray-500 text-sm">No posts yet.</p>
                    )}
                </div>
            </div>

            {/* Newsletter Placeholder */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">Subscribe</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Get the latest invoices tips and updates delivered to your inbox.
                </p>
                <form className="space-y-3" action="#" method="POST">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                    <button type="button" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                        Subscribe
                    </button>
                </form>
            </div>

            {/* Categories Placeholder (Optional) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Explore</h3>
                <div className="flex flex-wrap gap-2">
                    {['Business', 'Invoicing', 'Tax', 'Nigeria', 'SME'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
