# QuizTheBest Backend - Debug Mode (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QuizTheBest Backend - Debug Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

Write-Host "[DEBUG] Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "[DEBUG] Node version:" -ForegroundColor Yellow
node --version
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[DEBUG] Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Set environment variables
$env:DEBUG = "true"
$env:NODE_ENV = "development"

Write-Host "[DEBUG] Starting server in debug mode..." -ForegroundColor Green
Write-Host "[DEBUG] Environment: DEBUG=true" -ForegroundColor Green
Write-Host ""

# Run the dev server
npm run dev


