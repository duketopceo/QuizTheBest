# Quick Reference: AWS Secrets

## Bearer Token

**File**: `backend/aws-secrets.env` (gitignored)

**Variable**: `AWS_BEARER_TOKEN_BEDROCK`

**Value**: `ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0=`

## Quick Setup

```bash
# Load the secret
export AWS_BEARER_TOKEN_BEDROCK="ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0="

# Or add to .env file
echo "AWS_BEARER_TOKEN_BEDROCK=ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0=" >> backend/.env
```

## Access in Code

```typescript
import { BEDROCK_CONFIG } from './config/bedrock'

const token = BEDROCK_CONFIG.bearerToken
```

See `AWS_SECRETS_SETUP.md` for detailed instructions.

