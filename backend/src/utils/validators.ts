/**
 * Input validation utilities
 */
export function validateTopic(topic: string): { valid: boolean; error?: string } {
  if (!topic || typeof topic !== 'string') {
    return { valid: false, error: 'Topic is required' }
  }

  if (topic.trim().length < 3) {
    return { valid: false, error: 'Topic must be at least 3 characters' }
  }

  if (topic.length > 200) {
    return { valid: false, error: 'Topic must be less than 200 characters' }
  }

  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(topic)) {
      return { valid: false, error: 'Invalid characters in topic' }
    }
  }

  return { valid: true }
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}
