// Error handling utilities for the application

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof Error) {
    // Check for rate limit errors (429)
    if (error.message.includes('429') || 
        error.message.includes('Too Many Requests') ||
        error.message.includes('RESOURCE_EXHAUSTED')) {
      return new AppError(
        '⚠️ API rate limit exceeded. Please wait a few minutes before trying again.',
        'RATE_LIMIT_ERROR',
        true
      );
    }
    
    if (error.message.includes('API key')) {
      return new AppError(
        'API configuration error. Please check your environment setup.',
        'API_KEY_ERROR',
        true
      );
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new AppError(
        'Network connection failed. Please check your internet connection.',
        'NETWORK_ERROR',
        true
      );
    }
    
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return new AppError(
        'Service temporarily unavailable. Please try again in a few minutes.',
        'QUOTA_ERROR',
        true
      );
    }
  }
  
  return new AppError(
    'An unexpected error occurred. Please try again.',
    'UNKNOWN_ERROR',
    true
  );
};

export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    const parsed = JSON.parse(json);
    return parsed !== null ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const safeLocalStorageGet = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    
    return safeJsonParse(item, fallback);
  } catch (error) {
    console.warn(`Failed to read localStorage key "${key}":`, error);
    // Clean up corrupted data
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore cleanup errors
    }
    return fallback;
  }
};

export const safeLocalStorageSet = (key: string, value: unknown): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to write localStorage key "${key}":`, error);
    return false;
  }
};

export const withErrorBoundary = <T extends (...args: any[]) => any>(
  fn: T,
  fallback?: any
): T => {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error('Function execution failed:', error);
      return fallback;
    }
  }) as T;
};