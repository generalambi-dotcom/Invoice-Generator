/**
 * Core event tracking utility for Google Tag Manager & Google Analytics 4.
 * Safely pushes events to the global dataLayer array if it exists.
 */

// Define standard window typing for dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Pushes a tracking event to the Google Tag Manager dataLayer.
 * 
 * @param eventName The standard GA4 or custom event name
 * @param properties Optional metadata payload to attach to the event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Ensure dataLayer is initialized
    window.dataLayer = window.dataLayer || [];
    
    // Push the event
    window.dataLayer.push({
      event: eventName,
      ...properties,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Tracking Event]: ${eventName}`, properties || '');
    }
  }
};
