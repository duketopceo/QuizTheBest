# Quick sync script - run this to push everything to git safely

Write-Host "🔄 Syncing to Git..." -ForegroundColor Cyan

# Verify secrets are safe
$configIgnored = git check-ignore config.json 2>$null
if (-not $configIgnored) {
    Write-Host "❌ config.json NOT ignored! Run: .\remove-config-from-git.ps1 first" -ForegroundColor Red
    exit 1
}

# Add all (secrets auto-excluded by .gitignore)
git add .

# Check no secrets in staging
$staged = git diff --cached --name-only
$secrets = $staged | Where-Object { $_ -match "config\.json|aws-secrets|\.env$" -and $_ -notmatch "template|example" }
if ($secrets) {
    Write-Host "❌ Secrets found! Unstaging..." -ForegroundColor Red
    $secrets | ForEach-Object { git reset HEAD $_ }
    exit 1
}

# Commit and push
git commit -m "Organize repo: consolidate docs, add verification scripts, secure secrets"
git push

Write-Host "✅ Done!" -ForegroundColor Green

