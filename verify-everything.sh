#!/bin/bash
# ============================================================================
# QUIZ THE BEST - MASTER VERIFICATION SCRIPT
# ============================================================================
# This script verifies your entire setup is correct and ready to run.
# Run this before starting the app to catch issues early.
# ============================================================================

all_checks_passed=true

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     QUIZ THE BEST - MASTER VERIFICATION SCRIPT              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# SECTION 1: SECURITY CHECKS
# ============================================================================
echo "🔒 SECURITY CHECKS"
echo "───────────────────────────────────────────────────────────────"

# Check config.json is ignored
if git check-ignore config.json > /dev/null 2>&1; then
    echo "  ✅ config.json is properly ignored (won't be committed)"
else
    echo "  ❌ config.json is NOT ignored - SECURITY RISK!"
    all_checks_passed=false
fi

# Check aws-secrets.env is ignored
if git check-ignore backend/aws-secrets.env > /dev/null 2>&1; then
    echo "  ✅ backend/aws-secrets.env is properly ignored"
else
    echo "  ❌ backend/aws-secrets.env is NOT ignored - SECURITY RISK!"
    all_checks_passed=false
fi

# Check no secrets in staging
staged_files=$(git diff --cached --name-only 2>/dev/null)
secret_files=$(echo "$staged_files" | grep -E "config\.json|aws-secrets|\.env$" | grep -v "\.env\.example\|template")
if [ -z "$secret_files" ]; then
    echo "  ✅ No secret files in git staging area"
else
    echo "  ❌ Secret files found in staging: $secret_files"
    all_checks_passed=false
fi

echo ""

# ============================================================================
# SECTION 2: CONFIGURATION FILES
# ============================================================================
echo "📝 CONFIGURATION FILES"
echo "───────────────────────────────────────────────────────────────"

# Check config.json exists
if [ -f "config.json" ]; then
    echo "  ✅ config.json exists"
    
    # Check if it has placeholder values
    if grep -qE "YOUR_.*_HERE|XXXXXXXXX|1234567890abcdefghijklmn|AKIAIOSFODNN7EXAMPLE" config.json; then
        echo "  ⚠️  config.json contains placeholder values - needs your real credentials"
    else
        echo "  ✅ config.json appears to have real values (not placeholders)"
    fi
else
    echo "  ❌ config.json not found - create it from config.json.template"
    all_checks_passed=false
fi

# Check config.json.template exists
if [ -f "config.json.template" ]; then
    echo "  ✅ config.json.template exists (reference file)"
else
    echo "  ⚠️  config.json.template not found"
fi

# Check backend/aws-secrets.env
if [ -f "backend/aws-secrets.env" ]; then
    echo "  ✅ backend/aws-secrets.env exists"
    if grep -qE "YOUR_NEW_BEARER_TOKEN_HERE|YOUR_BEARER_TOKEN_HERE" backend/aws-secrets.env; then
        echo "  ⚠️  aws-secrets.env contains placeholder - needs real bearer token"
    fi
else
    echo "  ⚠️  backend/aws-secrets.env not found (optional if using .env instead)"
fi

echo ""

# ============================================================================
# SECTION 3: DEPENDENCIES
# ============================================================================
echo "📦 DEPENDENCIES"
echo "───────────────────────────────────────────────────────────────"

# Check Node.js
if command -v node > /dev/null 2>&1; then
    node_version=$(node --version)
    echo "  ✅ Node.js installed: $node_version"
    node_major=$(echo "$node_version" | sed 's/v\([0-9]*\).*/\1/')
    if [ "$node_major" -ge 18 ]; then
        echo "  ✅ Node.js version 18+ (required)"
    else
        echo "  ⚠️  Node.js version should be 18+ (you have $node_major)"
    fi
else
    echo "  ❌ Node.js not found - install from https://nodejs.org/"
    all_checks_passed=false
fi

