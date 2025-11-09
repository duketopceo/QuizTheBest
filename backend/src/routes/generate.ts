import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { strictRateLimiter } from '../middleware/rateLimiter'
import { generateOrchestrator } from '../services/generation/orchestrator'
import { createTopic } from '../services/firestore/topics'
import { createStudySet } from '../services/firestore/studySets'

const router = Router()

// All routes require authentication and strict rate limiting
router.use(authMiddleware)
router.use(strictRateLimiter)

// Generate study materials endpoint
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    const { topic } = req.body

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Topic is required' },
      })
    }

    // For MVP: synchronous processing with timeout protection
    // In future, this can be made async with job queue
    try {
      const materials = await generateOrchestrator.generate(topic, {
        timeout: 300000, // 5 minutes timeout
      })

      // Save to database
      const studySetId = await createStudySet(
        req.user.sub,
        topic,
        materials.summary,
        materials.flashcards,
        materials.quiz
      )

      const topicId = await createTopic(req.user.sub, topic, studySetId)

      res.json({
        success: true,
        data: {
          ...materials,
          studySetId,
          topicId,
        },
      })
    } catch (timeoutError: any) {
      // If timeout, return job ID for polling (future async implementation)
      if (timeoutError.message.includes('timeout')) {
        // For MVP, return error - async jobs can be added post-MVP
        return res.status(504).json({
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Generation timed out. Please try a simpler topic or try again later.',
          },
        })
      }
      throw timeoutError
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: error.message },
    })
  }
})

export default router
