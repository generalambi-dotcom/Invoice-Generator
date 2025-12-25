/**
 * Client-side token refresh utilities
 */

const REFRESH_ENDPOINT = '/api/auth/refresh';

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh token invalid - clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('invoice-generator-current-user');
      return null;
    }

    const data = await response.json();
    
    // Update tokens
    localStorage.setItem('auth_token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('invoice-generator-current-user', JSON.stringify(data.user));
    }

    return data.token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return null;
  }

  // Check if token is expired (simple check - decode JWT payload)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Refresh if token expires in less than 5 minutes
    if (expirationTime - now < 5 * 60 * 1000) {
      return await refreshAccessToken();
    }
    
    return token;
  } catch (error) {
    // If token parsing fails, try to refresh
    return await refreshAccessToken();
  }
}

/**
 * Setup automatic token refresh (call on app initialization)
 */
export function setupTokenRefresh() {
  if (typeof window === 'undefined') {
    return;
  }

  // Refresh token every 10 minutes
  setInterval(async () => {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (token && refreshToken) {
      await refreshAccessToken();
    }
  }, 10 * 60 * 1000); // 10 minutes
}

