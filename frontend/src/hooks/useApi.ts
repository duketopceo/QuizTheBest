import { useAuth } from '../context/AuthContext'
import { fetchAuthSession } from 'aws-amplify/auth'
import { apiClient } from '../services/api'

export function useApi() {
  const { refreshSession } = useAuth()

  const get = async (endpoint: string) => {
    try {
      const session = await fetchAuthSession()
      return await apiClient.get(endpoint, session.tokens?.idToken?.toString())
    } catch (error: any) {
      if (error.status === 401) {
        // Try refreshing session
        await refreshSession()
        const session = await fetchAuthSession()
        return await apiClient.get(endpoint, session.tokens?.idToken?.toString())
      }
      throw error
    }
  }

  const post = async (endpoint: string, data: any) => {
    try {
      const session = await fetchAuthSession()
      return await apiClient.post(endpoint, data, session.tokens?.idToken?.toString())
    } catch (error: any) {
      if (error.status === 401) {
        await refreshSession()
        const session = await fetchAuthSession()
        return await apiClient.post(endpoint, data, session.tokens?.idToken?.toString())
      }
      throw error
    }
  }

  const put = async (endpoint: string, data: any) => {
    try {
      const session = await fetchAuthSession()
      return await apiClient.put(endpoint, data, session.tokens?.idToken?.toString())
    } catch (error: any) {
      if (error.status === 401) {
        await refreshSession()
        const session = await fetchAuthSession()
        return await apiClient.put(endpoint, data, session.tokens?.idToken?.toString())
      }
      throw error
    }
  }

  const del = async (endpoint: string) => {
    try {
      const session = await fetchAuthSession()
      return await apiClient.delete(endpoint, session.tokens?.idToken?.toString())
    } catch (error: any) {
      if (error.status === 401) {
        await refreshSession()
        const session = await fetchAuthSession()
        return await apiClient.delete(endpoint, session.tokens?.idToken?.toString())
      }
      throw error
    }
  }

  return { get, post, put, delete: del }
}
