export default function ProgressOverview() {
  // Placeholder for progress overview
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Study Progress</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Topics Studied</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Flashcards Reviewed</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">0%</div>
          <div className="text-sm text-muted-foreground">Average Quiz Score</div>
        </div>
      </div>
    </div>
  )
}
