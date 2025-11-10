# Verify no secrets are being committed to git
Write-Host "🔍 Checking for secrets in git staging area..." -ForegroundColor Cyan

# Check if config.json is ignored
$configIgnored = git check-ignore config.json 2>$null
if ($configIgnored) {
    Write-Host "✅ config.json is properly ignored" -ForegroundColor Green
} else {
    Write-Host "❌ WARNING: config.json is NOT ignored!" -ForegroundColor Red
    exit 1
}

# Check if aws-secrets.env is ignored
$secretsIgnored = git check-ignore backend/aws-secrets.env 2>$null
if ($secretsIgnored) {
    Write-Host "✅ backend/aws-secrets.env is properly ignored" -ForegroundColor Green
} else {
    Write-Host "❌ WARNING: backend/aws-secrets.env is NOT ignored!" -ForegroundColor Red
    exit 1
}

# Check staged files for secrets
$stagedFiles = git diff --cached --name-only
$secretFiles = $stagedFiles | Where-Object { $_ -match "config\.json|aws-secrets|\.env$" -and $_ -notmatch "\.env\.example|template" }

if ($secretFiles) {
    Write-Host "❌ WARNING: Secret files found in staging area:" -ForegroundColor Red
    $secretFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "✅ No secret files in staging area" -ForegroundColor Green
}

Write-Host "`n✅ All checks passed! Safe to commit." -ForegroundColor Green

