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

/**
 * AWS Bedrock Agent configuration
 * Agent ID and Alias should be configured in AWS Bedrock console
 */
export const BEDROCK_AGENT_CONFIG = {
  agentId: process.env.BEDROCK_AGENT_ID || '',
  agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID || 'TSTALIASID',
  sessionIdPrefix: 'quizthebest',
  maxIterations: parseInt(process.env.BEDROCK_AGENT_MAX_ITERATIONS || '20', 10),
  timeout: parseInt(process.env.BEDROCK_AGENT_TIMEOUT || '300000', 10), // 5 minutes
  enableTrace: process.env.BEDROCK_AGENT_ENABLE_TRACE === 'true',
}

// Verify model availability
// Note: In production, verify model availability in Bedrock console before deployment
export function verifyModelAvailability(): boolean {
  // This should be checked against AWS Bedrock API or console
  // For now, return true and log a warning
  console.warn('⚠️  Verify AWS Nova Micro 1 model availability in Bedrock console for region:', BEDROCK_CONFIG.region)
  return true
}

// Verify agent configuration
export function verifyAgentConfig(): boolean {
  if (!BEDROCK_AGENT_CONFIG.agentId) {
    console.error('❌ BEDROCK_AGENT_ID environment variable is required')
    return false
  }
  return true
}
