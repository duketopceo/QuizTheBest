# Configuration File Comments Guide

Since JSON doesn't support comments, this file explains what each value in `config.json` means and which ones **REQUIRE YOUR INPUT**.

## Backend Section

### ✅ REQUIRES YOUR INPUT (Replace placeholders):

- **`AWS_ACCESS_KEY_ID`**: `YOUR_AWS_ACCESS_KEY_ID_HERE` → Your AWS Access Key ID
- **`AWS_SECRET_ACCESS_KEY`**: `YOUR_AWS_SECRET_ACCESS_KEY_HERE` → Your AWS Secret Access Key
- **`COGNITO_USER_POOL_ID`**: `us-east-1_YOUR_POOL_ID_HERE` → Your Cognito User Pool ID
- **`COGNITO_CLIENT_ID`**: `YOUR_COGNITO_CLIENT_ID_HERE` → Your Cognito Client ID
- **`FIREBASE_PROJECT_ID`**: `YOUR_FIREBASE_PROJECT_ID_HERE` → Your Firebase Project ID
- **`FIREBASE_PRIVATE_KEY`**: `-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----` → Your Firebase Private Key
- **`FIREBASE_CLIENT_EMAIL`**: `firebase-adminsdk-xxxxx@YOUR_PROJECT.iam.gserviceaccount.com` → Your Firebase Service Account Email
- **`BEDROCK_AGENT_ID`**: `YOUR_BEDROCK_AGENT_ID_HERE` → Your Bedrock Agent ID
- **`BEDROCK_AGENT_ALIAS_ID`**: `YOUR_BEDROCK_AGENT_ALIAS_ID_HERE` → Your Bedrock Agent Alias ID

### ⚙️ OPTIONAL (Can customize or leave defaults):

- **`AWS_REGION`**: `us-east-1` → Default region, change if needed
- **`BEDROCK_MODEL_ID`**: `amazon.nova-micro-v1:0` → Default model, change if needed
- **`BEDROCK_MAX_TOKENS`**: `2000` → Default token limit
- **`SERPAPI_KEY`**: `your-serpapi-key` → Optional, leave empty if not using
- **`PORT`**: `3000` → Default port
- **`NODE_ENV`**: `development` → Environment (development/production/test)
- **`ALLOWED_ORIGINS`**: `http://localhost:5173,http://localhost:3000` → CORS origins

## Frontend Section

### ✅ REQUIRES YOUR INPUT (Replace placeholders):

- **`VITE_COGNITO_USER_POOL_ID`**: `us-east-1_YOUR_POOL_ID_HERE` → Should match backend
- **`VITE_COGNITO_CLIENT_ID`**: `YOUR_COGNITO_CLIENT_ID_HERE` → Should match backend

### ⚙️ OPTIONAL (Can customize or leave defaults):

- **`VITE_API_URL`**: `http://localhost:3000/api` → Backend API URL (change for production)
- **`VITE_AWS_REGION`**: `us-east-1` → Should match backend AWS_REGION

## Mobile Section

### ✅ REQUIRES YOUR INPUT (Replace placeholders):

- **`COGNITO_USER_POOL_ID`**: `us-east-1_YOUR_POOL_ID_HERE` → Should match backend
- **`COGNITO_CLIENT_ID`**: `YOUR_COGNITO_CLIENT_ID_HERE` → Should match backend

### ⚙️ OPTIONAL (Can customize or leave defaults):

- **`API_URL`**: `http://localhost:3000/api` → Backend API URL (use `10.0.2.2` for Android emulator)
- **`AWS_REGION`**: `us-east-1` → Should match backend AWS_REGION

## Quick Checklist

Before running the app, make sure you've replaced:

- [ ] `YOUR_AWS_ACCESS_KEY_ID_HERE`
- [ ] `YOUR_AWS_SECRET_ACCESS_KEY_HERE`
- [ ] `us-east-1_YOUR_POOL_ID_HERE` (in all 3 sections)
- [ ] `YOUR_COGNITO_CLIENT_ID_HERE` (in all 3 sections)
- [ ] `YOUR_FIREBASE_PROJECT_ID_HERE`
- [ ] `YOUR_PRIVATE_KEY_HERE` (in the Firebase private key)
- [ ] `YOUR_PROJECT` (in Firebase client email)
- [ ] `YOUR_BEDROCK_AGENT_ID_HERE`
- [ ] `YOUR_BEDROCK_AGENT_ALIAS_ID_HERE`

## See Also

- [Complete Configuration Setup Guide](docs/CONFIG_SETUP.md)
- [Quick Reference Guide](docs/CONFIG_GUIDE.md)
