export async function textToSpeech(text: string): Promise<void> {
  if ('speechSynthesis' in window) {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)

      window.speechSynthesis.speak(utterance)
    })
  } else {
    throw new Error('Text-to-speech is not supported in this browser')
  }
}
