import { describe, expect, it } from 'vitest'

import {
  getDatabaseConnectionOptions,
  isPayloadDBPushEnabled,
  requireDirectDatabaseURL,
} from '@/lib/env/database'

const certificate = [
  '-----BEGIN CERTIFICATE-----',
  'QALAI-test-certificate',
  '-----END CERTIFICATE-----',
].join('\n')

describe('database environment safety', () => {
  it('enables schema push only for an exact explicit opt-in', () => {
    expect(isPayloadDBPushEnabled({ PAYLOAD_DB_PUSH: 'true' })).toBe(true)
    expect(isPayloadDBPushEnabled({ PAYLOAD_DB_PUSH: 'TRUE' })).toBe(false)
    expect(isPayloadDBPushEnabled({ NODE_ENV: 'development' })).toBe(false)
  })

  it('requires a complete PostgreSQL direct URL', () => {
    expect(
      requireDirectDatabaseURL({
        DATABASE_DIRECT_URL: 'postgresql://qalai:secret@db.example.test:5432/qalai',
      }),
    ).toBe('postgresql://qalai:secret@db.example.test:5432/qalai')

    expect(() => requireDirectDatabaseURL({})).toThrow('DATABASE_DIRECT_URL')
    expect(() =>
      requireDirectDatabaseURL({ DATABASE_DIRECT_URL: 'https://db.example.test/qalai' }),
    ).toThrow('postgres')
    expect(() =>
      requireDirectDatabaseURL({ DATABASE_DIRECT_URL: 'postgresql://db.example.test' }),
    ).toThrow('database name')
  })

  it('uses the trusted CA and removes conflicting URL SSL options for Supabase', () => {
    const result = getDatabaseConnectionOptions(
      'postgresql://qalai:secret@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require',
      { DATABASE_CA_CERT_BASE64: Buffer.from(certificate).toString('base64') },
    )

    expect(result.connectionString).not.toContain('sslmode')
    expect(result.ssl).toEqual({ ca: certificate, rejectUnauthorized: true })
  })

  it('fails closed when a Supabase CA is missing or malformed', () => {
    const url = 'postgresql://qalai:secret@db.supabase.com:5432/postgres'

    expect(() => getDatabaseConnectionOptions(url, {})).toThrow('DATABASE_CA_CERT_BASE64')
    expect(() =>
      getDatabaseConnectionOptions(url, {
        DATABASE_CA_CERT_BASE64: Buffer.from('not a certificate').toString('base64'),
      }),
    ).toThrow('valid PEM certificate')
  })

  it('does not require TLS configuration for non-Supabase development databases', () => {
    expect(
      getDatabaseConnectionOptions('postgresql://qalai:secret@localhost:5432/qalai', {}),
    ).toEqual({
      connectionString: 'postgresql://qalai:secret@localhost:5432/qalai',
    })
  })
})
