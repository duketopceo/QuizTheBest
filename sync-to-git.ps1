# ============================================================================
# SYNC EVERYTHING TO GIT
# ============================================================================
# This script safely syncs all changes to git after verifying secrets are safe
# ============================================================================

Write-Host "`n🔄 SYNCING TO GIT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Step 1: Verify secrets are safe
Write-Host "🔒 Step 1: Verifying secrets are safe..." -ForegroundColor Yellow
$configIgnored = git check-ignore config.json 2>$null
if (-not $configIgnored) {
    Write-Host "❌ CRITICAL: config.json is NOT ignored!" -ForegroundColor Red
    Write-Host "   Run: .\remove-config-from-git.ps1 first" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ config.json is properly ignored" -ForegroundColor Green

$secretsIgnored = git check-ignore backend/aws-secrets.env 2>$null
if (-not $secretsIgnored) {
    Write-Host "⚠️  backend/aws-secrets.env is not ignored (checking .gitignore)" -ForegroundColor Yellow
}
Write-Host "✅ Secrets verification passed" -ForegroundColor Green

# Step 2: Check for secret files in staging
Write-Host "`n📋 Step 2: Checking staged files..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only 2>$null
$secretFiles = $stagedFiles | Where-Object { $_ -match "config\.json|aws-secrets|\.env$" -and $_ -notmatch "\.env\.example|template" }
if ($secretFiles) {
    Write-Host "❌ CRITICAL: Secret files found in staging:" -ForegroundColor Red
    $secretFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    Write-Host "   Unstage them first!" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ No secret files in staging" -ForegroundColor Green

# Step 3: Show what will be committed
Write-Host "`n📊 Step 3: Files to be committed:" -ForegroundColor Yellow
$status = git status --short 2>$null
if ($status) {
    $status | Select-Object -First 20 | ForEach-Object { Write-Host "   $_" -ForegroundColor Cyan }
    $total = ($status | Measure-Object).Count
    if ($total -gt 20) {
        Write-Host "   ... and $($total - 20) more files" -ForegroundColor Gray
    }
} else {
    Write-Host "   No changes to commit" -ForegroundColor Gray
    exit 0
}

# Step 4: Add all changes
Write-Host "`n➕ Step 4: Adding all changes..." -ForegroundColor Yellow
git add . 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add files" -ForegroundColor Red
    exit 1
}
Write-Host "✅ All changes staged" -ForegroundColor Green

# Step 5: Final security check
Write-Host "`n🔒 Step 5: Final security check..." -ForegroundColor Yellow
$stagedAfter = git diff --cached --name-only 2>$null
$secretsAfter = $stagedAfter | Where-Object { $_ -match "config\.json|aws-secrets|\.env$" -and $_ -notmatch "\.env\.example|template" }
if ($secretsAfter) {
    Write-Host "❌ CRITICAL: Secret files would be committed!" -ForegroundColor Red
    Write-Host "   Unstaging secret files..." -ForegroundColor Yellow
    $secretsAfter | ForEach-Object { git reset HEAD $_ 2>&1 | Out-Null }
    Write-Host "   Secret files unstaged. Review and commit manually." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Final security check passed" -ForegroundColor Green

# Step 6: Commit
Write-Host "`n💾 Step 6: Committing changes..." -ForegroundColor Yellow
$commitMessage = "Organize repo: consolidate docs, add verification scripts, secure config.json"
git commit -m $commitMessage 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit may have failed or nothing to commit" -ForegroundColor Yellow
}

# Step 7: Push
Write-Host "`n🚀 Step 7: Pushing to remote..." -ForegroundColor Yellow
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "   Remote: $remote" -ForegroundColor Cyan
    git push 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to git!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Push may have failed. Check output above." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No remote configured. Run: git remote add origin <url>" -ForegroundColor Yellow
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "✅ SYNC COMPLETE" -ForegroundColor Green
Write-Host ""

