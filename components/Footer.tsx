'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Footer() {
  const [nlEmail, setNlEmail] = useState('');
  const [nlSubmitting, setNlSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    setNlSubmitting(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Subscribed!');
        setNlEmail('');
        localStorage.setItem('newsletter_subscribed', 'true');
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setNlSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Signup */}
        <div className="mb-10 pb-8 border-b border-gray-300">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              📬 Stay Updated
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get invoicing tips, product updates, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              />
              <button
                type="submit"
                disabled={nlSubmitting}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {nlSubmitting ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">No spam, unsubscribe anytime.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Invoicing Guide */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">
              INVOICING GUIDE
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/guide#introduction"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Introduction
                </Link>
              </li>
              <li>
                <Link
                  href="/guide#why-invoicing-matters"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Why Invoicing Matters
                </Link>
              </li>
              <li>
                <Link
                  href="/guide#essential-elements"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Essential Elements
                </Link>
              </li>
              <li>
                <Link
                  href="/guide#types-of-invoices"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Types of Invoices
                </Link>
              </li>
              <li>
                <Link
                  href="/guide#how-to-make-invoice"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  How to Make an Invoice
                </Link>
              </li>
              <li>
                <Link
                  href="/guide#payment-terms"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Payment Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/guide#compliance"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Compliance & Regulations
                </Link>
              </li>
              <li>
                <Link
                  href="/guide#best-practices"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Best Practices
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4">
              RESOURCES
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/guide"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Invoicing Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/release-notes"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Release Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Contextual SEO Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase mb-4 flex items-center gap-1">
              <span role="img" aria-label="point">👉</span> INVOICE GENERATORS
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/invoice-generator-nigeria"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Invoice Generator Nigeria
                </Link>
              </li>
              <li>
                <Link
                  href="/invoice-template-nigeria"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Free Invoice Template Nigeria
                </Link>
              </li>
              <li>
                <Link
                  href="/naira-invoice-generator"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Naira Invoice Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-invoice-generator-nigeria"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  AI Invoice Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/send-invoice-via-whatsapp-nigeria"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  WhatsApp Invoice Sender
                </Link>
              </li>
              <li>
                <Link
                  href="/freelance-invoice-template-ngn"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Freelance Invoice Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/create-invoice-online-ngn"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Online Invoice Creator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Copyright, Social Media, Legal */}
          <div>
            <p className="text-sm text-gray-700 mb-4">
              © 2012-2025 Invoice-Generator.ng
            </p>

            {/* Social Media Icons */}
            <div className="flex space-x-2 mb-4">
              <a
                href="https://www.facebook.com/invoicegeneratoring"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="InvoiceGenerator.ng on Facebook"
              >
                <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://x.com/invoicegenerng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="InvoiceGenerator.ng on X (Twitter)"
              >
                <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@invoicegeneratoring"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="InvoiceGenerator.ng on YouTube"
              >
                <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/invoicegenerator-ng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="InvoiceGenerator.ng on LinkedIn"
              >
                <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://github.com/invoicegenerator-ng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="InvoiceGenerator.ng on GitHub"
              >
                <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            {/* Legal Links */}
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Cookie Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

