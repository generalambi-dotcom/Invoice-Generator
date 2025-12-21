/**
 * Request logging utility
 * Logs API requests for monitoring and debugging
 */

import { NextRequest } from 'next/server';

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

/**
 * Log a request
 */
export function logRequest(
  request: NextRequest,
  options: {
    userId?: string;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  } = {}
): void {
  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    userId: options.userId,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || undefined,
    statusCode: options.statusCode,
    responseTime: options.responseTime,
    error: options.error,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Request Log]', JSON.stringify(log, null, 2));
  }

  // In production, you would send this to a logging service
  // e.g., LogRocket, Sentry, DataDog, CloudWatch, etc.
  // Example:
  // if (process.env.LOG_SERVICE_URL) {
  //   fetch(process.env.LOG_SERVICE_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(log),
  //   }).catch(err => console.error('Failed to send log:', err));
  // }
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

/**
 * Log API response
 */
export function logResponse(
  request: NextRequest,
  statusCode: number,
  responseTime: number,
  userId?: string
): void {
  logRequest(request, {
    userId,
    statusCode,
    responseTime,
  });
}

/**
 * Log API error
 */
export function logError(
  request: NextRequest,
  error: Error | string,
  userId?: string
): void {
  logRequest(request, {
    userId,
    statusCode: 500,
    error: error instanceof Error ? error.message : error,
  });
}

