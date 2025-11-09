import { useState } from 'react'
import Flashcard from './Flashcard'
import { Flashcard as FlashcardType } from '../../types/study'

interface FlashcardDeckProps {
  flashcards: FlashcardType[]
}

export default function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const currentCard = flashcards[currentIndex]
  const hasNext = currentIndex < flashcards.length - 1
  const hasPrev = currentIndex > 0

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  if (flashcards.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No flashcards available</div>
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Card {currentIndex + 1} of {flashcards.length}
      </div>
      <Flashcard
        card={currentCard}
        flipped={flipped}
        onFlip={() => setFlipped(!flipped)}
      />
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className="px-4 py-2 border rounded hover:bg-accent disabled:opacity-50"
          aria-label="Previous card"
        >
          ← Previous
        </button>
        <button
          onClick={() => setFlipped(!flipped)}
          className="px-4 py-2 border rounded hover:bg-accent"
          aria-label={flipped ? 'Show question' : 'Show answer'}
        >
          {flipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className="px-4 py-2 border rounded hover:bg-accent disabled:opacity-50"
          aria-label="Next card"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
