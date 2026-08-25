import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'

const baseURL = (process.env.QALAI_E2E_BASE_URL ?? 'http://localhost:3100').replace(/\/$/, '')
const parsedBaseURL = new URL(baseURL)
const localHosts = new Set(['127.0.0.1', '::1', 'localhost'])

if (!localHosts.has(parsedBaseURL.hostname)) {
  throw new Error(
    'Local E2E may only start a server on localhost. Use test:e2e:hosted for staging.',
  )
}

const port = parsedBaseURL.port || (parsedBaseURL.protocol === 'https:' ? '443' : '80')
const projectRoot = process.cwd()
const server = spawn(
  process.execPath,
  [path.join('node_modules', 'next', 'dist', 'bin', 'next'), 'dev', '-p', port],
  {
    cwd: projectRoot,
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://qalai:qalai_local_only@localhost:5432/qalai',
      NEXT_PUBLIC_SITE_URL: baseURL,
      PAYLOAD_SECRET: 'local-e2e-only-secret-32-characters-minimum',
      QALAI_ALLOW_INDEXING: 'false',
      QALAI_CONTENT_MODE: 'demo',
    },
    stdio: 'inherit',
  },
)

const waitForExit = (child: ChildProcess) =>
  new Promise<number>((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code) => resolve(code ?? 1))
  })

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

const waitUntilReady = async () => {
  const deadline = Date.now() + 120_000

  while (Date.now() < deadline) {
    if (server.exitCode != null) {
      throw new Error(`Local QALAI server stopped before E2E started (${server.exitCode}).`)
    }

    try {
      const response = await fetch(baseURL)
      if (response.status < 500) return
    } catch {
      // The server is still starting.
    }

    await delay(500)
  }

  throw new Error(`Local QALAI server did not become ready at ${baseURL}.`)
}

let stopped = false
const stopServer = async () => {
  if (stopped || server.pid == null || server.exitCode != null) return
  stopped = true

  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
      stdio: 'ignore',
    })
    await waitForExit(killer).catch(() => 1)
    return
  }

  try {
    process.kill(-server.pid, 'SIGTERM')
  } catch {
    // The process already stopped between the checks above.
  }
}

const run = async () => {
  await waitUntilReady()

  const playwright = spawn(
    process.execPath,
    [path.join('node_modules', '@playwright', 'test', 'cli.js'), 'test'],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        QALAI_E2E_BASE_URL: baseURL,
        QALAI_E2E_EXTERNAL_SERVER: 'true',
      },
      stdio: 'inherit',
    },
  )

  return waitForExit(playwright)
}

process.once('SIGINT', () => {
  void stopServer().finally(() => process.exit(130))
})

run()
  .then(async (code) => {
    await stopServer()
    process.exit(code)
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await stopServer()
    process.exit(1)
  })
