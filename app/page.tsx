import Link from 'next/link';
import InvoiceFormPreview from '@/components/InvoiceFormPreview';
import PricingSection from '@/components/PricingSection';
import GlobalInvoiceCounter from '@/components/GlobalInvoiceCounter';
import { Sparkles, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoice Generator - Create Professional Invoices in Seconds',
  description: ' The #1 free invoice generator for Nigerian businesses. Create, send, and manage professional invoices effortlessly.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-[76rem] mx-auto mb-16 relative z-10">
            {/* Overlapping Avatars + User Count */}
            <div className="inline-flex items-center gap-3 mb-8 animate-fade-in-up">
              {/* Avatar Stack */}
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-xs">👩🏽</div>
                <div className="w-8 h-8 rounded-full bg-sky-200 border-2 border-white flex items-center justify-center text-xs">👨🏻</div>
                <div className="w-8 h-8 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center text-xs">👩🏿</div>
                <div className="w-8 h-8 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-xs">👨🏾</div>
              </div>
              <span className="text-sm text-gray-600">
                <GlobalInvoiceCounter /> invoices generated for modern businesses
              </span>
            </div>

            <h1 className="font-bold tracking-tight text-slate-900 mb-4 leading-[1.2] animate-fade-in-up animation-delay-100" style={{ fontSize: '2.5rem' }}>
              Create Professional &{' '}
              <span className="italic text-teal-800">Free Invoices</span>
              <br className="hidden md:block" />
              in Seconds
            </h1>

            <p className="text-gray-500 mb-8 max-w-xl mx-auto animate-fade-in-up animation-delay-200" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              Simple, fast, and 100% free invoice generator for Nigerian businesses. No sign-up required to get started.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up animation-delay-300">
              <Link
                href="/free-invoice-generator"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-teal-800 text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                Create Invoice
              </Link>
              <Link
                href="/signin"
                className="px-5 py-2.5 text-sm font-semibold rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Interactive Invoice Form Preview */}
          <InvoiceFormPreview />

          <div className="mt-8 text-center flex flex-wrap items-center justify-center gap-1.5 text-sm text-gray-500 font-medium px-4 animate-fade-in-up animation-delay-400">
            <Link href="/upgrade" className="text-gray-900 font-bold hover:underline transition-colors decoration-2 underline-offset-2 decoration-amber-400">Try Premium 30 days free</Link>
            <span>— create smarter invoices with <Sparkles className="w-4 h-4 inline-block text-purple-500 mb-0.5 mx-0.5" /> <span className="font-bold text-gray-700">AI</span></span>
            <span>and send instantly via <MessageCircle className="w-4 h-4 inline-block text-[#25D366] mb-0.5 mx-0.5" /> <span className="font-bold text-[#25D366]">WhatsApp</span>.</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 1: Everything You Need for Professional Invoicing */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need for Professional Invoicing</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
              InvoiceGenerator combines powerful invoice management features with simplicity to
              help freelancers and small businesses manage their invoicing workflow efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Professional Invoice Creation</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Create beautiful invoices with your logo and company branding. Support for 50+ currencies, automatic tax and discount calculations.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">✓ 6 color themes</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">✓ 50+ currencies</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">✓ Auto calculations</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">✓ Company branding</span>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Invoice Tracking & Dashboard</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Track all your invoices with payment statuses, overdue alerts, and a dashboard that shows your business at a glance.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">✓ Payment status</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">✓ Overdue tracking</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">✓ Email delivery logs</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">✓ Invoice history</span>
              </div>
            </div>
            {/* Card 3 (Hidden temporarily)
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Payment Links & Bank Details</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Include your bank details and payment links on invoices so clients can pay you directly. Connect PayPal, Stripe, or Paystack.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">✓ Payment links</span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">✓ Bank details</span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">✓ Payment tracking</span>
                <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">✓ Partial payments</span>
              </div>
            </div>
            */}
            {/* Card 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Professional Email Delivery</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Send invoices directly to clients via email with professional templates. Track sent emails and delivery history.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">✓ Email sending</span>
                <span className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">✓ Custom messages</span>
                <span className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">✓ Email history</span>
                <span className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">✓ Payment reminders</span>
              </div>
            </div>
            {/* Card 5 (Hidden temporarily)
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Estimates & Credit Notes</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Create estimates for potential work and convert them to invoices. Issue credit notes for refunds and adjustments.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">✓ Estimates</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">✓ Credit notes</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">✓ Convert to invoice</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">✓ Expiry dates</span>
              </div>
            </div>
            */}
            {/* Card 6 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Smart Client Management</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">Save and organize client details with tags. Quickly select saved clients when creating invoices — no need to re-enter info.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full">✓ Client directory</span>
                <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full">✓ Tag & organize</span>
                <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full">✓ Quick select</span>
                <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full">✓ Contact details</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 2: Advanced Features with Dashboard Mockup */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Advanced Features for Modern Businesses</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Go beyond basic invoicing with powerful tools designed for professional workflows
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto items-center">
            {/* Left: Feature List */}
            <div className="flex-1 space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Mobile Responsive Design</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Create and manage invoices on any device. Fully responsive design optimized for desktop, tablet, and mobile.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Professional PDF Generation</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Generate high-quality PDF invoices with custom branding, logos, and professional layouts.</p>
                </div>
              </div>
              {/* Hidden temporarily: Automated Reminders
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Automated Reminders</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Set up automatic payment reminders before, on, and after due dates via email or WhatsApp.</p>
                </div>
              </div>
              */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Secure Authentication</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Secure login with email verification, account lockout protection, and password reset flows.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Google OAuth Integration</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Quick and secure sign-up with your Google account. No need to remember another password.</p>
                </div>
              </div>
            </div>
            {/* Right: Dashboard Mockup */}
            <div className="flex-1 max-w-md">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-900">Dashboard</span>
                  <Link href="/free-invoice-generator" className="text-xs bg-teal-800 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-teal-700 transition-colors">+ New Invoice</Link>
                </div>
                <div className="px-5 pt-4 flex gap-2">
                  <span className="text-xs bg-teal-800 text-white px-3 py-1 rounded-full">1 Month</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">3 Months</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">6 Months</span>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-[10px] text-blue-400 font-medium">Total</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-600">18</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Paid ✓</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600">3</div>
                    <div className="text-[10px] text-amber-400 font-medium">Overdue ⚠</div>
                  </div>
                </div>
                <div className="px-5 pb-2">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">● Recent Activity</span>
                </div>
                <div className="px-5 pb-3 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <div className="text-xs font-semibold text-gray-900">Invoice #INV-001 — Payment Received</div>
                      <div className="text-[10px] text-gray-400">Acme Corp • 2 hours ago</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">₦250,000</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-xs font-semibold text-gray-900">Invoice #INV-002 — Viewed by Client</div>
                      <div className="text-[10px] text-gray-400">TechStart LLC • 4 hours ago</div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">₦180,000</span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">👑 Pro Plan</span>
                  <span className="text-xs text-emerald-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 3: How It Works (Step by Step) */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Creating Invoices Has Never Been This Easy</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Our intuitive interface guides you through every step. From client selection to payment processing, everything is designed for speed and simplicity.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto items-center">
            {/* Left: Steps */}
            <div className="flex-1 space-y-10">
              <div className="flex gap-5">
                <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Select Your Client</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Choose from your existing clients or quickly add a new one. Client information is automatically populated for faster invoice creation.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Add Invoice Details</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Set invoice number, dates, and reference information. Smart defaults speed up the process while giving you full control.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Add Items</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Easily add products or services with quantities and prices. Calculations are automatic, and you can save items for future use.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Customize & Send</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Add notes, bank details, payment instructions, and send directly to your client via email or download as PDF.</p>
                </div>
              </div>
            </div>
            {/* Right: Invoice Form Mockup */}
            <div className="flex-1 max-w-md">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">Create New Invoice</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Draft</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-400">Preview</span>
                    <span className="text-xs bg-teal-800 text-white px-3 py-1 rounded-lg font-medium">Send</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px]">👤</span> Bill To
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2.5 flex items-center justify-between">
                      <span className="text-sm text-gray-700">Acme Corporation</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
                      <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-[10px]">📄</span> Invoice Details
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">Invoice Number</span>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">INV-2026-001</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">Invoice Date</span>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">2026-02-16</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">Due Date</span>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">2026-03-16</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">Reference</span>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">Project Alpha</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 4: Pricing (geo-aware) */}
      {/* ═══════════════════════════════════════════════════════ */}
      <PricingSection />
    </div>
  );
}
