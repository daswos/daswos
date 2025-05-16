/**
 * Analytics helper functions for tracking page views and events
 */

// Define the gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Track a virtual page view
 * @param path The path to track
 * @param title The page title
 */
export const trackPageView = (path: string, title?: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-MEASUREMENT_ID', {
      page_path: path,
      page_title: title || getPageTitle(path),
    });
    
    // Log for development
    console.log(`Virtual page view: ${path} - ${title || getPageTitle(path)}`);
  }
};

/**
 * Track an event
 * @param eventName The name of the event
 * @param eventParams The event parameters
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    
    // Log for development
    console.log(`Event tracked: ${eventName}`, eventParams);
  }
};

/**
 * Get a page title based on the path
 * @param path The path to get the title for
 * @returns The page title
 */
export const getPageTitle = (path: string): string => {
  // Remove query parameters for title
  const basePath = path.split('?')[0];
  
  // Map paths to titles
  const pathTitles: Record<string, string> = {
    '/': 'Home',
    '/search': 'Search Results',
    '/unified-search': 'Unified Search',
    '/auth': 'Authentication',
    '/user-settings': 'User Settings',
    '/autoshop-dashboard': 'AutoShop Dashboard',
    '/bulk-buy': 'Bulk Buy',
    '/split-buy': 'Split Buy',
    '/d-list': 'das.list',
    '/browse-jobs': 'Jobs',
    '/ai-assistant': 'AI Assistant',
    '/cart': 'Shopping Cart',
    '/daswos-coins': 'DasWos Coins',
    '/my-listings': 'My Listings',
    '/seller-hub': 'Seller Hub',
  };
  
  return pathTitles[basePath] || 'DasWos';
};
