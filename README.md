<p align="center">
  <h1 align="center">QuizTheBest</h1>
  <p align="center">
    AI-powered study companion that generates flashcards, quizzes, and summaries from any topic.
    <br />
    <strong>Web + Android</strong> &mdash; React &bull; Node.js &bull; AWS Bedrock &bull; React Native
  </p>
</p>

<p align="center">
  <a href="https://github.com/duketopceo/QuizTheBest/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/release-v1.0.0-blue.svg" alt="Release"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB.svg" alt="React"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933.svg" alt="Node.js"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/AI-AWS%20Bedrock-FF9900.svg" alt="AWS Bedrock"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/mobile-React%20Native-61DAFB.svg" alt="React Native"></a>
</p>

---

## Overview

QuizTheBest uses large language models to research any topic, then automatically generates study materials — flashcards, multiple-choice quizzes, and condensed summaries. It pulls from online sources (like NotebookLM) so content stays current and comprehensive.

**Key workflows:**

1. Enter a topic or paste source material
2. AI researches and synthesizes content from multiple sources
3. Choose output: flashcards, quiz, or summary
4. Study with spaced repetition, audio playback, or timed quiz mode
5. Export results to CSV/JSON for Anki, Quizlet, etc.

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Research Engine** | AWS Bedrock (Amazon Nova) searches and synthesizes from multiple sources |
| **Flashcard Generator** | Auto-generated cards with spaced repetition scheduling |
| **Quiz Builder** | Multiple-choice and free-response quizzes with scoring |
| **Topic Summaries** | Condensed study guides from AI-synthesized research |
| **Text-to-Speech** | Audio playback for summaries and flashcards |
| **Export** | CSV and JSON export for Anki, Quizlet, and other tools |
| **Dark/Light Theme** | Full theme support across web and mobile |
| **Android App** | React Native mobile client with offline support |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Mobile** | React Native (Android) |
| **AI** | AWS Bedrock (Amazon Nova) |
| **Database** | Firebase Firestore |
| **Auth** | AWS Cognito |
| **DevOps** | Docker Compose, GitHub Actions |

---

## Project Structure

```
QuizTheBest/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # AI, Firestore, Cognito integrations
│   │   └── middleware/   # Auth, validation, error handling
│   └── package.json
├── frontend/             # React + Vite web application
│   ├── src/
│   │   ├── components/   # UI components (cards, quizzes, editor)
│   │   ├── pages/        # Route pages
│   │   └── hooks/        # Custom React hooks
│   └── package.json
├── mobile/               # React Native Android app
├── shared/               # Shared types and utilities
├── scripts/              # Setup and deployment scripts
├── docs/                 # Extended documentation
├── docker-compose.yml    # Container orchestration
└── config.json.template  # Configuration template
```

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS account with Bedrock access (Amazon Nova model)
- Firebase project (Firestore)
- AWS Cognito user pool

### Setup

```bash
# Clone
git clone https://github.com/duketopceo/QuizTheBest.git
cd QuizTheBest

# Configure
cp config.json.template config.json
# Edit config.json with your API keys (AWS, Firebase, Cognito)

# Generate environment files
python scripts/generate_env_files.py

# Install and start backend
cd backend && npm install && npm run dev

# Install and start frontend (new terminal)
cd frontend && npm install && npm run dev
```

The web app runs at `http://localhost:5173`, API at `http://localhost:3001`.

### Docker

```bash
docker compose up -d
```

### Mobile (Android)

```bash
cd mobile
npm install
npx react-native run-android
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research` | AI-powered topic research |
| `POST` | `/api/flashcards` | Generate flashcards from content |
| `POST` | `/api/quiz` | Generate quiz from content |
| `POST` | `/api/summary` | Generate condensed summary |
| `GET` | `/api/history` | Retrieve study history |
| `POST` | `/api/export` | Export to CSV/JSON |

---

## Documentation

- **[SETUP.md](SETUP.md)** — Complete setup guide with all prerequisites
- **[docs/](docs/)** — Architecture decisions, API reference, deployment guide

---

## Roadmap

- [ ] iOS React Native build
- [ ] Spaced repetition algorithm (SM-2) for flashcard scheduling
- [ ] Collaborative study sessions
- [ ] PDF/document upload as source material
- [ ] Integration with Anki and Quizlet APIs

---

## License

MIT
