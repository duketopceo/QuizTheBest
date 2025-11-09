import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

interface AuthRequest extends Request {
  user?: {
    sub: string
    email: string
    username: string
  }
}

/**
 * Middleware to verify AWS Cognito JWT tokens
 * Supports both access tokens and ID tokens
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authorization token provided',
        },
      })
    }

    const token = authHeader.substring(7)
    const userPoolId = process.env.COGNITO_USER_POOL_ID
    const clientId = process.env.COGNITO_CLIENT_ID

    if (!userPoolId || !clientId) {
      logger.error('Cognito configuration missing')
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Server configuration error',
        },
      })
    }

    // Verify token using JWT with Cognito public keys
    try {
      // Get Cognito JWKS URL
      const region = process.env.AWS_REGION || 'us-east-1'
      const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
      
      const client = jwksClient({
        jwksUri: jwksUrl,
        cache: true,
        cacheMaxAge: 86400000, // 24 hours
      })

      function getKey(header: any, callback: any) {
        client.getSigningKey(header.kid, (err, key) => {
          if (err) {
            return callback(err)
          }
          const signingKey = key?.getPublicKey()
          callback(null, signingKey)
        })
      }

      jwt.verify(token, getKey, {
        algorithms: ['RS256'],
        audience: clientId,
        issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      }, (err, decoded: any) => {
        if (err) {
          logger.error('Token verification failed:', err)
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired token',
            },
          })
        }

        req.user = {
          sub: decoded.sub,
          email: decoded.email || decoded['cognito:username'],
          username: decoded['cognito:username'] || decoded.email || decoded.sub,
        }
        next()
      })
    } catch (error: any) {
      logger.error('Auth verification error:', error)
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication failed',
        },
      })
    }
  } catch (error) {
    logger.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error',
      },
    })
  }
}
