import { logger } from './logger'

/**
 * Critical security utility: Sanitize all content from scrapers and LLM responses
 * Prevents code/prompt injection attacks
 */
class ContentSanitizer {
  /**
   * Remove potentially dangerous content
   */
  sanitize(text: string): string {
    if (!text || typeof text !== 'string') {
      return ''
    }

    let sanitized = text

    // Remove script tags and content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '')
    
    // Remove data: URLs that could contain scripts
    sanitized = sanitized.replace(/data:text\/html/gi, '')
    
    // Remove HTML tags (keep only text content)
    sanitized = sanitized.replace(/<[^>]+>/g, ' ')
    
    // Decode HTML entities
    sanitized = sanitized
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim()
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
    
    // Limit length to prevent DoS
    if (sanitized.length > 50000) {
      sanitized = sanitized.substring(0, 50000)
      logger.warn('Content truncated due to length limit')
    }

    return sanitized
  }

  /**
   * Validate content before saving to database
   */
  validate(content: any): boolean {
    if (!content) return false
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
    ]

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content)
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(contentStr)) {
        logger.warn('Suspicious content detected and rejected')
        return false
      }
    }

    return true
  }
}

export const contentSanitizer = new ContentSanitizer()
