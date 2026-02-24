import React from 'react';

// Performance monitoring utilities

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

const performanceMetrics = new Map<string, PerformanceMetrics>();

export const trackComponentPerformance = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    const existing = performanceMetrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0
    };
    
    const newCount = existing.renderCount + 1;
    const newAverage = (existing.averageRenderTime * existing.renderCount + renderTime) / newCount;
    
    performanceMetrics.set(componentName, {
      renderCount: newCount,
      lastRenderTime: renderTime,
      averageRenderTime: newAverage
    });
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  };
};

export const getPerformanceMetrics = (componentName?: string) => {
  if (componentName) {
    return performanceMetrics.get(componentName);
  }
  return Object.fromEntries(performanceMetrics.entries());
};

export const clearPerformanceMetrics = () => {
  performanceMetrics.clear();
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization wrapper for expensive computations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// React component performance wrapper
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> => {
  const name = componentName || Component.displayName || Component.name || 'Anonymous';
  
  return React.memo((props: P) => {
    const renderCount = React.useRef(0);
    renderCount.current++;
    
    React.useEffect(() => {
      const endTracking = trackComponentPerformance(name);
      return endTracking;
    });
    
    return React.createElement(Component, props);
  });
};