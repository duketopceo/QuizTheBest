# ============================================================================
# QUIZ THE BEST - MASTER VERIFICATION SCRIPT
# ============================================================================
# This script verifies your entire setup is correct and ready to run.
# Run this before starting the app to catch issues early.
# ============================================================================

$ErrorActionPreference = "Continue"
$allChecksPassed = $true
$warnings = @()

Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     QUIZ THE BEST - MASTER VERIFICATION SCRIPT              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# ============================================================================
# SECTION 1: SECURITY CHECKS (CRITICAL)
# ============================================================================
Write-Host "🔒 SECURITY CHECKS" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check .gitignore exists
if (Test-Path ".gitignore") {
    Write-Host "  ✅ .gitignore exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ .gitignore not found - SECURITY RISK!" -ForegroundColor Red
    $allChecksPassed = $false
}

# Check config.json is ignored
$configIgnored = git check-ignore config.json 2>$null
if ($configIgnored) {
    Write-Host "  ✅ config.json is properly ignored (won't be committed)" -ForegroundColor Green
} else {
    Write-Host "  ❌ config.json is NOT ignored - SECURITY RISK!" -ForegroundColor Red
    Write-Host "     Run: .\remove-config-from-git.ps1 to fix" -ForegroundColor Yellow
    $allChecksPassed = $false
}

# Check if config.json is tracked by git
$configTracked = git ls-files config.json 2>$null
if ($configTracked) {
    Write-Host "  ❌ config.json IS tracked by git - SECURITY RISK!" -ForegroundColor Red
    Write-Host "     Run: .\remove-config-from-git.ps1 to fix" -ForegroundColor Yellow
    $allChecksPassed = $false
} else {
    Write-Host "  ✅ config.json is NOT tracked by git" -ForegroundColor Green
}

# Check aws-secrets.env is ignored
$secretsIgnored = git check-ignore backend/aws-secrets.env 2>$null
if ($secretsIgnored) {
    Write-Host "  ✅ backend/aws-secrets.env is properly ignored" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  backend/aws-secrets.env is NOT ignored" -ForegroundColor Yellow
    $warnings += "backend/aws-secrets.env should be in .gitignore"
}

