'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/token-refresh';
import ProtectedRoute from '@/components/ProtectedRoute';

function WhatsAppSettingsContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    provider: 'twilio',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioWhatsAppNumber: '',
    metaAppId: '',
    metaAppSecret: '',
    metaAccessToken: '',
    metaPhoneNumberId: '',
    metaBusinessAccountId: '',
    webhookUrl: '',
    webhookSecret: '',
    isEnabled: false,
    allowUserConnections: true,
    messagesPerMinute: 60,
    messagesPerDay: 1000,
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
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const token = await getValidAccessToken();
      const response = await fetch('/api/admin/whatsapp', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load WhatsApp settings');
      }

      const data = await response.json();
      if (data.settings) {
        setSettings({
          provider: data.settings.provider || 'twilio',
          twilioAccountSid: data.settings.twilioAccountSid || '',
          twilioAuthToken: data.settings.twilioAuthToken === '***encrypted***' ? '' : (data.settings.twilioAuthToken || ''),
          twilioWhatsAppNumber: data.settings.twilioWhatsAppNumber || '',
          metaAppId: data.settings.metaAppId || '',
          metaAppSecret: data.settings.metaAppSecret === '***encrypted***' ? '' : (data.settings.metaAppSecret || ''),
          metaAccessToken: data.settings.metaAccessToken === '***encrypted***' ? '' : (data.settings.metaAccessToken || ''),
          metaPhoneNumberId: data.settings.metaPhoneNumberId || '',
          metaBusinessAccountId: data.settings.metaBusinessAccountId || '',
          webhookUrl: data.settings.webhookUrl || '',
          webhookSecret: data.settings.webhookSecret === '***encrypted***' ? '' : (data.settings.webhookSecret || ''),
          isEnabled: data.settings.isEnabled || false,
          allowUserConnections: data.settings.allowUserConnections !== undefined ? data.settings.allowUserConnections : true,
          messagesPerMinute: data.settings.messagesPerMinute || 60,
          messagesPerDay: data.settings.messagesPerDay || 1000,
        });
      }
    } catch (err: any) {
      console.error('Error loading WhatsApp settings:', err);
      setError(err.message || 'Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch('/api/admin/whatsapp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save WhatsApp settings');
      }

      setSuccess('WhatsApp settings saved successfully!');
      await loadSettings(); // Reload to get updated values
    } catch (err: any) {
      console.error('Error saving WhatsApp settings:', err);
      setError(err.message || 'Failed to save WhatsApp settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
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
              WhatsApp Integration Settings
            </h1>
            <p className="text-gray-600 mb-6">
              Configure WhatsApp API credentials to enable invoice creation and sending via WhatsApp
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

            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Provider
              </label>
              <select
                value={settings.provider}
                onChange={(e) => updateSetting('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="twilio">Twilio WhatsApp API</option>
                <option value="meta">Meta WhatsApp Business API</option>
                <option value="whatsapp-web">WhatsApp Web (Development)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose your WhatsApp provider. Twilio is recommended for production.
              </p>
            </div>

            {/* Twilio Settings */}
            {settings.provider === 'twilio' && (
              <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Twilio Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twilio Account SID *
                    </label>
                    <input
                      type="text"
                      value={settings.twilioAccountSid}
                      onChange={(e) => updateSetting('twilioAccountSid', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get this from your Twilio Console Dashboard
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twilio Auth Token *
                    </label>
                    <input
                      type="password"
                      value={settings.twilioAuthToken}
                      onChange={(e) => updateSetting('twilioAuthToken', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter auth token (leave blank to keep existing)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get this from your Twilio Console Dashboard. Leave blank to keep existing token.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twilio WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={settings.twilioWhatsAppNumber}
                      onChange={(e) => updateSetting('twilioWhatsAppNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+14155238886 (Twilio Sandbox) or your WhatsApp-enabled number"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your Twilio WhatsApp number. Use sandbox number for testing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Meta/WhatsApp Business API Settings */}
            {settings.provider === 'meta' && (
              <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Meta WhatsApp Business API Configuration</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App ID
                    </label>
                    <input
                      type="text"
                      value={settings.metaAppId}
                      onChange={(e) => updateSetting('metaAppId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your Meta App ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App Secret
                    </label>
                    <input
                      type="password"
                      value={settings.metaAppSecret}
                      onChange={(e) => updateSetting('metaAppSecret', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter app secret (leave blank to keep existing)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={settings.metaAccessToken}
                      onChange={(e) => updateSetting('metaAccessToken', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter access token (leave blank to keep existing)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={settings.metaPhoneNumberId}
                      onChange={(e) => updateSetting('metaPhoneNumberId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your WhatsApp Business Phone Number ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Account ID
                    </label>
                    <input
                      type="text"
                      value={settings.metaBusinessAccountId}
                      onChange={(e) => updateSetting('metaBusinessAccountId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your WhatsApp Business Account ID"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Webhook Configuration */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.webhookUrl}
                    onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://yourdomain.com/api/webhooks/whatsapp"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Configure this URL in your WhatsApp provider dashboard to receive messages
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook Secret
                  </label>
                  <input
                    type="password"
                    value={settings.webhookSecret}
                    onChange={(e) => updateSetting('webhookSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter webhook secret (leave blank to keep existing)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Secret for verifying webhook requests (optional but recommended)
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Enable WhatsApp Integration
                    </label>
                    <p className="text-xs text-gray-500">
                      Turn on WhatsApp functionality for all users
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.isEnabled}
                      onChange={(e) => updateSetting('isEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Allow User Connections
                    </label>
                    <p className="text-xs text-gray-500">
                      Allow users to connect their own WhatsApp accounts
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowUserConnections}
                      onChange={(e) => updateSetting('allowUserConnections', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate Limiting</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Messages Per Minute
                  </label>
                  <input
                    type="number"
                    value={settings.messagesPerMinute}
                    onChange={(e) => updateSetting('messagesPerMinute', parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Messages Per Day
                  </label>
                  <input
                    type="number"
                    value={settings.messagesPerDay}
                    onChange={(e) => updateSetting('messagesPerDay', parseInt(e.target.value) || 1000)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    max="100000"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function WhatsAppSettings() {
  return <WhatsAppSettingsContent />;
}

