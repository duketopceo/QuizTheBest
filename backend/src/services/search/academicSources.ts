/**
 * List of academic sources to prioritize in scraping
 */
export const ACADEMIC_SOURCES = [
  {
    domain: 'wikipedia.org',
    name: 'Wikipedia',
    priority: 1,
  },
  {
    domain: 'khanacademy.org',
    name: 'Khan Academy',
    priority: 2,
  },
  {
    domain: 'pubmed.ncbi.nlm.nih.gov',
    name: 'PubMed',
    priority: 2,
  },
  {
    domain: 'arxiv.org',
    name: 'arXiv',
    priority: 3,
  },
  {
    domain: '.edu',
    name: 'Educational Institutions',
    priority: 2,
  },
]

export function isAcademicSource(url: string): boolean {
  return ACADEMIC_SOURCES.some(source => url.includes(source.domain))
}

export function getAcademicSourcePriority(url: string): number {
  const source = ACADEMIC_SOURCES.find(s => url.includes(s.domain))
  return source?.priority || 10 // Lower priority for non-academic sources
}
