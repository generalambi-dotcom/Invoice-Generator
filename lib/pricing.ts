/**
 * Pricing utilities for fetching and managing subscription prices
 */

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

  // Method 2: Check user's timezone (Nigeria is WAT - UTC+1)
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Lagos') || timezone.includes('Africa')) {
      localStorage.setItem('user-region', 'nigeria');
      return 'nigeria';
    }
  } catch (e) {
    // Ignore errors
  }

  // Method 3: Use IP geolocation (client-side via API)
  // This is handled separately via API call for better accuracy

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

