'use client';

import React, { useState, useMemo } from 'react';
import BlogCard from './BlogCard';

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
    author: {
        name: string;
    };
}

// Simple categorization based on keywords in titles
const CATEGORIES = [
    { id: 'all', label: 'All Posts', keywords: [] },
    { id: 'tax', label: 'Tax & VAT', keywords: ['tax', 'vat', 'firs', 'withholding'] },
    { id: 'invoicing', label: 'Invoicing', keywords: ['invoice', 'invoicing', 'receipt', 'payment'] },
    { id: 'business', label: 'Business & Growth', keywords: ['business', 'growth', 'sme', 'startup', 'strategy'] },
    { id: 'freelance', label: 'Freelancing', keywords: ['freelance', 'freelancer', 'gig'] }
];

export default function BlogListFilter({ initialPosts }: { initialPosts: Post[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            // Text Search Filter
            const matchesSearch = 
                searchQuery === '' || 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (post.excerpt?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Category Filter
            if (activeCategory === 'all') return true;
            
            const categoryObj = CATEGORIES.find(c => c.id === activeCategory);
            if (!categoryObj) return true;

            const postText = (post.title + ' ' + (post.excerpt || '')).toLowerCase();
            return categoryObj.keywords.some(keyword => postText.includes(keyword));
        });
    }, [initialPosts, searchQuery, activeCategory]);

    return (
        <div className="space-y-8">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:text-sm transition-colors"
                        placeholder="Search guides, articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                activeCategory === category.id
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>



            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No articles found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        We couldn't find any articles matching your search criteria.
                    </p>
                    <button 
                        onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                        className="mt-6 text-sm font-medium text-green-600 hover:text-green-500"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
}
