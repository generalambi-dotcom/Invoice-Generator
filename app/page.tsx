import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import InvoiceForm to avoid SSR issues during static generation
const InvoiceForm = dynamic(() => import('@/components/InvoiceForm'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Free Invoice Generator Nigeria - Create Professional Invoices Online',
  description: 'Generate professional invoices in Nigeria. Free online invoice generator with PDF export. Supports Nigerian Naira (₦), VAT compliance, and FIRS requirements.',
  keywords: ['invoice generator Nigeria', 'free invoice', 'online invoice', 'invoice template Nigeria', 'create invoice', 'invoice PDF Nigeria'],
  openGraph: {
    title: 'Free Invoice Generator Nigeria - Create Professional Invoices Online',
    description: 'Generate professional invoices in Nigeria. Free online invoice generator with PDF export.',
    type: 'website',
  },
};

// Use dynamic import to prevent SSR issues that cause 5xx errors for crawlers
export default function Home() {
  return <InvoiceForm />;
}

