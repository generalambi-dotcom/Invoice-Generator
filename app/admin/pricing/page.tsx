'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';

function PricingSettingsContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [pricingSettings, setPricingSettings] = useState({
    nigeria: {
      premiumPrice: 3000,
      currency: 'NGN',
      isActive: true,
    },
    'rest-of-world': {
      premiumPrice: 9.99,
      currency: 'USD',
      isActive: true,
    },
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/signin');
      return;
    }
    if (!currentUser.isAdmin) {
      router.push('/');
      return;
    }
    setUser(currentUser);
    loadPricingSettings();
  }, [router]);

  const loadPricingSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/pricing', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load pricing settings');
      }

      const data = await response.json();
      
      // Organize pricing settings by region
      const settings: any = {
        nigeria: { premiumPrice: 3000, currency: 'NGN', isActive: true },
        'rest-of-world': { premiumPrice: 9.99, currency: 'USD', isActive: true },
      };

      data.pricingSettings.forEach((setting: any) => {
        if (setting.region === 'nigeria' || setting.region === 'rest-of-world') {
          settings[setting.region] = {
            premiumPrice: setting.premiumPrice,
            currency: setting.currency,
            isActive: setting.isActive,
          };
        }
      });

      setPricingSettings(settings);
    } catch (err: any) {
      console.error('Error loading pricing settings:', err);
      setError(err.message || 'Failed to load pricing settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (region: 'nigeria' | 'rest-of-world') => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const setting = pricingSettings[region];
      
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          region,
          premiumPrice: setting.premiumPrice,
          currency: setting.currency,
          isActive: setting.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save pricing setting');
      }

      setSuccess(`${region === 'nigeria' ? 'Nigeria' : 'Rest of World'} pricing updated successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save pricing setting');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (region: 'nigeria' | 'rest-of-world', field: string, value: any) => {
    setPricingSettings((prev) => ({
      ...prev,
      [region]: {
        ...prev[region],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Pricing Settings
            </h1>
            <p className="text-gray-600 mb-6">
              Set different subscription prices for Nigeria and Rest of World
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

            {/* Nigeria Pricing */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nigeria Pricing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Price (NGN)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₦</span>
                    <input
                      type="number"
                      value={pricingSettings.nigeria.premiumPrice}
                      onChange={(e) => updateSetting('nigeria', 'premiumPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="100"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Monthly subscription price in Nigerian Naira
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pricingSettings.nigeria.isActive}
                      onChange={(e) => updateSetting('nigeria', 'isActive', e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <button
                    onClick={() => handleSave('nigeria')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Nigeria Pricing'}
                  </button>
                </div>
              </div>
            </div>

            {/* Rest of World Pricing */}
            <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rest of World Pricing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Price (USD)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">$</span>
                    <input
                      type="number"
                      value={pricingSettings['rest-of-world'].premiumPrice}
                      onChange={(e) => updateSetting('rest-of-world', 'premiumPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Monthly subscription price in US Dollars
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pricingSettings['rest-of-world'].isActive}
                      onChange={(e) => updateSetting('rest-of-world', 'isActive', e.target.checked)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <button
                    onClick={() => handleSave('rest-of-world')}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Rest of World Pricing'}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">How It Works</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Users from Nigeria will see the NGN pricing</li>
                <li>• Users from other countries will see the USD pricing</li>
                <li>• Region is detected automatically based on timezone and browser settings</li>
                <li>• Users can manually select their region if needed</li>
              </ul>
            </div>

            {/* Back Link */}
            <div className="mt-6">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function PricingSettings() {
  return <PricingSettingsContent />;
}

