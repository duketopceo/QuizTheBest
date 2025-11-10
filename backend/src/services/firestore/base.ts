import admin from 'firebase-admin'
import { logger } from '../../utils/logger'

/**
 * Database abstraction layer for future migration flexibility
 * This allows us to swap out Firestore for another database without changing business logic
 */

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    })
  } catch (error) {
    logger.error('Firebase initialization error:', error)
  }
}

const db = admin.firestore()

export interface DatabaseAdapter {
  create(collection: string, data: any): Promise<string>
  getById(collection: string, id: string): Promise<any | null>
  update(collection: string, id: string, data: any): Promise<void>
  delete(collection: string, id: string): Promise<void>
  query(collection: string, filters: any[]): Promise<any[]>
}

class FirestoreAdapter implements DatabaseAdapter {
  async create(collection: string, data: any): Promise<string> {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return docRef.id
  }

  async getById(collection: string, id: string): Promise<any | null> {
    const doc = await db.collection(collection).doc(id).get()
    if (!doc.exists) {
      return null
    }
    return { id: doc.id, ...doc.data() }
  }

  async update(collection: string, id: string, data: any): Promise<void> {
    await db.collection(collection).doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  }

  async delete(collection: string, id: string): Promise<void> {
    await db.collection(collection).doc(id).delete()
  }

  async query(collection: string, filters: any[]): Promise<any[]> {
    let query: admin.firestore.Query = db.collection(collection)
    
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value)
    })
    
    const snapshot = await query.get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
}

export const database: DatabaseAdapter = new FirestoreAdapter()
export { db }
