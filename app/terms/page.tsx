import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Invoice Generator Nigeria',
  description: 'Read our terms of service for using Invoice Generator Nigeria.',
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <p className="text-sm text-gray-500">Last updated: December 2024</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Invoice Generator Nigeria ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily use Invoice Generator Nigeria for personal and commercial invoicing purposes. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose other than creating invoices</li>
              <li>Attempt to reverse engineer any software contained in the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any 
              breach of security or unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Invoice Generation and Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Invoice Generator Nigeria allows you to create, store, and manage invoices. You are solely responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>The accuracy and completeness of all information entered into invoices</li>
              <li>Compliance with all applicable tax laws and regulations in Nigeria</li>
              <li>Maintaining backups of your invoice data</li>
              <li>Ensuring that invoices comply with Federal Inland Revenue Service (FIRS) requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Invoice Generator Nigeria is currently provided free of charge. We reserve the right to introduce paid features or 
              subscription plans in the future. Any changes to pricing will be communicated in advance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Storage and Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your invoice data is stored locally in your browser. We do not have access to your invoice information unless you 
              explicitly share it with us. For more information, please review our Privacy Policy.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining backups of your invoices. We are not liable for any loss of data due to browser 
              clearing, device changes, or other circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Uses</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not use Invoice Generator Nigeria:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The materials on Invoice Generator Nigeria are provided on an 'as is' basis. We make no warranties, expressed or implied, 
              and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of 
              merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We do not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the 
              materials on our website or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitations</h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall Invoice Generator Nigeria or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
              materials on Invoice Generator Nigeria, even if we or an authorized representative has been notified orally or in writing 
              of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Revisions and Errata</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials appearing on Invoice Generator Nigeria could include technical, typographical, or photographic errors. 
              We do not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to 
              the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our website or email support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

