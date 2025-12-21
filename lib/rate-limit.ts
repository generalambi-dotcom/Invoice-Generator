/**
 * Rate limiting utilities for API routes
 * Uses in-memory store (for production, use Redis)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

/**
 * Default rate limit configurations
 */
export const rateLimitConfigs = {
  // General API routes
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later.',
  },
  
  // Authentication routes (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: 'Too many authentication attempts, please try again later.',
  },
  
  // Payment link generation (stricter)
  payment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 payment links per hour
    message: 'Too many payment link requests, please try again later.',
  },
  
  // Email sending (stricter)
  email: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 emails per hour
    message: 'Too many email requests, please try again later.',
  },
  
  // Health check (very lenient)
  health: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many health check requests.',
  },
};

/**
 * Rate limiter middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number; message?: string } => {
    const now = Date.now();
    const key = identifier;
    
    // Clean up expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
    
    // Initialize or get existing entry
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }
    
    const entry = store[key];
    
    // Check if limit exceeded
    if (entry.count >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: config.message || 'Too many requests, please try again later.',
      };
    }
    
    // Increment count
    entry.count++;
    
    return {
      allowed: true,
      remaining: config.max - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get user ID from auth token first
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        // Decode JWT to get user ID (simple decode, not verification)
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          if (payload.userId) {
            return `user:${payload.userId}`;
          }
        } catch {
          // If JWT decode fails, fall back to IP
        }
      }
    }
  } catch {
    // Fall back to IP
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Clean up old entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

