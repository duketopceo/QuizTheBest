#!/bin/bash
# Verify no secrets are being committed to git

echo "🔍 Checking for secrets in git staging area..."

# Check if config.json is ignored
if git check-ignore config.json > /dev/null 2>&1; then
    echo "✅ config.json is properly ignored"
else
    echo "❌ WARNING: config.json is NOT ignored!"
    exit 1
fi

# Check if aws-secrets.env is ignored
if git check-ignore backend/aws-secrets.env > /dev/null 2>&1; then
    echo "✅ backend/aws-secrets.env is properly ignored"
else
    echo "❌ WARNING: backend/aws-secrets.env is NOT ignored!"
    exit 1
fi

# Check staged files for secrets
STAGED_FILES=$(git diff --cached --name-only)
SECRET_FILES=$(echo "$STAGED_FILES" | grep -E "config\.json|aws-secrets|\.env$" | grep -v "\.env\.example\|template")

if [ -n "$SECRET_FILES" ]; then
    echo "❌ WARNING: Secret files found in staging area:"
    echo "$SECRET_FILES"
    exit 1
else
    echo "✅ No secret files in staging area"
fi

echo ""
echo "✅ All checks passed! Safe to commit."

