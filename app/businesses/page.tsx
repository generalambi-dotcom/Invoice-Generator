'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBusinessesAPI } from '@/lib/api-client';
import BusinessCard from '@/components/BusinessCard';
import { Search, Loader2, MapPin, ChevronRight } from 'lucide-react';
import { INDUSTRY_OPTIONS } from '@/lib/profile-completeness';

export default function BusinessesDirectoryPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  const executeSearch = (categoryStr?: string) => {
    const service = categoryStr || searchInput;
    const query = new URLSearchParams();
    if (service) query.set('service', service);
    if (locationInput) query.set('location', locationInput);
    
    router.push(`/businesses/enquire?${query.toString()}`);
  };

  // Load latest posts
  useEffect(() => {
    const loadPosts = async () => {
       try {
         const res = await fetch('/api/blog/posts');
         if (res.ok) {
           const data = await res.json();
           setLatestPosts(data.slice(0, 3));
         }
       } catch (error) {
         console.error('Failed to load blog posts', error);
       }
    };
    loadPosts();
  }, []);

  const CATEGORIES = [
    {
      title: 'Home and Garden',
      items: [
        { name: 'House Cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600', query: 'Cleaning' },
        { name: 'Gardening', img: 'https://images.unsplash.com/photo-1416879598555-2571ad4c62fb?auto=format&fit=crop&q=80&w=600', query: 'Gardening' },
        { name: 'Painting & Decorating', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600', query: 'Contracting' },
        { name: 'Plumbing', img: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&q=80&w=600', query: 'Plumbing' },
      ]
    },
    {
      title: 'Health & Wellbeing',
      items: [
        { name: 'Personal Trainers', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600', online: true, query: 'Fitness' },
        { name: 'Counselling', img: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=600', online: true, query: 'Therapy' },
        { name: 'Massage Therapy', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600', query: 'Wellness' },
        { name: 'Nutritionists', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600', online: true, query: 'Nutrition' },
      ]
    },
    {
      title: 'Business Services',
      items: [
        { name: 'Web Design', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600', online: true, query: 'Technology' },
        { name: 'Accounting', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600', online: true, query: 'Finance' },
        { name: 'Legal Services', img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', online: true, query: 'Legal' },
        { name: 'Marketing', img: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=600', online: true, query: 'Marketing' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Bark Style Header */}
      <header className="relative z-50 bg-white border-b border-gray-100 py-4">
        <div className="w-full px-6 flex justify-between items-center max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-gray-900 font-extrabold text-2xl tracking-tighter">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              InvoiceNaija<span className="text-gray-500 font-normal ml-0.5">Explore</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="hidden md:block text-sm font-bold text-gray-700 hover:text-black">Login</Link>
            <Link href="/signup" className="text-sm font-bold text-white bg-blue-600 px-5 py-2.5 rounded hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
              <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[10px]">P</span>
              Join as a Professional
            </Link>
          </div>
        </div>
      </header>

      {/* Bark Hero Area */}
      <section className="w-full bg-white pt-20 pb-16 px-6 md:pt-32 md:pb-28">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
            
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-gray-900 text-center mb-4 leading-[1.1] tracking-tight">
              Find the perfect <br className="hidden md:block" />professional for you
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-medium text-center mb-10">
              Get free quotes within minutes
            </p>

            {/* Horizontal Search Bar */}
            <div className="w-full max-w-3xl flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-lg overflow-hidden border border-gray-200">
               <div className="flex-1 flex items-center bg-white px-4 py-1 border-b md:border-b-0 md:border-r border-gray-200">
                  <input 
                    type="text" 
                    placeholder="What service are you looking for?" 
                    className="w-full py-4 outline-none text-gray-900 font-medium placeholder-gray-400"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && executeSearch()}
                  />
               </div>
               <div className="w-full md:w-[220px] flex items-center bg-white px-4 py-1">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Postcode" 
                    className="w-full py-4 outline-none text-gray-900 font-medium placeholder-gray-400"
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && executeSearch()}
                  />
               </div>
               <button 
                onClick={() => executeSearch()} 
                className="w-full md:w-[140px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 md:py-0 transition-colors flex items-center justify-center gap-2"
               >
                 Search
               </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-400 font-medium">
              Popular: <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => executeSearch('House Cleaning')}>House Cleaning</span>, <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => executeSearch('Web Design')}>Web Design</span>, <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => executeSearch('Personal Trainers')}>Personal Trainers</span>
            </div>

        </div>
      </section>

      {/* Trust Bar */}
      <div className="w-full border-y border-gray-100 bg-[#fafafa] py-6 flex justify-center items-center gap-8 md:gap-16 grayscale opacity-60 overflow-hidden px-6">
         <span className="font-extrabold text-2xl tracking-tighter text-gray-400">PUNCH</span>
         <span className="font-extrabold text-2xl tracking-tighter text-gray-400 font-serif">VANGUARD</span>
         <span className="font-bold text-2xl text-gray-400">BUSINESSDAY</span>
         <span className="font-extrabold text-xl text-gray-400 italic">TechCabal</span>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-6 py-16">
        
        {/* Render Category Grids */}
        {CATEGORIES.map((categoryGroup, index) => (
          <div key={index} className="mb-16">
             <div className="flex justify-between items-end mb-6">
               <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{categoryGroup.title}</h2>
               <button className="text-sm font-medium text-gray-400 hover:text-blue-600 hidden md:block">View All</button>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {categoryGroup.items.map((cat, idx) => (
                  <div 
                    key={idx} 
                    className="group cursor-pointer flex flex-col bg-white rounded overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => executeSearch(cat.query)}
                  >
                     <div className="relative h-32 md:h-48 overflow-hidden bg-gray-100">
                        <div 
                          className="absolute inset-0 bg-cover bg-center brightness-95 group-hover:scale-105 transition-transform duration-500" 
                          style={{ backgroundImage: `url('${cat.img}')` }}
                        />
                        {/* Gradient overlay for text contrast if needed, but Bark puts text below */}
                        
                        {cat.online && (
                          <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            Available online
                          </div>
                        )}
                     </div>
                     <div className="p-4 bg-white">
                        <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-1">{cat.name}</h3>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        ))}
        
      </div>

    </div>
  );
}
