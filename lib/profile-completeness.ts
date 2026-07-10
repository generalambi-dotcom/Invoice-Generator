/**
 * Profile Completeness Calculator
 * 
 * Calculates a 0-100 score based on which profile fields are filled.
 * Each field has a weight representing its value for lead generation.
 */

import { getRegionConfig } from './regionalization';

export interface ProfileField {
  key: string;
  label: string;
  weight: number;
  category: 'basic' | 'business' | 'verification' | 'social';
  hint: string;
}

export function getProfileFields(currency: string = 'NGN'): ProfileField[] {
  const config = getRegionConfig(currency);
  
  return [
    // Basic (captured at signup/onboarding) - 25% total
    { key: 'name', label: 'Full Name', weight: 5, category: 'basic', hint: 'Your name appears on all invoices' },
    { key: 'email', label: 'Email', weight: 5, category: 'basic', hint: 'Required for account access' },
    { key: 'companyName', label: 'Company Name', weight: 8, category: 'basic', hint: 'Appears on all your invoices' },
    { key: 'phone', label: 'Phone Number', weight: 7, category: 'basic', hint: 'Helps clients reach you directly' },

    // Business Profile - 40% total
    { key: 'industry', label: 'Industry', weight: 10, category: 'business', hint: 'Get industry-specific invoice templates' },
    { key: 'businessType', label: 'Business Type', weight: 8, category: 'business', hint: 'Helps format your tax information correctly' },
    { key: 'companySize', label: 'Company Size', weight: 5, category: 'business', hint: 'We\'ll recommend the right plan for your team' },
    { key: 'monthlyRevenueRange', label: 'Monthly Revenue', weight: 7, category: 'business', hint: 'Unlock personalised financial insights' },
    { key: 'yearFounded', label: 'Year Founded', weight: 3, category: 'business', hint: 'Get your business anniversary badge' },
    { key: 'address', label: 'Business Address', weight: 7, category: 'business', hint: 'Auto-fills on every invoice you create' },

    // Verification - 25% total (Regionalized)
    { key: 'cacNumber', label: config.registrationLabel, weight: 12, category: 'verification', hint: config.registrationHint },
    { key: 'tinNumber', label: config.taxIdLabel, weight: 13, category: 'verification', hint: config.taxIdHint },

    // Social / Web - 10% total
    { key: 'website', label: 'Website', weight: 4, category: 'social', hint: 'Link your website for client verification' },
    { key: 'linkedinUrl', label: 'LinkedIn', weight: 3, category: 'social', hint: 'Connect for business verification' },
    { key: 'instagramUrl', label: 'Instagram', weight: 2, category: 'social', hint: 'Showcase your work to potential clients' },
    { key: 'logo', label: 'Company Logo', weight: 5, category: 'basic', hint: 'Make your invoices look professional' },
  ];
}

export const COMPLETENESS_TIERS = [
  { threshold: 100, label: 'Complete Profile', color: '#10b981', reward: 'Priority listing in the business directory', icon: '🏆' },
  { threshold: 80, label: 'Verified Business', color: '#3b82f6', reward: '"Verified Business" badge on all invoices', icon: '✅' },
  { threshold: 60, label: 'Active User', color: '#f59e0b', reward: 'Unlock basic financial dashboard insights', icon: '📊' },
  { threshold: 0, label: 'Getting Started', color: '#9ca3af', reward: 'Complete your profile to unlock rewards', icon: '🚀' },
];

