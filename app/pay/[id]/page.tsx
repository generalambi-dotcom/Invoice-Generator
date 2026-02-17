'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

function PaymentPageContent() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Invoice not found');
      }
      const data = await response.json();
      setInvoice(data.invoice);

      // Load payment history
      if (data.invoice?.id) {
        try {
          const historyResponse = await fetch(`/api/invoices/${invoiceId}/payments`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setPaymentHistory(historyData.payments || []);
          }
        } catch (err) {
          // Payment history is optional
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!invoice?.paymentLink) {
      setError('No payment link available for this invoice');
      return;
    }
    setProcessing(true);
    setError('');
    window.location.href = invoice.paymentLink;
  };

  const calculateOutstanding = () => {
    if (!invoice) return 0;
    return Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-[#1F4D45] mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading invoice...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const outstanding = calculateOutstanding();
  const isPaid = invoice.paymentStatus === 'paid' || outstanding === 0;
  const isPartiallyPaid = (invoice.paidAmount || 0) > 0 && outstanding > 0;
  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && !isPaid;

  const currencySymbol = invoice.currency === 'NGN' ? '₦' :
    invoice.currency === 'GBP' ? '£' :
      invoice.currency === 'EUR' ? '€' :
        invoice.currency === 'JPY' ? '¥' :
          invoice.currency === 'CAD' ? 'C$' :
            invoice.currency === 'AUD' ? 'A$' : '$';

  const companyName = typeof invoice.companyInfo === 'object' ? (invoice.companyInfo as any)?.name : '';
  const companyEmail = typeof invoice.companyInfo === 'object' ? (invoice.companyInfo as any)?.email : '';
  const userImage = invoice.user?.image;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
      {/* Branded Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {userImage ? (
                <img src={userImage} alt={companyName} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1F4D45] to-[#2D6A5F] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {companyName ? companyName.charAt(0).toUpperCase() : 'I'}
                  </span>
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 text-sm">{companyName || 'Invoice'}</div>
                <div className="text-xs text-gray-500">Invoice #{invoice.invoiceNumber}</div>
              </div>
            </div>
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isPaid
                ? 'bg-emerald-100 text-emerald-700'
                : isOverdue
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : isPartiallyPaid
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
              }`}>
              {isPaid ? '✓ Paid' : isOverdue ? 'Overdue' : isPartiallyPaid ? 'Partially Paid' : 'Outstanding'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {isPaid && (
        <div className="bg-emerald-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">This invoice has been fully paid</span>
              {invoice.paymentDate && (
                <span className="opacity-80">• {format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>
        </div>
      )}
      {isOverdue && !isPaid && (
        <div className="bg-red-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Payment overdue</span>
              <span className="opacity-80">• Was due {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1F4D45] to-[#2D6A5F] p-6 text-white">
                <div className="text-sm opacity-80 mb-1">{isPaid ? 'Amount Paid' : 'Amount Due'}</div>
                <div className="text-3xl font-bold tracking-tight">{currencySymbol}{(isPaid ? invoice.total : outstanding).toFixed(2)}</div>
                {!isPaid && invoice.dueDate && (
                  <div className="text-sm opacity-70 mt-2">Due {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}</div>
                )}
              </div>
              {isPartiallyPaid && (
                <div className="px-6 py-3 bg-amber-50 border-t border-amber-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-amber-700">Paid so far</span>
                    <span className="font-semibold text-amber-800">{currencySymbol}{invoice.paidAmount?.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 w-full bg-amber-200 rounded-full h-1.5">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((invoice.paidAmount || 0) / invoice.total) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Invoice Details
              </h2>

              {/* From / To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {invoice.companyInfo && typeof invoice.companyInfo === 'object' && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">From</div>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      {(invoice.companyInfo as any).name && <div className="font-semibold text-gray-900">{(invoice.companyInfo as any).name}</div>}
                      {(invoice.companyInfo as any).address && <div>{(invoice.companyInfo as any).address}</div>}
                      {(invoice.companyInfo as any).city && (invoice.companyInfo as any).state && (
                        <div>{(invoice.companyInfo as any).city}, {(invoice.companyInfo as any).state} {(invoice.companyInfo as any).zip}</div>
                      )}
                      {(invoice.companyInfo as any).email && <div className="text-[#1F4D45] mt-1">{(invoice.companyInfo as any).email}</div>}
                    </div>
                  </div>
                )}
                {invoice.clientInfo && typeof invoice.clientInfo === 'object' && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bill To</div>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      {(invoice.clientInfo as any).name && <div className="font-semibold text-gray-900">{(invoice.clientInfo as any).name}</div>}
                      {(invoice.clientInfo as any).address && <div>{(invoice.clientInfo as any).address}</div>}
                      {(invoice.clientInfo as any).city && (invoice.clientInfo as any).state && (
                        <div>{(invoice.clientInfo as any).city}, {(invoice.clientInfo as any).state} {(invoice.clientInfo as any).zip}</div>
                      )}
                      {(invoice.clientInfo as any).email && <div className="text-[#1F4D45] mt-1">{(invoice.clientInfo as any).email}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-100">
                {invoice.invoiceDate && (
                  <div className="bg-gray-50 rounded-lg px-4 py-2.5">
                    <div className="text-xs text-gray-400 font-medium">Invoice Date</div>
                    <div className="text-sm font-semibold text-gray-800">{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</div>
                  </div>
                )}
                {invoice.dueDate && (
                  <div className={`rounded-lg px-4 py-2.5 ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>Due Date</div>
                    <div className={`text-sm font-semibold ${isOverdue ? 'text-red-700' : 'text-gray-800'}`}>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</div>
                  </div>
                )}
                {invoice.purchaseOrder && (
                  <div className="bg-gray-50 rounded-lg px-4 py-2.5">
                    <div className="text-xs text-gray-400 font-medium">PO Number</div>
                    <div className="text-sm font-semibold text-gray-800">{invoice.purchaseOrder}</div>
                  </div>
                )}
              </div>

              {/* Line Items */}
              {invoice.lineItems && Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Line Items</div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                          <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                          <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                          <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoice.lineItems.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="py-3 px-4 text-gray-900">{item.description || 'Item'}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{currencySymbol}{item.rate?.toFixed(2) || '0.00'}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{currencySymbol}{item.amount?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm max-w-xs ml-auto">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{invoice.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span>{currencySymbol}{invoice.taxAmount?.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{currencySymbol}{invoice.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                {invoice.shipping > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>{currencySymbol}{invoice.shipping?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{currencySymbol}{invoice.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Payment History
                </h2>
                <div className="space-y-3">
                  {paymentHistory.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {currencySymbol}{payment.amount?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd, yyyy h:mm a') : 'Pending'}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${payment.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : payment.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {payment.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Action Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              {isPaid ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Fully Paid</h3>
                  <p className="text-sm text-gray-500">Thank you for your payment</p>
                  {invoice.paymentDate && (
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-500 mb-1">Amount to Pay</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {currencySymbol}{outstanding.toFixed(2)}
                    </div>
                    {invoice.dueDate && (
                      <div className={`text-xs mt-2 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {isOverdue ? 'Overdue since' : 'Due'} {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {invoice.paymentLink ? (
                    <div className="space-y-4">
                      <button
                        onClick={handlePayment}
                        disabled={processing || outstanding === 0}
                        className="w-full px-6 py-4 bg-[#1F4D45] text-white rounded-xl hover:bg-[#163832] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#1F4D45]/20 hover:shadow-xl hover:shadow-[#1F4D45]/30 hover:-translate-y-0.5"
                      >
                        {processing ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Pay Now
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-1">Secure payment via</div>
                        <div className="text-sm font-medium text-gray-600 capitalize">
                          {invoice.paymentProvider || 'Payment Gateway'}
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure & encrypted payment
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Online payment not available</p>
                      <p className="text-xs text-gray-400">
                        Contact {companyEmail || 'the sender'} for payment options.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Notes & Terms */}
              {invoice.notes && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h4>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
              )}

              {invoice.bankDetails && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bank Details</h4>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono">{invoice.bankDetails}</p>
                </div>
              )}

              {invoice.terms && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Terms</h4>
                  <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-400 pb-8">
          <p>Powered by <span className="font-medium text-gray-500">InvoiceGenerator.ng</span></p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-[#1F4D45] mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
