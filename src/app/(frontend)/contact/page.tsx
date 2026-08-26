import type { Metadata } from 'next'

import { getPublicContactEmail } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  description: 'QALAI командасымен байланысу және материалдағы қате туралы хабарлау жолы.',
  title: 'Байланыс',
}

const ContactPage = () => {
  const email = getPublicContactEmail()

  return (
    <div className="info-page">
      <div className="container info-page__layout">
        <header>
          <p className="eyebrow">Байланыс</p>
          <h1>Сұрақ, ұсыныс немесе қате таптыңыз ба?</h1>
          <p>Материалдың сілтемесін және нақты қай жерін тексеру керегін көрсетіңіз.</p>
        </header>
        <article className="info-page__content">
          <h2>QALAI-ға жазу</h2>
          {email ? (
            <p>
              Электрондық пошта: <a href={`mailto:${email}`}>{email}</a>
            </p>
          ) : (
            <p>
              Байланыс поштасы ашық іске қосылар алдында қосылады. Жабық альфа кезінде жеке дерек
              жібермеңіз.
            </p>
          )}

          <h2>Қандай деректі жібермеу керек?</h2>
          <p>
            ЖСН, жеке куәлік көшірмесі, банк деректері, телефон нөмірі, медициналық ақпарат немесе
            мемлекеттік жүйеге кіру деректерін жібермеңіз. QALAI жеке іс бойынша ресми шешім
            шығармайды.
          </p>

          <h2>Қате туралы хабарламада не болсын?</h2>
          <p>
            Бет сілтемесі, күмән тудырған сөйлем немесе есеп, ресми дереккөз сілтемесі және қатені
            байқаған күн жеткілікті.
          </p>
        </article>
      </div>
    </div>
  )
}

export default ContactPage
