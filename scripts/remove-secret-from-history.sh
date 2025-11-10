#!/bin/bash
# Bash script to remove exposed AWS bearer token from git history
# Run this script from the repository root

echo "🚨 Removing compromised AWS bearer token from git history..."
echo ""

# The compromised token
COMPROMISED_TOKEN="ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0="

# Check if git-filter-repo is available
if command -v git-filter-repo &> /dev/null; then
    echo "✅ Using git-filter-repo..."
    
    # Create replacement file
    echo "ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0==>REMOVED_COMPROMISED_SECRET" > secret-replacement.txt
    
    echo "⚠️  This will rewrite git history. Continue? (y/N)"
    read -r confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        git filter-repo --replace-text secret-replacement.txt
        
        echo ""
        echo "✅ Secret removed from history!"
        echo "⚠️  Next steps:"
        echo "   1. Review changes: git log"
        echo "   2. Force push: git push --force --all"
        echo "   3. Notify team members to reset their repos"
    else
        echo "Cancelled."
    fi
    
    rm -f secret-replacement.txt
else
    echo "❌ git-filter-repo not found."
    echo ""
    echo "Install with: pip install git-filter-repo"
    echo "Or use BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/"
    echo ""
    echo "Manual method:"
    echo "  git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/README_SECRETS.md backend/AWS_SECRETS_SETUP.md' --prune-empty --tag-name-filter cat -- --all"
fi

echo ""
echo "⚠️  IMPORTANT: After removing from history, you MUST:"
echo "   1. Delete the compromised key in AWS Console"
echo "   2. Create a new access key"
echo "   3. Update backend/aws-secrets.env with new token"
echo "   4. Update all deployment environments"
echo ""
echo "See docs/security/URGENT_AWS_KEY_REMEDIATION.md for complete instructions."

