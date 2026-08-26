'use client'

import { FormEvent, useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'
import {
  calculateChildcareBenefit,
  type ChildcareBenefitResult,
} from '@/modules/calculators/childcare-benefit/calculate'
import { formatKzt } from '@/modules/calculators/format'

const toNumber = (value: FormDataEntryValue | null) =>
  Number(String(value ?? '').replace(/\s/g, ''))

export const ChildcareBenefitCalculator = () => {
  const [status, setStatus] = useState<'non-working' | 'working'>('working')
  const [result, setResult] = useState<ChildcareBenefitResult | null>(null)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const task = { key: 'childcare-benefit', type: 'calculator' } as const
    trackEvent({ name: 'calculator_start', task })
    const formData = new FormData(event.currentTarget)

    try {
      const childOrder = toNumber(formData.get('childOrder')) as 1 | 2 | 3 | 4
      const calculation =
        status === 'working'
          ? calculateChildcareBenefit({
              childOrder,
              earlierMonthlyIncome: toNumber(formData.get('earlierMonthlyIncome')),
              earlierPaidMonths: toNumber(formData.get('earlierPaidMonths')),
              recentMonthlyIncome: toNumber(formData.get('recentMonthlyIncome')),
              recentPaidMonths: toNumber(formData.get('recentPaidMonths')),
              status,
            })
          : calculateChildcareBenefit({ childOrder, status })

      setResult(calculation)
      trackEvent({ name: 'calculator_complete', outcome: 'success', task })
    } catch {
      setResult(null)
      setError(
        'Баланың кезегін, табыс сомаларын және әлеуметтік аударым түскен айларды тексеріңіз.',
      )
      trackEvent({ name: 'calculator_complete', outcome: 'error', task })
    }
  }

  return (
    <div className="calculator-shell">
      <form className="calculator-form" onSubmit={submit}>
        <div className="field-grid">
          <label>
            <span>Сіздің жағдайыңыз</span>
            <select
              aria-label="Жұмыс және әлеуметтік аударым мәртебесі"
              name="status"
              onChange={(event) => {
                setStatus(event.target.value as typeof status)
                setResult(null)
              }}
              value={status}
            >
              <option value="working">Әлеуметтік аударымдарым бар</option>
              <option value="non-working">Әлеуметтік аударымдарым жоқ</option>
            </select>
          </label>
          <label>
            <span>Бұл нешінші бала?</span>
            <select aria-label="Баланың кезегі" defaultValue="1" name="childOrder">
              <option value="1">Бірінші</option>
              <option value="2">Екінші</option>
              <option value="3">Үшінші</option>
              <option value="4">Төртінші немесе одан кейінгі</option>
            </select>
          </label>

          {status === 'working' ? (
            <>
              <label>
                <span>Алдыңғы 12 айдағы айлық есепке алынған табыс</span>
                <span className="input-with-unit">
                  <input
                    aria-label="Алдыңғы 12 айдағы айлық табыс"
                    defaultValue="150000"
                    inputMode="numeric"
                    min="0"
                    name="earlierMonthlyIncome"
                    required
                    type="number"
                  />
                  <span>₸</span>
                </span>
              </label>
              <label>
                <span>Алдыңғы 12 айда аударым түскен ай саны</span>
                <input
                  aria-label="Алдыңғы кезеңдегі аударым айлары"
                  defaultValue="12"
                  inputMode="numeric"
                  max="12"
                  min="0"
                  name="earlierPaidMonths"
                  required
                  type="number"
                />
              </label>
              <label>
                <span>Соңғы 12 айдағы айлық есепке алынған табыс</span>
                <span className="input-with-unit">
                  <input
                    aria-label="Соңғы 12 айдағы айлық табыс"
                    defaultValue="200000"
                    inputMode="numeric"
                    min="0"
                    name="recentMonthlyIncome"
                    required
                    type="number"
                  />
                  <span>₸</span>
                </span>
              </label>
              <label>
                <span>Соңғы 12 айда аударым түскен ай саны</span>
                <input
                  aria-label="Соңғы кезеңдегі аударым айлары"
                  defaultValue="12"
                  inputMode="numeric"
                  max="12"
                  min="0"
                  name="recentPaidMonths"
                  required
                  type="number"
                />
                <small>
                  Есепке тек Қорға әлеуметтік аударым түскен табыс кіреді. Үзіліс айлары нөл болып,
                  жиынтық 24-ке бөлінеді.
                </small>
              </label>
            </>
          ) : null}
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
        <p className="eyebrow">Ай сайын банк шотына түсетін алдын ала сома</p>
        <h2 id="result-title">
          {result ? formatKzt(result.monthlyBankPayment) : 'Есептеуге дайын'}
        </h2>
        <p>
          {result?.status === 'working'
            ? 'Бала 1,5 жасқа толғанға дейінгі әлеуметтік төлемнен 10% БЖЗҚ-ға жіберілгеннен кейінгі баға.'
            : result
              ? '2026 жылғы АЕК бойынша бала 1,5 жасқа толғанға дейін төленетін мемлекеттік жәрдемақы.'
              : 'Жағдайыңызды таңдап, «Ай сайынғы төлемді есептеу» түймесін басыңыз.'}
        </p>
        {result?.status === 'working' ? (
          <>
            <dl className="result-list">
              <div>
                <dt>24 айдағы орташа есепке алынған табыс</dt>
                <dd>{formatKzt(result.averageMonthlyIncome)}</dd>
              </div>
              <div>
                <dt>Есептелген әлеуметтік төлем</dt>
                <dd>{formatKzt(result.grossSocialPayment)}</dd>
              </div>
              <div>
                <dt>БЖЗҚ-ға 10%</dt>
                <dd>− {formatKzt(result.benefitPensionContribution)}</dd>
              </div>
            </dl>
            {result.maximumApplied ? (
              <p className="result-note">
                2026 жылғы ең жоғары тағайындалатын сома — {formatKzt(result.maximumGrossPayment)}{' '}
                қолданылды.
              </p>
            ) : null}
            {result.minimumApplied ? (
              <p className="result-note">
                Есептелген сома төмен болғандықтан, {result.childOrder}-балаға арналған ең төменгі
                деңгей қолданылды.
              </p>
            ) : null}
          </>
        ) : result?.status === 'non-working' ? (
          <dl className="result-list">
            <div>
              <dt>2026 жылғы мөлшерлеме</dt>
              <dd>
                {result.rateMrp} АЕК · {formatKzt(result.monthlyBankPayment)}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>
    </div>
  )
}
