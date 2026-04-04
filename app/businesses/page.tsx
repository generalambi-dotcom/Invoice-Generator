'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBusinessesAPI } from '@/lib/api-client';
import BusinessCard from '@/components/BusinessCard';
import { Search, Loader2 } from 'lucide-react';
import { INDUSTRY_OPTIONS } from '@/lib/profile-completeness';

export default function BusinessesDirectoryPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    industry: '',
    size: '',
    status: ''
  });

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await getBusinessesAPI(filters);
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Failed to load businesses', error);
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when filters change
  useEffect(() => {
    loadBusinesses();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Platform Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold text-xl text-blue-600">
              InvoiceGenerator.ng
            </Link>
            <div className="flex items-center gap-4">
               <Link href="/signin" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">Log In</Link>
               <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16 sm:py-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Discover active businesses in Nigeria
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto opacity-90">
            Verified by real invoicing activity from InvoiceGenerator users. Find trusted partners, suppliers, and clients today.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-col md:flex-row flex-1 w-full">
         
         {/* Filters Sidebar */}
         <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-8">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Search className="w-4 h-4 text-gray-400" />
                   Filter businesses
                </h2>

                <div className="space-y-5">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                       <select 
                         className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 p-2"
                         value={filters.industry}
                         onChange={(e) => setFilters({...filters, industry: e.target.value})}
                       >
                         <option value="">All Industries</option>
                         {INDUSTRY_OPTIONS.map((niche: any) => (
                             <option key={niche.value} value={niche.value}>{niche.label}</option>
                         ))}
                       </select>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1.5">Location (State)</label>
                       <select className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 p-2" disabled>
                         <option value="">All Nigeria</option>
                         <option value="lagos">Lagos</option>
                         <option value="abuja">Abuja</option>
                       </select>
                       <p className="text-xs text-gray-400 mt-1">Location filter coming soon</p>
                   </div>
                   
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Size</label>
                       <select 
                         className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 p-2"
                         value={filters.size}
                         onChange={(e) => setFilters({...filters, size: e.target.value})}
                       >
                         <option value="">Any Size</option>
                         <option value="1-5">1-5 employees</option>
                         <option value="6-20">6-20 employees</option>
                         <option value="21-50">21-50 employees</option>
                         <option value="51-200">51-200 employees</option>
                         <option value="200+">200+ employees</option>
                       </select>
                   </div>

                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1.5">Activity</label>
                       <select 
                         className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 p-2"
                         value={filters.status}
                         onChange={(e) => setFilters({...filters, status: e.target.value})}
                       >
                         <option value="">All Businesses</option>
                         <option value="active">Active this month</option>
                       </select>
                   </div>

                   <button 
                     onClick={() => setFilters({ industry: '', size: '', status: '' })}
                     className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium py-2 rounded-lg hover:bg-blue-50"
                   >
                       Reset Filters
                   </button>
                </div>
            </div>
         </aside>

         {/* Results Area */}
         <main className="flex-1 min-w-0">
             
             {/* Results Header */}
             <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">
                    {loading ? 'Finding businesses...' : `Showing ${businesses.length} businesses`}
                </h3>
             </div>

             {/* Dynamic State Handler */}
             {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                   <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                   <p>Searching the registry...</p>
                </div>
             ) : businesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                   <Search className="w-12 h-12 text-gray-300 mb-3" />
                   <h3 className="text-lg font-medium text-gray-900">No businesses found</h3>
                   <p className="text-gray-500 max-w-sm mt-1 mb-6">
                       Try adjusting your filters or search criteria. More businesses are joining every day.
                   </p>
                   <button 
                     onClick={() => setFilters({ industry: '', size: '', status: '' })}
                     className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition"
                   >
                       Clear Filters
                   </button>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {businesses.map((biz) => (
                        <BusinessCard key={biz.id} data={biz} />
                    ))}
                </div>
             )}

         </main>
      </div>

    </div>
  );
}
