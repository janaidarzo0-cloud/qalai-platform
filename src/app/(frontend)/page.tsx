import Link from 'next/link'

import { TaskSearch } from '@/components/TaskSearch'
import { listPublishedScenarios } from '@/lib/cms/scenarios'
import { isScenarioTrusted } from '@/lib/cms/trust'
import { buildTaskSearchIndex } from '@/lib/search/tasks'
import { calculatorDefinitions } from '@/modules/calculators/registry'

export const dynamic = 'force-dynamic'

const quickActions = [
  { href: '/scenario/etsq-alu', label: 'ЭЦҚ алу', mark: '01' },
  { href: '/calculator/zhalaqy-kalkulyatory', label: 'Жалақы', mark: '02' },
  {
    href: '/scenario/zhk-nemese-ozin-ozi-zhumyspen-kamtu',
    label: 'ЖК және салық',
    mark: '03',
  },
  { href: '/scenario/ayypuldardy-tekseru-zhane-toleu', label: 'Айыппұл', mark: '04' },
]

const HomePage = async () => {
  const scenarios = await listPublishedScenarios()
  const taskSearchIndex = buildTaskSearchIndex(
    scenarios.map((scenario) => ({
      category: scenario.category,
      shortAnswer: scenario.shortAnswer,
      slug: scenario.slug,
      status: scenario.status,
      title: scenario.title,
      trusted: isScenarioTrusted(scenario),
    })),
    calculatorDefinitions,
  )

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <p className="eyebrow">Қазақстанға арналған пайдалы сервис</p>
            <h1>Не істегіңіз келеді?</h1>
            <p className="hero__lead">
              Мемлекеттік, қаржылық және күнделікті істі түсінікті қадамдарға айналдырамыз.
            </p>
            <TaskSearch tasks={taskSearchIndex} />
          </div>
          <aside className="hero__proof" aria-label="QALAI қағидалары">
            <span>Qalai тексерді</span>
            <strong>Ресми дереккөзсіз — жарияланым жоқ.</strong>
            <p>Әр бетте дереккөз, тексерілген күн және қолданыс мерзімі көрінеді.</p>
          </aside>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="quick-actions">
            {quickActions.map((action) => (
              <Link href={action.href} key={action.href}>
                <span>{action.mark}</span>
                <strong>{action.label}</strong>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="scenarios">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Сценарийлер</p>
              <h2>Маған не істеу керек?</h2>
            </div>
            <p>Алдымен қысқа жауап. Содан кейін әрекет. Тек төменде — барлық егжей-тегжей.</p>
          </div>
          <div className="card-grid">
            {scenarios.map((scenario) => (
              <Link
                className="content-card"
                href={`/scenario/${scenario.slug}`}
                key={scenario.slug}
              >
                <span className="content-card__meta">{scenario.category}</span>
                <h3>{scenario.title}</h3>
                <p>{scenario.shortAnswer}</p>
                <span className="content-card__link">Қадамдарды көру →</span>
              </Link>
            ))}
          </div>
          <p className="demo-note">
            Бұл материалдар ресми дереккөздермен толтырылған жабық альфа нұсқалары. Тәуелсіз
            редактор тексермейінше олар іздеу жүйелеріне ашылмайды және «Qalai тексерді» белгісін
            алмайды.
          </p>
        </div>
      </section>

      <section className="section section--ink" id="calculators">
        <div className="container">
          <div className="section-heading section-heading--light">
            <div>
              <p className="eyebrow">5 алғашқы құрал</p>
              <h2>Оқып қана қоймай, есептеңіз.</h2>
            </div>
            <p>Реттелетін формулалар тек ресми rule set тексерілгеннен кейін іске қосылады.</p>
          </div>
          <div className="calculator-grid">
            {calculatorDefinitions.map((calculator, index) => (
              <Link href={`/calculator/${calculator.slug}`} key={calculator.key}>
                <span>0{index + 1}</span>
                <h3>{calculator.shortTitle}</h3>
                <p>{calculator.summary}</p>
                <small>
                  {calculator.status === 'available'
                    ? 'MVP модулі дайын'
                    : calculator.status === 'alpha'
                      ? 'Жабық альфа дайын'
                      : 'Дереккөз тексерілуде'}
                </small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="trust">
        <div className="container trust-grid">
          <div>
            <p className="eyebrow">Сенім қағидасы</p>
            <h2>Цифрды ойдан шығармаймыз.</h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Бастапқы дереккөз</strong>
                <p>gov.kz, eGov, КГД, нормативтік құжат немесе ресми қызмет көрсетуші.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Редакциялық тексеру</strong>
                <p>Тұжырым, формула, жарамдылық кезеңі және келесі тексеру күні белгіленеді.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Ашық белгі</strong>
                <p>«Qalai тексерді» тек шын мәнінде тексерілген материалға ғана қойылады.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </>
  )
}

export default HomePage
