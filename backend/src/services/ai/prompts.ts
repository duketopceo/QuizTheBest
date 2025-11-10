/**
 * Prompt templates for different AI tasks
 */

export const PROMPTS = {
  summarize: (content: string, topic: string): string => {
    return `You are an expert educator. Summarize the following content about "${topic}" in a clear, concise, and educational manner.

Content:
${content}

Provide a comprehensive summary that covers the key concepts, main points, and important details. The summary should be suitable for students learning about this topic.

Summary:`
  },

  generateFlashcards: (summary: string, topic: string, count: number = 10): string => {
    return `You are an expert educator. Create ${count} high-quality flashcards about "${topic}" based on the following summary.

Summary:
${summary}

For each flashcard, provide:
1. A clear, concise question
2. A detailed, accurate answer

Format your response as a JSON array with the following structure:
[
  {
    "question": "Question text here",
    "answer": "Answer text here"
  }
]

Return ONLY the JSON array, no additional text.`
  },

  generateQuiz: (summary: string, topic: string, count: number = 5): string => {
    return `You are an expert educator. Create ${count} quiz questions about "${topic}" based on the following summary.

Summary:
${summary}

Create a mix of multiple-choice and true/false questions. For multiple-choice questions, provide 4 options with exactly one correct answer.

Format your response as a JSON array with the following structure:
[
  {
    "type": "multiple-choice",
    "question": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  },
  {
    "type": "true-false",
    "question": "Question text here",
    "correctAnswer": true,
    "explanation": "Brief explanation"
  }
]

Return ONLY the JSON array, no additional text.`
  },

  synopticSummary: (topics: string[], content: string[]): string => {
    return `You are an expert educator. Create a synoptic summary that connects the following topics:

Topics: ${topics.join(', ')}

Content:
${content.join('\n\n---\n\n')}

Provide a comprehensive summary that shows how these topics relate to each other, their connections, and overarching themes.

Synoptic Summary:`
  },
}
