import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import SummaryView from './SummaryView'
import FlashcardDeck from '../flashcards/FlashcardDeck'
import QuizView from '../quiz/QuizView'

interface MaterialsListProps {
  materials: any
  topic: string
}

export default function MaterialsList({ materials, topic }: MaterialsListProps) {
  const { post } = useApi()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await post('/study-sets', {
        topic,
        summary: materials.summary,
        flashcards: materials.flashcards,
        quiz: materials.quiz,
      })
      if (response.success) {
        setSaved(true)
      }
    } catch (error) {
      console.error('Failed to save study set:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generated Materials</h2>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          aria-label={saved ? 'Saved' : 'Save study set'}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Study Set'}
        </button>
      </div>

      {materials.summary && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Summary</h3>
          <SummaryView summary={materials.summary} />
        </div>
      )}

      {materials.flashcards && materials.flashcards.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Flashcards</h3>
          <FlashcardDeck flashcards={materials.flashcards} />
        </div>
      )}

      {materials.quiz && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Quiz</h3>
          <QuizView quiz={materials.quiz} />
        </div>
      )}
    </div>
  )
}
