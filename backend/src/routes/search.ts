import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { strictRateLimiter } from '../middleware/rateLimiter'
import { searchOrchestrator } from '../services/search/searchOrchestrator'

const router = Router()

// All routes require authentication and strict rate limiting
router.use(authMiddleware)
router.use(strictRateLimiter)

// Search endpoint
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Query is required' },
      })
    }

    const results = await searchOrchestrator.search(query)
    
    res.json({
      success: true,
      data: results,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SEARCH_ERROR', message: error.message },
    })
  }
})

export default router
