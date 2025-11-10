@echo off
cd /d "%~dp0"
echo Adding all changes...
git add .
echo.
echo Committing changes...
git commit -m "Add Bedrock Agent integration, mobile Android setup, and fix CI workflow

- Add Bedrock Agent service with action groups support
- Create agent orchestrator for study set generation
- Add /api/ai/studyset endpoint with authentication
- Configure mobile app for Android Studio testing
- Add Amplify configuration for Cognito authentication
- Create JWKS verification utilities
- Fix GitHub Actions workflow caching issue
- Add comprehensive documentation"
echo.
echo Pushing to remote...
git push
echo.
echo Done!

