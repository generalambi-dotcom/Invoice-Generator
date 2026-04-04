'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBusinessesAPI } from '@/lib/api-client';
import BusinessCard from '@/components/BusinessCard';
import { Search, Loader2, MapPin, Grid, Briefcase, Filter } from 'lucide-react';
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

  useEffect(() => {
    loadBusinesses();
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      
      {/* Premium Dark Local Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="w-full px-6 py-4 flex justify-between items-center max-w-[1600px] mx-auto">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <span className="text-white text-lg font-bold">I</span>
            </div>
            InvoiceGenerator.ng
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/businesses" className="text-sm font-medium text-white hover:text-blue-300 transition">Explore</Link>
            <Link href="/signin" className="text-sm font-medium text-white/90 hover:text-white transition">Sign in</Link>
            <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
              Add a listing
            </Link>
          </div>
        </div>
      </header>

      {/* Full Bleed Hero Section */}
      <section className="relative h-[65vh] min-h-[500px] w-full flex items-center justify-center">
        {/* Background Image (Coffee Shop/Business Vibe) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80")' }}
        >
           {/* Dark Premium Overlay from inspiration */}
           <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center mt-12">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            Discover great businesses <br className="hidden sm:block" /> in Nigeria
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-medium mb-12 drop-shadow-sm">
            Find trusted partners, creative agencies, and top-rated professionals.
          </p>

          {/* Floating Search Bar container (Inspiration 2) */}
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">
             <div className="flex-1 flex items-center px-4 py-3 md:border-r border-gray-100">
                <MapPin className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
                <input type="text" placeholder="Where to look?" className="w-full text-gray-700 outline-none placeholder-gray-400 font-medium" defaultValue="Lagos, Nigeria" />
             </div>
             
             <div className="flex-1 flex items-center px-4 py-3 md:border-r border-gray-100">
                <Briefcase className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
                <select 
                  className="w-full text-gray-700 outline-none bg-transparent font-medium cursor-pointer"
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                >
                  <option value="">All Categories</option>
                  {INDUSTRY_OPTIONS.map((niche: any) => (
                     <option key={niche.value} value={niche.value}>{niche.label}</option>
                  ))}
                </select>
             </div>

             <div className="flex-1 flex items-center px-4 py-3">
                <Search className="text-gray-400 w-5 h-5 mr-3 shrink-0" />
                <input type="text" placeholder="What are you looking for?" className="w-full text-gray-700 outline-none placeholder-gray-400 font-medium" />
             </div>
             
             <button className="bg-[#6B4CE6] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5b3ed9] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#6B4CE6]/30">
               <Search className="w-5 h-5" />
               Search
             </button>
          </div>
        </div>
      </section>

      {/* Main Container - 3 Column Layout */}
      <div className="flex-1 flex w-full relative">
         
         {/* LEFT COLUMN: Deep Filters (Screenshot 2 left side) */}
         <aside className="hidden lg:block w-[300px] shrink-0 bg-white border-r border-gray-200 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 80px)', position: 'sticky', top: 0 }}>
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
               <button 
                 onClick={() => setFilters({ industry: '', size: '', status: '' })}
                 className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1"
               >
                  <Filter className="w-3.5 h-3.5" /> Reset
               </button>
            </div>

            <div className="space-y-8">
               {/* Activity Filter */}
               <div>
                   <label className="block text-sm font-semibold text-gray-900 mb-3">Activity Status</label>
                   <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                      <button 
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${filters.status === '' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setFilters({...filters, status: ''})}
                      >All</button>
                      <button 
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${filters.status === 'active' ? 'bg-[#6B4CE6] shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setFilters({...filters, status: 'active'})}
                      >Active Now</button>
                   </div>
               </div>

               {/* Size Filter */}
               <div>
                   <label className="block text-sm font-semibold text-gray-900 mb-3">Company Size</label>
                   <div className="space-y-2">
                      {['1-5', '6-20', '21-50', '51-200', '200+'].map(size => (
                         <label key={size} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="size"
                              checked={filters.size === size}
                              onChange={() => setFilters({...filters, size})}
                              className="w-4 h-4 text-[#6B4CE6] border-gray-300 focus:ring-[#6B4CE6]"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{size} employees</span>
                         </label>
                      ))}
                   </div>
               </div>
            </div>
         </aside>

         {/* MIDDLE COLUMN: Grid Results */}
         <main className="flex-1 p-6 lg:p-8 min-w-0 bg-[#F5F7FA]">
             {/* Header Bar */}
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-gray-700 font-medium">
                    {loading ? 'Finding businesses...' : `Showing ${businesses.length} results`}
                </h3>
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                   <button className="p-1.5 bg-gray-100 rounded text-gray-900 shadow-sm"><Grid className="w-4 h-4" /></button>
                   <button className="p-1.5 text-gray-400 hover:text-gray-900"><MapPin className="w-4 h-4" /></button>
                </div>
             </div>

             {/* Results */}
             {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                   <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#6B4CE6]" />
                   <p className="font-medium">Curating the database...</p>
                </div>
             ) : businesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
                   <div className="w-16 h-16 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900">No places found</h3>
                   <p className="text-gray-500 max-w-sm mt-2 mb-6">
                       Try expanding your search radius or selecting a different category.
                   </p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {businesses.map((biz) => (
                        <BusinessCard key={biz.id} data={biz} />
                    ))}
                </div>
             )}
         </main>

         {/* RIGHT COLUMN: Interactive Maps Placeholder (Screenshot 2 right side) */}
         <aside className="hidden xl:block w-[450px] shrink-0 bg-gray-200 sticky top-0" style={{ height: '100vh' }}>
            <iframe 
               width="100%" 
               height="100%" 
               frameBorder="0" 
               style={{ border: 0 }} 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952912260219!2d3.375295414770757!3d6.5276316452784755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1620000000000!5m2!1sen!2sng" 
               allowFullScreen 
               loading="lazy"
               title="Business Map"
            ></iframe>
         </aside>

      </div>
    </div>
  );
}
