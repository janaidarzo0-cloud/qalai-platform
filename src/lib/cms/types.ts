export type ScenarioViewModel = {
  category: string
  cost: string
  documents: Array<{ name: string; note?: string }>
  faq: Array<{ answer: string; question: string }>
  officialLinks: Array<{ label: string; publisher: string; url: string }>
  processingTime: string
  requirements: string[]
  seo: {
    description?: string
    noIndex: boolean
    title?: string
  }
  shortAnswer: string
  slug: string
  sources: Array<{
    checkedAt?: string
    publisher: string
    title: string
    url: string
  }>
  status: 'draft' | 'published'
  steps: Array<{ actionLabel?: string; actionUrl?: string; description: string; title: string }>
  title: string
  verification: {
    nextReviewAt?: string
    reviewedAt?: string
    status: 'unverified' | 'in-review' | 'verified' | 'stale'
  }
  whoIsItFor: string
}
