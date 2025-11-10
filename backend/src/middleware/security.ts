import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * Security middleware to enforce HTTPS in production
 * and set security headers
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`)
    }
  }

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy for agent endpoints
  if (req.path.startsWith('/api/ai')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'none'; object-src 'none';"
    )
  }

  next()
}

/**
 * Middleware to validate and sanitize agent endpoint requests
 * Prevents injection attacks and validates request structure
 */
export function agentSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply to agent endpoints
  if (!req.path.startsWith('/api/ai')) {
    return next()
  }

  // Validate content type for POST requests
  if (req.method === 'POST') {
    const contentType = req.header('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn('Invalid content type for agent endpoint', {
        path: req.path,
        contentType,
        ip: req.ip,
      })
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json',
        },
      })
    }
  }

  // Validate request size (prevent DoS)
  const contentLength = parseInt(req.header('content-length') || '0', 10)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (contentLength > maxSize) {
    logger.warn('Request too large for agent endpoint', {
      path: req.path,
      contentLength,
      ip: req.ip,
    })
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload too large',
      },
    })
  }

  next()
}
