'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkPasswordStrength, validatePassword } from '@/lib/password-validator';
import AuthLayout from '@/components/AuthLayout';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { createSession } from '@/lib/session';
import { trackEvent } from '@/lib/tracking';

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    marketingConsent: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const requestedRedirect = new URLSearchParams(window.location.search).get('redirect');
      const safeRedirect = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
        ? requestedRedirect
        : '/dashboard';
      localStorage.setItem('invoice-generator-post-auth-redirect', safeRedirect);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          marketingConsent: formData.marketingConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // On auto-login (verification disabled) the access token is set as an
      // httpOnly cookie by the server. Persist only non-sensitive client state.
      if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
      if (data.user) {
        localStorage.setItem('invoice-generator-current-user', JSON.stringify(data.user));
        createSession(data.user);
      }
      trackEvent('sign_up', { method: 'email' });

      // Redirect to email verification or dashboard
      if (data.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(safeRedirect)}`);
      } else {
        router.push(safeRedirect);
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Create your free workspace"
      subheading="Save this invoice, reuse customer details and keep track of what is paid."
    >
      <div className="mb-8">
        <GoogleSignInButton text="Sign up with Google" />

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or sign up with email</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1F4D45] focus:border-[#1F4D45] transition-all bg-gray-50 focus:bg-white"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1F4D45] focus:border-[#1F4D45] transition-all bg-gray-50 focus:bg-white"
            placeholder="john@example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1F4D45] focus:border-[#1F4D45] transition-all bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1F4D45] focus:border-[#1F4D45] transition-all bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          By creating an account, you agree to our <Link href="/terms" className="text-[#1F4D45] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#1F4D45] hover:underline">Privacy Policy</Link>.
        </p>

        <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={formData.marketingConsent}
            onChange={(event) => setFormData({ ...formData, marketingConsent: event.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1F4D45] focus:ring-[#1F4D45]"
          />
          <span>
            Send me occasional product updates and practical invoicing tips. This is optional and can be changed anytime.
          </span>
        </label>

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
              Creating Account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/signin" className="font-bold text-[#1F4D45] hover:text-[#163832]">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
