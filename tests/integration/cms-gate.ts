import assert from 'node:assert/strict'

import config from '@payload-config'
import { getPayload } from 'payload'

import { GET as readiness } from '@/app/api/health/route'
import { listPublishedScenarios } from '@/lib/cms/scenarios'
import { migrations } from '@/migrations'

if (process.env.QALAI_RUN_CMS_INTEGRATION !== 'true') {
  throw new Error('Set QALAI_RUN_CMS_INTEGRATION=true to run the destructive CMS integration gate.')
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('The CMS integration gate must never run against a production environment.')
}

if (process.env.QALAI_CONTENT_MODE !== 'cms') {
  throw new Error('QALAI_CONTENT_MODE=cms is required for the CMS integration gate.')
}

const run = async () => {
  const payload = await getPayload({ config })
  const runID = `${process.env.GITHUB_RUN_ID ?? 'local'}-${Date.now()}`
  const watchdog = setTimeout(() => {
    console.error('[cms-gate] Timed out after 60 seconds.')
    process.exit(1)
  }, 60_000)

  try {
    const migrationRecords = await payload.find({
      collection: 'payload-migrations',
      limit: 100,
      overrideAccess: true,
      sort: 'name',
    })
    const committedMigrationNames = migrations.map((migration) => migration.name).sort()
    const appliedMigrations = migrationRecords.docs.filter(
      (migration): migration is typeof migration & { batch: number; name: string } =>
        typeof migration.name === 'string' &&
        typeof migration.batch === 'number' &&
        migration.batch !== -1,
    )
    assert.deepEqual(
      appliedMigrations.map((migration) => migration.name).sort(),
      committedMigrationNames,
    )

    const [demoSources, demoCategories, demoScenarios, publishedDemoScenarios] = await Promise.all([
      payload.find({
        collection: 'sources',
        limit: 10,
        overrideAccess: true,
        where: { url: { equals: 'https://egov.kz/' } },
      }),
      payload.find({
        collection: 'categories',
        draft: true,
        limit: 10,
        overrideAccess: true,
        where: { slug: { equals: 'memleket' } },
      }),
      payload.find({
        collection: 'scenarios',
        draft: true,
        limit: 10,
        overrideAccess: true,
        where: { slug: { equals: 'zheke-kasipkerlik-ashu-demo' } },
      }),
      payload.find({
        collection: 'scenarios',
        draft: false,
        limit: 10,
        overrideAccess: true,
        where: {
          and: [
            { slug: { equals: 'zheke-kasipkerlik-ashu-demo' } },
            { _status: { equals: 'published' } },
          ],
        },
      }),
    ])
    assert.equal(demoSources.totalDocs, 1)
    assert.equal(demoCategories.totalDocs, 1)
    assert.equal(demoScenarios.totalDocs, 1)
    assert.equal(demoScenarios.docs[0]?._status, 'draft')
    assert.equal(publishedDemoScenarios.totalDocs, 0)
    console.info('[cms-gate] Migrations and idempotent seed verified.')

    const existingAdmins = await payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
      where: { email: { equals: 'cms-gate@qalai.test' } },
    })
    const admin =
      existingAdmins.docs[0] ??
      (await payload.create({
        collection: 'users',
        data: {
          email: 'cms-gate@qalai.test',
          name: 'CMS Gate',
          password: 'Qalai-ci-only-password-2026',
          roles: ['editor'],
        },
        overrideAccess: true,
      }))
    assert.deepEqual(admin.roles, ['admin'])
    console.info('[cms-gate] First administrator verified.')

    const scratchSource = await payload.create({
      collection: 'sources',
      data: {
        language: 'kk',
        publisher: 'QALAI CI',
        sourceType: 'reference',
        title: `Scratch Source ${runID}`,
        trustTier: 'secondary',
        url: `https://example.com/qalai-ci/${runID}/scratch`,
      },
      overrideAccess: false,
      user: admin,
    })
    const updatedScratchSource = await payload.update({
      collection: 'sources',
      data: { title: `Updated Scratch Source ${runID}` },
      id: scratchSource.id,
      overrideAccess: false,
      user: admin,
    })
    assert.equal(updatedScratchSource.title, `Updated Scratch Source ${runID}`)
    await payload.delete({
      collection: 'sources',
      id: scratchSource.id,
      overrideAccess: false,
      user: admin,
    })
    console.info('[cms-gate] Source CRUD verified.')

    const scratchCategory = await payload.create({
      collection: 'categories',
      data: {
        _status: 'draft',
        order: 999,
        slug: `scratch-${runID}`,
        title: `Scratch ${runID}`,
      },
      draft: true,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    await payload.update({
      collection: 'categories',
      data: { description: 'Updated in the CMS integration gate.' },
      draft: true,
      id: scratchCategory.id,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    await payload.delete({
      collection: 'categories',
      id: scratchCategory.id,
      overrideAccess: false,
      user: admin,
    })
    console.info('[cms-gate] Category CRUD verified.')

    const categoryDraft = await payload.create({
      collection: 'categories',
      data: {
        _status: 'draft',
        order: 10,
        slug: `cms-gate-${runID}`,
        title: `CMS Gate ${runID}`,
      },
      draft: true,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    const anonymousDraftCategories = await payload.find({
      collection: 'categories',
      draft: true,
      locale: 'kk',
      overrideAccess: false,
      where: { id: { equals: categoryDraft.id } },
    })
    assert.equal(anonymousDraftCategories.totalDocs, 0)

    const category = await payload.update({
      collection: 'categories',
      data: { _status: 'published' },
      draft: false,
      id: categoryDraft.id,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    assert.equal(category._status, 'published')
    const anonymousPublishedCategories = await payload.find({
      collection: 'categories',
      locale: 'kk',
      overrideAccess: false,
      where: { id: { equals: category.id } },
    })
    assert.equal(anonymousPublishedCategories.totalDocs, 1)
    console.info('[cms-gate] Category draft isolation and publication verified.')

    const officialSource = await payload.create({
      collection: 'sources',
      data: {
        language: 'kk',
        publisher: 'QALAI CI official fixture',
        sourceType: 'government',
        title: `Official Source ${runID}`,
        trustTier: 'primary-official',
        url: `https://example.gov.kz/qalai-ci/${runID}`,
      },
      overrideAccess: false,
      user: admin,
    })
    const checkedAt = new Date().toISOString()
    assert.ok(new Date(officialSource.updatedAt).getTime() <= new Date(checkedAt).getTime())
    console.info('[cms-gate] Official source fixture created.')

    const scenarioData = {
      category: category.id,
      cost: { explanation: 'Тегін.', kind: 'free' as const },
      officialLinks: [
        {
          label: 'Ресми қызметке өту',
          publisher: 'QALAI CI official fixture',
          url: `https://example.gov.kz/qalai-ci/${runID}/action`,
        },
      ],
      seo: { noIndex: true },
      shortAnswer: 'Бұл тек CMS интеграциялық тексеру материалы.',
      sourceReferences: [
        {
          checkedAt,
          claimsSupported: 'Интеграциялық тексеру тұжырымын растайды.',
          isPrimary: true,
          source: officialSource.id,
          validUntil: new Date(Date.now() + 86_400_000).toISOString(),
        },
      ],
      steps: [
        {
          description: 'Интеграциялық тексеруді орындаңыз.',
          title: 'Тексеру қадамы',
        },
      ],
      title: `CMS Gate Scenario ${runID}`,
      verification: { riskLevel: 'high' as const, status: 'in-review' as const },
      whoIsItFor: 'QALAI CI жүйесіне арналған.',
    }
    const scenarioDraft = await payload.create({
      collection: 'scenarios',
      data: {
        ...scenarioData,
        _status: 'draft',
        slug: `cms-gate-scenario-${runID}`,
      },
      draft: true,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    console.info('[cms-gate] Scenario draft created.')

    let anonymousScenarioCount = 0
    try {
      const anonymousScenarios = await payload.find({
        collection: 'scenarios',
        draft: true,
        locale: 'kk',
        overrideAccess: false,
        where: { id: { equals: scenarioDraft.id } },
      })
      anonymousScenarioCount = anonymousScenarios.totalDocs
    } catch (error) {
      assert.equal((error as { status?: number }).status, 403)
    }
    assert.equal(anonymousScenarioCount, 0)
    console.info('[cms-gate] Scenario draft isolation verified.')

    const verifiedDraft = await payload.update({
      collection: 'scenarios',
      data: {
        verification: {
          nextReviewAt: new Date(Date.now() + 86_400_000).toISOString(),
          riskLevel: 'high',
          status: 'verified',
        },
      },
      draft: true,
      id: scenarioDraft.id,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    assert.equal(verifiedDraft.verification.status, 'verified')
    const reviewedBy = verifiedDraft.verification.reviewedBy
    assert.ok(reviewedBy)
    assert.equal(typeof reviewedBy === 'object' ? reviewedBy.id : reviewedBy, admin.id)
    console.info('[cms-gate] Scenario verification transition verified.')

    const publishedScenario = await payload.update({
      collection: 'scenarios',
      data: { _status: 'published' },
      draft: false,
      id: scenarioDraft.id,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    assert.equal(publishedScenario._status, 'published')
    assert.equal(publishedScenario.publishedSlug, publishedScenario.slug)
    console.info('[cms-gate] Scenario publication verified.')

    const authenticatedPublished = await payload.find({
      collection: 'scenarios',
      locale: 'kk',
      overrideAccess: false,
      user: admin,
      where: { id: { equals: publishedScenario.id } },
    })
    assert.equal(authenticatedPublished.totalDocs, 1)

    const publicScenarios = await listPublishedScenarios()
    assert.ok(publicScenarios.some((scenario) => scenario.slug === publishedScenario.slug))
    console.info('[cms-gate] Server-only public Scenario read verified.')

    const disposableDraft = await payload.create({
      collection: 'scenarios',
      data: {
        ...scenarioData,
        _status: 'draft',
        slug: `cms-gate-disposable-${runID}`,
        verification: { riskLevel: 'high', status: 'unverified' },
      },
      draft: true,
      locale: 'kk',
      overrideAccess: false,
      user: admin,
    })
    await payload.delete({
      collection: 'scenarios',
      id: disposableDraft.id,
      overrideAccess: false,
      user: admin,
    })
    console.info('[cms-gate] Scenario delete verified.')

    const readinessResponse = await readiness()
    assert.equal(readinessResponse.status, 200)
    assert.deepEqual(await readinessResponse.json(), {
      service: 'qalai-platform',
      status: 'ok',
    })
    console.info('[cms-gate] Database readiness verified.')

    payload.logger.info('QALAI CMS integration gate passed.')
  } finally {
    clearTimeout(watchdog)
  }
}

run()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
