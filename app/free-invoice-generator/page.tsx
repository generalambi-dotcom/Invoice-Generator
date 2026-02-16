import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import InvoiceForm to avoid SSR issues during static generation
const InvoiceForm = dynamic(() => import('@/components/InvoiceForm'), {
    ssr: false,
});

export const metadata: Metadata = {
    title: 'Free Invoice Generator - Create Professional Invoices Online',
    description: 'Generate professional invoices in Nigeria. Free online invoice generator with PDF export. Supports Nigerian Naira (₦), VAT compliance, and FIRS requirements.',
    keywords: ['invoice generator', 'free invoice', 'online invoice', 'invoice template', 'create invoice', 'invoice PDF'],
    openGraph: {
        title: 'Free Invoice Generator - Create Professional Invoices Online',
        description: 'Generate professional invoices in Nigeria. Free online invoice generator with PDF export.',
        type: 'website',
    },
};

// Use dynamic import to prevent SSR issues that cause 5xx errors for crawlers
export default function FreeInvoiceGenerator() {
    return <InvoiceForm />;
}
