'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { initiatePayment } from '@/lib/payments';
import { validateCoupon, applyCoupon } from '@/lib/coupons';
import { getPricing, formatPrice, detectUserRegion } from '@/lib/pricing';

export default function UpgradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'paypal' | 'paystack' | 'stripe' | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [region, setRegion] = useState<'nigeria' | 'rest-of-world'>('rest-of-world');
  const [availableProviders, setAvailableProviders] = useState<{
    paypal: boolean;
    paystack: boolean;
    stripe: boolean;
  }>({
    paypal: false,
    paystack: false,
    stripe: false,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // If already premium or admin, allow them to view but show a message
    // No redirect - let them view pricing even if premium
    
    // Load pricing based on region
    loadPricing();

    // Load available payment providers
    loadAvailableProviders();

    // Check for Stripe success/cancel redirect
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        const sessionId = urlParams.get('session_id');
        if (sessionId) {
          // Payment successful - refresh user data
          const updatedUser = getCurrentUser();
          setUser(updatedUser);
          // Show success message
          alert('Payment successful! Your premium subscription is now active.');
          // Clean URL
          window.history.replaceState({}, '', '/upgrade');
        }
      } else if (urlParams.get('canceled') === 'true') {
        // Payment canceled
        alert('Payment was canceled. You can try again anytime.');
        // Clean URL
        window.history.replaceState({}, '', '/upgrade');
      }
    }
  }, [router]);

  const loadPricing = async () => {
    const detectedRegion = detectUserRegion();
    setRegion(detectedRegion);
    const priceData = await getPricing(detectedRegion);
    setPricing(priceData);
  };

  const loadAvailableProviders = async () => {
    try {
      const response = await fetch('/api/subscriptions/available-providers');
      if (response.ok) {
        const data = await response.json();
        setAvailableProviders(data.providers || {
          paypal: false,
          paystack: false,
          stripe: false,
        });
      }
    } catch (error) {
      console.error('Error loading available providers:', error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!user || !couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess(false);

    try {
      const result = applyCoupon(couponCode.trim(), user.id);
      if (result.success) {
        setCouponSuccess(true);
        setCouponCode('');
        // Refresh user data
        const updatedUser = getCurrentUser();
        setUser(updatedUser);
        // Redirect to dashboard after a moment
        setTimeout(() => {
          router.push('/dashboard?coupon=success');
        }, 1500);
      } else {
        setCouponError(result.error || 'Failed to apply coupon');
      }
    } catch (error: any) {
      setCouponError(error.message || 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleUpgrade = async (provider: 'paypal' | 'paystack' | 'stripe') => {
    if (!pricing) return;
    
    // If user is not logged in, redirect to signin with redirect back to upgrade
    if (!user) {
      router.push(`/signin?redirect=/upgrade`);
      return;
    }
    
    setLoading(true);
    setPaymentProvider(provider);
    
    try {
      const paymentLink = await initiatePayment({
        userId: user.id,
        plan: 'premium',
        provider,
        amount: pricing.premiumPrice,
        currency: pricing.currency,
        userEmail: user.email,
      });
      
      if (paymentLink) {
        // Redirect to payment page or external payment URL
        if (paymentLink.startsWith('http')) {
          window.location.href = paymentLink;
        } else {
          router.push(paymentLink);
        }
      }
    } catch (error: any) {
      alert('Failed to initiate payment: ' + error.message);
      setLoading(false);
      setPaymentProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Premium</h1>
          <p className="text-xl text-gray-600">
            Unlock powerful features to grow your business
          </p>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Premium Features</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900">Ad-Free Experience:</span>
                <span className="text-gray-600 ml-2">No ads, ever. Focus on your work without distractions.</span>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900">Payment Links:</span>
                <span className="text-gray-600 ml-2">Accept payments via PayPal and Paystack directly from your invoices.</span>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900">Advanced Dashboard:</span>
                <span className="text-gray-600 ml-2">Track invoices sent, amounts, paid/unpaid status with detailed analytics.</span>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900">Priority Support:</span>
                <span className="text-gray-600 ml-2">Get help when you need it with priority customer support.</span>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-semibold text-gray-900">Unlimited Invoices:</span>
                <span className="text-gray-600 ml-2">Create and manage unlimited invoices without any restrictions.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Coupon Code Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Have a Coupon Code?</h2>
          {couponSuccess ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✅ Coupon applied successfully! Redirecting to dashboard...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                  }}
                  placeholder="Enter coupon code (e.g., free)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyCoupon();
                    }
                  }}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {applyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {couponError && (
                <p className="text-sm text-red-600">{couponError}</p>
              )}
              <p className="text-sm text-gray-500">
                Try the code <strong>"free"</strong> for 30 days of premium access!
              </p>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              {pricing ? (
                <>
                  <span className="text-5xl font-bold text-gray-900">
                    {formatPrice(pricing.premiumPrice, pricing.currency)}
                  </span>
                  <span className="text-gray-600 text-xl ml-2">/month</span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-bold text-gray-900">...</span>
                  <span className="text-gray-600 text-xl ml-2">/month</span>
                </>
              )}
            </div>
            <p className="text-gray-600">Cancel anytime. No hidden fees.</p>
            {pricing && (
              <p className="text-sm text-gray-500 mt-2">
                {region === 'nigeria' ? 'Nigerian pricing' : 'International pricing'}
              </p>
            )}
          </div>

          {user && (user.isAdmin || (user.subscription?.plan === 'premium' && user.subscription?.status === 'active')) ? (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">You already have premium access!</p>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {!user && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800">
                    <Link href="/signup" className="font-medium underline">Sign up</Link> or{' '}
                    <Link href={`/signin?redirect=/upgrade`} className="font-medium underline">sign in</Link> to upgrade
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {availableProviders.paypal && (
                  <button
                    onClick={() => handleUpgrade('paypal')}
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-lg flex items-center justify-center gap-2"
                  >
                    {loading && paymentProvider === 'paypal' ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.174 1.346 1.416 3.14 1.416 4.502 0 2.153-.789 4.014-2.23 5.186-1.318 1.08-3.032 1.561-5.13 1.561H9.577l-1.017 6.638c-.076.499-.558.86-1.05.86zm-.193-2.025l.774-5.043h6.88c1.4 0 2.503-.33 3.245-.98.65-.58.978-1.39.978-2.38 0-1.01-.336-1.89-1.01-2.52-.68-.64-1.74-.97-3.18-.97H6.67l-.79 5.15z"/>
                        </svg>
                        Upgrade with PayPal
                      </>
                    )}
                  </button>
                )}
                
                {availableProviders.paystack && (
                  <button
                    onClick={() => handleUpgrade('paystack')}
                    disabled={loading}
                    className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-lg flex items-center justify-center gap-2"
                  >
                    {loading && paymentProvider === 'paystack' ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Upgrade with Paystack
                      </>
                    )}
                  </button>
                )}

                {availableProviders.stripe && (
                  <button
                    onClick={() => handleUpgrade('stripe')}
                    disabled={loading}
                    className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-lg flex items-center justify-center gap-2"
                  >
                    {loading && paymentProvider === 'stripe' ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l-2.541 4.083c-.48-.202-1.08-.42-1.94-.42v-.58zm6.777 2.944c.602-.604 1.376-1.015 1.376-1.81 0-1.21-1.044-2.21-2.9-2.21-2.115 0-4.592.92-6.584 2.067l-2.545-4.097c2.194-1.333 5.23-2.18 7.66-2.18 3.74 0 6.662 1.88 6.662 5.14 0 2.353-1.735 4.1-3.99 4.843l-2.679-4.753zM14.471 15.108c-2.29.861-4.691 1.413-6.74 1.413-3.701 0-5.78-1.838-5.78-4.8 0-3.24 2.82-5.5 7.27-5.5 2.366 0 4.94.69 7.27 1.856l-2.58 4.16c-.49-.175-1.03-.35-1.9-.35v-.58c0-1.28.65-1.95 1.84-1.95 1.84 0 3.26.45 4.77 1.11l-2.64 4.24c-.38.15-1.02.33-1.51.44v.37z"/>
                        </svg>
                        Upgrade with Stripe
                      </>
                    )}
                  </button>
                )}

                {!availableProviders.paypal && !availableProviders.paystack && !availableProviders.stripe && (
                  <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-800 font-medium">
                      ⚠️ No payment methods are currently configured. Please contact the administrator.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          {user ? (
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          ) : (
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

