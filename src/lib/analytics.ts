/**
 * Analytics Utilities
 * 
 * Track user interactions and page views for analytics
 */

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

interface PageViewData {
  path: string;
  title: string;
  referrer?: string;
}

/**
 * Initialize analytics (Google Analytics, etc.)
 */
export function initializeAnalytics(): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId || import.meta.env.DEV) {
    console.log('[Analytics] Disabled in development mode');
    return;
  }

  // Load Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false, // We'll manually track page views
    anonymize_ip: true,
  });

  console.log('[Analytics] Initialized');
}

/**
 * Track a page view
 */
export function trackPageView(data: PageViewData): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Page View:', data);
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: data.path,
      page_title: data.title,
      page_referrer: data.referrer,
    });
  }
}

/**
 * Track a custom event
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Event:', event);
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
}

/**
 * Common event trackers for the application
 */
export const analytics = {
  // User interactions
  movieClick: (movieId: number, movieTitle: string) => {
    trackEvent({
      category: 'Movie',
      action: 'view_details',
      label: movieTitle,
      value: movieId,
    });
  },

  tvShowClick: (showId: number, showTitle: string) => {
    trackEvent({
      category: 'TV Show',
      action: 'view_details',
      label: showTitle,
      value: showId,
    });
  },

  search: (query: string, resultCount: number) => {
    trackEvent({
      category: 'Search',
      action: 'search_query',
      label: query,
      value: resultCount,
    });
  },

  addToWatchlist: (mediaType: 'movie' | 'tv', title: string) => {
    trackEvent({
      category: 'Watchlist',
      action: 'add_item',
      label: `${mediaType}: ${title}`,
    });
  },

  removeFromWatchlist: (mediaType: 'movie' | 'tv', title: string) => {
    trackEvent({
      category: 'Watchlist',
      action: 'remove_item',
      label: `${mediaType}: ${title}`,
    });
  },

  playTrailer: (title: string) => {
    trackEvent({
      category: 'Video',
      action: 'play_trailer',
      label: title,
    });
  },

  genreFilter: (genre: string) => {
    trackEvent({
      category: 'Filter',
      action: 'select_genre',
      label: genre,
    });
  },

  userSignup: () => {
    trackEvent({
      category: 'User',
      action: 'signup',
    });
  },

  userLogin: () => {
    trackEvent({
      category: 'User',
      action: 'login',
    });
  },

  userLogout: () => {
    trackEvent({
      category: 'User',
      action: 'logout',
    });
  },

  shareContent: (mediaType: 'movie' | 'tv', title: string, platform: string) => {
    trackEvent({
      category: 'Social',
      action: 'share',
      label: `${platform}: ${mediaType} - ${title}`,
    });
  },

  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent({
      category: 'Error',
      action: errorType,
      label: errorMessage,
    });
  },
};

/**
 * Type definitions for Google Analytics
 */
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Track user timing (performance metrics)
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Timing: ${category}.${variable} = ${value}ms`);
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'timing_complete', {
      name: variable,
      value: value,
      event_category: category,
      event_label: label,
    });
  }
}

/**
 * Track exceptions/errors
 */
export function trackException(
  description: string,
  fatal: boolean = false
): void {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Exception:`, { description, fatal });
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'exception', {
      description,
      fatal,
    });
  }
}

/**
 * Set user properties (for authenticated users)
 */
export function setUserProperties(properties: Record<string, string | number>): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics] User Properties:', properties);
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    window.gtag('set', 'user_properties', properties);
  }
}

/**
 * Clear user data (on logout)
 */
export function clearUserData(): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Clearing user data');
    return;
  }

  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      user_id: undefined,
    });
  }
}
