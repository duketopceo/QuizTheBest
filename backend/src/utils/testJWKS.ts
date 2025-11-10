/**
 * Test script to verify JWKS from Cognito
 * 
 * Usage: npx tsx src/utils/testJWKS.ts
 * 
 * This script verifies that the JWKS from Cognito matches expected keys.
 */

import { fetchJWKSFromCognito, verifyJWKSStructure, verifyJWKSMatch } from './jwksVerifier'

// Your expected JWKS (from the user's input)
const expectedJWKS = {
  keys: [
    {
      alg: "RS256",
      e: "AQAB",
      kid: "NQLkfu4oJ8Xfnq9xAoe4Z2r6qO/xGimx0nYMCioNosk=",
      kty: "RSA",
      n: "5KklWd7-AM4yPkzuDYHYM225S_2CrzTFNPAJAOicTScRTCJUKARAq9CjTDlHZ7VfZO7KNKZFF374X9eaXHM5Wpm6bkgcRdUBC9ifgB5awLq-U9E2SnIAzugFpce-meRytpyr3pFXkMnHO3NmmYcLGGhgtX78v4-jn7LGXMODndPe1x9FZF6fEoKpdUpCztPXpTtoJ-dZraS9YsPIVgIdYuB7CyOZU1bMXnC8xwXeE5-dalCN8KtIRFOAPkcZ3fwdq64gG00R9Izu8eV0qEjuD-bFFRY0b_-UCiT3W_SAV1Mj--AT2-bp_eTOF-96GWm2SuOWu6iIbMjsmGObhd6REw",
      use: "sig"
    },
    {
      alg: "RS256",
      e: "AQAB",
      kid: "I4rVxBK+J1LsgYlz4U32uKOlOiRszxsC57/o5XW3Gd4=",
      kty: "RSA",
      n: "urVnZcCTjK_jpIDpmihTX4Is52HQe_0Ssl30S34SqrfR9FNVi-1N1ls_niK5PBCVhYWWUik0_5wRYY-jdVEehwnca5iXa03ikwoJEfNHDy6HFJhnoW1nhxT_m8m5HA96YqW9LM1opHShReLY-5TmKRy8NTS7ZWlZkNwhMNzY-ChdP9gvkjcVIMQBdcMO2NXJq6iMsEJCRH3yPR527LP2wbzjXW3N_yU9qoonyNtlO0SVy4dIdvByLFgLOqmlmP5-lJFWeKpRmeoRq3bEzJmqwrrCjLf36gaWoy37jPjMNYTQ77kQ9cNTRSUgHumg4luC5nHs80yBAfbtOdxOe5oKTQ",
      use: "sig"
    }
  ]
}

async function testJWKS() {
  const region = process.env.AWS_REGION || 'us-east-1'
  const userPoolId = process.env.COGNITO_USER_POOL_ID || 'us-east-1_2Sqbuu4TB'

  console.log('🔍 Testing JWKS Verification...\n')
  console.log(`Region: ${region}`)
  console.log(`User Pool ID: ${userPoolId}\n`)

  try {
    // Test 1: Fetch JWKS from Cognito
    console.log('📥 Fetching JWKS from Cognito...')
    const actualJWKS = await fetchJWKSFromCognito(region, userPoolId)
    console.log(`✅ Fetched ${actualJWKS.keys.length} keys\n`)

    // Test 2: Verify structure
    console.log('🔍 Verifying JWKS structure...')
    const isValid = verifyJWKSStructure(actualJWKS)
    if (isValid) {
      console.log('✅ JWKS structure is valid\n')
    } else {
      console.log('❌ JWKS structure is invalid\n')
      return
    }

    // Test 3: Compare with expected JWKS
    console.log('🔍 Comparing with expected JWKS...')
    const matches = await verifyJWKSMatch(region, userPoolId, expectedJWKS)
    if (matches) {
      console.log('✅ JWKS matches expected keys\n')
    } else {
      console.log('⚠️  JWKS does not fully match (keys may have rotated)\n')
    }

    // Display key IDs
    console.log('📋 Key IDs in Cognito JWKS:')
    actualJWKS.keys.forEach((key, index) => {
      console.log(`  ${index + 1}. ${key.kid}`)
    })

    console.log('\n✅ JWKS verification complete!')
  } catch (error: any) {
    console.error('❌ JWKS verification failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  testJWKS()
}

export { testJWKS }

