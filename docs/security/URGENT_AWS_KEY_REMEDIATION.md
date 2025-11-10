# 🚨 URGENT: AWS Access Key Compromised - Immediate Action Required

## Status: CRITICAL SECURITY INCIDENT

**AWS has detected and quarantined your compromised access key:**
- **IAM User**: `BedrockAPIKey-29o1`
- **Access Key ID**: `BedrockAPIKey-29o1-at-892485120182`
- **Status**: Quarantined with `AWSCompromisedKeyQuarantineV3` policy
- **Exposed Location**: https://raw.githubusercontent.com/duketopceo/QuizTheBest/174d04f236f97848d92fe9d1d39b8dcb11928530/backend/README_SECRETS.md

## ⚠️ IMMEDIATE ACTIONS (Do These NOW)

### Step 1: Delete the Compromised Access Key in AWS Console

1. **Log into AWS Console**
   - Go to: https://console.aws.amazon.com/iam/
   - Navigate to: IAM → Users → `BedrockAPIKey-29o1`

2. **Delete the Compromised Access Key**
   - Click on the user
   - Go to "Security credentials" tab
   - Find the access key ending in `...892485120182`
   - Click "Delete" and confirm
   - **DO NOT** just deactivate - DELETE it completely

3. **Verify Quarantine Policy**
   - Check that `AWSCompromisedKeyQuarantineV3` is applied
   - This should already be done by AWS, but verify

### Step 2: Create a New Access Key

1. **In the same IAM User page** (`BedrockAPIKey-29o1`)
2. **Create access key**
   - Click "Create access key"
   - Choose use case: "Application running outside AWS"
   - Click "Next" → "Create access key"
3. **Download the credentials immediately**
   - **Access Key ID**: Copy this
   - **Secret Access Key**: Copy this (you can only see it once!)
   - Download the CSV file as backup

### Step 3: Generate New Bearer Token

The bearer token is a base64-encoded version of your access key. You need to generate a new one:

**Option A: Using AWS CLI (if installed)**
```bash
# Set your new credentials
export AWS_ACCESS_KEY_ID="YOUR_NEW_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_NEW_SECRET_ACCESS_KEY"
export AWS_REGION="us-east-1"

# Test the credentials work
aws sts get-caller-identity
```

**Option B: Generate Bearer Token Manually**
The bearer token format is: `ABSK<base64-encoded-access-key-id>:<base64-encoded-secret-access-key>`

You can use this Python script:
```python
import base64

access_key_id = "YOUR_NEW_ACCESS_KEY_ID"
secret_access_key = "YOUR_NEW_SECRET_ACCESS_KEY"

# Encode both parts
encoded_key = base64.b64encode(access_key_id.encode()).decode()
encoded_secret = base64.b64encode(secret_access_key.encode()).decode()

# Combine
bearer_token = f"ABSK{encoded_key}:{encoded_secret}"
print(f"AWS_BEARER_TOKEN_BEDROCK={bearer_token}")
```

**Option C: Use AWS Console to Generate API Key**
- Some AWS services allow generating bearer tokens directly in the console
- Check AWS Bedrock console for API key generation options

### Step 4: Update Local Configuration

1. **Update `backend/aws-secrets.env`**
   ```bash
   # Replace the old token with your new one
   AWS_BEARER_TOKEN_BEDROCK=YOUR_NEW_BEARER_TOKEN_HERE
   ```

2. **Update any environment variables**
   - Check your deployment environments (Heroku, AWS, etc.)
   - Update CI/CD secrets (GitHub Actions, etc.)
   - Update Docker environment variables
   - Update any `.env` files

3. **Restart your application**
   - Stop any running services
   - Restart with new credentials

### Step 5: Remove Secret from GitHub History

The secret is still visible in GitHub at the commit URL. You MUST remove it:

#### Quick Method: Using git filter-repo

```bash
# Install git-filter-repo if needed
pip install git-filter-repo

# Remove the secret from all commits
git filter-repo --replace-text <(echo 'ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0==>REMOVED_SECRET')

# Force push (WARNING: Rewrites history)
git push --force --all
git push --force --tags
```

#### Alternative: Using BFG Repo-Cleaner

```bash
# Create secrets.txt with the token
echo "ABSKQmVkcm9ja0FQSUtleS0yOW8xLWF0LTg5MjQ4NTEyMDE4Mjo3WTlFcEhrMzlaSnAwdTdOclBLb2lPbGFRekFjSWdPR0RBKytBazFsVitGNWdnM05CWlpzVXJFamdLMD0=" > secrets.txt

# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text secrets.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force --all
```

**⚠️ IMPORTANT**: After force-pushing, notify all team members to:
```bash
git fetch origin
git reset --hard origin/main  # or origin/master
```

### Step 6: Verify Everything Works

1. **Test new credentials**
   ```bash
   cd backend
   # Load new token
   export AWS_BEARER_TOKEN_BEDROCK="YOUR_NEW_TOKEN"
   
   # Test your application
   npm start
   ```

2. **Check CloudWatch Logs**
   - Monitor for any unauthorized access attempts
   - Check for any suspicious activity before key rotation

3. **Review AWS Access Analyzer**
   - Check for any unexpected access patterns
   - Review IAM access logs

## Checklist

- [ ] Deleted compromised access key in AWS Console
- [ ] Created new access key
- [ ] Generated new bearer token
- [ ] Updated `backend/aws-secrets.env` with new token
- [ ] Updated all deployment environments
- [ ] Updated CI/CD secrets
- [ ] Removed secret from git history
- [ ] Force-pushed cleaned history to GitHub
- [ ] Notified team members to reset their local repos
- [ ] Tested application with new credentials
- [ ] Monitored for suspicious activity

## Prevention Measures

✅ Already implemented:
- `config.json` added to `.gitignore`
- `aws-secrets.env` already in `.gitignore`
- Secrets removed from documentation files
- `.env` files in `.gitignore`

**Additional recommendations:**
1. Enable GitHub Secret Scanning (Settings → Security → Code security)
2. Set up pre-commit hooks to scan for secrets
3. Use AWS Secrets Manager for production
4. Rotate keys regularly (every 90 days)
5. Use IAM roles instead of access keys when possible

## Monitoring

After remediation, monitor:
- AWS CloudTrail logs for unauthorized access
- AWS Cost Explorer for unexpected charges
- Application logs for authentication errors
- GitHub Security tab for new secret detections

## Support

If you need help:
- AWS Support: https://console.aws.amazon.com/support/
- GitHub Support: https://support.github.com/
- Review: `SECURITY_REMEDIATION.md` for additional details

---

**Remember**: The old key is compromised and quarantined. It cannot be used and must be deleted. All systems using it will fail until updated with new credentials.

