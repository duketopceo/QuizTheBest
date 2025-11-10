# Configuration Setup Guide

This project uses a centralized `config.json` file to manage all configuration values, API keys, and IDs. This file is gitignored to keep your sensitive information secure.

## Quick Start

1. **Run the configuration checker:**
   ```bash
   python3 check_config.py
   ```

2. **The script will create a `config.json` template** if it doesn't exist.

3. **Fill in your configuration values** in `config.json`:
   - Open `config.json` in your editor
   - Replace all placeholder values with your actual credentials
   - See sections below for where to find each value

4. **Run the checker again** to validate:
   ```bash
   python3 check_config.py
   ```

## Configuration Sections

### Backend Configuration

#### Required Values

- **AWS_REGION**: Your AWS region (e.g., `us-east-1`)
  - Find in: AWS Console → Region selector (top right)
  
- **AWS_ACCESS_KEY_ID**: Your AWS Access Key ID
  - Find in: AWS Console → IAM → Users → Security credentials → Access keys
  - Format: 20 characters, uppercase letters and numbers
  
- **AWS_SECRET_ACCESS_KEY**: Your AWS Secret Access Key
  - Find in: Same location as Access Key ID (only shown once when created)
  - Format: 40+ characters
  
- **COGNITO_USER_POOL_ID**: Your Cognito User Pool ID
  - Find in: AWS Console → Cognito → User Pools → Your Pool → General settings
  - Format: `us-east-1_XXXXXXXXX`
  
- **COGNITO_CLIENT_ID**: Your Cognito App Client ID
  - Find in: AWS Console → Cognito → User Pools → Your Pool → App integration → App clients
  - Format: Alphanumeric string
  
- **FIREBASE_PROJECT_ID**: Your Firebase Project ID
  - Find in: Firebase Console → Project Settings → General
  - Format: Lowercase letters, numbers, hyphens
  
- **FIREBASE_PRIVATE_KEY**: Your Firebase Service Account Private Key
  - Find in: Firebase Console → Project Settings → Service Accounts → Generate new private key
  - Format: Full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
  - Note: In JSON, use `\n` for newlines
  
- **FIREBASE_CLIENT_EMAIL**: Your Firebase Service Account Email
  - Find in: Firebase Console → Project Settings → Service Accounts
  - Format: `firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com`
  
- **BEDROCK_AGENT_ID**: Your AWS Bedrock Agent ID
  - Find in: AWS Console → Bedrock → Agents → Your Agent → Agent ID
  - Format: Uppercase letters and numbers (e.g., `2DNZCRAKF9`)
  
- **BEDROCK_AGENT_ALIAS_ID**: Your AWS Bedrock Agent Alias ID
  - Find in: AWS Console → Bedrock → Agents → Your Agent → Aliases → Alias ID
  - Format: Uppercase letters and numbers (e.g., `OQNLDGNQDS`)

#### Optional Values

- **BEDROCK_MODEL_ID**: Bedrock model to use (default: `amazon.nova-micro-v1:0`)
- **BEDROCK_MAX_TOKENS**: Maximum tokens for Bedrock responses (default: `2000`)
- **SERPAPI_KEY**: SerpAPI key for enhanced search (optional)
  - Get from: https://serpapi.com/dashboard
- **PORT**: Backend server port (default: `3000`)
- **NODE_ENV**: Node environment (default: `development`)
- **ALLOWED_ORIGINS**: CORS allowed origins, comma-separated (e.g., `http://localhost:5173,http://localhost:3000`)

### Frontend Configuration

#### Required Values

- **VITE_API_URL**: Your backend API URL
  - Development: `http://localhost:3000/api`
  - Production: `https://your-api-domain.com/api`
  
- **VITE_AWS_REGION**: Should match backend `AWS_REGION`
  
- **VITE_COGNITO_USER_POOL_ID**: Should match backend `COGNITO_USER_POOL_ID`
  
- **VITE_COGNITO_CLIENT_ID**: Should match backend `COGNITO_CLIENT_ID`

### Mobile Configuration

#### Required Values

- **API_URL**: Should match frontend `VITE_API_URL`
  
- **AWS_REGION**: Should match backend `AWS_REGION`
  
- **COGNITO_USER_POOL_ID**: Should match backend `COGNITO_USER_POOL_ID`
  
