export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  duration: 'monthly' | 'yearly';
}

export interface PaymentConfig {
  paypalClientId?: string;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
  stripePublicKey?: string;
  stripeSecretKey?: string;
}

export interface PaymentLink {
  invoiceId: string;
  provider: 'paypal' | 'paystack' | 'stripe';
  link: string;
  createdAt: string;
}

