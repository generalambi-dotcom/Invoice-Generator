import type { Metadata } from 'next';
import Script from 'next/script';
import FAQAccordion from '@/components/FAQAccordion';

export const metadata: Metadata = {
  title: 'FAQ - Invoice Generator Nigeria | Frequently Asked Questions',
  description: 'Get answers to frequently asked questions about invoicing in Nigeria, VAT requirements, e-invoicing, payment collection, and more.',
};

// FAQ data mirrored here for JSON-LD schema (FAQAccordion is client-only)
// This schema is read by Google, ChatGPT, Perplexity, Claude, and Gemini
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is an invoice and why is it important in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An invoice is a commercial document that records the sale of goods or services and requests payment. It lists the seller and buyer details, describes the goods or services provided, sets the price and any taxes, and states when payment is due. In Nigeria, invoices are required for VAT compliance and provide the basis for tax reporting to the Nigeria Revenue Service (NRS).',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the VAT rate in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The VAT rate in Nigeria is 7.5%, as set by the Finance Act 2020 and maintained under the Nigeria Tax Act 2025. VAT is charged on most goods and services by VAT-registered businesses.',
      },
    },
    {
      '@type': 'Question',
      name: 'When must a Nigerian business register for VAT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Businesses with annual taxable turnover above ₦25 million must register for VAT in Nigeria. Businesses below this threshold can register voluntarily. Registration is done through the Nigeria Revenue Service (NRS, formerly FIRS) using a Tax Identification Number (TIN).',
      },
    },
    {
      '@type': 'Question',
      name: 'What information must a Nigerian invoice include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A professional Nigerian invoice must include: your business name, address, and contact details; the client\'s name and address; a unique sequential invoice number and date; a description of goods or services, quantities, and unit prices; subtotals, VAT (if applicable), and total amount owed; payment terms and due date; your bank account or NUBAN details; and your Tax Identification Number (TIN) if you are VAT-registered.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between an invoice and a receipt in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An invoice is issued before payment and acts as a request for payment. A receipt is issued after payment as proof that money was received. Both are important business documents in Nigeria — invoices for requesting payment and receipts for confirming it.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is e-invoicing in Nigeria and who must comply?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'E-invoicing in Nigeria is a system where invoices are digitally created, authenticated, and submitted through an Access Point Provider approved by NITDA, then validated by the Nigeria Revenue Service (NRS). Each e-invoice receives a QR code and Cryptographic Stamp Identifier (CSID). The rollout is phased: Phase 1 applies to businesses with annual turnover above ₦500 million from Q1 2026. Small businesses and freelancers with turnover below this threshold are not yet required to comply.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a proforma invoice and when should I use it in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A proforma invoice is a preliminary invoice providing an estimated price before goods are shipped or services delivered. In Nigeria, importers use proforma invoices to obtain Form M from the Nigeria Customs Service and the Central Bank of Nigeria before importing goods. A proforma invoice is not legally binding and is not a demand for payment — it becomes a commercial invoice once the transaction is finalised.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is withholding tax on invoices in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Withholding Tax (WHT) in Nigeria is deducted at source by the paying company before settling a service invoice. The rate is 5% for individuals and 10% for companies. Under the Nigeria Tax Act 2025, WHT does not apply to invoices below ₦2 million if the service provider supplies a valid TIN. The deducted amount is remitted to the NRS and credited to the service provider\'s tax account.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long should I keep invoice records in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Keep invoices and supporting documents for at least six years for general tax purposes. For e-invoices issued through the NRS platform, the requirement is ten years.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Nigerian freelancers invoice in foreign currency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Nigerian freelancers can invoice international clients in foreign currencies (USD, EUR, GBP, etc.), subject to Central Bank of Nigeria (CBN) regulations. For domestic clients, invoices should be in Nigerian Naira (₦). Always specify the currency and any agreed exchange rate in your contract.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a credit note in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A credit note is a document issued to reduce or cancel all or part of a previously issued invoice — for example, when goods are returned, a discount is granted after invoicing, or a billing error is corrected. It references the original invoice number and shows the amount being credited. For VAT-registered businesses, credit notes also adjust the VAT liability.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I create a free invoice in Nigeria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can create a free professional invoice for Nigerian businesses at InvoiceGenerator.ng. The tool supports Naira (₦), automatically calculates 7.5% VAT, allows WhatsApp delivery, and generates a PDF — all without requiring a sign-up. For recurring invoices, client management, and payment tracking, a free account provides additional features.',
      },
    },
  ],
};

export default function FAQPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
    </>
  );
}
