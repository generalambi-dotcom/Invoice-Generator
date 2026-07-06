'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { initiatePayment } from '@/lib/payments';
import { validateCoupon, applyCoupon } from '@/lib/coupons';
import { getPricing, formatPrice, detectUserRegion } from '@/lib/pricing';
import {
  PLAN_BY_TIER,
  getPlanPrice,
  getPaystackPlanCode,
  formatPlanPrice,
  annualSavings,
  normaliseTier,
  isPaidTier,
  type BillingInterval,
  type PriceCurrency,
} from '@/lib/plans';
import { toast } from 'react-hot-toast';
import { trackEvent } from '@/lib/tracking';

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
  // Selected tier + billing interval (from the pricing page CTA query params).
  const [tier, setTier] = useState<'pro' | 'business'>('pro');
  const [interval, setInterval] = useState<BillingInterval>('annual');
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

    // Read the tier + interval chosen on the pricing page.
    if (typeof window !== 'undefined') {
      const qp = new URLSearchParams(window.location.search);
      const t = qp.get('tier');
      const i = qp.get('interval');
      if (t === 'pro' || t === 'business') setTier(t);
      if (i === 'monthly' || i === 'annual') setInterval(i);
    }

    // If already premium or admin, allow them to view but show a message
    // No redirect - let them view pricing even if premium

    // Load pricing based on region
    loadPricing();

    // Load available payment providers
    loadAvailableProviders();

    // Check for payment success/cancel redirect
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const canceled = urlParams.get('canceled');
      const provider = urlParams.get('provider');
      const token = urlParams.get('token');
      const sessionId = urlParams.get('session_id');

      if (success === 'true') {
        if (provider === 'paypal' && (token || urlParams.get('orderId'))) {
          // PayPal payment successful - verify and activate subscription
          const orderId = token || urlParams.get('orderId');
          if (orderId) {
            handlePayPalSuccess(orderId);
          }
        } else if (sessionId) {
          // Stripe payment successful - refresh user data
          const updatedUser = getCurrentUser();
          setUser(updatedUser);
          
          trackEvent('purchase', { transaction_id: sessionId, value: pricing?.premiumPrice, currency: pricing?.currency });
          
          // Show success message
          toast.success('Payment successful! Your premium subscription is now active.');
          // Clean URL
          window.history.replaceState({}, '', '/upgrade');
        }
      } else if (canceled === 'true') {
        // Payment canceled
        if (provider === 'paypal') {
          toast('PayPal payment was canceled. You can try again anytime.', { icon: '⚠️' });
        } else {
          toast('Payment was canceled. You can try again anytime.', { icon: '⚠️' });
        }
        // Clean URL
        window.history.replaceState({}, '', '/upgrade');
      }
    }
  }, [router]);

  const loadPricing = async () => {
    const detectedRegion = detectUserRegion();
    const priceData = await getPricing(detectedRegion);
    setPricing(priceData);
    // Reflect the server's authoritative (IP-based) region so the label matches
    // the currency actually shown.
    if (priceData.region === 'nigeria' || priceData.region === 'rest-of-world') {
      setRegion(priceData.region as 'nigeria' | 'rest-of-world');
    } else {
      setRegion(detectedRegion);
    }
    trackEvent('view_item', { item_name: 'Premium Subscription', value: priceData.premiumPrice, currency: priceData.currency });
  };

  const loadAvailableProviders = async () => {
    try {
      // Check server-side API for available providers
      const response = await fetch('/api/subscriptions/available-providers');
      if (response.ok) {
        const data = await response.json();
        const providers = data.providers || {
          paypal: false,
          paystack: false,
          stripe: false,
        };

        console.log('Available providers from API:', providers);
        setAvailableProviders(providers);
      } else {
        console.error('Failed to fetch available providers:', response.status);
        // Set all to false if API fails
        setAvailableProviders({
          paypal: false,
          paystack: false,
          stripe: false,
        });
      }
    } catch (error) {
      console.error('Error loading available providers:', error);
      // Set all to false on error
      setAvailableProviders({
        paypal: false,
        paystack: false,
        stripe: false,
      });
    }
  };

  const handlePayPalSuccess = async (token: string) => {
    try {
      // Verify the payment with PayPal and activate subscription
      const response = await fetch('/api/subscriptions/paypal-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          trackEvent('purchase', { transaction_id: token, value: pricing?.premiumPrice, currency: pricing?.currency });
          toast.success('Payment successful! Your premium subscription is now active.');
          // Refresh user data
          const updatedUser = getCurrentUser();
          setUser(updatedUser);
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard?upgrade=success');
          }, 1500);
        } else {
          toast.error('Payment verification failed. Please contact support if payment was deducted.');
        }
      } else {
        const error = await response.json().catch(() => ({ error: 'Verification failed' }));
        toast.error('Payment verification failed: ' + (error.error || 'Unknown error') + '. Please contact support if payment was deducted.');
      }
    } catch (error) {
      console.error('Error verifying PayPal payment:', error);
      toast.error('Payment verification failed. Please contact support if payment was deducted.');
    }

    // Clean up URL
    window.history.replaceState({}, '', '/upgrade');
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
        trackEvent('apply_coupon', { coupon: couponCode.trim() });
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

    // Resolve tier + interval price and Paystack plan code from central config.
    const currency: PriceCurrency = pricing.currency === 'NGN' ? 'NGN' : 'USD';
    const amount = getPlanPrice(tier, interval, currency);
    // Recurring plan codes exist for NGN only; USD tiers charge the amount.
    const planCode =
      currency === 'NGN' && provider === 'paystack'
        ? getPaystackPlanCode(tier, interval)
        : undefined;

    setLoading(true);
    setPaymentProvider(provider);
    trackEvent('begin_checkout', { provider, value: amount, currency, tier, interval });

    try {
      const paymentLink = await initiatePayment({
        userId: user.id,
        plan: tier, // 'pro' | 'business'
        provider,
        amount,
        currency,
        userEmail: user.email,
        trial: provider === 'stripe', // Enable trial for Stripe
        interval,
        planCode,
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
      toast.error('Failed to initiate payment: ' + error.message);
      setLoading(false);
      setPaymentProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to {PLAN_BY_TIER[tier].name}</h1>
          <p className="text-xl text-gray-600">
            {PLAN_BY_TIER[tier].tagline}
          </p>
        </div>

        {/* Plan comparison — Pro vs Business (tap a plan to select it) */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-1 text-center">Pro vs Business</h2>
          <p className="text-center text-gray-500 text-sm mb-6">Tap a plan to choose it</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(['pro', 'business'] as const).map((t) => {
              const plan = PLAN_BY_TIER[t];
              const cur: PriceCurrency = pricing?.currency === 'NGN' ? 'NGN' : 'USD';
              const selected = tier === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  aria-pressed={selected}
                  className="text-left rounded-xl border-2 p-5 transition-colors bg-white h-full"
                  style={{ borderColor: selected ? '#1DB89A' : '#e5e7eb' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    {t === 'pro' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#D1F2EA', color: '#0D3B36' }}>
                        MOST POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{plan.tagline}</p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold" style={{ color: '#0D3B36' }}>
                      {pricing ? formatPlanPrice(getPlanPrice(t, interval, cur), cur) : '…'}
                    </span>
                    <span className="text-sm text-gray-400">/{interval === 'annual' ? 'yr' : 'mo'}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.featureLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 flex-shrink-0" style={{ color: line.included ? '#1DB89A' : '#d1d5db' }} aria-hidden>
                          {line.included ? '✓' : '✕'}
                        </span>
                        <span className={line.included ? 'text-gray-700' : 'text-gray-400'}>
                          {line.label}
                          {line.comingSoon && (
                            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              Coming soon
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {selected && (
                    <p className="mt-4 text-xs font-bold" style={{ color: '#0D3B36' }}>✓ Selected</p>
                  )}
                </button>
              );
            })}
          </div>
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
          {/* Plan + billing selector */}
          {pricing && (
            <div className="mb-8">
              {/* Billing toggle: Monthly / Annual (plan is chosen in the comparison above) */}
              <div className="flex justify-center">
                <div className="inline-flex items-center rounded-full bg-gray-100 p-1" role="group" aria-label="Billing interval">
                  {(['monthly', 'annual'] as BillingInterval[]).map((opt) => {
                    const active = interval === opt;
                    const cur: PriceCurrency = pricing.currency === 'NGN' ? 'NGN' : 'USD';
                    const save = opt === 'annual' ? annualSavings(tier, cur) : 0;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setInterval(opt)}
                        aria-pressed={active}
                        className="min-h-[44px] px-5 rounded-full text-sm font-semibold transition-colors"
                        style={active ? { backgroundColor: '#0D3B36', color: '#fff' } : { color: '#4b5563' }}
                      >
                        {opt === 'monthly' ? 'Monthly' : 'Annual'}
                        {opt === 'annual' && save > 0 && (
                          <span
                            className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={active ? { backgroundColor: '#1DB89A', color: '#0D3B36' } : { backgroundColor: '#D1F2EA', color: '#0D3B36' }}
                          >
                            SAVE {formatPlanPrice(save, cur)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="mb-4">
              {pricing ? (
                <>
                  <span className="text-5xl font-bold text-gray-900">
                    {formatPlanPrice(
                      getPlanPrice(tier, interval, pricing.currency === 'NGN' ? 'NGN' : 'USD'),
                      pricing.currency === 'NGN' ? 'NGN' : 'USD'
                    )}
                  </span>
                  <span className="text-gray-600 text-xl ml-2">
                    /{interval === 'annual' ? 'year' : 'month'}
                  </span>
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

          {user && (user.isAdmin || (isPaidTier(normaliseTier(user.subscription?.plan)) && user.subscription?.status === 'active')) ? (
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
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.174 1.346 1.416 3.14 1.416 4.502 0 2.153-.789 4.014-2.23 5.186-1.318 1.08-3.032 1.561-5.13 1.561H9.577l-1.017 6.638c-.076.499-.558.86-1.05.86zm-.193-2.025l.774-5.043h6.88c1.4 0 2.503-.33 3.245-.98.65-.58.978-1.39.978-2.38 0-1.01-.336-1.89-1.01-2.52-.68-.64-1.74-.97-3.18-.97H6.67l-.79 5.15z" />
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
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        Upgrade with Paystack
                      </>
                    )}
                  </button>
                )}

                {availableProviders.stripe && (
                  <div className="flex flex-col items-center w-full">
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
                            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l-2.541 4.083c-.48-.202-1.08-.42-1.94-.42v-.58zm6.777 2.944c.602-.604 1.376-1.015 1.376-1.81 0-1.21-1.044-2.21-2.9-2.21-2.115 0-4.592.92-6.584 2.067l-2.545-4.097c2.194-1.333 5.23-2.18 7.66-2.18 3.74 0 6.662 1.88 6.662 5.14 0 2.353-1.735 4.1-3.99 4.843l-2.679-4.753zM14.471 15.108c-2.29.861-4.691 1.413-6.74 1.413-3.701 0-5.78-1.838-5.78-4.8 0-3.24 2.82-5.5 7.27-5.5 2.366 0 4.94.69 7.27 1.856l-2.58 4.16c-.49-.175-1.03-.35-1.9-.35v-.58c0-1.28.65-1.95 1.84-1.95 1.84 0 3.26.45 4.77 1.11l-2.64 4.24c-.38.15-1.02.33-1.51.44v.37z" />
                          </svg>
                          Start 30-Day Free Trial
                        </>
                      )}
                    </button>
                    <p className="text-sm text-center text-gray-500 mt-2">
                      30 days free, then {pricing ? formatPlanPrice(getPlanPrice(tier, interval, pricing.currency === 'NGN' ? 'NGN' : 'USD'), pricing.currency === 'NGN' ? 'NGN' : 'USD') : '...'} / {interval === 'annual' ? 'year' : 'month'}
                    </p>
                  </div>
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
    </div >
  );
}

