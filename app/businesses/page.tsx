'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Wrench, Zap, Home, Hammer, Scissors, Laptop, CheckCircle2, Heart, User, ChevronRight, X } from 'lucide-react';

export default function BusinessesDirectoryPage() {
  const router = useRouter();
  
  const [searchInput, setSearchInput] = useState('');

  const executeSearch = (serviceQuery?: string) => {
    const service = serviceQuery || searchInput;
    if (!service) return;
    
    // Checkatrade uses a single input, we pass it as 'service' to our funnel
    // Optional: Could prompt for location later in the funnel (which we do in step 2)
    router.push(`/businesses/enquire?service=${encodeURIComponent(service)}`);
  };

  const CATEGORIES = [
    { title: 'Plumber', icon: Wrench },
    { title: 'Electrician', icon: Zap },
    { title: 'Roofer', icon: Home },
    { title: 'Builder', icon: Hammer },
    { title: 'Gardener', icon: Scissors },
    { title: 'Tech Support', icon: Laptop },
  ];

  const RECOMMENDED_JOBS = [
    { name: 'Landscape Contractor', desc: 'Prepare your garden for summer with expert landscaping and planting.', tag: 'Seasonal', query: 'Landscaping' },
    { name: 'House Cleaning', desc: 'Keep your home sparkling clean with regular deep cleaning and maintenance.', tag: 'Popular', query: 'Cleaning' },
    { name: 'Home Renovation', desc: 'Upgrade your living space with durable materials and professional building.', tag: 'High demand', query: 'Builder' },
    { name: 'IT Infrastructure', desc: 'Refresh your business operations with professionally installed networks.', tag: 'Corporate', query: 'IT Support' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      
      {/* Checkatrade Style Header */}
      <header className="relative z-50 bg-white border-b border-gray-100 py-3">
        <div className="w-full px-4 md:px-8 flex justify-between items-center max-w-[1600px] mx-auto">
          {/* Logo Left */}
          <Link href="/" className="flex items-center gap-2 text-gray-900 font-extrabold text-2xl tracking-tighter">
            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Invoice Generator
          </Link>

          {/* Links Center */}
          <div className="hidden lg:flex items-center gap-8 ml-10">
            <Link href="/" className="text-sm font-bold text-gray-900 border-b-2 border-transparent hover:border-blue-600 pb-1 transition-all">Customer</Link>
            <Link href="/businesses" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all border-l border-gray-200 pl-8">Businesses</Link>
          </div>

          {/* Actions Right */}
          <div className="flex items-center gap-4 md:gap-6 ml-auto">
            <Link href="/signup" className="hidden md:block text-sm font-bold text-white bg-[#00103E] px-6 py-2.5 rounded-full hover:bg-gray-900 transition shadow-sm">
              Business sign up
            </Link>
            <Link href="/signin" className="hidden sm:block text-sm font-bold text-gray-800 border border-gray-300 px-6 py-2.5 rounded-full hover:bg-gray-50 transition shadow-sm">
              Log in
            </Link>
            <div className="flex items-center gap-3 ml-2 text-blue-600">
               <button className="p-1 hover:bg-gray-50 rounded-full transition"><Heart className="w-6 h-6" /></button>
               <Link href="/signin" className="p-1 hover:bg-gray-50 rounded-full transition"><User className="w-6 h-6" /></Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Area - Checkatrade Solid Color Style but with Our Native Blue (#2563EB) */}
      <section className="w-full bg-blue-600 py-16 md:py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
            
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white mb-4 leading-[1.1] tracking-tight">
              Find a professional ready to help you
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-bold mb-10">
              Get your job done right with Invoice Generator.
            </p>

            {/* Checkatrade Single Search Pill */}
            <div className="w-full max-w-2xl relative shadow-2xl rounded-full bg-white flex items-center p-2">
               <Search className="w-6 h-6 text-gray-800 ml-4 absolute pointer-events-none" />
               <input 
                 type="text" 
                 placeholder="Deep clean for end of tenancy" 
                 className="w-full pl-14 pr-32 py-4 outline-none text-gray-900 font-bold text-lg placeholder-gray-500 rounded-full bg-transparent"
                 value={searchInput}
                 onChange={e => setSearchInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && executeSearch()}
               />
               <button 
                  onClick={() => executeSearch()} 
                  className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-full transition-colors flex items-center shadow-sm"
               >
                 Search
               </button>
            </div>

        </div>
      </section>

      {/* Checkatrade: Browse our most popular categories */}
      <section className="w-full max-w-[1400px] mx-auto px-6 py-16 mt-[-30px]">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#00103E] text-center mb-8">Browse our most popular categories</h2>
        
        <div className="flex overflow-x-auto pb-8 snap-x justify-center md:gap-4 scrollbar-hide">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx} 
                className="snap-center shrink-0 w-[160px] h-[160px] md:w-[180px] md:h-[180px] bg-white border border-gray-100 hover:border-gray-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg rounded-[24px] flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 mx-2 md:mx-0 group"
                onClick={() => executeSearch(cat.title)}
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-blue-600 " />
                </div>
                <h3 className="text-[#00103E] font-extrabold text-base text-center group-hover:text-blue-600 transition-colors">{cat.title}</h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Jobs */}
      <section className="w-full max-w-[1400px] mx-auto px-6 py-8">
        <h2 className="text-2xl font-extrabold text-[#00103E] text-center mb-8">Recommended jobs</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECOMMENDED_JOBS.map((job, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full hover:shadow-xl transition-shadow relative">
               <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
               <div className="mb-4">
                 <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{job.tag}</span>
               </div>
               <h3 className="text-[#00103E] font-extrabold text-lg mb-2">{job.name}</h3>
               <p className="text-gray-600 text-sm font-medium mb-6 flex-1 leading-relaxed">{job.desc}</p>
               <button 
                 onClick={() => executeSearch(job.query)}
                 className="w-full bg-[#00103E] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors mt-auto"
               >
                 Find a professional
               </button>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Blue App Promo & Trust Badges */}
      <section className="w-full max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
           <div className="bg-[#00103E] rounded-3xl p-8 md:p-12 text-white flex flex-col justify-center min-h-[300px]">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">Simplify your business<br/>with our app</h2>
              <p className="text-blue-200 text-lg font-medium mb-8">Search, message and book with real-time updates from professionals.</p>
              <div className="flex gap-4">
                <div className="w-32 h-10 bg-white/10 rounded-lg"></div>
                <div className="w-32 h-10 bg-white/10 rounded-lg"></div>
              </div>
           </div>
           
           <div className="bg-gradient-to-br from-[#00103E] to-blue-900 rounded-3xl p-8 md:p-12 text-white flex flex-col justify-center min-h-[300px]">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Let's get that job off your list</h2>
              <ul className="space-y-4 font-bold text-blue-100">
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-blue-400 mr-3" /> Get clear, upfront pricing immediately</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-blue-400 mr-3" /> Pay securely through our trusted platform</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-blue-400 mr-3" /> Every user is verified via email and OTP</li>
              </ul>
           </div>
        </div>

        {/* 3 Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-16 border-b border-gray-200">
           <div>
             <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto mb-4" />
             <h3 className="text-2xl font-extrabold text-[#00103E] mb-3">Checked</h3>
             <p className="text-gray-500 font-medium">Every professional has passed our rigorous checks. <span className="text-blue-600 font-bold hover:underline cursor-pointer">Find out more</span>.</p>
           </div>
           <div>
             <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto mb-4" />
             <h3 className="text-2xl font-extrabold text-[#00103E] mb-3">Reviewed</h3>
             <p className="text-gray-500 font-medium">Thousands of authentic reviews have been published to help you decide.</p>
           </div>
           <div>
             <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto mb-4" />
             <h3 className="text-2xl font-extrabold text-[#00103E] mb-3">Guarantee</h3>
             <p className="text-gray-500 font-medium">Book with confidence. Enjoy robust platform protections. <span className="text-blue-600 font-bold hover:underline cursor-pointer">T&Cs apply</span></p>
           </div>
        </div>
      </section>

      {/* 3 Action Cards (Bottom) */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
           <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
             <div className="h-48 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800")' }}></div>
             <div className="p-8 flex flex-col flex-1">
                <h3 className="text-[#00103E] text-2xl font-extrabold mb-4">Leave a review</h3>
                <p className="text-gray-600 font-medium mb-8">Have you completed a project recently? Let your professional know how they did.</p>
                <div className="mt-auto pt-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors">Leave a review</button>
                </div>
             </div>
           </div>

           <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
             <div className="h-48 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800")' }}></div>
             <div className="p-8 flex flex-col flex-1">
                <h3 className="text-[#00103E] text-2xl font-extrabold mb-4">Professional sign up</h3>
                <p className="text-gray-600 font-medium mb-8">Over 1 million users visit our site looking for approved professionals like you.</p>
                <div className="mt-auto pt-4">
                  <Link href="/signup" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors">Join today</Link>
                </div>
             </div>
           </div>

           <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
             <div className="h-48 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800")' }}></div>
             <div className="p-8 flex flex-col flex-1">
                <h3 className="text-[#00103E] text-2xl font-extrabold mb-4">Request a quote</h3>
                <p className="text-gray-600 font-medium mb-8">Tell us what you're looking for and we'll pass your request on to up to 10 approved businesses.</p>
                <div className="mt-auto pt-4">
                  <Link href="/businesses/enquire" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors">Request a quote</Link>
                </div>
             </div>
           </div>

        </div>
      </section>

    </div>
  );
}
