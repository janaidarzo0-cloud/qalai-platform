import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AnalyticsLink } from '@/components/AnalyticsLink'
import { Feedback } from '@/components/Feedback'
import { JsonLd } from '@/components/JsonLd'
import { RelatedCalculatorLinks } from '@/components/RelatedCalculatorLinks'
import { TaskOpenedTracker } from '@/components/TaskOpenedTracker'
import { getScenarioBySlug } from '@/lib/cms/scenarios'
import { isScenarioTrusted } from '@/lib/cms/trust'
import { isPublicLaunchTask } from '@/lib/launch/cohort'
import { absoluteURL, isIndexingAllowed } from '@/lib/site'

type PageProps = { params: Promise<{ slug: string }> }

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('kk-KZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { slug } = await params
  const scenario = await getScenarioBySlug(slug)
  if (!scenario) return {}
  const mayIndex =
    isIndexingAllowed() &&
    scenario.status === 'published' &&
    !scenario.seo.noIndex &&
    isPublicLaunchTask({ key: scenario.slug, type: 'scenario' })

  return {
    alternates: { canonical: `/scenario/${scenario.slug}` },
    description: scenario.seo.description ?? scenario.shortAnswer,
    openGraph: {
      description: scenario.seo.description ?? scenario.shortAnswer,
      locale: 'kk_KZ',
      title: scenario.seo.title ?? scenario.title,
      type: 'article',
      url: absoluteURL(`/scenario/${scenario.slug}`),
    },
    robots: {
      follow: mayIndex,
      index: mayIndex,
    },
    title: scenario.seo.title ?? scenario.title,
  }
}

