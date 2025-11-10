import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { BEDROCK_CONFIG } from '../../config/bedrock'
import { usageLogger } from '../../utils/usageLogger'
import { logger } from '../../utils/logger'

/**
 * AWS Bedrock client for Mistral 7B model
 * With comprehensive token usage tracking
 */
class BedrockService {
  private client: BedrockRuntimeClient

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: BEDROCK_CONFIG.region,
    })
  }

  async invoke(prompt: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    try {
      const maxTokens = options.maxTokens || BEDROCK_CONFIG.maxTokens
      const temperature = options.temperature || BEDROCK_CONFIG.temperature

      const input = {
        modelId: BEDROCK_CONFIG.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          prompt,
          max_tokens: maxTokens,
          temperature,
          top_p: BEDROCK_CONFIG.topP,
        }),
      }

      const command = new InvokeModelCommand(input)
      const response = await this.client.send(command)

      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      
      // Extract response text (format may vary by model)
      const outputText = responseBody.completion || responseBody.text || responseBody.output || ''

      // Log token usage
      const inputTokens = this.estimateTokens(prompt)
      const outputTokens = this.estimateTokens(outputText)
      
      usageLogger.logUsage(inputTokens, outputTokens, BEDROCK_CONFIG.modelId)

      return outputText.trim()
    } catch (error: any) {
      logger.error('Bedrock invocation error:', error)
      throw new Error(`Bedrock API error: ${error.message}`)
    }
  }

  /**
   * Estimate token count (rough approximation)
   * In production, you might want to use a proper tokenizer
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4)
  }
}

export const bedrockService = new BedrockService()
