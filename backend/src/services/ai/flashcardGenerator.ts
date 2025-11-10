import { bedrockService } from './bedrock'
import { PROMPTS } from './prompts'
import { contentSanitizer } from '../../utils/contentSanitizer'
import { logger } from '../../utils/logger'

export interface Flashcard {
  id: string
  question: string
  answer: string
}

/**
 * Generate flashcards from summary using AWS Bedrock
 */
export async function generateFlashcards(
  summary: string,
  topic: string,
  count: number = 10
): Promise<Flashcard[]> {
  try {
    const prompt = PROMPTS.generateFlashcards(summary, topic, count)
    const response = await bedrockService.invoke(prompt, {
      maxTokens: 2000,
      temperature: 0.8,
    })

    // Parse JSON response
    let flashcards: Array<{ question: string; answer: string }>
    
    try {
      // Extract JSON from response (might have extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0])
      } else {
        flashcards = JSON.parse(response)
      }
    } catch (parseError) {
      logger.error('Failed to parse flashcards JSON:', parseError)
      // Fallback: try to extract Q&A pairs from text
      flashcards = extractFlashcardsFromText(response)
    }

    // Validate and sanitize flashcards
    const validatedFlashcards: Flashcard[] = flashcards
      .slice(0, count)
      .map((card, index) => {
        const question = contentSanitizer.sanitize(card.question || '')
        const answer = contentSanitizer.sanitize(card.answer || '')

        if (!question || !answer || question.length < 10 || answer.length < 10) {
          return null
        }

        return {
          id: `fc-${Date.now()}-${index}`,
          question,
          answer,
        }
      })
      .filter((card): card is Flashcard => card !== null)

    if (validatedFlashcards.length === 0) {
      throw new Error('No valid flashcards generated')
    }

    return validatedFlashcards
  } catch (error: any) {
    logger.error('Flashcard generation error:', error)
    throw new Error(`Failed to generate flashcards: ${error.message}`)
  }
}

/**
 * Fallback: Extract flashcards from text if JSON parsing fails
 */
function extractFlashcardsFromText(text: string): Array<{ question: string; answer: string }> {
  const flashcards: Array<{ question: string; answer: string }> = []
  const lines = text.split('\n').filter(line => line.trim())

  let currentQuestion = ''
  let currentAnswer = ''

  for (const line of lines) {
    if (line.match(/^Q\d*[:.]|^Question\d*[:.]/i)) {
      if (currentQuestion && currentAnswer) {
        flashcards.push({ question: currentQuestion, answer: currentAnswer })
      }
      currentQuestion = line.replace(/^Q\d*[:.]|^Question\d*[:.]/i, '').trim()
      currentAnswer = ''
    } else if (line.match(/^A\d*[:.]|^Answer\d*[:.]/i)) {
      currentAnswer = line.replace(/^A\d*[:.]|^Answer\d*[:.]/i, '').trim()
    } else if (currentQuestion && !currentAnswer) {
      currentQuestion += ' ' + line.trim()
    } else if (currentAnswer) {
      currentAnswer += ' ' + line.trim()
    }
  }

  if (currentQuestion && currentAnswer) {
    flashcards.push({ question: currentQuestion, answer: currentAnswer })
  }

  return flashcards
}