export function extractProfileData(user: any, companyDefaults?: any): Record<string, boolean> {
  const companyInfo = companyDefaults?.companyInfo as any || {};

  return {
    name: !!user?.name?.trim(),
    email: !!user?.email?.trim(),
    companyName: !!companyInfo?.name?.trim(),
    phone: !!companyInfo?.phone?.trim() || !!user?.phone?.trim(),
    industry: !!user?.industry?.trim(),
    businessType: !!user?.businessType?.trim(),
    companySize: !!user?.companySize?.trim(),
    monthlyRevenueRange: !!user?.monthlyRevenueRange?.trim(),
    yearFounded: !!user?.yearFounded,
    address: !!companyInfo?.address?.trim(),
    cacNumber: !!user?.cacNumber?.trim(),
    tinNumber: !!user?.tinNumber?.trim(),
    website: !!companyInfo?.website?.trim(),
    linkedinUrl: !!user?.linkedinUrl?.trim(),
    instagramUrl: !!user?.instagramUrl?.trim(),
    logo: !!companyInfo?.logo,
  };
}

export function calculateCompleteness(profileData: Record<string, boolean>, currency: string = 'NGN'): number {
  const fields = getProfileFields(currency);
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const filledWeight = fields.reduce((sum, f) => {
    return sum + (profileData[f.key] ? f.weight : 0);
  }, 0);

  return Math.round((filledWeight / totalWeight) * 100);
}

export function getCurrentTier(score: number) {
  return COMPLETENESS_TIERS.find(tier => score >= tier.threshold) || COMPLETENESS_TIERS[COMPLETENESS_TIERS.length - 1];
}

export function getNextTier(score: number) {
  const sortedTiers = [...COMPLETENESS_TIERS].sort((a, b) => a.threshold - b.threshold);
  return sortedTiers.find(tier => tier.threshold > score);
}

export function getMissingFields(profileData: Record<string, boolean>, currency: string = 'NGN'): ProfileField[] {
  return getProfileFields(currency)
    .filter(f => !profileData[f.key])
    .sort((a, b) => b.weight - a.weight);
}

export function getNudgeSuggestion(
  profileData: Record<string, boolean>,
  context: {
    invoiceCount?: number;
    hasUsedVat?: boolean;
    hasClients?: boolean;
    firstInvoiceCreated?: boolean;
    currency?: string;
  }
): { field: ProfileField; message: string } | null {
  const currency = context.currency || 'NGN';
  const config = getRegionConfig(currency);
  const missing = getMissingFields(profileData, currency);
  
  if (missing.length === 0) return null;

  if (context.firstInvoiceCreated && !profileData.cacNumber) {
    const field = missing.find(f => f.key === 'cacNumber');
    if (field) return { field, message: config.registrationHint };
  }

  if (context.invoiceCount && context.invoiceCount >= 5 && !profileData.monthlyRevenueRange) {
    const field = missing.find(f => f.key === 'monthlyRevenueRange');
    if (field) return { field, message: 'You\'re growing! Add your revenue range to unlock financial insights' };
  }

  if (context.hasClients && !profileData.industry) {
    const field = missing.find(f => f.key === 'industry');
    if (field) return { field, message: 'What industry are you in? We\'ll suggest better invoice templates' };
  }

  if (context.hasUsedVat && !profileData.tinNumber) {
    const field = missing.find(f => f.key === 'tinNumber');
    if (field) return { field, message: config.taxIdHint };
  }

  return { field: missing[0], message: missing[0].hint };
}

export const INDUSTRY_OPTIONS = [
  'Technology & IT Services',
  'Consulting & Professional Services',
  'Retail & E-Commerce',
  'Construction & Real Estate',
  'Logistics & Transportation',
  'Agriculture & Agro-Processing',
  'Healthcare & Pharmaceuticals',
  'Education & Training',
  'Oil & Gas / Energy',
  'Fashion & Beauty',
  'Food & Hospitality',
  'Media & Entertainment',
  'Manufacturing',
  'Financial Services',
  'Legal Services',
  'Marketing & Advertising',
  'Other',
];

export const COMPANY_SIZE_OPTIONS = [
  { value: '1-5', label: 'Just me (1-5)' },
  { value: '6-20', label: 'Small team (6-20)' },
  { value: '21-50', label: 'Growing (21-50)' },
  { value: '51-200', label: 'Mid-size (51-200)' },
  { value: '200+', label: 'Enterprise (200+)' },
];
