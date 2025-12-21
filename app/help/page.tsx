import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoice Generator Help | How to Create & Send Invoices in Nigeria',
  description: 'Get help using Invoice Generator Nigeria. Learn how to create, send, download, save, and manage invoices online with step-by-step guidance.',
};

export default function HelpPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Invoice Generator in Nigeria – Create Professional Invoices Online
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Invoice Generator Nigeria is a free online invoice generator that helps Nigerian businesses, 
            freelancers, and SMEs create professional invoices in seconds. Generate invoices online, 
            download PDF invoices, send invoices to clients, and accept payments — all in one simple tool.
          </p>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-gray-800 font-semibold">
              No sign-up required. No hidden charges. 100% free.
            </p>
          </div>
        </div>

        {/* Why Use Our Invoice Generator */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use Our Invoice Generator in Nigeria?</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>⚡</span> Instant Online Invoice Generator
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Create invoices instantly using our easy-to-use invoice template. Simply enter your business details, 
                add your client information, and download your invoice as a PDF — without creating an account.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                If you want to send invoices online, it's just one click away.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                <strong>Keywords used:</strong> free invoice generator Nigeria, online invoice generator
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🇳🇬</span> Built Specifically for Nigerian Businesses
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Our invoice generator is designed for the Nigerian market:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Supports ₦ Nigerian Naira</li>
                <li>Accepted by Nigerian companies and clients</li>
                <li>Ideal for freelancers, vendors, consultants, agencies, and SMEs</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Whether you run a small business or offer professional services, this tool works for you.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📱</span> Create Invoices from Any Device
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Generate invoices on your desktop, tablet, or mobile phone. Perfect for business owners who work on-the-go.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>👥</span> Trusted Invoice Tool
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Millions of businesses worldwide use Invoice Generator to manage their invoicing. Now Nigerian businesses 
                can enjoy the same fast and reliable experience.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>💯</span> 100% Free Invoice Generator
              </h3>
              <p className="text-gray-700 leading-relaxed">
                There are no limits. Create and download unlimited invoices for free. No subscriptions. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* How to Create an Invoice */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Create an Invoice Online in Nigeria</h2>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Fill in Invoice Details</h3>
            <p className="text-gray-700 leading-relaxed mb-3">Enter:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
              <li>Your business name and address</li>
              <li>Your client's details</li>
              <li>Invoice items, quantities, and prices</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              The invoice editor shows a live preview of your invoice.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              The Download Invoice button will be enabled once both From and To fields are completed.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Download or Send Invoice</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Download Invoice as a PDF</li>
              <li>Send Invoice Online by email (with an account)</li>
            </ul>
          </div>
        </section>

        {/* Send Invoices Online */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Invoices Online & Get Paid Faster</h2>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>✉️</span> Send Invoices to Customers
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              By creating an Invoice Generator account, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Send invoices directly to clients</li>
              <li>Store invoices securely in the cloud</li>
              <li>Access invoices anytime, anywhere</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💳</span> Accept Payments Online in Nigeria
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When you send invoices, your customers can pay using:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
              <li>Bank transfer</li>
              <li>Debit or credit cards</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can also add custom payment instructions, including Nigerian bank details.
            </p>
          </div>
        </section>

        {/* Download Invoice as PDF */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Download Invoice as PDF</h2>
          
          <div className="bg-white rounded-lg shadow p-6">
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              <li>Click <strong>Download Invoice</strong> to save your invoice as a PDF file.</li>
              <li>
                If you need to make changes:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click <strong>Edit Invoice</strong></li>
                  <li>Update your invoice</li>
                  <li>Download again</li>
                </ul>
              </li>
              <li>If you don't see your invoice immediately, check your Downloads folder.</li>
            </ul>
          </div>
        </section>

        {/* Save, Edit & Export */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Save, Edit & Export Your Invoices</h2>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💾</span> Invoice History
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Invoices are auto-saved in your browser's local storage</li>
              <li>View past invoices on the History page</li>
              <li>Edit invoices anytime</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📊</span> Export Invoices
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Export all your invoices to a spreadsheet (Excel or CSV) for record-keeping and accounting.
            </p>
          </div>
        </section>

        {/* Customize Your Invoice Template */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Customize Your Invoice Template</h2>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-3">
              Save time by customizing your invoice template once.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Your invoice template can remember:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-3">
              <li>Business address</li>
              <li>Logo</li>
              <li>Currency (₦ Naira)</li>
              <li>Payment terms</li>
              <li>Notes</li>
              <li>Custom field titles</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Click <strong>Save Template</strong>, and your personalized invoice template will load automatically next time.
            </p>
          </div>
        </section>

        {/* System Requirements */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">System Requirements</h2>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <p className="text-gray-700 leading-relaxed mb-3">
              Invoice Generator Nigeria works on all modern browsers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Google Chrome</li>
              <li>Mozilla Firefox</li>
              <li>Apple Safari</li>
              <li>Microsoft Edge</li>
              <li>Internet Explorer 11</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 leading-relaxed mb-3 font-semibold">
              Required browser settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>JavaScript enabled</li>
              <li>Local storage enabled</li>
              <li>TLS v1.2 or higher</li>
            </ul>
          </div>
        </section>

        {/* Where Are Your Invoices Stored */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Where Are Your Invoices Stored?</h2>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📩</span> Sent Invoices
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Invoices sent online are securely stored in the cloud and can be accessed anytime by you or your client.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💻</span> Downloaded Invoices
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Downloaded invoices are stored only in your browser's local storage. We do not store copies on our servers.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-gray-800 flex items-start gap-2">
                <span className="text-yellow-600 font-bold">⚠️</span>
                <span>
                  Clearing your browser data will permanently remove saved invoices. Always keep a backup of your PDF invoices.
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

