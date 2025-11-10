# Cognito Credentials - Quick Reference

## Your Cognito Configuration

Based on the code snippets you provided, here are your Cognito credentials:

### User Pool ID
```
us-east-1_2Sqbuu4TB
```

### Client ID
```
5195pa6st8trd1cn5g65sbnjns
```

### Region
```
us-east-1
```

### Redirect URI (for OAuth)
```
https://d84l1y8p4kdic.cloudfront.net
```

### OAuth Scopes
```
phone openid email
```

## Environment Variables Setup

Create or update `mobile/.env`:

```env
# AWS Configuration
AWS_REGION=us-east-1

# Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_2Sqbuu4TB
COGNITO_CLIENT_ID=5195pa6st8trd1cn5g65sbnjns

# Optional: OAuth redirect (if using OAuth)
COGNITO_REDIRECT_URI=https://d84l1y8p4kdic.cloudfront.net

# Backend API
API_URL=http://10.0.2.2:3000/api
```

## Cognito Console Configuration

### App Client Settings

1. Go to AWS Console → Cognito → Your User Pool
2. Navigate to **App integration** → **App clients**
3. Select your app client (ID: `5195pa6st8trd1cn5g65sbnjns`)
4. Verify settings:

**Allowed OAuth flows:**
- ✅ Authorization code grant
- ✅ Implicit grant (if using OAuth)

**Allowed OAuth scopes:**
- ✅ `openid`
- ✅ `email`
- ✅ `phone`
- ✅ `profile` (optional)

**Allowed callback URLs:**
- `https://d84l1y8p4kdic.cloudfront.net`
- For React Native development: `myapp://` or `exp://localhost:8081`

**Allowed sign-out URLs:**
- `https://d84l1y8p4kdic.cloudfront.net`

## Testing

After setting up `.env`, test authentication:

```typescript
// In your app
const {login} = useAuth();
await login('your-email@example.com', 'your-password');
```

## Important Notes

1. **Don't commit `.env`** - It's already in `.gitignore`
2. **Use different credentials** for dev/staging/prod
3. **Keep Client ID secret** - Don't expose in client-side code (though it's visible in compiled apps)
4. **User Pool ID is public** - Safe to include in client code

## Verification

Check that Amplify is configured correctly:

1. Start the app
2. Check console logs for: `✅ Amplify configured successfully`
3. Try logging in with a test user

## Troubleshooting

### "User pool not found"
- Verify `COGNITO_USER_POOL_ID` matches exactly
- Check region is correct (`us-east-1`)

### "Invalid client"
- Verify `COGNITO_CLIENT_ID` is correct
- Check app client is enabled in Cognito

### "Redirect URI mismatch"
- Verify redirect URI in Cognito matches your app
- For React Native, you may need custom scheme (e.g., `myapp://`)

