'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MakeAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sokanpete@gmail.com');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMakeAdmin = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Success! User is now an admin.');
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      } else {
        setError(data.error || 'Failed to make user admin');
      }
    } catch (err: any) {
      setError('Error: ' + (err.message || 'Failed to connect to server. Make sure the dev server is running.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Make User Admin</h1>
        <p className="text-gray-600 mb-6">
          Enter the email address of the user you want to make an admin.
        </p>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <p className="font-semibold">{message}</p>
            <p className="text-sm mt-2">Redirecting to sign in page in 3 seconds...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Error:</p>
            <p className="text-sm mt-1">{error}</p>
            {error.includes('not found') && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-semibold mb-1">💡 Solution:</p>
                <p>You need to sign up first before making yourself admin.</p>
                <button
                  onClick={() => router.push('/signup')}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Go to Sign Up
                </button>
              </div>
            )}
            {error.includes('DATABASE_URL') && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-semibold mb-1">💡 Solution:</p>
                <p>Check your .env.local file and make sure DATABASE_URL is set correctly.</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="user@example.com"
            />
          </div>

          <button
            onClick={handleMakeAdmin}
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Processing...' : 'Make Admin'}
          </button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold mb-2">
              📝 Important Steps:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Make sure you've signed up first (if you haven't)</li>
              <li>Click "Make Admin" above</li>
              <li>Sign out (if you're logged in)</li>
              <li>Sign in again at /signin</li>
              <li>Then access /admin</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/signup')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Sign Up First
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
