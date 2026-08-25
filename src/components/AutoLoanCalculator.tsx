'use client'

import { FormEvent, useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'
import { calculateAutoLoan, type AutoLoanResult } from '@/modules/calculators/auto-loan/calculate'
import { formatKzt } from '@/modules/calculators/format'

const toNumber = (value: FormDataEntryValue | null) =>
  Number(String(value ?? '').replace(/\s/g, ''))

export const AutoLoanCalculator = () => {
  const [result, setResult] = useState<AutoLoanResult | null>(null)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const task = { key: 'auto-loan', type: 'calculator' } as const
    trackEvent({ name: 'calculator_start', task })

    const formData = new FormData(event.currentTarget)

    try {
      const calculation = calculateAutoLoan({
        annualRatePercent: toNumber(formData.get('annualRatePercent')),
        downPayment: toNumber(formData.get('downPayment')),
        price: toNumber(formData.get('price')),
        termMonths: toNumber(formData.get('termYears')) * 12,
      })
      setResult(calculation)
      trackEvent({ name: 'calculator_complete', outcome: 'success', task })
    } catch {
      setResult(null)
      setError('Мәндерді тексеріңіз: алғашқы жарна бағадан аспауы, ал мерзім 1–10 жыл болуы керек.')
      trackEvent({ name: 'calculator_complete', outcome: 'error', task })
    }
  }

  return (
    <div className="calculator-shell">
      <form className="calculator-form" onSubmit={submit}>
        <div className="field-grid">
          <label>
            <span>Көлік бағасы</span>
            <span className="input-with-unit">
              <input
                aria-label="Көлік бағасы"
                defaultValue="12000000"
                inputMode="numeric"
                min="1"
                name="price"
                required
                type="number"
              />
              <span>₸</span>
            </span>
          </label>
          <label>
            <span>Алғашқы жарна</span>
            <span className="input-with-unit">
              <input
                aria-label="Алғашқы жарна"
                defaultValue="2000000"
                inputMode="numeric"
                min="0"
                name="downPayment"
                required
                type="number"
              />
              <span>₸</span>
            </span>
          </label>
          <label>
            <span>Жылдық мөлшерлеме</span>
            <span className="input-with-unit">
              <input
                aria-label="Жылдық мөлшерлеме"
                defaultValue="18"
                inputMode="decimal"
                max="100"
                min="0"
                name="annualRatePercent"
                required
                step="0.1"
                type="number"
              />
              <span>%</span>
            </span>
          </label>
          <label>
            <span>Мерзім</span>
            <span className="input-with-unit">
              <input
                aria-label="Мерзім"
                defaultValue="5"
                inputMode="numeric"
                max="10"
                min="1"
                name="termYears"
                required
                type="number"
              />
              <span>жыл</span>
            </span>
          </label>
        </div>
        <button className="button button--wide" type="submit">
          Ай сайынғы төлемді есептеу
        </button>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <section className="calculator-result" aria-live="polite" aria-labelledby="result-title">
        <p className="eyebrow">Нәтиже</p>
        <h2 id="result-title">{result ? formatKzt(result.monthlyPayment) : 'Есептеуге дайын'}</h2>
        <p>
          {result
            ? 'ай сайынғы шамамен төлем'
            : 'Параметрлерді енгізіп, «Есептеу» түймесін басыңыз.'}
        </p>
        {result ? (
          <dl className="result-list">
            <div>
              <dt>Несие сомасы</dt>
              <dd>{formatKzt(result.principal)}</dd>
            </div>
            <div>
              <dt>Банкке жалпы төлем</dt>
              <dd>{formatKzt(result.totalRepayment)}</dd>
            </div>
            <div>
              <dt>Артық төлем</dt>
              <dd>{formatKzt(result.overpayment)}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </div>
  )
}
