'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getUsers, updateUserSubscription, getPaymentConfig, savePaymentConfig } from '@/lib/admin';
import { getCoupons, createCoupon, deleteCoupon } from '@/lib/coupons';
import { Coupon } from '@/types/coupon';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [paymentConfig, setPaymentConfig] = useState({
    paypalClientId: '',
    paystackPublicKey: '',
    paystackSecretKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'free' as 'free' | 'percentage' | 'fixed',
    discountValue: 0,
    duration: 30,
    maxUses: 100,
    expiresAt: '',
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
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadData = () => {
    try {
      const allUsers = getUsers();
      setUsers(allUsers);
      
      // Load payment config
      const config = getPaymentConfig();
      setPaymentConfig({
        paypalClientId: config.paypalClientId || '',
        paystackPublicKey: config.paystackPublicKey || '',
        paystackSecretKey: config.paystackSecretKey || '',
      });
      
      // Load coupons
      const allCoupons = getCoupons();
      setCoupons(allCoupons);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentConfig = () => {
    setSaveLoading(true);
    try {
      savePaymentConfig(paymentConfig);
      alert('Payment configuration saved successfully!');
    } catch (error: any) {
      alert('Failed to save configuration: ' + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateSubscription = (userId: string, plan: 'free' | 'premium', status: 'active' | 'cancelled' | 'expired') => {
    if (confirm(`Are you sure you want to ${plan === 'premium' ? 'upgrade' : 'downgrade'} this user?`)) {
      try {
        updateUserSubscription(userId, plan, status);
        loadData();
        alert('User subscription updated successfully!');
      } catch (error: any) {
        alert('Failed to update subscription: ' + error.message);
      }
    }
  };

  const handleCreateCoupon = () => {
    try {
      createCoupon({
        code: newCoupon.code,
        discountType: newCoupon.discountType,
        discountValue: newCoupon.discountType !== 'free' ? newCoupon.discountValue : undefined,
        plan: 'premium',
        duration: newCoupon.duration,
        maxUses: newCoupon.maxUses,
        expiresAt: newCoupon.expiresAt || undefined,
      });
      alert('Coupon created successfully!');
      setShowCouponForm(false);
      setNewCoupon({
        code: '',
        discountType: 'free',
        discountValue: 0,
        duration: 30,
        maxUses: 100,
        expiresAt: '',
      });
      loadData();
    } catch (error: any) {
      alert('Failed to create coupon: ' + error.message);
    }
  };

  const handleDeleteCoupon = (code: string) => {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      try {
        deleteCoupon(code);
        loadData();
        alert('Coupon deleted successfully!');
      } catch (error: any) {
        alert('Failed to delete coupon: ' + error.message);
      }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Configuration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment API Configuration</h2>
          <p className="text-sm text-gray-600 mb-6">
            Configure your payment gateway API keys. These will be used for processing payments.
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  PayPal Client ID
                </label>
                <button
                  onClick={() => {
                    window.open('/settings/payment-methods/paypal-setup?testMode=false', '_blank');
                  }}
                  className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.451 0 5.97 0h7.976a11.1 11.1 0 0 1 2.33.237c1.941.519 3.105 1.767 3.105 3.745 0 2.268-1.841 4.142-4.604 4.142H12.19l-1.028 5.978a2.28 2.28 0 0 0 .182 1.925 2.243 2.243 0 0 0 1.87.995h8.945a.746.746 0 0 1 .735.896l-1.319 7.66a.641.641 0 0 1-.633.54h-4.846a.635.635 0 0 1-.627-.54l-.408-2.388a.635.635 0 0 0-.627-.54H9.23a2.24 2.24 0 0 1-1.87-.995 2.28 2.28 0 0 1-.182-1.925l1.028-5.978H7.076z"/>
                  </svg>
                  Connect PayPal
                </button>
              </div>
              <input
                type="text"
                value={paymentConfig.paypalClientId}
                onChange={(e) => setPaymentConfig({...paymentConfig, paypalClientId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="PayPal Client ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Click "Connect PayPal" to get your credentials, or enter manually from your PayPal Developer Dashboard
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paystack Public Key
              </label>
              <input
                type="text"
                value={paymentConfig.paystackPublicKey}
                onChange={(e) => setPaymentConfig({...paymentConfig, paystackPublicKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Paystack Public Key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from your Paystack Dashboard (Settings → API Keys & Webhooks)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paystack Secret Key
              </label>
              <input
                type="password"
                value={paymentConfig.paystackSecretKey}
                onChange={(e) => setPaymentConfig({...paymentConfig, paystackSecretKey: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Paystack Secret Key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Keep this secret! Never share this key publicly.
              </p>
            </div>
            
            <button
              onClick={handleSavePaymentConfig}
              disabled={saveLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saveLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/pricing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Pricing Settings
            </Link>
            <Link
              href="/admin/whatsapp"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              WhatsApp Settings
            </Link>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users Management</h2>
          <p className="text-sm text-gray-600 mb-6">
            Manage user subscriptions and access levels.
          </p>
          
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        {u.isAdmin && (
                          <div className="text-xs text-blue-600">Admin</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          u.subscription?.plan === 'premium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.subscription?.plan || 'free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          u.subscription?.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : u.subscription?.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.subscription?.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {u.subscription?.plan !== 'premium' && (
                            <button
                              onClick={() => handleUpdateSubscription(u.id, 'premium', 'active')}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Upgrade
                            </button>
                          )}
                          {u.subscription?.plan === 'premium' && (
                            <button
                              onClick={() => handleUpdateSubscription(u.id, 'free', 'cancelled')}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Downgrade
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

