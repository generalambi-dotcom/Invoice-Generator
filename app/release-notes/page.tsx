import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Release Notes - Invoice Generator Nigeria',
  description: 'Stay updated with the latest features, improvements, and updates to Invoice Generator Nigeria.',
};

export default function ReleaseNotesPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Release Notes</h1>

        {/* Version 1.0.0 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Version 1.0.0</h2>
            <span className="text-sm text-gray-500">December 2024</span>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">✨ New Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Complete invoice creation and management system</li>
                <li>Professional PDF invoice generation</li>
                <li>Multiple currency support including Nigerian Naira (₦)</li>
                <li>Customizable invoice themes</li>
                <li>Invoice history and storage</li>
                <li>User authentication and dashboard</li>
                <li>Company defaults and template saving</li>
                <li>Tax and discount calculations</li>
                <li>Line items management</li>
                <li>Comprehensive invoicing guide and FAQ</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🔧 Improvements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Responsive design for all devices</li>
                <li>Intuitive user interface</li>
                <li>Fast and efficient invoice generation</li>
                <li>Local storage for offline access</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Documentation</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Comprehensive invoicing guide for Nigerian businesses</li>
                <li>FAQ section with common questions</li>
                <li>Help documentation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚀 Upcoming Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Email invoice delivery</li>
            <li>Recurring invoices</li>
            <li>Invoice templates library</li>
            <li>Multi-language support</li>
            <li>Advanced reporting and analytics</li>
            <li>Payment gateway integration</li>
            <li>Mobile app</li>
            <li>Cloud backup and sync</li>
            <li>Team collaboration features</li>
            <li>API access for developers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

