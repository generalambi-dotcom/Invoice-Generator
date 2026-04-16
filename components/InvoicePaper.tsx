'use client';

import React from 'react';
import { Invoice, Theme, currencySymbols, themeColors } from '@/types/invoice';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';
import LineItems from './LineItems';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

interface InvoicePaperProps {
    invoice: Partial<Invoice>;
    isEditable?: boolean;
    onChange?: (field: keyof Invoice, value: any) => void;
    logoUpload?: React.ReactNode; // Pass the ImageUpload component or logic slot
    onDownloadPDF?: () => void;
    onSendInvoice?: () => void;
    onSaveInvoice?: () => void;
    isPremium?: boolean;
    savingInvoice?: boolean;
}

export default function InvoicePaper({
    invoice,
    isEditable = true,
    onChange,
    logoUpload,
    onDownloadPDF,
    onSendInvoice,
    onSaveInvoice,
    isPremium = false,
    savingInvoice = false,
}: InvoicePaperProps) {
    const currencySymbol = currencySymbols[invoice.currency || 'NGN'];

    // Helper for field updates
    const updateField = (field: keyof Invoice, value: any) => {
        if (isEditable && onChange) {
            onChange(field, value);
        }
    };

    const updateNestedField = (parent: keyof Invoice, field: string, value: any) => {
        if (isEditable && onChange) {
            const currentParent = (invoice[parent] as any) || {};
            onChange(parent, { ...currentParent, [field]: value });
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-xl ring-1 ring-black/5 p-8 sm:p-10 min-h-[600px] relative transition-all duration-300 ${!isEditable ? 'pointer-events-none' : ''}`}>
            {/* Ribbon/Accent Top */}
            <div className="absolute top-0 left-0 w-full h-2 bg-theme-primary rounded-t-lg opacity-80"></div>

            {/* Header Section - Split Layout */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 mt-2">
                {/* Left: Company BRAND */}
                <div className="flex-1 w-full sm:w-auto">
                    <div className="mb-6">
                        {isEditable && logoUpload ? (
                            logoUpload
                        ) : invoice.company?.logo ? (
                            <div className="relative w-32 h-32 group">
                                <Image
                                    src={invoice.company.logo}
                                    alt="Company Logo"
                                    fill
                                    unoptimized
                                    className="object-contain rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                                <span className="text-xs">No Logo</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 max-w-xs">
                        <input
                            type="text"
                            value={invoice.company?.name || ''}
                            onChange={(e) => updateNestedField('company', 'name', e.target.value)}
                            placeholder="Your Business Name"
                            className={`w-full text-2xl font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300 ${!isEditable && 'bg-transparent'}`}
                            readOnly={!isEditable}
                        />
                        {/* Simple Address Mode Fields */}
                        <textarea
                            value={invoice.company?.address || ''}
                            onChange={(e) => updateNestedField('company', 'address', e.target.value)}
                            placeholder="Business address, city, state, zip..."
                            className={`w-full text-sm text-gray-500 bg-transparent border-none p-0 focus:ring-0 resize-none h-20 placeholder:text-gray-300 ${!isEditable ? 'bg-transparent' : ''}`}
                            readOnly={!isEditable}
                        />
                    </div>
                </div>

                {/* Right: INVOICE Details */}
                <div className="text-right w-full sm:w-auto flex flex-col items-end">
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-6 uppercase opacity-10">
                        Invoice
                    </h1>
                    <div className="space-y-2 w-full sm:w-64">
                        <div className="flex items-center gap-4 justify-end">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">No.</label>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-light">#</span>
                                <input
                                    type="text"
                                    value={invoice.invoiceNumber || ''}
                                    onChange={(e) => updateField('invoiceNumber', e.target.value)}
                                    placeholder="0001"
                                    className={`w-24 text-right font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300 ${!isEditable && 'bg-transparent'}`}
                                    readOnly={!isEditable}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-end">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Date</label>
                            <input
                                type="date"
                                value={invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'yyyy-MM-dd') : ''}
                                onChange={(e) => updateField('invoiceDate', e.target.value)}
                                className={`text-right font-medium text-gray-600 bg-transparent border-none p-0 focus:ring-0 ${!isEditable && 'bg-transparent'}`}
                                readOnly={!isEditable}
                            />
                        </div>
                        <div className="flex items-center gap-4 justify-end">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Due</label>
                            <input
                                type="date"
                                value={invoice.dueDate ? format(new Date(invoice.dueDate), 'yyyy-MM-dd') : ''}
                                onChange={(e) => updateField('dueDate', e.target.value)}
                                className={`text-right font-medium text-gray-600 bg-transparent border-none p-0 focus:ring-0 ${!isEditable && 'bg-transparent'}`}
                                readOnly={!isEditable}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Bill To */}
                <div>
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bill To</label>
                    </div>
                    <div className="space-y-1">
                        <input
                            type="text"
                            value={invoice.client?.name || ''}
                            onChange={(e) => updateNestedField('client', 'name', e.target.value)}
                            placeholder="Client's Name"
                            className={`w-full font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300 text-lg ${!isEditable && 'bg-transparent'}`}
                            readOnly={!isEditable}
                        />
                        <textarea
                            value={invoice.client?.address || ''}
                            onChange={(e) => updateNestedField('client', 'address', e.target.value)}
                            placeholder="Client's Address..."
                            className={`w-full text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 resize-none h-20 placeholder:text-gray-300 ${!isEditable ? 'bg-transparent' : ''}`}
                            readOnly={!isEditable}
                        />
                    </div>
                </div>

                {/* Ship To - Render nicely if exists or editable */}
                {(isEditable || (invoice.shipTo && (invoice.shipTo.name || invoice.shipTo.address))) && (
                    <div>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ship To</label>
                        </div>
                        <div className="space-y-1">
                            <input
                                type="text"
                                value={invoice.shipTo?.name || ''}
                                onChange={(e) => updateNestedField('shipTo', 'name', e.target.value)}
                                placeholder="Recipient Name (Optional)"
                                className={`w-full font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300 text-lg ${!isEditable && 'bg-transparent'}`}
                                readOnly={!isEditable}
                            />
                            <textarea
                                value={invoice.shipTo?.address || ''}
                                onChange={(e) => updateNestedField('shipTo', 'address', e.target.value)}
                                placeholder="Shipping Address..."
                                className={`w-full text-sm text-gray-600 bg-transparent border-none p-0 focus:ring-0 resize-none h-20 placeholder:text-gray-300 ${!isEditable ? 'bg-transparent' : ''}`}
                                readOnly={!isEditable}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Line Items */}
            <div className="mb-10">
                {/* We need to pass readOnly to LineItems if we modify it, or just control it here */}
                <div className="overflow-hidden rounded-lg">
                    <table className="w-full text-sm">
                        <thead>
                            <tr
                                className="border-b"
                                style={{ backgroundColor: themeColors[invoice.theme || 'slate'].primary, borderColor: themeColors[invoice.theme || 'slate'].primary }}
                            >
                                <th className="text-left py-3 px-4 font-semibold text-white uppercase tracking-wider text-xs">Description</th>
                                <th className="text-right py-3 px-4 font-semibold text-white uppercase tracking-wider text-xs w-24">Qty</th>
                                <th className="text-right py-3 px-4 font-semibold text-white uppercase tracking-wider text-xs w-32">Rate</th>
                                <th className="text-right py-3 px-4 font-semibold text-white uppercase tracking-wider text-xs w-32">Amount</th>
                                {isEditable && <th className="w-10"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.lineItems && invoice.lineItems.map((item, index) => (
                                <tr key={item.id || index} className="group hover:bg-gray-50/50 transition-colors relative">
                                    <td className="py-4 px-4 text-gray-900 align-top">
                                        {isEditable ? (
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => {
                                                    if (!onChange) return;
                                                    const newItems = [...(invoice.lineItems || [])];
                                                    newItems[index] = { ...item, description: e.target.value };
                                                    onChange('lineItems', newItems);
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm resize-none font-medium text-gray-900 placeholder:text-gray-300 min-h-[1.5rem]"
                                                placeholder="Item description"
                                                rows={Math.max(1, (item.description?.split('\n').length || 1))}
                                                style={{ overflow: 'hidden' }}
                                            />
                                        ) : (
                                            <div className="py-2 font-medium text-gray-900 whitespace-pre-wrap">{item.description}</div>
                                        )}
                                    </td>
                                    <td className="text-right py-4 px-4 text-gray-600 align-top">
                                        {isEditable ? (
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    if (!onChange) return;
                                                    const newItems = [...(invoice.lineItems || [])];
                                                    newItems[index] = { ...item, quantity: parseFloat(e.target.value) || 0 };
                                                    onChange('lineItems', newItems);
                                                }}
                                                className="w-full text-right bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm text-gray-600"
                                                min="0"
                                            />
                                        ) : (
                                            <div className="py-2">{item.quantity}</div>
                                        )}
                                    </td>
                                    <td className="text-right py-4 px-4 text-gray-600 align-top">
                                        {isEditable ? (
                                            <div className="flex justify-end gap-1">
                                                <span className="text-gray-400">{currencySymbol}</span>
                                                <input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => {
                                                        if (!onChange) return;
                                                        const newItems = [...(invoice.lineItems || [])];
                                                        newItems[index] = { ...item, rate: parseFloat(e.target.value) || 0 };
                                                        onChange('lineItems', newItems);
                                                    }}
                                                    className="w-24 text-right bg-white border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary shadow-sm text-gray-600"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        ) : (
                                            <div className="py-2">{currencySymbol} {formatCurrency(item.rate || 0, invoice.currency || 'NGN')}</div>
                                        )}
                                    </td>
                                    <td className="text-right py-4 px-4 font-medium text-gray-900 align-top">
                                        <div className="py-2">{currencySymbol} {formatCurrency(item.amount, invoice.currency || 'USD')}</div>
                                    </td>
                                    {isEditable && (
                                        <td className="py-4 px-2 text-center align-top">
                                            <button
                                                onClick={() => {
                                                    if (!onChange) return;
                                                    if ((invoice.lineItems || []).length > 1) {
                                                        const newItems = (invoice.lineItems || []).filter((_, i) => i !== index);
                                                        onChange('lineItems', newItems);
                                                    } else {
                                                        const newItems = [...(invoice.lineItems || [])];
                                                        newItems[index] = { ...item, description: '', quantity: 0, rate: 0, amount: 0 };
                                                        onChange('lineItems', newItems);
                                                    }
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove Item"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {isEditable && (
                        <button
                            onClick={() => {
                                if (!onChange) return;
                                const newItems = [...(invoice.lineItems || []), { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }];
                                onChange('lineItems', newItems);
                            }}
                            className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 text-sm font-bold transition-all border-t border-gray-100 flex items-center justify-center gap-2 group"
                        >
                            <div className="w-6 h-6 rounded-full bg-gray-200 group-hover:bg-gray-300 flex items-center justify-center transition-colors">
                                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            Add Line Item
                        </button>
                    )}
                </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-12">
                <div className="w-full sm:w-1/2 lg:w-5/12 space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900">
                            {currencySymbol} {formatCurrency(invoice.subtotal || 0, invoice.currency || 'USD')}
                        </span>
                    </div>

                    {/* Discount */}
                    <div className="flex justify-between items-center text-sm text-gray-600 group/discount">
                        <div className="flex items-center gap-2">
                            <span>Discount</span>
                            {isEditable ? (
                                <>
                                    <input
                                        type="number"
                                        value={invoice.discountRate || 0}
                                        onChange={(e) => updateField('discountRate', parseFloat(e.target.value) || 0)}
                                        className="w-16 text-right bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-theme-primary shadow-sm"
                                        placeholder="0"
                                        min="0"
                                    />
                                    <span className="text-gray-400">%</span>
                                </>
                            ) : (
                                <span>({invoice.discountRate || 0}%)</span>
                            )}
                        </div>
                        <span className="text-red-500">
                            -{currencySymbol} {formatCurrency(invoice.discountAmount || 0, invoice.currency || 'USD')}
                        </span>
                    </div>

                    {/* Tax */}
                    <div className="flex justify-between items-center text-sm text-gray-600 group/tax">
                        <div className="flex items-center gap-2">
                            <span>Tax</span>
                            {isEditable ? (
                                <>
                                    <input
                                        type="number"
                                        value={invoice.taxRate || 0}
                                        onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                                        className="w-16 text-right bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-theme-primary shadow-sm"
                                        placeholder="0"
                                        min="0"
                                    />
                                    <span className="text-gray-400">%</span>
                                </>
                            ) : (
                                <span>({invoice.taxRate || 0}%)</span>
                            )}
                        </div>
                        <span className="font-medium text-gray-900">
                            {currencySymbol} {formatCurrency(invoice.taxAmount || 0, invoice.currency || 'USD')}
                        </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between items-center text-sm text-gray-600 group/shipping">
                        <div className="flex items-center gap-2">
                            <span>Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditable ? (
                                <>
                                    <span className="text-gray-400">{currencySymbol}</span>
                                    <input
                                        type="number"
                                        value={invoice.shipping || 0}
                                        onChange={(e) => updateField('shipping', parseFloat(e.target.value) || 0)}
                                        className="w-24 text-right bg-white border border-gray-200 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-theme-primary shadow-sm"
                                        placeholder="0"
                                        min="0"
                                    />
                                </>
                            ) : (
                                <span className="font-medium text-gray-900">{currencySymbol} {formatCurrency(invoice.shipping || 0, invoice.currency || 'NGN')}</span>
                            )}
                        </div>
                    </div>

                    {/* Total Due */}
                    <div className="border-t-2 border-gray-900 pt-4 mt-4 flex justify-between items-end">
                        <span className="text-base font-bold text-gray-900 uppercase tracking-wider">Total Due</span>
                        <span className="text-2xl font-bold text-theme-primary">
                            {currencySymbol} {formatCurrency(invoice.total || 0, invoice.currency || 'USD')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details / Bank Info</h4>
                    {isEditable ? (
                        <textarea
                            value={invoice.bankDetails || ''}
                            onChange={(e) => updateField('bankDetails', e.target.value)}
                            className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary placeholder:text-gray-300 min-h-[80px]"
                            placeholder="Add bank details, payment instructions..."
                        />
                    ) : (
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.bankDetails}</div>
                    )}
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h4>
                    {isEditable ? (
                        <textarea
                            value={invoice.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value)}
                            className="w-full text-sm text-gray-600 bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary placeholder:text-gray-300 min-h-[80px]"
                            placeholder="Add notes, thank saveu message..."
                        />
                    ) : (
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</div>
                    )}
                </div>
                <div className="sm:col-span-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</h4>
                    {isEditable ? (
                        <textarea
                            value={invoice.terms || ''}
                            onChange={(e) => updateField('terms', e.target.value)}
                            className="w-full text-xs text-gray-500 bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-theme-primary focus:border-theme-primary placeholder:text-gray-300 min-h-[60px]"
                            placeholder="Add terms and conditions, late fees, etc..."
                        />
                    ) : (
                        <div className="text-xs text-gray-500 whitespace-pre-wrap">{invoice.terms}</div>
                    )}
                </div>
            </div>

            {/* Actions when Editable Only */}
            {isEditable && (
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 justify-end items-center no-print">
                    <button
                        onClick={onDownloadPDF}
                        className="py-3 px-8 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download PDF
                    </button>
                    {isPremium && (
                        <button
                            onClick={onSendInvoice}
                            className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Send Invoice
                        </button>
                    )}
                    <button
                        onClick={onSaveInvoice}
                        disabled={savingInvoice}
                        className="py-3 px-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-base"
                    >
                        {savingInvoice ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        )}
                        {savingInvoice ? 'Saving...' : 'Save Invoice'}
                    </button>
                </div>
            )}

            {/* Watermark / Brand */}
            <div className="mt-12 pt-6 border-t border-gray-50 text-center">
                <p className="text-xs text-gray-300 font-medium">Powered by Invoice Generator</p>
            </div>
        </div>
    );
}
