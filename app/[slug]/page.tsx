import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { seoPages } from '@/data/seo-pages';
import InvoiceFormPreview from '@/components/InvoiceFormPreview';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, Link as LinkIcon } from 'lucide-react';

interface PageProps {
    params: {
        slug: string;
    };
}

// Generate static routes at build time
export function generateStaticParams() {
    return Object.keys(seoPages).map((slug) => ({
        slug,
    }));
}

// Generate exact-match custom metadata
export function generateMetadata({ params }: PageProps): Metadata {
    const pageData = seoPages[params.slug];

    if (!pageData) {
        return {};
    }

    return {
        title: pageData.meta.title,
        description: pageData.meta.description,
        keywords: pageData.meta.keywords,
        alternates: {
            canonical: `/${params.slug}`,
        }
    };
}

export default function SeoLandingPage({ params }: PageProps) {
    const pageData = seoPages[params.slug];

    // 404 if the slug isn't in our dictionary
    if (!pageData) {
        notFound();
    }

    // Advanced SEO: Intent-Based In-Text Linking
    // Safely replaces exact text matches from our related links array with actual React <Link> components
    const injectInTextLinks = (text: string, links: Array<{ text: string, url: string }>) => {
        if (!text || !links || links.length === 0) return text;

        // Sort by length descending so longer phrases match first (e.g. "Free Invoice Template" before "Invoice")
        const sortedLinks = [...links].sort((a, b) => b.text.length - a.text.length);

        // Create regex matching any of the exact phrases, case-insensitive
        const pattern = new RegExp(`(${sortedLinks.map(l => l.text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join('|')})`, 'gi');

        const parts = text.split(pattern);

        return parts.map((part, index) => {
            const foundLink = sortedLinks.find(l => l.text.toLowerCase() === part.toLowerCase());

            if (foundLink) {
                return (
                    <Link
                        key={index}
                        href={foundLink.url}
                        className="text-teal-700 font-medium hover:text-teal-900 underline underline-offset-2 transition-colors"
                    >
                        {part}
                    </Link>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Generate JSON-LD for FAQs
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": pageData.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Inject FAQ Schema for Rich Snippets */}
            <Script id={`faq-schema-${pageData.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* 0. SEO Breadcrumb Structure */}
            <nav className="bg-gray-50 border-b border-gray-100 py-3 hidden sm:block">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li>
                            <Link href="/" className="hover:text-teal-700 transition-colors">Home</Link>
                        </li>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <li>
                            <span className="text-gray-500">Invoice Tools</span>
                        </li>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <li>
                            <span className="text-gray-500">{pageData.category}</span>
                        </li>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <li>
                            <span className="text-gray-900 font-medium truncate" aria-current="page">
                                {pageData.hero.h1}
                            </span>
                        </li>
                    </ol>
                </div>
            </nav>

            {/* 1. Dynamic Hero Section */}
            <section className="relative pt-16 pb-32 overflow-hidden bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-[76rem] mx-auto mb-16 relative">
                        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-sm font-medium animate-fade-in-up">
                            <Sparkles className="w-4 h-4" />
                            <span>{pageData.hero.chipText}</span>
                        </div>

                        <h1 className="font-bold tracking-tight text-slate-900 mb-6 leading-[1.2] animate-fade-in-up animation-delay-100" style={{ fontSize: '2.5rem' }}>
                            {pageData.hero.h1}
                        </h1>

                        <p className="text-gray-500 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 text-lg leading-relaxed">
                            {pageData.hero.subheadline}
                        </p>

                        <div className="flex justify-center animate-fade-in-up animation-delay-300">
                            <Link
                                href="/free-invoice-generator"
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-full bg-teal-800 text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md"
                            >
                                {pageData.hero.cta}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* 2. Embedded App Generator Simulator */}
                    <InvoiceFormPreview />
                </div>
            </section>

            {/* 3. SEO Content Text Block */}
            <section className="py-20 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Why Choose InvoiceGenerator?</h2>

                        <div className="space-y-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                                    Who is this tool built for?
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {injectInTextLinks(pageData.content.whoIsItFor, pageData.relatedLinks)}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                                    Built specifically for Nigeria
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {injectInTextLinks(pageData.content.whyNigeriansUseIt, pageData.relatedLinks)}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                                    Accelerated by AI & WhatsApp
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {injectInTextLinks(pageData.content.howAiAndWhatsappHelp, pageData.relatedLinks)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Structured FAQ Block */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-500">Everything you need to know about using our free generation tool.</p>
                    </div>

                    <div className="space-y-6">
                        {pageData.faqs.map((faq, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100/50">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Internal Category Silos (Related Intent Links) */}
            <section className="py-16 bg-slate-50 border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700">
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Explore Related {pageData.category} Tools</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {pageData.relatedLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                className="group flex flex-col p-6 bg-white rounded-xl border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all"
                            >
                                <span className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors mb-2">
                                    {link.text}
                                </span>
                                <span className="text-teal-600 text-sm font-medium flex items-center gap-1 mt-auto">
                                    Open tool <ArrowRight className="w-4 h-4" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Final CTA */}
            <section className="py-20 bg-teal-800 text-center text-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Ready to generate your first document?</h2>
                    <p className="text-teal-100 mb-8 max-w-2xl mx-auto">No credit card required. No hidden fees. Start billing your clients professionally today.</p>
                    <Link href="/free-invoice-generator" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-900 font-bold rounded-full hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        {pageData.hero.cta}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
