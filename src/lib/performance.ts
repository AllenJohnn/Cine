/**
 * Performance Monitoring Utilities
 * 
 * Tools for measuring and optimizing application performance
 */

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Measure the performance of a function
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

/**
 * Measure async function performance
 */
export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  
  return result;
}

/**
 * Monitor Web Vitals
 * Note: Requires 'web-vitals' package to be installed
 * Install with: npm install web-vitals
 */
export function reportWebVitals(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Web Vitals package is optional - uncomment if installed
    // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    //   getCLS(onPerfEntry);
    //   getFID(onPerfEntry);
    //   getFCP(onPerfEntry);
    //   getLCP(onPerfEntry);
    //   getTTFB(onPerfEntry);
    // }).catch(() => {
    //   console.log('web-vitals package not installed');
    // });
    console.log('Web Vitals tracking configured but package not installed');
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(selector: string = '[data-lazy]'): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.lazy;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Memoization helper for expensive computations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T
): T {
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
}

/**
 * Check if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get network information
 */
export function getNetworkInfo() {
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    return {
      effectiveType: conn?.effectiveType || 'unknown',
      downlink: conn?.downlink || 0,
      rtt: conn?.rtt || 0,
      saveData: conn?.saveData || false,
    };
  }
  return null;
}

/**
 * Check if connection is slow
 */
export function isSlowConnection(): boolean {
  const info = getNetworkInfo();
  if (!info) return false;
  
  return info.effectiveType === '2g' || info.effectiveType === 'slow-2g' || info.saveData;
}
