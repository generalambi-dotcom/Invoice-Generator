export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free';
  discountValue?: number; // For percentage or fixed amount
  plan: 'premium';
  duration: number; // Days of premium access
  maxUses?: number; // Maximum number of times coupon can be used
  usedCount: number; // Current usage count
  expiresAt?: string; // ISO date string
  createdAt: string;
  createdBy?: string; // Admin user ID who created it
}

export interface CouponUsage {
  couponCode: string;
  userId: string;
  usedAt: string;
}

