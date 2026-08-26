'use client'

import { FormEvent, useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'
import { formatKzt } from '@/modules/calculators/format'
import {
  calculateVehicleTax,
  type VehicleTaxResult,
} from '@/modules/calculators/vehicle-tax/calculate'

const toNumber = (value: FormDataEntryValue | null) =>
  Number(String(value ?? '').replace(/\s/g, ''))

export const VehicleTaxCalculator = () => {
  const [result, setResult] = useState<VehicleTaxResult | null>(null)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const task = { key: 'vehicle-tax', type: 'calculator' } as const
    trackEvent({ name: 'calculator_start', task })

    const formData = new FormData(event.currentTarget)

    try {
      const calculation = calculateVehicleTax({
        engineVolumeCc: toNumber(formData.get('engineVolumeCc')),
        manufactureYear: toNumber(formData.get('manufactureYear')),
        ownershipMonths: toNumber(formData.get('ownershipMonths')),
      })
      setResult(calculation)
      trackEvent({ name: 'calculator_complete', outcome: 'success', task })
    } catch {
      setResult(null)
      setError('Қозғалтқыш көлемін, шығарылған жылын және иелік ету айларын тексеріңіз.')
      trackEvent({ name: 'calculator_complete', outcome: 'error', task })
    }
  }

  return (
    <div className="calculator-shell">
      <form className="calculator-form" onSubmit={submit}>
        <div className="field-grid">
          <label>
            <span>Қозғалтқыш көлемі</span>
            <span className="input-with-unit">
              <input
                aria-label="Қозғалтқыш көлемі"
                defaultValue="1998"
                inputMode="numeric"
                max="20000"
                min="1"
                name="engineVolumeCc"
                required
                type="number"
              />
              <span>см³</span>
            </span>
          </label>
          <label>
            <span>Шығарылған жылы</span>
            <input
              aria-label="Шығарылған жылы"
              defaultValue="2020"
              inputMode="numeric"
              max="2026"
              min="1900"
              name="manufactureYear"
              required
              type="number"
            />
          </label>
          <label>
            <span>2026 жылы иелік еткен ай саны</span>
            <input
              aria-label="Иелік еткен ай саны"
              defaultValue="12"
              inputMode="numeric"
              max="12"
              min="1"
              name="ownershipMonths"
              required
              type="number"
            />
            <small>Сатып алған айды қосыңыз, ал сатқан айды қоспаңыз.</small>
          </label>
        </div>
        <button className="button button--wide" type="submit">
          Салықты есептеу
        </button>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <section className="calculator-result" aria-live="polite" aria-labelledby="result-title">
        <p className="eyebrow">2026 жылғы салық</p>
        <h2 id="result-title">{result ? formatKzt(result.taxAmount) : 'Есептеуге дайын'}</h2>
        <p>
          {result
            ? `${result.ownershipMonths} ай үшін алдын ала есеп. 2027 жылғы 1 сәуірден кешіктірмей төленеді.`
            : 'Көлік куәлігіндегі деректерді енгізіп, «Есептеу» түймесін басыңыз.'}
        </p>
        {result ? (
          <dl className="result-list">
            <div>
              <dt>Негізгі мөлшерлеме</dt>
              <dd>
                {result.baseRateMrp} АЕК · {formatKzt(result.baseTax)}
              </dd>
            </div>
            <div>
              <dt>Көлемнен асқан бөлік</dt>
              <dd>
                {result.excessCc
                  ? `${result.excessCc} см³ · ${formatKzt(result.excessTax)}`
                  : 'Жоқ'}
              </dd>
            </div>
            <div>
              <dt>Көлік жасы</dt>
              <dd>
                {result.ageYears} жыл · коэффициент {result.ageCoefficient}
              </dd>
            </div>
            <div>
              <dt>Толық жылға</dt>
              <dd>{formatKzt(result.fullYearTax)}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </div>
  )
}
