import { useEffect } from 'react';

/**
 * Hook to prefetch resources for better performance
 * Preloads images and data on user interaction hints
 */
export function usePrefetch() {
  useEffect(() => {
    // Prefetch link hover targets
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const anchor = target as HTMLAnchorElement;
        if (anchor.href && anchor.pathname.startsWith('/')) {
          // Prefetch the route
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = anchor.href;
          document.head.appendChild(link);
        }
      }
    };

    // Add prefetch on link hover
    document.addEventListener('mouseover', handleMouseEnter, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseEnter, true);
    };
  }, []);
}

/**
 * Prefetch images for faster loading
 */
export function prefetchImage(src: string) {
  const img = new Image();
  img.src = src;
}

/**
 * Preload fonts for better performance
 */
export function prefetchFont(href: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = 'font';
  link.type = 'font/woff2';
  document.head.appendChild(link);
}
