# Notes & Explanations

**One file for all explanations, notations, and commentary.**

---

## Repository Organization

### File Structure
- **Root**: Only essential files (README, SETUP, config.json, verify-everything.ps1)
- **scripts/security/**: Security-related scripts
- **scripts/utils/**: Utility scripts (SYNC_NOW, etc.)
- **docs/mobile/**: Mobile documentation
- **backend/**: Backend code + Firestore config
- **temp/**: Temporary files (gitignored)

### Script Locations
- `verify-everything.ps1` - Root (main entry point)
- `scripts/security/remove-config-from-git.ps1` - Remove config.json from git tracking
- `scripts/security/remove-config-from-history.ps1` - Remove config.json from git history
- `scripts/utils/SYNC_NOW.ps1` - Sync changes to git safely

---

## Configuration File (config.json)

### Backend Section - REQUIRES YOUR INPUT
- **AWS_ACCESS_KEY_ID**: Your AWS Access Key ID
- **AWS_SECRET_ACCESS_KEY**: Your AWS Secret Access Key
- **COGNITO_USER_POOL_ID**: Your Cognito User Pool ID (format: `us-east-1_XXXXXXXXX`)
- **COGNITO_CLIENT_ID**: Your Cognito Client ID
- **FIREBASE_PROJECT_ID**: Your Firebase Project ID
- **FIREBASE_PRIVATE_KEY**: Your Firebase Private Key (full key with BEGIN/END markers)
- **FIREBASE_CLIENT_EMAIL**: Your Firebase Service Account Email
- **BEDROCK_AGENT_ID**: Your Bedrock Agent ID
- **BEDROCK_AGENT_ALIAS_ID**: Your Bedrock Agent Alias ID

### Backend Section - OPTIONAL (defaults work)
- **AWS_REGION**: `us-east-1` (change if needed)
- **BEDROCK_MODEL_ID**: `amazon.nova-micro-v1:0` (change if needed)
- **BEDROCK_MAX_TOKENS**: `2000` (default token limit)
- **SERPAPI_KEY**: Optional, leave empty if not using
- **PORT**: `3000` (default port)
- **NODE_ENV**: `development` (or production/test)
- **ALLOWED_ORIGINS**: CORS origins (comma-separated)

### Frontend Section - REQUIRES YOUR INPUT
- **VITE_COGNITO_USER_POOL_ID**: Should match backend
- **VITE_COGNITO_CLIENT_ID**: Should match backend

### Frontend Section - OPTIONAL
- **VITE_API_URL**: `http://localhost:3000/api` (change for production)
- **VITE_AWS_REGION**: `us-east-1` (should match backend)

### Mobile Section - REQUIRES YOUR INPUT
- **COGNITO_USER_POOL_ID**: Should match backend
- **COGNITO_CLIENT_ID**: Should match backend

### Mobile Section - OPTIONAL
- **API_URL**: `http://localhost:3000/api` (use `10.0.2.2` for Android emulator)
- **AWS_REGION**: `us-east-1` (should match backend)

**Note**: JSON doesn't support comments, so use this file for explanations.

---

## Security Notes

### config.json Security
- ✅ `config.json` is in `.gitignore` (won't be committed)
- ✅ `backend/aws-secrets.env` is in `.gitignore`
- ✅ All `.env` files are in `.gitignore`
- ✅ Use `config.json.template` as a reference (safe to commit)

### If config.json Was Committed
1. **IMMEDIATELY** rotate all API keys in config.json
2. Remove from git tracking: `.\scripts\security\remove-config-from-git.ps1`
3. If already pushed: Remove from history: `.\scripts\security\remove-config-from-history.ps1`
4. Force push: `git push --force` (coordinate with team first!)

---

## Mobile App - Cognito Authentication

### React Native vs Native Android
**You don't need native Android code!** The app uses AWS Amplify which handles all Cognito authentication automatically.

### How It Works
1. Configure Amplify in `src/config/amplify.ts` (one-time setup)
2. Use `AuthContext.login(email, password)` for authentication
3. Tokens are automatically managed and included in API calls

### Your Cognito Configuration
- **User Pool ID**: `us-east-1_2Sqbuu4TB`
- **Client ID**: `5195pa6st8trd1cn5g65sbnjns`
- **Region**: `us-east-1`
- **Redirect URI**: `https://d84l1y8p4kdic.cloudfront.net` (for OAuth)

### OAuth vs Username/Password
- **Current setup**: Username/password authentication (simpler)
- **OAuth available**: If you need social login, uncomment OAuth config in `amplify.ts`

**Recommendation**: Stick with username/password unless you need social login.

---

## Mobile App - Android Setup

### API URL Configuration
- **Emulator**: Use `http://10.0.2.2:3000/api` (special IP for localhost)
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:3000/api`)
- **Production**: Use your deployed backend URL

### Network Security
- HTTP is allowed in development builds
- Network security config is set up
- Cleartext traffic is permitted for localhost/emulator

---

## Git Workflow

### Before Committing
1. Run `.\verify-everything.ps1` to check everything
2. Run `.\scripts\verify-secrets-safe.ps1` for quick security check
3. Use `.\scripts\utils\SYNC_NOW.ps1` to sync (includes security checks)

### If Secrets Were Exposed
1. Rotate all exposed keys immediately
2. Remove from git history using security scripts
3. Force push (coordinate with team)
4. Notify team members to reset their repos

---

## Common Issues & Solutions

### "config.json not ignored"
- Run: `.\scripts\security\remove-config-from-git.ps1`
- Verify `.gitignore` contains `config.json`

### "Port already in use"
- Backend: Change `PORT` in config.json
- Frontend: Change `VITE_API_URL` if backend port changed

### "CORS error"
- Update `ALLOWED_ORIGINS` in backend config
- For mobile: Use your computer's IP address, not `localhost`

### "Firebase permission denied"
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check service account has correct permissions

### Mobile: "Could not connect to development server"
- Ensure Metro bundler is running (`npm start`)
- For physical device: Use your computer's IP in API_URL
- Check firewall isn't blocking connections

---

## Quick Reference

### Essential Commands
```powershell
# Verify everything
.\verify-everything.ps1

# Sync to git safely
.\scripts\utils\SYNC_NOW.ps1

# Remove config.json from git
.\scripts\security\remove-config-from-git.ps1

# Install mobile dependencies
cd mobile && npm install
```

### File Locations
- **Main setup guide**: `SETUP.md`
- **This file**: `NOTES.md` (explanations and commentary)
- **Config template**: `config.json.template`
- **Your config**: `config.json` (gitignored)

---

**Last Updated**: Repository organization complete. All explanations consolidated here.

