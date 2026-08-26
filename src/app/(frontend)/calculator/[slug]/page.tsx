import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AutoLoanCalculator } from '@/components/AutoLoanCalculator'
import { MaternityBenefitCalculator } from '@/components/MaternityBenefitCalculator'
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

        {calculator.key === 'maternity-benefit' ? (
          <>
            <MaternityBenefitCalculator />
            <section className="calculator-explanation">
              <h2>Бұл қалай есептелді?</h2>
              <p>
                Бұл нұсқа бір жұмыс берушіден тұрақты жалақы алатын және әлеуметтік аударымдары
                Қорға нақты түскен қызметкерге арналған. Соңғы 12 айдағы есепке алынған табыс 12-ге
                бөлініп, еңбекке жарамсыздық күндерінің коэффициентіне көбейтіледі. Нәтижеден 10%
                міндетті зейнетақы жарнасы ұсталады. 2026 жылы бір айға есепке алынатын табыс 7 ЕТЖ,
                яғни 595 000 теңгеден аспайды. Ай сайынғы табысы өзгерген, бірнеше жұмыс берушісі
                немесе ЖК кірісі бар жағдай бұл қарапайым нұсқаға кірмейді.
              </p>
              <ul className="official-source-list">
                <li>
                  <a href="https://egov.kz/cms/ru/articles/child/ui_decret?mobile=no">
                    eGov: декрет демалысы және 2026 жылғы есептеу мысалдары
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/memleket/entities/karaganda-osakarovka-esil/press/article/details/209132">
                    gov.kz: күн саны және 7 ЕТЖ шегі
                  </a>
                </li>
                <li>
                  <a href="https://adilet.zan.kz/rus/docs/K2300000224">
                    Әділет: Қазақстан Республикасының Әлеуметтік кодексі
                  </a>
                </li>
              </ul>
              <p>
                Нақты тағайындалған соманы eGov немесе Мемлекеттік әлеуметтік сақтандыру қорының
                деректерімен салыстырыңыз.
              </p>
              <code>formulaVersion: {calculator.formulaVersion}</code>
            </section>
          </>
        ) : calculator.key === 'auto-loan' ? (
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
                Есеп Қазақстан резиденті әрі зейнетақы немесе МӘМС жарнасынан босатылмаған
                қызметкердің 2026 жылғы тұрақты айлық жалақысын болжайды: 10% міндетті зейнетақы
                жарнасы, 2% МӘМС жарнасы, 30 АЕК базалық шегерім және ЖТС-тың жылдық прогрессивті
                шкаласы. Бір жолғы сыйақы, ерекше әлеуметтік шегерімдер және жұмыс беруші төлейтін
                аударымдар бұл нұсқаға кірмейді. Салық салынатын табыс 8 500 АЕК жылдық шектен
                асқанда калькулятор жылдық ЖТС-ты 12 айға бөліп, орташа айлық соманы көрсетеді;
                нақты айлардағы ұсталым әртүрлі болуы мүмкін.
              </p>
              <ul className="official-source-list">
                <li>
                  <a href="https://www.gov.kz/memleket/entities/kgd-vko/press/news/details/1238674?lang=ru">
                    КГД: 2026 жылғы ЖТС ставкалары мен шегерімдер
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/memleket/entities/kgd-zhambyl/press/news/details/1260225?lang=ru">
                    КГД: базалық шегерім келесі айға көшірілмейді
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/situations/332/intro?lang=ru">
                    eGov: міндетті зейнетақы жарнасы
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/memleket/entities/almaty-densaulyk/press/news/details/1133766?lang=ru">
                    МӘМС: 2026 жылғы қызметкер жарнасының шегі
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/memleket/entities/minfin/documents/details/1030415?lang=ru">
                    Қаржы министрлігі: 8 500 АЕК-тен жоғары ЖТС шкаласы
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
                жасының коэффициенті және иелік еткен ай саны ескеріледі. Пайдалану мерзімі 10
                жылдан 20 жылға дейін қоса алғанда 0,7, ал 20 жылдан асса 0,5 коэффициенті
                қолданылады. Иелік ету мерзіміне сатып алған ай кіреді, сатқан ай кірмейді.
                Жеңілдіктер, заңды тұлғалар және басқа көлік санаттары есепке кірмейді.
              </p>
              <ul className="official-source-list">
                <li>
                  <a href="https://adilet.zan.kz/rus/docs/K2500000214">
                    Әділет: Қазақстан Республикасының қолданыстағы Салық кодексі
                  </a>
                </li>
                <li>
                  <a href="https://www.gov.kz/memleket/entities/kgd-zhetysu/press/news/details/1174210">
                    КГД: 2026 жылғы есептеу тәртібі және иелік ету кезеңі
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
                <li>
                  <a href="https://astana.kgd.gov.kz/ru/news/sroki-i-poryadok-uplaty-naloga-na-transport-v-2026-godu-2-157904">
                    КГД: жеке тұлғалар үшін төлеу мерзімі
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
