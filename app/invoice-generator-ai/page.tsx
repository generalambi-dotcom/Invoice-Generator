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
            <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white">
                <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-100/40 to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-[50rem] mx-auto mb-12">

                        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium animate-fade-in-up">
                            <Sparkles className="w-4 h-4" />
                            <span>Introducing AI-Powered Invoicing</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight animate-fade-in-up animation-delay-100">
                            Create Invoices in <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Seconds with AI</span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                            Stop fighting with manual entry and complex forms. Just tell our AI what you need to bill, and watch it generate a stunning, accurate invoice instantly.
                        </p>
                    </div>

                    {/* Chat Interface Container */}
                    <div className="max-w-3xl mx-auto relative animate-fade-in-up animation-delay-300">
                        {/* Soft glowing background effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 transition duration-1000 group-hover:opacity-30 group-hover:duration-200"></div>

                        <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/50 border border-indigo-50 p-6 md:p-8">
                            <form onSubmit={handleGenerate} className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'Bill John Doe $1,500 for the website redesign project. Add a 10% discount and make it due next Friday.'"
                                    className="w-full min-h-[140px] px-6 py-5 bg-gray-50/50 border border-gray-200 rounded-2xl text-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none placeholder:text-gray-400"
                                    autoFocus
                                />

                                <div className="absolute bottom-4 right-4">
                                    <button
                                        type="submit"
                                        disabled={!prompt.trim()}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Generate Draft
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Inspiration Chips */}
                            <div className="mt-8">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Try an example</p>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => handleChipClick("Invoice Acme Corp for 15 hours of SEO consulting at $100/hr. Due in 30 days.")} className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full transition-colors border border-indigo-100/50 animate-fade-in-up animation-delay-400">
                                        "15 hours of SEO consulting..."
                                    </button>
                                    <button onClick={() => handleChipClick("Create an estimate for Sarah Smith. 1 Custom Logo Design for $800. Valid for 14 days.")} className="text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-full transition-colors border border-purple-100/50 animate-fade-in-up animation-delay-500">
                                        "Estimate for custom logo..."
                                    </button>
                                    <button onClick={() => handleChipClick("Bill the landlord $250 for plumbing repairs and $50 for materials. Paid in full.")} className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full transition-colors border border-blue-100/50 animate-fade-in-up animation-delay-600">
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
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                {/* Background decorative blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How AI Invoicing Works</h2>
                        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">Skip the tedious entry fields. Describe what you need, and we'll handle the math and formatting.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/30">
                                <span className="text-2xl font-black">1</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Tell the AI what you need</h3>
                            <p className="text-slate-400 leading-relaxed">Type naturally. Mention the client's name, the services provided, rates, and any specific terms or discounts.</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl relative">
                            <div className="absolute top-1/2 -left-4 w-8 h-0.5 bg-gradient-to-r from-transparent to-indigo-500/50 hidden md:block"></div>
                            <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-l from-transparent to-indigo-500/50 hidden md:block"></div>

                            <div className="w-12 h-12 bg-purple-500/20 text-purple-300 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
                                <span className="text-2xl font-black">2</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Watch it build instantly</h3>
                            <p className="text-slate-400 leading-relaxed">The AI parses your text, extracts entities, calculates totals, applies taxes, and maps them to a professional invoice layout.</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/30">
                                <span className="text-2xl font-black">3</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Review & Send</h3>
                            <p className="text-slate-400 leading-relaxed">Preview the final document. Make any quick manual edits if necessary, then download the PDF or send it directly via email.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust/Benefits Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Designed for freelancers and modern agencies.</h2>
                            <p className="text-lg text-gray-600 mb-8">
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
                                        <h4 className="font-bold text-gray-900 text-lg">Secure & Private</h4>
                                        <p className="text-gray-600">Your invoicing data is securely processed and Never used to train public LLM models.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-3xl transform rotate-3 scale-105"></div>
                            <div className="bg-white p-8 rounded-3xl shadow-xl relative border border-gray-100">
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
            <section className="py-20 bg-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to upgrade your workflow?</h2>
                    <Link href="/invoice-generator" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Go to the Generator
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

        </div>
    );
}
