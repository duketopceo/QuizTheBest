import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchAuthSession, signIn, signOut, getCurrentUser } from 'aws-amplify/auth'
import type { AuthUser } from 'aws-amplify/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      // Check if session is valid and refresh if needed
      try {
        const session = await fetchAuthSession()
        if (!session.tokens) {
          // Session expired, try to refresh
          await refreshSession()
        }
      } catch (error) {
        console.error('Session check failed:', error)
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const session = await fetchAuthSession({ forceRefresh: true })
      if (session.tokens) {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
    
    // Set up periodic session refresh (every 5 minutes)
    const interval = setInterval(() => {
      if (user) {
        refreshSession()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn } = await signIn({ username: email, password })
      if (isSignedIn) {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
