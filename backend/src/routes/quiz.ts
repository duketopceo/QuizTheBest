import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { getStudySetById } from '../services/firestore/studySets'
import { generateQuiz } from '../services/ai/quizGenerator'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Generate quiz from study set
router.post('/:studySetId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    const { studySetId } = req.params
    const studySet = await getStudySetById(studySetId)

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

    // Generate new quiz from study set content
    const quiz = await generateQuiz(studySet.summary, studySet.flashcards)

    res.json({
      success: true,
      data: quiz,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'QUIZ_ERROR', message: error.message },
    })
  }
})

export default router
