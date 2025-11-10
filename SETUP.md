# Quiz The Best - Complete Setup Guide

**One file to rule them all.** Everything you need to get started.

---

## 🚀 Master Verification Script

**Before you start, run the master verification script to check everything:**

**Windows:**
```powershell
.\verify-everything.ps1
```



This script checks:
- ✅ Secrets are properly excluded from git
- ✅ Configuration files exist and are set up
- ✅ Dependencies are installed
- ✅ Project structure is correct
- ✅ Environment files are generated

**Other verification scripts:**
- `scripts/verify-secrets-safe.ps1` / `.sh` - Quick security check
- `scripts/check-requirements.js` - Requirements checklist

---

## 📋 Quick Start Checklist

- [ ] Fill out `config.json` with your credentials (see Configuration section)
- [ ] Install dependencies: `cd backend && npm install` and `cd frontend && npm install`
- [ ] Set up AWS services (Cognito, Bedrock, Firebase)
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `cd frontend && npm run dev`

---

## 🔧 Configuration

### The One File You Need: `config.json`

Edit `config.json` in the root directory. This file contains all your API keys and settings.

**⚠️ IMPORTANT**: `config.json` is in `.gitignore` - it will NOT be committed to git.

#### What You Need to Fill In:

**Backend Section:**
- `AWS_ACCESS_KEY_ID` - Your AWS Access Key
- `AWS_SECRET_ACCESS_KEY` - Your AWS Secret Key
- `COGNITO_USER_POOL_ID` - From AWS Cognito (format: `us-east-1_XXXXXXXXX`)
- `COGNITO_CLIENT_ID` - From AWS Cognito
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - From Firebase service account JSON
- `FIREBASE_CLIENT_EMAIL` - From Firebase service account
- `BEDROCK_AGENT_ID` - Your Bedrock Agent ID (if using agents)
- `BEDROCK_AGENT_ALIAS_ID` - Your Bedrock Agent Alias ID
- `SERPAPI_KEY` - Optional, for enhanced search

**Frontend Section:**
- `VITE_COGNITO_USER_POOL_ID` - Same as backend
- `VITE_COGNITO_CLIENT_ID` - Same as backend

**Mobile Section:**
- `COGNITO_USER_POOL_ID` - Same as backend
- `COGNITO_CLIENT_ID` - Same as backend

After editing `config.json`, run:
```bash
python scripts/generate_env_files.py
```

This creates `.env` files for backend, frontend, and mobile from your `config.json`.

---

## 🚀 AWS Setup

### 1. AWS Cognito (Authentication)

1. Go to AWS Cognito Console → Create User Pool
2. Sign-in options: Email
3. **CRITICAL**: Enable "Refresh token" in App Client settings
4. Configure callback URLs: `http://localhost:5173` (dev) or your production URL
5. Copy User Pool ID and Client ID to `config.json`

### 2. AWS Bedrock (AI)

1. Go to AWS Bedrock Console
2. Request access to Amazon Nova models
3. Verify `amazon.nova-micro-v1:0` is available in `us-east-1` region
4. Create IAM user/role with Bedrock permissions:
   ```json
   {
     "Effect": "Allow",
     "Action": ["bedrock:InvokeModel", "bedrock:ListFoundationModels"],
     "Resource": "arn:aws:bedrock:*::foundation-model/amazon.nova-micro-v1:0"
   }
   ```
5. Create access key for the IAM user → Add to `config.json`

### 3. Firebase (Database)

1. Create Firebase project
2. Enable Firestore Database
3. Create Service Account → Download JSON
4. Extract from JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
5. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

### 4. SerpAPI (Optional - Enhanced Search)

1. Sign up at serpapi.com
2. Get API key
3. Add to `config.json` → `SERPAPI_KEY`

---

## 📦 Installation

### Backend
```bash
cd backend
npm install
npm run dev  # Starts on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:5173
```

### Mobile (Android)
```bash
cd mobile
npm install
# Set ANDROID_HOME environment variable
npm run android
```

---

## 🔐 Security Notes

### Secrets Management

