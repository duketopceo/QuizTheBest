import { database } from './base'
import { logger } from '../../utils/logger'

export interface Topic {
  id: string
  userId: string
  name: string
  studySetId?: string
  createdAt: string
  updatedAt: string
}

export async function createTopic(userId: string, name: string, studySetId?: string): Promise<string> {
  try {
    const id = await database.create('topics', {
      userId,
      name,
      studySetId,
    })
    return id
  } catch (error) {
    logger.error('Error creating topic:', error)
    throw error
  }
}

export async function getTopicById(topicId: string): Promise<Topic | null> {
  try {
    return await database.getById('topics', topicId) as Topic | null
  } catch (error) {
    logger.error('Error getting topic:', error)
    throw error
  }
}

export async function getUserTopics(userId: string): Promise<Topic[]> {
  try {
    return await database.query('topics', [
      { field: 'userId', operator: '==', value: userId },
    ]) as Topic[]
  } catch (error) {
    logger.error('Error getting user topics:', error)
    throw error
  }
}

export async function updateTopic(topicId: string, data: Partial<Topic>): Promise<void> {
  try {
    await database.update('topics', topicId, data)
  } catch (error) {
    logger.error('Error updating topic:', error)
    throw error
  }
}
