# AWS Cognito Setup for Mobile App

## Overview

The mobile app uses AWS Amplify with Cognito for authentication. This guide explains how to configure Cognito for your React Native app.

## Configuration

### 1. Environment Variables

Add these to your `mobile/.env` file:

```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_2Sqbuu4TB
COGNITO_CLIENT_ID=your-client-id-here
```

### 2. Finding Your Cognito Credentials

#### User Pool ID
1. Go to AWS Console → Cognito → User Pools
2. Select your user pool
3. Copy the **User Pool ID** (format: `us-east-1_XXXXXXXXX`)

#### Client ID
1. In your User Pool, go to **App integration** tab
2. Under **App clients**, find your app client
3. Copy the **Client ID**

### 3. Cognito User Pool Configuration

Your User Pool should be configured with:

#### App Client Settings
- **Allowed OAuth flows**: 
  - ✅ Authorization code grant
  - ✅ Implicit grant (if needed)
- **Allowed OAuth scopes**:
  - ✅ `openid`
  - ✅ `email`
  - ✅ `profile`
- **Allowed callback URLs**: 
  - For development: `myapp://` or `exp://localhost:8081`
  - For production: Your app's deep link scheme

#### Sign-in Experience
- **Username**: Email
- **Password**: Required
- **MFA**: Optional (recommended for production)

### 4. React Native Configuration

The app automatically configures Amplify using the `configureAmplify()` function in `src/config/amplify.ts`. This is called when the app starts.

#### How It Works

```typescript
// src/config/amplify.ts
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: COGNITO_USER_POOL_ID,
      userPoolClientId: COGNITO_CLIENT_ID,
      region: AWS_REGION,
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
    },
  },
});
```

### 5. Native Android Code (Not Required)

**Note**: The Java/Kotlin code you showed is for native Android apps using AppAuth. Since you're using React Native with AWS Amplify, you don't need that code.

The Amplify SDK handles:
- Token management
- Session refresh
- OAuth flows
- JWT validation

## Authentication Flow

1. **User logs in** → `AuthContext.login(email, password)`
2. **Amplify authenticates** → Calls Cognito User Pool
3. **Tokens received** → ID token, access token, refresh token
4. **Session stored** → Amplify manages token storage
5. **API calls** → Tokens automatically included in requests

## Testing Authentication

### 1. Create a Test User

In AWS Cognito Console:
1. Go to your User Pool
2. **Users** tab → **Create user**
3. Enter email and temporary password
4. User will need to change password on first login

### 2. Test Login in App

```typescript
// LoginScreen.tsx already handles this
const {login} = useAuth();
await login('test@example.com', 'TempPassword123!');
```

### 3. Verify Token

Check that tokens are being received:
```typescript
const session = await fetchAuthSession();
console.log('Tokens:', session.tokens);
```

## Troubleshooting

### Issue: "User pool not found"
- Verify `COGNITO_USER_POOL_ID` is correct
- Check region matches your user pool region

### Issue: "Invalid client"
- Verify `COGNITO_CLIENT_ID` is correct
- Check app client is enabled in Cognito

### Issue: "Network error"
- Check internet connection
- Verify Cognito User Pool is in the correct region
- Check network security config allows HTTPS

### Issue: "User does not exist"
- Create user in Cognito Console
- Or use sign-up flow (if implemented)

### Issue: "Invalid credentials"
- Check email/password are correct
- Verify user is confirmed in Cognito
- Check if user needs to change password

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use different User Pools** for dev/staging/prod
3. **Enable MFA** for production
4. **Set password policies** in Cognito
5. **Use HTTPS** in production (network security config)

## Additional Resources

- [AWS Amplify Auth Documentation](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [Cognito User Pool Setup](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-as-user-directory.html)
- [React Native Amplify Auth](https://docs.amplify.aws/react-native/build-a-backend/auth/manage-user-session/)

## Example Configuration

Based on your code snippet, your User Pool ID appears to be: `us-east-1_2Sqbuu4TB`

Your `.env` should look like:
```env
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_2Sqbuu4TB
COGNITO_CLIENT_ID=your-actual-client-id-here
```

Replace `your-actual-client-id-here` with the Client ID from your Cognito App Client.

