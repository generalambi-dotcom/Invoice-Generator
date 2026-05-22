'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface FormData {
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    published: boolean;
}

export default function EditBlogPostPage() {
    const router = useRouter();
    const { slug } = useParams<{ slug: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        excerpt: '',
        content: '',
        coverImage: '',
        published: false,
    });

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/blog/posts/${slug}`);
                if (res.status === 404) { setNotFound(true); return; }
                if (!res.ok) throw new Error('Failed to load');
                const post = await res.json();
                setFormData({
                    title: post.title ?? '',
                    excerpt: post.excerpt ?? '',
                    content: post.content ?? '',
                    coverImage: post.coverImage ?? '',
                    published: post.published ?? false,
                });
            } catch {
                toast.error('Could not load post');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
            const res = await fetch(`/api/blog/posts/${slug}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`,
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Save failed');
            }
            toast.success('Post saved');
            router.push('/admin/blog');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: data });
            if (!res.ok) throw new Error('Upload failed');
            const json = await res.json();
            setFormData(f => ({ ...f, coverImage: json.url }));
        } catch {
            toast.error('Image upload failed');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-700 font-medium">Post not found: <code>{slug}</code></p>
                <button onClick={() => router.push('/admin/blog')} className="text-teal-600 hover:underline text-sm">
                    ← Back to posts
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin/blog')}
                            className="text-sm text-gray-500 hover:text-gray-900"
                        >
                            ← Blog Posts
                        </button>
                        <span className="text-gray-300">/</span>
                        <h1 className="text-xl font-bold text-gray-900">Edit Post</h1>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        formData.published ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                        {formData.published ? 'Published' : 'Draft'}
                    </span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">Slug: <code>{slug}</code> (cannot be changed here)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={e => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none h-20 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        />
                        {formData.coverImage && (
                            <div className="mt-3 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
                                <Image src={formData.coverImage} alt="Cover preview" fill className="object-cover" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                        <textarea
                            value={formData.content}
                            onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none h-96 font-mono text-sm resize-y"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id="published"
                            checked={formData.published}
                            onChange={e => setFormData(f => ({ ...f, published: e.target.checked }))}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="published" className="text-sm font-medium text-gray-700">
                            Published — visible on the blog
                        </label>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/admin/blog')}
                            className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
