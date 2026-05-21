import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const InvoiceForm = dynamic(() => import('@/components/InvoiceForm'), {
    ssr: false,
});

export const metadata: Metadata = {
    title: 'Free Receipt Maker & Generator Nigeria - Create Payment Receipts Online',
    description: 'Create professional payment receipts online in seconds. Free receipt maker for Nigerian businesses & freelancers. Supports Naira (₦), instant PDF download. No sign-up required.',
    keywords: [
        'receipt maker nigeria',
        'free receipt generator',
        'payment receipt nigeria',
        'online receipt maker',
        'receipt generator naira',
        'create receipt online free',
        'payment receipt template nigeria',
        'business receipt nigeria',
    ],
    openGraph: {
        title: 'Free Receipt Maker & Generator Nigeria - Create Payment Receipts Online',
        description: 'Create professional payment receipts online in seconds. Free receipt maker for Nigerian businesses and freelancers. Supports Naira (₦), instant PDF download.',
        type: 'website',
        url: 'https://www.invoicegenerator.ng/free-receipt-generator-nigeria',
    },
    alternates: {
        canonical: 'https://www.invoicegenerator.ng/free-receipt-generator-nigeria',
    },
};

export default function FreeReceiptGeneratorPage() {
    return (
        <>
            {/* SEO content block — visible to crawlers, subtle for users */}
            <div className="bg-gradient-to-b from-teal-50 to-white py-8 px-4 text-center border-b border-teal-100">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Free Receipt Maker for Nigeria 🇳🇬
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
                    Create a professional <strong>payment receipt</strong> in seconds. Supports{' '}
                    <strong>Nigerian Naira (₦)</strong>, PDF download, and custom branding.
                    Perfect for freelancers, small businesses, and sole traders — completely free.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <span className="text-xs bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full font-medium">✓ Instant PDF Download</span>
                    <span className="text-xs bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full font-medium">✓ Nigerian Naira (₦)</span>
                    <span className="text-xs bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full font-medium">✓ No Sign-up Required</span>
                    <span className="text-xs bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full font-medium">✓ FIRS VAT Included</span>
                </div>
            </div>

            {/* The generator, defaulting to 'receipt' type */}
            <InvoiceForm initialType="receipt" />
        </>
    );
}
