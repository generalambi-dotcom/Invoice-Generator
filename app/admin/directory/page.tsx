'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default function AdminDirectoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 50 });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    if (!currentUser.isAdmin) {
      router.push('/');
      return;
    }
    setUser(currentUser);
    loadData(1);
  }, []);

  const loadData = async (pageNum: number) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', pageNum.toString());
      searchParams.set('limit', '50');
      if (search) searchParams.set('search', search);

      const res = await fetch(`/api/admin/directory?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setBusinesses(data.businesses);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      loadData(page - 1);
    }
  };

  const handleNext = () => {
    if (page < pagination.pages) {
      setPage(page + 1);
      loadData(page + 1);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Business Directory Admin</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Opted-In Businesses ({pagination.total})</h2>
              <p className="text-sm text-gray-500">Users who have chosen to list their business publicly.</p>
            </div>
            <form onSubmit={handleSearch} className="flex max-w-sm w-full">
              <input
                type="text"
                placeholder="Search name, email, industry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 font-medium">
                Search
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Privacy Settings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading directory...</td></tr>
                ) : businesses.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No matching businesses found.</td></tr>
                ) : (
                  businesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 truncate max-w-[200px]" title={biz.name}>{biz.name || 'Anonymous Business'}</div>
                        {!biz.dirShowName && <span className="inline-block mt-1 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">Name Hidden</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biz.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biz.industry || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biz.companySize || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex gap-1.5 flex-wrap w-48">
                           {biz.dirShowName && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Name</span>}
                           {biz.dirShowIndustry && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Industry</span>}
                           {biz.dirShowLocation && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Location</span>}
                           {biz.dirShowSize && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Size</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                           href={`/businesses/${biz.id}`} 
                           target="_blank" 
                           className="text-white bg-[#6B4CE6] px-3 py-1.5 rounded-lg text-xs hover:bg-[#5b3ed9] transition-colors"
                        >
                           View Profile
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
