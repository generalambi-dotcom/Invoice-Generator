import Link from 'next/link';
import Script from 'next/script';
import InvoiceFormPreview from '@/components/InvoiceFormPreview';
import PricingSection from '@/components/PricingSection';
import GlobalInvoiceCounter from '@/components/GlobalInvoiceCounter';
import TrustBar from '@/components/home/TrustBar';
import HowItWorks from '@/components/home/HowItWorks';
import OutcomeCards from '@/components/home/OutcomeCards';
import WhyNigeria from '@/components/home/WhyNigeria';
import UseCases from '@/components/home/UseCases';
import Testimonials from '@/components/home/Testimonials';
import PremiumTeaser from '@/components/home/PremiumTeaser';
import HomeFAQ from '@/components/home/HomeFAQ';
import FinalCTA from '@/components/home/FinalCTA';
import StickyMobileCTA from '@/components/home/StickyMobileCTA';
import { Sparkles, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Free Invoice Generator Nigeria — Get Paid Faster | InvoiceGenerator.ng' },
  description:
    'Create professional Naira invoices in 60 seconds. FIRS 7.5% VAT, Paystack payments, WhatsApp delivery. Free forever — used by 50,000+ Nigerian businesses.',
  alternates: {
    canonical: '/',
  },
};

const homepageSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'InvoiceGenerator.ng',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'NGN' },
    description:
      'Free online invoice generator for Nigerian businesses with Naira support, WhatsApp delivery, and Paystack payments.',
    featureList: [
      'Naira invoicing',
      'WhatsApp delivery',
      'Paystack integration',
      'VAT 7.5% calculation',
      'FIRS compliance',
    ],
    url: 'https://www.invoicegenerator.ng',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'InvoiceGenerator.ng',
    url: 'https://www.invoicegenerator.ng',
    logo: 'https://www.invoicegenerator.ng/logo.png',
    sameAs: ['https://www.invoicegenerator.ng'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'InvoiceGenerator.ng',
    url: 'https://www.invoicegenerator.ng',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.invoicegenerator.ng/blog?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is InvoiceGenerator.ng really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Creating and downloading invoices is 100% free, forever. Premium plans unlock recurring invoices, AI generation, WhatsApp delivery, and more.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does it support Naira (₦)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Naira is the default currency. You can also invoice in USD, GBP, EUR, and 50+ other currencies.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it FIRS VAT compliant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The 7.5% VAT rate is pre-loaded. The invoice format meets FIRS requirements for Nigerian businesses.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to sign up?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No sign-up is required to create and download a single invoice. Create an account to save invoices, manage clients, and access premium features.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I send invoices via WhatsApp?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Premium users can send invoice PDFs directly to clients via WhatsApp with one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can my clients pay online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Premium users can add a Paystack payment link to invoices so Nigerian clients can pay by card, bank transfer, or USSD.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Premium plan price?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Premium is ₦3,000/month for Nigerian users, or $9.99/month for international users. There is a 30-day free trial.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I add my logo and bank details?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Upload your logo, add your bank account details, and customise colours — all on the free plan.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a recurring invoice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A recurring invoice is sent automatically on a schedule (weekly, monthly, etc.) to repeat clients. This is a Premium feature.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Data is stored on Supabase (PostgreSQL) with encrypted connections. Passwords are hashed with bcrypt. We never share your data.',
        },
      },
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-[76rem] mx-auto mb-16 relative z-10">

            {/* Avatar stack + invoice counter */}
            <div className="inline-flex items-center gap-3 mb-8 animate-fade-in-up">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-xs">👩🏽</div>
                <div className="w-8 h-8 rounded-full bg-sky-200 border-2 border-white flex items-center justify-center text-xs">👨🏻</div>
                <div className="w-8 h-8 rounded-full bg-rose-200 border-2 border-white flex items-center justify-center text-xs">👩🏿</div>
                <div className="w-8 h-8 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-xs">👨🏾</div>
              </div>
              <span className="text-sm text-gray-600">
                <GlobalInvoiceCounter /> invoices created for Nigerian businesses
              </span>
            </div>

            <h1
              className="font-bold tracking-tight text-slate-900 mb-4 leading-[1.15] animate-fade-in-up animation-delay-100"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              Get Paid Faster.{' '}
              <br className="hidden sm:block" />
              Run Your Business Better.
            </h1>

            <p
              className="text-gray-500 mb-8 max-w-xl mx-auto animate-fade-in-up animation-delay-200"
              style={{ fontSize: '0.95rem', lineHeight: '1.7' }}
            >
              The{' '}
              <Link
                href="/invoice-generator-nigeria"
                className="text-teal-700 hover:text-teal-900 font-medium underline underline-offset-2 transition-colors"
              >
                free invoice generator for Nigerian businesses
              </Link>{' '}
              — Naira support, 7.5% FIRS VAT, Paystack payments, and WhatsApp delivery in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up animation-delay-300">
              <Link
                href="/free-invoice-generator"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-teal-800 text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Create Your First Invoice
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3 text-sm font-semibold rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
              >
                See how it works ↓
              </a>
            </div>
          </div>

          {/* Interactive invoice preview */}
          <InvoiceFormPreview />

          {/* Callout bar */}
          <div className="mt-8 text-center flex flex-wrap items-center justify-center gap-1.5 text-sm text-gray-500 font-medium px-4 animate-fade-in-up animation-delay-400">
            <Link
              href="/upgrade"
              className="text-gray-900 font-bold hover:underline transition-colors decoration-2 underline-offset-2 decoration-amber-400"
            >
              Try Premium 30 days free
            </Link>
            <span>
              — smarter invoices with{' '}
              <Sparkles className="w-4 h-4 inline-block text-purple-500 mb-0.5 mx-0.5" />
              <Link
                href="/ai-invoice-generator-nigeria"
                className="font-bold text-gray-700 hover:text-purple-600 transition-colors underline underline-offset-2"
              >
                AI
              </Link>
            </span>
            <span>
              and instant delivery via{' '}
              <MessageCircle className="w-4 h-4 inline-block text-[#25D366] mb-0.5 mx-0.5" />
              <Link
                href="/send-invoice-via-whatsapp-nigeria"
                className="font-bold text-[#25D366] hover:text-[#1EBE5A] transition-colors underline underline-offset-2"
              >
                WhatsApp
              </Link>
              .
            </span>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────── */}
      <TrustBar />

      {/* ── How It Works ──────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Outcome Cards ─────────────────────────────────────── */}
      <OutcomeCards />

      {/* ── Why Nigeria ───────────────────────────────────────── */}
      <WhyNigeria />

      {/* ── Use Cases ─────────────────────────────────────────── */}
      <UseCases />

      {/* ── Testimonials ──────────────────────────────────────── */}
      <Testimonials />

      {/* ── Premium Teaser ────────────────────────────────────── */}
      <PremiumTeaser />

      {/* ── Pricing (geo-aware, unchanged) ────────────────────── */}
      <PricingSection />

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <HomeFAQ />

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <FinalCTA />

      {/* ── Sticky Mobile CTA (client, scroll-triggered) ──────── */}
      <StickyMobileCTA />
    </div>
  );
}
