import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { AnalyticsRuntime } from '@/components/AnalyticsRuntime'
import { isAnalyticsRuntimeEnabled } from '@/lib/analytics/config'
import { getSiteURL, siteConfig } from '@/lib/site'

import './styles.css'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description: siteConfig.description,
  metadataBase: new URL(getSiteURL()),
  openGraph: {
    description: siteConfig.description,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name,
    type: 'website',
  },
  title: {
    default: 'QALAI — Не істеу керек екенін түсініңіз',
    template: '%s — QALAI',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f3ee',
}

const FrontendLayout = ({ children }: { children: ReactNode }) => {
  const analyticsEnabled = isAnalyticsRuntimeEnabled()

  return (
    <html lang="kk">
      <body>
        <a className="skip-link" href="#main-content">
          Негізгі мазмұнға өту
        </a>
        <header className="site-header">
          <div className="container site-header__inner">
            <Link className="brand" href="/" aria-label="QALAI басты беті">
              QALAI<span>.</span>
            </Link>
            <nav aria-label="Негізгі навигация">
              <Link href="/#scenarios">Сценарийлер</Link>
              <Link href="/#calculators">Калькуляторлар</Link>
              <Link href="/#trust">Қалай тексереміз</Link>
            </nav>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div className="container site-footer__inner">
            <div>
              <span className="brand brand--footer">QALAI.</span>
              <p>Жауап → әрекет → толық түсіндірме.</p>
            </div>
            <p>QALAI ресми қызмет көрсетпейді. Соңғы әрекет әрқашан ресми ресурста орындалады.</p>
          </div>
        </footer>
        <AnalyticsRuntime enabled={analyticsEnabled} />
      </body>
    </html>
  )
}

export default FrontendLayout