# Check no secrets in staging
$stagedFiles = git diff --cached --name-only 2>$null
if ($stagedFiles) {
    $secretFiles = $stagedFiles | Where-Object { 
        ($_ -match "config\.json$" -and $_ -notmatch "template|example") -or
        ($_ -match "aws-secrets") -or
        ($_ -match "\.env$" -and $_ -notmatch "\.env\.example|\.env\.template|template")
    }
    if ($secretFiles) {
        Write-Host "  ❌ Secret files found in staging: $($secretFiles -join ', ')" -ForegroundColor Red
        $allChecksPassed = $false
    } else {
        Write-Host "  ✅ No secret files in git staging area" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ No files staged (nothing to check)" -ForegroundColor Green
}

# Check if config.json was ever committed (git history)
if (Test-Path ".git") {
    $configInHistory = git log --all --full-history --oneline -- config.json 2>$null | Select-Object -First 1
    if ($configInHistory) {
        Write-Host "  ⚠️  config.json found in git history - may need cleanup" -ForegroundColor Yellow
        $warnings += "config.json exists in git history - consider removing from history"
    } else {
        Write-Host "  ✅ config.json not found in git history" -ForegroundColor Green
    }
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
    
    # Check if it's valid JSON
    try {
        $configContent = Get-Content "config.json" -Raw
        $configJson = $configContent | ConvertFrom-Json
        Write-Host "  ✅ config.json is valid JSON" -ForegroundColor Green
        
        # Check for required sections
        $requiredSections = @("backend", "frontend", "mobile")
        foreach ($section in $requiredSections) {
            if ($configJson.$section) {
                Write-Host "  ✅ config.json has '$section' section" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  config.json missing '$section' section" -ForegroundColor Yellow
                $warnings += "config.json missing $section section"
            }
        }
        
        # Check if it has placeholder values
        $configString = $configContent
        if ($configString -match "YOUR_.*_HERE|XXXXXXXXX|1234567890abcdefghijklmn|AKIAIOSFODNN7EXAMPLE|wJalrXUtnFEMI/K7MDENG") {
            Write-Host "  ⚠️  config.json contains placeholder values - needs your real credentials" -ForegroundColor Yellow
            $warnings += "config.json has placeholder values"
        } else {
            Write-Host "  ✅ config.json appears to have real values (not placeholders)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ config.json is not valid JSON: $_" -ForegroundColor Red
        $allChecksPassed = $false
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
    $warnings += "config.json.template missing"
}

# Check backend/aws-secrets.env
if (Test-Path "backend/aws-secrets.env") {
    Write-Host "  ✅ backend/aws-secrets.env exists" -ForegroundColor Green
    $secretsContent = Get-Content "backend/aws-secrets.env" -Raw
    if ($secretsContent -match "YOUR_NEW_BEARER_TOKEN_HERE|YOUR_BEARER_TOKEN_HERE") {
        Write-Host "  ⚠️  aws-secrets.env contains placeholder - needs real bearer token" -ForegroundColor Yellow
        $warnings += "aws-secrets.env has placeholder token"
    } elseif ($secretsContent -match "AWS_BEARER_TOKEN_BEDROCK=") {
        Write-Host "  ✅ aws-secrets.env has token configured" -ForegroundColor Green
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
        $warnings += "Node.js version $nodeMajor (need 18+)"
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
    if (Test-Path "backend/package.json") {
        Write-Host "  ✅ backend/package.json exists" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Backend dependencies not installed - run: cd backend && npm install" -ForegroundColor Yellow
    $warnings += "Backend dependencies not installed"
}

# Check frontend dependencies
if (Test-Path "frontend/node_modules") {
    Write-Host "  ✅ Frontend dependencies installed" -ForegroundColor Green
    if (Test-Path "frontend/package.json") {
        Write-Host "  ✅ frontend/package.json exists" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Frontend dependencies not installed - run: cd frontend && npm install" -ForegroundColor Yellow
    $warnings += "Frontend dependencies not installed"
}

# Check mobile dependencies
if (Test-Path "mobile/node_modules") {
    Write-Host "  ✅ Mobile dependencies installed" -ForegroundColor Green
    if (Test-Path "mobile/package.json") {
        Write-Host "  ✅ mobile/package.json exists" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Mobile dependencies not installed - run: cd mobile && npm install" -ForegroundColor Yellow
    $warnings += "Mobile dependencies not installed"
}

# Check Python (for scripts)
$pythonVersion = python --version 2>$null
if (-not $pythonVersion) {
    $pythonVersion = python3 --version 2>$null
}
if ($pythonVersion) {
    Write-Host "  ✅ Python installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Python not found (needed for generate_env_files.py)" -ForegroundColor Yellow
    $warnings += "Python not found"
}

# Check TypeScript compiler (tsc)
$tscVersion = tsc --version 2>$null
if ($tscVersion) {
    Write-Host "  ✅ TypeScript compiler available: $tscVersion" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  TypeScript compiler not found globally (may be in node_modules)" -ForegroundColor Yellow
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
    $backendEnv = Get-Content "backend/.env" -Raw
    if ($backendEnv -match "AWS_ACCESS_KEY_ID|COGNITO_USER_POOL_ID") {
        Write-Host "  ✅ backend/.env has required variables" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  backend/.env may be empty or incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  backend/.env not found - run: python scripts/generate_env_files.py" -ForegroundColor Yellow
    $warnings += "backend/.env missing"
}

# Check frontend .env
if (Test-Path "frontend/.env") {
    Write-Host "  ✅ frontend/.env exists" -ForegroundColor Green
    $frontendEnv = Get-Content "frontend/.env" -Raw
    if ($frontendEnv -match "VITE_") {
        Write-Host "  ✅ frontend/.env has VITE variables" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  frontend/.env may be empty or incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  frontend/.env not found - run: python scripts/generate_env_files.py" -ForegroundColor Yellow
    $warnings += "frontend/.env missing"
}

# Check mobile .env
if (Test-Path "mobile/.env") {
    Write-Host "  ✅ mobile/.env exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  mobile/.env not found - run: python scripts/generate_env_files.py" -ForegroundColor Yellow
    $warnings += "mobile/.env missing"
}

Write-Host ""

# ============================================================================
# SECTION 5: PROJECT STRUCTURE
# ============================================================================
Write-Host "📁 PROJECT STRUCTURE" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

$requiredDirs = @("backend/src", "frontend/src", "scripts", "docs", "mobile/src")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir/ exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $dir/ missing" -ForegroundColor Red
        $allChecksPassed = $false
    }
}

# Check critical source files
$criticalFiles = @(
    "backend/src/server.ts",
    "backend/src/app.ts",
    "frontend/src/main.tsx",
    "frontend/src/App.tsx",
    "mobile/src/App.tsx",
    "scripts/generate_env_files.py",
    "scripts/check_config.py"
)

Write-Host "`n  Checking critical source files..." -ForegroundColor Cyan
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "    ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "    ❌ $file missing" -ForegroundColor Red
        $allChecksPassed = $false
    }
}

# Check configuration files
$configFiles = @(
    "docker-compose.yml",
    "README.md",
    "SETUP.md"
)

Write-Host "`n  Checking configuration files..." -ForegroundColor Cyan
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "    ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  $file not found" -ForegroundColor Yellow
        $warnings += "$file missing"
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
        $addedCount = ($gitStatus | Where-Object { $_ -match '^A ' }).Count
        $untrackedCount = ($gitStatus | Where-Object { $_ -match '^\?\?' }).Count
        $deletedCount = ($gitStatus | Where-Object { $_ -match '^ D' }).Count
        
        Write-Host "  ℹ️  Git repository has uncommitted changes:" -ForegroundColor Cyan
        if ($modifiedCount -gt 0) { Write-Host "     - Modified: $modifiedCount files" -ForegroundColor Cyan }
        if ($addedCount -gt 0) { Write-Host "     - Added: $addedCount files" -ForegroundColor Cyan }
        if ($deletedCount -gt 0) { Write-Host "     - Deleted: $deletedCount files" -ForegroundColor Cyan }
        if ($untrackedCount -gt 0) { Write-Host "     - Untracked: $untrackedCount files" -ForegroundColor Cyan }
    } else {
        Write-Host "  ✅ Working directory clean" -ForegroundColor Green
    }
    
    # Check remote
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "  ✅ Git remote configured: $remote" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  No git remote configured" -ForegroundColor Yellow
        $warnings += "No git remote configured"
    }
} else {
    Write-Host "  ⚠️  Not a git repository" -ForegroundColor Yellow
    $warnings += "Not a git repository"
}

Write-Host ""

# ============================================================================
# SECTION 7: SCRIPT VERIFICATION
# ============================================================================
Write-Host "🔧 SCRIPT VERIFICATION" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check if Python scripts can run
if ($pythonVersion) {
    if (Test-Path "scripts/generate_env_files.py") {
        Write-Host "  ✅ generate_env_files.py exists" -ForegroundColor Green
        # Try to import (syntax check)
        $pythonCheck = python -c "import sys; sys.path.insert(0, 'scripts'); import generate_env_files" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ generate_env_files.py is valid Python" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  generate_env_files.py may have syntax errors" -ForegroundColor Yellow
        }
    }
    
    if (Test-Path "scripts/check_config.py") {
        Write-Host "  ✅ check_config.py exists" -ForegroundColor Green
    }
}

# Check verification scripts
$verifyScripts = @("verify-everything.ps1", "remove-config-from-git.ps1", "SYNC_NOW.ps1")
foreach ($script in $verifyScripts) {
    if (Test-Path $script) {
        Write-Host "  ✅ $script exists" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $script not found" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================================================
# SECTION 8: BUILD & COMPILATION (Optional)
# ============================================================================
Write-Host "🏗️  BUILD & COMPILATION (Optional)" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check for build directories
if (Test-Path "backend/dist") {
    Write-Host "  ✅ Backend build directory exists" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Backend not built yet (run: cd backend && npm run build)" -ForegroundColor Cyan
}

if (Test-Path "frontend/dist") {
    Write-Host "  ✅ Frontend build directory exists" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Frontend not built yet (run: cd frontend && npm run build)" -ForegroundColor Cyan
}

# Check TypeScript configs
if (Test-Path "backend/tsconfig.json") {
    Write-Host "  ✅ backend/tsconfig.json exists" -ForegroundColor Green
}
if (Test-Path "frontend/tsconfig.json") {
    Write-Host "  ✅ frontend/tsconfig.json exists" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# SECTION 9: PORT AVAILABILITY (Optional)
# ============================================================================
Write-Host "🌐 PORT AVAILABILITY (Optional)" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check if ports are in use (basic check)
$backendPort = 3000
$frontendPort = 5173

try {
    $backendConn = Test-NetConnection -ComputerName localhost -Port $backendPort -InformationLevel Quiet -WarningAction SilentlyContinue 2>$null
    if ($backendConn) {
        Write-Host "  ⚠️  Port $backendPort (backend) appears to be in use" -ForegroundColor Yellow
        $warnings += "Port $backendPort may be in use"
    } else {
        Write-Host "  ✅ Port $backendPort (backend) appears available" -ForegroundColor Green
    }
} catch {
    Write-Host "  ℹ️  Could not check port $backendPort" -ForegroundColor Cyan
}

try {
    $frontendConn = Test-NetConnection -ComputerName localhost -Port $frontendPort -InformationLevel Quiet -WarningAction SilentlyContinue 2>$null
    if ($frontendConn) {
        Write-Host "  ⚠️  Port $frontendPort (frontend) appears to be in use" -ForegroundColor Yellow
        $warnings += "Port $frontendPort may be in use"
    } else {
        Write-Host "  ✅ Port $frontendPort (frontend) appears available" -ForegroundColor Green
    }
} catch {
    Write-Host "  ℹ️  Could not check port $frontendPort" -ForegroundColor Cyan
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
} else {
    Write-Host "❌ SOME CRITICAL CHECKS FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues marked with ❌ above before proceeding." -ForegroundColor Yellow
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   - $warning" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
if (-not $allChecksPassed) {
    Write-Host "  1. Fix critical issues (❌) above" -ForegroundColor White
    Write-Host "  2. Address warnings (⚠️) if needed" -ForegroundColor White
}
Write-Host "  3. Fill out config.json with your real API keys" -ForegroundColor White
Write-Host "  4. Run: python scripts/generate_env_files.py" -ForegroundColor White
Write-Host "  5. Install dependencies: cd backend && npm install && cd ../frontend && npm install" -ForegroundColor White
Write-Host "  6. Start backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  7. Start frontend: cd frontend && npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "For detailed setup: Read SETUP.md" -ForegroundColor Gray
Write-Host ""
