import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Get generation job status (for async operations)
router.get('/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params

    // For MVP: This is a placeholder for future async job implementation
    // Currently returns not implemented
    res.status(501).json({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Async job status checking not yet implemented. Generation is synchronous for MVP.',
      },
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

export default router
