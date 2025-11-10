# ============================================================================
# QUIZ THE BEST - MASTER VERIFICATION SCRIPT
# ============================================================================
# This script verifies your entire setup is correct and ready to run.
# Run this before starting the app to catch issues early.
# ============================================================================

$ErrorActionPreference = "Continue"
$allChecksPassed = $true

Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     QUIZ THE BEST - MASTER VERIFICATION SCRIPT              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# ============================================================================
# SECTION 1: SECURITY CHECKS
# ============================================================================
Write-Host "🔒 SECURITY CHECKS" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check config.json is ignored
$configIgnored = git check-ignore config.json 2>$null
if ($configIgnored) {
    Write-Host "  ✅ config.json is properly ignored (won't be committed)" -ForegroundColor Green
} else {
    Write-Host "  ❌ config.json is NOT ignored - SECURITY RISK!" -ForegroundColor Red
    $allChecksPassed = $false
}

# Check aws-secrets.env is ignored
$secretsIgnored = git check-ignore backend/aws-secrets.env 2>$null
if ($secretsIgnored) {
    Write-Host "  ✅ backend/aws-secrets.env is properly ignored" -ForegroundColor Green
} else {
    Write-Host "  ❌ backend/aws-secrets.env is NOT ignored - SECURITY RISK!" -ForegroundColor Red
    $allChecksPassed = $false
}

# Check no secrets in staging
$stagedFiles = git diff --cached --name-only 2>$null
$secretFiles = $stagedFiles | Where-Object { $_ -match "config\.json|aws-secrets|\.env$" -and $_ -notmatch "\.env\.example|template" }
if (-not $secretFiles) {
    Write-Host "  ✅ No secret files in git staging area" -ForegroundColor Green
} else {
    Write-Host "  ❌ Secret files found in staging: $($secretFiles -join ', ')" -ForegroundColor Red
    $allChecksPassed = $false
}

Write-Host ""

# ============================================================================
# SECTION 2: CONFIGURATION FILES
# ============================================================================
Write-Host "📝 CONFIGURATION FILES" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check config.json exists
if (Test-Path "config.json") {
    Write-Host "  ✅ config.json exists" -ForegroundColor Green
    
    # Check if it has placeholder values
    $configContent = Get-Content "config.json" -Raw
    if ($configContent -match "YOUR_.*_HERE|XXXXXXXXX|1234567890abcdefghijklmn|AKIAIOSFODNN7EXAMPLE") {
        Write-Host "  ⚠️  config.json contains placeholder values - needs your real credentials" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ config.json appears to have real values (not placeholders)" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ config.json not found - create it from config.json.template" -ForegroundColor Red
    $allChecksPassed = $false
}

# Check config.json.template exists
if (Test-Path "config.json.template") {
    Write-Host "  ✅ config.json.template exists (reference file)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  config.json.template not found" -ForegroundColor Yellow
}

# Check backend/aws-secrets.env
if (Test-Path "backend/aws-secrets.env") {
    Write-Host "  ✅ backend/aws-secrets.env exists" -ForegroundColor Green
    $secretsContent = Get-Content "backend/aws-secrets.env" -Raw
    if ($secretsContent -match "YOUR_NEW_BEARER_TOKEN_HERE|YOUR_BEARER_TOKEN_HERE") {
        Write-Host "  ⚠️  aws-secrets.env contains placeholder - needs real bearer token" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  backend/aws-secrets.env not found (optional if using .env instead)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# SECTION 3: DEPENDENCIES
# ============================================================================
Write-Host "📦 DEPENDENCIES" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✅ Node.js installed: $nodeVersion" -ForegroundColor Green
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -ge 18) {
        Write-Host "  ✅ Node.js version 18+ (required)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Node.js version should be 18+ (you have $nodeMajor)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Node.js not found - install from https://nodejs.org/" -ForegroundColor Red
    $allChecksPassed = $false
}

# Check npm
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "  ✅ npm installed: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ npm not found" -ForegroundColor Red
    $allChecksPassed = $false
}

# Check backend dependencies
if (Test-Path "backend/node_modules") {
    Write-Host "  ✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Backend dependencies not installed - run: cd backend && npm install" -ForegroundColor Yellow
}

# Check frontend dependencies
if (Test-Path "frontend/node_modules") {
    Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Frontend dependencies not installed - run: cd frontend && npm install" -ForegroundColor Yellow
}

# Check Python (for scripts)
$pythonVersion = python --version 2>$null
if ($pythonVersion) {
    Write-Host "  ✅ Python installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Python not found (needed for generate_env_files.py)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# SECTION 4: ENVIRONMENT FILES
# ============================================================================
Write-Host "🌍 ENVIRONMENT FILES" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check backend .env
if (Test-Path "backend/.env") {
    Write-Host "  ✅ backend/.env exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  backend/.env not found - run: python scripts/generate_env_files.py" -ForegroundColor Yellow
}

# Check frontend .env
if (Test-Path "frontend/.env") {
    Write-Host "  ✅ frontend/.env exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  frontend/.env not found - run: python scripts/generate_env_files.py" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# SECTION 5: PROJECT STRUCTURE
# ============================================================================
Write-Host "📁 PROJECT STRUCTURE" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

$requiredDirs = @("backend/src", "frontend/src", "scripts", "docs")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir/ exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $dir/ missing" -ForegroundColor Red
        $allChecksPassed = $false
    }
}

Write-Host ""

# ============================================================================
# SECTION 6: GIT STATUS
# ============================================================================
Write-Host "🔀 GIT STATUS" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

if (Test-Path ".git") {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        $modifiedCount = ($gitStatus | Where-Object { $_ -match '^ M' }).Count
        $untrackedCount = ($gitStatus | Where-Object { $_ -match '^\?\?' }).Count
        Write-Host "  ℹ️  Git repository has uncommitted changes:" -ForegroundColor Cyan
        Write-Host "     - Modified: $modifiedCount files" -ForegroundColor Cyan
        Write-Host "     - Untracked: $untrackedCount files" -ForegroundColor Cyan
    } else {
        Write-Host "  ✅ Working directory clean" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Not a git repository" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# SECTION 7: QUICK CONNECTIVITY CHECK (Optional)
# ============================================================================
Write-Host "🌐 CONNECTIVITY (Optional)" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check if backend can start (syntax check)
if (Test-Path "backend/src/server.ts") {
    Write-Host "  ℹ️  Backend source files present" -ForegroundColor Cyan
} else {
    Write-Host "  ⚠️  Backend source files not found" -ForegroundColor Yellow
}

if (Test-Path "frontend/src/main.tsx") {
    Write-Host "  ℹ️  Frontend source files present" -ForegroundColor Cyan
} else {
    Write-Host "  ⚠️  Frontend source files not found" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    VERIFICATION SUMMARY                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($allChecksPassed) {
    Write-Host "✅ ALL CRITICAL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Fill out config.json with your real API keys" -ForegroundColor White
    Write-Host "  2. Run: python scripts/generate_env_files.py" -ForegroundColor White
    Write-Host "  3. Start backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "  4. Start frontend: cd frontend && npm run dev" -ForegroundColor White
} else {
    Write-Host "❌ SOME CRITICAL CHECKS FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues marked with ❌ above before proceeding." -ForegroundColor Yellow
    Write-Host "See SETUP.md for detailed setup instructions." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "For detailed setup: Read SETUP.md" -ForegroundColor Gray
Write-Host ""

