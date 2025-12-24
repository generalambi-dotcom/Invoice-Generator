import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Invoice Generator Nigeria - Free Online Invoice Creator',
    template: '%s | Invoice Generator Nigeria',
  },
  description: 'Generate professional invoices in Nigeria. Free online invoice generator with PDF export. Supports Nigerian Naira (₦), VAT compliance, and FIRS requirements.',
  keywords: ['invoice generator Nigeria', 'free invoice', 'online invoice', 'invoice template Nigeria', 'create invoice', 'invoice PDF Nigeria', 'Nigerian invoice'],
  authors: [{ name: 'Invoice Generator Nigeria' }],
  creator: 'Invoice Generator Nigeria',
  publisher: 'Invoice Generator Nigeria',
  metadataBase: new URL('https://invoicegenerator.ng'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://invoicegenerator.ng',
    siteName: 'Invoice Generator Nigeria',
    title: 'Invoice Generator Nigeria - Free Online Invoice Creator',
    description: 'Generate professional invoices in Nigeria. Free online invoice generator with PDF export. Supports Nigerian Naira (₦), VAT compliance, and FIRS requirements.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoice Generator Nigeria',
    description: 'Generate professional invoices in Nigeria. Free online invoice generator with PDF export.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-3030959142951109',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

