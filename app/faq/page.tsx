import type { Metadata } from 'next';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = {
  title: 'FAQ - Invoice Generator Nigeria | Frequently Asked Questions',
  description: 'Get answers to frequently asked questions about invoicing in Nigeria, VAT requirements, e-invoicing, payment collection, and more.',
};

export default function FAQPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions About Invoices in Nigeria
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about invoicing, VAT, e-invoicing, and more.
          </p>
        </div>

        <FAQAccordion />
      </div>
    </div>
  );
}