- **COGNITO_CLIENT_ID**: Should match backend `COGNITO_CLIENT_ID`

## Example config.json Structure

```json
{
  "backend": {
    "AWS_REGION": "us-east-1",
    "AWS_ACCESS_KEY_ID": "AKIAIOSFODNN7EXAMPLE",
    "AWS_SECRET_ACCESS_KEY": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "COGNITO_USER_POOL_ID": "us-east-1_XXXXXXXXX",
    "COGNITO_CLIENT_ID": "1234567890abcdefghijklmn",
    "FIREBASE_PROJECT_ID": "quiz-the-best-12345",
    "FIREBASE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----",
    "FIREBASE_CLIENT_EMAIL": "firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com",
    "BEDROCK_AGENT_ID": "2DNZCRAKF9",
    "BEDROCK_AGENT_ALIAS_ID": "OQNLDGNQDS",
    "BEDROCK_MODEL_ID": "amazon.nova-micro-v1:0",
    "BEDROCK_MAX_TOKENS": "2000",
    "SERPAPI_KEY": "your-serpapi-key",
    "PORT": "3000",
    "NODE_ENV": "development",
    "ALLOWED_ORIGINS": "http://localhost:5173,http://localhost:3000"
  },
  "frontend": {
    "VITE_API_URL": "http://localhost:3000/api",
    "VITE_AWS_REGION": "us-east-1",
    "VITE_COGNITO_USER_POOL_ID": "us-east-1_XXXXXXXXX",
    "VITE_COGNITO_CLIENT_ID": "1234567890abcdefghijklmn"
  },
  "mobile": {
    "API_URL": "http://localhost:3000/api",
    "AWS_REGION": "us-east-1",
    "COGNITO_USER_POOL_ID": "us-east-1_XXXXXXXXX",
    "COGNITO_CLIENT_ID": "1234567890abcdefghijklmn"
  }
}
```

## Setup Instructions by Service

### AWS Cognito Setup

1. Go to AWS Console → Cognito → User Pools
2. Create a new User Pool (or use existing)
3. Configure sign-in with Email
4. Create an App Client
5. **Important**: Enable "Refresh token" in App client settings
6. Copy User Pool ID and App Client ID to config.json

See `aws-setup.md` for detailed instructions.

### AWS Bedrock Setup

1. Go to AWS Console → Bedrock
2. Request access to Amazon Nova models
3. Create a Bedrock Agent (or use existing)
4. Create/select an Agent Alias
5. Copy Agent ID and Alias ID to config.json

See `backend/BEDROCK_AGENT_SETUP.md` for detailed instructions.

### Firebase Setup

1. Go to Firebase Console
2. Create a new project (or use existing)
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Click "Generate new private key"
6. Download the JSON file
7. Extract values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep full key with BEGIN/END markers)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
8. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

### SerpAPI Setup (Optional)

1. Sign up at https://serpapi.com
2. Get your API key from the dashboard
3. Add to `SERPAPI_KEY` in config.json
4. Note: App works without this, but search results may be limited

## Validation

The `check_config.py` script validates:
- All required values are present
- Values match expected formats (patterns)
- No empty values

Run validation:
```bash
python3 check_config.py
```

## Security Notes

- **Never commit `config.json` to git** (it's in .gitignore)
- Keep backups of your config.json in a secure location
- Rotate API keys regularly
- Use different credentials for development and production
- Consider using environment variables or secret management services for production

## Troubleshooting

### "Value doesn't match expected pattern"
- Check the format requirements in the error message
- Verify you copied the full value (no truncation)
- For Firebase Private Key, ensure newlines are escaped as `\n`

### "Value is empty"
- Make sure you replaced all placeholder values
- Check for extra spaces or quotes

### Configuration not being used
- Ensure `config.json` is in the project root
- Check that your application code is reading from `config.json`
- For environment variables, you may need to export them separately

## Next Steps

After configuring:
1. ✅ Run `python3 check_config.py` to validate
2. ✅ Set up your backend environment (see `backend/README.md`)
3. ✅ Set up your frontend environment (see `frontend/README.md`)
4. ✅ Set up your mobile app (see `mobile/README.md`)
5. ✅ Test authentication flow
6. ✅ Test API endpoints
