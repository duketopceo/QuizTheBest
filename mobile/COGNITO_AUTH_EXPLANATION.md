# Cognito Authentication - React Native vs Native Android

## What You Showed vs What We're Using

### Your Code Snippet (Native Android/Java)
```java
AuthorizationServiceConfiguration cognitoServiceConfig =
    AuthorizationServiceConfiguration.fetchFromIssuer(
    Uri.parse("https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2Sqbuu4TB"),
    ...
);
```

This is **native Android code** using AppAuth library for OAuth flows. It's used when building pure Android apps (not React Native).

### What We're Using (React Native)

Since your app is **React Native**, we use **AWS Amplify** which handles all the Cognito authentication automatically. You don't need the native code snippet.

## How It Works in React Native

### 1. Configuration (One-Time Setup)

**File: `src/config/amplify.ts`**
```typescript
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_2Sqbuu4TB',  // Your User Pool ID
      userPoolClientId: 'your-client-id',
      region: 'us-east-1',
    },
  },
});
```

This is called once when the app starts (in `App.tsx`).

### 2. Authentication (Already Implemented)

**File: `src/context/AuthContext.tsx`**
```typescript
// Login
const {login} = useAuth();
await login('user@example.com', 'password');

// Get current user
const {user} = useAuth();

// Get session/tokens
const session = await fetchAuthSession();
const idToken = session.tokens?.idToken?.toString();
```

### 3. API Calls (Already Implemented)

**File: `src/hooks/useApi.ts`**
```typescript
const {post} = useApi();
// Tokens are automatically included
await post('/generate', {topic: 'Math'});
```

## Key Differences

| Native Android (Your Code) | React Native (Our Setup) |
|---------------------------|-------------------------|
| Manual OAuth flow | Automatic with Amplify |
| AppAuth library | AWS Amplify SDK |
| Java/Kotlin code | TypeScript/JavaScript |
| Manual token management | Automatic token storage/refresh |
| Manual API header setup | Automatic token injection |

## Your Cognito User Pool

From your code snippet, I can see:
- **User Pool ID**: `us-east-1_2Sqbuu4TB`
- **Region**: `us-east-1`
- **Issuer URL**: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_2Sqbuu4TB`

## Setup Steps

1. **Add to `.env` file**:
   ```env
   AWS_REGION=us-east-1
   COGNITO_USER_POOL_ID=us-east-1_2Sqbuu4TB
   COGNITO_CLIENT_ID=your-client-id-here
   ```

2. **Get Client ID**:
   - AWS Console → Cognito → Your User Pool
   - App integration → App clients
   - Copy the Client ID

3. **That's it!** The app will automatically:
   - Configure Amplify on startup
   - Handle login/logout
   - Manage tokens
   - Include tokens in API calls

## What Amplify Does Automatically

✅ Fetches Cognito configuration (like your code snippet)
✅ Manages OAuth flows
✅ Stores tokens securely
✅ Refreshes tokens automatically
✅ Includes tokens in API requests
✅ Handles session management

## No Native Code Needed

You **don't need** the Java/Kotlin code you showed because:
- React Native uses JavaScript/TypeScript
- Amplify SDK handles all Cognito operations
- No need for AppAuth or manual OAuth flows
- Everything is configured in `amplify.ts`

## Testing

1. Set up `.env` with your Cognito credentials
2. Start the app
3. Check console for: `✅ Amplify configured successfully`
4. Try logging in with a test user

## Need Help?

- See `COGNITO_SETUP.md` for detailed setup
- Check `ANDROID_STUDIO_SETUP.md` for app setup
- Review `src/config/amplify.ts` for configuration

---

**TL;DR**: Your native Android code isn't needed. We use AWS Amplify which does everything automatically. Just configure your `.env` file with the Cognito credentials!

