@echo off
echo ========================================
echo QuizTheBest Backend - Debug Mode
echo ========================================
echo.

cd /d "%~dp0"

echo [DEBUG] Current directory: %CD%
echo [DEBUG] Node version:
node --version
echo.

echo [DEBUG] Checking for node_modules...
if not exist "node_modules" (
    echo [DEBUG] Installing dependencies...
    call npm install
    echo.
)

echo [DEBUG] Starting server in debug mode...
echo [DEBUG] Environment: DEBUG=true
echo.

set DEBUG=true
set NODE_ENV=development

call npm run dev

