'use client';

import Link from 'next/link';

const InvoiceFormPreview = () => {
    return (
        <Link href="/free-invoice-generator" className="block group cursor-pointer">
            <div className="relative max-w-4xl mx-auto mt-12">
                {/* Fade out at the bottom to suggest there's more */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none"></div>

                <div className="rounded-t-2xl shadow-xl border border-gray-200 border-b-0 bg-white overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1" style={{ maxHeight: '420px' }}>
                    {/* Invoice Header Bar */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Invoice Generator</h3>
                            <p className="text-xs text-gray-500">Create professional invoices in minutes</p>
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">DRAFT</span>
                    </div>

                    {/* Invoice Form Body */}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Left Column - Preview */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-600">Preview</span>
                                    <span className="text-xs text-gray-400">Auto-updates as you type</span>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                                    {/* Invoice Title */}
                                    <div className="flex justify-between items-start mb-6">
                                        {/* Logo placeholder */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-2xl font-light text-gray-300 tracking-widest">INVOICE</span>
                                    </div>

                                    {/* Invoice Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400 w-16 text-right">NUMBER</span>
                                            <div className="flex-1 h-8 bg-gray-50 rounded border border-gray-200 px-3 flex items-center">
                                                <span className="text-sm text-gray-400">#</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400 w-16 text-right">DATE</span>
                                            <div className="flex-1 h-8 bg-gray-50 rounded border border-gray-200 px-3 flex items-center">
                                                <span className="text-sm text-gray-500">16/02/2026</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400 w-16 text-right">DUE</span>
                                            <div className="flex-1 h-8 bg-gray-50 rounded border border-gray-200 px-3 flex items-center">
                                                <span className="text-sm text-gray-500">18/03/2026</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* From Section */}
                                    <div className="mb-4">
                                        <div className="h-9 bg-gray-50 rounded border border-gray-200 px-3 flex items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Your Business Name</span>
                                        </div>
                                        <div className="h-8 bg-gray-50 rounded border border-gray-200 px-3 flex items-center">
                                            <span className="text-sm text-gray-400">123 Business Way, Lagos, Nigeria</span>
                                        </div>
                                    </div>

                                    {/* Bill To */}
                                    <div>
                                        <span className="text-[10px] font-semibold text-gray-400 tracking-wider">BILL TO</span>
                                        <div className="h-9 bg-gray-50 rounded border border-gray-200 px-3 flex items-center mt-1 mb-2">
                                            <span className="text-sm text-gray-400">Client Name</span>
                                        </div>
                                        <div className="h-8 bg-gray-50 rounded border border-gray-200 px-3 flex items-center">
                                            <span className="text-sm text-gray-400">Client Address</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Settings */}
                            <div className="w-full md:w-56 shrink-0">
                                <div className="flex gap-2 mb-6">
                                    <div className="flex-1 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 font-medium">History</div>
                                    <div className="flex-1 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500 font-medium">+ New</div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span className="text-pink-500">⚙</span> Settings
                                    </div>

                                    {/* Color Theme */}
                                    <div>
                                        <span className="text-[10px] font-semibold text-gray-400 tracking-wider block mb-2">COLOR THEME</span>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 ring-2 ring-offset-2 ring-gray-700"></div>
                                            <div className="w-8 h-8 rounded-full bg-blue-600"></div>
                                            <div className="w-8 h-8 rounded-full bg-emerald-500"></div>
                                            <div className="w-8 h-8 rounded-full bg-purple-500"></div>
                                            <div className="w-8 h-8 rounded-full bg-red-500"></div>
                                        </div>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <span className="text-[10px] font-semibold text-gray-400 tracking-wider block mb-2">CURRENCY</span>
                                        <div className="h-9 bg-gray-50 rounded-lg border border-gray-200 px-3 flex items-center justify-between">
                                            <span className="text-sm text-gray-700">NGN (₦)</span>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hover CTA overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="bg-slate-900 text-white font-semibold py-3 px-6 rounded-full shadow-lg text-sm pointer-events-none">
                        Start Creating Your Invoice →
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default InvoiceFormPreview;
