import { database } from './base'
import { logger } from '../../utils/logger'

export interface StudySet {
  id: string
  userId: string
  topic: string
  summary: string
  flashcards: Array<{ id: string; question: string; answer: string }>
  quiz: {
    id: string
    questions: Array<{
      id: string
      type: 'multiple-choice' | 'true-false'
      question: string
      options?: string[]
      correctAnswer: string | number
      explanation?: string
    }>
  }
  createdAt: string
  updatedAt: string
}

export async function createStudySet(
  userId: string,
  topic: string,
  summary: string,
  flashcards: StudySet['flashcards'],
  quiz: StudySet['quiz']
): Promise<string> {
  try {
    const id = await database.create('studySets', {
      userId,
      topic,
      summary,
      flashcards,
      quiz,
    })
    return id
  } catch (error) {
    logger.error('Error creating study set:', error)
    throw error
  }
}

export async function getStudySetById(studySetId: string): Promise<StudySet | null> {
  try {
    return await database.getById('studySets', studySetId) as StudySet | null
  } catch (error) {
    logger.error('Error getting study set:', error)
    throw error
  }
}

export async function getUserStudySets(userId: string): Promise<StudySet[]> {
  try {
    return await database.query('studySets', [
      { field: 'userId', operator: '==', value: userId },
    ]) as StudySet[]
  } catch (error) {
    logger.error('Error getting user study sets:', error)
    throw error
  }
}

export async function updateStudySet(studySetId: string, data: Partial<StudySet>): Promise<void> {
  try {
    await database.update('studySets', studySetId, data)
  } catch (error) {
    logger.error('Error updating study set:', error)
    throw error
  }
}

export async function deleteStudySet(studySetId: string): Promise<void> {
  try {
    await database.delete('studySets', studySetId)
  } catch (error) {
    logger.error('Error deleting study set:', error)
    throw error
  }
}
