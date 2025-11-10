/**
 * Secure caching configuration for PWA
 * Ensures user-specific data is never cached
 */

export const CACHE_CONFIG = {
  // Public resources that can be safely cached
  publicResources: [
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
  ],
  
  // Resources that should never be cached (user-specific)
  neverCache: [
    /^\/api\//,
    /^\/auth\//,
    /\/user\//,
    /\/study-sets\//,
  ],
  
  // Cache names
  cacheNames: {
    static: 'static-cache-v1',
    fonts: 'fonts-cache-v1',
  },
  
  // Cache expiration (in seconds)
  expiration: {
    static: 60 * 60 * 24 * 7, // 7 days
    fonts: 60 * 60 * 24 * 365, // 1 year
  },
}

/**
 * Check if a URL should be cached
 */
export function shouldCache(url: string): boolean {
  // Never cache user-specific resources
  if (CACHE_CONFIG.neverCache.some(pattern => pattern.test(url))) {
    return false
  }
  
  // Only cache public resources
  return CACHE_CONFIG.publicResources.some(pattern => pattern.test(url))
}
