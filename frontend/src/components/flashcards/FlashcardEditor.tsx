import { useState } from 'react'
import { Flashcard as FlashcardType } from '../../types/study'

interface FlashcardEditorProps {
  card: FlashcardType
  onSave: (card: FlashcardType) => void
  onDelete: () => void
}

export default function FlashcardEditor({ card, onSave, onDelete }: FlashcardEditorProps) {
  const [question, setQuestion] = useState(card.question)
  const [answer, setAnswer] = useState(card.answer)

  const handleSave = () => {
    onSave({ ...card, question, answer })
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-3 py-2 border rounded bg-background"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full px-3 py-2 border rounded bg-background"
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Save
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 border rounded hover:bg-destructive/10 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
