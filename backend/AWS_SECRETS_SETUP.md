# AWS Secrets Setup Guide

## Bearer Token Configuration

This guide explains how to configure the AWS Bedrock Bearer Token for authentication.

## Secret File Location

The bearer token is stored in `backend/aws-secrets.env`. This file is **gitignored** and should **never be committed** to version control.

## Setup Instructions

### 1. Load the Secret File

The bearer token is already configured in `backend/aws-secrets.env`. To use it:

**Option A: Load via environment variable**
```bash
# Windows (PowerShell)
$env:AWS_BEARER_TOKEN_BEDROCK="ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0="

# Windows (CMD)
set AWS_BEARER_TOKEN_BEDROCK=ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0=

# Linux/macOS
export AWS_BEARER_TOKEN_BEDROCK="ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0="
```

**Option B: Add to your .env file**
```bash
# Copy the value from aws-secrets.env to your .env file
AWS_BEARER_TOKEN_BEDROCK=ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0=
```

**Option C: Use dotenv to load aws-secrets.env**
```typescript
// In your server.ts or app.ts
import dotenv from 'dotenv'
dotenv.config() // Loads .env
dotenv.config({ path: './aws-secrets.env' }) // Loads secrets
```

### 2. Verify Configuration

The bearer token is available in `BEDROCK_CONFIG.bearerToken`:

```typescript
import { BEDROCK_CONFIG } from './config/bedrock'

if (BEDROCK_CONFIG.bearerToken) {
  console.log('Bearer token is configured')
} else {
  console.log('Bearer token not found')
}
```

## Important Notes

### AWS SDK Authentication

The AWS SDK for Bedrock uses **AWS Signature Version 4** signing, which typically requires:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- Or IAM roles (when running on AWS infrastructure)

The bearer token (`AWS_BEARER_TOKEN_BEDROCK`) is stored in the config but may be used for:
- Custom API gateway authentication
- Alternative authentication methods
- Future custom implementations

### Standard AWS Credentials

For standard Bedrock API calls, ensure you have:
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### Security Best Practices

1. **Never commit secrets to git**
   - ✅ `aws-secrets.env` is in `.gitignore`
   - ✅ `.env.secrets` is in `.gitignore`
   - ❌ Never add secrets to tracked files

2. **Use AWS Secrets Manager in production**
   ```typescript
   import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
   
   const client = new SecretsManagerClient({ region: 'us-east-1' })
   const command = new GetSecretValueCommand({ SecretId: 'bedrock-bearer-token' })
   const response = await client.send(command)
   const bearerToken = response.SecretString
   ```

3. **Rotate tokens regularly**
   - Update `aws-secrets.env` when tokens are rotated
   - Update environment variables in deployment environments

4. **Use different tokens for dev/staging/prod**
   - Create separate secret files or use environment-specific configs

## Docker/Container Setup

For containerized deployments, pass the secret as an environment variable:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - AWS_BEARER_TOKEN_BEDROCK=${AWS_BEARER_TOKEN_BEDROCK}
```

Or use Docker secrets:
```bash
docker run -e AWS_BEARER_TOKEN_BEDROCK="your-token" your-image
```

## CI/CD Setup

For GitHub Actions or other CI/CD:

1. Add secret to repository secrets:
   - Settings → Secrets → New repository secret
   - Name: `AWS_BEARER_TOKEN_BEDROCK`
   - Value: Your bearer token

2. Use in workflow:
   ```yaml
   - name: Set environment variables
     run: |
       echo "AWS_BEARER_TOKEN_BEDROCK=${{ secrets.AWS_BEARER_TOKEN_BEDROCK }}" >> $GITHUB_ENV
   ```

## Verification

Test that the bearer token is loaded:

```bash
cd backend
node -e "require('dotenv').config(); require('dotenv').config({path: './aws-secrets.env'}); console.log('Token:', process.env.AWS_BEARER_TOKEN_BEDROCK ? 'Loaded' : 'Not found')"
```

## Troubleshooting

### Token not loading
- Check file path: `backend/aws-secrets.env`
- Verify file format (no spaces around `=`)
- Check `.gitignore` isn't blocking the file
- Try loading explicitly with `dotenv.config({ path: './aws-secrets.env' })`

### Token not being used
- The AWS SDK uses standard credentials by default
- Bearer token is available in config but may need custom implementation
- Check if your use case requires bearer token vs standard AWS credentials

## File Structure

```
backend/
├── aws-secrets.env          # Secret file (gitignored)
├── .env                     # Main environment file (gitignored)
├── .env.example            # Template (safe to commit)
└── src/
    └── config/
        └── bedrock.ts      # Config with bearerToken
```

---

**Remember**: Never commit `aws-secrets.env` or any file containing secrets to git!

