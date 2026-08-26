import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { follow: false, index: false, nocache: true },
  title: 'QALAI — жабық альфа импорты',
}

export default function MaterialsLoadPage() {
  return (
    <main
      style={{
        color: '#18181b',
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5,
        margin: '4rem auto',
        maxWidth: '42rem',
        padding: '0 1.25rem',
      }}
    >
      <h1>10 жабық альфа материалын жүктеу</h1>
      <p style={{ color: '#52525b' }}>
        Материалдар тек тексерілмеген, noindex черновик ретінде сақталады. Ештеңе жарияланбайды.
      </p>
      <form action="/materials/apply" method="post">
        <input name="confirm" type="hidden" value="IMPORT_CLOSED_ALPHA_DRAFTS" />
        <button
          style={{
            background: '#18181b',
            border: 0,
            borderRadius: '.7rem',
            color: 'white',
            cursor: 'pointer',
            font: 'inherit',
            fontWeight: 650,
            padding: '.8rem 1.1rem',
          }}
          type="submit"
        >
          10 черновикті жүктеу
        </button>
      </form>
    </main>
  )
}
