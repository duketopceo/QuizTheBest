import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from './middleware/errorHandler'
import { securityMiddleware, agentSecurityMiddleware } from './middleware/security'
import { rateLimiter } from './middleware/rateLimiter'
import { corsConfig } from './middleware/cors'
import { logger } from './utils/logger'

// Routes
import searchRoutes from './routes/search'
import generateRoutes from './routes/generate'
import generateStatusRoutes from './routes/generateStatus'
import quizRoutes from './routes/quiz'
import userRoutes from './routes/user'
import exportRoutes from './routes/export'
import studySetRoutes from './routes/studySets'
import aiRoutes from './routes/ai'

logger.debug('📦 Creating Express application instance')
const app = express()

logger.debug('🔒 Step 1: Setting up security middleware')
try {
  app.use(helmet())
  logger.debug('✅ Helmet security headers configured')
  
  app.use(securityMiddleware)
  logger.debug('✅ Custom security middleware configured')
  
  app.use(agentSecurityMiddleware)
  logger.debug('✅ Agent security middleware configured')
  
  app.use(cors(corsConfig))
  logger.debug('✅ CORS configured')
} catch (error: any) {
  logger.error('❌ Security middleware setup failed', { error: error.message, stack: error.stack })
  throw error
}

logger.debug('📥 Step 2: Setting up body parsing middleware')
try {
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  logger.debug('✅ Body parsing middleware configured')
} catch (error: any) {
  logger.error('❌ Body parsing middleware setup failed', { error: error.message })
  throw error
}

logger.debug('⏱️  Step 3: Setting up rate limiting')
try {
  app.use(rateLimiter)
  logger.debug('✅ Rate limiter configured')
} catch (error: any) {
  logger.error('❌ Rate limiter setup failed', { error: error.message })
  throw error
}

logger.debug('🏥 Step 4: Setting up health check endpoint')
app.get('/health', (req, res) => {
  logger.debug('Health check requested')
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

logger.debug('🛣️  Step 5: Registering API routes')
const routes = [
  { path: '/api/search', name: 'Search', route: searchRoutes },
  { path: '/api/generate', name: 'Generate', route: generateRoutes },
  { path: '/api/generate/status', name: 'Generate Status', route: generateStatusRoutes },
  { path: '/api/quiz', name: 'Quiz', route: quizRoutes },
  { path: '/api/user', name: 'User', route: userRoutes },
  { path: '/api/export', name: 'Export', route: exportRoutes },
  { path: '/api/study-sets', name: 'Study Sets', route: studySetRoutes },
  { path: '/api/ai', name: 'AI', route: aiRoutes },
]

routes.forEach(({ path, name, route }) => {
  try {
    app.use(path, route)
    logger.debug(`✅ Route registered: ${path} (${name})`)
  } catch (error: any) {
    logger.error(`❌ Failed to register route: ${path}`, { 
      error: error.message,
      stack: error.stack,
    })
  }
})

logger.debug('⚠️  Step 6: Setting up error handler (must be last)')
try {
  app.use(errorHandler)
  logger.debug('✅ Error handler configured')
} catch (error: any) {
  logger.error('❌ Error handler setup failed', { error: error.message })
  throw error
}

logger.debug('✅ Express app configuration complete')
export default app
