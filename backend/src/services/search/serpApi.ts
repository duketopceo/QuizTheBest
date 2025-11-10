import { logger } from '../../utils/logger'

export interface SearchResult {
  title: string
  link: string
  snippet: string
  source: string
}

// Try to import serpapi, but make it optional
let getJson: any = null
try {
  const serpapi = require('serpapi')
  getJson = serpapi.getJson
} catch (e) {
  logger.debug('SerpAPI package not installed (optional dependency)')
}

/**
 * SerpAPI search with error handling and fallback
 */
export async function searchSerpAPI(query: string): Promise<SearchResult[]> {
  // Check if serpapi is available
  if (!getJson) {
    logger.debug('SerpAPI package not available, skipping SerpAPI search')
    return []
  }

  const apiKey = process.env.SERPAPI_KEY

  if (!apiKey) {
    logger.warn('SerpAPI key not configured, skipping SerpAPI search')
    return []
  }

  try {
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: apiKey,
      num: 10, // Limit results
    })

    if (response.error) {
      // Handle quota exceeded or other API errors gracefully
      if (response.error.includes('quota') || response.error.includes('limit')) {
        logger.warn('SerpAPI quota exceeded, continuing without SerpAPI results')
        return []
      }
      throw new Error(response.error)
    }

    const results: SearchResult[] = []
    
    if (response.organic_results) {
      for (const result of response.organic_results) {
        results.push({
          title: result.title || '',
          link: result.link || '',
          snippet: result.snippet || '',
          source: 'serpapi',
        })
      }
    }

    return results
  } catch (error: any) {
    // Graceful fallback - don't block user if SerpAPI fails
    logger.error('SerpAPI search error:', error)
    return []
  }
}
