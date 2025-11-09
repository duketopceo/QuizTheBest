export interface User {
  id: string
  email: string
  username: string
  createdAt: string
}

export interface UserProgress {
  topicId: string
  studyTime: number
  flashcardReviews: number
  quizScores: number[]
}
