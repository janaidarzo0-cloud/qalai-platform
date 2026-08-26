'use client'

import { FormEvent, useState } from 'react'

import { trackEvent } from '@/lib/analytics/client'
import { formatKzt } from '@/modules/calculators/format'
import {
  calculateMaternityBenefit,
  type MaternityBenefitResult,
} from '@/modules/calculators/maternity-benefit/calculate'

const toNumber = (value: FormDataEntryValue | null) =>
  Number(String(value ?? '').replace(/\s/g, ''))

export const MaternityBenefitCalculator = () => {
  const [result, setResult] = useState<MaternityBenefitResult | null>(null)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const task = { key: 'maternity-benefit', type: 'calculator' } as const
    trackEvent({ name: 'calculator_start', task })

    const formData = new FormData(event.currentTarget)

    try {
      const calculation = calculateMaternityBenefit({
        contributionMonths: toNumber(formData.get('contributionMonths')),
        grossMonthlySalary: toNumber(formData.get('grossMonthlySalary')),
        leaveDays: toNumber(formData.get('leaveDays')),
      })
      setResult(calculation)
      trackEvent({ name: 'calculator_complete', outcome: 'success', task })
    } catch {
      setResult(null)
      setError('Жалақыны, әлеуметтік аударым түскен ай санын және демалыс күнін тексеріңіз.')
      trackEvent({ name: 'calculator_complete', outcome: 'error', task })
    }
  }

  return (
    <div className="calculator-shell">
      <form className="calculator-form" onSubmit={submit}>
        <div className="field-grid">
          <label>
            <span>Есептелген тұрақты айлық жалақы</span>
            <span className="input-with-unit">
              <input
                aria-label="Есептелген тұрақты айлық жалақы"
                defaultValue="180000"
                inputMode="numeric"
                min="1"
                name="grossMonthlySalary"
                required
                type="number"
              />
              <span>₸</span>
            </span>
            <small>Міндетті зейнетақы жарнасы ұсталмай тұрған сома.</small>
          </label>
          <label>
            <span>Соңғы 12 айда әлеуметтік аударым түскен ай саны</span>
            <input
              aria-label="Әлеуметтік аударым түскен ай саны"
              defaultValue="12"
              inputMode="numeric"
              max="12"
              min="1"
              name="contributionMonths"
              required
              type="number"
            />
            <small>Жұмыс істемеген айлар нөл деп алынып, жалпы табыс бәрібір 12-ге бөлінеді.</small>
          </label>
          <label>
            <span>Еңбекке уақытша жарамсыздық парағындағы күн саны</span>
            <select aria-label="Декрет демалысының күн саны" defaultValue="126" name="leaveDays">
              <option value="126">126 күн — қалыпты босану</option>
              <option value="140">140 күн — асқынған босану немесе екі және одан көп бала</option>
              <option value="170">170 күн — полигон аймағы, қалыпты босану</option>
              <option value="184">184 күн — полигон аймағы, асқынған босану</option>
            </select>
          </label>
        </div>
        <button className="button button--wide" type="submit">
          Төлемді есептеу
        </button>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <section className="calculator-result" aria-live="polite" aria-labelledby="result-title">
        <p className="eyebrow">Банк шотына түсетін алдын ала сома</p>
        <h2 id="result-title">{result ? formatKzt(result.netBenefit) : 'Есептеуге дайын'}</h2>
        <p>
          {result
            ? `${result.leaveDays} күнге арналған біржолғы әлеуметтік төлемнен 10% БЖЗҚ-ға жіберілгеннен кейінгі баға.`
            : 'Жалақы мен әлеуметтік аударым кезеңін енгізіп, «Төлемді есептеу» түймесін басыңыз.'}
        </p>
        {result ? (
          <dl className="result-list">
            <div>
              <dt>Есепке алынған орташа айлық табыс</dt>
              <dd>{formatKzt(result.averageMonthlyIncome)}</dd>
            </div>
            <div>
              <dt>Күн коэффициенті</dt>
              <dd>
                {result.leaveDays} / 30 = {result.leaveCoefficient.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>БЖЗҚ ұсталғанға дейін</dt>
              <dd>{formatKzt(result.grossBenefit)}</dd>
            </div>
            <div>
              <dt>БЖЗҚ-ға 10%</dt>
              <dd>− {formatKzt(result.benefitPensionContribution)}</dd>
            </div>
          </dl>
        ) : null}
        {result?.incomeCapped ? (
          <p className="result-note">
            Есепке алынатын айлық табыс 2026 жылғы 7 ЕТЖ шегімен —{' '}
            {formatKzt(result.maximumMonthlyIncome)} сомасымен шектелді.
          </p>
        ) : null}
      </section>
    </div>
  )
}
