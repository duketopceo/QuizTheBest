import { bedrockService } from './bedrock'
import { PROMPTS } from './prompts'
import { contentSanitizer } from '../../utils/contentSanitizer'
import { logger } from '../../utils/logger'

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}

export interface Quiz {
  id: string
  questions: QuizQuestion[]
  title: string
}

/**
 * Generate quiz from summary and flashcards using AWS Bedrock
 */
export async function generateQuiz(
  summary: string,
  flashcards: Array<{ question: string; answer: string }>,
  count: number = 5
): Promise<Quiz> {
  try {
    const prompt = PROMPTS.generateQuiz(summary, 'Topic', count)
    const response = await bedrockService.invoke(prompt, {
      maxTokens: 2000,
      temperature: 0.8,
    })

    // Parse JSON response
    let questions: Array<{
      type: string
      question: string
      options?: string[]
      correctAnswer: any
      explanation?: string
    }>

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(response)
      }
    } catch (parseError) {
      logger.error('Failed to parse quiz JSON:', parseError)
      throw new Error('Invalid quiz format generated')
    }

    // Validate and sanitize questions
    const validatedQuestions: QuizQuestion[] = questions
      .slice(0, count)
      .map((q, index) => {
        const question = contentSanitizer.sanitize(q.question || '')
        
        if (!question || question.length < 10) {
          return null
        }

        if (q.type === 'multiple-choice') {
          if (!q.options || q.options.length !== 4) {
            return null
          }

          const options = q.options.map(opt => contentSanitizer.sanitize(opt))
          const correctAnswer = typeof q.correctAnswer === 'number' 
            ? q.correctAnswer 
            : parseInt(q.correctAnswer, 10)

          if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= 4) {
            return null
          }

          return {
            id: `q-${Date.now()}-${index}`,
            type: 'multiple-choice',
            question,
            options,
            correctAnswer,
            explanation: q.explanation ? contentSanitizer.sanitize(q.explanation) : undefined,
          }
        } else if (q.type === 'true-false') {
          const correctAnswer = q.correctAnswer === true || q.correctAnswer === 'true'

          return {
            id: `q-${Date.now()}-${index}`,
            type: 'true-false',
            question,
            correctAnswer,
            explanation: q.explanation ? contentSanitizer.sanitize(q.explanation) : undefined,
          }
        }

        return null
      })
      .filter((q): q is QuizQuestion => q !== null)

    if (validatedQuestions.length === 0) {
      throw new Error('No valid quiz questions generated')
    }

    return {
      id: `quiz-${Date.now()}`,
      questions: validatedQuestions,
      title: 'Generated Quiz',
    }
  } catch (error: any) {
    logger.error('Quiz generation error:', error)
    throw new Error(`Failed to generate quiz: ${error.message}`)
  }
}
