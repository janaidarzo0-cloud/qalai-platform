type DatabaseEnvironment = Record<string, string | undefined>

export const isPayloadDBPushEnabled = (environment: DatabaseEnvironment = process.env) =>
  environment.PAYLOAD_DB_PUSH === 'true'

export const requireDirectDatabaseURL = (environment: DatabaseEnvironment = process.env) => {
  const value = environment.DATABASE_DIRECT_URL
  if (!value) throw new Error('DATABASE_DIRECT_URL is required for database migrations.')

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('DATABASE_DIRECT_URL must be a valid PostgreSQL URL.')
  }

  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error('DATABASE_DIRECT_URL must use the postgres: or postgresql: protocol.')
  }

  if (!url.hostname || !url.pathname || url.pathname === '/') {
    throw new Error('DATABASE_DIRECT_URL must include a host and database name.')
  }

  return value
}
