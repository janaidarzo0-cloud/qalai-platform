import type { Payload } from 'payload'

import { retiredAlphaScenarioSlugs } from '@/content/alpha-scenarios'

export const assertRetiredAlphaScenariosAreSafe = async (payload: Payload) => {
  for (const retiredSlug of retiredAlphaScenarioSlugs) {
    const published = await payload.find({
      collection: 'scenarios',
      draft: false,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ slug: { equals: retiredSlug } }, { _status: { equals: 'published' } }],
      },
    })

    if (published.docs[0]) {
      throw new Error(
        `[alpha-seed] Refusing to continue: retired Scenario ${retiredSlug} is published. Unpublish it through the reviewed editorial workflow before importing its replacements.`,
      )
    }

    const retired = await payload.find({
      collection: 'scenarios',
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: retiredSlug } },
    })

    if (retired.docs[0]) {
      payload.logger.warn(
        `[alpha-seed] Retired draft ${retiredSlug} was preserved. Keep it unpublished and remove it only after confirming both replacement drafts exist.`,
      )
    }
  }
}
