import type { Metadata } from 'next';
import InvoiceForm from '@/components/InvoiceForm';

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

export const dynamic = 'force-dynamic';

export default function Home() {
  return <InvoiceForm />;
}

