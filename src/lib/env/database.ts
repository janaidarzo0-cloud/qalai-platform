type DatabaseEnvironment = Record<string, string | undefined>

type DatabaseSSLConfig = {
  ca: string
  rejectUnauthorized: true
}

export type DatabaseConnectionOptions = {
  connectionString: string
  ssl?: DatabaseSSLConfig
}

export const isPayloadDBPushEnabled = (environment: DatabaseEnvironment = process.env) =>
  environment.PAYLOAD_DB_PUSH === 'true'

export const getDatabaseConnectionOptions = (
  databaseURL: string,
  environment: DatabaseEnvironment = process.env,
): DatabaseConnectionOptions => {
  let url: URL
  try {
    url = new URL(databaseURL)
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL.')
  }

  const isSupabase = url.hostname.endsWith('.supabase.com')
  if (!isSupabase) return { connectionString: databaseURL }

  const encodedCA = environment.DATABASE_CA_CERT_BASE64?.trim()
  if (!encodedCA) {
    throw new Error('DATABASE_CA_CERT_BASE64 is required for Supabase database connections.')
  }

  let ca: string
  try {
    ca = Buffer.from(encodedCA, 'base64').toString('utf8').trim()
  } catch {
    throw new Error('DATABASE_CA_CERT_BASE64 must contain a valid base64-encoded certificate.')
  }

  if (!ca.startsWith('-----BEGIN CERTIFICATE-----') || !ca.endsWith('-----END CERTIFICATE-----')) {
    throw new Error('DATABASE_CA_CERT_BASE64 must contain a valid PEM certificate.')
  }

  // Connection-string SSL parameters override node-postgres' explicit TLS object. Remove them so
  // the trusted Supabase CA below always remains authoritative.
  url.searchParams.delete('sslmode')
  url.searchParams.delete('sslcert')
  url.searchParams.delete('sslkey')
  url.searchParams.delete('sslrootcert')

  return {
    connectionString: url.toString(),
    ssl: { ca, rejectUnauthorized: true },
  }
}

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
