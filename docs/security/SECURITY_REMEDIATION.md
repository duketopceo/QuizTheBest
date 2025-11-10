# Security Remediation Guide

## ⚠️ CRITICAL: Secrets Were Exposed in Repository

This guide provides steps to remove exposed secrets from your Git history and GitHub repository.

## Secrets That Were Exposed

1. **AWS Bearer Token** - Found in:
   - `backend/AWS_SECRETS_SETUP.md` (REMOVED)
   - `backend/README_SECRETS.md` (REMOVED)

2. **config.json** - Contains configuration that may include sensitive values
   - Now added to `.gitignore` to prevent future commits

## Immediate Actions Required

### 1. Rotate All Exposed Secrets

**CRITICAL**: If these secrets were real (not examples), you MUST rotate them immediately:

- [ ] **AWS Bearer Token**: Generate a new bearer token in AWS Console
- [ ] **AWS Access Keys** (if real): Delete and regenerate in AWS IAM
- [ ] **Firebase Private Key** (if real): Generate new service account key
- [ ] **Cognito Client IDs** (if real): These are less sensitive but consider rotating
- [ ] **SerpAPI Key** (if real): Regenerate in SerpAPI dashboard
- [ ] **Bedrock Agent IDs**: Review if these should be kept private

### 2. Remove Secrets from Git History

If secrets were already pushed to GitHub, you need to remove them from git history:

#### Option A: Using BFG Repo-Cleaner (Recommended - Faster)

```bash
# Install BFG (if not installed)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with secrets to remove
echo "ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0=" > secrets.txt

# Remove secrets from history
java -jar bfg.jar --replace-text secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push --force --all
git push --force --tags
```

#### Option B: Using git filter-repo (Alternative)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove secrets from all commits
git filter-repo --invert-paths --path backend/AWS_SECRETS_SETUP.md
git filter-repo --invert-paths --path backend/README_SECRETS.md
git filter-repo --replace-text secrets.txt

# Force push
git push --force --all
```

#### Option C: Manual git filter-branch (If above tools unavailable)

```bash
# Remove file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/AWS_SECRETS_SETUP.md backend/README_SECRETS.md" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now

# Force push
git push --force --all
```

### 3. Notify Team Members

**IMPORTANT**: After force-pushing, all team members must:

```bash
# Fetch latest
git fetch origin

# Reset their local branches
git reset --hard origin/main  # or origin/master

# Clean up local references
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 4. Enable GitHub Secret Scanning

1. Go to your GitHub repository
2. Settings → Security → Code security and analysis
3. Enable "Secret scanning" and "Push protection"

### 5. Review GitHub Security Alerts

1. Go to your GitHub repository
2. Security tab → Secret scanning
3. Review any detected secrets and rotate them

## Prevention Measures (Already Implemented)

✅ Added `config.json` to `.gitignore`
✅ Removed secrets from documentation files
✅ `aws-secrets.env` already in `.gitignore`
✅ `.env` files already in `.gitignore`

## Best Practices Going Forward

1. **Never commit secrets to git**
   - Use `.env` files (already gitignored)
   - Use `config.json.template` for examples
   - Use environment variables in production

2. **Use Secret Management Services**
   - AWS Secrets Manager
   - GitHub Secrets (for CI/CD)
   - Environment variables in deployment platforms

3. **Pre-commit Hooks**
   Consider adding a pre-commit hook to scan for secrets:
   ```bash
   # Install detect-secrets
   pip install detect-secrets
   
   # Scan before commit
   detect-secrets scan --baseline .secrets.baseline
   ```

4. **Code Review**
   - Always review config files before merging
   - Look for hardcoded credentials

## Verification

After remediation, verify secrets are removed:

```bash
# Search git history for exposed token
git log --all --full-history -p -S "ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0="

# Should return no results if successfully removed
```

## Additional Resources

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [AWS: Rotating access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_RotateAccessKey)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**Remember**: Even after removing secrets from git history, if they were exposed publicly, consider them compromised and rotate them immediately.

