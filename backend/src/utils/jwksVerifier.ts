/**
 * JWKS Verification Utility
 * 
 * This utility helps verify that the JWKS from Cognito matches expected keys.
 * The backend automatically fetches JWKS from Cognito, but this can be used
 * for testing or verification purposes.
 */

import jwksClient from 'jwks-rsa'
import { logger } from './logger'

export interface JWKSKey {
  alg: string
  e: string
  kid: string
  kty: string
  n: string
  use: string
}

export interface JWKSSet {
  keys: JWKSKey[]
}

/**
 * Fetch JWKS from Cognito User Pool
 */
export async function fetchJWKSFromCognito(
  region: string,
  userPoolId: string
): Promise<JWKSSet> {
  const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  
  try {
    const response = await fetch(jwksUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.statusText}`)
    }
    
    const jwks = await response.json()
    return jwks as JWKSSet
  } catch (error: any) {
    logger.error('Failed to fetch JWKS from Cognito', {
      url: jwksUrl,
      error: error.message,
    })
    throw error
  }
}

/**
 * Verify JWKS structure and keys
 */
export function verifyJWKSStructure(jwks: JWKSSet): boolean {
  if (!jwks.keys || !Array.isArray(jwks.keys)) {
    return false
  }

  for (const key of jwks.keys) {
    // Verify required fields
    if (!key.alg || !key.kid || !key.kty || !key.n || !key.e) {
      return false
    }

    // Verify algorithm
    if (key.alg !== 'RS256') {
      return false
    }

    // Verify key type
    if (key.kty !== 'RSA') {
      return false
    }

    // Verify use
    if (key.use && key.use !== 'sig') {
      return false
    }
  }

  return true
}

/**
 * Get signing key by kid (key ID)
 */
export async function getSigningKey(
  region: string,
  userPoolId: string,
  kid: string
): Promise<string | null> {
  try {
    const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
    
    const client = jwksClient({
      jwksUri: jwksUrl,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
    })

    return new Promise((resolve, reject) => {
      client.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err)
          return
        }
        resolve(key?.getPublicKey() || null)
      })
    })
  } catch (error) {
    logger.error('Failed to get signing key', { kid, error })
    return null
  }
}

/**
 * Verify that provided JWKS matches Cognito
 * Useful for testing and verification
 */
export async function verifyJWKSMatch(
  region: string,
  userPoolId: string,
  expectedJWKS: JWKSSet
): Promise<boolean> {
  try {
    const actualJWKS = await fetchJWKSFromCognito(region, userPoolId)
    
    // Compare key IDs
    const expectedKids = new Set(expectedJWKS.keys.map(k => k.kid))
    const actualKids = new Set(actualJWKS.keys.map(k => k.kid))
    
    // Check if all expected keys are present
    for (const kid of expectedKids) {
      if (!actualKids.has(kid)) {
        logger.warn('Expected key ID not found in Cognito JWKS', { kid })
        return false
      }
    }

    logger.info('JWKS verification successful', {
      expectedKeyCount: expectedJWKS.keys.length,
      actualKeyCount: actualJWKS.keys.length,
    })

    return true
  } catch (error: any) {
    logger.error('JWKS verification failed', { error: error.message })
    return false
  }
}

