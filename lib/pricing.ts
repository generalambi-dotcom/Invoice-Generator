/**
 * Pricing utilities for fetching and managing subscription prices
 */

/**
 * Premium free-trial length in days. Single source of truth so trial
 * messaging stays consistent across the homepage, upgrade page, etc.
 * (There is no admin-configurable trial field; this centralises the value.)
 */
export const TRIAL_DAYS = 30;

/**
 * Detect user region based on various methods
 */
export function detectUserRegion(): 'nigeria' | 'rest-of-world' {
  if (typeof window === 'undefined') {
    return 'rest-of-world';
  }

  // Method 1: Check if stored in localStorage
  const storedRegion = localStorage.getItem('user-region');
  if (storedRegion === 'nigeria' || storedRegion === 'rest-of-world') {
    return storedRegion;
  }

  // Method 2: Check user's timezone. Nigeria's IANA zone is 'Africa/Lagos'.
  // NOTE: this is only a client-side hint used before the server responds — do
  // NOT match all of 'Africa/*' here, or every African visitor would be treated
  // as Nigerian. The authoritative decision is made server-side by IP in
  // /api/pricing; this just avoids a wrong first paint.
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone === 'Africa/Lagos') {
      return 'nigeria';
    }
  } catch (e) {
    // Ignore errors
  }

  // Method 3: IP geolocation is applied authoritatively server-side in
  // /api/pricing based on the request country.

  // Default to rest-of-world
  return 'rest-of-world';
}

/**
 * Fetch pricing from API based on region
 */
export async function getPricing(region?: 'nigeria' | 'rest-of-world'): Promise<{
  region: string;
  premiumPrice: number;
  currency: string;
  isActive: boolean;
}> {
  const detectedRegion = region || detectUserRegion();
  
  try {
    const response = await fetch(`/api/pricing?region=${detectedRegion}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pricing');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching pricing:', error);
    // Return default pricing on error
    return {
      region: detectedRegion,
      premiumPrice: detectedRegion === 'nigeria' ? 3000 : 9.99,
      currency: detectedRegion === 'nigeria' ? 'NGN' : 'USD',
      isActive: true,
    };
  }
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbols[currency] || currency;
  
  // Format based on currency
  if (currency === 'NGN') {
    return `${symbol}${amount.toLocaleString('en-NG')}`;
  }
  
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Detect region from IP (server-side)
 * This would typically use a geolocation service
 */
export async function detectRegionFromIP(ip?: string): Promise<'nigeria' | 'rest-of-world'> {
  // In production, you could use:
  // - ipapi.co
  // - ip-api.com
  // - MaxMind GeoIP
  // For now, return default
  return 'rest-of-world';
}

