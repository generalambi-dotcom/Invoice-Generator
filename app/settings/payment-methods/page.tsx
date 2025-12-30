'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formProvider, setFormProvider] = useState<'paypal' | 'paystack' | 'stripe' | null>(null);
  const [formData, setFormData] = useState({
    publicKey: '',
    secretKey: '',
    clientId: '',
    clientSecret: '',
    isTestMode: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    setUser(currentUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (user) {
      loadCredentials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCredentials = async () => {
    if (!user) return;
    
    try {
      // In production, this would use proper authentication
      const response = await fetch('/api/payment-credentials', {
        headers: {
          'x-user-id': user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formProvider || !user) return;

    setSaving(true);
    try {
      const response = await fetch('/api/payment-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          provider: formProvider,
          ...formData,
        }),
      });

      if (response.ok) {
        alert('Payment credentials saved successfully!');
        setShowForm(false);
        setFormProvider(null);
        setFormData({
          publicKey: '',
          secretKey: '',
          clientId: '',
          clientSecret: '',
          isTestMode: false,
        });
        loadCredentials();
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

  const handleDelete = async (credentialId: string) => {
    if (!confirm('Are you sure you want to remove these payment credentials?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payment-credentials?id=${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Payment credentials removed successfully');
        loadCredentials();
      } else {
        const error = await response.json();
        alert('Failed to remove: ' + (error.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error deleting payment credential:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600 mt-2">
            Connect your payment gateways to accept payments directly from invoices
          </p>
        </div>

        {/* Existing Credentials */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Connected Payment Methods</h2>
            <button
              onClick={() => {
                setShowForm(true);
                setFormProvider(null);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add Payment Method
            </button>
          </div>

          {credentials.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No payment methods connected yet.
            </p>
          ) : (
            <div className="space-y-4">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">{cred.provider}</span>
                      {cred.isTestMode && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Test Mode
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Public Key: {cred.publicKey?.substring(0, 20)}...
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {formProvider ? `Configure ${formProvider}` : 'Select Payment Method'}
            </h2>

            {!formProvider ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setFormProvider('paystack')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold">Paystack</div>
                  <div className="text-sm text-gray-500 mt-1">Popular in Nigeria</div>
                </button>
                <button
                  onClick={() => setFormProvider('stripe')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold">Stripe</div>
                  <div className="text-sm text-gray-500 mt-1">Global payments</div>
                </button>
                <button
                  onClick={() => setFormProvider('paypal')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold">PayPal</div>
                  <div className="text-sm text-gray-500 mt-1">International</div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formProvider === 'paystack' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Public Key *
                      </label>
                      <input
                        type="text"
                        value={formData.publicKey}
                        onChange={(e) => setFormData({...formData, publicKey: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key *
                      </label>
                      <input
                        type="password"
                        value={formData.secretKey}
                        onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="sk_test_..."
                      />
                    </div>
                  </>
                )}

                {formProvider === 'stripe' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publishable Key *
                      </label>
                      <input
                        type="text"
                        value={formData.publicKey}
                        onChange={(e) => setFormData({...formData, publicKey: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key *
                      </label>
                      <input
                        type="password"
                        value={formData.secretKey}
                        onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="sk_test_..."
                      />
                    </div>
                  </>
                )}

                {formProvider === 'paypal' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2">Connect Your PayPal Account</h3>
                    <p className="text-gray-700 mb-4">
                      We'll guide you through connecting your PayPal account. You'll be redirected to PayPal to login, then we'll help you get your API credentials.
                    </p>
                    <button
                      onClick={() => {
                        const testMode = formData.isTestMode;
                        router.push(`/settings/payment-methods/paypal-setup?testMode=${testMode}`);
                      }}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.451 0 5.97 0h7.976a11.1 11.1 0 0 1 2.33.237c1.941.519 3.105 1.767 3.105 3.745 0 2.268-1.841 4.142-4.604 4.142H12.19l-1.028 5.978a2.28 2.28 0 0 0 .182 1.925 2.243 2.243 0 0 0 1.87.995h8.945a.746.746 0 0 1 .735.896l-1.319 7.66a.641.641 0 0 1-.633.54h-4.846a.635.635 0 0 1-.627-.54l-.408-2.388a.635.635 0 0 0-.627-.54H9.23a2.24 2.24 0 0 1-1.87-.995 2.28 2.28 0 0 1-.182-1.925l1.028-5.978H7.076z"/>
                      </svg>
                      Connect with PayPal
                    </button>
                    <p className="text-sm text-gray-600 mt-3">
                      You can also manually enter credentials below if you prefer.
                    </p>
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        Or enter credentials manually
                      </summary>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client ID *
                          </label>
                          <input
                            type="text"
                            value={formData.clientId}
                            onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Client ID"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Client Secret"
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={formData.isTestMode}
                    onChange={(e) => setFormData({...formData, isTestMode: e.target.checked})}
                    className="h-4 w-4 text-green-600"
                  />
                  <label htmlFor="testMode" className="ml-2 text-sm text-gray-700">
                    Test Mode (Use test/sandbox credentials)
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setFormProvider(null);
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