# Check npm
if command -v npm > /dev/null 2>&1; then
    npm_version=$(npm --version)
    echo "  ✅ npm installed: v$npm_version"
else
    echo "  ❌ npm not found"
    all_checks_passed=false
fi

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo "  ✅ Backend dependencies installed"
else
    echo "  ⚠️  Backend dependencies not installed - run: cd backend && npm install"
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo "  ✅ Frontend dependencies installed"
else
    echo "  ⚠️  Frontend dependencies not installed - run: cd frontend && npm install"
fi

# Check Python
if command -v python3 > /dev/null 2>&1 || command -v python > /dev/null 2>&1; then
    python_cmd=$(command -v python3 2>/dev/null || command -v python 2>/dev/null)
    python_version=$($python_cmd --version 2>&1)
    echo "  ✅ Python installed: $python_version"
else
    echo "  ⚠️  Python not found (needed for generate_env_files.py)"
fi

echo ""

# ============================================================================
# SECTION 4: ENVIRONMENT FILES
# ============================================================================
echo "🌍 ENVIRONMENT FILES"
echo "───────────────────────────────────────────────────────────────"

# Check backend .env
if [ -f "backend/.env" ]; then
    echo "  ✅ backend/.env exists"
else
    echo "  ⚠️  backend/.env not found - run: python scripts/generate_env_files.py"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo "  ✅ frontend/.env exists"
else
    echo "  ⚠️  frontend/.env not found - run: python scripts/generate_env_files.py"
fi

echo ""

# ============================================================================
# SECTION 5: PROJECT STRUCTURE
# ============================================================================
echo "📁 PROJECT STRUCTURE"
echo "───────────────────────────────────────────────────────────────"

required_dirs=("backend/src" "frontend/src" "scripts" "docs")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir/ exists"
    else
        echo "  ❌ $dir/ missing"
        all_checks_passed=false
    fi
done

echo ""

# ============================================================================
# SECTION 6: GIT STATUS
# ============================================================================
echo "🔀 GIT STATUS"
echo "───────────────────────────────────────────────────────────────"

if [ -d ".git" ]; then
    git_status=$(git status --porcelain 2>/dev/null)
    if [ -n "$git_status" ]; then
        modified_count=$(echo "$git_status" | grep -c "^ M" || echo "0")
        untracked_count=$(echo "$git_status" | grep -c "^??" || echo "0")
        echo "  ℹ️  Git repository has uncommitted changes:"
        echo "     - Modified: $modified_count files"
        echo "     - Untracked: $untracked_count files"
    else
        echo "  ✅ Working directory clean"
    fi
else
    echo "  ⚠️  Not a git repository"
fi

echo ""

# ============================================================================
# SECTION 7: QUICK CONNECTIVITY CHECK (Optional)
# ============================================================================
echo "🌐 CONNECTIVITY (Optional)"
echo "───────────────────────────────────────────────────────────────"

# Check if backend can start (syntax check)
if [ -f "backend/src/server.ts" ]; then
    echo "  ℹ️  Backend source files present"
else
    echo "  ⚠️  Backend source files not found"
fi

if [ -f "frontend/src/main.tsx" ]; then
    echo "  ℹ️  Frontend source files present"
else
    echo "  ⚠️  Frontend source files not found"
fi

echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION SUMMARY                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$all_checks_passed" = true ]; then
    echo "✅ ALL CRITICAL CHECKS PASSED!"
    echo ""
    echo "Next steps:"
    echo "  1. Fill out config.json with your real API keys"
    echo "  2. Run: python scripts/generate_env_files.py"
    echo "  3. Start backend: cd backend && npm run dev"
    echo "  4. Start frontend: cd frontend && npm run dev"
else
    echo "❌ SOME CRITICAL CHECKS FAILED!"
    echo ""
    echo "Please fix the issues marked with ❌ above before proceeding."
    echo "See SETUP.md for detailed setup instructions."
fi

echo ""
echo "For detailed setup: Read SETUP.md"
echo ""

