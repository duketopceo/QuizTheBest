# AWS Setup Guide

This guide covers the AWS services configuration needed for the Quiz The Best application.

## Prerequisites

- AWS Account
- AWS CLI configured with appropriate permissions
- Access to AWS Console

## 1. AWS Bedrock Setup

### Verify Model Availability

1. Navigate to AWS Bedrock Console: https://console.aws.amazon.com/bedrock/
2. Go to "Model access" in the left sidebar
3. Request access to Amazon Nova models (if not already enabled)
4. Verify that `amazon.nova-micro-v1:0` is available in your chosen region
5. **Recommended Region**: us-east-1 (verify availability before deployment)

### IAM Permissions

Create an IAM policy for Bedrock access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/amazon.nova-micro-v1:0"
    }
  ]
}
```

Attach this policy to your backend execution role (Lambda/EC2 instance role).

## 2. AWS Cognito Setup

### Create User Pool

1. Navigate to AWS Cognito Console: https://console.aws.amazon.com/cognito/
2. Click "Create user pool"
3. Configure sign-in options:
   - Select "Email" as sign-in option
4. Configure security requirements:
   - Password policy: Set your requirements
   - MFA: Optional for MVP
5. Configure sign-up experience:
   - Self-service sign-up: Enabled
   - Cognito-assisted verification: Email
6. Configure message delivery:
   - Email provider: Cognito default or SES
7. Integrate your app:
   - User pool name: `quiz-the-best-users`
   - App client name: `quiz-the-best-client`
   - **Important**: Enable "Generate client secret" if needed, or use public client
   - **Critical**: Enable "Refresh token" in App client settings
8. Review and create

### Get Configuration Values

After creating the User Pool:

1. Note the **User Pool ID** (format: `us-east-1_XXXXXXXXX`)
2. Note the **App Client ID**
3. Update these in your environment variables:
   - `COGNITO_USER_POOL_ID`
   - `COGNITO_CLIENT_ID`
   - `VITE_COGNITO_USER_POOL_ID` (frontend)
   - `VITE_COGNITO_CLIENT_ID` (frontend)

### Configure App Client

1. Go to "App integration" tab
2. Click on your app client
3. Under "Hosted UI", configure:
   - Allowed callback URLs: Your frontend URL (e.g., `http://localhost:5173`)
   - Allowed sign-out URLs: Your frontend URL
4. Under "Advanced app client settings":
   - **Enable refresh tokens**: Yes
   - Token expiration: Configure as needed

## 3. IAM Roles and Permissions

### Backend Execution Role

Create an IAM role for your backend (Lambda or EC2):

**Permissions needed:**
- Bedrock: InvokeModel (as configured above)
- Cognito: Read user pool configuration
- CloudWatch: Write logs

Example policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/amazon.nova-micro-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:DescribeUserPool",
        "cognito-idp:AdminGetUser"
      ],
      "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## 4. Environment Variables

### Backend (.env)

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id

BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
BEDROCK_MAX_TOKENS=2000
```

### Frontend (.env)

```env
VITE_API_URL=https://your-api-url.com/api
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=your-client-id
```

## 5. Verification Checklist

Before deployment, verify:

- [ ] AWS Nova Micro 1 model is available in Bedrock console for chosen region
- [ ] Cognito User Pool created with refresh tokens enabled
- [ ] App Client configured with correct callback URLs
- [ ] IAM roles have necessary permissions
- [ ] Environment variables configured correctly
- [ ] Test authentication flow locally

## 6. Testing

### Test Bedrock Access

```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'nova-micro')]"
```

### Test Cognito

Create a test user in Cognito console and verify login flow.

## Troubleshooting

### Bedrock Model Not Available

- Check region: Nova models may not be available in all regions
- Request model access in Bedrock console (Amazon Nova models)
- Verify IAM permissions

### Cognito Token Issues

- Verify refresh tokens are enabled in app client settings
- Check callback URLs match exactly
- Verify CORS configuration

### IAM Permission Errors

- Check CloudWatch logs for specific permission errors
- Verify IAM role is attached to Lambda/EC2 instance
- Test permissions with AWS CLI

## Additional Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Amazon Nova Models in Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)
