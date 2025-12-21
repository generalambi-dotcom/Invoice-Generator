/**
 * Enhanced Error Handling Utilities
 * Provides retry logic, better error messages, and error logging
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  retryable?: (error: any) => boolean;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryable = (error: any) => {
      // Retry on network errors or 5xx errors
      return (
        error.code === 'ECONNABORTED' ||
        error.code === 'ENOTFOUND' ||
        (error.response && error.response.status >= 500)
      );
    },
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === maxRetries || !retryable(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
    }
  }
  
  throw lastError;
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: any, context?: string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    // Network errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    // HTTP errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      switch (status) {
        case 400:
          return message || 'Invalid request. Please check your input.';
        case 401:
          return 'Please sign in to continue.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return context ? `${context} not found.` : 'Resource not found.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return message || `Error ${status}: Something went wrong.`;
      }
    }

    return error.message;
  }

  return context 
    ? `An error occurred while ${context}. Please try again.`
    : 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with context
 */
export function logError(error: any, context?: string, metadata?: Record<string, any>) {
  const errorInfo = {
    message: error.message || String(error),
    context,
    metadata,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  console.error('Error logged:', errorInfo);
  
  // In production, you'd send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Handle API errors with retry and better messaging
 */
export async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  options: RetryOptions & { context?: string } = {}
): Promise<T> {
  const { context, ...retryOptions } = options;
  
  try {
    return await retryWithBackoff(apiCall, retryOptions);
  } catch (error: any) {
    logError(error, context);
    const userMessage = formatErrorMessage(error, context);
    throw new Error(userMessage);
  }
}

