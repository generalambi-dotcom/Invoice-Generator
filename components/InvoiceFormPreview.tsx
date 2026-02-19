'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const InvoiceFormPreview = () => {
    const router = useRouter();
    const [typedText, setTypedText] = useState('');
    const [cursorField, setCursorField] = useState<string | null>('company');
    const fullText = 'MTN Nigeria LTD';

    // Typing animation for company name
    useEffect(() => {
        if (typedText.length < fullText.length) {
            const timeout = setTimeout(() => {
                setTypedText(fullText.slice(0, typedText.length + 1));
            }, 100 + Math.random() * 80);
            return () => clearTimeout(timeout);
        } else {
            // After typing company name, move cursor to address briefly, then stop
            const timeout = setTimeout(() => {
                setCursorField('address');
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [typedText]);

    const today = new Date();
    const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) =>
        `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

    const handleClick = () => {
        router.push('/free-invoice-generator');
    };

    return (
        <div
            onClick={handleClick}
            className="block group cursor-text"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
        >
            <div className="relative max-w-5xl mx-auto mt-12">
                {/* Fade out at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-50 to-transparent z-20 pointer-events-none"></div>

                <div className="rounded-t-2xl shadow-2xl border border-gray-200 border-b-0 bg-white overflow-hidden transition-all duration-300 group-hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)]" style={{ maxHeight: '520px' }}>
                    {/* Invoice Header Bar */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Invoice Generator</h3>
                            <p className="text-xs text-gray-500">Create professional invoices in minutes</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">DRAFT</span>
                            <span className="text-xs text-gray-400">Edited just now</span>
                        </div>
                    </div>

                    {/* Invoice Form Body */}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Left Column - Form */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-gray-600">Preview</span>
                                    <span className="text-xs text-gray-400">Auto-updates as you type</span>
                                </div>

                                {/* Invoice paper */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                                    {/* Logo + Invoice title */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-2xl font-light text-gray-300 tracking-widest">INVOICE</span>
                                    </div>

                                    {/* Invoice number, date, due */}
                                    <div className="space-y-2.5 mb-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400 w-16 text-right font-medium">NUMBER</span>
                                            <div className="flex-1 h-9 bg-white rounded-md border border-gray-200 px-3 flex items-center hover:border-gray-300 transition-colors">
                                                <span className="text-sm text-gray-300">INV-0001</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400 w-16 text-right font-medium">DATE</span>
                                            <div className="flex-1 h-9 bg-white rounded-md border border-gray-200 px-3 flex items-center justify-between hover:border-gray-300 transition-colors">
                                                <span className="text-sm text-gray-600">{formatDate(today)}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-400 w-16 text-right font-medium">DUE</span>
                                            <div className="flex-1 h-9 bg-white rounded-md border border-gray-200 px-3 flex items-center justify-between hover:border-gray-300 transition-colors">
                                                <span className="text-sm text-gray-600">{formatDate(dueDate)}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Name - with typing animation */}
                                    <div className="mb-2">
                                        <div className="h-10 bg-white rounded-md border border-gray-200 px-3 flex items-center hover:border-gray-300 transition-colors relative">
                                            {typedText ? (
                                                <span className="text-sm font-medium text-gray-800">{typedText}</span>
                                            ) : (
                                                <span className="text-sm text-gray-300">Your Company Name</span>
                                            )}
                                            {cursorField === 'company' && (
                                                <span className="w-0.5 h-5 bg-blue-500 animate-pulse ml-0.5 inline-block"></span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="mb-5">
                                        <div className="h-9 bg-white rounded-md border border-gray-200 px-3 flex items-center hover:border-gray-300 transition-colors">
                                            <span className="text-sm text-gray-300">Address, City, State, Zip, Country...</span>
                                            {cursorField === 'address' && (
                                                <span className="w-0.5 h-5 bg-blue-500 animate-pulse ml-0.5 inline-block"></span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bill To */}
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Bill To</span>
                                        <div className="h-10 bg-white rounded-md border border-gray-200 px-3 flex items-center mt-1.5 mb-2 hover:border-gray-300 transition-colors">
                                            <span className="text-sm text-gray-300">Client Name</span>
                                        </div>
                                        <div className="h-9 bg-white rounded-md border border-gray-200 px-3 flex items-center hover:border-gray-300 transition-colors">
                                            <span className="text-sm text-gray-300">Client Address</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Action Buttons & Settings */}
                            <div className="w-full md:w-56 shrink-0">
                                {/* Action buttons */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 space-y-2.5">
                                    <div className="group h-10 bg-gray-900 rounded-lg flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/20 active:scale-95 transition-all duration-300 cursor-pointer">
                                        <svg className="w-4 h-4 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span className="text-sm font-bold text-white">Download PDF</span>
                                    </div>
                                    <div className="h-10 bg-blue-600 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-blue-200">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                        <span className="text-sm font-bold text-white">Save Invoice</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-8 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">History</div>
                                        <div className="flex-1 h-8 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">+ New</div>
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                        <span className="text-purple-500">⚙</span> Settings
                                    </div>

                                    {/* Color Theme */}
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 tracking-wider block mb-2 uppercase">Color Theme</span>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-700 ring-2 ring-offset-2 ring-gray-700 cursor-pointer"></div>
                                            <div className="w-8 h-8 rounded-full bg-blue-600 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-600 transition-all"></div>
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-emerald-500 transition-all"></div>
                                            <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-purple-500 transition-all"></div>
                                            <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-red-500 transition-all"></div>
                                        </div>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 tracking-wider block mb-2 uppercase">Currency</span>
                                        <div className="h-9 bg-white rounded-lg border border-gray-200 px-3 flex items-center justify-between hover:border-gray-300 transition-colors">
                                            <span className="text-sm text-gray-700">NGN (₦)</span>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>

                                    {/* Theme preview mini */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Preview</span>
                                            <span className="text-[10px] text-blue-500 font-medium cursor-pointer">🔍 Zoom</span>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                                <span className="text-[8px] text-gray-400">{formatDate(today)}</span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <div className="text-[7px] text-gray-400 font-medium">FROM</div>
                                                <div className="text-[7px] text-gray-400 font-medium">TO</div>
                                            </div>
                                            <div className="flex justify-between mb-3">
                                                <span className="text-[7px] text-gray-500">{typedText || 'Company'}</span>
                                                <span className="text-[7px] text-gray-500">Client</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-1">
                                                <div className="flex justify-between text-[7px]">
                                                    <span className="text-gray-400">Item</span>
                                                    <span className="text-gray-400">Amt</span>
                                                </div>
                                                <div className="h-px bg-gray-200 my-1"></div>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-[7px] text-gray-400">Total</span>
                                                <span className="text-[7px] font-bold text-gray-600">₦0.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceFormPreview;
