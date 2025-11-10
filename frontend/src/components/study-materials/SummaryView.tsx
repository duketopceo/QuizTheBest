import { useState } from 'react'
import { textToSpeech } from '../../utils/textToSpeech'

interface SummaryViewProps {
  summary: string
}

export default function SummaryView({ summary }: SummaryViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = async () => {
    if (isPlaying) {
      // Stop playback
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      // Start playback
      setIsPlaying(true)
      await textToSpeech(summary)
      setIsPlaying(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold">Summary</h4>
        <button
          onClick={handlePlay}
          className="text-sm px-3 py-1 border rounded hover:bg-accent"
          aria-label={isPlaying ? 'Stop reading' : 'Read summary'}
        >
          {isPlaying ? '⏸ Stop' : '▶ Read'}
        </button>
      </div>
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{summary}</p>
      </div>
    </div>
  )
}
