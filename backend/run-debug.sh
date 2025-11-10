#!/bin/bash

echo "========================================"
echo "QuizTheBest Backend - Debug Mode"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[DEBUG] Current directory: $(pwd)"
echo "[DEBUG] Node version:"
node --version
echo ""

echo "[DEBUG] Checking for node_modules..."
if [ ! -d "node_modules" ]; then
    echo "[DEBUG] Installing dependencies..."
    npm install
    echo ""
fi

echo "[DEBUG] Starting server in debug mode..."
echo "[DEBUG] Environment: DEBUG=true"
echo ""

export DEBUG=true
export NODE_ENV=development

npm run dev

