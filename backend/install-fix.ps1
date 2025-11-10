# Fix and install dependencies
Write-Host "Fixing package.json and installing dependencies..." -ForegroundColor Cyan

# Try to install without serpapi first if it fails
Write-Host "Attempting to install all dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Installation failed. Trying without optional packages..." -ForegroundColor Yellow
    
    # Remove serpapi temporarily if it's causing issues
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.dependencies.serpapi) {
        Write-Host "Removing serpapi from dependencies (it's optional)" -ForegroundColor Yellow
        $packageJson.dependencies.PSObject.Properties.Remove('serpapi')
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    }
    
    npm install
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Cyan
    $env:DEBUG = "true"
    npm run dev
} else {
    Write-Host "Failed to install dependencies!" -ForegroundColor Red
    Write-Host "Try running: npm install --legacy-peer-deps" -ForegroundColor Yellow
    exit 1
}


