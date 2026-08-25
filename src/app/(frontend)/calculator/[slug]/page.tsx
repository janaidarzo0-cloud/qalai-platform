import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AutoLoanCalculator } from '@/components/AutoLoanCalculator'
import { absoluteURL } from '@/lib/site'
import { calculatorDefinitions, getCalculatorBySlug } from '@/modules/calculators/registry'

type PageProps = { params: Promise<{ slug: string }> }

export const generateStaticParams = () => calculatorDefinitions.map(({ slug }) => ({ slug }))

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { slug } = await params
  const calculator = getCalculatorBySlug(slug)
  if (!calculator) return {}

  const isAvailable = calculator.status === 'available'

  return {
    alternates: { canonical: `/calculator/${calculator.slug}` },
    description: calculator.summary,
    openGraph: {
      description: calculator.summary,
      locale: 'kk_KZ',
      title: calculator.title,
      type: 'website',
      url: absoluteURL(`/calculator/${calculator.slug}`),
    },
    robots: { follow: isAvailable, index: isAvailable },
    title: calculator.title,
  }
}

const CalculatorPage = async ({ params }: PageProps) => {
  const { slug } = await params
  const calculator = getCalculatorBySlug(slug)
  if (!calculator) notFound()

  return (
    <div className="calculator-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Навигация тізбегі">
          <Link href="/">Басты бет</Link>
          <span>/</span>
          <span>Калькуляторлар</span>
        </nav>
        <header className="calculator-page__header">
          <p className="eyebrow">30 секундта есептеңіз</p>
          <h1>{calculator.title}</h1>
          <p>{calculator.summary}</p>
        </header>

        {calculator.key === 'auto-loan' ? (
          <>
            <AutoLoanCalculator />
            <section className="calculator-explanation">
              <h2>Бұл қалай есептелді?</h2>
              <p>
                MVP модулі стандартты аннуитет формуласына сүйенеді. Нәтижеге банк комиссиясы,
                сақтандыру, акция немесе басқа қосымша шығындар кірмейді. Нақты ұсынысты банктің
                ресми есебімен салыстырыңыз.
              </p>
              <code>formulaVersion: {calculator.formulaVersion}</code>
            </section>
          </>
        ) : (
          <section className="planned-calculator">
            <span>Дереккөз тексерілуде</span>
            <h2>Жалған дәлдіктен гөрі тексерілген формула маңызды.</h2>
            <p>
              Бұл модульдің интерфейсі мен rule-set орны дайын. Есептеу ресми формула, қолданыс
              кезеңі және бақылау мысалдары редакциялық тексеруден өткен соң қосылады.
            </p>
            <Link className="button button--ghost" href="/">
              Басты бетке қайту
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}

export default CalculatorPage
