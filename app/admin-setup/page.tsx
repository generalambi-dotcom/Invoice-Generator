'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUsers } from '@/lib/admin';
import { makeUserAdmin } from '@/lib/admin-setup';

export default function AdminSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/signin');
      return;
    }
    
    // Load users
    const allUsers = getUsers();
    setUsers(allUsers);
  }, [router]);

  const handleMakeAdmin = () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    const success = makeUserAdmin(email);
    if (success) {
      setMessage(`✅ User ${email} is now an admin! Please refresh and sign in again.`);
      setEmail('');
      // Reload users
      setUsers(getUsers());
    } else {
      setMessage(`❌ Failed to make ${email} an admin. User may not exist.`);
    }
  };

  const handleMakeFirstUserAdmin = () => {
    const success = makeUserAdmin(users[0]?.email || '');
    if (success) {
      setMessage(`✅ First user (${users[0]?.email}) is now an admin! Please refresh and sign in again.`);
      setUsers(getUsers());
    } else {
      setMessage('❌ Failed to make first user an admin.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup</h1>
          <p className="text-gray-600 mb-6">
            Use this page to make a user an admin. Only existing users can be made admins.
          </p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Make user admin by email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make User Admin by Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleMakeAdmin}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Make Admin
                </button>
              </div>
            </div>

            {/* Quick setup: Make first user admin */}
            {users.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Setup
                </label>
                <button
                  onClick={handleMakeFirstUserAdmin}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Make First User Admin ({users[0]?.email})
                </button>
              </div>
            )}

            {/* Users List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Users</h2>
              {users.length === 0 ? (
                <p className="text-gray-500">No users found. Please sign up first.</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.isAdmin && (
                          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                            Admin
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          user.subscription?.plan === 'premium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription?.plan || 'free'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Alternative Method (Browser Console)</h3>
              <p className="text-sm text-blue-800 mb-2">
                You can also make a user admin using the browser console:
              </p>
              <code className="block text-xs bg-white p-2 rounded border border-blue-200 text-blue-900">
                {`import { makeUserAdmin } from '@/lib/admin-setup';
makeUserAdmin('user@example.com');`}
              </code>
            </div>

            <div className="mt-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

