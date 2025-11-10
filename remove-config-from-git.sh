#!/bin/bash
# ============================================================================
# REMOVE config.json FROM GIT - SECURITY FIX
# ============================================================================
# This script removes config.json from git tracking while keeping your local file
# ============================================================================

echo ""
echo "🔒 SECURING config.json - Removing from Git"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check if config.json exists locally
if [ ! -f "config.json" ]; then
    echo "❌ config.json not found locally!"
    echo "   This script only removes it from git, it doesn't delete your local file."
    exit 1
fi

echo "✅ config.json exists locally (will be preserved)"

# Step 2: Check if it's tracked by git
if git ls-files --error-unmatch config.json > /dev/null 2>&1; then
    echo "⚠️  config.json is currently tracked by git"
    echo "   Removing from git tracking..."
    
    # Remove from git index (but keep local file)
    git rm --cached config.json
    
    if [ $? -eq 0 ]; then
        echo "✅ config.json removed from git tracking"
        echo "   Your local file is safe and unchanged"
    else
        echo "❌ Failed to remove from git"
        exit 1
    fi
else
    echo "✅ config.json is not tracked by git"
fi

# Step 3: Verify .gitignore
echo ""
echo "📝 Verifying .gitignore..."
if grep -q "^config\.json$" .gitignore 2>/dev/null; then
    echo "✅ .gitignore already contains config.json"
else
    echo "⚠️  Adding config.json to .gitignore..."
    echo "" >> .gitignore
    echo "# Configuration files that may contain secrets" >> .gitignore
    echo "config.json" >> .gitignore
    echo "!config.json.template" >> .gitignore
    echo "✅ Added config.json to .gitignore"
fi

# Step 4: Verify it's now ignored
echo ""
echo "🔍 Verifying config.json is now ignored..."
if git check-ignore config.json > /dev/null 2>&1; then
    echo "✅ SUCCESS! config.json is now properly ignored by git"
    echo "   It will NOT be committed to GitHub"
else
    echo "⚠️  config.json is still not ignored"
    echo "   Check .gitignore manually"
fi

# Step 5: Show git status
echo ""
echo "📊 Git Status:"
git status config.json 2>&1 | head -5

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ SECURITY FIX COMPLETE"
echo ""
echo "Next steps:"
echo "  1. Commit the removal: git commit -m 'Remove config.json from tracking'"
echo "  2. If already pushed to GitHub, you need to remove from history:"
echo "     See: docs/security/URGENT_AWS_KEY_REMEDIATION.md"
echo "  3. Verify: ./verify-everything.sh"
echo ""

