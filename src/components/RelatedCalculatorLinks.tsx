'use client'

import Link from 'next/link'

import { trackEvent } from '@/lib/analytics/client'
import type { TaskRef } from '@/lib/analytics/events'
import { getRelatedCalculatorKeys } from '@/lib/related-tasks'
import { getCalculatorByKey } from '@/modules/calculators/registry'

type Props = {
  source: TaskRef
  variant?: 'aside' | 'section'
}

export const RelatedCalculatorLinks = ({ source, variant = 'section' }: Props) => {
  const calculators = getRelatedCalculatorKeys(source)
    .map((key) => getCalculatorByKey(key))
    .filter((calculator) => calculator != null)

  if (calculators.length === 0) return null

  const links = calculators.map((calculator) => (
    <Link
      className={variant === 'aside' ? 'button button--ghost button--wide' : undefined}
      href={`/calculator/${calculator.slug}`}
      key={calculator.key}
      onClick={() =>
        trackEvent({
          destination: { key: calculator.key, type: 'calculator' },
          name: 'internal_task_link_click',
          task: source,
        })
      }
    >
      <span>
        <strong>{calculator.shortTitle}</strong>
        <small>{calculator.status === 'alpha' ? 'Жабық альфа' : 'Қолжетімді'}</small>
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  ))

  if (variant === 'aside') {
    return (
      <div className="aside-card related-task-links related-task-links--aside">
        <p className="eyebrow">Есептеп көріңіз</p>
        <h2>Сомаңызды бірден есептеңіз</h2>
        {links}
      </div>
    )
  }

  return (
    <section className="calculator-explanation related-task-links">
      <p className="eyebrow">Келесі пайдалы есеп</p>
      <h2>Осыдан кейін не есептеуге болады?</h2>
      <div className="related-task-links__grid">{links}</div>
    </section>
  )
}
