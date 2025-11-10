# Quick sync script - run this to push everything to git safely

Write-Host "🔄 Syncing to Git..." -ForegroundColor Cyan

# Verify secrets are safe
$configIgnored = git check-ignore config.json 2>$null
if (-not $configIgnored) {
    Write-Host "❌ config.json NOT ignored! Run: .\scripts\security\remove-config-from-git.ps1 first" -ForegroundColor Red
    exit 1
}

# Add all (secrets auto-excluded by .gitignore)
git add .

# Check no secrets in staging
$staged = git diff --cached --name-only
$secrets = $staged | Where-Object { 
    ($_ -match "config\.json$" -and $_ -notmatch "template|example") -or
    ($_ -match "aws-secrets") -or
    ($_ -match "\.env$" -and $_ -notmatch "\.env\.example|\.env\.template|template")
}
if ($secrets) {
    Write-Host "❌ Secret files detected in staging:" -ForegroundColor Red
    $secrets | ForEach-Object { 
        Write-Host "   $_" -ForegroundColor Yellow
        git reset HEAD $_ 2>&1 | Out-Null
    }
    Write-Host "`n⚠️  These files were unstaged for security." -ForegroundColor Yellow
    Write-Host "   If these are safe template files, update .gitignore" -ForegroundColor Yellow
    Write-Host "   Otherwise, they should NOT be committed!" -ForegroundColor Red
    exit 1
}

# Commit and push
git commit -m "Organize repo: consolidate docs, add verification scripts, secure secrets"
git push

Write-Host "✅ Done!" -ForegroundColor Green

