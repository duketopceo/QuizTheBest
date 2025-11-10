import { createObjectCsvStringifier } from 'csv-writer'
import { StudySet } from '../firestore/studySets'

/**
 * Export flashcards to CSV
 */
export function exportToCSV(flashcards: Array<{ question: string; answer: string }>): string {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'question', title: 'Question' },
      { id: 'answer', title: 'Answer' },
    ],
  })

  const header = csvStringifier.getHeaderString()
  const records = csvStringifier.stringifyRecords(flashcards)

  return header + records
}

/**
 * Export study set to JSON
 */
export function exportToJSON(studySet: StudySet): string {
  return JSON.stringify(studySet, null, 2)
}