- ✅ `config.json` is in `.gitignore` (won't be committed)
- ✅ `backend/aws-secrets.env` is in `.gitignore`
- ✅ All `.env` files are in `.gitignore`
- ✅ Use `config.json.template` as a reference (safe to commit)

### Verify Secrets Are Safe

**Before committing to git, always verify:**
```powershell
# Master verification (checks everything)
.\verify-everything.ps1

# Quick security check only
.\scripts\verify-secrets-safe.ps1

# Sync to git (includes security checks)
.\scripts\utils\SYNC_NOW.ps1
```

**If config.json is NOT ignored or was already committed (CRITICAL SECURITY RISK):**
```powershell
# Remove from git tracking (keeps your local file safe)
.\scripts\security\remove-config-from-git.ps1

# Then commit the removal
git commit -m "Remove config.json from tracking - security fix"
```

**If config.json was already pushed to GitHub:**
1. **IMMEDIATELY** rotate all API keys in config.json
2. Remove from git history: `.\scripts\security\remove-config-from-history.ps1`
3. Force push: `git push --force` (coordinate with team first!)

**Or on Linux/Mac:**
```bash
./verify-everything.sh
./scripts/verify-secrets-safe.sh

# If config.json is NOT ignored or was committed:
chmod +x scripts/security/remove-config-from-git.sh
./scripts/security/remove-config-from-git.sh
git commit -m "Remove config.json from tracking - security fix"
```

### If Secrets Were Exposed

If you accidentally committed secrets:
1. **IMMEDIATELY** rotate all exposed keys in AWS/Firebase/etc.
2. See `docs/security/URGENT_AWS_KEY_REMEDIATION.md` for cleanup steps
3. Use `scripts/remove-secret-from-history.ps1` or `.sh` to remove from git history

---

## 🎨 UI Status

**Current UI**: Study app interface (like Quizlet)
- ✅ Dashboard with topic history
- ✅ Topic search and AI generation
- ✅ Flashcard deck with flip animation
- ✅ Quiz component with auto-grading
- ✅ Study set viewer
- ✅ Text-to-speech for summaries
- ✅ Light/dark theme

**NOT Built**: NotebookLM-style document interface
- The current UI is focused on study materials (flashcards, quizzes)
- It does NOT have a document editing/notebook interface like NotebookLM
- If you want NotebookLM-style features, that would need to be built separately

---

## 🏗️ Project Structure

```
QuizTheBest/
├── config.json              # ⭐ EDIT THIS - Your API keys
├── config.json.template     # Template (safe to commit)
├── SETUP.md                 # ⭐ This file - everything you need
├── README.md                # Project overview
├── docker-compose.yml       # Docker setup
├── backend/                 # Node.js backend
│   ├── src/
│   ├── aws-secrets.env     # Bearer token (gitignored)
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   └── package.json
├── mobile/                  # React Native Android app
│   └── src/
├── scripts/                 # Utility scripts
│   ├── generate_env_files.py
│   └── check_config.py
└── docs/                    # Detailed documentation (optional reading)
    ├── security/           # Security guides
    └── ...                 # Other detailed docs
```

---

## 🐛 Troubleshooting

### "Model not available" error
- Check Bedrock console → Request access to Amazon Nova models
- Verify region is `us-east-1`
- Check IAM permissions

### "Cognito token invalid"
- Verify refresh tokens are enabled in Cognito App Client
- Check User Pool ID and Client ID match in `config.json`
- Verify callback URLs in Cognito match your frontend URL

### "Firebase permission denied"
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check service account has correct permissions

### "CORS error"
- Update `ALLOWED_ORIGINS` in backend config
- For mobile: Use your computer's IP address, not `localhost`

### Backend won't start
- Check `backend/.env` exists (generated from `config.json`)
- Verify all required fields in `config.json` are filled
- Check AWS credentials are valid

---

## 📱 Mobile App Setup

### Prerequisites
- Node.js 18+
- Java JDK 17
- Android Studio
- Android SDK Platform 33

### Environment Variables
```bash
export ANDROID_HOME=$HOME/Android/Sdk  # Linux/Mac
# OR
export ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk  # Windows
```

### Run
```bash
cd mobile
npm install
npm start        # Metro bundler
npm run android  # In another terminal
```

**For Android Emulator**: Use `http://10.0.2.2:3000/api` in mobile config
**For Physical Device**: Use your computer's IP (e.g., `http://192.168.1.100:3000/api`)

---

## 🚢 Deployment

### Backend
- Deploy to AWS Lambda, EC2, or your preferred hosting
- Set environment variables from `config.json`
- Update CORS `ALLOWED_ORIGINS` for production domain

### Frontend
- Deploy to AWS Amplify, Vercel, Netlify, etc.
- Set environment variables (VITE_*)
- Update API URL in production

### Mobile
- Build APK: `cd mobile/android && ./gradlew assembleRelease`
- Sign the APK for Play Store release

---

## 📚 API Endpoints

- `POST /api/generate` - Generate study materials from topic
- `GET /api/generate/status/:jobId` - Check generation status
- `POST /api/quiz` - Generate quiz
- `GET /api/study-sets` - Get user's study sets
- `POST /api/study-sets` - Save study set
- `GET /api/export` - Export study materials (CSV/JSON)

---

## ✅ Verification

### Run Master Verification Script

**First, verify everything is set up correctly:**
```powershell
.\verify-everything.ps1
```

This will check:
- Security (secrets excluded from git)
- Configuration files
- Dependencies installed
- Environment files
- Project structure

### Test the Application

After verification passes:

1. **Backend**: `curl http://localhost:3000/api/health` (if health endpoint exists)
2. **Frontend**: Open `http://localhost:5173` → Should see login page
3. **Auth**: Create account → Login → Should see dashboard
4. **Generation**: Search a topic → Should generate flashcards/quiz

---

## 🆘 Need Help?

1. **Configuration issues**: Check `config.json` - all required fields filled?
2. **AWS issues**: See AWS Console → Check IAM permissions, model access
3. **Firebase issues**: Deploy rules and indexes
4. **Detailed guides**: Check `docs/` folder (but this file should cover 90% of cases)

---

## 🎯 What This App Does

1. User searches a topic (e.g., "Python data structures")
2. Backend searches web sources (SerpAPI + scrapers)
3. AI (AWS Bedrock) summarizes content
4. AI generates flashcards and quiz questions
5. User can study with flashcards, take quizzes, export materials

**Tech Stack**: React (web) + React Native (mobile) + Node.js/Express (backend) + AWS Bedrock (AI) + Firebase (database) + AWS Cognito (auth)

---

## 🔍 Verification Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `verify-everything.ps1` / `.sh` | **Master verification** - Checks everything | Before starting app, before committing |
| `scripts/security/remove-config-from-git.ps1` / `.sh` | **Remove config.json from git** | If config.json was committed or not ignored |
| `scripts/security/remove-config-from-history.ps1` | Remove config.json from git history | If config.json was already pushed to GitHub |
| `scripts/utils/SYNC_NOW.ps1` | Sync all changes to git safely | After making changes, before pushing |
| `scripts/verify-secrets-safe.ps1` / `.sh` | Quick security check only | Before git commit |
| `scripts/check-requirements.js` | Requirements checklist | Initial setup |
| `scripts/security/remove-secret-from-history.ps1` / `.sh` | Remove secrets from git history | If secrets were accidentally committed |

**Always run `verify-everything.ps1` before starting the app!**

---

**That's it!** Fill out `config.json`, run `verify-everything.ps1`, then start the app. 🚀

**For explanations and commentary, see `NOTES.md`**

---

## 📁 Repository Structure

```
QuizTheBest/
├── README.md                    # Project overview
├── SETUP.md                     # ⭐ Complete setup guide (read this!)
├── config.json                  # ⭐ Your API keys (gitignored)
├── config.json.template         # Template (safe to commit)
├── verify-everything.ps1        # ⭐ Master verification script
├── docker-compose.yml           # Docker configuration
├── backend/                     # Node.js backend
│   ├── src/                     # Source code
│   ├── firestore.*              # Firestore config
│   └── aws-secrets.env          # Bearer token (gitignored)
├── frontend/                    # React frontend
│   └── src/                     # Source code
├── mobile/                      # React Native mobile app
│   └── src/                     # Source code
├── scripts/                     # Utility scripts
│   ├── security/                # Security scripts
│   ├── utils/                   # Utility scripts (SYNC_NOW, etc.)
│   ├── generate_env_files.py    # Generate .env from config.json
│   └── check_config.py          # Validate config.json
├── docs/                        # Documentation
│   ├── mobile/                  # Mobile-specific docs
│   └── security/                # Security guides
├── shared/                       # Shared types/services
└── temp/                        # Temporary files (gitignored)
```

