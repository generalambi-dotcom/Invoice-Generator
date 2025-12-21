/**
 * Payment Link Generation
 * Creates actual payment links with Paystack, PayPal, and Stripe
 */

import axios from 'axios';
import { Invoice, PaymentCredential } from '@prisma/client';
import { retryWithBackoff, formatErrorMessage } from './error-handler';

interface CreatePaymentLinkParams {
  invoice: Invoice & { user: { email: string; name: string } };
  provider: 'paypal' | 'paystack' | 'stripe';
  credential: PaymentCredential;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function createPaymentLink({
  invoice,
  provider,
  credential,
}: CreatePaymentLinkParams): Promise<string> {
  try {
    switch (provider) {
      case 'paystack':
        return await createPaystackLink(invoice, credential);
      
      case 'stripe':
        return await createStripeLink(invoice, credential);
      
      case 'paypal':
        return await createPayPalLink(invoice, credential);
      
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  } catch (error: any) {
    console.error(`Error creating ${provider} payment link:`, error);
    // Provide more detailed error messages
    if (error.message) {
      throw error;
    }
    throw new Error(`Failed to create ${provider} payment link: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Create Paystack payment link
 */
async function createPaystackLink(
  invoice: Invoice & { user: { email: string } },
  credential: PaymentCredential
): Promise<string> {
  if (!credential.secretKey) {
    throw new Error('Paystack secret key is required');
  }

  // Convert amount to kobo (Paystack uses smallest currency unit)
  const amountInKobo = Math.round(invoice.total * 100);

  if (amountInKobo <= 0) {
    throw new Error('Invoice amount must be greater than zero');
  }

  try {
    const response = await retryWithBackoff(async () => {
      return await axios.post(
        'https://api.paystack.co/transaction/initialize',
      {
        email: invoice.user.email,
        amount: amountInKobo,
        reference: `INV-${invoice.id}-${Date.now()}`,
        currency: invoice.currency === 'NGN' ? 'NGN' : 'USD',
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: (invoice.clientInfo as any)?.name || (invoice.user as any)?.name || 'Customer',
        },
        callback_url: `${baseUrl}/pay/${invoice.id}/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${credential.secretKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
    }, {
      maxRetries: 2,
      retryDelay: 1000,
      retryable: (error: any) => error.response?.status >= 500 || error.code === 'ECONNABORTED',
    });

    if (response.data.status && response.data.data?.authorization_url) {
      return response.data.data.authorization_url;
    }

    throw new Error(response.data.message || 'Failed to create Paystack payment link');
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, 'creating Paystack payment link'));
  }
}

/**
 * Create Stripe payment link
 */
async function createStripeLink(
  invoice: Invoice & { user: { email: string } },
  credential: PaymentCredential
): Promise<string> {
  if (!credential.secretKey) {
    throw new Error('Stripe secret key is required');
  }

  // Convert amount to cents (Stripe uses smallest currency unit)
  const amountInCents = Math.round(invoice.total * 100);

  if (amountInCents <= 0) {
    throw new Error('Invoice amount must be greater than zero');
  }

  try {
    const response = await retryWithBackoff(async () => {
      // Stripe Payment Links API requires form-urlencoded format
      const params = new URLSearchParams({
      'line_items[0][price_data][currency]': invoice.currency.toLowerCase(),
      'line_items[0][price_data][product_data][name]': `Invoice ${invoice.invoiceNumber}`,
      'line_items[0][price_data][product_data][description]': `Payment for invoice ${invoice.invoiceNumber}`,
      'line_items[0][price_data][unit_amount]': amountInCents.toString(),
      'line_items[0][quantity]': '1',
      'metadata[invoiceId]': invoice.id,
      'metadata[invoiceNumber]': invoice.invoiceNumber,
      'after_completion[type]': 'redirect',
      'after_completion[redirect][url]': `${baseUrl}/pay/${invoice.id}/success`,
      });

      return await axios.post(
        'https://api.stripe.com/v1/payment_links',
        params.toString(),
        {
          headers: {
            Authorization: `Bearer ${credential.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000, // 10 second timeout
        }
      );
    }, {
      maxRetries: 2,
      retryDelay: 1000,
      retryable: (error: any) => error.response?.status >= 500 || error.code === 'ECONNABORTED',
    });

    if (response.data && response.data.url) {
      return response.data.url;
    }

    throw new Error('Failed to create Stripe payment link - no URL returned');
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, 'creating Stripe payment link'));
  }
}

/**
 * Create PayPal payment link using Orders API
 */
async function createPayPalLink(
  invoice: Invoice & { user: { email: string } },
  credential: PaymentCredential
): Promise<string> {
  if (!credential.clientId || !credential.clientSecret) {
    throw new Error('PayPal client ID and secret are required');
  }

  if (invoice.total <= 0) {
    throw new Error('Invoice amount must be greater than zero');
  }

  const paypalBaseUrl = credential.isTestMode
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  try {
    // Step 1: Get access token
    const authResponse = await retryWithBackoff(async () => {
      return await axios.post(
      `${paypalBaseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: credential.clientId!,
          password: credential.clientSecret!,
        },
        timeout: 10000,
      });
    }, {
      maxRetries: 2,
      retryDelay: 1000,
    });

    const accessToken = authResponse.data.access_token;
    if (!accessToken) {
      throw new Error('Failed to get PayPal access token');
    }

    // Step 2: Create PayPal order
    const orderResponse = await retryWithBackoff(async () => {
      return await axios.post(
      `${paypalBaseUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: invoice.id,
            description: `Invoice ${invoice.invoiceNumber}`,
            amount: {
              currency_code: invoice.currency || 'USD',
              value: invoice.total.toFixed(2),
            },
            invoice_id: invoice.invoiceNumber,
          },
        ],
        application_context: {
          brand_name: 'Invoice Generator.ng',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${baseUrl}/pay/${invoice.id}/success?provider=paypal`,
          cancel_url: `${baseUrl}/pay/${invoice.id}?cancelled=true`,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });
    }, {
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Find approval URL in links array
    const approvalLink = orderResponse.data.links?.find(
      (link: any) => link.rel === 'approve'
    );

    if (approvalLink?.href) {
      return approvalLink.href;
    }

    throw new Error('Failed to create PayPal order - no approval URL returned');
  } catch (error: any) {
    throw new Error(formatErrorMessage(error, 'creating PayPal payment link'));
  }
}
