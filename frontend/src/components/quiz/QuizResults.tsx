import { Quiz } from '../../types/study'

interface QuizResultsProps {
  quiz: Quiz
  answers: Record<number, string | number>
}

export default function QuizResults({ quiz, answers }: QuizResultsProps) {
  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index]
      const correctAnswer = question.correctAnswer
      if (userAnswer === correctAnswer) {
        correct++
      }
    })
    return { correct, total: quiz.questions.length, percentage: Math.round((correct / quiz.questions.length) * 100) }
  }

  const { correct, total, percentage } = calculateScore()

  return (
    <div className="space-y-6">
      <div className="text-center border rounded-lg p-8 bg-card">
        <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
        <div className="text-4xl font-bold text-primary mb-2">{percentage}%</div>
        <div className="text-muted-foreground">
          You got {correct} out of {total} questions correct
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Review Your Answers</h3>
        {quiz.questions.map((question, index) => {
          const userAnswer = answers[index]
          const isCorrect = userAnswer === question.correctAnswer
          
          return (
            <div
              key={question.id}
              className={`border rounded-lg p-4 ${
                isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
              }`}
            >
              <div className="font-semibold mb-2">{question.question}</div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Your answer: </span>
                  {question.type === 'multiple-choice' && question.options
                    ? question.options[userAnswer as number] || 'Not answered'
                    : userAnswer === true
                    ? 'True'
                    : userAnswer === false
                    ? 'False'
                    : 'Not answered'}
                </div>
                <div>
                  <span className="font-medium">Correct answer: </span>
                  {question.type === 'multiple-choice' && question.options
                    ? question.options[question.correctAnswer as number]
                    : question.correctAnswer === true
                    ? 'True'
                    : 'False'}
                </div>
                {question.explanation && (
                  <div className="mt-2 text-muted-foreground">
                    <span className="font-medium">Explanation: </span>
                    {question.explanation}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
