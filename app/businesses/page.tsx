'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBusinessesAPI } from '@/lib/api-client';
import BusinessCard from '@/components/BusinessCard';
import { Search, Loader2, MapPin, Grid, Briefcase, ChevronRight, PenTool, Wrench, Scissors, Laptop, CheckCircle2 } from 'lucide-react';
import { INDUSTRY_OPTIONS } from '@/lib/profile-completeness';

export default function BusinessesDirectoryPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    size: '',
    status: '',
    q: ''
  });

  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [searchModeActive, setSearchModeActive] = useState(false);
  const [searchTab, setSearchTab] = useState<'search'|'enquire'>('search');

  const executeSearch = async (forceIndustry?: string) => {
    setLoading(true);
    setSearchModeActive(true);
    
    // Automatically jump to search mode 
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const currentFilters = { ...filters, q: searchInput };
      if (forceIndustry) currentFilters.industry = forceIndustry;
      
      const data = await getBusinessesAPI(currentFilters);
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Failed to load businesses', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchModeActive(false);
    setSearchInput('');
    setLocationInput('');
    setFilters({ industry: '', size: '', status: '', q: '' });
    setBusinesses([]);
  };

  // If filters change (like industry dropdown inside search view), refresh automatically
  useEffect(() => {
    if (searchModeActive && filters.industry !== '') {
      executeSearch();
    }
  }, [filters.industry]);

  const TRENDING_CATEGORIES = [
    { icon: Wrench, title: 'Contractors', desc: 'Find a top trader to fix or replace your pipes & appliances', query: 'Construction' },
    { icon: Scissors, title: 'Creative Agencies', desc: 'Browse professionals & top-rated agencies for your new campaign', query: 'Media & Entertainment' },
    { icon: PenTool, title: 'Consultants', desc: 'Bring in local experts to refresh your business strategy, inside & out', query: 'Consulting' },
    { icon: Laptop, title: 'IT Specialists', desc: 'Find a top rated tech consultant for your digital and IT needs', query: 'Technology' },
  ];

  return (
    <div className="min-h-screen bg-amber-50/30 font-sans">
      
      {/* Premium Dark Local Header */}
      <header className="relative z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-4 flex justify-between items-center max-w-[1600px] mx-auto">
          <Link href="/" className="flex items-center gap-2 text-gray-900 font-bold text-2xl tracking-tight" onClick={clearSearch}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
               <span className="text-yellow-400 text-lg font-bold">I</span>
            </div>
            InvoiceNaija<span className="text-sm font-medium text-gray-500 mt-1.5 ml-1 hidden sm:inline">Business</span>
          </Link>
          <div className="flex items-center gap-3 md:gap-8">
            <Link href="/" className="hidden md:block text-sm font-semibold text-gray-700 hover:text-black">Post your enquiry</Link>
            <Link href="/blog" className="hidden md:block text-sm font-semibold text-gray-700 hover:text-black">Blog</Link>
            <div className="flex items-center gap-3">
               <Link href="/signin" className="text-sm font-bold text-gray-800 bg-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-500 transition shadow-sm flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                 Log in
               </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Yell Hero Area */}
      <section className="relative w-full overflow-hidden flex flex-col md:flex-row min-h-[500px] md:h-[60vh] bg-gray-900">
        
        {/* White Search Box Layer (Left Overhang on Desktop) */}
        <div className="relative z-20 w-full md:w-5/12 lg:w-[400px] bg-white md:h-full flex flex-col justify-center px-4 md:px-12 py-8 md:py-0 shrink-0 shadow-2xl">
           <div className="max-w-md mx-auto w-full">
              {/* Tabs */}
              <div className="flex w-full mb-6 border border-gray-200 rounded-lg overflow-hidden font-bold">
                 <button onClick={() => setSearchTab('search')} className={`flex-1 py-3 text-sm ${searchTab === 'search' ? 'bg-yellow-400 text-black' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Search</button>
                 <button onClick={() => setSearchTab('enquire')} className={`flex-1 py-3 text-sm border-l border-gray-200 ${searchTab === 'enquire' ? 'bg-yellow-400 text-black' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Enquire</button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search businesses..." 
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium text-gray-900 placeholder-gray-500"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && executeSearch()}
                    />
                 </div>
                 <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Town, city or postcode" 
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none font-medium text-gray-900 placeholder-gray-500"
                      value={locationInput}
                      onChange={e => setLocationInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && executeSearch()}
                    />
                 </div>
                 
                 <button 
                  onClick={() => executeSearch()} 
                  className="w-full bg-black text-white hover:bg-gray-900 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg mt-2 flex items-center justify-center gap-2"
                 >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    Search
                 </button>
              </div>
           </div>
        </div>

        {/* Right Hero Image Area */}
        <div className="relative w-full md:w-auto md:flex-1 h-[400px] md:h-full flex items-center">
             <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2674")' }}
             >
                <div className="absolute inset-0 bg-black/40"></div>
             </div>
             <div className="relative z-10 px-8 lg:px-16 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg leading-tight">
                  <span className="text-yellow-400">InvoiceNaija</span> - your marketplace <br />for local services
                </h1>
             </div>
        </div>

      </section>

      {/* Conditionally Render Content vs Search Results */}
      {!searchModeActive ? (
        <div className="w-full bg-amber-50/50">
          <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
            
            {/* Promo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
               {/* Enquire Fast Card */}
               <div className="bg-yellow-400 rounded-xl overflow-hidden shadow-sm flex flex-col sm:flex-row h-auto sm:h-[300px]">
                  <div className="p-8 sm:w-1/2 flex flex-col justify-center">
                     <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">No time to search?</h2>
                     <p className="text-lg text-gray-800 font-medium mb-8">Simply share details to connect with the best businesses for the job</p>
                     <button className="self-start border-2 border-black text-black font-bold px-6 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors uppercase tracking-wide text-sm">
                        Post your enquiry
                     </button>
                  </div>
                  <div className="hidden sm:block sm:w-1/2 h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&q=80&w=1400")' }}>
                  </div>
               </div>

               {/* Grow Business Card */}
               <div className="bg-[#2B2B2B] rounded-xl overflow-hidden shadow-sm flex flex-col sm:flex-row h-auto sm:h-[300px]">
                  <div className="p-8 sm:w-1/2 flex flex-col justify-center">
                     <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Want to grow your business?</h2>
                     <p className="text-lg text-gray-200 font-medium mb-8">Create your free business profile to reach more customers online</p>
                     <Link href="/signup" className="self-start border-2 border-white text-white font-bold px-6 py-2.5 rounded-lg hover:bg-white hover:text-black transition-colors uppercase tracking-wide text-sm">
                        Get started
                     </Link>
                  </div>
                  <div className="hidden sm:block sm:w-1/2 h-full bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=1400")' }}>
                  </div>
               </div>
            </div>

            {/* Trending Categories */}
            <div className="text-center mb-16">
               <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Trending Categories</h2>
               <p className="text-xl text-gray-600 font-medium">Easily find, connect with, and buy from great businesses near you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
               {TRENDING_CATEGORIES.map((cat, idx) => {
                 const Icon = cat.icon;
                 return (
                   <div key={idx} className="flex flex-col items-center text-center group cursor-pointer" onClick={() => executeSearch(cat.query)}>
                      <div className="w-24 h-24 mb-6 relative">
                         {/* Yellow Accent */}
                         <div className="absolute inset-0 bg-yellow-400 rounded-lg transform rotate-6 drop-shadow-sm group-hover:rotate-12 transition-transform duration-300"></div>
                         <div className="absolute inset-0 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                            <Icon className="w-10 h-10 text-black stroke-[1.5]" />
                         </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{cat.title}</h3>
                      <p className="text-sm font-medium text-gray-600 mb-6 flex-1 px-4 leading-relaxed">{cat.desc}</p>
                      <button className="border border-gray-300 text-gray-800 font-bold px-6 py-2.5 rounded-lg group-hover:border-black group-hover:bg-black group-hover:text-white transition-colors text-sm w-max mx-auto shadow-sm">
                         Discover
                      </button>
                   </div>
                 );
               })}
            </div>

            {/* Fresh from our blog */}
            <div className="border-t border-gray-200 pt-16 mb-16">
               <div className="flex items-center gap-2 mb-8 cursor-pointer group w-max">
                 <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight group-hover:text-amber-600 transition-colors">Fresh from our blog</h2>
                 <ChevronRight className="w-6 h-6 text-gray-900 mt-1" />
               </div>

               <div className="flex flex-wrap gap-3 mb-10">
                 <span className="px-5 py-2.5 bg-gray-200/80 text-sm font-bold text-gray-800 rounded-md cursor-pointer hover:bg-gray-300">Creative & Media</span>
                 <span className="px-5 py-2.5 bg-gray-200/80 text-sm font-bold text-gray-800 rounded-md cursor-pointer hover:bg-gray-300">Business & Finance</span>
                 <span className="px-5 py-2.5 bg-gray-200/80 text-sm font-bold text-gray-800 rounded-md cursor-pointer hover:bg-gray-300">Consulting</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Blog Mock 1 */}
                  <div className="group cursor-pointer">
                     <div className="h-56 bg-gray-200 rounded-2xl mb-5 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Blog" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600">How to price your digital agency services in 2026</h3>
                     <p className="text-gray-600 mb-4 line-clamp-2">A complete guide to hourly rates vs value-based pricing: find out what you should charge clients.</p>
                     <span className="text-sm font-bold border-b border-black pb-0.5 group-hover:border-amber-600 group-hover:text-amber-600">Read more</span>
                  </div>
                  {/* Blog Mock 2 */}
                  <div className="group cursor-pointer">
                     <div className="h-56 bg-gray-200 rounded-2xl mb-5 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Blog" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600">Managing cash flow when invoices are paid late</h3>
                     <p className="text-gray-600 mb-4 line-clamp-2">Planning your financial runway? Here is a clear breakdown of typical costs and how to hedge them.</p>
                     <span className="text-sm font-bold border-b border-black pb-0.5 group-hover:border-amber-600 group-hover:text-amber-600">Read more</span>
                  </div>
                  {/* Blog Mock 3 */}
                  <div className="group cursor-pointer">
                     <div className="h-56 bg-gray-200 rounded-2xl mb-5 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Blog" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600">Do you need a dedicated accountant for your startup?</h3>
                     <p className="text-gray-600 mb-4 line-clamp-2">Has your tax load become unbearable? A quick financial swap can fix it in a few quarters.</p>
                     <span className="text-sm font-bold border-b border-black pb-0.5 group-hover:border-amber-600 group-hover:text-amber-600">Read more</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      ) : (
        /* SEARCH RESULTS RENDER - Standard List View */
        <div className="w-full max-w-[1400px] mx-auto px-6 py-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-4">
                <div>
                   <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                      Search Results for &quot;{searchInput}&quot; {locationInput && `in ${locationInput}`} {filters.industry && `- ${filters.industry}`}
                   </h2>
                   <p className="text-gray-500 font-medium">
                      {loading ? 'Finding businesses...' : `Showing ${businesses.length} trusted professionals`}
                   </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                   <select 
                     className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold text-gray-700 outline-none hover:bg-gray-50 shadow-sm"
                     value={filters.industry}
                     onChange={(e) => setFilters({...filters, industry: e.target.value})}
                   >
                     <option value="">All Categories</option>
                     {INDUSTRY_OPTIONS.map((niche: any) => (
                        <option key={niche.value} value={niche.value}>{niche.label}</option>
                     ))}
                   </select>
                   <button onClick={clearSearch} className="text-sm font-bold text-gray-500 hover:text-black hover:underline cursor-pointer">
                      Clear Search
                   </button>
                </div>
             </div>

             {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
                   <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#6B4CE6]" />
                   <p className="font-bold text-lg text-gray-900">Querying database...</p>
                </div>
             ) : businesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 text-center shadow-sm">
                   <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
                      <Search className="w-8 h-8 text-yellow-500" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900">No professionals found</h3>
                   <p className="text-gray-500 max-w-sm mt-2 mb-6">
                       Try expanding your search query or removing the category filter.
                   </p>
                   <button onClick={clearSearch} className="text-sm font-bold text-black border-b-2 border-black pb-0.5">
                      Back to Directory
                   </button>
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {businesses.map((biz) => (
                        <BusinessCard key={biz.id} data={biz} />
                    ))}
                </div>
             )}
        </div>
      )}

    </div>
  );
}
