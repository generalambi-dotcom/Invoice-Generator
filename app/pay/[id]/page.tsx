'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
// Payment page for customers

export default function PaymentPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoice();
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (provider: 'paystack' | 'paypal' | 'stripe') => {
    if (!invoice) return;

    setProcessing(true);
    setError('');

    try {
      // Initialize payment based on provider
      if (provider === 'paystack') {
        // Load Paystack script and initialize
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => {
          // Get payment credentials from invoice
          // In production, this would come from the API
          const handler = (window as any).PaystackPop.setup({
            key: invoice.paymentProviderPublicKey, // This would come from API
            email: invoice.clientInfo.email,
            amount: invoice.total * 100, // Convert to kobo/pesewas
            currency: invoice.currency === 'NGN' ? 'NGN' : 'USD',
            ref: `invoice_${invoice.id}_${Date.now()}`,
            metadata: {
              invoiceId: invoice.id,
            },
            callback: async (response: any) => {
              // Verify payment on backend
              const verifyResponse = await fetch(`/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  provider: 'paystack',
                  reference: response.reference,
                  invoiceId: invoice.id,
                }),
              });

              if (verifyResponse.ok) {
                window.location.href = `/pay/${invoiceId}/success`;
              } else {
                setError('Payment verification failed');
              }
            },
            onClose: () => {
              setProcessing(false);
            },
          });
          handler.openIframe();
        };
        document.body.appendChild(script);
      } else if (provider === 'stripe') {
        // Stripe payment initialization
        // Similar implementation
      } else if (provider === 'paypal') {
        // PayPal payment initialization
        // Similar implementation
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading invoice...</div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay Invoice</h1>
          <p className="text-gray-600 mb-6">Invoice #{invoice.invoiceNumber}</p>

          {/* Invoice Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Amount Due</span>
              <span className="text-3xl font-bold text-gray-900">
                {invoice.currency === 'NGN' ? '₦' : '$'} {invoice.total.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Payment Methods */}
          {invoice.paymentProvider && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
              <div className="space-y-3">
                {invoice.paymentProvider === 'paystack' && (
                  <button
                    onClick={() => handlePayment('paystack')}
                    disabled={processing}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? 'Processing...' : 'Pay with Paystack'}
                  </button>
                )}
                {invoice.paymentProvider === 'stripe' && (
                  <button
                    onClick={() => handlePayment('stripe')}
                    disabled={processing}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? 'Processing...' : 'Pay with Stripe'}
                  </button>
                )}
                {invoice.paymentProvider === 'paypal' && (
                  <button
                    onClick={() => handlePayment('paypal')}
                    disabled={processing}
                    className="w-full px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {processing ? 'Processing...' : 'Pay with PayPal'}
                  </button>
                )}
              </div>
            </div>
          )}

          {!invoice.paymentProvider && (
            <div className="text-center py-8 text-gray-500">
              No payment method configured for this invoice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

