import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AutoLoanCalculator } from '@/components/AutoLoanCalculator'
import { SalaryCalculator } from '@/components/SalaryCalculator'
import { TaskOpenedTracker } from '@/components/TaskOpenedTracker'
import { VehicleTaxCalculator } from '@/components/VehicleTaxCalculator'
import { absoluteURL, isIndexingAllowed } from '@/lib/site'
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
    robots: {
      follow: isIndexingAllowed() && isAvailable,
      index: isIndexingAllowed() && isAvailable,
    },
    title: calculator.title,
  }
}

const CalculatorPage = async ({ params }: PageProps) => {
  const { slug } = await params
  const calculator = getCalculatorBySlug(slug)
  if (!calculator) notFound()

  return (
    <div className="calculator-page">
      <TaskOpenedTracker
        eligible={calculator.status === 'available'}
        task={{ key: calculator.key, type: 'calculator' }}
      />
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

        {calculator.status === 'alpha' ? (
          <div className="draft-banner" role="status">
            ЖАБЫҚ АЛЬФА · Нәтижені ресми есеппен салыстырыңыз. Тәуелсіз редакторлық тексеруден кейін
            ғана ашық жарияланады.
          </div>
        ) : null}

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
        ) : calculator.key === 'salary' ? (
          <>
            <SalaryCalculator />
            <section className="calculator-explanation">
              <h2>Бұл қалай есептелді?</h2>
              <p>
                Есеп 2026 жылғы тұрақты айлық жалақыны болжайды: 10% міндетті зейнетақы жарнасы, 2%
                МӘМС жарнасы, 30 АЕК базалық шегерім және ЖТС-тың жылдық прогрессивті шкаласы. Бір
                жолғы сыйақы, ерекше әлеуметтік шегерімдер және жұмыс беруші төлейтін аударымдар бұл
                нұсқаға кірмейді.
              </p>
              <ul className="official-source-list">
                <li>
                  <a href="https://www.gov.kz/memleket/entities/kgd-vko/press/news/details/1238674?lang=ru">
                    КГД: 2026 жылғы ЖТС ставкалары мен шегерімдер
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/situations/332/intro?lang=ru">
                    eGov: міндетті зейнетақы жарнасы
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/memleket/entities/minfin/press/article/details/235407?lang=ru">
                    МӘМС қоры: 2026 жылғы қызметкер жарнасы
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/article/17157?lang=ru">
                    2026 жылғы АЕК пен ең төменгі жалақы
                  </a>
                </li>
              </ul>
              <code>formulaVersion: {calculator.formulaVersion}</code>
            </section>
          </>
        ) : calculator.key === 'vehicle-tax' ? (
          <>
            <VehicleTaxCalculator />
            <section className="calculator-explanation">
              <h2>Бұл қалай есептелді?</h2>
              <p>
                Бұл нұсқа жеке тұлғаның B санатындағы жеңіл көлігіне арналған. 2026 жылғы АЕК,
                қозғалтқыш көлемінің сатысы, 1500 см³-ден жоғары көлемге қосылатын 7 теңге, көлік
                жасының коэффициенті және иелік еткен ай саны ескеріледі. Жеңілдіктер, заңды
                тұлғалар және басқа көлік санаттары есепке кірмейді.
              </p>
              <ul className="official-source-list">
                <li>
                  <a href="https://adilet.kz/ru/laws/nk/st-565/">
                    Салық кодексінің 565-бабы: мөлшерлемелер мен коэффициенттер
                  </a>
                </li>
                <li>
                  <a href="https://adilet.kz/ru/laws/nk/st-566/">
                    Салық кодексінің 566-бабы: иелік еткен айлар бойынша есептеу
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/article/17157?lang=ru">
                    2026 жылғы АЕК — 4 325 теңге
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/memleket/entities/kgd-abay/press/news/details/1167191?lang=ru">
                    КГД: 2026 жылғы көлік салығының өзгерістері
                  </a>
                </li>
              </ul>
              <p>Соңғы соманы КГД порталындағы немесе e-Salyq Azamat-тағы есеппен салыстырыңыз.</p>
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
