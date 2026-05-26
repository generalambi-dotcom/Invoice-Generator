import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Invoice Generator Help | How to Create & Send Invoices in Nigeria',
  description:
    'Step-by-step help for InvoiceGenerator.ng — create, send, download, and manage invoices. Learn about Paystack payments, WhatsApp delivery, VAT, and more.',
  alternates: { canonical: '/help' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need to create an account to use InvoiceGenerator.ng?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. You can create and download invoices as a PDF immediately without an account. Creating a free account unlocks cloud storage, email & WhatsApp sending, payment tracking, client management, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I accept Paystack payments on my invoice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Connect your Paystack account from your account settings. Once connected, a "Pay Now" button is added to the online invoice your client views — they can pay instantly with cards or bank transfer through Paystack.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I send invoices via WhatsApp?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. After creating your invoice, click the WhatsApp button to send a pre-formatted message with a link to the invoice directly to your client on WhatsApp — no PDF attachment needed.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does InvoiceGenerator.ng calculate Nigerian VAT automatically?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The invoice editor has a built-in 7.5% VAT toggle (the current FIRS rate). Enable it and the VAT amount and inclusive total are calculated and displayed automatically on the invoice.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where are my invoices stored?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Signed-in users: all invoices are stored securely in the cloud and accessible from any device. Guests (no account): invoices are saved only in your browser\'s local storage. Clearing browser data will delete them — always download a PDF backup.',
      },
    },
  ],
};

