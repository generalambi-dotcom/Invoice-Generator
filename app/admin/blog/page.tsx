'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    published: boolean;
    createdAt: string;
    author: { name: string } | null;
}

export default function AdminBlogListPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        try {
            const res = await fetch('/api/blog/posts?published=false');
            if (!res.ok) throw new Error('Failed to fetch posts');
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            toast.error('Could not load posts');
        } finally {
            setLoading(false);
        }
    }

    async function togglePublished(post: Post) {
        setTogglingSlug(post.slug);
        try {
            const res = await fetch(`/api/blog/posts/${post.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: post.title,
                    content: undefined,
                    excerpt: post.excerpt,
                    coverImage: undefined,
                    published: !post.published,
                }),
            });
            if (!res.ok) throw new Error('Update failed');
            setPosts(prev =>
                prev.map(p => p.slug === post.slug ? { ...p, published: !p.published } : p)
            );
            toast.success(post.published ? 'Post unpublished' : 'Post published');
        } catch {
            toast.error('Failed to update post');
        } finally {
            setTogglingSlug(null);
        }
    }

    const filtered = posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    const published = filtered.filter(p => p.published);
    const drafts = filtered.filter(p => !p.published);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading posts...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin')}
                            className="text-sm text-gray-500 hover:text-gray-900"
                        >
                            ← Admin
                        </button>
                        <span className="text-gray-300">/</span>
                        <h1 className="text-xl font-bold text-gray-900">Blog Posts</h1>
                    </div>
                    <Link
                        href="/admin/blog/create"
                        className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        + New Post
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
                        <div className="text-sm text-gray-500 mt-1">Total Posts</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-3xl font-bold text-teal-600">{posts.filter(p => p.published).length}</div>
                        <div className="text-sm text-gray-500 mt-1">Published</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <div className="text-3xl font-bold text-amber-500">{posts.filter(p => !p.published).length}</div>
                        <div className="text-sm text-gray-500 mt-1">Drafts</div>
                    </div>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search by title or slug..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                />

                {/* Drafts first — most actionable */}
                {drafts.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-600 mb-3">
                            Drafts ({drafts.length})
                        </h2>
                        <PostTable
                            posts={drafts}
                            togglingSlug={togglingSlug}
                            onToggle={togglePublished}
                        />
                    </section>
                )}

                {published.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700 mb-3">
                            Published ({published.length})
                        </h2>
                        <PostTable
                            posts={published}
                            togglingSlug={togglingSlug}
                            onToggle={togglePublished}
                        />
                    </section>
                )}

                {filtered.length === 0 && (
                    <p className="text-center text-gray-400 py-16">No posts found.</p>
                )}
            </div>
        </div>
    );
}

function PostTable({
    posts,
    togglingSlug,
    onToggle,
}: {
    posts: Post[];
    togglingSlug: string | null;
    onToggle: (post: Post) => void;
}) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Title</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {posts.map(post => (
                        <tr key={post.slug} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4">
                                <div className="font-medium text-gray-900 text-sm leading-snug">{post.title}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{post.slug}</div>
                            </td>
                            <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    post.published
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {post.published ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {new Date(post.createdAt).toLocaleDateString('en-NG', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => onToggle(post)}
                                        disabled={togglingSlug === post.slug}
                                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                            post.published
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-teal-600 text-white hover:bg-teal-700'
                                        }`}
                                    >
                                        {togglingSlug === post.slug
                                            ? '...'
                                            : post.published ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <Link
                                        href={`/admin/blog/${post.slug}/edit`}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                                    >
                                        Edit
                                    </Link>
                                    {post.published && (
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            View ↗
                                        </Link>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
