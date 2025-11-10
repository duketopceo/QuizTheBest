# AWS Bedrock Agent Integration Guide

This document provides comprehensive guidance on setting up and using AWS Bedrock Agents with action groups in the QuizTheBest backend.

## Overview

The backend integrates with AWS Bedrock Agents to generate study sets using the Nova Micro 1.0 model. The agent uses action groups to call backend API functions for:
- Content search
- Study set generation
- Data storage

## Architecture

```
Frontend/Mobile → Backend API (/api/ai/studyset)
                      ↓
              Agent Orchestrator
                      ↓
          Bedrock Agent Service
                      ↓
              AWS Bedrock Agent
                      ↓
          Action Groups (callbacks)
                      ↓
              Backend API Functions
```

## Prerequisites

1. **AWS Account** with Bedrock access
2. **Bedrock Agent** created in AWS Console
3. **IAM Permissions** for Bedrock Agent Runtime
4. **Environment Variables** configured

## Environment Variables

Add these to your `.env` file:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Bedrock Agent Configuration
BEDROCK_AGENT_ID=your-agent-id
BEDROCK_AGENT_ALIAS_ID=TSTALIASID  # or DRAFTALIASID for draft
BEDROCK_AGENT_MAX_ITERATIONS=20
BEDROCK_AGENT_TIMEOUT=300000  # 5 minutes in milliseconds
BEDROCK_AGENT_ENABLE_TRACE=false  # Set to true for debugging
```

## AWS Setup Steps

### 1. Create Bedrock Agent

1. Go to AWS Bedrock Console → Agents
2. Click "Create Agent"
3. Configure:
   - **Agent name**: `QuizTheBest-Agent`
   - **Foundation model**: `Amazon Nova Micro v1:0`
   - **Agent resource role**: Create new IAM role with Bedrock permissions
   - **Description**: "Study set generation agent"

### 2. Configure Action Groups

Action groups allow the agent to call your backend API functions.

#### Action Group 1: ContentSearch

1. In agent configuration, add Action Group
2. **Name**: `ContentSearch`
3. **Type**: API
4. **API Schema**: Use the OpenAPI schema provided below
5. **Lambda function**: Not required (using API endpoint)
6. **API endpoint**: `https://your-api.com/api/ai/action-group-callback`
7. **Authentication**: 
   - Type: `CUSTOMER_MANAGED`
   - Credential: Configure with your API authentication

#### Action Group 2: StudySetGeneration

Similar setup for study set generation functions.

#### Action Group 3: DataStorage

For storing generated study sets.

### 3. IAM Permissions

