import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { strictRateLimiter } from '../middleware/rateLimiter'
import { agentOrchestrator } from '../services/ai/agentOrchestrator'
import { actionGroupCallbackHandler } from '../services/ai/actionGroupHandler'
import { logger } from '../utils/logger'
import { contentSanitizer } from '../utils/contentSanitizer'

const router = Router()

/**
 * Action Group Callback Endpoint
 * 
 * This endpoint is called by Bedrock Agent when action groups are invoked.
 * It should be configured in the Bedrock Agent action group settings with:
 * - API endpoint: https://your-api.com/api/ai/action-group-callback
 * - Authentication: Bearer token (uses authMiddleware)
 */
router.post(
  '/action-group-callback',
  authMiddleware,
  actionGroupCallbackHandler()
)

/**
 * Generate Study Set using Bedrock Agent
 * 
 * POST /api/ai/studyset
 * 
 * Body:
 * {
 *   "topic": "string",
 *   "options": {
 *     "includeSummary": boolean,
 *     "flashcardCount": number,
 *     "quizQuestionCount": number
 *   }
 * }
 */
router.post('/studyset', authMiddleware, strictRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      })
    }

    const { topic, options } = req.body

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Topic is required and must be a non-empty string',
        },
      })
    }

    // Sanitize topic
    const sanitizedTopic = contentSanitizer.sanitize(topic.trim())
    if (!contentSanitizer.validate(sanitizedTopic)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Topic contains invalid content',
        },
      })
    }

    // Validate options if provided
    if (options) {
      if (options.flashcardCount && (typeof options.flashcardCount !== 'number' || options.flashcardCount < 1 || options.flashcardCount > 50)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'flashcardCount must be between 1 and 50',
          },
        })
      }

      if (options.quizQuestionCount && (typeof options.quizQuestionCount !== 'number' || options.quizQuestionCount < 1 || options.quizQuestionCount > 20)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'quizQuestionCount must be between 1 and 20',
          },
        })
      }
    }

    logger.info('Study set generation request', {
      userId: req.user.sub,
      topic: sanitizedTopic,
      hasOptions: !!options,
    })

    // Generate study set using agent
    const result = await agentOrchestrator.generateStudySet({
      topic: sanitizedTopic,
      options: {
        includeSummary: options?.includeSummary ?? true,
        flashcardCount: options?.flashcardCount ?? 10,
        quizQuestionCount: options?.quizQuestionCount ?? 5,
        timeout: 300000, // 5 minutes
      },
    })

    // Validate result
    if (!agentOrchestrator.validateResult(result)) {
      logger.warn('Generated study set failed validation', {
        userId: req.user.sub,
        topic: sanitizedTopic,
        sessionId: result.sessionId,
      })

      return res.status(500).json({
        success: false,
        error: {
          code: 'GENERATION_VALIDATION_FAILED',
          message: 'Generated content failed validation. Please try again.',
        },
      })
    }

    // Return success response
    res.json({
      success: true,
      data: {
        topic: sanitizedTopic,
        summary: result.summary,
        flashcards: result.flashcards,
        quiz: result.quiz,
        metadata: {
          sessionId: result.sessionId,
          traceId: result.traceId,
          ...result.metadata,
        },
      },
    })
  } catch (error: any) {
    logger.error('Study set generation error', {
      userId: req.user?.sub,
      error: error.message,
      stack: error.stack,
    })

    // Handle specific error types
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Study set generation timed out. Please try a simpler topic or try again later.',
        },
      })
    }

    if (error.message.includes('throttled') || error.message.includes('ThrottlingException')) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Service is currently busy. Please try again in a few moments.',
        },
      })
    }

    if (error.message.includes('Access denied') || error.message.includes('AccessDeniedException')) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Agent configuration error. Please contact support.',
        },
      })
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: process.env.NODE_ENV === 'production'
          ? 'Failed to generate study set. Please try again.'
          : error.message,
      },
    })
  }
})

export default router

