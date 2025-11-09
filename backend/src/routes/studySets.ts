import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { getStudySetById, createStudySet, getUserStudySets } from '../services/firestore/studySets'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Get study set by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    const { id } = req.params
    const studySet = await getStudySetById(id)

    if (!studySet) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Study set not found' },
      })
    }

    if (studySet.userId !== req.user.sub) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      })
    }

    res.json({
      success: true,
      data: studySet,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

// Create study set
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    const { topic, summary, flashcards, quiz } = req.body

    if (!topic || !summary || !flashcards || !quiz) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Missing required fields' },
      })
    }

    const studySetId = await createStudySet(
      req.user.sub,
      topic,
      summary,
      flashcards,
      quiz
    )

    const studySet = await getStudySetById(studySetId)

    res.json({
      success: true,
      data: studySet,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

// Get user's study sets
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    const studySets = await getUserStudySets(req.user.sub)

    res.json({
      success: true,
      data: studySets,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

export default router
