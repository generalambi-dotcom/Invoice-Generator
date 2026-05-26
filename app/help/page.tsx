import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Invoice Generator Help | How to Create & Send Invoices in Nigeria',
  description:
    'Complete help guide for InvoiceGenerator.ng — create invoices, accept Paystack payments, send via WhatsApp, manage clients, set up recurring invoices and more.',
  alternates: { canonical: '/help' },
};

/* ─── Structured data ─────────────────────────────────────────────────────── */

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.invoicegenerator.ng' },
    { '@type': 'ListItem', position: 2, name: 'Help', item: 'https://www.invoicegenerator.ng/help' },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Professional Invoice in Nigeria',
  description: 'Step-by-step guide to creating, downloading, and sending an invoice using InvoiceGenerator.ng',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Open the invoice editor',
      text: 'Go to InvoiceGenerator.ng and click "Create Invoice". No sign-up is required.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Fill in your business and client details',
      text: 'Enter your business name, address, logo, and your client\'s name and contact info. The live preview updates as you type.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Add line items and calculate VAT',
      text: 'Add each product or service as a line item with quantity and unit price. Toggle 7.5% FIRS VAT on if applicable — totals calculate automatically.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Add payment details',
      text: 'Enter your Nigerian bank account details, or connect Paystack to add an online payment button.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Download, email, or send via WhatsApp',
      text: 'Click Download Invoice to save as PDF, or use Send Invoice to deliver directly to your client by email or WhatsApp.',
    },
  ],
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
        text: 'No. You can create and download a PDF invoice immediately without an account. Creating a free account unlocks cloud storage, email & WhatsApp delivery, payment tracking, client management, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I accept Paystack payments on my invoice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Connect your Paystack account under Settings → Payment Methods. Once connected, a Pay Now button is added to every invoice you send online — your client pays with their Nigerian card or via bank transfer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I send invoices via WhatsApp in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. After creating your invoice, click the WhatsApp button. It opens WhatsApp with a pre-written message and an invoice link your client can view and pay from any browser.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does InvoiceGenerator.ng calculate Nigerian VAT automatically?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The invoice editor includes a built-in 7.5% VAT toggle (current FIRS rate). Enable it and the VAT amount and gross total are calculated and displayed automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I add Withholding Tax (WHT) to an invoice in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the custom tax or discount fields to add a WHT line. For example, add a line item called "Withholding Tax (5%)" as a negative amount, or add it as a separate tax row in the invoice editor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I create invoices in USD for international clients?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. InvoiceGenerator.ng supports 50+ currencies including USD, GBP, EUR, and CAD. Change the currency in the invoice editor or set a default currency in your template settings.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between an invoice and a receipt in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An invoice is a request for payment issued before or on the due date. A receipt is proof of payment issued after money has been received. InvoiceGenerator.ng can generate both — use the Free Receipt Generator at invoicegenerator.ng/free-receipt-generator-nigeria for receipts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I set up automated payment reminders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to Settings → Reminders. You can configure automatic reminder emails to be sent before the due date, on the due date, and after the due date for unpaid invoices. This is a Premium feature.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use InvoiceGenerator.ng offline?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The app requires an internet connection to load and to send invoices. However, once the page is open, you can fill in the invoice form and download the PDF even with a poor connection, as PDF generation is handled locally in your browser.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I add my business logo to an invoice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click the logo placeholder at the top of the invoice editor and upload a PNG or JPG image. Your logo is resized automatically to fit the invoice header. Save it to your template so it appears on every future invoice.',
      },
    },
  ],
};