export default function HelpPage() {
  return (
    <div className="bg-gray-50 py-12">
      <Script id="help-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Invoice Generator for Nigeria — Help &amp; Getting Started
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            InvoiceGenerator.ng is a free online invoice generator built for Nigerian businesses, freelancers, and SMEs.
            Create professional invoices in seconds, calculate FIRS VAT automatically, send via email or WhatsApp, and
            collect payments with Paystack.
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-gray-800 font-semibold">
              No sign-up required to generate a PDF invoice. Free forever for core features.
            </p>
          </div>
        </div>

        {/* ── Why Use InvoiceGenerator.ng ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Nigerian Businesses Choose InvoiceGenerator.ng</h2>

          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                ⚡ Instant Invoice Creation — No Sign-Up Needed
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Open the editor, fill in your business details and line items, and download a professional PDF invoice in under two minutes — no account required.
                A live preview updates as you type so you always see exactly what your client will receive.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                🇳🇬 Built Specifically for the Nigerian Market
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Nigerian Naira (₦) as the default currency</li>
                <li>Automatic 7.5% FIRS VAT calculation with one toggle</li>
                <li>Bank details section for Nigerian account numbers, sort codes, and bank names</li>
                <li>
                  <Link href="/send-invoice-via-whatsapp-nigeria" className="text-teal-700 font-medium underline underline-offset-2">
                    WhatsApp invoice delivery
                  </Link>{' '}
                  — the preferred communication channel for Nigerian clients
                </li>
                <li>
                  <Link href="/blog/paystack-invoice-payment-nigeria" className="text-teal-700 font-medium underline underline-offset-2">
                    Paystack payment collection
                  </Link>{' '}
                  — Nigeria's leading payment processor, fully integrated
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                📱 Works on Any Device
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Fully responsive — create and manage invoices on desktop, tablet, or mobile.
                Perfect for business owners who invoice on the go from their phone.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                💯 100% Free for Core Features
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Generate and download unlimited PDF invoices at no cost. No watermarks, no mandatory sign-up, no credit card required.
                Premium features — recurring invoices, automated payment reminders, AI invoice generation, and advanced reports — are available
                on the{' '}
                <Link href="/upgrade" className="text-teal-700 font-medium underline underline-offset-2">
                  Premium plan
                </Link>.
              </p>
            </div>

          </div>
        </section>

        {/* ── How to Create an Invoice ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Create an Invoice Online in Nigeria</h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Fill in Your Invoice Details</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
                <li>Your business name, address, and logo</li>
                <li>Your client's name and contact details</li>
                <li>Invoice number and issue / due dates</li>
                <li>Line items — description, quantity, and unit price</li>
                <li>VAT (7.5%) — toggle on if applicable to your service</li>
                <li>Payment terms and your Nigerian bank details</li>
              </ul>
              <p className="text-gray-600 text-sm">
                A live preview on the right updates in real time. The Download button activates once the "From" and "To" fields are filled in.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Download, Send, or Share</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Download as PDF</strong> — save to your device and share manually</li>
                <li>
                  <strong>Send by Email</strong> — delivered directly to your client's inbox
                  (requires a free account)
                </li>
                <li>
                  <strong>
                    <Link href="/send-invoice-via-whatsapp-nigeria" className="text-green-700 underline underline-offset-2">
                      Send via WhatsApp
                    </Link>
                  </strong>{' '}
                  — one click opens WhatsApp with the invoice link pre-filled
                  (requires a free account)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Payments ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Accept Payments Online in Nigeria</h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💳 Paystack — Nigerian Cards &amp; Bank Transfer
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Connect your Paystack account and a <strong>Pay Now</strong> button is added to every invoice you send online.
                Your clients can pay instantly using:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
                <li>Nigerian debit or credit cards (Verve, Mastercard, Visa)</li>
                <li>Bank transfer (USSD &amp; direct transfer)</li>
                <li>Mobile money</li>
              </ul>
              <p className="text-gray-600 text-sm">
                Payments are processed by Paystack and settled directly to your Nigerian bank account.
                Read more:{' '}
                <Link href="/blog/paystack-invoice-payment-nigeria" className="text-teal-700 underline underline-offset-2">
                  How to collect invoice payments with Paystack in Nigeria
                </Link>.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🏦 Manual Bank Details
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Prefer direct transfers? Add your bank name, account number, and account name to the invoice.
                This section appears on the printed PDF and online invoice so clients always have your payment details.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🌍 International Payments (PayPal / Stripe)
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Billing international clients? Connect PayPal or Stripe for USD / GBP / EUR payments.
              </p>
            </div>
          </div>
        </section>

        {/* ── WhatsApp ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            <Link href="/send-invoice-via-whatsapp-nigeria" className="hover:text-teal-700 transition-colors">
              Send Invoices via WhatsApp
            </Link>
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-700 leading-relaxed mb-3">
              WhatsApp is how Nigerian business gets done. InvoiceGenerator.ng lets you send a live invoice link directly
              through WhatsApp so your client can view, approve, and pay — all without leaving the app.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Client receives a branded invoice link on WhatsApp</li>
              <li>They can open it in any browser — no app install needed</li>
              <li>Paystack payment button is embedded in the link</li>
              <li>You get notified when the invoice is viewed and when it's paid</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Requires a free account.{' '}
              <Link href="/signup" className="text-teal-700 font-medium underline underline-offset-2">
                Create your account
              </Link>.
            </p>
          </div>
        </section>

        {/* ── Invoice Storage ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Where Are Your Invoices Stored?</h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                ☁️ Signed-In Users — Cloud Storage
              </h3>
              <p className="text-gray-700 leading-relaxed">
                When you have an account, every invoice you create is saved securely in the cloud.
                Access your full invoice history from any device, any browser, at any time.
                Sent invoices are also accessible to clients via their unique link.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💻 Guests (No Account) — Browser Storage Only
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Without an account, invoices are stored only in your browser's local storage.
                We do not keep copies on our servers.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800 flex items-start gap-2 text-sm">
                  <span className="text-yellow-600 font-bold flex-shrink-0">⚠️</span>
                  Clearing your browser history, cache, or data <strong>permanently deletes</strong> guest invoices.
                  Always download a PDF backup, or{' '}
                  <Link href="/signup" className="text-teal-700 underline underline-offset-2 font-medium">
                    create a free account
                  </Link>{' '}
                  to protect your invoices in the cloud.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Save, Edit & Export ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Save, Edit &amp; Export Your Invoices</h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💾 Invoice History
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All invoices are listed on your dashboard with status (Draft / Sent / Paid / Overdue)</li>
                <li>Open any invoice to edit it — changes save automatically</li>
                <li>Filter by date, client, or payment status</li>
                <li>Duplicate an invoice to quickly re-bill the same client</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📊 Export &amp; Reports
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Export your invoices to Excel or CSV for bookkeeping and accounting.
                Premium users also get access to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Revenue reports by client, period, or currency</li>
                <li>Outstanding balance ageing report</li>
                <li>Tax (VAT) summary reports</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Customize Invoice Template ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Customize Your Invoice Template</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-700 leading-relaxed mb-3">
              Set up your template once and it pre-fills every new invoice automatically:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Business name, address, and logo</li>
              <li>Currency (₦ Naira — or any other currency)</li>
              <li>Default VAT rate</li>
              <li>Payment terms (e.g. "Net 30")</li>
              <li>Bank details for payment</li>
              <li>Footer notes and custom field labels</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Click <strong>Save Template</strong> and your settings reload automatically next session.
            </p>
          </div>
        </section>

        {/* ── More Features ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">More Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Invoice Generator</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Type a plain-English description of the work and let AI fill in the invoice fields instantly.{' '}
                <Link href="/ai-invoice-generator-nigeria" className="text-teal-700 underline underline-offset-2">
                  Try AI invoicing →
                </Link>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Recurring Invoices</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Set up monthly retainer invoices that send automatically on a schedule. Never forget to bill a regular client.
                Available on Premium.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Estimates</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create professional estimates / quotes and convert them to invoices with one click when the client approves.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">📝 Credit Notes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Issue credit notes against paid invoices for refunds or billing adjustments. Applied directly to the invoice balance.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">👥 Client Management</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Save client details so you can select them in one click on future invoices. Tag clients by category, send statements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">🏢 Business Directory</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                List your business in the{' '}
                <Link href="/businesses" className="text-teal-700 underline underline-offset-2">
                  Nigerian Business Directory
                </Link>{' '}
                to get discovered by new clients searching for your services.
              </p>
            </div>

          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">

            <details className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Do I need to create an account?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3 text-sm">
                No. You can create and download a PDF invoice immediately without an account.
                Creating a free account unlocks cloud storage, email &amp; WhatsApp delivery, payment tracking,
                client management, and more.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                How do I accept Paystack payments on my invoice?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3 text-sm">
                Go to Settings → Payments and connect your Paystack account. Once connected, a <strong>Pay Now</strong> button
                is added to online invoices — your client pays with their Nigerian card or bank transfer without leaving the invoice page.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Does InvoiceGenerator.ng calculate VAT automatically?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3 text-sm">
                Yes. The invoice editor includes a 7.5% VAT toggle (FIRS standard rate). Turn it on and the VAT
                amount and gross total are calculated and displayed automatically. You can also set a custom tax rate.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Can I send an invoice on WhatsApp?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3 text-sm">
                Yes. Click the WhatsApp button after creating your invoice. It opens WhatsApp (or WhatsApp Web)
                with a pre-written message and a link your client can open to view the invoice and pay via Paystack.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                Will clearing my browser delete my invoices?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-gray-700 leading-relaxed mt-3 text-sm">
                Only if you're a guest (no account). Guest invoices live in browser local storage —
                clearing it deletes them permanently. If you have an account, your invoices are safe in the cloud
                and are not affected by browser clearing.
              </p>
            </details>

          </div>
        </section>

        {/* ── System Requirements ── */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">System Requirements</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-700 mb-3">Works on all modern browsers:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Google Chrome (recommended)</li>
              <li>Mozilla Firefox</li>
              <li>Apple Safari</li>
              <li>Microsoft Edge</li>
            </ul>
            <p className="text-gray-700 font-semibold mb-2">Required browser settings:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>JavaScript enabled</li>
              <li>Local storage enabled (for guest invoice saving)</li>
              <li>TLS 1.2 or higher</li>
            </ul>
          </div>
        </section>

        {/* ── Related Links ── */}
        <section className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Learn More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/invoice-generator-nigeria" className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors">
              Invoice Generator Nigeria →
            </Link>
            <Link href="/send-invoice-via-whatsapp-nigeria" className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors">
              Send Invoice via WhatsApp →
            </Link>
            <Link href="/ai-invoice-generator-nigeria" className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors">
              AI Invoice Generator →
            </Link>
            <Link href="/free-invoice-generator-nigeria" className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors">
              Free Invoice Generator Nigeria →
            </Link>
            <Link href="/blog/paystack-invoice-payment-nigeria" className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors">
              How to Collect Payments with Paystack →
            </Link>
            <Link href="/guide" className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors">
              Nigerian Invoicing Guide →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
