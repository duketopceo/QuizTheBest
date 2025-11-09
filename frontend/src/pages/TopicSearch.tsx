import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import MaterialsList from '../components/study-materials/MaterialsList'

export default function TopicSearch() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { post, get } = useApi()
  const topic = searchParams.get('topic') || ''
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState<any>(null)
  const [error, setError] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    if (topic) {
      handleGenerate()
    }
  }, [topic])

  const handleGenerate = async () => {
    if (!topic) return

    setLoading(true)
    setError('')
    setMaterials(null)

    try {
      const response = await post('/generate', { topic })
      
      if (response.success) {
        if (response.data.jobId) {
          // Async job started, poll for status
          setJobId(response.data.jobId)
          pollJobStatus(response.data.jobId)
        } else {
          // Synchronous response
          setMaterials(response.data)
          setLoading(false)
        }
      } else {
        setError(response.error?.message || 'Failed to generate materials')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const pollJobStatus = async (id: string) => {
    const maxAttempts = 60 // 5 minutes max (5s intervals)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await get(`/generate/status/${id}`)
        if (response.success) {
          if (response.data.status === 'completed') {
            setMaterials(response.data.result)
            setLoading(false)
            setJobId(null)
          } else if (response.data.status === 'failed') {
            setError(response.data.error || 'Generation failed')
            setLoading(false)
            setJobId(null)
          } else if (attempts < maxAttempts) {
            attempts++
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            setError('Generation timed out. Please try again.')
            setLoading(false)
            setJobId(null)
          }
        }
      } catch (err) {
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 5000)
        } else {
          setError('Failed to check generation status')
          setLoading(false)
          setJobId(null)
        }
      }
    }

    poll()
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
        <h1 className="text-3xl font-bold mb-6">Study Materials: {topic}</h1>
        
        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">Generating study materials...</div>
            {jobId && <div className="text-sm text-muted-foreground mt-2">Job ID: {jobId}</div>}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {materials && <MaterialsList materials={materials} topic={topic} />}
      </main>
    </div>
  )
}
