import { bedrockAgentService, AgentResponse } from './agentService'
import { logger } from '../../utils/logger'
import { contentSanitizer } from '../../utils/contentSanitizer'

export interface StudySetGenerationRequest {
  topic: string
  options?: {
    includeSummary?: boolean
    flashcardCount?: number
    quizQuestionCount?: number
    timeout?: number
  }
}

export interface StudySetGenerationResult {
  summary?: string
  flashcards?: Array<{ question: string; answer: string }>
  quiz?: {
    questions: Array<{
      type: 'multiple-choice' | 'true-false'
      question: string
      options?: string[]
      correctAnswer: string | number
      explanation?: string
    }>
  }
  sessionId: string
  traceId?: string
  metadata?: {
    inputTokens?: number
    outputTokens?: number
    stopReason?: string
  }
}

/**
 * Agent Orchestrator for Study Set Generation
 * 
 * This service orchestrates the Bedrock Agent to generate study sets.
 * The agent uses action groups to call backend API functions for:
 * - Content search
 * - Data storage
 * - Study set generation
 */
class AgentOrchestrator {
  /**
   * Generate study set using Bedrock Agent
   * 
   * The agent will:
   * 1. Search for content about the topic
   * 2. Generate a summary
   * 3. Create flashcards
   * 4. Generate quiz questions
   * 5. Store results via action groups
   */
  async generateStudySet(
    request: StudySetGenerationRequest
  ): Promise<StudySetGenerationResult> {
    const { topic, options = {} } = request
    const {
      includeSummary = true,
      flashcardCount = 10,
      quizQuestionCount = 5,
      timeout = 300000, // 5 minutes
    } = options

    logger.info('Starting agent-based study set generation', {
      topic,
      options,
    })

    try {
      // Validate and sanitize input
      const sanitizedTopic = contentSanitizer.sanitize(topic)
      if (!contentSanitizer.validate(sanitizedTopic)) {
        throw new Error('Topic validation failed')
      }

      // Construct agent prompt
      const agentPrompt = this.buildStudySetPrompt(
        sanitizedTopic,
        includeSummary,
        flashcardCount,
        quizQuestionCount
      )

      // Invoke agent with retry logic
      const agentResponse: AgentResponse = await bedrockAgentService.invokeAgentWithRetry(
        agentPrompt,
        {
          timeout,
          enableTrace: process.env.NODE_ENV !== 'production',
        }
      )

      // Parse agent response
      const result = this.parseAgentResponse(agentResponse, sanitizedTopic)

      logger.info('Agent-based study set generation completed', {
        topic: sanitizedTopic,
        sessionId: agentResponse.sessionId,
        hasSummary: !!result.summary,
        flashcardCount: result.flashcards?.length || 0,
        quizQuestionCount: result.quiz?.questions?.length || 0,
      })

      return result
    } catch (error: any) {
      logger.error('Agent orchestrator error', {
        topic,
        error: error.message,
        stack: error.stack,
      })
      throw error
    }
  }

  /**
   * Build prompt for study set generation
   */
  private buildStudySetPrompt(
    topic: string,
    includeSummary: boolean,
    flashcardCount: number,
    quizQuestionCount: number
  ): string {
    const instructions = [
      `Generate a comprehensive study set for the topic: "${topic}"`,
      '',
      'Use the available action groups to:',
      '1. Search for relevant content about this topic',
      '2. Generate a clear, educational summary',
      `3. Create ${flashcardCount} high-quality flashcards with questions and answers`,
      `4. Generate ${quizQuestionCount} quiz questions (mix of multiple-choice and true/false)`,
      '5. Store the results using the DataStorage action group',
      '',
      'Requirements:',
      '- Summary should be comprehensive and educational',
      '- Flashcards should cover key concepts',
      '- Quiz questions should test understanding',
      '- All content must be accurate and educational',
      '',
      'Return the results in a structured format that can be stored.',
    ]

    if (!includeSummary) {
      instructions.push('- Skip summary generation if not needed')
    }

    return instructions.join('\n')
  }

  /**
   * Parse agent response into structured format
   * 
   * The agent may return structured JSON or natural language.
   * This function attempts to extract the study set components.
   */
  private parseAgentResponse(
    agentResponse: AgentResponse,
    topic: string
  ): StudySetGenerationResult {
    const { completion, sessionId, traceId, inputTokens, outputTokens, stopReason } =
      agentResponse

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(completion)
      if (parsed.summary || parsed.flashcards || parsed.quiz) {
        return {
          ...parsed,
          sessionId,
          traceId,
          metadata: {
            inputTokens,
            outputTokens,
            stopReason,
          },
        }
      }
    } catch (e) {
      // Not JSON, continue with text parsing
    }

    // If agent used action groups, the results might already be stored
    // In that case, we return metadata and indicate success
    // The actual data would be retrieved from storage via action groups

    // For now, attempt to extract structured data from text
    // In production, the agent should be configured to return structured JSON
    const result: StudySetGenerationResult = {
      sessionId,
      traceId,
      metadata: {
        inputTokens,
        outputTokens,
        stopReason,
      },
    }

    // Try to extract summary
    const summaryMatch = completion.match(/summary[:\s]+(.*?)(?:\n\n|flashcards|quiz|$)/is)
    if (summaryMatch) {
      result.summary = contentSanitizer.sanitize(summaryMatch[1].trim())
    }

    // Try to extract flashcards (if in JSON format in text)
    const flashcardMatch = completion.match(/flashcards[:\s]*(\[[\s\S]*?\])/i)
    if (flashcardMatch) {
      try {
        result.flashcards = JSON.parse(flashcardMatch[1])
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Try to extract quiz (if in JSON format in text)
    const quizMatch = completion.match(/quiz[:\s]*(\{[\s\S]*?\})/i)
    if (quizMatch) {
      try {
        result.quiz = JSON.parse(quizMatch[1])
      } catch (e) {
        // Ignore parse errors
      }
    }

    // If no structured data found, return the completion as summary
    if (!result.summary && !result.flashcards && !result.quiz) {
      result.summary = contentSanitizer.sanitize(completion.substring(0, 2000))
    }

    return result
  }

  /**
   * Validate study set generation result
   */
  validateResult(result: StudySetGenerationResult): boolean {
    if (!result.summary && !result.flashcards && !result.quiz) {
      return false
    }

    if (result.summary && !contentSanitizer.validate(result.summary)) {
      return false
    }

    if (result.flashcards) {
      for (const card of result.flashcards) {
        if (!card.question || !card.answer) {
          return false
        }
      }
    }

    if (result.quiz?.questions) {
      for (const question of result.quiz.questions) {
        if (!question.question || question.correctAnswer === undefined) {
          return false
        }
      }
    }

    return true
  }
}

export const agentOrchestrator = new AgentOrchestrator()

