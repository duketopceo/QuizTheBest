import { fetchAuthSession, signIn, signOut, getCurrentUser } from 'aws-amplify/auth'
import { Amplify } from 'aws-amplify'

// Configure Amplify
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      loginWith: {
        email: true,
      },
    },
  },
}

Amplify.configure(amplifyConfig)

export async function refreshToken() {
  try {
    const session = await fetchAuthSession({ forceRefresh: true })
    return session.tokens
  } catch (error) {
    console.error('Token refresh failed:', error)
    throw error
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() || null
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}

export { signIn, signOut, getCurrentUser, fetchAuthSession }
