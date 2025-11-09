import { Request, Response, NextFunction } from 'express'

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

  next()
}
