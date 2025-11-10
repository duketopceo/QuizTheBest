# JWKS (JSON Web Key Set) Verification Guide

## Overview

The JWKS you provided contains the public keys used by AWS Cognito to sign JWT tokens. Your backend automatically fetches and uses these keys to verify tokens.

## Your JWKS Keys

Your Cognito User Pool has **2 signing keys**:

### Key 1
- **Key ID (kid)**: `NQLkfu4oJ8Xfnq9xAoe4Z2r6qO/xGimx0nYMCioNosk=`
- **Algorithm**: RS256
- **Key Type**: RSA
- **Use**: Signature verification

### Key 2
- **Key ID (kid)**: `I4rVxBK+J1LsgYlz4U32uKOlOiRszxsC57/o5XW3Gd4=`
- **Algorithm**: RS256
- **Key Type**: RSA
- **Use**: Signature verification

## How It Works

### 1. Token Issuance (Cognito)
When a user logs in, Cognito:
1. Creates a JWT token
2. Signs it with one of the private keys (matching the public keys in JWKS)
3. Includes the `kid` (key ID) in the token header
4. Returns the token to your app

### 2. Token Verification (Your Backend)
When your backend receives a token:
1. Extracts the `kid` from the token header
2. Fetches JWKS from: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2Sqbuu4TB/.well-known/jwks.json`
3. Finds the matching public key using the `kid`
4. Verifies the token signature using that public key
5. Validates token claims (issuer, audience, expiration)

## Backend Implementation

Your backend already handles this correctly in `backend/src/middleware/auth.ts`:

```typescript
// Automatically fetches JWKS from Cognito
const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`

const client = jwksClient({
  jwksUri: jwksUrl,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
})

// Gets the correct key based on kid in token
client.getSigningKey(header.kid, (err, key) => {
  const signingKey = key?.getPublicKey()
  // Use signingKey to verify token
})
```

## JWKS URL

Your JWKS is available at:
```
https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2Sqbuu4TB/.well-known/jwks.json
```

This URL is:
- Publicly accessible (no authentication required)
- Cached by your backend for 24 hours
- Automatically updated by AWS when keys rotate

## Key Rotation

AWS Cognito automatically rotates keys periodically. Your backend:
- ✅ Automatically fetches new keys when needed
- ✅ Caches keys for 24 hours (performance)
- ✅ Falls back to fresh fetch if cached key not found

## Verification Utility

A utility has been created at `backend/src/utils/jwksVerifier.ts` for:
- Testing JWKS fetching
- Verifying JWKS structure
- Comparing expected vs actual JWKS

### Example Usage

```typescript
import { verifyJWKSMatch, fetchJWKSFromCognito } from './utils/jwksVerifier'

// Verify JWKS matches expected
const expectedJWKS = {
  keys: [
    {
      alg: "RS256",
      kid: "NQLkfu4oJ8Xfnq9xAoe4Z2r6qO/xGimx0nYMCioNosk=",
      // ... rest of key
    },
    // ... other keys
  ]
}

const matches = await verifyJWKSMatch(
  'us-east-1',
  'us-east-1_2Sqbuu4TB',
  expectedJWKS
)
```

## Security Notes

1. **JWKS is Public**: The JWKS endpoint is publicly accessible - this is by design
2. **Private Keys are Secret**: Only AWS Cognito has the private keys
3. **Token Verification**: Public keys can only verify signatures, not create them
4. **Key Rotation**: AWS handles key rotation automatically

## Testing

### Verify JWKS Endpoint

```bash
curl https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2Sqbuu4TB/.well-known/jwks.json
```

Should return the same JWKS you provided.

### Test Token Verification

1. Login through your mobile app
2. Get the ID token
3. Decode the token header to see which `kid` was used
4. Verify the token signature matches the corresponding key in JWKS

## Troubleshooting

### Issue: "Token verification failed"
- Check that `COGNITO_USER_POOL_ID` is correct
- Verify region matches (`us-east-1`)
- Check token hasn't expired
- Verify `kid` in token matches a key in JWKS

### Issue: "Key not found"
- JWKS might have rotated
- Clear JWKS cache and retry
- Verify JWKS URL is accessible

### Issue: "Invalid signature"
- Token might be from different User Pool
- Check issuer matches: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2Sqbuu4TB`

## Summary

✅ Your backend is correctly configured to use JWKS  
✅ JWKS is automatically fetched from Cognito  
✅ Keys are cached for performance  
✅ Token verification works automatically  
✅ No manual key management needed  

The JWKS you provided confirms your Cognito setup is correct and matches what the backend expects!