const ScenarioPage = async ({ params }: PageProps) => {
  const { slug } = await params
  const scenario = await getScenarioBySlug(slug)
  if (!scenario) notFound()

  const isVerified = isScenarioTrusted(scenario)
  const isSourcedAlpha =
    !isVerified && scenario.verification.status === 'in-review' && scenario.sources.length > 0
  const costDate = scenario.costAsOf ?? scenario.factsCheckedAt

  const howToSchema = isVerified
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: scenario.title,
        step: scenario.steps.map((step, index) => ({
          '@type': 'HowToStep',
          name: step.title,
          position: index + 1,
          text: step.description,
        })),
      }
    : null

  return (
    <article className="scenario-page">
      <TaskOpenedTracker
        eligible={isVerified && scenario.status === 'published'}
        task={{ key: scenario.slug, type: 'scenario' }}
      />
      {howToSchema ? <JsonLd data={howToSchema} /> : null}
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навигация тізбегі">
          <Link href="/">Басты бет</Link>
          <span>/</span>
          <span>{scenario.category}</span>
        </nav>

        {!isVerified ? (
          <div className="draft-banner" role="status">
            {isSourcedAlpha
              ? 'ЖАБЫҚ АЛЬФА · Ресми дереккөздер жиналды, бірақ тәуелсіз редактор әлі растаған жоқ.'
              : 'ДЕМО · Бұл мазмұн тек UX құрылымын көрсетеді және нақты нұсқаулық ретінде қолданылмайды.'}
          </div>
        ) : null}

        <header className="scenario-hero">
          <div>
            <p className="eyebrow">{scenario.category}</p>
            <h1>{scenario.title}</h1>
            <p className="scenario-hero__answer">{scenario.shortAnswer}</p>
          </div>
          <div className={`verification-card ${isVerified ? 'verification-card--verified' : ''}`}>
            <span>{isVerified ? '✓' : '!'}</span>
            <div>
              <strong>
                {isVerified
                  ? 'Qalai тексерді'
                  : isSourcedAlpha
                    ? 'Редактор тексеруде'
                    : 'Тексерілмеген демо'}
              </strong>
              <p>
                {isVerified && scenario.verification.reviewedAt
                  ? `Соңғы тексеру: ${new Intl.DateTimeFormat('kk-KZ').format(new Date(scenario.verification.reviewedAt))}`
                  : 'Ресми дереккөз расталмайынша жарияланбайды.'}
              </p>
            </div>
          </div>
        </header>

        <div className="facts-grid">
          <div>
            <span>Кімге арналған?</span>
            <strong>{scenario.whoIsItFor}</strong>
          </div>
          <div>
            <span>Қанша тұрады?</span>
            <strong>{scenario.cost}</strong>
            {costDate ? <small>{formatDate(costDate)} жағдай бойынша</small> : null}
          </div>
          <div>
            <span>Қанша уақыт?</span>
            <strong>{scenario.processingTime}</strong>
            {scenario.processingTimeExplanation ? (
              <small>{scenario.processingTimeExplanation}</small>
            ) : null}
            {scenario.factsCheckedAt ? (
              <small>Дерек тексерілген: {formatDate(scenario.factsCheckedAt)}</small>
            ) : null}
          </div>
        </div>

        <div className="scenario-layout">
          <div className="scenario-main">
            {scenario.eligibility.length > 0 ? (
              <section className="content-section">
                <p className="eyebrow">Шарттарды тексеріңіз</p>
                <h2>Маған тиесілі ме?</h2>
                <ul className="eligibility-list">
                  {scenario.eligibility.map((item, index) => (
                    <li key={`${item.condition}-${index}`}>
                      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <strong>{item.condition}</strong>
                        {item.explanation ? <p>{item.explanation}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {scenario.requirements.length > 0 ? (
              <section className="content-section">
                <p className="eyebrow">Алдын ала тексеріңіз</p>
                <h2>Не қажет?</h2>
                <ul className="requirements-list">
                  {scenario.requirements.map((requirement, index) => (
                    <li key={`${requirement}-${index}`}>{requirement}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="content-section">
              <p className="eyebrow">Әрекет жоспары</p>
              <h2>Не істеу керек?</h2>
              <ol className="steps-list">
                {scenario.steps.map((step, index) => (
                  <li key={`${step.title}-${index}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                      {step.actionUrl && step.actionLabel ? (
                        <a href={step.actionUrl}>{step.actionLabel} →</a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="content-section">
              <p className="eyebrow">Дайындаңыз</p>
              <h2>Қандай құжат керек?</h2>
              <ul className="check-list">
                {scenario.documents.map((document, index) => (
                  <li key={`${document.name}-${index}`}>
                    <span aria-hidden="true">✓</span>
                    <div>
                      <strong>{document.name}</strong>
                      {document.optional ? <small>Жағдайға байланысты</small> : null}
                      {document.note ? <p>{document.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {scenario.faq.length > 0 ? (
              <section className="content-section">
                <p className="eyebrow">Жиі қойылатын сұрақтар</p>
                <h2>Тағы не білу керек?</h2>
                <div className="faq-list">
                  {scenario.faq.map((item) => (
                    <details key={item.question}>
                      <summary>{item.question}</summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="scenario-aside">
            <RelatedCalculatorLinks
              publicOnly={isIndexingAllowed()}
              source={{ key: scenario.slug, type: 'scenario' }}
              variant="aside"
            />
            <div className="aside-card">
              <p className="eyebrow">Келесі қадам</p>
              <h2>Ресми қызметте жалғастыру</h2>
              {scenario.officialLinks.length > 0 ? (
                scenario.officialLinks.map((link) => (
                  <AnalyticsLink
                    className="button button--wide"
                    href={link.url}
                    key={link.url}
                    rel="noreferrer"
                    taskKey={scenario.slug}
                    target="_blank"
                  >
                    {link.label} ↗
                  </AnalyticsLink>
                ))
              ) : (
                <p>Демо-нұсқада әрекет сілтемесі әдейі өшірілген.</p>
              )}
            </div>
            <div className="aside-card aside-card--sources">
              <p className="eyebrow">Ресми дереккөздер</p>
              {scenario.sources.length > 0 ? (
                <ul>
                  {scenario.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} rel="noreferrer" target="_blank">
                        {source.title}
                      </a>
                      <span>{source.publisher}</span>
                      {source.checkedAt ? (
                        <small>Тексерілген күні: {formatDate(source.checkedAt)}</small>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Жариялау алдында бұл жерде кемінде бір бастапқы ресми дереккөз болуы керек.</p>
              )}
            </div>
          </aside>
        </div>

        <Feedback
          eligible={isVerified && scenario.status === 'published'}
          taskKey={scenario.slug}
        />
      </div>
    </article>
  )
}

export default ScenarioPage
