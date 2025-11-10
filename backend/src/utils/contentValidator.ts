/**
 * Content validation and quality scoring
 */
export interface ContentQuality {
  score: number
  issues: string[]
}

export function validateContent(content: string): ContentQuality {
  const issues: string[] = []
  let score = 100

  // Check minimum length
  if (content.length < 100) {
    issues.push('Content too short')
    score -= 30
  }

  // Check for meaningful content (not just whitespace/special chars)
  const meaningfulChars = content.replace(/[^\w\s]/g, '').trim()
  if (meaningfulChars.length < 50) {
    issues.push('Insufficient meaningful content')
    score -= 20
  }

  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  const repetitionRatio = uniqueWords.size / words.length
  if (repetitionRatio < 0.3) {
    issues.push('High repetition detected')
    score -= 15
  }

  // Check for common quality indicators
  if (content.includes('error') || content.includes('404') || content.includes('not found')) {
    issues.push('Error content detected')
    score -= 25
  }

  return {
    score: Math.max(0, score),
    issues,
  }
}
