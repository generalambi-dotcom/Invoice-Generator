export interface RegionConfig {
  registrationLabel: string;
  registrationHint: string;
  taxIdLabel: string;
  taxIdHint: string;
  revenueRanges: { value: string; label: string }[];
  businessTypes: { value: string; label: string }[];
}

export function getRegionConfig(currency: string = 'USD'): RegionConfig {
  const normalizedCurrency = currency.toUpperCase();

  switch (normalizedCurrency) {
    case 'GBP':
      return {
        registrationLabel: 'Companies House Number',
        registrationHint: 'Add your Companies House number to look more professional on invoices',
        taxIdLabel: 'VAT Number',
        taxIdHint: 'Auto-populate VAT invoices instantly',
        revenueRanges: [
          { value: 'under_50k', label: 'Under £50,000' },
          { value: '50k_200k', label: '£50,000 - £200,000' },
          { value: '200k_1m', label: '£200,000 - £1,000,000' },
          { value: '1m_5m', label: '£1,000,000 - £5,000,000' },
          { value: 'over_5m', label: 'Over £5,000,000' }
        ],
        businessTypes: [
          { value: 'sole_trader', label: 'Sole Trader / Freelancer' },
          { value: 'partnership', label: 'Partnership' },
          { value: 'ltd', label: 'Private Limited Company (Ltd)' },
          { value: 'plc', label: 'Public Limited Company (PLC)' },
          { value: 'charity', label: 'Charity / Non-Profit' },
          { value: 'government', label: 'Government Body' },
        ]
      };
      
    case 'NGN':
      return {
        registrationLabel: 'CAC/RC Number',
        registrationHint: 'Earn a "Verified Business" badge on invoices',
        taxIdLabel: 'Tax ID (TIN)',
        taxIdHint: 'Auto-populate VAT invoices instantly',
        revenueRanges: [
          { value: 'under_500k', label: 'Under ₦500,000' },
          { value: '500k_2m', label: '₦500,000 - ₦2,000,000' },
          { value: '2m_10m', label: '₦2,000,000 - ₦10,000,000' },
          { value: '10m_50m', label: '₦10,000,000 - ₦50,000,000' },
          { value: '50m_100m', label: '₦50,000,000 - ₦100,000,000' },
          { value: 'over_100m', label: 'Over ₦100,000,000' },
        ],
        businessTypes: [
          { value: 'sole_proprietor', label: 'Business Name / Freelancer' },
          { value: 'partnership', label: 'Partnership' },
          { value: 'ltd', label: 'Private Limited Company (Ltd)' },
          { value: 'plc', label: 'Public Limited Company (PLC)' },
          { value: 'ngo', label: 'NGO / Non-Profit' },
          { value: 'government', label: 'Government Agency' },
        ]
      };

    case 'USD':
      return {
        registrationLabel: 'EIN / State Registration',
        registrationHint: 'Add your business registration to look more professional',
        taxIdLabel: 'Tax ID (SSN/EIN)',
        taxIdHint: 'Required for compliant invoices',
        revenueRanges: [
          { value: 'under_50k', label: 'Under $50,000' },
          { value: '50k_250k', label: '$50,000 - $250,000' },
          { value: '250k_1m', label: '$250,000 - $1,000,000' },
          { value: '1m_5m', label: '$1,000,000 - $5,000,000' },
          { value: 'over_5m', label: 'Over $5,000,000' }
        ],
        businessTypes: [
          { value: 'sole_proprietor', label: 'Sole Proprietor / Freelancer' },
          { value: 'partnership', label: 'General Partnership' },
          { value: 'llc', label: 'Limited Liability Company (LLC)' },
          { value: 's_corp', label: 'S-Corporation' },
          { value: 'c_corp', label: 'C-Corporation' },
          { value: 'non_profit', label: 'Non-Profit 501(c)(3)' },
        ]
      };

    default:
      // Generic fallback
      return {
        registrationLabel: 'Business Registration ID',
        registrationHint: 'Add your business registration to look professional',
        taxIdLabel: 'Tax ID / VAT',
        taxIdHint: 'Add your tax identification number',
        revenueRanges: [
          { value: 'under_50k', label: 'Under 50,000' },
          { value: '50k_250k', label: '50,000 - 250,000' },
          { value: '250k_1m', label: '250,000 - 1,000,000' },
          { value: '1m_5m', label: '1,000,000 - 5,000,000' },
          { value: 'over_5m', label: 'Over 5,000,000' }
        ],
        businessTypes: [
          { value: 'sole_proprietor', label: 'Sole Proprietor / Freelancer' },
          { value: 'partnership', label: 'Partnership' },
          { value: 'llc', label: 'Limited Liability Company' },
          { value: 'ltd', label: 'Limited Company' },
          { value: 'non_profit', label: 'Non-Profit / NGO' },
        ]
      };
  }
}
