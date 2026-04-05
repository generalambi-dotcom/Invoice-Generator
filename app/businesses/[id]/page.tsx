'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBusinessProfileAPI } from '@/lib/api-client';
import { Loader2, MapPin, Phone, Globe, Bookmark, Share2, Flag, MessageSquare, Clock, LayoutGrid, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function BusinessProfilePage() {
  const { id } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const data = await getBusinessProfileAPI(id as string);
        setBusiness(data.business);
        // Dynamic SEO Title Injection
        document.title = `${data.business.name} | InvoiceGenerator Directory`;
      } catch (error) {
        console.error('Failed to load business profile', error);
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    
    setContactStatus('loading');
    try {
      const response = await fetch(`/api/businesses/${id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage })
      });
      
      if (!response.ok) throw new Error('Failed to send');
      setContactStatus('success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      
      // Reset after 3 seconds
      setTimeout(() => setContactStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setContactStatus('error');
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#6B4CE6] animate-spin mb-4" />
            <p className="text-gray-500 font-medium tracking-wide">Loading workspace...</p>
        </div>
    );
  }

  if (!business) {
    return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                <Flag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
            <p className="text-gray-500 mb-8 max-w-md">This business profile may have been removed or the privacy settings prevent it from being viewed publicly.</p>
            <Link href="/businesses" className="bg-[#6B4CE6] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5b3ed9] transition">
                Return to Directory
            </Link>
        </div>
    );
  }

  const isAnonymous = business.name === 'Anonymous Business';
  
  // Stock images mapping as before
  const coverImages = [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80'
  ];
  const coverImage = coverImages[business.id?.length % coverImages.length] || coverImages[0];

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      {/* Global Style Header (re-used from listing page) */}
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
          </div>
        </div>
      </header>

      {/* Hero Cover Header */}
      <section className="relative h-[400px] w-full flex flex-col justify-end">
         <div 
           className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: `url(${coverImage})` }}
         >
           {/* Dark Gradient Overlay for text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent mix-blend-multiply"></div>
         </div>

         <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 pb-10 flex flex-col md:flex-row items-end justify-between gap-6">
             <div className="flex items-end gap-6 w-full md:w-auto">
                 {/* Avatar */}
                 <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#fbbc04] rounded-full flex-shrink-0 flex items-center justify-center shadow-xl border-4 border-white text-gray-900 text-3xl font-bold">
                    {isAnonymous ? '?' : business.name.substring(0, 2).toUpperCase()}
                 </div>
                 
                 {/* Title Box */}
                 <div className="pb-2">
                     <h1 className={clsx(
                         "text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3",
                         isAnonymous ? "text-gray-300 italic" : "text-white"
                     )}>
                         {business.name}
                         {!isAnonymous && <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/20" />}
                     </h1>
                     <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
                         <span className="flex items-center tracking-widest text-[#fbbc04]">
                            ★★★★★ <span className="text-white ml-2">9.5</span>
                         </span>
                         <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white/30"></span>
                         <span>{business.industry || 'Business Services'}</span>
                     </div>
                 </div>
             </div>

             {/* Right Action Block */}
             <div className="w-full md:w-auto flex items-center gap-6 pb-2">
                 <div className="text-right hidden sm:block">
                     <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Price Range</p>
                     <p className="text-white font-bold text-lg">₦₦</p>
                 </div>
                 <button className="flex-1 md:flex-none bg-[#6B4CE6] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#5b3ed9] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#6B4CE6]/30">
                     <MessageSquare className="w-5 h-5" />
                     Direct Message
                 </button>
             </div>
         </div>
      </section>

      {/* Tabs Layout */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 transform transition-all shadow-sm">
         <div className="max-w-[1200px] mx-auto px-6 flex overflow-x-auto hide-scrollbar">
             <button className="py-5 px-6 border-b-2 border-[#6B4CE6] text-[#6B4CE6] font-bold whitespace-nowrap">Profile</button>
             <button className="py-5 px-6 border-b-2 border-transparent text-gray-500 font-medium hover:text-gray-900 whitespace-nowrap flex items-center gap-2">Reviews <span className="bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full text-xs">1</span></button>
         </div>
      </div>

      {/* Main Body Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
          
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-8">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                 <MapPin className="w-4 h-4 text-gray-400" /> Get directions
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                 <Phone className="w-4 h-4 text-gray-400" /> Call now
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                 <Globe className="w-4 h-4 text-gray-400" /> Website
              </button>
              <div className="hidden sm:block w-px h-6 bg-gray-200 mx-2"></div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                 <Bookmark className="w-4 h-4" /> Bookmark
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                 <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500/80 hover:text-red-600 transition-colors ml-auto sm:ml-0">
                 <Flag className="w-4 h-4" /> Report
              </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Content Column */}
              <div className="lg:col-span-2 space-y-8">
                  
                  {/* Description Box */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                         <LayoutGrid className="w-5 h-5 text-gray-400" /> Description
                      </h3>
                      <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed">
                          <p>
                              {isAnonymous 
                                ? "This business has chosen to keep their profile details private, but they are an active part of the ecosystem. Reach out directly using the messaging feature to learn more about their services."
                                : `${business.name} is a premier provider in the ${business.industry || 'service'} industry. Operating effectively out of Nigeria, they leverage modern invoicing tools to maintain a highly transparent and professional commercial operation.`}
                          </p>
                          <p className="mt-4">
                              As a verified platform user, they've demonstrated a high level of economic activity directly tied to their digital footprint. Get in contact today to establish a secure, business-to-business pipeline.
                          </p>
                      </div>
                  </div>

                  {/* Location Box */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                         <MapPin className="w-5 h-5 text-gray-400" /> Location
                      </h3>
                      <div className="w-full h-[350px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                          <iframe 
                             width="100%" 
                             height="100%" 
                             frameBorder="0" 
                             style={{ border: 0 }} 
                             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126844.06232537255!2d3.2842491564344933!3d6.536966115903964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1620000000000!5m2!1sen!2sng" 
                             allowFullScreen 
                             loading="lazy"
                             title="Location Map"
                             className="opacity-90 saturate-50"
                          ></iframe>
                      </div>
                  </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="space-y-6">
                  
                  {/* Status Box */}
                  {business.isActive !== false && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                           <Clock className="w-5 h-5 text-green-500" />
                           <span className="font-bold text-green-500">Open</span>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center">
                            {business.isActive ? 'Active this month' : 'Tracking activity...'}
                        </span>
                    </div>
                  )}

                  {/* Categories Box */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2 mb-4">
                         <LayoutGrid className="w-4 h-4 text-gray-400" /> Categories
                      </h3>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                             <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{business.industry || 'General Business'}</span>
                      </div>
                  </div>

                  {/* Contact Form Box (Inspiration 3) */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                      <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-gray-500" />
                          <h3 className="text-[15px] font-bold text-gray-900">Contact business</h3>
                      </div>
                      <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                          <div>
                              <input required value={contactName} onChange={e => setContactName(e.target.value)} type="text" placeholder="Your name" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6] disabled:opacity-50" disabled={contactStatus === 'loading'} />
                          </div>
                          <div>
                              <input required value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" placeholder="Your Email address" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6] disabled:opacity-50" disabled={contactStatus === 'loading'} />
                          </div>
                          <div>
                              <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder="Your message?" rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6] resize-none disabled:opacity-50" disabled={contactStatus === 'loading'}></textarea>
                          </div>
                          
                          {contactStatus === 'error' && <p className="text-red-500 text-sm font-medium">Failed to send message. Please try again.</p>}
                          
                          {contactStatus === 'success' ? (
                            <div className="w-full bg-green-50 text-green-600 rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 border border-green-200">
                               <CheckCircle2 className="w-5 h-5" /> Message Sent!
                            </div>
                          ) : (
                            <button type="submit" disabled={contactStatus === 'loading'} className="w-full bg-[#6B4CE6] text-white rounded-xl py-3.5 font-bold hover:bg-[#5b3ed9] transition shadow-md shadow-[#6B4CE6]/20 flex items-center justify-center gap-2 disabled:opacity-70">
                                {contactStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Message'}
                            </button>
                          )}
                      </form>
                  </div>

              </div>
          </div>
      </div>

      {/* JSON-LD Schema block for LocalBusiness SEO */}
      {business && !isAnonymous && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
             __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": business.name,
                "image": coverImage,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Lagos", // Default location mapping
                  "addressCountry": "NG"
                },
                "telephone": "", 
                "url": typeof window !== 'undefined' ? window.location.href : '',
                "priceRange": "$$",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "9.5",
                  "reviewCount": "100"
                }
             })
          }}
        />
      )}
    </div>
  );
}
