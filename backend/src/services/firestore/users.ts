import { database } from './base'
import { logger } from '../../utils/logger'

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
  updatedAt: string
}

export async function createUser(userId: string, email: string, username: string): Promise<string> {
  try {
    const id = await database.create('users', {
      id: userId,
      email,
      username,
    })
    return id
  } catch (error) {
    logger.error('Error creating user:', error)
    throw error
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    return await database.getById('users', userId)
  } catch (error) {
    logger.error('Error getting user:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await database.query('users', [
      { field: 'email', operator: '==', value: email },
    ])
    return users.length > 0 ? (users[0] as User) : null
  } catch (error) {
    logger.error('Error getting user by email:', error)
    throw error
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  try {
    await database.update('users', userId, data)
  } catch (error) {
    logger.error('Error updating user:', error)
    throw error
  }
}
