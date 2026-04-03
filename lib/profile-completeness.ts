/**
 * Profile Completeness Calculator
 * 
 * Calculates a 0-100 score based on which profile fields are filled.
 * Each field has a weight representing its value for lead generation.
 */

export interface ProfileField {
  key: string;
  label: string;
  weight: number;
  category: 'basic' | 'business' | 'verification' | 'social';
  hint: string; // Value proposition shown to user
}

export const PROFILE_FIELDS: ProfileField[] = [
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

  // Verification - 25% total
  { key: 'cacNumber', label: 'CAC/RC Number', weight: 12, category: 'verification', hint: 'Earn a "Verified Business" badge on invoices' },
  { key: 'tinNumber', label: 'Tax ID (TIN)', weight: 13, category: 'verification', hint: 'Auto-populate VAT invoices instantly' },

  // Social / Web - 10% total
  { key: 'website', label: 'Website', weight: 4, category: 'social', hint: 'Link your website for client verification' },
  { key: 'linkedinUrl', label: 'LinkedIn', weight: 3, category: 'social', hint: 'Connect for business verification' },
  { key: 'instagramUrl', label: 'Instagram', weight: 2, category: 'social', hint: 'Showcase your work to potential clients' },
  { key: 'logo', label: 'Company Logo', weight: 5, category: 'basic', hint: 'Make your invoices look professional' },
];

export const COMPLETENESS_TIERS = [
  {
    threshold: 100,
    label: 'Complete Profile',
    color: '#10b981', // emerald
    reward: 'Priority listing in the business directory',
    icon: '🏆',
  },
  {
    threshold: 80,
    label: 'Verified Business',
    color: '#3b82f6', // blue
    reward: '"Verified Business" badge on all invoices',
    icon: '✅',
  },
  {
    threshold: 60,
    label: 'Active User',
    color: '#f59e0b', // amber
    reward: 'Unlock basic financial dashboard insights',
    icon: '📊',
  },
  {
    threshold: 0,
    label: 'Getting Started',
    color: '#9ca3af', // gray
    reward: 'Complete your profile to unlock rewards',
    icon: '🚀',
  },
];

/**
 * Extracts profile data from a user + companyDefaults object
 * and returns a flat map of field key -> boolean (filled or not)
 */
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

/**
 * Calculate profile completeness score (0-100)
 */
export function calculateCompleteness(profileData: Record<string, boolean>): number {
  const totalWeight = PROFILE_FIELDS.reduce((sum, f) => sum + f.weight, 0);
  const filledWeight = PROFILE_FIELDS.reduce((sum, f) => {
    return sum + (profileData[f.key] ? f.weight : 0);
  }, 0);

  return Math.round((filledWeight / totalWeight) * 100);
}

/**
 * Get the current tier based on completeness score
 */
export function getCurrentTier(score: number) {
  return COMPLETENESS_TIERS.find(tier => score >= tier.threshold) || COMPLETENESS_TIERS[COMPLETENESS_TIERS.length - 1];
}

/**
 * Get the next tier to reach
 */
export function getNextTier(score: number) {
  const sortedTiers = [...COMPLETENESS_TIERS].sort((a, b) => a.threshold - b.threshold);
  return sortedTiers.find(tier => tier.threshold > score);
}

/**
 * Get list of unfilled fields, sorted by weight (highest value first)
 */
export function getMissingFields(profileData: Record<string, boolean>): ProfileField[] {
  return PROFILE_FIELDS
    .filter(f => !profileData[f.key])
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Get a contextual nudge suggestion based on user activity
 */
export function getNudgeSuggestion(
  profileData: Record<string, boolean>,
  context: {
    invoiceCount?: number;
    hasUsedVat?: boolean;
    hasClients?: boolean;
    firstInvoiceCreated?: boolean;
  }
): { field: ProfileField; message: string } | null {
  const missing = getMissingFields(profileData);
  if (missing.length === 0) return null;

  // Contextual suggestions based on user behavior
  if (context.firstInvoiceCreated && !profileData.cacNumber) {
    const field = missing.find(f => f.key === 'cacNumber');
    if (field) return { field, message: 'Add your CAC number to look more professional on invoices' };
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
    if (field) return { field, message: 'Add your TIN for automatic VAT compliance on all invoices' };
  }

  // Default: suggest the highest-weight missing field
  return { field: missing[0], message: missing[0].hint };
}

// Industry options
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

// Business type options
export const BUSINESS_TYPE_OPTIONS = [
  { value: 'sole_proprietor', label: 'Sole Proprietor / Freelancer' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'ltd', label: 'Private Limited Company (Ltd)' },
  { value: 'plc', label: 'Public Limited Company (PLC)' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'government', label: 'Government Agency' },
];

// Company size options
export const COMPANY_SIZE_OPTIONS = [
  { value: '1-5', label: 'Just me (1-5)' },
  { value: '6-20', label: 'Small team (6-20)' },
  { value: '21-50', label: 'Growing (21-50)' },
  { value: '51-200', label: 'Mid-size (51-200)' },
  { value: '200+', label: 'Enterprise (200+)' },
];

// Monthly revenue range options
export const REVENUE_RANGE_OPTIONS = [
  { value: 'under_500k', label: 'Under ₦500,000' },
  { value: '500k_2m', label: '₦500,000 - ₦2,000,000' },
  { value: '2m_10m', label: '₦2,000,000 - ₦10,000,000' },
  { value: '10m_50m', label: '₦10,000,000 - ₦50,000,000' },
  { value: '50m_100m', label: '₦50,000,000 - ₦100,000,000' },
  { value: 'over_100m', label: 'Over ₦100,000,000' },
];
