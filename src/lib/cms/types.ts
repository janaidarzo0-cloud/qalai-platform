export type ScenarioViewModel = {
  calculatorRuleSetCurrent: boolean
  category: string
  cost: string
  costAsOf?: string
  documents: Array<{ name: string; note?: string; optional: boolean }>
  eligibility: Array<{ condition: string; explanation?: string }>
  faq: Array<{ answer: string; question: string }>
  officialLinks: Array<{ label: string; publisher: string; url: string }>
  processingTime: string
  processingTimeExplanation?: string
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
    isPrimary: boolean
    publisher: string
    registryID?: number | string
    registryUpdatedAt?: string
    title: string
    trustTier: 'official-provider' | 'primary-official' | 'secondary'
    url: string
    validFrom?: string
    validUntil?: string
  }>
  status: 'draft' | 'published'
  steps: Array<{ actionLabel?: string; actionUrl?: string; description: string; title: string }>
  title: string
  verification: {
    nextReviewAt?: string
    reviewedAt?: string
    reviewerConfirmed: boolean
    status: 'unverified' | 'in-review' | 'verified' | 'stale'
  }
  whoIsItFor: string
}
