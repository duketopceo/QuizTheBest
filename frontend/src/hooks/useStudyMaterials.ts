import { useState, useEffect } from 'react'
import { useApi } from './useApi'

export function useStudyMaterials(jobId: string | null) {
  const { get } = useApi()
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await get(`/generate/status/${jobId}`)
        if (response.success) {
          setStatus(response.data.status)
          if (response.data.status === 'completed') {
            setResult(response.data.result)
            clearInterval(pollInterval)
          } else if (response.data.status === 'failed') {
            setError(response.data.error || 'Generation failed')
            clearInterval(pollInterval)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to check status')
        clearInterval(pollInterval)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [jobId, get])

  return { status, result, error }
}
