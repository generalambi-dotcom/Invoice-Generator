'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { createSession, setupSessionTracking } from '@/lib/session';
import AuthLayout from '@/components/AuthLayout';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { trackEvent } from '@/lib/tracking';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  useEffect(() => {
    setupSessionTracking();
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorDetails([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // 2FA required — show the TOTP step
        if (data.requires2FA) {
          setTempToken(data.tempToken);
          setRequires2FA(true);
          setIsLoading(false);
          return;
        }

        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('invoice-generator-current-user', JSON.stringify(data.user));
        document.cookie = `auth_token=${data.token}; path=/; max-age=${15 * 60}; SameSite=Lax`;
        createSession(data.user);

        trackEvent('login', { method: 'email' });

        const redirectUrl = searchParams.get('redirect') || '/dashboard';
        window.location.href = redirectUrl;
        return;
      }

      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.requiresVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(errorData.email || email)}`);
          return;
        }
      }

      const errorData = await response.json();
      setError(errorData.error || 'Failed to sign in.');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter the 6-digit code from your authenticator app.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid code.'); return; }
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('invoice-generator-current-user', JSON.stringify(data.user));
      document.cookie = `auth_token=${data.token}; path=/; max-age=${15 * 60}; SameSite=Lax`;
      createSession(data.user);
      trackEvent('login', { method: '2fa' });
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA verification step
  if (requires2FA) {
    return (
      <AuthLayout heading="Two-Factor Authentication" subheading="Enter the 6-digit code from your authenticator app.">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>
        )}
        <form onSubmit={handle2FASubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Authentication Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="\d{6}"
              required
              autoFocus
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1F4D45] focus:border-[#1F4D45] transition-all bg-gray-50 focus:bg-white text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || totpCode.length !== 6}
            className="w-full py-3.5 px-4 bg-[#1F4D45] hover:bg-[#163832] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying…' : 'Verify & Sign In'}
          </button>
          <button type="button" onClick={() => { setRequires2FA(false); setTotpCode(''); setError(''); }}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            ← Back to sign in
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Welcome Back"
      subheading="Please enter your details to sign in."
    >
      {/* Social Login */}
      <div className="mb-8">
        <GoogleSignInButton />

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or sign in with email</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1F4D45] focus:border-[#1F4D45] transition-all bg-gray-50 focus:bg-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-sm text-[#1F4D45] hover:text-[#163832] font-medium">
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1F4D45] focus:border-[#1F4D45] transition-all bg-gray-50 focus:bg-white"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center">
          <input
            id="keep-logged-in"
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className="h-4 w-4 text-[#1F4D45] focus:ring-[#1F4D45] border-gray-300 rounded"
          />
          <label htmlFor="keep-logged-in" className="ml-2 block text-sm text-gray-600">
            Keep me logged in
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-[#1F4D45] hover:bg-[#163832] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/signup" className="font-bold text-[#1F4D45] hover:text-[#163832]">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

