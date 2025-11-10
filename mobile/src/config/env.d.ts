/**
 * Type definitions for environment variables
 * Used with react-native-dotenv
 */
declare module '@env' {
  export const API_URL: string;
  export const AWS_REGION: string;
  export const COGNITO_USER_POOL_ID: string;
  export const COGNITO_CLIENT_ID: string;
  export const COGNITO_REDIRECT_URI?: string; // Optional: for OAuth flows
  export const DEBUG: string;
}

