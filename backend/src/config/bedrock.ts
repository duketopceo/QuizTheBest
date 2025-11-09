/**
 * AWS Bedrock configuration
 * Model: AWS Nova Micro 1 (verify availability in chosen region)
 * Recommended Region: us-east-1
 */
export const BEDROCK_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  modelId: process.env.BEDROCK_MODEL_ID || 'amazon.nova-micro-v1:0',
  maxTokens: parseInt(process.env.BEDROCK_MAX_TOKENS || '2000', 10),
  temperature: 0.7,
  topP: 0.9,
}

// Verify model availability
// Note: In production, verify model availability in Bedrock console before deployment
export function verifyModelAvailability(): boolean {
  // This should be checked against AWS Bedrock API or console
  // For now, return true and log a warning
  console.warn('⚠️  Verify AWS Nova Micro 1 model availability in Bedrock console for region:', BEDROCK_CONFIG.region)
  return true
}
