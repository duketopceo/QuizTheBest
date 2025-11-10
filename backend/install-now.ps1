# Quick install and run
Write-Host "Installing dependencies (serpapi removed - it's optional)..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting server with debug mode..." -ForegroundColor Cyan
    $env:DEBUG = "true"
    npm run dev
} else {
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host "Try: npm install --legacy-peer-deps" -ForegroundColor Yellow
}


