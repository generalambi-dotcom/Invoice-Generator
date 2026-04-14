import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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
  metadataBase: new URL('https://www.invoicegenerator.ng'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://www.invoicegenerator.ng',
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
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NW55HSK7');
            `,
          }}
        />
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vl0dqhxkvk");
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-NW55HSK7"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <GoogleAnalytics />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

