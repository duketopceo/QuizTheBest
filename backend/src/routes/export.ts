import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { getStudySetById } from '../services/firestore/studySets'
import { exportToCSV, exportToJSON } from '../services/export/exporters'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Export study set as CSV (flashcards)
router.get('/:studySetId/csv', async (req: AuthRequest, res: Response) => {
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

    const csv = exportToCSV(studySet.flashcards)
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${studySet.topic}-flashcards.csv"`)
    res.send(csv)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_ERROR', message: error.message },
    })
  }
})

// Export study set as JSON
router.get('/:studySetId/json', async (req: AuthRequest, res: Response) => {
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

    const json = exportToJSON(studySet)
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${studySet.topic}-study-set.json"`)
    res.send(json)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'EXPORT_ERROR', message: error.message },
    })
  }
})

export default router
