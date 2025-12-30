'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

function PaymentPageContent() {
  const params = useParams();
  const router = useRouter();
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
      
      // Load payment history if invoice exists
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

    // Redirect to payment link
    window.location.href = invoice.paymentLink;
  };

  const calculateOutstanding = () => {
    if (!invoice) return 0;
    const total = invoice.total || 0;
    const paid = invoice.paidAmount || 0;
    return Math.max(0, total - paid);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const outstanding = calculateOutstanding();
  const isPaid = invoice.paymentStatus === 'paid' || outstanding === 0;
  const isPartiallyPaid = (invoice.paidAmount || 0) > 0 && outstanding > 0;

  // Format currency
  const currencySymbol = invoice.currency === 'NGN' ? '₦' : 
                         invoice.currency === 'GBP' ? '£' :
                         invoice.currency === 'EUR' ? '€' :
                         invoice.currency === 'JPY' ? '¥' :
                         invoice.currency === 'CAD' ? 'C$' :
                         invoice.currency === 'AUD' ? 'A$' : '$';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Payment</h1>
          <p className="text-gray-600 mt-1">Invoice #{invoice.invoiceNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
              
              {/* Company Info */}
              {invoice.companyInfo && typeof invoice.companyInfo === 'object' && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">From:</div>
                  <div className="text-sm text-gray-600">
                    {(invoice.companyInfo as any).name && <div className="font-medium">{(invoice.companyInfo as any).name}</div>}
                    {(invoice.companyInfo as any).address && <div>{(invoice.companyInfo as any).address}</div>}
                    {(invoice.companyInfo as any).city && (invoice.companyInfo as any).state && (
                      <div>{(invoice.companyInfo as any).city}, {(invoice.companyInfo as any).state} {(invoice.companyInfo as any).zip}</div>
                    )}
                    {(invoice.companyInfo as any).email && <div className="mt-1">{(invoice.companyInfo as any).email}</div>}
                  </div>
                </div>
              )}

              {/* Client Info */}
              {invoice.clientInfo && typeof invoice.clientInfo === 'object' && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Bill To:</div>
                  <div className="text-sm text-gray-600">
                    {(invoice.clientInfo as any).name && <div className="font-medium">{(invoice.clientInfo as any).name}</div>}
                    {(invoice.clientInfo as any).address && <div>{(invoice.clientInfo as any).address}</div>}
                    {(invoice.clientInfo as any).city && (invoice.clientInfo as any).state && (
                      <div>{(invoice.clientInfo as any).city}, {(invoice.clientInfo as any).state} {(invoice.clientInfo as any).zip}</div>
                    )}
                    {(invoice.clientInfo as any).email && <div className="mt-1">{(invoice.clientInfo as any).email}</div>}
                  </div>
                </div>
              )}

              {/* Line Items */}
              {invoice.lineItems && Array.isArray(invoice.lineItems) && invoice.lineItems.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Items:</div>
                  <div className="space-y-2">
                    {invoice.lineItems.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.description || 'Item'}</div>
                          <div className="text-gray-500 text-xs">
                            {item.quantity} × {currencySymbol}{item.rate?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div className="text-gray-900 font-medium">
                          {currencySymbol}{item.amount?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{invoice.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{currencySymbol}{invoice.taxAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span>-{currencySymbol}{invoice.discountAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                {invoice.shipping > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>{currencySymbol}{invoice.shipping?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{currencySymbol}{invoice.total?.toFixed(2) || '0.00'}</span>
                </div>
                {isPartiallyPaid && (
                  <div className="flex justify-between text-sm text-gray-600 pt-1">
                    <span>Paid:</span>
                    <span>{currencySymbol}{invoice.paidAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                {outstanding > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-orange-600 pt-1">
                    <span>Outstanding:</span>
                    <span>{currencySymbol}{outstanding.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                {invoice.invoiceDate && (
                  <div>Invoice Date: {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</div>
                )}
                {invoice.dueDate && (
                  <div>Due Date: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</div>
                )}
              </div>
            </div>

            {/* Payment History */}
            {paymentHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
                <div className="space-y-3">
                  {paymentHistory.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {currencySymbol}{payment.amount?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd, yyyy HH:mm') : 'Pending'}
                        </div>
                      </div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              {isPaid ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Paid</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This invoice has been fully paid.
                  </p>
                  {invoice.paymentDate && (
                    <p className="text-xs text-gray-500">
                      Paid on {format(new Date(invoice.paymentDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {currencySymbol}{outstanding.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Amount Due</div>
                    {invoice.dueDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                      {error}
                    </div>
                  )}

                  {invoice.paymentLink ? (
                    <div className="space-y-4">
                      <button
                        onClick={handlePayment}
                        disabled={processing || outstanding === 0}
                        className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center gap-2"
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h2z" />
                            </svg>
                            Pay Now
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-2">Payment via</div>
                        <div className="text-sm font-medium text-gray-700 capitalize">
                          {invoice.paymentProvider || 'Payment Gateway'}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          You will be redirected to a secure payment page to complete your payment.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">No payment method configured</p>
                      <p className="text-xs text-gray-500">
                        Please contact the invoice sender to set up payment options.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Additional Info */}
              {invoice.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}

              {invoice.terms && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h4>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
