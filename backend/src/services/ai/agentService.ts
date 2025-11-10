import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput,
  ResponseStream,
} from '@aws-sdk/client-bedrock-agent-runtime'
import { BEDROCK_AGENT_CONFIG, BEDROCK_CONFIG } from '../../config/bedrock'
import { logger } from '../../utils/logger'
import { usageLogger } from '../../utils/usageLogger'

export interface AgentInvocationOptions {
  sessionId?: string
  enableTrace?: boolean
  maxIterations?: number
  timeout?: number
}

export interface AgentResponse {
  completion: string
  sessionId: string
  traceId?: string
  inputTokens?: number
  outputTokens?: number
  stopReason?: string
}

/**
 * AWS Bedrock Agent Service
 * Handles agent invocations with proper error handling, retries, and security
 */
class BedrockAgentService {
  private client: BedrockAgentRuntimeClient
  private readonly defaultTimeout: number

  constructor() {
    if (!BEDROCK_AGENT_CONFIG.agentId) {
      throw new Error('BEDROCK_AGENT_ID environment variable is required')
    }

    this.client = new BedrockAgentRuntimeClient({
      region: BEDROCK_CONFIG.region,
      // Credentials are automatically loaded from:
      // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
      // 2. IAM role (if running on EC2/ECS/Lambda)
      // 3. AWS credentials file (~/.aws/credentials)
      // 4. IAM instance profile
    })

    this.defaultTimeout = BEDROCK_AGENT_CONFIG.timeout
  }

  /**
   * Invoke Bedrock Agent with streaming response
   * Handles action group callbacks and provides comprehensive error handling
   */
  async invokeAgent(
    input: string,
    options: AgentInvocationOptions = {}
  ): Promise<AgentResponse> {
    const sessionId =
      options.sessionId ||
      `${BEDROCK_AGENT_CONFIG.sessionIdPrefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const startTime = Date.now()
    const timeout = options.timeout || this.defaultTimeout
    const maxIterations = options.maxIterations || BEDROCK_AGENT_CONFIG.maxIterations

    try {
      logger.info(`Invoking Bedrock Agent (sessionId: ${sessionId})`, {
        agentId: BEDROCK_AGENT_CONFIG.agentId,
        inputLength: input.length,
      })

      const commandInput: InvokeAgentCommandInput = {
        agentId: BEDROCK_AGENT_CONFIG.agentId,
        agentAliasId: BEDROCK_AGENT_CONFIG.agentAliasId,
        sessionId,
        inputText: input,
        enableTrace: options.enableTrace ?? BEDROCK_AGENT_CONFIG.enableTrace,
      }

      const command = new InvokeAgentCommand(commandInput)
      const response = await this.client.send(command)

      // Stream and accumulate the response
      const completionParts: string[] = []
      let stopReason: string | undefined
      let traceId: string | undefined
      let inputTokens = 0
      let outputTokens = 0
      let iterationCount = 0

      // Process streaming response
      if (response.completion) {
        for await (const event of response.completion as ResponseStream) {
          // Check timeout
          if (Date.now() - startTime > timeout) {
            logger.warn(`Agent invocation timeout (sessionId: ${sessionId})`)
            throw new Error('Agent invocation timeout exceeded')
          }

          // Check iteration limit
          if (++iterationCount > maxIterations) {
            logger.warn(`Agent max iterations exceeded (sessionId: ${sessionId})`)
            throw new Error('Agent max iterations exceeded')
          }

          // Handle different event types
          if (event.chunk) {
            const chunk = event.chunk
            if (chunk.bytes) {
              const text = new TextDecoder().decode(chunk.bytes)
              completionParts.push(text)
            }
          }

          if (event.trace) {
            traceId = event.trace.traceId
            // Log trace information for debugging (only in non-production)
            if (process.env.NODE_ENV !== 'production') {
              logger.debug('Agent trace event', { traceId, trace: event.trace })
            }
          }

          if (event.metadata) {
            if (event.metadata.usage) {
              inputTokens += event.metadata.usage.inputTokens || 0
              outputTokens += event.metadata.usage.outputTokens || 0
            }
            if (event.metadata.runtimeMetadata?.stopReason) {
              stopReason = event.metadata.runtimeMetadata.stopReason
            }
          }
        }
      }

      const completion = completionParts.join('')

      // Log usage
      if (inputTokens > 0 || outputTokens > 0) {
        usageLogger.logUsage(inputTokens, outputTokens, 'bedrock-agent')
      } else {
        // Fallback estimation if tokens not provided
        const estimatedInput = Math.ceil(input.length / 4)
        const estimatedOutput = Math.ceil(completion.length / 4)
        usageLogger.logUsage(estimatedInput, estimatedOutput, 'bedrock-agent')
      }

      logger.info(`Agent invocation completed (sessionId: ${sessionId})`, {
        completionLength: completion.length,
        inputTokens,
        outputTokens,
        stopReason,
        duration: Date.now() - startTime,
      })

      return {
        completion: completion.trim(),
        sessionId,
        traceId,
        inputTokens,
        outputTokens,
        stopReason,
      }
    } catch (error: any) {
      logger.error('Bedrock Agent invocation error', {
        sessionId,
        error: error.message,
        code: error.name,
        stack: error.stack,
      })

      // Handle specific AWS errors
      if (error.name === 'ThrottlingException') {
        throw new Error('Agent service is currently throttled. Please try again later.')
      } else if (error.name === 'ValidationException') {
        throw new Error(`Invalid agent configuration: ${error.message}`)
      } else if (error.name === 'AccessDeniedException') {
        throw new Error('Access denied to Bedrock Agent. Check IAM permissions.')
      } else if (error.name === 'ResourceNotFoundException') {
        throw new Error('Bedrock Agent not found. Verify agent ID and alias.')
      } else if (error.name === 'ServiceQuotaExceededException') {
        throw new Error('Agent service quota exceeded. Please contact support.')
      }

      throw new Error(`Agent invocation failed: ${error.message}`)
    }
  }

  /**
   * Invoke agent with retry logic for transient failures
   */
  async invokeAgentWithRetry(
    input: string,
    options: AgentInvocationOptions = {},
    maxRetries: number = 3
  ): Promise<AgentResponse> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.invokeAgent(input, options)
      } catch (error: any) {
        lastError = error

        // Don't retry on certain errors
        if (
          error.message.includes('timeout') ||
          error.message.includes('max iterations') ||
          error.message.includes('Invalid agent configuration') ||
          error.message.includes('Access denied') ||
          error.message.includes('not found')
        ) {
          throw error
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          logger.warn(`Agent invocation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Agent invocation failed after retries')
  }
}

export const bedrockAgentService = new BedrockAgentService()

