import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import TopicHistory from '../components/dashboard/TopicHistory'
import SearchBar from '../components/dashboard/SearchBar'
import ProgressOverview from '../components/dashboard/ProgressOverview'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { get } = useApi()
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      const response = await get('/user/saved-topics')
      if (response.success) {
        setTopics(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quiz The Best</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <SearchBar onSearch={(topic) => navigate(`/search?topic=${encodeURIComponent(topic)}`)} />
        <ProgressOverview />
        <TopicHistory topics={topics} loading={loading} />
      </main>
    </div>
  )
}
