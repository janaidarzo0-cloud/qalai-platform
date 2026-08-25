import { describe, expect, it, vi } from 'vitest'

import { Users } from '@/collections/Users'
import {
  blockBulkUserMutation,
  enforceFirstAdmin,
  protectLastAdmin,
  protectLastAdminDelete,
} from '@/hooks/users'

const createRequest = ({
  adminCount = 1,
  targetRoles = ['admin'],
  totalDocs = 0,
  user = null,
}: {
  adminCount?: number
  targetRoles?: string[]
  totalDocs?: number
  user?: null | { id: string; roles: string[] }
}) => {
  const execute = vi.fn(async () => undefined)

  return {
    payload: {
      count: vi.fn(async ({ where }: { where?: unknown }) => ({
        totalDocs: where ? adminCount : totalDocs,
      })),
      db: {
        sessions: {
          'test-transaction': { db: { execute } },
        },
      },
      findByID: vi.fn(async () => ({ id: 'admin-1', roles: targetRoles })),
    },
    transactionID: 'test-transaction',
    user,
  }
}

describe('first-user bootstrap', () => {
  const createAccess = Users.access?.create

  it('keeps normal anonymous user creation closed', async () => {
    expect(typeof createAccess).toBe('function')
    if (typeof createAccess !== 'function') return

    expect(createAccess({ req: createRequest({ totalDocs: 0 }) } as never)).toBe(false)
  })

  it('allows admins, but not editors or reviewers, to create later users', async () => {
    if (typeof createAccess !== 'function') throw new Error('Users create access is not configured')

    expect(
      createAccess({
        req: createRequest({ user: { id: 'admin', roles: ['admin'] } }),
      } as never),
    ).toBe(true)
    expect(
      createAccess({
        req: createRequest({ user: { id: 'editor', roles: ['editor'] } }),
      } as never),
    ).toBe(false)
    expect(
      createAccess({
        req: createRequest({ user: { id: 'reviewer', roles: ['reviewer'] } }),
      } as never),
    ).toBe(false)
  })

  it('forces the first user to admin regardless of submitted roles', async () => {
    const req = createRequest({ totalDocs: 0 })
    const data = await enforceFirstAdmin({
      data: { roles: ['editor', 'reviewer'] },
      operation: 'create',
      req,
    } as never)

    expect(data).toMatchObject({ roles: ['admin'] })
    const execute = req.payload.db.sessions['test-transaction'].db.execute
    expect(execute).toHaveBeenCalledOnce()
    expect(execute.mock.invocationCallOrder[0]).toBeLessThan(
      req.payload.count.mock.invocationCallOrder[0] as number,
    )
  })

  it('fails closed when bootstrap is not running in a database transaction', async () => {
    const req = createRequest({ totalDocs: 0 })
    req.transactionID = 'missing-transaction'

    await expect(
      enforceFirstAdmin({ data: {}, operation: 'create', req } as never),
    ).rejects.toThrow('транзакциясында')
    expect(req.payload.count).not.toHaveBeenCalled()
  })

  it('rechecks collection emptiness in the hook', async () => {
    await expect(
      enforceFirstAdmin({
        data: {},
        operation: 'create',
        req: createRequest({ totalDocs: 1 }),
      } as never),
    ).rejects.toThrow('Алғашқы әкімші')
  })

  it('does not turn a count failure into bootstrap access', async () => {
    const req = createRequest({})
    req.payload.count = vi.fn(async () => {
      throw new Error('database unavailable')
    }) as never

    await expect(
      enforceFirstAdmin({ data: {}, operation: 'create', req } as never),
    ).rejects.toThrow('database unavailable')
  })
})

