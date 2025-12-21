import { Coupon, CouponUsage } from '@/types/coupon';
import { getCurrentUser } from './auth';

const COUPONS_KEY = 'invoice-generator-coupons';
const COUPON_USAGE_KEY = 'invoice-generator-coupon-usage';

/**
 * Get all coupons
 */
export function getCoupons(): Coupon[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(COUPONS_KEY);
    if (!data) {
      // Initialize with default "free" coupon
      const defaultCoupon: Coupon = {
        code: 'free',
        discountType: 'free',
        plan: 'premium',
        duration: 30, // 30 days
        maxUses: 1000, // Allow many uses
        usedCount: 0,
        createdAt: new Date().toISOString(),
      };
      const coupons = [defaultCoupon];
      localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
      return coupons;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading coupons:', error);
    return [];
  }
}

/**
 * Get coupon usage records
 */
function getCouponUsage(): CouponUsage[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(COUPON_USAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading coupon usage:', error);
    return [];
  }
}

/**
 * Validate and apply a coupon code
 */
export function validateCoupon(code: string, userId: string): { valid: boolean; coupon?: Coupon; error?: string } {
  if (typeof window === 'undefined') {
    return { valid: false, error: 'Coupon validation only available in browser' };
  }

  const coupons = getCoupons();
  const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
  
  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  // Check expiration
  if (coupon.expiresAt) {
    const expiresAt = new Date(coupon.expiresAt);
    if (expiresAt < new Date()) {
      return { valid: false, error: 'Coupon has expired' };
    }
  }

  // Check max uses
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'Coupon has reached maximum usage limit' };
  }

  // Check if user already used this coupon
  const usage = getCouponUsage();
  const userUsage = usage.find(u => u.couponCode.toLowerCase() === code.toLowerCase() && u.userId === userId);
  if (userUsage) {
    return { valid: false, error: 'You have already used this coupon' };
  }

  return { valid: true, coupon };
}

/**
 * Apply coupon and grant premium access
 */
export function applyCoupon(code: string, userId: string): { success: boolean; error?: string } {
  const validation = validateCoupon(code, userId);
  
  if (!validation.valid || !validation.coupon) {
    return { success: false, error: validation.error };
  }

  const coupon = validation.coupon;

  try {
    // Record usage
    const usage = getCouponUsage();
    usage.push({
      couponCode: coupon.code,
      userId,
      usedAt: new Date().toISOString(),
    });
    localStorage.setItem(COUPON_USAGE_KEY, JSON.stringify(usage));

    // Update coupon usage count
    const coupons = getCoupons();
    const couponIndex = coupons.findIndex(c => c.code === coupon.code);
    if (couponIndex >= 0) {
      coupons[couponIndex].usedCount += 1;
      localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    }

    // Grant premium access
    const { updateUserSubscription } = require('./admin');
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + coupon.duration);
    
    updateUserSubscription(userId, 'premium', 'active');
    
    // Update end date manually
    const users = require('./admin').getUsers();
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex >= 0) {
      users[userIndex].subscription = {
        ...users[userIndex].subscription,
        endDate: endDate.toISOString(),
      };
      const USERS_KEY = 'invoice-generator-users';
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Update current user if it's the same
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem('invoice-generator-current-user', JSON.stringify(users[userIndex]));
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to apply coupon' };
  }
}

/**
 * Create a new coupon (admin only)
 */
export function createCoupon(coupon: Omit<Coupon, 'usedCount' | 'createdAt'>): Coupon {
  if (typeof window === 'undefined') {
    throw new Error('Coupon creation only available in browser');
  }

  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error('Only admins can create coupons');
  }

  const coupons = getCoupons();
  
  // Check if code already exists
  if (coupons.find(c => c.code.toLowerCase() === coupon.code.toLowerCase())) {
    throw new Error('Coupon code already exists');
  }

  const newCoupon: Coupon = {
    ...coupon,
    usedCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
  };

  coupons.push(newCoupon);
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));

  return newCoupon;
}

/**
 * Delete a coupon (admin only)
 */
export function deleteCoupon(code: string): void {
  if (typeof window === 'undefined') {
    throw new Error('Coupon deletion only available in browser');
  }

  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error('Only admins can delete coupons');
  }

  const coupons = getCoupons();
  const filtered = coupons.filter(c => c.code.toLowerCase() !== code.toLowerCase());
  localStorage.setItem(COUPONS_KEY, JSON.stringify(filtered));
}

