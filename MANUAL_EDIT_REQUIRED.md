# Manual Edits Required

After the implementation, you need to manually configure the following:

## 🔴 Critical - Must Edit Before Running

### 1. Environment Variables

#### Backend (`backend/.env`)
Create this file from `backend/.env.example` and fill in:

```env
# Server
PORT=3000
NODE_ENV=development

# AWS - REQUIRED
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-actual-access-key
AWS_SECRET_ACCESS_KEY=your-actual-secret-key

# Cognito - REQUIRED (see aws-setup.md)
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-actual-client-id

# Firebase - REQUIRED
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com

# SerpAPI - OPTIONAL (app works without it)
SERPAPI_KEY=your-serpapi-key

# CORS - REQUIRED for production
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Bedrock - Verify model availability first!
BEDROCK_MODEL_ID=mistral.mistral-7b-instruct-v0:1
BEDROCK_MAX_TOKENS=2000
```

#### Frontend (`frontend/.env`)
Create this file from `frontend/.env.example` and fill in:

```env
VITE_API_URL=http://localhost:3000/api
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=your-actual-client-id
```

### 2. AWS Cognito Configuration

**File to edit:** None (configure in AWS Console)

**Steps:**
1. Create Cognito User Pool (see `aws-setup.md`)
2. Enable refresh tokens in App Client settings
3. Configure callback URLs:
   - Allowed callback URLs: `http://localhost:5173` (dev), `https://your-domain.com` (prod)
   - Allowed sign-out URLs: Same as above
4. Update environment variables with Pool ID and Client ID

### 3. Firebase Configuration

**File to edit:** None (configure in Firebase Console)

**Steps:**
1. Create Firebase project
2. Enable Firestore
3. Create service account and download JSON
4. Extract values for `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
5. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
6. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 4. AWS Bedrock Model Access

**File to edit:** None (configure in AWS Console)

**Steps:**
1. Go to AWS Bedrock Console
2. Request access to Mistral models
3. **VERIFY** `mistral.mistral-7b-instruct-v0:1` is available in your region (us-east-1 recommended)
4. Update `BEDROCK_MODEL_ID` if using a different model

### 5. GitHub Secrets (for CI/CD)

**Files to edit:** None (configure in GitHub repository settings)

Add these secrets in GitHub → Settings → Secrets and variables → Actions:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `VITE_API_URL` (for frontend build)
- `VITE_AWS_REGION`
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`

### 6. Deployment Configuration

#### Frontend Deployment (`amplify.yml`)

**File to create/edit:** `amplify.yml` in root (if using AWS Amplify)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

#### Backend Deployment

**File to edit:** `.github/workflows/deploy-backend.yml`

Update the "Deploy to Lambda/EC2" step with your actual deployment commands:

```yaml
- name: Deploy to Lambda/EC2
  run: |
    # Add your actual deployment commands here
    # Example for Lambda:
    # aws lambda update-function-code --function-name quiz-backend --zip-file fileb://dist.zip
    # Example for EC2:
    # scp -r dist/* user@ec2-instance:/app
```

### 7. CORS Configuration

**File to edit:** `backend/src/middleware/cors.ts`

Update `ALLOWED_ORIGINS` in production:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']
```

Make sure your production frontend URL is in the environment variable.

### 8. PWA Icons

**Files to create:** `frontend/public/icons/`

Create PWA icons:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

These are referenced in `frontend/public/manifest.json` but need to be created.

### 9. Auth Middleware - Optional Fix

**File to review:** `backend/src/middleware/auth.ts`

The JWT verification uses `jsonwebtoken` and `jwks-rsa`. If you encounter issues:

1. Verify the Cognito JWKS URL format matches your region
2. Check that the token audience matches your Client ID
3. Ensure the issuer URL is correct for your User Pool

### 10. Bedrock Model ID Verification

**File to edit:** `backend/src/config/bedrock.ts`

**Action:** Verify the model ID is correct for your region:

```typescript
export const BEDROCK_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  modelId: process.env.BEDROCK_MODEL_ID || 'mistral.mistral-7b-instruct-v0:1',
  // ... rest of config
}
```

Run this to verify model availability:
```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'mistral')]"
```

## 🟡 Recommended - Before Production

### 1. Add Error Monitoring

Consider adding error tracking (Sentry, CloudWatch, etc.):

**Files to edit:**
- `backend/src/utils/logger.ts` - Add error reporting
- `frontend/src/services/api.ts` - Add error tracking

### 2. Add Rate Limiting Per User

**File to edit:** `backend/src/middleware/rateLimiter.ts`

Currently rate limiting is per IP. Consider adding per-user rate limiting using Cognito user ID.

### 3. Add Request Validation

**File to edit:** Add validation middleware

Consider using a library like `zod` or `joi` for request validation.

### 4. Update PWA Service Worker

**File to review:** `frontend/vite.config.ts`

The service worker configuration caches only public resources. Review and adjust caching strategy as needed.

## 📝 Quick Start Checklist

Before running the app:

- [ ] Create `backend/.env` with all required values
- [ ] Create `frontend/.env` with all required values
- [ ] Set up AWS Cognito User Pool
- [ ] Set up Firebase project and Firestore
- [ ] Verify Bedrock model access
- [ ] Deploy Firestore rules and indexes
- [ ] Install dependencies: `cd backend && npm install` and `cd frontend && npm install`
- [ ] Create PWA icons
- [ ] Test locally: `cd backend && npm run dev` and `cd frontend && npm run dev`

## 🚨 Common Issues

1. **"Model not available"** - Check Bedrock console, verify region
2. **"Cognito token invalid"** - Check User Pool ID, Client ID, and refresh token settings
3. **"Firebase permission denied"** - Deploy Firestore security rules
4. **"CORS error"** - Check `ALLOWED_ORIGINS` in backend `.env`
5. **"SerpAPI quota exceeded"** - App will continue without SerpAPI, but search results may be limited

## 📚 Documentation

- See `aws-setup.md` for detailed AWS configuration
- See `README.md` for general setup instructions
- See `IMPLEMENTATION_SUMMARY.md` for what was implemented
