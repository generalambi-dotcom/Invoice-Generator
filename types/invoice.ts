export type Theme = 'slate' | 'blue' | 'green' | 'purple' | 'red';

export type Currency = 'GBP' | 'USD' | 'EUR' | 'JPY' | 'CAD' | 'AUD' | 'NGN';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logo?: string; // Base64 encoded image
}

export interface ClientInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
}

export interface ShipToInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  purchaseOrder?: string;
  company: CompanyInfo;
  client: ClientInfo;
  shipTo?: ShipToInfo;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  shipping: number;
  total: number;
  currency: Currency;
  theme: Theme;
  notes?: string;
  bankDetails?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  paymentLink?: string;
  paymentProvider?: 'paypal' | 'paystack';
  paidAmount?: number;
}

export interface CompanyDefaults {
  company: CompanyInfo;
  defaultCurrency: Currency;
  defaultTheme: Theme;
  defaultTaxRate: number;
  defaultNotes?: string;
  defaultBankDetails?: string;
  defaultTerms?: string;
}

export const currencySymbols: Record<Currency, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  NGN: '₦',
};

export const themeColors: Record<Theme, { primary: string; primaryDark: string; primaryLight: string }> = {
  slate: {
    primary: '#475569',
    primaryDark: '#334155',
    primaryLight: '#64748b',
  },
  blue: {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',
  },
  green: {
    primary: '#16a34a',
    primaryDark: '#15803d',
    primaryLight: '#22c55e',
  },
  purple: {
    primary: '#9333ea',
    primaryDark: '#7e22ce',
    primaryLight: '#a855f7',
  },
  red: {
    primary: '#dc2626',
    primaryDark: '#b91c1c',
    primaryLight: '#ef4444',
  },
};

