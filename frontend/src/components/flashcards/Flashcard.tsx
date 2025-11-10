import { Flashcard as FlashcardType } from '../../types/study'

interface FlashcardProps {
  card: FlashcardType
  flipped: boolean
  onFlip: () => void
}

export default function Flashcard({ card, flipped, onFlip }: FlashcardProps) {
  return (
    <div
      className="relative h-64 cursor-pointer perspective-1000"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Flashcard showing answer' : 'Flashcard showing question'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFlip()
        }
      }}
    >
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className="absolute inset-0 backface-hidden border-2 rounded-lg p-6 bg-card flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Question</div>
            <div className="text-lg font-medium">{card.question}</div>
          </div>
        </div>
        <div className="absolute inset-0 backface-hidden border-2 rounded-lg p-6 bg-card flex items-center justify-center rotate-y-180">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Answer</div>
            <div className="text-lg">{card.answer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
