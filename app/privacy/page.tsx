import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Invoice Generator Nigeria',
  description: 'Read our privacy policy to understand how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <p className="text-sm text-gray-500">Last updated: December 2024</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Invoice Generator Nigeria ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you use our invoicing service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Information You Provide</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  When you create an account or use our service, we may collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Name and email address (for account creation)</li>
                  <li>Company information (name, address, contact details)</li>
                  <li>Client information (for invoice creation)</li>
                  <li>Invoice data (line items, amounts, dates, etc.)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Automatically Collected Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We may automatically collect certain information about your device and usage:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>IP address</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide, maintain, and improve our invoicing service</li>
              <li>Process your account registration and manage your account</li>
              <li>Generate and store your invoices</li>
              <li>Send you service-related communications</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Currently, Invoice Generator Nigeria stores your invoice data locally in your browser's local storage. This means:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Your data remains on your device and is not transmitted to our servers</li>
              <li>We do not have access to your invoice information</li>
              <li>You are responsible for backing up your data</li>
              <li>Clearing your browser data will remove stored invoices</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              In the future, we may offer cloud storage options. If we do, we will update this policy and notify you accordingly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the 
              following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities</li>
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our service</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your information. However, no method 
              of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable 
              means to protect your information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under Nigerian data protection laws and best practices, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us through our website or email support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience. For more information about how we use cookies, 
              please see our Cookie Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from 
              children. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
              on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our website or email support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

