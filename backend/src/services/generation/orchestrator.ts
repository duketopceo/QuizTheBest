import { searchOrchestrator } from '../search/searchOrchestrator'
import { summarizeContent } from '../ai/summarizer'
import { generateFlashcards } from '../ai/flashcardGenerator'
import { generateQuiz } from '../ai/quizGenerator'
import { logger } from '../../utils/logger'
import { contentSanitizer } from '../../utils/contentSanitizer'

export interface GenerationOptions {
  timeout?: number
}

export interface GeneratedMaterials {
  summary: string
  flashcards: Array<{ id: string; question: string; answer: string }>
  quiz: {
    id: string
    questions: Array<{
      id: string
      type: 'multiple-choice' | 'true-false'
      question: string
      options?: string[]
      correctAnswer: string | number
      explanation?: string
    }>
  }
}

class GenerationOrchestrator {
  async generate(topic: string, options: GenerationOptions = {}): Promise<GeneratedMaterials> {
    const timeout = options.timeout || 300000 // 5 minutes default
    const startTime = Date.now()

    try {
      // Step 1: Search for content
      logger.info(`Starting generation for topic: ${topic}`)
      const searchResults = await searchOrchestrator.search(topic)

      if (searchResults.length === 0) {
        throw new Error('No content found for this topic')
      }

      // Step 2: Combine search results into content
      const content = searchResults
        .map(result => result.content || result.snippet)
        .filter(Boolean)
        .join('\n\n---\n\n')

      // Sanitize content before processing
      const sanitizedContent = contentSanitizer.sanitize(content)

      if (!contentSanitizer.validate(sanitizedContent)) {
        throw new Error('Content validation failed')
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Generation timeout exceeded')
      }

      // Step 3: Generate summary
      logger.info('Generating summary...')
      const summary = await summarizeContent(sanitizedContent, topic)

      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Generation timeout exceeded')
      }

      // Step 4: Generate flashcards
      logger.info('Generating flashcards...')
      const flashcards = await generateFlashcards(summary, topic, 10)

      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Generation timeout exceeded')
      }

      // Step 5: Generate quiz
      logger.info('Generating quiz...')
      const quiz = await generateQuiz(summary, flashcards, 5)

      logger.info(`Generation completed in ${Date.now() - startTime}ms`)

      return {
        summary,
        flashcards,
        quiz,
      }
    } catch (error: any) {
      logger.error('Generation orchestrator error:', error)
      throw error
    }
  }
}

export const generateOrchestrator = new GenerationOrchestrator()
