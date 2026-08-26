'use client'

import { FormEvent, useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'
import { formatKzt } from '@/modules/calculators/format'
import { calculateSalary, type SalaryResult } from '@/modules/calculators/salary/calculate'

const toNumber = (value: FormDataEntryValue | null) =>
  Number(String(value ?? '').replace(/\s/g, ''))

export const SalaryCalculator = () => {
  const [result, setResult] = useState<SalaryResult | null>(null)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const task = { key: 'salary', type: 'calculator' } as const
    trackEvent({ name: 'calculator_start', task })

    const formData = new FormData(event.currentTarget)

    try {
      const calculation = calculateSalary({
        applyBasicDeduction: formData.get('applyBasicDeduction') === 'on',
        grossSalary: toNumber(formData.get('grossSalary')),
      })
      setResult(calculation)
      trackEvent({ name: 'calculator_complete', outcome: 'success', task })
    } catch {
      setResult(null)
      setError('Есептелген жалақыны 1 теңгеден жоғары етіп енгізіңіз.')
      trackEvent({ name: 'calculator_complete', outcome: 'error', task })
    }
  }

  return (
    <div className="calculator-shell">
      <form className="calculator-form" onSubmit={submit}>
        <div className="field-grid">
          <label>
            <span>Есептелген айлық жалақы</span>
            <span className="input-with-unit">
              <input
                aria-label="Есептелген айлық жалақы"
                defaultValue="500000"
                inputMode="numeric"
                min="1"
                name="grossSalary"
                required
                type="number"
              />
              <span>₸</span>
            </span>
          </label>
          <label className="checkbox-field">
            <input defaultChecked name="applyBasicDeduction" type="checkbox" />
            <span>
              <strong>30 АЕК базалық шегерімді қолдану</strong>
              <small>Бұл шегерімді бір салық агенті ғана қолдана алады.</small>
            </span>
          </label>
        </div>
        <button className="button button--wide" type="submit">
          Қолға түсетін соманы есептеу
        </button>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <section className="calculator-result" aria-live="polite" aria-labelledby="result-title">
        <p className="eyebrow">Қолға түсетін сома</p>
        <h2 id="result-title">{result ? formatKzt(result.netSalary) : 'Есептеуге дайын'}</h2>
        <p>
          {result
            ? '2026 жылғы ережелер бойынша айлық бағалау'
            : 'Жалақыңызды енгізіп, «Есептеу» түймесін басыңыз.'}
        </p>
        {result ? (
          <dl className="result-list">
            <div>
              <dt>Міндетті зейнетақы жарнасы</dt>
              <dd>− {formatKzt(result.pensionContribution)}</dd>
            </div>
            <div>
              <dt>МӘМС жарнасы</dt>
              <dd>− {formatKzt(result.employeeHealthInsurance)}</dd>
            </div>
            <div>
              <dt>Жеке табыс салығы</dt>
              <dd>− {formatKzt(result.individualIncomeTax)}</dd>
            </div>
            <div>
              <dt>Барлық ұсталым</dt>
              <dd>{formatKzt(result.totalWithheld)}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </div>
  )
}
