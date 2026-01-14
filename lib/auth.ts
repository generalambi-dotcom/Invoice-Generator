import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean; // For admin access
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: string;
    endDate?: string;
    paymentMethod?: 'paypal' | 'paystack';
  };
}

const CURRENT_USER_KEY = 'invoice-generator-current-user';

/**
 * Register a new user
 */
export async function registerUser(email: string, password: string, name: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();

    // Store user data in localStorage for basic frontend state
    // The actual auth is handled via httpOnly cookies or token
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    }

    return data.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Sign in a user
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();

    // Store user data in localStorage for basic frontend state
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      // Also store token if provided for API calls (though cookies are better)
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
    }

    return data.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local state
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem('auth_token');
    }
  }
}

/**
 * Get the current signed-in user (from local state)
 * For sensitive operations, always verify with backend
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // First check if we have a token (if using token-based auth)
    // If using cookies only, we might check an 'isAuthenticated' cookie or similar

    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as User;
  } catch (error) {
    console.error('Error loading current user:', error);
    return null;
  }
}

/**
 * Refresh current user data from backend
 */
export async function refreshUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    }
    return data.user;
  } catch (error) {
    console.error('Error refreshing user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (client-side check only)
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// End of file

