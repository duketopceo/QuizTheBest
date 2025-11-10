# Quick Reference: AWS Secrets

## Bearer Token

**File**: `backend/aws-secrets.env` (gitignored)

**Variable**: `AWS_BEARER_TOKEN_BEDROCK`

**Value**: `YOUR_BEARER_TOKEN_HERE` (get from aws-secrets.env file)

## Quick Setup

```bash
# Load the secret
export AWS_BEARER_TOKEN_BEDROCK="YOUR_BEARER_TOKEN_HERE"

# Or add to .env file
echo "AWS_BEARER_TOKEN_BEDROCK=YOUR_BEARER_TOKEN_HERE" >> backend/.env
```

## Access in Code

```typescript
import { BEDROCK_CONFIG } from './config/bedrock'

const token = BEDROCK_CONFIG.bearerToken
```

See `AWS_SECRETS_SETUP.md` for detailed instructions.