Your backend needs these IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock:GetAgent",
        "bedrock:GetAgentAlias"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:agent/*",
        "arn:aws:bedrock:*:*:agent-alias/*"
      ]
    }
  ]
}
```

### 4. Agent Resource Role

The agent's resource role needs permissions to invoke your API:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/amazon.nova-micro-v1:0"
      ]
    }
  ]
}
```

## OpenAPI Schema for Action Groups

Save this as `action-groups-openapi.yaml` and use it when configuring action groups:

```yaml
openapi: 3.0.0
info:
  title: QuizTheBest Action Groups API
  version: 1.0.0
  description: API schema for Bedrock Agent action groups

servers:
  - url: https://your-api.com/api

paths:
  /ai/action-group-callback:
    post:
      summary: Action group callback endpoint
      operationId: handleActionGroup
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                actionGroupInvocationInput:
                  type: object
                  properties:
                    actionGroupName:
                      type: string
                      enum: [ContentSearch, StudySetGeneration, DataStorage]
                    verb:
                      type: string
                      enum: [GET, POST, PUT, DELETE]
                    apiPath:
                      type: string
                    parameters:
                      type: array
                      items:
                        type: object
                        properties:
                          name:
                            type: string
                          type:
                            type: string
                          value:
                            type: string
                    requestBody:
                      type: object
                sessionId:
                  type: string
                messageVersion:
                  type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object

  /search:
    get:
      summary: Search for content
      operationId: searchContent
      parameters:
        - name: query
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Search results
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  results:
                    type: array
                    items:
                      type: object
                      properties:
                        title:
                          type: string
                        url:
                          type: string
                        snippet:
                          type: string

  /study-sets:
    post:
      summary: Create study set
      operationId: createStudySet
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - topic
                - summary
                - flashcards
                - quiz
              properties:
                topic:
                  type: string
                summary:
                  type: string
                flashcards:
                  type: array
                  items:
                    type: object
                    properties:
                      question:
                        type: string
                      answer:
                        type: string
                quiz:
                  type: object
                  properties:
                    questions:
                      type: array
                      items:
                        type: object
      responses:
        '200':
          description: Study set created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  studySetId:
                    type: string
                  topicId:
                    type: string
```

## API Endpoints

### POST /api/ai/studyset

Generate a study set using the Bedrock Agent.

**Request:**
```json
{
  "topic": "Machine Learning Basics",
  "options": {
    "includeSummary": true,
    "flashcardCount": 10,
    "quizQuestionCount": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "Machine Learning Basics",
    "summary": "...",
    "flashcards": [
      {
        "question": "...",
        "answer": "..."
      }
    ],
    "quiz": {
      "questions": [...]
    },
    "metadata": {
      "sessionId": "...",
      "traceId": "...",
      "inputTokens": 1000,
      "outputTokens": 2000
    }
  }
}
```

### POST /api/ai/action-group-callback

Internal endpoint called by Bedrock Agent for action group invocations. Requires authentication.

## Security Best Practices

### 1. Authentication

- All agent endpoints require JWT authentication via `authMiddleware`
- Action group callbacks validate user identity from session context

### 2. Rate Limiting

- Study set generation uses `strictRateLimiter` (20 requests/hour)
- Action group callbacks have separate rate limits

### 3. Input Validation

- All inputs are sanitized using `contentSanitizer`
- Topic length and content are validated
- Request size is limited to 10MB

### 4. Error Handling

- Comprehensive error handling with specific error codes
- No sensitive information leaked in error messages
- Proper logging for debugging

### 5. IAM Security

- Use least-privilege IAM policies
- Rotate credentials regularly
- Use IAM roles instead of access keys when possible (EC2/ECS/Lambda)

### 6. Network Security

- Use HTTPS in production
- Validate Content-Type headers
- Implement request size limits

## Error Handling

The agent service handles various AWS errors:

- **ThrottlingException**: Returns 429 with retry suggestion
- **ValidationException**: Returns 400 with validation error
- **AccessDeniedException**: Returns 500 with config error
- **ResourceNotFoundException**: Returns 500 with agent not found error
- **Timeout**: Returns 504 with timeout message

## Monitoring and Logging

### Logging

All agent invocations are logged with:
- Session ID
- User ID
- Topic
- Token usage
- Duration
- Errors

### Metrics to Monitor

1. **Agent invocation success rate**
2. **Average response time**
3. **Token usage** (input/output)
4. **Error rates by type**
5. **Action group callback success rate**

### CloudWatch Integration

Consider adding CloudWatch metrics:
- `AgentInvocations`
- `AgentErrors`
- `AgentLatency`
- `TokenUsage`

## Testing

### Local Testing

1. Set up local AWS credentials
2. Configure environment variables
3. Test agent invocation:
   ```bash
   curl -X POST http://localhost:3000/api/ai/studyset \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"topic": "Test Topic"}'
   ```

### Integration Testing

1. Create test agent in AWS
2. Configure action groups with test endpoints
3. Test end-to-end flow

## Troubleshooting

### Agent Not Found

- Verify `BEDROCK_AGENT_ID` is correct
- Check agent exists in AWS Console
- Verify region matches

### Access Denied

- Check IAM permissions
- Verify agent resource role
- Check API authentication for action groups

### Timeout Issues

- Increase `BEDROCK_AGENT_TIMEOUT`
- Reduce `flashcardCount` or `quizQuestionCount`
- Check network connectivity

### Action Group Callbacks Failing

- Verify callback URL is accessible
- Check authentication configuration
- Review action group logs in CloudWatch

## Deployment Considerations

### Production Checklist

- [ ] Agent ID and alias configured
- [ ] IAM roles and permissions set up
- [ ] Action group endpoints are HTTPS
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Monitoring and alerting set up
- [ ] Credentials secured (use secrets manager)
- [ ] CORS configured correctly
- [ ] Content sanitization enabled

### Environment-Specific Configuration

- **Development**: Use `DRAFTALIASID` for agent alias
- **Production**: Use `TSTALIASID` or create custom alias
- **Staging**: Use separate agent or alias

## Cost Optimization

1. **Token Usage**: Monitor and optimize prompts
2. **Caching**: Cache generated study sets
3. **Rate Limiting**: Prevent excessive invocations
4. **Timeout Management**: Set appropriate timeouts
5. **Model Selection**: Nova Micro is cost-effective

## Additional Resources

- [AWS Bedrock Agents Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Bedrock Agent Runtime API Reference](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_InvokeAgent.html)
- [Action Groups Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-action-groups.html)

