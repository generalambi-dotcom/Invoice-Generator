import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface BlogPostWithAuthor {
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
    author: {
        name: string;
    };
}

interface BlogCardProps {
    post: BlogPostWithAuthor;
}

export default function BlogCard({ post }: BlogCardProps) {
    const { title, createdAt, excerpt, coverImage, author } = post;

    return (
        <div className="group flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
            <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">No Image</span>
                    </div>
                )}
            </Link>

            <div className="flex flex-col flex-grow p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                    <span>{format(new Date(createdAt), 'MMM d, yyyy')}</span>
                    {author?.name && (
                        <>
                            <span>•</span>
                            <span>{author.name}</span>
                        </>
                    )}
                </div>

                <Link href={`/blog/${post.slug}`} className="block mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {title}
                    </h3>
                </Link>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
                    {excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center"
                    >
                        Read more
                        <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
