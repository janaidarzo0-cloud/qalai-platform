import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

const seedContent = async (payload: Payload) => {
  const existingSource = await payload.find({
    collection: 'sources',
    limit: 1,
    overrideAccess: true,
    where: { url: { equals: 'https://egov.kz/' } },
  })
  const source =
    existingSource.docs[0] ??
    (await payload.create({
      collection: 'sources',
      data: {
        language: 'kk',
        publisher: 'Қазақстан Республикасының электрондық үкіметі',
        sourceType: 'government',
        title: 'eGov.kz басты беті — демо дереккөз',
        trustTier: 'primary-official',
        url: 'https://egov.kz/',
      },
      overrideAccess: true,
    }))
  console.info('[seed] Source ready.')

  const existingCategory = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'memleket' } },
  })
  const category =
    existingCategory.docs[0] ??
    (await payload.create({
      collection: 'categories',
      data: {
        _status: 'draft',
        description: 'Мемлекеттік қызметтерді түсіндіретін сценарийлер.',
        order: 10,
        slug: 'memleket',
        title: 'Мемлекет',
      },
      draft: true,
      overrideAccess: true,
    }))
  console.info('[seed] Category ready.')

  const existingScenario = await payload.find({
    collection: 'scenarios',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'zheke-kasipkerlik-ashu-demo' } },
  })

  if (!existingScenario.docs[0]) {
    await payload.create({
      collection: 'scenarios',
      data: {
        _status: 'draft',
        category: category.id,
        cost: {
          explanation: 'Ресми дереккөз тексерілгеннен кейін көрсетіледі.',
          kind: 'varies',
        },
        documents: [{ name: 'Тексерілген құжаттар тізімі кейін толтырылады.' }],
        officialLinks: [
          {
            label: 'eGov басты беті (демо)',
            publisher: 'eGov.kz',
            url: 'https://egov.kz/',
          },
        ],
        processingTime: {
          value: 'Ресми мерзім тексерілгеннен кейін көрсетіледі.',
        },
        seo: { noIndex: true, title: 'ЖК қалай ашуға болады? — QALAI демо' },
        shortAnswer:
          'Бұл — UX үлгісі. Нақты нұсқаулық ресми дереккөздер тексерілгеннен кейін ғана жарияланады.',
        slug: 'zheke-kasipkerlik-ashu-demo',
        sourceReferences: [
          {
            checkedAt: new Date().toISOString(),
            claimsSupported:
              'Бұл демо-сілтеме тек ресми доменді көрсетеді; нақты нұсқаулықты растамайды.',
            isPrimary: true,
            source: source.id,
          },
        ],
        steps: [
          {
            description: 'QALAI пайдаланушының жағдайын анықтайды.',
            title: 'Жағдайыңызды анықтаңыз',
          },
        ],
        title: 'ЖК қалай ашуға болады?',
        verification: { riskLevel: 'high', status: 'unverified' },
        whoIsItFor: 'Бұл тек сценарий бетінің құрылымын тексеруге арналған демо.',
      },
      draft: true,
      overrideAccess: true,
    })
  }
  console.info('[seed] Scenario draft ready.')

  payload.logger.info('QALAI demo seed completed. No Scenario was published.')
}

const seed = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The demo seed is disabled in production.')
  }

  const watchdog = setTimeout(() => {
    console.error('[seed] Timed out after 60 seconds.')
    process.exit(1)
  }, 60_000)

  const payload = await getPayload({ config })
  console.info('[seed] Payload connected.')

  try {
    await seedContent(payload)
  } finally {
    clearTimeout(watchdog)
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
