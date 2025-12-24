'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function PayPalSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<'login' | 'credentials'>('login');
  const [isTestMode, setIsTestMode] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
  });
  const [saving, setSaving] = useState(false);
  const [paypalLoggedIn, setPaypalLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    setUser(currentUser);
    
    const testMode = searchParams.get('testMode') === 'true';
    setIsTestMode(testMode);
  }, [router, searchParams]);

  const handlePayPalLogin = () => {
    // Open PayPal login in a new window
    const paypalUrl = isTestMode
      ? 'https://www.sandbox.paypal.com/signin'
      : 'https://www.paypal.com/signin';
    
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      paypalUrl,
      'PayPal Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    // Listen for when user closes the popup (they've logged in)
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        // Assume they logged in (in a real app, you'd verify this)
        setPaypalLoggedIn(true);
        setStep('credentials');
      }
    }, 500);
  };

  const handleGetCredentials = () => {
    // Open PayPal Developer Dashboard
    const devUrl = isTestMode
      ? 'https://developer.paypal.com/dashboard/applications/sandbox'
      : 'https://developer.paypal.com/dashboard/applications/live';
    
    window.open(devUrl, '_blank');
  };

  const handleSave = async () => {
    if (!formData.clientId || !formData.clientSecret) {
      alert('Please enter both Client ID and Client Secret');
      return;
    }

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/payment-credentials', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider: 'paypal',
          clientId: formData.clientId,
          clientSecret: formData.clientSecret,
          isTestMode,
        }),
      });

      if (response.ok) {
        alert('PayPal credentials saved successfully!');
        router.push('/settings/payment-methods');
      } else {
        const error = await response.json();
        alert('Failed to save: ' + error.error);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect PayPal</h1>
            <p className="text-gray-600">
              Follow these steps to connect your PayPal account
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === 'login' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {step === 'login' ? '1' : '✓'}
              </div>
              <div className={`flex-1 h-1 mx-4 ${
                step === 'credentials' ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === 'credentials' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Login to PayPal</span>
              <span className="text-sm text-gray-600">Get API Credentials</span>
            </div>
          </div>

          {/* Step 1: Login to PayPal */}
          {step === 'login' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Step 1: Login to PayPal</h2>
                <p className="text-gray-700 mb-4">
                  First, make sure you're logged into your PayPal account. This ensures you can access your Developer Dashboard.
                </p>
                <button
                  onClick={handlePayPalLogin}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.451 0 5.97 0h7.976a11.1 11.1 0 0 1 2.33.237c1.941.519 3.105 1.767 3.105 3.745 0 2.268-1.841 4.142-4.604 4.142H12.19l-1.028 5.978a2.28 2.28 0 0 0 .182 1.925 2.243 2.243 0 0 0 1.87.995h8.945a.746.746 0 0 1 .735.896l-1.319 7.66a.641.641 0 0 1-.633.54h-4.846a.635.635 0 0 1-.627-.54l-.408-2.388a.635.635 0 0 0-.627-.54H9.23a2.24 2.24 0 0 1-1.87-.995 2.28 2.28 0 0 1-.182-1.925l1.028-5.978H7.076z"/>
                  </svg>
                  Login to PayPal {isTestMode && '(Sandbox)'}
                </button>
                <p className="text-sm text-gray-600 mt-4">
                  After logging in, close the popup and click "Continue" below.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('credentials')}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Continue to Step 2
                </button>
                <button
                  onClick={() => router.push('/settings/payment-methods')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Get API Credentials */}
          {step === 'credentials' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Step 2: Get Your API Credentials</h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-4">
                  <li>Click the button below to open PayPal Developer Dashboard</li>
                  <li>Click "Create App" or select an existing app</li>
                  <li>Copy your <strong>Client ID</strong> and <strong>Secret</strong></li>
                  <li>Paste them in the form below</li>
                </ol>
                <button
                  onClick={handleGetCredentials}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Open PayPal Developer Dashboard {isTestMode ? '(Sandbox)' : '(Live)'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID *
                  </label>
                  <input
                    type="text"
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your PayPal Client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret *
                  </label>
                  <input
                    type="password"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your PayPal Client Secret"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="h-4 w-4 text-green-600"
                  />
                  <label htmlFor="testMode" className="ml-2 text-sm text-gray-700">
                    Test Mode (Use sandbox credentials)
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                  {saving ? 'Saving...' : 'Save & Connect'}
                </button>
                <button
                  onClick={() => router.push('/settings/payment-methods')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PayPalSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <PayPalSetupContent />
    </Suspense>
  );
}

