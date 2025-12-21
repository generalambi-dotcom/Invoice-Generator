import { PaymentConfig } from '@/types/subscription';
import { getPaymentConfig } from './admin';

/**
 * Initialize payment for subscription upgrade
 */
export async function initiatePayment(params: {
  userId: string;
  plan: string;
  provider: 'paypal' | 'paystack';
  amount: number;
  currency: string;
  userEmail: string;
}): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Payment can only be initiated in the browser');
  }

  const config = getPaymentConfig();
  
  if (params.provider === 'paypal') {
    // PayPal integration
    // For now, we'll create a simple payment link
    // In production, you'd use PayPal SDK
    const paymentId = `paypal_${Date.now()}`;
    localStorage.setItem(`payment_${paymentId}`, JSON.stringify({
      userId: params.userId,
      plan: params.plan,
      amount: params.amount,
      currency: params.currency,
      provider: 'paypal',
      status: 'pending',
    }));
    
    // Return a placeholder URL - in production, this would be the actual PayPal checkout URL
    return `/payment/paypal?paymentId=${paymentId}`;
  } else if (params.provider === 'paystack') {
    // Paystack integration
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
    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email: params.userEmail,
      amount: params.amount * 100, // Convert to kobo/pesewas (smallest currency unit)
      currency: params.currency === 'NGN' ? 'NGN' : 'USD',
      ref: `invoice_${Date.now()}`,
      metadata: {
        userId: params.userId,
        plan: params.plan,
      },
      callback: (response: any) => {
        // Handle success
        handlePaymentSuccess(params.userId, params.plan, 'paystack', response);
        resolve('/dashboard?payment=success');
      },
      onClose: () => {
        reject(new Error('Payment window closed'));
      },
    });
    
    handler.openIframe();
  } catch (error: any) {
    reject(new Error('Failed to initialize Paystack: ' + error.message));
  }
}

/**
 * Handle payment success
 */
function handlePaymentSuccess(
  userId: string,
  plan: string,
  provider: 'paypal' | 'paystack',
  response: any
): void {
  // Update user subscription
  const { updateUserSubscription } = require('./admin');
  updateUserSubscription(userId, 'premium', 'active');
  
  // Store payment record
  const paymentRecord = {
    userId,
    plan,
    provider,
    amount: response.amount || 0,
    transactionRef: response.reference || response.id,
    status: 'completed',
    date: new Date().toISOString(),
  };
  
  const payments = JSON.parse(localStorage.getItem('invoice-payments') || '[]');
  payments.push(paymentRecord);
  localStorage.setItem('invoice-payments', JSON.stringify(payments));
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
    
    // Check premium subscription
    if (user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active') {
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

