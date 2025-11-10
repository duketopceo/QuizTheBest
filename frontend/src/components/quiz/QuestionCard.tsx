import { QuizQuestion } from '../../types/study'

interface QuestionCardProps {
  question: QuizQuestion
  questionIndex: number
  selectedAnswer?: string | number
  onAnswer: (questionIndex: number, answer: string | number) => void
}

export default function QuestionCard({
  question,
  questionIndex,
  selectedAnswer,
  onAnswer,
}: QuestionCardProps) {
  const handleAnswer = (answer: string | number) => {
    onAnswer(questionIndex, answer)
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
      
      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full text-left px-4 py-3 border rounded hover:bg-accent ${
                selectedAnswer === index ? 'border-primary bg-primary/10' : ''
              }`}
              aria-label={`Select option ${index + 1}: ${option}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === 'true-false' && (
        <div className="space-y-2">
          <button
            onClick={() => handleAnswer(true)}
            className={`w-full text-left px-4 py-3 border rounded hover:bg-accent ${
              selectedAnswer === true ? 'border-primary bg-primary/10' : ''
            }`}
            aria-label="Select True"
          >
            True
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className={`w-full text-left px-4 py-3 border rounded hover:bg-accent ${
              selectedAnswer === false ? 'border-primary bg-primary/10' : ''
            }`}
            aria-label="Select False"
          >
            False
          </button>
        </div>
      )}
    </div>
  )
}
