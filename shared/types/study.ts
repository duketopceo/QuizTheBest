// Shared study types
export interface Flashcard {
  id: string
  question: string
  answer: string
}

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

export interface StudySet {
  id: string
  topic: string
  summary: string
  flashcards: Flashcard[]
  quiz: Quiz
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: string
  name: string
  studySetId?: string
  createdAt: string
}
