import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { requireDirectDatabaseURL } from '@/lib/env/database'

const databaseURL = requireDirectDatabaseURL()
const payloadBin = fileURLToPath(new URL('../../node_modules/payload/bin.js', import.meta.url))

const child = spawn(process.execPath, [payloadBin, 'migrate'], {
  env: {
    ...process.env,
    DATABASE_URL: databaseURL,
    PAYLOAD_DB_PUSH: 'false',
  },
  stdio: 'inherit',
})

child.on('error', (error) => {
  console.error('Failed to start Payload migrations.', error)
  process.exitCode = 1
})

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Payload migrations stopped by signal ${signal}.`)
    process.exitCode = 1
    return
  }

  process.exitCode = code ?? 1
})
