'use client'

import { useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'

export const Feedback = ({ scenarioSlug }: { scenarioSlug: string }) => {
  const [answer, setAnswer] = useState<boolean | null>(null)

  const submit = (helpful: boolean) => {
    setAnswer(helpful)
    trackEvent({ helpful, name: 'feedback_submitted', scenarioSlug })
    if (helpful) trackEvent({ name: 'task_resolved', method: 'feedback', scenarioSlug })
  }

  return (
    <section className="feedback" aria-labelledby="feedback-title">
      <div>
        <p className="eyebrow">Кері байланыс</p>
        <h2 id="feedback-title">Бұл ақпарат пайдалы болды ма?</h2>
      </div>
      {answer === null ? (
        <div className="feedback__actions">
          <button className="button button--small" onClick={() => submit(true)} type="button">
            Иә, пайдалы
          </button>
          <button
            className="button button--ghost button--small"
            onClick={() => submit(false)}
            type="button"
          >
            Жоқ
          </button>
        </div>
      ) : (
        <p aria-live="polite">Рақмет. Жауабыңыз өнім аналитикасына PII қоспай белгіленді.</p>
      )}
    </section>
  )
}
