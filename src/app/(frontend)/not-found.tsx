import Link from 'next/link'

const NotFoundPage = () => (
  <div className="container not-found">
    <p className="eyebrow">404</p>
    <h1>Бұл бет табылмады.</h1>
    <p>Сілтеме өзгерген болуы мүмкін немесе сценарий әлі жарияланбаған.</p>
    <Link className="button" href="/">
      Басты бетке қайту
    </Link>
  </div>
)

export default NotFoundPage
