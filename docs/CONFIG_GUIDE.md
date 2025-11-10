# Configuration Guide

## Quick Reference: What Needs Your Input

When you open `config.json`, look for these placeholders - they **REQUIRE YOUR INPUT**:

### Backend Section (All Required)

- `YOUR_AWS_ACCESS_KEY_ID_HERE` → Your AWS Access Key ID
- `YOUR_AWS_SECRET_ACCESS_KEY_HERE` → Your AWS Secret Access Key  
- `us-east-1_YOUR_POOL_ID_HERE` → Your Cognito User Pool ID
- `YOUR_COGNITO_CLIENT_ID_HERE` → Your Cognito Client ID
- `YOUR_FIREBASE_PROJECT_ID_HERE` → Your Firebase Project ID
- `-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----` → Your Firebase Private Key
- `firebase-adminsdk-xxxxx@YOUR_PROJECT.iam.gserviceaccount.com` → Your Firebase Client Email
- `YOUR_BEDROCK_AGENT_ID_HERE` → Your Bedrock Agent ID
- `YOUR_BEDROCK_AGENT_ALIAS_ID_HERE` → Your Bedrock Agent Alias ID

### Frontend Section (All Required)

- `http://localhost:3000/api` → Update if your backend URL is different
- `us-east-1` → Should match backend AWS_REGION
- `us-east-1_YOUR_POOL_ID_HERE` → Should match backend COGNITO_USER_POOL_ID
- `YOUR_COGNITO_CLIENT_ID_HERE` → Should match backend COGNITO_CLIENT_ID

### Mobile Section (All Required)

- `http://localhost:3000/api` → Update if your backend URL is different (use `10.0.2.2` for Android emulator)
- `us-east-1` → Should match backend AWS_REGION
- `us-east-1_YOUR_POOL_ID_HERE` → Should match backend COGNITO_USER_POOL_ID
- `YOUR_COGNITO_CLIENT_ID_HERE` → Should match backend COGNITO_CLIENT_ID

### Optional Values (Can Leave Defaults)

These have defaults and can be left as-is:
- `BEDROCK_MODEL_ID`: `amazon.nova-micro-v1:0` (default)
- `BEDROCK_MAX_TOKENS`: `2000` (default)
- `SERPAPI_KEY`: Leave empty if not using SerpAPI
- `PORT`: `3000` (default)
- `NODE_ENV`: `development` (default)
- `ALLOWED_ORIGINS`: `http://localhost:5173,http://localhost:3000` (default)

## Where to Find Each Value

See [CONFIG_SETUP.md](CONFIG_SETUP.md) for detailed instructions on where to find each value in AWS Console, Firebase Console, etc.
