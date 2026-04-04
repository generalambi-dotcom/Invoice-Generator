import Link from 'next/link';
import { MapPin, Search, Heart, Plus } from 'lucide-react';
import clsx from 'clsx';

export default function BusinessCard({ data }: { data: any }) {
  const isAnonymous = data.name === 'Anonymous Business';
  
  // Random stock images mapped by ID just for visual flair since they aren't uploaded yet
  const stockImages = [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'
  ];
  const bgImage = stockImages[data.id?.length % stockImages.length] || stockImages[0];

  return (
    <Link href={`/businesses/${data.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
          
          {/* Top Cover Image Area */}
          <div className="relative h-48 w-full bg-gray-200">
             <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${bgImage})` }}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-gray-900/40"></div>
             
             {/* Floating Badges */}
             <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                 <div className="flex flex-wrap gap-1.5">
                    {/* Fake ratings data based on inspiration */}
                    <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1">
                        ₦₦
                    </span>
                    <span className="bg-black/40 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-2 py-1 rounded inline-flex items-center tracking-widest">
                        ★★★★★ <span className="font-normal text-white/80 ml-1">9.5</span>
                    </span>
                 </div>
                 <div className="flex flex-col gap-1.5 items-end">
                    {data.isActive ? (
                       <span className="bg-green-500/20 backdrop-blur-md text-green-300 border border-green-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Wait</span> 
                    ) : null}
                    {/* Fixed to OPEN based on inspiration */}
                    <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">OPEN</span>
                 </div>
             </div>

             {/* Profile Avatar circle overlapping bottom edge */}
             <div className="absolute -bottom-6 left-6 w-14 h-14 bg-white rounded-full p-1 shadow-lg z-10">
                 <div className="w-full h-full rounded-full bg-[#fbbc04] font-bold text-gray-900 flex items-center justify-center text-xl">
                    {isAnonymous ? '?' : data.name.substring(0, 2).toLowerCase()}
                 </div>
             </div>
          </div>

          {/* Lower Content */}
          <div className="pt-8 px-6 pb-5 flex-1 flex flex-col relative bg-white z-0">
             
             <div className="flex justify-between items-start mb-2">
                <h3 className={clsx(
                    "text-xl font-bold line-clamp-1",
                    isAnonymous ? "text-gray-500 italic" : "text-gray-900"
                )}>
                    {data.name} 
                    {!isAnonymous && <span className="inline-flex items-center justify-center w-4 h-4 ml-2 bg-blue-500 text-white rounded-full text-[10px]">✓</span>}
                </h3>
             </div>
             
             <p className="text-gray-500 text-sm mb-4 line-clamp-1">
                 {data.industry || 'Business Services'}
             </p>
             
             <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                     <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     </span>
                     {data.industry || 'Company'}
                 </div>
                 
                 <div className="flex items-center gap-2">
                     <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                        <Search className="w-4 h-4" />
                     </button>
                     <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                     </button>
                 </div>
             </div>
          </div>
      </div>
    </Link>
  );
}