describe('role escalation and last-admin protection', () => {
  const rolesField = Users.fields.find((field) => 'name' in field && field.name === 'roles')
  const rolesAccess = rolesField && 'access' in rolesField ? rolesField.access : undefined

  it('disables bulk user edits and deletes, including override-access calls', () => {
    expect(Users.disableBulkEdit).toBe(true)
    expect(Users.disableBulkDelete).toBe(true)
    expect(() =>
      blockBulkUserMutation({ args: { where: {} }, operation: 'update' } as never),
    ).toThrow('жаппай')
    expect(() =>
      blockBulkUserMutation({ args: { where: {} }, operation: 'delete' } as never),
    ).toThrow('жаппай')
    expect(
      blockBulkUserMutation({ args: { id: 'admin-1' }, operation: 'update' } as never),
    ).toMatchObject({ id: 'admin-1' })
  })

  it('exposes role writes only to admins', () => {
    expect(rolesField && 'access' in rolesField).toBe(true)
    expect(
      rolesAccess?.update?.({
        req: createRequest({ user: { id: 'editor', roles: ['editor'] } }),
      } as never),
    ).toBe(false)
    expect(
      rolesAccess?.update?.({
        req: createRequest({ user: { id: 'admin', roles: ['admin'] } }),
      } as never),
    ).toBe(true)
  })

  it('blocks demoting the last admin', async () => {
    await expect(
      protectLastAdmin({
        data: { roles: ['editor'] },
        operation: 'update',
        originalDoc: { id: 'admin-1', roles: ['admin'] },
        req: createRequest({ adminCount: 1, user: { id: 'admin-1', roles: ['admin'] } }),
      } as never),
    ).rejects.toThrow('Соңғы әкімшінің')
  })

  it('allows demotion when another admin remains', async () => {
    await expect(
      protectLastAdmin({
        data: { roles: ['editor'] },
        operation: 'update',
        originalDoc: { id: 'admin-1', roles: ['admin'] },
        req: createRequest({ adminCount: 2, user: { id: 'admin-1', roles: ['admin'] } }),
      } as never),
    ).resolves.toMatchObject({ roles: ['editor'] })
  })

  it('serializes every role mutation, including promotion', async () => {
    const req = createRequest({
      adminCount: 1,
      targetRoles: ['editor'],
      user: { id: 'admin-1', roles: ['admin'] },
    })

    await expect(
      protectLastAdmin({
        data: { roles: ['admin'] },
        operation: 'update',
        originalDoc: { id: 'editor-1', roles: ['editor'] },
        req,
      } as never),
    ).resolves.toMatchObject({ roles: ['admin'] })
    expect(req.payload.db.sessions['test-transaction'].db.execute).toHaveBeenCalledOnce()
    expect(req.payload.count).not.toHaveBeenCalled()
  })

  it('does not interpret a partial profile update as admin demotion', async () => {
    await expect(
      protectLastAdmin({
        data: { name: 'Updated name' },
        operation: 'update',
        originalDoc: { id: 'admin-1', roles: ['admin'] },
        req: createRequest({ adminCount: 1, user: { id: 'admin-1', roles: ['admin'] } }),
      } as never),
    ).resolves.toMatchObject({ name: 'Updated name' })
  })

  it('blocks deleting the last admin', async () => {
    const req = createRequest({
      adminCount: 1,
      user: { id: 'admin-1', roles: ['admin'] },
    })

    await expect(
      protectLastAdminDelete({
        id: 'admin-1',
        req,
      } as never),
    ).rejects.toThrow('Соңғы әкімшіні')
    expect(
      req.payload.db.sessions['test-transaction'].db.execute.mock.invocationCallOrder[0],
    ).toBeLessThan(req.payload.findByID.mock.invocationCallOrder[0] as number)
  })

  it('serializes deletion of a non-admin target', async () => {
    const req = createRequest({
      targetRoles: ['editor'],
      user: { id: 'admin-1', roles: ['admin'] },
    })

    await expect(protectLastAdminDelete({ id: 'editor-1', req } as never)).resolves.toBeUndefined()
    expect(req.payload.db.sessions['test-transaction'].db.execute).toHaveBeenCalledOnce()
    expect(req.payload.count).not.toHaveBeenCalled()
  })
})
