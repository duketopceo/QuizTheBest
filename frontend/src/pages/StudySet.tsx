import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import FlashcardDeck from '../components/flashcards/FlashcardDeck'
import QuizView from '../components/quiz/QuizView'
import SummaryView from '../components/study-materials/SummaryView'

export default function StudySet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { get } = useApi()
  const [studySet, setStudySet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary')

  useEffect(() => {
    if (id) {
      loadStudySet()
    }
  }, [id])

  const loadStudySet = async () => {
    try {
      const response = await get(`/study-sets/${id}`)
      if (response.success) {
        setStudySet(response.data)
      }
    } catch (error) {
      console.error('Failed to load study set:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading study set...</div>
      </div>
    )
  }

  if (!studySet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Study set not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground"
            aria-label="Back to dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{studySet.topic}</h1>
        
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 ${activeTab === 'summary' ? 'border-b-2 border-primary' : ''}`}
            aria-label="View summary"
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 ${activeTab === 'flashcards' ? 'border-b-2 border-primary' : ''}`}
            aria-label="View flashcards"
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 ${activeTab === 'quiz' ? 'border-b-2 border-primary' : ''}`}
            aria-label="Take quiz"
          >
            Quiz
          </button>
        </div>

        {activeTab === 'summary' && studySet.summary && (
          <SummaryView summary={studySet.summary} />
        )}
        {activeTab === 'flashcards' && studySet.flashcards && (
          <FlashcardDeck flashcards={studySet.flashcards} />
        )}
        {activeTab === 'quiz' && studySet.quiz && (
          <QuizView quiz={studySet.quiz} />
        )}
      </main>
    </div>
  )
}
