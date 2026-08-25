import { sql } from '@payloadcms/db-postgres'
import type { PayloadRequest } from 'payload'

export const ADMIN_SET_LOCK_KEY = 71_140_001
export const TRUST_GRAPH_LOCK_KEY = 71_140_002

export const acquireTransactionLock = async (
  req: PayloadRequest,
  lockKey: number,
  errorMessage: string,
) => {
  const transactionID = req.transactionID ? await req.transactionID : null
  const sessions = req.payload.db.sessions as
    Record<string, { db: { execute: (query: unknown) => Promise<unknown> } }> | undefined
  const session = transactionID == null ? null : sessions?.[String(transactionID)]

  if (!session) throw new Error(errorMessage)

  await session.db.execute(sql`select pg_advisory_xact_lock(${lockKey})`)
}
