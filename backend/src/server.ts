import app from './app'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { BEDROCK_CONFIG, BEDROCK_AGENT_CONFIG, verifyModelAvailability, verifyAgentConfig } from './config/bedrock'

// Enable debug mode
process.env.DEBUG = 'true'

logger.info('🚀 Starting QuizTheBest Backend Server...')
logger.debug('Step 1: Loading environment variables')

// Load environment variables
try {
  dotenv.config()
  logger.debug('✅ Environment variables loaded from .env')
  
  // Try to load secrets file if it exists
  try {
    dotenv.config({ path: './aws-secrets.env' })
    logger.debug('✅ Secrets file loaded (if exists)')
  } catch (e) {
    logger.debug('⚠️  Secrets file not found (optional)')
  }
} catch (error: any) {
  logger.error('❌ Failed to load environment variables', { error: error.message })
  process.exit(1)
}

logger.debug('Step 2: Checking configuration')

// Check critical environment variables
const requiredEnvVars = [
  'AWS_REGION',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
]

const missingVars: string[] = []
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName)
    logger.warn(`⚠️  Missing environment variable: ${varName}`)
  } else {
    logger.debug(`✅ ${varName} is set`)
  }
})

if (missingVars.length > 0) {
  logger.warn(`⚠️  Missing ${missingVars.length} environment variable(s) - app may not work correctly`)
}

// Log configuration
logger.debug('Step 3: Logging configuration (sanitized)')
logger.info('📋 Configuration:', {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  bedrockModel: BEDROCK_CONFIG.modelId,
  bedrockRegion: BEDROCK_CONFIG.region,
  hasBearerToken: !!BEDROCK_CONFIG.bearerToken,
  hasCognitoPool: !!process.env.COGNITO_USER_POOL_ID,
  hasCognitoClient: !!process.env.COGNITO_CLIENT_ID,
  hasFirebase: !!process.env.FIREBASE_PROJECT_ID,
})

// Verify Bedrock configuration
logger.debug('Step 4: Verifying Bedrock configuration')
try {
  verifyModelAvailability()
  logger.debug('✅ Bedrock model availability check passed')
  
  if (BEDROCK_AGENT_CONFIG.agentId) {
    verifyAgentConfig()
    logger.debug('✅ Bedrock agent configuration verified')
  } else {
    logger.warn('⚠️  Bedrock Agent ID not configured (agent features disabled)')
  }
} catch (error: any) {
  logger.error('❌ Bedrock configuration error', { error: error.message })
}

logger.debug('Step 5: Initializing Express app')
const PORT = process.env.PORT || 3000

logger.debug('Step 6: Starting HTTP server')
app.listen(PORT, () => {
  logger.info('✅ Server started successfully!')
  logger.info(`🌐 Server running on port ${PORT}`)
  logger.info(`📍 Health check: http://localhost:${PORT}/health`)
  logger.info(`📚 API base: http://localhost:${PORT}/api`)
  logger.info('🔍 Debug mode: ENABLED')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})

// Handle startup errors
process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception - Server will exit', {
    error: error.message,
    stack: error.stack,
  })
  process.exit(1)
})

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('❌ Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  })
})

logger.debug('Step 7: Server initialization complete')
