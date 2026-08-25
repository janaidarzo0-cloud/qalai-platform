'use client'

import { useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'

export const Feedback = ({ eligible, taskKey }: { eligible: boolean; taskKey: string }) => {
  const [answer, setAnswer] = useState<boolean | null>(null)

  const submit = (helpful: boolean) => {
    setAnswer(helpful)
    if (eligible) {
      trackEvent({
        helpful,
        name: 'feedback_submitted',
        task: { key: taskKey, type: 'scenario' },
      })
    }
  }

  return (
    <section className="feedback" aria-labelledby="feedback-title">
      <div>
        <p className="eyebrow">Кері байланыс</p>
        <h2 id="feedback-title">Қажетті жауабыңызды таптыңыз ба?</h2>
      </div>
      {answer === null ? (
        <div className="feedback__actions">
          <button className="button button--small" onClick={() => submit(true)} type="button">
            Иә, таптым
          </button>
          <button
            className="button button--ghost button--small"
            onClick={() => submit(false)}
            type="button"
          >
            Жоқ, әлі таппадым
          </button>
        </div>
      ) : (
        <p aria-live="polite">Рақмет, жауабыңыз қабылданды.</p>
      )}
    </section>
  )
}
