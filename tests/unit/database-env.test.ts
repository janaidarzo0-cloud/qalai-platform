import { describe, expect, it } from 'vitest'

import { isPayloadDBPushEnabled, requireDirectDatabaseURL } from '@/lib/env/database'

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
})
