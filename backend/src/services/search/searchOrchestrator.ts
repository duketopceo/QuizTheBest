import { searchSerpAPI } from './serpApi'
import { scrapeMultiple } from './scraper'
import { logger } from '../../utils/logger'

export interface SearchResult {
  title: string
  link: string
  snippet: string
  source: string
  content?: string
}

class SearchOrchestrator {
  async search(query: string): Promise<SearchResult[]> {
    try {
      // Step 1: Get results from SerpAPI
      const serpResults = await searchSerpAPI(query)

      // Step 2: Extract URLs from SerpAPI results
      const urls = serpResults.map(result => result.link).slice(0, 10) // Limit to 10 URLs

      // Step 3: Scrape content from top URLs
      const scrapedContent = await scrapeMultiple(urls)

      // Step 4: Combine and deduplicate results
      const resultsMap = new Map<string, SearchResult>()

      // Add SerpAPI results
      serpResults.forEach(result => {
        if (!resultsMap.has(result.link)) {
          resultsMap.set(result.link, result)
        }
      })

      // Add scraped content
      scrapedContent.forEach(scraped => {
        const existing = resultsMap.get(scraped.url)
        if (existing) {
          existing.content = scraped.content
        } else {
          resultsMap.set(scraped.url, {
            title: scraped.title,
            link: scraped.url,
            snippet: scraped.content.substring(0, 200),
            source: scraped.source,
            content: scraped.content,
          })
        }
      })

      // Step 5: Rank and return results
      const results = Array.from(resultsMap.values())
      
      // Sort by: academic sources first, then by content length
      results.sort((a, b) => {
        const aIsAcademic = a.source.includes('.edu') || 
                           a.source.includes('wikipedia') || 
                           a.source.includes('khanacademy')
        const bIsAcademic = b.source.includes('.edu') || 
                           b.source.includes('wikipedia') || 
                           b.source.includes('khanacademy')
        
        if (aIsAcademic && !bIsAcademic) return -1
        if (!aIsAcademic && bIsAcademic) return 1
        
        return (b.content?.length || 0) - (a.content?.length || 0)
      })

      return results.slice(0, 20) // Return top 20 results
    } catch (error: any) {
      logger.error('Search orchestrator error:', error)
      throw new Error('Search failed: ' + error.message)
    }
  }
}

export const searchOrchestrator = new SearchOrchestrator()
