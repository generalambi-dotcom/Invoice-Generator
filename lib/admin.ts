import { User } from './auth';

const USERS_KEY = 'invoice-generator-users';

/**
 * Get all users (for admin use)
 */
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

/**
 * Update user subscription
 */
export function updateUserSubscription(
  userId: string,
  plan: 'free' | 'premium',
  status: 'active' | 'cancelled' | 'expired'
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
      const now = new Date();
      const endDate = plan === 'premium' 
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        : undefined;
      
      users[userIndex] = {
        ...users[userIndex],
        subscription: {
          plan,
          status,
          startDate: plan === 'premium' ? now.toISOString() : users[userIndex].subscription?.startDate,
          endDate,
          paymentMethod: users[userIndex].subscription?.paymentMethod,
        },
      };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Also update current user if it's the same user
      const currentUserData = localStorage.getItem('invoice-generator-current-user');
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        if (currentUser.id === userId) {
          localStorage.setItem('invoice-generator-current-user', JSON.stringify(users[userIndex]));
        }
      }
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw new Error('Failed to update user subscription');
  }
}

/**
 * Get payment configuration
 */
export function getPaymentConfig() {
  if (typeof window === 'undefined') return {};
  
  try {
    const config = localStorage.getItem('admin-payment-config');
    if (config) {
      return JSON.parse(config);
    }
    return {};
  } catch (error) {
    console.error('Error loading payment config:', error);
    return {};
  }
}

/**
 * Save payment configuration
 */
export function savePaymentConfig(config: {
  paypalClientId?: string;
  paystackPublicKey?: string;
  paystackSecretKey?: string;
}): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('admin-payment-config', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving payment config:', error);
    throw new Error('Failed to save payment configuration');
  }
}

