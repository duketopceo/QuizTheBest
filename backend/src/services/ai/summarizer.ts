import { bedrockService } from './bedrock'
import { PROMPTS } from './prompts'
import { contentSanitizer } from '../../utils/contentSanitizer'
import { logger } from '../../utils/logger'

/**
 * Summarize content using AWS Bedrock
 */
export async function summarizeContent(content: string, topic: string): Promise<string> {
  try {
    // Combine content if it's an array
    const combinedContent = Array.isArray(content) 
      ? content.join('\n\n---\n\n') 
      : content

    // Limit content length to prevent token overflow
    const limitedContent = combinedContent.substring(0, 10000)

    const prompt = PROMPTS.summarize(limitedContent, topic)
    const summary = await bedrockService.invoke(prompt, {
      maxTokens: 1000,
      temperature: 0.7,
    })

    // Sanitize the summary before returning
    const sanitized = contentSanitizer.sanitize(summary)
    
    if (!contentSanitizer.validate(sanitized)) {
      throw new Error('Generated summary failed validation')
    }

    return sanitized
  } catch (error: any) {
    logger.error('Summarization error:', error)
    throw new Error(`Failed to generate summary: ${error.message}`)
  }
}
