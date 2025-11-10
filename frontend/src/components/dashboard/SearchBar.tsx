import { useState } from 'react'

interface SearchBarProps {
  onSearch: (topic: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      onSearch(topic.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic to learn about..."
          className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
          aria-label="Search topic"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          aria-label="Search"
        >
          Search
        </button>
      </div>
    </form>
  )
}
