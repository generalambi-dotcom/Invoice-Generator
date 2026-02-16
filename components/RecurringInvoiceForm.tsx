'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LineItems from './LineItems';
import { LineItem, ClientInfo, CompanyInfo, Currency, currencySymbols } from '@/types/invoice';
import { calculateSubtotal, calculateTax, calculateDiscount, calculateTotal, formatCurrency } from '@/lib/calculations';
import Link from 'next/link';

interface RecurringInvoiceFormProps {
    initialData?: any;
    isEditing?: boolean;
}

// Fallback currency symbols in case of import failure
const safeCurrencySymbols: Record<string, string> = currencySymbols || {
    GBP: '£',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    NGN: '₦',
    ZAR: 'R',
    KES: 'KSh',
    GHS: '₵',
    AED: 'د.إ',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
};

export default function RecurringInvoiceForm({ initialData, isEditing = false }: RecurringInvoiceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Schedule State
    // Schedule State
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [frequency, setFrequency] = useState(initialData?.frequency || 'monthly');
    const [interval, setInterval] = useState(initialData?.interval || 1);

    // Initialize dates as empty strings to avoid hydration mismatch
    // Set defaults in useEffect
    const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
    const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');

    const [autoApprove, setAutoApprove] = useState(initialData?.autoApprove || false);
    const [maxInvoices, setMaxInvoices] = useState(initialData?.maxInvoices || '');

    // Invoice Data State
    const [currency, setCurrency] = useState<Currency>(initialData?.invoiceData?.currency || 'USD');
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialData?.invoiceData?.companyInfo || {
        name: '', address: '', city: '', state: '', zip: '', country: '', phone: '', email: '', website: ''
    });
    const [clientInfo, setClientInfo] = useState<ClientInfo>(initialData?.invoiceData?.clientInfo || {
        name: '', address: '', city: '', state: '', zip: '', country: '', phone: '', email: ''
    });
    const [lineItems, setLineItems] = useState<LineItem[]>(initialData?.invoiceData?.lineItems || []);
    const [notes, setNotes] = useState(initialData?.invoiceData?.notes || '');
    const [terms, setTerms] = useState(initialData?.invoiceData?.terms || '');

    // Tax & Discount
    const [taxRate, setTaxRate] = useState(initialData?.invoiceData?.taxRate || 0);
    const [discountRate, setDiscountRate] = useState(initialData?.invoiceData?.discountRate || 0);
    const [shipping, setShipping] = useState(initialData?.invoiceData?.shipping || 0);

    // Clients for dropdown
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        fetchClients();
        if (!isEditing) {
            fetchDefaults();
            // Set default start date only on client side to avoid hydration mismatch
            if (!startDate) {
                setStartDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients');
            if (res.ok) {
                const data = await res.json();
                // API returns { clients: [] }, so we need to access the property
                // defaulting to empty array to prevent map errors
                setClients(Array.isArray(data.clients) ? data.clients : []);
            }
        } catch (err) {
            console.error('Error fetching clients:', err);
            setClients([]); // Ensure it's always an array
        }
    };

    const fetchDefaults = async () => {
        try {
            const res = await fetch('/api/company-defaults');
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    if (data.companyInfo) setCompanyInfo(data.companyInfo);
                    if (data.defaultCurrency) setCurrency(data.defaultCurrency);
                    if (data.defaultTaxRate) setTaxRate(data.defaultTaxRate);
                    if (data.defaultTerms) setTerms(data.defaultTerms);
                    if (data.defaultNotes) setNotes(data.defaultNotes);
                }
            }
        } catch (err) {
            console.error('Error fetching defaults:', err);
        }
    };

    const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        if (!clientId) return;

        const client = clients.find(c => c.id === clientId);
        if (client) {
            setClientInfo({
                name: client.name,
                email: client.email || '',
                phone: client.phone || '',
                address: client.address || '',
                city: client.city || '',
                state: client.state || '',
                zip: client.zip || '',
                country: client.country || '',
            });
        }
    };

    // Calculations
    const subtotal = calculateSubtotal(lineItems);
    const taxAmount = calculateTax(subtotal, taxRate);
    const discountAmount = calculateDiscount(subtotal, discountRate);
    const total = calculateTotal(subtotal, taxAmount, discountAmount, shipping);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const invoiceData = {
            companyInfo,
            clientInfo,
            lineItems,
            subtotal,
            taxRate,
            taxAmount,
            discountRate,
            discountAmount,
            shipping,
            total,
            currency,
            notes,
            terms,
        };

        const payload = {
            name,
            description,
            frequency,
            interval: Number(interval),
            startDate,
            endDate: endDate || null,
            maxInvoices: maxInvoices ? Number(maxInvoices) : null,
            autoApprove,
            invoiceData,
        };

        try {
            const url = isEditing && initialData?.id
                ? `/api/recurring-invoices/${initialData.id}`
                : '/api/recurring-invoices';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to save recurring invoice');
            }

            router.push('/recurring');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Settings */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Schedule Settings</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Define how often this invoice should be generated.
                        </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700">Profile Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g. Monthly Web Hosting"
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Interval</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        Every
                                    </span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={interval}
                                        onChange={(e) => setInterval(parseInt(e.target.value))}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                                    />
                                    <span className="ml-2 inline-flex items-center text-sm text-gray-500">
                                        {frequency}(s)
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div className="col-span-6">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="autoApprove"
                                            name="autoApprove"
                                            type="checkbox"
                                            checked={autoApprove}
                                            onChange={(e) => setAutoApprove(e.target.checked)}
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="autoApprove" className="font-medium text-gray-700">Auto-approve invoices</label>
                                        <p className="text-gray-500">Automatically mark generated invoices as "Approved" so they can be sent or paid immediately.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice Details</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            The content that will be generated for each invoice.
                        </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">

                        {/* Client Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Client (Optional)</label>
                            <select
                                onChange={handleClientSelect}
                                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">-- Select a client to autofill --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                                <input
                                    type="text"
                                    required
                                    value={clientInfo.name}
                                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700">Client Email</label>
                                <input
                                    type="email"
                                    value={clientInfo.email}
                                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    {Object.keys(safeCurrencySymbols).map((code) => (
                                        <option key={code} value={code}>
                                            {code} ({safeCurrencySymbols[code]})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-base font-medium text-gray-900 mb-4">Line Items</h4>
                            <LineItems
                                lineItems={lineItems}
                                onUpdate={setLineItems}
                                currency={currency}
                                currencySymbol={safeCurrencySymbols[currency] || '$'}
                            />
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end pt-6">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">{safeCurrencySymbols[currency] || '$'} {formatCurrency(subtotal, currency)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Tax (%)</span>
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                        className="w-16 p-1 text-right text-sm border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax Amount</span>
                                    <span className="font-medium">{safeCurrencySymbols[currency] || '$'} {formatCurrency(taxAmount, currency)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Discount (%)</span>
                                    <input
                                        type="number"
                                        value={discountRate}
                                        onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                                        className="w-16 p-1 text-right text-sm border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex justify-between text-base font-bold pt-2 border-t text-gray-900">
                                    <span>Total</span>
                                    <span>{safeCurrencySymbols[currency] || '$'} {formatCurrency(total, currency)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Link
                    href="/recurring"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Recurring Profile'}
                </button>
            </div>

        </form>
    );
}
