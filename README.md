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
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── firestore.rules    # Firestore security rules
└── firestore.indexes.json  # Firestore indexes
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- AWS Account with Bedrock and Cognito configured
- Firebase Project with Firestore enabled
- SerpAPI account (optional, app will work without it)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. Configure environment variables:
- AWS credentials and region
- Cognito User Pool ID and Client ID
- Firebase Admin SDK credentials
- SerpAPI key (optional)
- Bedrock model configuration

5. Build and run:
```bash
npm run build
npm start
```

For development:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. Configure environment variables:
- API URL
- AWS Region
- Cognito User Pool ID and Client ID

5. Run development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

### Firebase Setup

1. Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

2. Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## AWS Configuration

### Bedrock Setup

1. Verify AWS Nova Micro 1 model availability in your chosen AWS region (us-east-1 recommended)
2. Enable the model in Bedrock console
3. Configure IAM permissions for Bedrock access

### Cognito Setup

1. Create a Cognito User Pool
2. Create a User Pool Client with refresh tokens enabled
3. Configure authentication flows (email/password)
4. Update environment variables with Pool ID and Client ID

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

## Deployment

### Frontend (AWS Amplify)

1. Connect repository to AWS Amplify
2. Configure build settings
3. Set environment variables
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
