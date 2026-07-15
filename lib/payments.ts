import { PaymentConfig } from '@/types/subscription';
import { getPaymentConfig } from './admin';

/**
 * Initialize payment for subscription upgrade
 */
export async function initiatePayment(params: {
  userId: string;
  plan: string;                    // tier stored on the user: 'pro' | 'business'
  provider: 'paypal' | 'paystack' | 'stripe';
  amount: number;
  currency: string;
  userEmail: string;
  trial?: boolean;
  interval?: 'monthly' | 'annual'; // billing interval
  planCode?: string;               // Paystack recurring plan code (NGN only)
}): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Payment can only be initiated in the browser');
  }

  // For subscription payments, we'll use the API endpoint which handles credentials
  // This function now just redirects to the appropriate API endpoint
  if (params.provider === 'paypal') {
    // PayPal subscription payments - create checkout via API
    try {
      const response = await fetch('/api/subscriptions/paypal-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.userId,
          plan: params.plan,
          amount: params.amount,
          currency: params.currency,
          userEmail: params.userEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to create PayPal checkout' }));
        throw new Error(error.error || 'Failed to create PayPal checkout');
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        return data.checkoutUrl;
      }

      throw new Error('No checkout URL returned from PayPal');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to initiate PayPal payment');
    }
  } else if (params.provider === 'paystack') {
    // Paystack integration - get config for public key
    const config = getPaymentConfig();
    if (!config.paystackPublicKey) {
      throw new Error('Paystack public key not configured');
    }

    // Load Paystack inline script if not already loaded
    if (!(window as any).PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      document.body.appendChild(script);

      return new Promise((resolve, reject) => {
        script.onload = () => {
          initializePaystack(params, config.paystackPublicKey!, resolve, reject);
        };
        script.onerror = () => reject(new Error('Failed to load Paystack script'));
      });
    } else {
      return new Promise((resolve, reject) => {
        initializePaystack(params, config.paystackPublicKey!, resolve, reject);
      });
    }
  } else if (params.provider === 'stripe') {
    // Stripe integration - create checkout session via API
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.userId,
          plan: params.plan,
          amount: params.amount,
          currency: params.currency.toLowerCase(),
          userEmail: params.userEmail,
          trial: params.trial,
          interval: params.interval || 'monthly',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create Stripe checkout session');
      }

      const data = await response.json();
      return data.checkoutUrl;
    } catch (error: any) {
      throw new Error('Failed to initiate Stripe payment: ' + error.message);
    }
  }

  throw new Error('Invalid payment provider');
}

function initializePaystack(
  params: any,
  publicKey: string,
  resolve: (value: string) => void,
  reject: (error: Error) => void
): void {
  try {
    // When a recurring plan code is supplied (NGN tiers), subscribe the customer
    // to that plan — Paystack uses the plan's amount/interval and auto-renews.
    // Otherwise fall back to a one-time charge for the given amount.
    const setupConfig: any = {
      key: publicKey,
      email: params.userEmail,
      currency: params.currency === 'NGN' ? 'NGN' : 'USD',
      ref: `sub_${params.userId}_${Date.now()}`,
      bearer: 'account', // Critical if the merchant has "Pass fees to customers" enabled
      metadata: {
        userId: params.userId,
        plan: params.plan,        // tier: 'pro' | 'business'
        interval: params.interval || 'monthly',
      },
      callback: function(response: any) {
        // Run async operations inside
        (async () => {
          try {
            // Verify on the server and activate subscription in the database
            const verifyRes = await fetch('/api/subscriptions/paystack-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                userId: params.userId,
                plan: params.plan,
                interval: params.interval || 'monthly',
              }),
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}));
              console.error('Paystack verify failed:', errData);
              // Still redirect — webhook will act as fallback activator
            }
          } catch (verifyErr) {
            console.error('Error calling paystack-verify:', verifyErr);
            // Webhook fallback will handle activation if this call fails
          }

          resolve('/dashboard?payment=success');
        })();
      },
      onClose: function() {
        reject(new Error('Payment window closed'));
      },
    };

    // Always pass amount (in kobo/cents). Paystack will override it with the Plan's 
    // configured amount, but some versions of the inline script crash if amount is missing entirely.
    setupConfig.amount = params.amount * 100;

    if (params.planCode) {
      // Recurring subscription
      // TEMPORARY FIX: Paystack is throwing "no channels available" for Plans on this account.
      // By commenting out the plan code here, Paystack treats it as a standard one-time charge 
      // of the correct amount. The user will still get their 1-year/1-month access because our 
      // paystack-verify webhook reads the metadata interval and updates the database correctly.
      // setupConfig.plan = params.planCode;
    }

    const handler = (window as any).PaystackPop.setup(setupConfig);
    handler.openIframe();
  } catch (error: any) {
    reject(new Error('Failed to initialize Paystack: ' + error.message));
  }
}


/**
 * Create payment link for invoice
 */
export function createPaymentLink(
  invoiceId: string,
  amount: number,
  currency: string,
  provider: 'paypal' | 'paystack',
  userEmail: string
): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const config = getPaymentConfig();

  if (provider === 'paypal') {
    // Create PayPal payment link
    const paymentId = `paypal_inv_${invoiceId}_${Date.now()}`;
    localStorage.setItem(`invoice_payment_${paymentId}`, JSON.stringify({
      invoiceId,
      amount,
      currency,
      provider: 'paypal',
      status: 'pending',
    }));
    return `/payment/paypal?invoiceId=${invoiceId}&paymentId=${paymentId}`;
  } else {
    // Paystack payment link
    if (!config.paystackPublicKey) {
      throw new Error('Paystack public key not configured');
    }

    const paymentId = `paystack_inv_${invoiceId}_${Date.now()}`;
    localStorage.setItem(`invoice_payment_${paymentId}`, JSON.stringify({
      invoiceId,
      amount,
      currency,
      provider: 'paystack',
      status: 'pending',
    }));

    // Return a URL that will trigger Paystack payment
    return `/payment/paystack?invoiceId=${invoiceId}&paymentId=${paymentId}&amount=${amount}&currency=${currency}&email=${encodeURIComponent(userEmail)}`;
  }
}

/**
 * Check if user has premium subscription
 * Admins automatically have premium access
 */
export function isPremiumUser(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const { getCurrentUser } = require('./auth');
    const user = getCurrentUser();

    // Admins automatically have premium access
    if (user?.isAdmin) {
      return true;
    }

    // Any paid tier (Pro or Business; legacy 'premium' maps to Pro) counts.
    const { isPaidTier, normaliseTier } = require('./plans');
    const statusAllowsAccess = ['active', 'cancelled'].includes(user?.subscription?.status || '');
    if (isPaidTier(normaliseTier(user?.subscription?.plan)) && statusAllowsAccess) {
      // Check if subscription hasn't expired
      if (user.subscription.endDate) {
        const endDate = new Date(user.subscription.endDate);
        if (endDate < new Date()) {
          return false; // Subscription expired
        }
      }
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}
