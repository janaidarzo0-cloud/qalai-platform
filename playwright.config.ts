import { defineConfig } from '@playwright/test'

const hostedAcceptance = process.env.QALAI_E2E_HOSTED === 'true'
const externallyManagedServer = process.env.QALAI_E2E_EXTERNAL_SERVER === 'true'
const configuredBaseURL = process.env.QALAI_E2E_BASE_URL?.replace(/\/$/, '')

if (hostedAcceptance && !configuredBaseURL) {
  throw new Error('QALAI_E2E_BASE_URL is required for hosted acceptance.')
}

if (hostedAcceptance && !process.env.QALAI_E2E_SCENARIO_SLUG) {
  throw new Error('QALAI_E2E_SCENARIO_SLUG is required for hosted acceptance.')
}

if (hostedAcceptance && !process.env.QALAI_E2E_ALLOWED_OFFICIAL_HOSTS) {
  throw new Error('QALAI_E2E_ALLOWED_OFFICIAL_HOSTS is required for hosted acceptance.')
}

const baseURL = configuredBaseURL ?? 'http://localhost:3100'

export default defineConfig({
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  outputDir: 'test-results',
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 1 : 0,
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer:
    hostedAcceptance || externallyManagedServer
      ? undefined
      : {
          command: 'node node_modules/next/dist/bin/next dev -p 3100',
          env: {
            ...process.env,
            DATABASE_URL: 'postgresql://qalai:qalai_local_only@localhost:5432/qalai',
            NEXT_PUBLIC_SITE_URL: baseURL,
            PAYLOAD_SECRET: 'local-e2e-only-secret-32-characters-minimum',
            QALAI_ALLOW_INDEXING: 'false',
            QALAI_CONTENT_MODE: 'demo',
          },
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          url: baseURL,
        },
  workers: process.env.CI || hostedAcceptance ? 1 : undefined,
})
