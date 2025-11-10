import * as cheerio from 'cheerio'
import { logger } from '../../utils/logger'
import { contentSanitizer } from '../../utils/contentSanitizer'
import { isAcademicSource, getAcademicSourcePriority } from './academicSources'

export interface ScrapedContent {
  url: string
  title: string
  content: string
  source: string
  priority: number
}

// Rate limiting per domain
const domainRateLimits = new Map<string, { lastRequest: number; count: number }>()

const RATE_LIMIT_DELAY = 2000 // 2 seconds between requests to same domain
const MAX_REQUESTS_PER_DOMAIN = 5 // Max requests per minute per domain

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function checkRateLimit(url: string): boolean {
  const domain = getDomain(url)
  const now = Date.now()
  const limit = domainRateLimits.get(domain)

  if (!limit) {
    domainRateLimits.set(domain, { lastRequest: now, count: 1 })
    return true
  }

  // Reset count if more than a minute has passed
  if (now - limit.lastRequest > 60000) {
    domainRateLimits.set(domain, { lastRequest: now, count: 1 })
    return true
  }

  // Check if we've exceeded max requests
  if (limit.count >= MAX_REQUESTS_PER_DOMAIN) {
    return false
  }

  // Check if enough time has passed since last request
  if (now - limit.lastRequest < RATE_LIMIT_DELAY) {
    return false
  }

  limit.count++
  limit.lastRequest = now
  return true
}

/**
 * Scrape content from a URL using Cheerio
 * For MVP: Skip complex multi-page sites and PDFs, focus on HTML content
 */
export async function scrapeContent(url: string): Promise<ScrapedContent | null> {
  // Check rate limit
  if (!checkRateLimit(url)) {
    logger.warn(`Rate limit exceeded for domain: ${getDomain(url)}`)
    return null
  }

  // Skip PDFs and non-HTML content
  if (url.toLowerCase().endsWith('.pdf') || url.includes('.pdf?')) {
    return null
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuizTheBest/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      logger.warn(`Failed to fetch ${url}: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('text/html')) {
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract title
    const title = $('title').text() || $('h1').first().text() || 'Untitled'

    // Remove script and style elements
    $('script, style, nav, footer, header, aside').remove()

    // Extract main content
    const mainContent = $('main, article, .content, #content, .main-content').first()
    const content = mainContent.length > 0 
      ? mainContent.text() 
      : $('body').text()

    // Clean and sanitize content
    const cleanedContent = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000) // Limit content length

    const sanitizedContent = contentSanitizer.sanitize(cleanedContent)

    if (!sanitizedContent || sanitizedContent.length < 100) {
      return null // Skip if content is too short
    }

    return {
      url,
      title: contentSanitizer.sanitize(title),
      content: sanitizedContent,
      source: getDomain(url),
      priority: getAcademicSourcePriority(url),
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logger.warn(`Request timeout for ${url}`)
    } else {
      logger.error(`Error scraping ${url}:`, error.message)
    }
    return null
  }
}

/**
 * Scrape multiple URLs with rate limiting
 */
export async function scrapeMultiple(urls: string[]): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = []
  
  // Process in batches to respect rate limits
  for (const url of urls) {
    const content = await scrapeContent(url)
    if (content) {
      results.push(content)
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Sort by priority (academic sources first)
  return results.sort((a, b) => a.priority - b.priority)
}
