/**
 * AWS Bedrock configuration
 * Model: Mistral 7B (verify availability in chosen region)
 * Recommended Region: us-east-1
 */
export const BEDROCK_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  modelId: process.env.BEDROCK_MODEL_ID || 'mistral.mistral-7b-instruct-v0:1',
  maxTokens: parseInt(process.env.BEDROCK_MAX_TOKENS || '2000', 10),
  temperature: 0.7,
  topP: 0.9,
}

// Verify model availability
// Note: In production, verify model availability in Bedrock console before deployment
export function verifyModelAvailability(): boolean {
  // This should be checked against AWS Bedrock API or console
  // For now, return true and log a warning
  console.warn('⚠️  Verify Mistral 7B model availability in Bedrock console for region:', BEDROCK_CONFIG.region)
  return true
}
