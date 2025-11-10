import { Amplify } from 'aws-amplify';
import { API_URL, AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from '@env';

/**
 * Configure AWS Amplify for React Native
 * This must be called before using any Amplify Auth functions
 */
export function configureAmplify() {
  const userPoolId = COGNITO_USER_POOL_ID;
  const clientId = COGNITO_CLIENT_ID;
  const region = AWS_REGION || 'us-east-1';

  if (!userPoolId || !clientId) {
    console.warn(
      '⚠️  Cognito configuration missing. Please set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID in .env file'
    );
    return;
  }

  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: userPoolId,
          userPoolClientId: clientId,
          region: region,
          loginWith: {
            email: true,
            username: false,
            phone: false,
          },
          // OAuth configuration (if using OAuth flows)
          // Uncomment and configure if you need OAuth instead of username/password
          // signUpVerificationMethod: 'code', // or 'link'
          // userAttributes: {
          //   email: {
          //     required: true,
          //   },
          //   phoneNumber: {
          //     required: false,
          //   },
          // },
        },
      },
    });

    console.log('✅ Amplify configured successfully', {
      region,
      userPoolId: userPoolId.substring(0, 10) + '...',
    });
  } catch (error) {
    console.error('❌ Failed to configure Amplify:', error);
    throw error;
  }
}

/**
 * Get Cognito issuer URL
 * Used for token validation and OAuth flows
 */
export function getCognitoIssuerUrl(): string {
  const region = AWS_REGION || 'us-east-1';
  const userPoolId = COGNITO_USER_POOL_ID;
  
  if (!userPoolId) {
    throw new Error('COGNITO_USER_POOL_ID is not configured');
  }

  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

/**
 * Get Cognito JWKS URL
 * Used for JWT token verification
 */
export function getCognitoJwksUrl(): string {
  return `${getCognitoIssuerUrl()}/.well-known/jwks.json`;
}

