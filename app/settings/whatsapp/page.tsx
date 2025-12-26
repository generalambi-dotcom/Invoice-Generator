'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/token-refresh';
import ProtectedRoute from '@/components/ProtectedRoute';

function WhatsAppConnectionContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [credential, setCredential] = useState<any>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    setUser(currentUser);
    loadConnection();
  }, [router]);

  const loadConnection = async () => {
    try {
      const token = await getValidAccessToken();
      const response = await fetch('/api/whatsapp/connect', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredential(data.credential);
        if (data.credential) {
          setPhoneNumber(data.credential.phoneNumber);
        }
      }

      // Check if WhatsApp is enabled globally
      const settingsResponse = await fetch('/api/admin/whatsapp', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setIsEnabled(settingsData.settings?.isEnabled || false);
      }
    } catch (err: any) {
      console.error('Error loading WhatsApp connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setError('');
    setSuccess('');
    setConnecting(true);

    try {
      if (!phoneNumber || !phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Please enter a valid phone number in international format (e.g., +2348012345678)');
      }

      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect WhatsApp');
      }

      const data = await response.json();
      setCredential(data.credential);
      setSuccess('WhatsApp connected successfully! Send a test message to verify your connection.');
    } catch (err: any) {
      console.error('Error connecting WhatsApp:', err);
      setError(err.message || 'Failed to connect WhatsApp');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your WhatsApp?')) {
      return;
    }

    setError('');
    setSuccess('');
    setDisconnecting(true);

    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch('/api/whatsapp/connect', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to disconnect WhatsApp');
      }

      setCredential(null);
      setPhoneNumber('');
      setSuccess('WhatsApp disconnected successfully');
    } catch (err: any) {
      console.error('Error disconnecting WhatsApp:', err);
      setError(err.message || 'Failed to disconnect WhatsApp');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  WhatsApp Integration Not Enabled
                </h2>
                <p className="text-gray-600 mb-4">
                  WhatsApp integration is currently disabled. Please contact your administrator to enable it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              WhatsApp Connection
            </h1>
            <p className="text-gray-600 mb-6">
              Connect your WhatsApp to create and receive invoices via WhatsApp
            </p>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {credential ? (
              /* Connected State */
              <div className="space-y-6">
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900">WhatsApp Connected</h3>
                      <p className="text-sm text-green-700">Your WhatsApp is connected and ready to use</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone Number:</span>
                      <span className="text-sm font-medium text-gray-900">{credential.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${credential.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {credential.isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                    {credential.lastMessageAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Message:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(credential.lastMessageAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">How to Use</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Send a message to your connected WhatsApp number</li>
                    <li>Use commands like: "Create invoice for John Doe, 5 items at $100 each"</li>
                    <li>You'll receive the invoice PDF via WhatsApp</li>
                    <li>Forward the invoice to your clients</li>
                  </ul>
                </div>

                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect WhatsApp'}
                </button>
              </div>
            ) : (
              /* Not Connected State */
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your WhatsApp</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your WhatsApp phone number to connect. Make sure to include the country code.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+2348012345678"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: +[country code][number] (e.g., +2348012345678 for Nigeria, +1234567890 for US)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={connecting || !phoneNumber}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {connecting ? 'Connecting...' : 'Connect WhatsApp'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function WhatsAppConnection() {
  return <WhatsAppConnectionContent />;
}

