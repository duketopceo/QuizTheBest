# Quiz The Best - AI Learning Application MVP

A Progressive Web App (PWA) that allows users to request learning topics and receive AI-generated study materials including flashcards, quizzes, summaries, and study guides.

## Technology Stack

- **Frontend**: React + TypeScript, Vite, Tailwind CSS, shadcn/ui, PWA capabilities
- **Backend**: Node.js, Express, TypeScript
- **Database**: Firebase Firestore
- **Authentication**: AWS Cognito with Amplify integration
- **LLM**: AWS Bedrock (AWS Nova Micro 1 model)
- **Search**: SerpAPI + custom web scrapers (Cheerio) with rate limiting

## Project Structure

```
QuizTheBest/
├── backend/          # Node.js backend API
│   ├── src/          # Source code
│   ├── firestore.rules    # Firestore security rules
│   └── firestore.indexes.json  # Firestore indexes
├── frontend/          # React frontend application
├── mobile/            # React Native mobile app
├── shared/            # Shared types and services
├── docs/              # Documentation files
├── scripts/           # Utility scripts
│   ├── check_config.py      # Configuration validator
│   └── generate_env_files.py # Generate .env files from config.json
└── config.json        # Centralized configuration (gitignored)
```

## Quick Start

### 1. Configuration Setup

The project uses a centralized `config.json` file for all configuration values.

**First time setup:**
```bash
# Create and validate config.json template
python3 scripts/check_config.py

# Edit config.json with your actual values
# See docs/CONFIG_SETUP.md for detailed instructions

# Validate your configuration
python3 scripts/check_config.py

# Generate .env files for each service
python3 scripts/generate_env_files.py
```

**See [docs/CONFIG_SETUP.md](docs/CONFIG_SETUP.md) for complete configuration guide.**

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Mobile
cd mobile && npm install
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- Python 3.7+ (for configuration scripts)
- AWS Account with Bedrock and Cognito configured
- Firebase Project with Firestore enabled
- SerpAPI account (optional, app will work without it)

### Backend Setup

1. Install dependencies:
```bash
cd backend && npm install
```

2. The `.env` file should already be generated from `config.json`. If not:
```bash
python3 scripts/generate_env_files.py
```

3. Build and run:
```bash
npm run build
npm start
```

For development:
```bash
npm run dev
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend && npm install
```

2. The `.env` file should already be generated from `config.json`. If not:
```bash
python3 scripts/generate_env_files.py
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Mobile Setup

1. Install dependencies:
```bash
cd mobile && npm install
```

2. The `.env` file should already be generated from `config.json`. If not:
```bash
python3 scripts/generate_env_files.py
```

3. See [docs/ANDROID_STUDIO_SETUP.md](docs/ANDROID_STUDIO_SETUP.md) for Android setup

### Firebase Setup

1. Deploy Firestore security rules:
```bash
cd backend
firebase deploy --only firestore:rules
```

2. Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## Configuration

All configuration is managed through `config.json` in the project root. This file is gitignored for security.

**Configuration includes:**
- AWS credentials (Access Key, Secret Key, Region)
- AWS Cognito (User Pool ID, Client ID)
- AWS Bedrock (Agent ID, Alias ID, Model ID)
- Firebase (Project ID, Private Key, Client Email)
- SerpAPI (optional API key)
- API URLs and CORS settings

**See [docs/CONFIG_SETUP.md](docs/CONFIG_SETUP.md) for complete setup instructions.**

## AWS Configuration

Detailed AWS setup guides are available in the `docs/` directory:

- [AWS Setup Guide](docs/aws-setup.md) - General AWS configuration
- [Bedrock Agent Setup](docs/BEDROCK_AGENT_SETUP.md) - Bedrock Agent configuration
- [Cognito Setup](docs/COGNITO_SETUP.md) - Cognito authentication setup

## Security Considerations

- All content from scrapers and LLM responses is sanitized before saving
- Content validation prevents injection attacks
- HTTPS is enforced in production
- CORS is strictly configured for production
- Rate limiting is implemented on all endpoints
- Firestore security rules restrict access to user's own data

## Development

### Running Tests

Backend tests:
```bash
cd backend
npm test
```

Frontend tests:
```bash
cd frontend
npm test
```

### Linting

Backend:
```bash
cd backend
npm run lint
```

Frontend:
```bash
cd frontend
npm run lint
```

## Documentation

All documentation is organized in the `docs/` directory:

- **[Configuration Setup](docs/CONFIG_SETUP.md)** - Complete configuration guide
- **[AWS Setup](docs/aws-setup.md)** - AWS services configuration
- **[Bedrock Agent Setup](docs/BEDROCK_AGENT_SETUP.md)** - Bedrock Agent configuration
- **[Cognito Setup](docs/COGNITO_SETUP.md)** - Authentication setup
- **[Android Studio Setup](docs/ANDROID_STUDIO_SETUP.md)** - Mobile app setup
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Technical overview

## Deployment

### Frontend (AWS Amplify)

1. Connect repository to AWS Amplify
2. Configure build settings
3. Set environment variables (or use config.json)
4. Deploy

### Backend (AWS Lambda/EC2)

See deployment scripts in `.github/workflows/` for CI/CD configuration.

## MVP Features

- ✅ User authentication (AWS Cognito)
- ✅ Topic search and content discovery
- ✅ AI-powered summarization
- ✅ Flashcard generation and viewing
- ✅ Quiz generation and taking
- ✅ Study set saving
- ✅ Dashboard with topic history
- ✅ Export (CSV for flashcards, JSON for study sets)

## Future Enhancements

- Spaced repetition algorithm
- Advanced progress analytics
- PDF export
- Share study sets
- AI tutor chat mode
- Worker queue for async processing
- Redis caching

## License

MIT
