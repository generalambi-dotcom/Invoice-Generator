'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, FileText, Zap, ShieldCheck } from 'lucide-react';
import GlobalInvoiceCounter from '@/components/GlobalInvoiceCounter';

export default function AILandingPage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        // Redirect to the main generator with the prompt in the URL query
        router.push(`/invoice-generator?prompt=${encodeURIComponent(prompt.trim())}`);
    };

    const handleChipClick = (text: string) => {
        setPrompt(text);
    };

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-[76rem] mx-auto mb-16 relative">

                        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-sm font-medium animate-fade-in-up">
                            <Sparkles className="w-4 h-4" />
                            <span>Introducing AI-Powered Invoicing</span>
                        </div>

                        <h1 className="font-bold tracking-tight text-slate-900 mb-4 leading-[1.2] animate-fade-in-up animation-delay-100" style={{ fontSize: '2.5rem' }}>
                            Create Professional Invoices <br className="hidden md:block" />
                            <span className="italic text-teal-800">in Seconds with AI</span>
                        </h1>

                        <p className="text-gray-500 mb-8 max-w-xl mx-auto animate-fade-in-up animation-delay-200" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                            Simple, fast, and completely automated. Just tell our AI what you need to bill, and watch it generate an accurate invoice instantly.
                        </p>
                    </div>

                    {/* Chat Interface Container */}
                    <div className="max-w-3xl mx-auto relative animate-fade-in-up animation-delay-300">
                        {/* Soft glowing background effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2rem] blur opacity-20 transition duration-1000 group-hover:opacity-30 group-hover:duration-200"></div>

                        <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-teal-900/10 border border-gray-100 p-6 md:p-8">
                            <form onSubmit={handleGenerate} className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'Bill John Doe $1,500 for the website redesign project. Add a 10% discount and make it due next Friday.'"
                                    className="w-full min-h-[140px] px-6 py-5 bg-gray-50/50 border border-gray-200 rounded-2xl text-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none placeholder:text-gray-400"
                                    autoFocus
                                />

                                <div className="absolute bottom-4 right-4">
                                    <button
                                        type="submit"
                                        disabled={!prompt.trim()}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-800 text-white font-semibold rounded-full hover:bg-teal-700 transition-all shadow-sm hover:shadow-md shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Generate Draft
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>

                            {/* Inspiration Chips */}
                            <div className="mt-8">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Try an example</p>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleChipClick("Invoice Acme Corp for 15 hours of SEO consulting at $100/hr. Due in 30 days.")} className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full transition-colors border border-gray-200 animate-fade-in-up animation-delay-400">
                                        "15 hours of SEO consulting..."
                                    </button>
                                    <button onClick={() => handleChipClick("Create an estimate for Sarah Smith. 1 Custom Logo Design for $800. Valid for 14 days.")} className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full transition-colors border border-gray-200 animate-fade-in-up animation-delay-500">
                                        "Estimate for custom logo..."
                                    </button>
                                    <button onClick={() => handleChipClick("Bill the landlord $250 for plumbing repairs and $50 for materials. Paid in full.")} className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full transition-colors border border-gray-200 animate-fade-in-up animation-delay-600">
                                        "Plumbing repairs & materials..."
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-1.5 text-sm text-gray-500 font-medium px-4 animate-fade-in-up animation-delay-700">
                        <span>Join over</span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md"><GlobalInvoiceCounter /></span>
                        <span>businesses drafting smarter.</span>
                    </div>

                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 bg-gray-50 relative overflow-hidden text-gray-900 border-t border-gray-100">

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">How AI Invoicing Works</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">Skip the tedious entry fields. Describe what you need, and we'll handle the math and formatting.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-lg font-black">1</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Tell the AI what you need</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Type naturally. Mention the client's name, the services provided, rates, and any specific terms or discounts.</p>
                        </div>

                        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                            {/* Desktop connector arrows */}
                            <div className="absolute top-1/2 -left-3 w-6 h-0.5 bg-gray-200 hidden md:block"></div>
                            <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-200 hidden md:block"></div>

                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-lg font-black">2</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Watch it build instantly</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">The AI parses your text, extracts entities, calculates totals, applies taxes, and maps them to a professional invoice layout.</p>
                        </div>

                        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-lg font-black">3</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Review & Send</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Preview the final document. Make any quick manual edits if necessary, then download the PDF or send it directly via email.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust/Benefits Section */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Designed for freelancers and businesses.</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                Your time is money. AI doesn't just save you minutes per invoice—it reduces human error in calculations and ensures you never forget to add your standard late fee terms again.
                            </p>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Instant Calculations</h4>
                                        <p className="text-gray-600">Complex line items, dynamic taxes, and percentage discounts are calculated perfectly every time.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Multiple Formats</h4>
                                        <p className="text-gray-600">Generate Invoices, Estimates, or Credit Notes just by mentioning the document type in your prompt.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Secure & Private</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">Your invoicing data is securely processed and Never used to train public LLM models.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-50 rounded-3xl transform rotate-3 scale-105"></div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                                <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center">
                                    <div className="text-2xl font-bold uppercase tracking-widest text-slate-800">INVOICE</div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-gray-900">$1,650.00</div>
                                        <div className="text-xs text-gray-500">Due in 15 Days</div>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-8">
                                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Website Redesign</span>
                                        <span className="text-sm font-bold text-gray-900">$1,500.00</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Hosting Setup</span>
                                        <span className="text-sm font-bold text-gray-900">$150.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 bg-gray-50 text-center border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to upgrade your workflow?</h2>
                    <Link href="/invoice-generator" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-teal-800 text-white hover:bg-teal-700 transition-all shadow-sm hover:shadow-md">
                        Go to the Generator
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

        </div>
    );
}
