import { logger } from './logger'

/**
 * Token usage tracking for AWS Bedrock
 * Monitor token usage to prevent unexpected costs
 */
interface TokenUsage {
  inputTokens: number
  outputTokens: number
  timestamp: string
  modelId: string
  userId?: string
}

class UsageLogger {
  private usageLog: TokenUsage[] = []

  logUsage(
    inputTokens: number,
    outputTokens: number,
    modelId: string,
    userId?: string
  ) {
    const usage: TokenUsage = {
      inputTokens,
      outputTokens,
      timestamp: new Date().toISOString(),
      modelId,
      userId,
    }

    this.usageLog.push(usage)

    // Log to console for monitoring
    logger.info('Bedrock token usage:', {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      modelId,
      userId,
    })

    // In production, you might want to:
    // - Store in database for analytics
    // - Send to monitoring service
    // - Alert if usage exceeds thresholds
  }

  getTotalUsage(): { inputTokens: number; outputTokens: number; totalTokens: number } {
    return this.usageLog.reduce(
      (acc, usage) => ({
        inputTokens: acc.inputTokens + usage.inputTokens,
        outputTokens: acc.outputTokens + usage.outputTokens,
        totalTokens: acc.totalTokens + usage.inputTokens + usage.outputTokens,
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    )
  }

  getUsageByUser(userId: string): { inputTokens: number; outputTokens: number; totalTokens: number } {
    const userUsage = this.usageLog.filter(usage => usage.userId === userId)
    return userUsage.reduce(
      (acc, usage) => ({
        inputTokens: acc.inputTokens + usage.inputTokens,
        outputTokens: acc.outputTokens + usage.outputTokens,
        totalTokens: acc.totalTokens + usage.inputTokens + usage.outputTokens,
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    )
  }
}

export const usageLogger = new UsageLogger()
