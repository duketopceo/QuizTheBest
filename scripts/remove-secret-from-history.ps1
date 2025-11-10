# PowerShell script to remove exposed AWS bearer token from git history
# Run this script from the repository root

Write-Host "🚨 Removing compromised AWS bearer token from git history..." -ForegroundColor Red
Write-Host ""

# The compromised token
$compromisedToken = "ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0="

# Check if git-filter-repo is available
$hasFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if ($hasFilterRepo) {
    Write-Host "✅ Using git-filter-repo..." -ForegroundColor Green
    
    # Create replacement file
    $replacementFile = "secret-replacement.txt"
    "ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0==>REMOVED_COMPROMISED_SECRET" | Out-File -FilePath $replacementFile -Encoding utf8
    
    Write-Host "⚠️  This will rewrite git history. Continue? (y/N)" -ForegroundColor Yellow
    $confirm = Read-Host
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        git filter-repo --replace-text $replacementFile
        
        Write-Host ""
        Write-Host "✅ Secret removed from history!" -ForegroundColor Green
        Write-Host "⚠️  Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Review changes: git log"
        Write-Host "   2. Force push: git push --force --all"
        Write-Host "   3. Notify team members to reset their repos"
    } else {
        Write-Host "Cancelled." -ForegroundColor Yellow
    }
    
    Remove-Item $replacementFile -ErrorAction SilentlyContinue
} else {
    Write-Host "❌ git-filter-repo not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install options:" -ForegroundColor Yellow
    Write-Host "  1. pip install git-filter-repo"
    Write-Host "  2. Or use BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/"
    Write-Host ""
    Write-Host "Manual method:" -ForegroundColor Yellow
    Write-Host "  git filter-branch --force --index-filter `"git rm --cached --ignore-unmatch backend/README_SECRETS.md backend/AWS_SECRETS_SETUP.md`" --prune-empty --tag-name-filter cat -- --all"
}

Write-Host ""
Write-Host "⚠️  IMPORTANT: After removing from history, you MUST:" -ForegroundColor Red
Write-Host "   1. Delete the compromised key in AWS Console"
Write-Host "   2. Create a new access key"
Write-Host "   3. Update backend/aws-secrets.env with new token"
Write-Host "   4. Update all deployment environments"
Write-Host ""
Write-Host "See docs/security/URGENT_AWS_KEY_REMEDIATION.md for complete instructions."

