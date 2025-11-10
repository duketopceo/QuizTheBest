# Install dependencies and run the app
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Cyan
    $env:DEBUG = "true"
    npm run dev
} else {
    Write-Host "Failed to install dependencies!" -ForegroundColor Red
    exit 1
}


