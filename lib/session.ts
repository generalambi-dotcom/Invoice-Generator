/**
 * Session management utilities
 */

import { revokeAllUserRefreshTokens } from './refresh-token';

/**
 * Session information interface
 */
export interface SessionInfo {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
  loginTime: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
}

const SESSION_KEY = 'current_session';
const LAST_ACTIVITY_KEY = 'last_activity';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Create a new session
 */
export function createSession(user: {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const session: SessionInfo = {
    userId: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin || false,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error creating session:', error);
  }
}

/**
 * Get current session
 */
export function getSession(): SessionInfo | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData) as SessionInfo;
    
    // Check if session is expired
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const timeSinceActivity = now.getTime() - lastActivity.getTime();

    if (timeSinceActivity > SESSION_TIMEOUT) {
      clearSession();
      return null;
    }

    // Update last activity
    updateLastActivity();

    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_ACTIVITY_KEY, now);

    // Update session last activity
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData) as SessionInfo;
      session.lastActivity = now;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (error) {
    console.error('Error updating last activity:', error);
  }
}

/**
 * Clear session and invalidate tokens
 */
export async function clearSession(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Get user ID before clearing
    const session = getSession();
    const userId = session?.userId;

    // Clear local storage
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');

    // Revoke refresh tokens on server (if we have userId)
    if (userId) {
      try {
        await revokeAllUserRefreshTokens(userId);
      } catch (error) {
        // If revoke fails, continue with local cleanup
        console.error('Error revoking refresh tokens:', error);
      }
    }
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Check if session is valid
 */
export function isSessionValid(): boolean {
  const session = getSession();
  return session !== null;
}

/**
 * Get session duration in minutes
 */
export function getSessionDuration(): number {
  const session = getSession();
  if (!session) {
    return 0;
  }

  const loginTime = new Date(session.loginTime);
  const now = new Date();
  return Math.floor((now.getTime() - loginTime.getTime()) / (1000 * 60));
}

/**
 * Setup automatic session activity tracking
 */
export function setupSessionTracking(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Update activity on user interactions
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  const updateActivity = () => {
    updateLastActivity();
  };

  events.forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Check session validity periodically (every 5 minutes)
  setInterval(() => {
    if (!isSessionValid()) {
      // Session expired - clear and redirect to login
      clearSession();
      if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
        window.location.href = '/signin?expired=true';
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}

