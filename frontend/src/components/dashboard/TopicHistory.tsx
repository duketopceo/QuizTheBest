import { useNavigate } from 'react-router-dom'

interface TopicHistoryProps {
  topics: any[]
  loading: boolean
}

export default function TopicHistory({ topics, loading }: TopicHistoryProps) {
  const navigate = useNavigate()

  if (loading) {
    return <div className="text-center py-8">Loading topics...</div>
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No topics yet. Start by searching for a topic!
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Topics</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
            onClick={() => topic.studySetId && navigate(`/study-set/${topic.studySetId}`)}
            role="button"
            tabIndex={0}
            aria-label={`View study set for ${topic.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (topic.studySetId) {
                  navigate(`/study-set/${topic.studySetId}`)
                }
              }
            }}
          >
            <h3 className="font-semibold">{topic.name}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(topic.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
