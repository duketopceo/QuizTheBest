# ============================================================================
# REMOVE config.json FROM GIT HISTORY
# ============================================================================
# This removes config.json from all git commits (rewrites history)
# WARNING: This will require force push and team coordination
# ============================================================================

Write-Host "`n🚨 REMOVING config.json FROM GIT HISTORY" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  WARNING: This will rewrite git history!" -ForegroundColor Yellow
Write-Host "   - All team members will need to reset their repos" -ForegroundColor Yellow
Write-Host "   - You'll need to force push after this" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (type 'yes' to proceed)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🔍 Checking if config.json exists in git history..." -ForegroundColor Cyan
$inHistory = git log --all --full-history --oneline -- config.json 2>$null | Select-Object -First 1
if (-not $inHistory) {
    Write-Host "✅ config.json not found in git history - nothing to remove" -ForegroundColor Green
    exit 0
}

Write-Host "Found config.json in history. Removing..." -ForegroundColor Yellow

# Check if git-filter-repo is available
$hasFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if ($hasFilterRepo) {
    Write-Host "`n✅ Using git-filter-repo..." -ForegroundColor Green
    git filter-repo --path config.json --invert-paths --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ config.json removed from git history!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to remove from history" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n⚠️  git-filter-repo not found. Using git filter-branch..." -ForegroundColor Yellow
    Write-Host "   (This is slower but doesn't require additional tools)" -ForegroundColor Gray
    
    git filter-branch --force --index-filter "git rm --cached --ignore-unmatch config.json" --prune-empty --tag-name-filter cat -- --all 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ config.json removed from git history!" -ForegroundColor Green
        
        # Clean up
        Write-Host "`n🧹 Cleaning up git references..." -ForegroundColor Cyan
        git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin 2>&1 | Out-Null
        git reflog expire --expire=now --all 2>&1 | Out-Null
        git gc --prune=now 2>&1 | Out-Null
        Write-Host "✅ Cleanup complete" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to remove from history" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "✅ REMOVAL COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify: git log --all --full-history -- config.json (should return nothing)" -ForegroundColor White
Write-Host "  2. Force push: git push --force --all" -ForegroundColor White
Write-Host "  3. Force push tags: git push --force --tags" -ForegroundColor White
Write-Host "  4. Notify team members to reset their repos:" -ForegroundColor White
Write-Host "     git fetch origin && git reset --hard origin/main" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANT: Coordinate with your team before force pushing!" -ForegroundColor Yellow
Write-Host ""

