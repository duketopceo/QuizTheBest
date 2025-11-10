# OAuth Setup Guide - React Native vs Native Android

## Important: You Don't Need Native Android Code!

The native Android code you showed (AppAuth, AuthorizationRequest, etc.) is **NOT needed** for React Native. AWS Amplify handles all OAuth flows automatically.

## Current Setup: Username/Password Authentication

Your app currently uses **username/password authentication** (not OAuth). This is simpler and works great for most apps.

### How It Works (Already Implemented)

```typescript
// Login with email/password
const {login} = useAuth();
await login('user@example.com', 'password123');

// Amplify automatically:
// 1. Authenticates with Cognito
// 2. Gets tokens (ID token, access token, refresh token)
// 3. Stores tokens securely
// 4. Refreshes tokens automatically
```

## If You Want OAuth Instead

If you need OAuth flows (social login, redirect-based auth), here's how to set it up in React Native:

### 1. Update Amplify Configuration

**File: `src/config/amplify.ts`**

For OAuth, you would configure it like this (currently commented out):

```typescript
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: userPoolId,
      userPoolClientId: clientId,
      region: region,
      // OAuth configuration
      oauth: {
        domain: 'your-cognito-domain.auth.us-east-1.amazoncognito.com',
        scopes: ['phone', 'email', 'openid', 'profile'],
        redirectSignIn: ['https://d84l1y8p4kdic.cloudfront.net'],
        redirectSignOut: ['https://d84l1y8p4kdic.cloudfront.net'],
        responseType: 'code', // or 'token'
      },
    },
  },
});
```

### 2. Update AndroidManifest for Deep Links

**File: `android/app/src/main/AndroidManifest.xml`**

Add intent filter for OAuth redirects (currently commented out):

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="d84l1y8p4kdic.cloudfront.net" />
</intent-filter>
```

### 3. Use OAuth in Your Code

```typescript
import { signInWithRedirect } from 'aws-amplify/auth';

// Sign in with OAuth
await signInWithRedirect({ provider: 'Google' }); // or 'Facebook', etc.

// Handle redirect callback
import { getCurrentUser } from 'aws-amplify/auth';
const user = await getCurrentUser();
```

## Your Cognito Configuration

Based on your code snippets, here's what you have:

- **Client ID**: `5195pa6st8trd1cn5g65sbnjns`
- **Redirect URI**: `https://d84l1y8p4kdic.cloudfront.net`
- **Scopes**: `phone openid email`
- **Response Type**: `CODE` (authorization code flow)

### Cognito App Client Settings

In AWS Cognito Console, your app client should have:

1. **Allowed OAuth flows**:
   - ✅ Authorization code grant
   - ✅ Implicit grant (if needed)

2. **Allowed OAuth scopes**:
   - ✅ `openid`
   - ✅ `email`
   - ✅ `phone`
   - ✅ `profile` (if needed)

3. **Allowed callback URLs**:
   - `https://d84l1y8p4kdic.cloudfront.net`
   - For development: `myapp://` or `exp://localhost:8081`

4. **Allowed sign-out URLs**:
   - `https://d84l1y8p4kdic.cloudfront.net`

## Comparison: Native Android vs React Native

### Native Android (Your Code - NOT NEEDED)

```java
// Manual OAuth flow
AuthorizationRequest.Builder authRequestBuilder = 
    new AuthorizationRequest.Builder(...)
    .setScope("phone openid email");

AuthorizationService authService = new AuthorizationService(this);
Intent authIntent = authService.getAuthorizationRequestIntent(authRequest);
startActivityForResult(authIntent, INIT_AUTH);

// Manual token exchange
authService.performTokenRequest(...);

// Manual logout
EndSessionRequest endSessionRequest = new EndSessionRequest.Builder(...);
```

### React Native (What You're Using - AUTOMATIC)

```typescript
// Simple login (current setup)
await signIn({username: email, password});

// Or OAuth (if configured)
await signInWithRedirect({ provider: 'Google' });

// Automatic token management
const session = await fetchAuthSession(); // Gets tokens automatically

// Simple logout
await signOut(); // Handles end session automatically
```

## What Amplify Does Automatically

✅ **Authorization Request** - Handled by Amplify  
✅ **Token Exchange** - Automatic after OAuth callback  
✅ **Token Storage** - Secure storage in AsyncStorage  
✅ **Token Refresh** - Automatic refresh before expiry  
✅ **End Session** - Handled by `signOut()`  
✅ **Deep Link Handling** - Automatic redirect processing  

## Recommendation

**Stick with username/password authentication** (current setup) unless you specifically need:
- Social login (Google, Facebook, etc.)
- SAML/OIDC providers
- Custom OAuth flows

Your current implementation is simpler, more secure, and easier to maintain.

## Environment Variables

Your `.env` file should have:

```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_2Sqbuu4TB
COGNITO_CLIENT_ID=5195pa6st8trd1cn5g65sbnjns
```

## Testing

### Current Setup (Username/Password)
```typescript
const {login} = useAuth();
await login('test@example.com', 'Password123!');
```

### If Using OAuth
```typescript
import { signInWithRedirect } from 'aws-amplify/auth';
await signInWithRedirect({ provider: 'Google' });
```

## Summary

- ❌ **Don't use** the native Android AppAuth code
- ✅ **Use** AWS Amplify (already configured)
- ✅ **Current setup** uses username/password (simpler)
- ✅ **OAuth available** if needed (just uncomment config)

All the complex OAuth flows in your native code are handled automatically by Amplify!

