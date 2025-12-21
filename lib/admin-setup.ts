/**
 * Admin Setup Utility
 * 
 * To make a user an admin, run this in the browser console:
 * 
 * import { makeUserAdmin } from '@/lib/admin-setup';
 * makeUserAdmin('user-email@example.com');
 * 
 * Or use the function directly:
 */

import { getUsers, updateUserSubscription } from './admin';

/**
 * Make a user an admin by email
 */
export function makeUserAdmin(email: string): boolean {
  if (typeof window === 'undefined') {
    console.error('This function must be run in the browser');
    return false;
  }

  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      console.error(`User with email ${email} not found`);
      return false;
    }

    users[userIndex] = {
      ...users[userIndex],
      isAdmin: true,
    };

    const USERS_KEY = 'invoice-generator-users';
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    console.log(`✅ User ${email} is now an admin!`);
    console.log('Please refresh the page and sign in again to access the admin dashboard.');
    
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
}

/**
 * List all users (for debugging)
 */
export function listUsers(): void {
  if (typeof window === 'undefined') {
    console.error('This function must be run in the browser');
    return;
  }

  const users = getUsers();
  console.table(users.map(u => ({
    email: u.email,
    name: u.name,
    isAdmin: u.isAdmin || false,
    plan: u.subscription?.plan || 'free',
    status: u.subscription?.status || 'active',
  })));
}

/**
 * Quick setup: Make the first user an admin
 */
export function makeFirstUserAdmin(): boolean {
  if (typeof window === 'undefined') {
    console.error('This function must be run in the browser');
    return false;
  }

  const users = getUsers();
  if (users.length === 0) {
    console.error('No users found. Please sign up first.');
    return false;
  }

  const firstUser = users[0];
  return makeUserAdmin(firstUser.email);
}

