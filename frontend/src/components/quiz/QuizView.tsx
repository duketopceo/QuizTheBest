import { useState } from 'react'
import QuestionCard from './QuestionCard'
import QuizResults from './QuizResults'
import { Quiz } from '../../types/study'

interface QuizViewProps {
  quiz: Quiz
}

export default function QuizView({ quiz }: QuizViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | number>>({})
  const [isComplete, setIsComplete] = useState(false)

  const handleAnswer = (questionIndex: number, answer: string | number) => {
    setAnswers({ ...answers, [questionIndex]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setIsComplete(true)
  }

  if (isComplete) {
    return <QuizResults quiz={quiz} answers={answers} />
  }

  const question = quiz.questions[currentQuestion]
  const hasAnswer = answers[currentQuestion] !== undefined
  const isLast = currentQuestion === quiz.questions.length - 1

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </div>
      <QuestionCard
        question={question}
        questionIndex={currentQuestion}
        selectedAnswer={answers[currentQuestion]}
        onAnswer={handleAnswer}
      />
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="px-4 py-2 border rounded hover:bg-accent disabled:opacity-50"
          aria-label="Previous question"
        >
          ← Previous
        </button>
        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!hasAnswer}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            aria-label="Submit quiz"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            aria-label="Next question"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
