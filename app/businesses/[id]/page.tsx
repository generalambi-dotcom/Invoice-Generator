'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBusinessProfileAPI } from '@/lib/api-client';
import { Loader2, MapPin, Phone, Globe, Bookmark, Share2, Flag, MessageSquare, Clock, LayoutGrid, CheckCircle2, Star } from 'lucide-react';
import clsx from 'clsx';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  verified: boolean;
  createdAt: string;
}

interface ReviewsMeta {
  averageRating: number | null;
  totalRatings: number;
  page: number;
  pages: number;
}

export default function BusinessProfilePage() {
  const { id } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState<ReviewsMeta>({ averageRating: null, totalRatings: 0, page: 1, pages: 1 });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review submission state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reviewError, setReviewError] = useState('');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const loadReviews = async (page = 1) => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${id}/reviews?page=${page}&limit=10`);
      if (!res.ok) return;
      const data = await res.json();
      setReviews(data.reviews ?? []);
      const m = data.meta ?? {};
      setReviewsMeta({
        averageRating: m.averageRating ?? null,
        totalRatings: m.totalRatings ?? 0,
        page: m.page ?? 1,
        pages: m.pages ?? 1,
      });
    } catch {
      // silently fail — reviews non-critical
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const data = await getBusinessProfileAPI(id as string);
        setBusiness(data.business);
        document.title = `${data.business.name} | InvoiceGenerator Directory`;
      } catch (error) {
        console.error('Failed to load business profile', error);
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
    loadReviews();
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
      setTimeout(() => setContactStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setContactStatus('error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewRating) return;
    setReviewStatus('loading');
    setReviewError('');
    try {
      const res = await fetch(`/api/businesses/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: reviewName,
          reviewerEmail: reviewEmail || undefined,
          rating: reviewRating,
          comment: reviewComment || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit review');
      }
      setReviewStatus('success');
      setReviewName('');
      setReviewEmail('');
      setReviewRating(5);
      setReviewComment('');
    } catch (err: any) {
      setReviewStatus('error');
      setReviewError(err.message);
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
  const isVerified = business.verificationStatus === 'verified';

  const coverImages = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80'
  ];
  const coverImage = coverImages[business.id?.length % coverImages.length] || coverImages[0];

  const hasRating = reviewsMeta.totalRatings > 0 && reviewsMeta.averageRating !== null;
  const displayRating = hasRating ? reviewsMeta.averageRating!.toFixed(1) : null;

  // Render star icons helper
  const renderStars = (rating: number, size = 'sm') => {
    const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={clsx(cls, n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200')}
          />
        ))}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      {/* Header */}
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
                {isVerified && (
                  <span title="Verified business">
                    <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-500/20" />
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
                {hasRating ? (
                  <span className="flex items-center gap-2">
                    <span className="text-amber-400">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n}>{n <= Math.round(reviewsMeta.averageRating!) ? '★' : '☆'}</span>
                      ))}
                    </span>
                    <span className="text-white font-bold">{displayRating}</span>
                    <span className="text-white/60 text-xs">({reviewsMeta.totalRatings} review{reviewsMeta.totalRatings !== 1 ? 's' : ''})</span>
                  </span>
                ) : (
                  <span className="text-white/50 text-sm italic">No reviews yet</span>
                )}
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-white/30"></span>
                <span>{business.industry || 'Business Services'}</span>
                {isVerified && (
                  <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Block */}
          <div className="w-full md:w-auto flex items-center gap-6 pb-2">
            <div className="text-right hidden sm:block">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Price Range</p>
              <p className="text-white font-bold text-lg">₦₦</p>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="flex-1 md:flex-none bg-[#6B4CE6] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#5b3ed9] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#6B4CE6]/30"
            >
              <MessageSquare className="w-5 h-5" />
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 flex overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={clsx(
              "py-5 px-6 border-b-2 font-medium whitespace-nowrap transition-colors",
              activeTab === 'profile'
                ? "border-[#6B4CE6] text-[#6B4CE6] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={clsx(
              "py-5 px-6 border-b-2 font-medium whitespace-nowrap flex items-center gap-2 transition-colors",
              activeTab === 'reviews'
                ? "border-[#6B4CE6] text-[#6B4CE6] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            Reviews
            {reviewsMeta.totalRatings > 0 && (
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {reviewsMeta.totalRatings}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
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

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description Box */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <LayoutGrid className="w-5 h-5 text-gray-400" /> About
                </h3>
                <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed">
                  <p>
                    {isAnonymous
                      ? "This business has chosen to keep their profile details private, but they are an active part of the ecosystem. Reach out directly using the messaging feature to learn more about their services."
                      : `${business.name} is a${business.industry ? ` ${business.industry}` : ''} business operating in Nigeria. They use InvoiceGenerator.ng to manage professional invoicing and payments.`}
                  </p>
                  {isVerified && (
                    <p className="mt-4 flex items-start gap-2 text-blue-700 bg-blue-50 rounded-lg px-4 py-3 not-prose text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      This business has been verified by the InvoiceGenerator.ng team.
                    </p>
                  )}
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
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="font-bold text-green-500">Active</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {business.isActive ? 'Active this month' : 'Tracking activity...'}
                  </span>
                </div>
              )}

              {/* Categories Box */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <LayoutGrid className="w-4 h-4 text-gray-400" /> Category
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{business.industry || 'General Business'}</span>
                </div>
              </div>

              {/* Rating Summary */}
              {hasRating && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-3">Rating</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-gray-900">{displayRating}</span>
                    <div>
                      {renderStars(Math.round(reviewsMeta.averageRating!))}
                      <p className="text-xs text-gray-400 mt-1">{reviewsMeta.totalRatings} review{reviewsMeta.totalRatings !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="mt-3 text-sm text-[#6B4CE6] font-medium hover:underline"
                  >
                    See all reviews →
                  </button>
                </div>
              )}

              {/* Contact Form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <h3 className="text-[15px] font-bold text-gray-900">Contact business</h3>
                </div>
                <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                  <input required value={contactName} onChange={e => setContactName(e.target.value)} type="text" placeholder="Your name" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6] disabled:opacity-50" disabled={contactStatus === 'loading'} />
                  <input required value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" placeholder="Your email address" className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6] disabled:opacity-50" disabled={contactStatus === 'loading'} />
                  <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder="Your message?" rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6] resize-none disabled:opacity-50" disabled={contactStatus === 'loading'}></textarea>

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
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-6">

              {/* Summary banner */}
              {hasRating && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-gray-900 leading-none">{displayRating}</div>
                    <div className="mt-2">{renderStars(Math.round(reviewsMeta.averageRating!), 'md')}</div>
                    <p className="text-xs text-gray-400 mt-1">{reviewsMeta.totalRatings} review{reviewsMeta.totalRatings !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#6B4CE6] animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm text-center text-gray-500">
                  <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="font-semibold text-gray-700 mb-1">No reviews yet</p>
                  <p className="text-sm">Be the first to leave a review for this business.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{review.reviewerName}</span>
                          {review.verified && (
                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.comment}</p>
                    )}
                  </div>
                ))
              )}

              {/* Pagination */}
              {reviewsMeta.pages > 1 && (
                <div className="flex justify-center gap-3">
                  <button
                    disabled={reviewsMeta.page === 1}
                    onClick={() => loadReviews(reviewsMeta.page - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={reviewsMeta.page === reviewsMeta.pages}
                    onClick={() => loadReviews(reviewsMeta.page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Write a Review sidebar */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">Write a Review</h3>

                {reviewStatus === 'success' ? (
                  <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm font-medium flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    Thank you! Your review has been submitted and will appear after approval.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Your name *</label>
                      <input
                        required
                        value={reviewName}
                        onChange={e => setReviewName(e.target.value)}
                        type="text"
                        placeholder="e.g. Chidi Obi"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email (optional)</label>
                      <input
                        value={reviewEmail}
                        onChange={e => setReviewEmail(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Rating *</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            className="focus:outline-none"
                          >
                            <Star className={clsx(
                              'w-7 h-7 transition-colors',
                              n <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'
                            )} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Comment (optional)</label>
                      <textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        rows={4}
                        placeholder="Share your experience..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6B4CE6] focus:ring-1 focus:ring-[#6B4CE6] resize-none"
                      />
                    </div>
                    {reviewStatus === 'error' && (
                      <p className="text-red-500 text-sm">{reviewError || 'Failed to submit. Please try again.'}</p>
                    )}
                    <button
                      type="submit"
                      disabled={reviewStatus === 'loading'}
                      className="w-full bg-[#6B4CE6] text-white rounded-xl py-3 font-bold hover:bg-[#5b3ed9] transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {reviewStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                    </button>
                    <p className="text-xs text-gray-400 text-center">Reviews are moderated before appearing publicly.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD Schema */}
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
                "addressLocality": "Lagos",
                "addressCountry": "NG"
              },
              "telephone": "",
              "url": typeof window !== 'undefined' ? window.location.href : '',
              "priceRange": "$$",
              ...(hasRating && {
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": displayRating,
                  "bestRating": "5",
                  "worstRating": "1",
                  "reviewCount": reviewsMeta.totalRatings.toString()
                }
              })
            })
          }}
        />
      )}
    </div>
  );
}
