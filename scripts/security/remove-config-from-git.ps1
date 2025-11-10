# ============================================================================
# REMOVE config.json FROM GIT - SECURITY FIX
# ============================================================================
# This script removes config.json from git tracking while keeping your local file
# ============================================================================

Write-Host "`n🔒 SECURING config.json - Removing from Git" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Step 1: Check if config.json exists locally
if (-not (Test-Path "config.json")) {
    Write-Host "❌ config.json not found locally!" -ForegroundColor Red
    Write-Host "   This script only removes it from git, it doesn't delete your local file." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ config.json exists locally (will be preserved)" -ForegroundColor Green

# Step 2: Check if it's tracked by git
$tracked = git ls-files config.json 2>$null
if ($tracked) {
    Write-Host "⚠️  config.json is currently tracked by git" -ForegroundColor Yellow
    Write-Host "   Removing from git tracking..." -ForegroundColor Yellow
    
    # Remove from git index (but keep local file)
    git rm --cached config.json 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ config.json removed from git tracking" -ForegroundColor Green
        Write-Host "   Your local file is safe and unchanged" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to remove from git" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ config.json is not tracked by git" -ForegroundColor Green
}

# Step 3: Verify .gitignore
Write-Host "`n📝 Verifying .gitignore..." -ForegroundColor Cyan
$gitignoreContent = Get-Content .gitignore -Raw -ErrorAction SilentlyContinue
if ($gitignoreContent -match "^\s*config\.json\s*$" -or ($gitignoreContent -split "`n" | Select-String -Pattern "^\s*config\.json\s*$")) {
    Write-Host "✅ .gitignore already contains config.json" -ForegroundColor Green
} else {
    Write-Host "⚠️  Adding config.json to .gitignore..." -ForegroundColor Yellow
    if (-not (Test-Path ".gitignore")) {
        New-Item .gitignore -ItemType File | Out-Null
    }
    Add-Content .gitignore "`n# Configuration files that may contain secrets`nconfig.json`n!config.json.template"
    Write-Host "✅ Added config.json to .gitignore" -ForegroundColor Green
}

# Step 4: Verify it's now ignored
Write-Host "`n🔍 Verifying config.json is now ignored..." -ForegroundColor Cyan
$ignored = git check-ignore config.json 2>$null
if ($ignored) {
    Write-Host "✅ SUCCESS! config.json is now properly ignored by git" -ForegroundColor Green
    Write-Host "   It will NOT be committed to GitHub" -ForegroundColor Green
} else {
    Write-Host "⚠️  config.json is still not ignored" -ForegroundColor Yellow
    Write-Host "   Check .gitignore manually" -ForegroundColor Yellow
}

# Step 5: Show git status
Write-Host "`n📊 Git Status:" -ForegroundColor Cyan
git status config.json 2>&1 | Select-Object -First 5

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "✅ SECURITY FIX COMPLETE" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Commit the removal: git commit -m 'Remove config.json from tracking'" -ForegroundColor White
Write-Host "  2. If already pushed to GitHub, you need to remove from history:" -ForegroundColor White
Write-Host "     Run: .\scripts\security\remove-config-from-history.ps1" -ForegroundColor White
Write-Host "  3. Verify: .\verify-everything.ps1" -ForegroundColor White
Write-Host ""

