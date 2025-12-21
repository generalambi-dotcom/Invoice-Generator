'use client';

import React, { useState, useEffect } from 'react';

export default function CookieSettingsPage() {
  const [cookies, setCookies] = useState({
    essential: true, // Always enabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('cookie-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCookies((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleToggle = (key: 'analytics' | 'marketing') => {
    const newCookies = { ...cookies, [key]: !cookies[key] };
    setCookies(newCookies);
    localStorage.setItem('cookie-preferences', JSON.stringify(newCookies));
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setCookies(allAccepted);
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
  };

  const handleRejectAll = () => {
    const allRejected = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    setCookies(allRejected);
    localStorage.setItem('cookie-preferences', JSON.stringify(allRejected));
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Settings</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <p className="text-sm text-gray-500">Last updated: December 2024</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make 
              websites work more efficiently and provide information to the website owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Invoice Generator Nigeria uses cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
              You can control which cookies you accept below.
            </p>

            {/* Essential Cookies */}
            <div className="border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Essential Cookies</h3>
                  <p className="text-sm text-gray-600">Always Active</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                  Required
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, 
                network management, and accessibility. You cannot opt-out of these cookies.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600">Help us understand how visitors interact with our website</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cookies.analytics}
                    onChange={() => handleToggle('analytics')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <p className="text-gray-700 leading-relaxed">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. 
                They help us know which pages are most and least popular and see how visitors move around the site.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600">Used to track visitors across websites for marketing purposes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cookies.marketing}
                    onChange={() => handleToggle('marketing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <p className="text-gray-700 leading-relaxed">
                These cookies may be set through our site by our advertising partners. They may be used to build a profile of your 
                interests and show you relevant content on other sites.
              </p>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleRejectAll}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reject All
            </button>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can impact 
              your user experience and parts of our website may no longer be fully accessible.
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies. You can also delete cookies 
              that have already been set. The process for managing cookies varies by browser.</p>
              <p><strong>Our Cookie Settings:</strong> Use the toggles above to manage your cookie preferences for this website.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">More Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For more information about how we use cookies and your data, please review our Privacy Policy. If you have any questions 
              about our use of cookies, please contact us through our website or email support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