/* ─── TOC items ───────────────────────────────────────────────────────────── */
const TOC_ITEMS = [
  { label: 'Why InvoiceGenerator.ng', href: '#why' },
  { label: 'How to Create an Invoice', href: '#how-to' },
  { label: 'Payments & Paystack', href: '#payments' },
  { label: 'WhatsApp Delivery', href: '#whatsapp' },
  { label: 'Free vs Premium', href: '#pricing' },
  { label: 'Invoice Storage', href: '#storage' },
  { label: 'Save, Edit & Export', href: '#export' },
  { label: 'Invoice Template', href: '#template' },
  { label: 'All Features', href: '#features' },
  { label: 'Account Management', href: '#account' },
  { label: 'Security & Privacy', href: '#security' },
  { label: 'Troubleshooting', href: '#troubleshooting' },
  { label: 'FAQ', href: '#faq' },
  { label: 'System Requirements', href: '#requirements' },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function HelpPage() {
  return (
    <div className="bg-gray-50 py-12">
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="howto-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-10">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-teal-700">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700 font-medium">Help</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            InvoiceGenerator.ng — Help &amp; Getting Started
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Everything you need to know about creating invoices, collecting payments, sending via WhatsApp,
            and managing your Nigerian business with InvoiceGenerator.ng.
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-gray-800 font-semibold">
              ✅ No sign-up required to generate a PDF invoice. Core features are free forever.
            </p>
          </div>
        </div>

        {/* ── Table of Contents ── */}
        <nav aria-label="Help page contents" className="bg-white rounded-xl border border-gray-200 p-6 mb-12 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Jump to a section</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TOC_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-teal-700 hover:text-teal-900 hover:underline underline-offset-2 py-1 px-2 rounded hover:bg-teal-50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── Why Use InvoiceGenerator.ng ── */}
        <section id="why" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Nigerian Businesses Choose InvoiceGenerator.ng</h2>
          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">⚡ Instant Invoice Creation — No Sign-Up Needed</h3>
              <p className="text-gray-700 leading-relaxed">
                Open the editor, fill in your details and line items, and download a professional PDF in under two minutes.
                A live preview updates as you type so you always see exactly what your client will receive.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">🇳🇬 Built Specifically for the Nigerian Market</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Nigerian Naira (₦) as the default currency</li>
                <li>Automatic 7.5% FIRS VAT calculation with one toggle</li>
                <li>Bank details section for Nigerian account numbers, bank names, and sort codes</li>
                <li><Link href="/send-invoice-via-whatsapp-nigeria" className="text-teal-700 font-medium underline underline-offset-2">WhatsApp invoice delivery</Link> — the preferred channel for Nigerian business</li>
                <li><Link href="/blog/paystack-invoice-payment-nigeria" className="text-teal-700 font-medium underline underline-offset-2">Paystack payment collection</Link> — Nigeria's leading payment processor, fully integrated</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">📱 Works on Any Device</h3>
              <p className="text-gray-700 leading-relaxed">
                Fully responsive — create and manage invoices on desktop, tablet, or mobile. No app download required.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">💯 Free Core Features, No Limits</h3>
              <p className="text-gray-700 leading-relaxed">
                Generate and download unlimited PDF invoices at no cost. No watermarks, no mandatory sign-up.
                Advanced features like recurring invoices and payment reminders are available on{' '}
                <Link href="/upgrade" className="text-teal-700 font-medium underline underline-offset-2">Premium</Link>.
              </p>
            </div>

          </div>
        </section>

        {/* ── How to Create an Invoice ── */}
        <section id="how-to" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Create an Invoice Online in Nigeria</h2>
          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-700 text-white text-sm font-bold mr-2">1</span>
                Open the Invoice Editor
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Go to <Link href="/free-invoice-generator" className="text-teal-700 underline underline-offset-2">InvoiceGenerator.ng</Link> and click{' '}
                <strong>Create Invoice</strong>. No account required. The editor opens immediately with a blank invoice and a live preview on the right.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-700 text-white text-sm font-bold mr-2">2</span>
                Fill in Business &amp; Client Details
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Your business name, address, and logo (upload PNG or JPG)</li>
                <li>Your client's name, address, and email</li>
                <li>Invoice number (auto-generated or custom)</li>
                <li>Issue date and payment due date</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-700 text-white text-sm font-bold mr-2">3</span>
                Add Line Items &amp; Calculate VAT
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Add each product or service — description, quantity, unit price</li>
                <li>Toggle <strong>7.5% VAT</strong> on if your service is VATable under FIRS rules</li>
                <li>Add discounts, custom tax rates (e.g. WHT), or additional charges as extra rows</li>
                <li>Totals update automatically in the live preview</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-700 text-white text-sm font-bold mr-2">4</span>
                Add Payment Details
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Enter your bank name, account number, and account name for direct transfer</li>
                <li>Or connect Paystack to add an online <strong>Pay Now</strong> button (requires account)</li>
                <li>Add notes or custom payment terms (e.g. "50% deposit required")</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-700 text-white text-sm font-bold mr-2">5</span>
                Download, Email, or Send via WhatsApp
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Download as PDF</strong> — save to your device and share manually</li>
                <li><strong>Send by Email</strong> — delivered to your client's inbox (requires account)</li>
                <li><strong><Link href="/send-invoice-via-whatsapp-nigeria" className="text-green-700 underline underline-offset-2">Send via WhatsApp</Link></strong> — one tap, invoice link pre-filled in WhatsApp (requires account)</li>
              </ul>
              <p className="text-sm text-gray-500 mt-3">
                The Download button activates once both the "From" and "To" fields are filled in.
              </p>
            </div>

          </div>
        </section>

        {/* ── Payments ── */}
        <section id="payments" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Accept Payments Online in Nigeria</h2>
          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">💳 Paystack — Cards &amp; Bank Transfer</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Connect your Paystack account under <strong>Settings → Payment Methods</strong>. A <strong>Pay Now</strong> button
                is added to every invoice you send online. Clients can pay instantly with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
                <li>Nigerian debit &amp; credit cards (Verve, Mastercard, Visa)</li>
                <li>Bank transfer (direct &amp; USSD)</li>
                <li>Mobile money</li>
              </ul>
              <p className="text-gray-600 text-sm">
                Payments are processed by Paystack and settled directly to your Nigerian bank account.{' '}
                <Link href="/blog/paystack-invoice-payment-nigeria" className="text-teal-700 underline underline-offset-2">
                  How to collect payments with Paystack →
                </Link>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🏦 Manual Bank Details</h3>
              <p className="text-gray-700 leading-relaxed">
                Prefer direct transfers? Enter your bank name, account number, and account name in the invoice editor.
                These appear on the PDF and the online invoice link so clients always have your payment info.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🌍 International Payments (PayPal / Stripe)</h3>
              <p className="text-gray-700 leading-relaxed">
                Billing international clients in USD, GBP, or EUR? Connect PayPal or Stripe under{' '}
                <strong>Settings → Payment Methods</strong>. All three processors can be active simultaneously
                and InvoiceGenerator.ng automatically shows the right button based on the invoice currency.
              </p>
            </div>

          </div>
        </section>

        {/* ── WhatsApp ── */}
        <section id="whatsapp" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            <Link href="/send-invoice-via-whatsapp-nigeria" className="hover:text-teal-700 transition-colors">
              Send Invoices via WhatsApp
            </Link>
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              WhatsApp is how Nigerian business gets done. Send a live invoice link directly through WhatsApp —
              your client views, approves, and pays without leaving the conversation.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Client receives a branded invoice link in WhatsApp</li>
              <li>Opens in any browser — no app install needed on their end</li>
              <li>Paystack <strong>Pay Now</strong> button embedded in the link</li>
              <li>You receive a notification when the invoice is viewed and when it's paid</li>
              <li>Full delivery history visible on your dashboard</li>
            </ul>
            <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-700">
              💡 <strong>Tip:</strong> Send a friendly follow-up on WhatsApp 2 days before the due date.
              Invoices with WhatsApp follow-up get paid on average 40% faster in Nigeria.
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Requires a free account.{' '}
              <Link href="/signup" className="text-teal-700 font-medium underline underline-offset-2">Create your account →</Link>
            </p>
          </div>
        </section>

        {/* ── Free vs Premium ── */}
        <section id="pricing" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Free vs Premium</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Try Premium free for 30 days — use coupon code <strong>free</strong> at{' '}
            <Link href="/upgrade" className="text-teal-700 underline underline-offset-2">checkout</Link>.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left font-semibold text-gray-700 w-1/2">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Free</th>
                  <th className="px-4 py-3 text-center font-semibold text-amber-700 bg-amber-50">Premium ⭐</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Unlimited PDF invoice downloads',             '✅', '✅'],
                  ['FIRS 7.5% VAT auto-calculation',             '✅', '✅'],
                  ['Nigerian bank details section',              '✅', '✅'],
                  ['50+ currency support (USD, GBP, EUR…)',      '✅', '✅'],
                  ['Logo upload & custom branding',              '✅', '✅'],
                  ['Invoice templates library',                  '✅', '✅'],
                  ['Free Receipt Generator',                     '✅', '✅'],
                  ['Cloud invoice storage (all devices)',        '✅ with account', '✅'],
                  ['Email invoice delivery',                     '✅ with account', '✅'],
                  ['Client management & directory',              '✅ with account', '✅'],
                  ['Estimates & quotes',                         '✅ with account', '✅'],
                  ['Credit notes',                               '✅ with account', '✅'],
                  ['Expense tracking',                           '✅ with account', '✅'],
                  ['WhatsApp invoice sending & tracking',        '—',  '✅'],
                  ['Paystack / PayPal / Stripe payments',        '—',  '✅'],
                  ['Recurring invoices (automated)',             '—',  '✅'],
                  ['Automated payment reminders',                '—',  '✅'],
                  ['Smart reports & revenue dashboard',          '—',  '✅'],
                  ['AI invoice generation (unlimited)',          '—',  '✅'],
                  ['Time tracker → invoice',                     '—',  '✅'],
                  ['Ad-free experience',                         '—',  '✅'],
                ].map(([feature, free, premium]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-700">{feature}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{free}</td>
                    <td className="px-4 py-3 text-center text-teal-700 font-medium bg-amber-50/40">{premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 bg-amber-50 border-t border-amber-100 text-center">
              <Link href="/upgrade" className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm">
                Start 30-Day Free Trial →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Invoice Storage ── */}
        <section id="storage" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Where Are Your Invoices Stored?</h2>
          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">☁️ Signed-In Users — Cloud Storage</h3>
              <p className="text-gray-700 leading-relaxed">
                Every invoice you create is saved securely in the cloud. Access your full history from any device,
                any browser, at any time. Sent invoices are also accessible to your clients via their unique link.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">💻 Guests (No Account) — Browser Storage Only</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Without an account, invoices are stored only in your browser's local storage.
                We do not keep copies on our servers.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800 flex items-start gap-2 text-sm">
                  <span className="text-yellow-600 font-bold flex-shrink-0">⚠️</span>
                  Clearing your browser history or cache <strong>permanently deletes</strong> guest invoices.
                  Always download a PDF backup, or{' '}
                  <Link href="/signup" className="text-teal-700 underline underline-offset-2 font-medium">create a free account</Link>{' '}
                  to protect your invoices in the cloud.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📩 Sent Invoice Links</h3>
              <p className="text-gray-700 leading-relaxed">
                When you send an invoice via email or WhatsApp, a unique URL is generated for that invoice
                (e.g. <code className="bg-gray-100 px-1 rounded text-sm">invoicegenerator.ng/i/abc123</code>).
                Your client can open this link to view, download, and pay the invoice at any time.
                The link remains active until you delete the invoice from your dashboard.
              </p>
            </div>

          </div>
        </section>

        {/* ── Save, Edit & Export ── */}
        <section id="export" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Save, Edit &amp; Export Your Invoices</h2>
          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">💾 Invoice Dashboard</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All invoices listed with status: Draft / Sent / Paid / Overdue</li>
                <li>Open any invoice to edit — changes save automatically to the cloud</li>
                <li>Filter by date range, client, or payment status</li>
                <li>Duplicate any invoice to quickly re-bill the same client</li>
                <li>Mark invoices as paid when payment is received manually</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Export &amp; Reports</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Export invoice list to Excel or CSV for bookkeeping</li>
                <li>Revenue reports by client, period, or currency (Premium)</li>
                <li>Outstanding balance ageing report (Premium)</li>
                <li>VAT / tax summary for FIRS filing (Premium)</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── Customize Template ── */}
        <section id="template" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Customize Your Invoice Template</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              Set up your template once and it pre-fills every new invoice automatically:
            </p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-700 mb-4">
              {[
                'Business name, address, and logo',
                'Currency (₦ Naira default)',
                'Default VAT rate',
                'Payment terms (e.g. "Net 30")',
                'Nigerian bank account details',
                'Footer notes & disclaimers',
                'Custom column headers',
                'Invoice number prefix (e.g. INV-2026-)',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-teal-600 font-bold">✓</span> {item}
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed">
              Click <strong>Save Template</strong> and your settings reload automatically every session.
              You can also save multiple{' '}
              <Link href="/invoice-templates" className="text-teal-700 underline underline-offset-2">invoice templates</Link>{' '}
              for different clients or project types.
            </p>
          </div>
        </section>

        {/* ── All Features ── */}
        <section id="features" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">All Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {[
              {
                icon: '🤖',
                title: 'AI Invoice Generator',
                desc: 'Type a plain-English description and AI fills the invoice in seconds.',
                link: '/ai-invoice-generator-nigeria',
                linkText: 'Try AI invoicing →',
              },
              {
                icon: '🔄',
                title: 'Recurring Invoices',
                desc: 'Automatically send monthly retainer invoices on a schedule. Never forget to bill a regular client. (Premium)',
                link: '/recurring',
                linkText: 'Set up recurring →',
              },
              {
                icon: '📋',
                title: 'Estimates & Quotes',
                desc: 'Create professional estimates and convert them to invoices in one click when approved.',
                link: null,
                linkText: null,
              },
              {
                icon: '📝',
                title: 'Credit Notes',
                desc: 'Issue credit notes against paid invoices for refunds or billing corrections, applied directly to the balance.',
                link: '/credit-notes/create',
                linkText: 'Create credit note →',
              },
              {
                icon: '🧾',
                title: 'Free Receipt Generator',
                desc: 'Generate official payment receipts separate from invoices — ideal for cash sales and POS transactions.',
                link: '/free-receipt-generator-nigeria',
                linkText: 'Generate receipt →',
              },
              {
                icon: '💸',
                title: 'Expense Tracking',
                desc: 'Log and categorise business expenses. View net profit when combined with invoice income.',
                link: '/expenses',
                linkText: 'Track expenses →',
              },
              {
                icon: '⏱️',
                title: 'Time Tracker',
                desc: 'Track billable hours per project and convert time logs directly into invoice line items. (Premium)',
                link: '/dashboard/time-tracker',
                linkText: 'Open time tracker →',
              },
              {
                icon: '📦',
                title: 'Product & Service Catalogue',
                desc: 'Save your standard products and services so you can add them to invoices with one click — no re-typing.',
                link: '/settings/products',
                linkText: 'Manage products →',
              },
              {
                icon: '🔔',
                title: 'Automated Payment Reminders',
                desc: 'Configure email reminders before the due date, on the due date, and for overdue invoices. (Premium)',
                link: '/settings/reminders',
                linkText: 'Set up reminders →',
              },
              {
                icon: '👥',
                title: 'Client Management',
                desc: 'Save client profiles with tags, billing history, and one-click invoice pre-fill. Send account statements.',
                link: '/clients',
                linkText: 'Manage clients →',
              },
              {
                icon: '🌐',
                title: 'Client Portal',
                desc: 'Give clients a private link to view all their invoices, download PDFs, and check payment history — no login needed.',
                link: '/portal',
                linkText: null,
              },
              {
                icon: '🔗',
                title: 'Public Invoice Link',
                desc: 'Share a permanent payment link with clients. They can pay any open invoice without you sending each one manually.',
                link: '/settings/public-link',
                linkText: 'Set up public link →',
              },
              {
                icon: '📐',
                title: 'Invoice Templates Library',
                desc: 'Choose from multiple professional invoice layouts — classic, modern, minimal — and save your preferred design.',
                link: '/invoice-templates',
                linkText: 'Browse templates →',
              },
              {
                icon: '🏢',
                title: 'Nigerian Business Directory',
                desc: 'List your business and get discovered by new clients searching for your services in Nigeria.',
                link: '/businesses',
                linkText: 'Explore directory →',
              },
            ].map(({ icon, title, desc, link, linkText }) => (
              <div key={title} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{icon} {title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                {link && linkText && (
                  <Link href={link} className="text-teal-700 text-sm underline underline-offset-2 mt-2 inline-block">
                    {linkText}
                  </Link>
                )}
              </div>
            ))}

          </div>
        </section>

        {/* ── Account Management ── */}
        <section id="account" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Account Management</h2>
          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Creating &amp; Managing Your Account</h3>
              <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                <div>
                  <strong>Sign up:</strong>{' '}
                  <Link href="/signup" className="text-teal-700 underline underline-offset-2">Create a free account</Link>{' '}
                  with email &amp; password, or continue with <strong>Google</strong> for one-click sign-in.
                </div>
                <div>
                  <strong>Forgot password:</strong> Click <strong>Forgot password</strong> on the sign-in page.
                  A reset link is emailed to you — valid for 1 hour.{' '}
                  <Link href="/forgot-password" className="text-teal-700 underline underline-offset-2">Reset password →</Link>
                </div>
                <div>
                  <strong>Change email or business name:</strong> Go to{' '}
                  <Link href="/profile" className="text-teal-700 underline underline-offset-2">Settings → Profile</Link>.
                  Email changes require re-verification.
                </div>
                <div>
                  <strong>Payment methods:</strong> Add or change your Paystack, PayPal, or Stripe connection at{' '}
                  <Link href="/settings/payment-methods" className="text-teal-700 underline underline-offset-2">
                    Settings → Payment Methods
                  </Link>.
                </div>
                <div>
                  <strong>Cancel or change subscription:</strong> Go to{' '}
                  <Link href="/upgrade" className="text-teal-700 underline underline-offset-2">Settings → Billing</Link>{' '}
                  to cancel or change your plan. Your data is retained after cancellation.
                </div>
                <div>
                  <strong>Delete account:</strong> Contact us at{' '}
                  <Link href="/contact" className="text-teal-700 underline underline-offset-2">our support page</Link>{' '}
                  to request account deletion. All invoices and client data will be permanently removed.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📧 Email Verification</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                After signing up, a verification email is sent to your address. Click the link to verify your account
                and unlock email invoice sending. If you don't receive it within 5 minutes, check your spam folder
                or use the <strong>Resend verification</strong> option on your dashboard.
              </p>
            </div>

          </div>
        </section>

        {/* ── Security & Privacy ── */}
        <section id="security" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Security &amp; Privacy</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: '🔐',
                  title: 'Password Security',
                  desc: 'Passwords are hashed with bcrypt and never stored in plain text. Brute-force login attempts trigger automatic account lockout.',
                },
                {
                  icon: '🔒',
                  title: 'Encrypted Connections',
                  desc: 'All data is transmitted over HTTPS using TLS 1.2+. Certificate is automatically renewed.',
                },
                {
                  icon: '🏦',
                  title: 'Payment Data',
                  desc: 'We never store your payment card details. All card processing is handled by Paystack, Stripe, or PayPal on their own PCI-compliant infrastructure.',
                },
                {
                  icon: '📄',
                  title: 'Invoice Data',
                  desc: 'Your invoice data is stored in an encrypted database. We do not share or sell your business data or your clients\' information.',
                },
                {
                  icon: '🔑',
                  title: 'API Keys',
                  desc: 'B2B API keys are hashed with SHA-256 before storage. Raw keys are shown only once at generation and cannot be recovered.',
                },
                {
                  icon: '🛡️',
                  title: 'GDPR & Privacy',
                  desc: 'You can request a full export or deletion of your data at any time. See our Privacy Policy for full details.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title}>
                  <h3 className="font-semibold text-gray-900 mb-1">{icon} {title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
              <Link href="/privacy" className="text-teal-700 underline underline-offset-2">Privacy Policy</Link>
              <Link href="/terms" className="text-teal-700 underline underline-offset-2">Terms of Service</Link>
            </div>
          </div>
        </section>

        {/* ── Troubleshooting ── */}
        <section id="troubleshooting" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
          <div className="space-y-3">

            {[
              {
                problem: '📄 My PDF invoice won\'t download',
                fix: [
                  'Make sure both the "From" and "To" fields are filled in — the Download button stays disabled until then.',
                  'Disable browser ad blockers or pop-up blockers (they can block PDF downloads).',
                  'Try a different browser — Google Chrome has the best PDF support.',
                  'Check your Downloads folder — the file may have saved without a visible prompt.',
                  'If using Safari on iOS, tap and hold the Download button and choose "Open in new tab."',
                ],
              },
              {
                problem: '💬 The WhatsApp button isn\'t opening WhatsApp',
                fix: [
                  'On desktop, ensure WhatsApp Web (web.whatsapp.com) is open and logged in.',
                  'On mobile, make sure the WhatsApp app is installed.',
                  'Allow your browser to open external apps when prompted.',
                  'If it still fails, copy the invoice link manually and paste it into a WhatsApp message.',
                ],
              },
              {
                problem: '💳 Paystack payment button not showing on my invoice',
                fix: [
                  'Confirm you\'ve connected your Paystack account at Settings → Payment Methods.',
                  'Make sure your Paystack account is fully verified and live keys are enabled (not test mode).',
                  'The Pay Now button only appears on invoices sent via email or WhatsApp link — not on the PDF.',
                  'Check that the invoice status is not already marked as Paid.',
                ],
              },
              {
                problem: '☁️ I can\'t find an invoice I saved',
                fix: [
                  'If you were a guest (no account), your invoice was stored in browser local storage. If you\'ve cleared your browser data, it may be gone — always download a PDF backup.',
                  'If you\'re signed in, check your dashboard and use the search or date filter.',
                  'Check that you\'re signed into the same account on the same browser you used to create it.',
                  'If you used a different device, sign in with the same account to see cloud-synced invoices.',
                ],
              },
              {
                problem: '➕ My VAT calculation looks wrong',
                fix: [
                  'Check whether the VAT toggle is set to "Inclusive" (included in the price) or "Exclusive" (added on top).',
                  'FIRS standard rate is 7.5%. If you\'ve set a custom rate, verify it under the tax settings in the editor.',
                  'Some services are VAT-exempt in Nigeria — toggle VAT off for those line items.',
                ],
              },
              {
                problem: '📧 My client didn\'t receive the invoice email',
                fix: [
                  'Ask them to check their Spam or Promotions folder.',
                  'Verify the email address was typed correctly on the invoice.',
                  'Check your email delivery log on the invoice dashboard — it shows sent/failed status.',
                  'Try resending the invoice from your dashboard.',
                  'Contact us if delivery consistently fails to a specific domain.',
                ],
              },
              {
                problem: '🔄 Recurring invoice didn\'t send automatically',
                fix: [
                  'Confirm the recurring invoice is set to "Active" — paused schedules won\'t fire.',
                  'Check that the scheduled date has passed (invoices send at midnight on the scheduled day).',
                  'Verify your account email is verified — unverified accounts cannot send automated emails.',
                  'Check the recurring invoice log on your dashboard for error messages.',
                ],
              },
            ].map(({ problem, fix }) => (
              <details key={problem} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {problem}
                  <span className="text-gray-400 text-lg leading-none group-open:rotate-180 transition-transform flex-shrink-0 ml-2">▾</span>
                </summary>
                <ul className="mt-3 list-disc list-inside space-y-2 text-sm text-gray-700">
                  {fix.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </details>
            ))}

          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">

            {[
              {
                q: 'Do I need to create an account?',
                a: 'No. You can create and download a PDF invoice immediately without an account. Creating a free account unlocks cloud storage, email & WhatsApp delivery, payment tracking, client management, and more.',
              },
              {
                q: 'How do I accept Paystack payments on my invoice?',
                a: 'Go to Settings → Payment Methods and connect your Paystack account. Once connected, a Pay Now button is added to online invoices — your client pays with a Nigerian card or bank transfer without leaving the invoice page.',
              },
              {
                q: 'Does InvoiceGenerator.ng calculate VAT automatically?',
                a: 'Yes. Toggle 7.5% VAT on in the invoice editor (current FIRS rate) and the VAT amount and gross total calculate automatically. You can also set a custom tax rate for non-standard situations.',
              },
              {
                q: 'How do I add Withholding Tax (WHT) to an invoice?',
                a: 'Add an extra tax row in the invoice editor and label it "WHT (5%)" or your applicable rate. Enter it as a negative value if you\'re showing the net amount your client owes after WHT deduction.',
              },
              {
                q: 'Can I create invoices in USD for international clients?',
                a: 'Yes. InvoiceGenerator.ng supports 50+ currencies. Change the currency in the invoice editor — or set a default in your template settings. Connect Stripe or PayPal for international card payments.',
              },
              {
                q: 'What\'s the difference between an invoice and a receipt?',
                a: 'An invoice is a request for payment (issued before payment). A receipt is proof that payment was received (issued after). Use the invoice generator for billing and the Free Receipt Generator (/free-receipt-generator-nigeria) for payment confirmation.',
              },
              {
                q: 'How do I add my business logo to an invoice?',
                a: 'Click the logo placeholder at the top of the invoice editor and upload a PNG or JPG image. Your logo is resized automatically. Save it to your template so it appears on every future invoice without re-uploading.',
              },
              {
                q: 'How do I set up automated payment reminders?',
                a: 'Go to Settings → Reminders. Configure automatic email reminders to send X days before the due date, on the due date, and X days after for overdue invoices. This is a Premium feature.',
              },
              {
                q: 'Can I use InvoiceGenerator.ng offline?',
                a: 'The app requires internet to load. However, once open you can fill in an invoice and download the PDF with a poor or intermittent connection — PDF generation runs locally in your browser. Cloud saving and email/WhatsApp sending require a working connection.',
              },
              {
                q: 'Will clearing my browser delete my invoices?',
                a: 'Only if you\'re a guest (no account). Guest invoices live in browser local storage — clearing it deletes them permanently. If you have an account, your invoices are safe in the cloud and are not affected by browser clearing.',
              },
              {
                q: 'Can I create a receipt instead of an invoice?',
                a: 'Yes. Use the dedicated Free Receipt Generator at /free-receipt-generator-nigeria to generate an official payment receipt. You can also mark any invoice as Paid on your dashboard, which records the payment date and amount.',
              },
              {
                q: 'How do I cancel my Premium subscription?',
                a: 'Go to Settings → Billing and click Cancel Subscription. Your Premium features remain active until the end of the current billing period. Your data and invoices are kept after cancellation.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <span className="text-gray-400 text-lg leading-none group-open:rotate-180 transition-transform flex-shrink-0 ml-2">▾</span>
                </summary>
                <p className="text-gray-700 leading-relaxed mt-3 text-sm">{a}</p>
              </details>
            ))}

          </div>
        </section>

        {/* ── System Requirements ── */}
        <section id="requirements" className="mb-12 scroll-mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">System Requirements</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-700 mb-3">Works on all modern browsers:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-5">
              <li>Google Chrome (recommended)</li>
              <li>Mozilla Firefox</li>
              <li>Apple Safari (macOS &amp; iOS)</li>
              <li>Microsoft Edge</li>
              <li>Samsung Internet (Android)</li>
            </ul>
            <p className="text-gray-700 font-semibold mb-2">Required settings:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>JavaScript enabled</li>
              <li>Local storage enabled (for guest invoice saving)</li>
              <li>TLS 1.2 or higher</li>
              <li>Pop-ups / downloads allowed for your PDF downloads</li>
            </ul>
          </div>
        </section>

        {/* ── What's New ── */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">🚀 What&apos;s New</h3>
              <p className="text-sm text-gray-500 mt-0.5">See the latest features and improvements</p>
            </div>
            <Link href="/release-notes" className="text-sm font-medium text-teal-700 hover:underline underline-offset-2 whitespace-nowrap">
              Release Notes →
            </Link>
          </div>
        </section>

        {/* ── Related Links ── */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Learn More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: '/invoice-generator-nigeria', label: 'Invoice Generator Nigeria' },
              { href: '/send-invoice-via-whatsapp-nigeria', label: 'Send Invoice via WhatsApp' },
              { href: '/ai-invoice-generator-nigeria', label: 'AI Invoice Generator' },
              { href: '/free-invoice-generator-nigeria', label: 'Free Invoice Generator' },
              { href: '/free-receipt-generator-nigeria', label: 'Free Receipt Generator' },
              { href: '/invoice-templates', label: 'Invoice Templates' },
              { href: '/guide', label: 'Nigerian Invoicing Guide' },
              { href: '/blog', label: 'Blog & Resources' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
              >
                {label} →
              </Link>
            ))}
          </div>
        </section>

        {/* ── Can't find what you're looking for ── */}
        <section className="mb-4">
          <div className="bg-gradient-to-r from-teal-700 to-teal-800 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="text-teal-100 mb-6 text-sm leading-relaxed max-w-md mx-auto">
              Our support team is here to help. Describe your issue and we&apos;ll get back to you within one business day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-white text-teal-800 px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-50 transition-colors text-sm"
              >
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="inline-block border border-white/40 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm"
              >
                Full FAQ
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
