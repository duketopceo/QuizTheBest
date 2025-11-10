import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { getUserById, getUserByEmail, createUser, updateUser } from '../services/firestore/users'
import { getUserTopics } from '../services/firestore/topics'
import { getUserStudySets } from '../services/firestore/studySets'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Get user profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    let user = await getUserById(req.user.sub)
    
    // Create user if doesn't exist
    if (!user) {
      const userId = await createUser(req.user.sub, req.user.email, req.user.username)
      user = await getUserById(userId)
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

// Update user profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    await updateUser(req.user.sub, req.body)
    
    const user = await getUserById(req.user.sub)
    res.json({
      success: true,
      data: user,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

// Get user's saved topics
router.get('/saved-topics', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    const topics = await getUserTopics(req.user.sub)
    res.json({
      success: true,
      data: topics,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

// Get user's study progress
router.get('/progress', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
      })
    }

    const studySets = await getUserStudySets(req.user.sub)
    const topics = await getUserTopics(req.user.sub)
    
    // Calculate progress metrics
    const totalFlashcards = studySets.reduce((sum, set) => sum + set.flashcards.length, 0)
    const totalQuizzes = studySets.length
    
    res.json({
      success: true,
      data: {
        topicsStudied: topics.length,
        studySets: studySets.length,
        totalFlashcards,
        totalQuizzes,
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
