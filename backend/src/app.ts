import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from './middleware/errorHandler'
import { securityMiddleware, agentSecurityMiddleware } from './middleware/security'
import { rateLimiter } from './middleware/rateLimiter'
import { corsConfig } from './middleware/cors'

// Routes
import searchRoutes from './routes/search'
import generateRoutes from './routes/generate'
import generateStatusRoutes from './routes/generateStatus'
import quizRoutes from './routes/quiz'
import userRoutes from './routes/user'
import exportRoutes from './routes/export'
import studySetRoutes from './routes/studySets'
import aiRoutes from './routes/ai'

const app = express()

// Security middleware
app.use(helmet())
app.use(securityMiddleware)
app.use(agentSecurityMiddleware)
app.use(cors(corsConfig))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
app.use(rateLimiter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// API routes
app.use('/api/search', searchRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/generate/status', generateStatusRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/user', userRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/study-sets', studySetRoutes)
app.use('/api/ai', aiRoutes)

// Error handling (must be last)
app.use(errorHandler)

export default app
