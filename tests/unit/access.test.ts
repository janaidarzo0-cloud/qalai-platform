import { describe, expect, it } from 'vitest'

import { authenticated } from '@/access/authenticated'
import {
  adminCanDeleteDraft,
  canEditContent,
  canUpdateEditorialContent,
  canUpdateSource,
} from '@/access/content'
import { adminOnly, adminOrSelf, getUserRoles, hasAnyRole, reviewerOrAdmin } from '@/access/roles'
import { SiteSettings } from '@/globals/SiteSettings'
import { CalculatorRuleSets } from '@/collections/CalculatorRuleSets'
import { Scenarios } from '@/collections/Scenarios'

const accessArgs = (roles?: string[], id = 'user-1') =>
  ({
    req: {
      user: roles ? { id, roles } : null,
    },
  }) as never

describe('role helpers', () => {
  it.each([
    [undefined, []],
    [[], []],
    [['unknown'], []],
    [
      ['editor', 'admin'],
      ['editor', 'admin'],
    ],
  ])('normalizes %j roles', (roles, expected) => {
    expect(getUserRoles(roles ? { roles } : null)).toEqual(expected)
  })

  it('uses the strongest role in a multi-role user', () => {
    const user = { roles: ['editor', 'admin'] }
    expect(hasAnyRole(user, ['admin'])).toBe(true)
    expect(hasAnyRole(user, ['reviewer'])).toBe(false)
  })

  it('separates admin, reviewer and content-editor authority', () => {
    expect(adminOnly(accessArgs(['admin']))).toBe(true)
    expect(adminOnly(accessArgs(['reviewer']))).toBe(false)
    expect(reviewerOrAdmin(accessArgs(['reviewer']))).toBe(true)
    expect(reviewerOrAdmin(accessArgs(['editor']))).toBe(false)
    expect(canEditContent(accessArgs(['editor']))).toBe(true)
    expect(canEditContent(accessArgs())).toBe(false)
  })
})

describe('document access filters', () => {
  it('lets editorial roles prepare drafts while hooks protect publication', () => {
    expect(canUpdateEditorialContent(accessArgs(['editor']))).toBe(true)
    expect(canUpdateEditorialContent(accessArgs(['reviewer']))).toBe(true)
    expect(canUpdateEditorialContent(accessArgs(['admin']))).toBe(true)
  })

  it('lets editors update only secondary Sources', () => {
    expect(canUpdateSource(accessArgs(['editor']))).toEqual({
      trustTier: { equals: 'secondary' },
    })
    expect(canUpdateSource(accessArgs(['reviewer']))).toBe(true)
  })

  it('allows only admins to delete drafts', () => {
    expect(adminCanDeleteDraft(accessArgs(['admin']))).toEqual({
      _status: { equals: 'draft' },
    })
    expect(adminCanDeleteDraft(accessArgs(['reviewer']))).toBe(false)
  })

  it('limits non-admin user access to their own record', () => {
    expect(adminOrSelf(accessArgs(['editor'], 'user-7'))).toEqual({
      id: { equals: 'user-7' },
    })
    expect(adminOrSelf(accessArgs(['admin']))).toBe(true)
    expect(adminOrSelf(accessArgs())).toBe(false)
  })

  it('keeps the generic regulated-content API behind authentication', () => {
    expect(authenticated(accessArgs())).toBe(false)
    expect(authenticated(accessArgs(['editor']))).toBe(true)
    expect(Scenarios.access?.read?.(accessArgs())).toBe(false)
    expect(Scenarios.access?.read?.(accessArgs(['reviewer']))).toBe(true)
    expect(CalculatorRuleSets.access?.read?.(accessArgs())).toBe(false)
    expect(CalculatorRuleSets.access?.read?.(accessArgs(['editor']))).toBe(true)
  })
})

describe('Site Settings boundary', () => {
  const editorialContact = SiteSettings.fields.find(
    (field) => 'name' in field && field.name === 'editorialContact',
  )
  const editorialContactAccess =
    editorialContact && 'access' in editorialContact ? editorialContact.access : undefined

  it('keeps editorialContact out of anonymous responses', () => {
    expect(editorialContact && 'access' in editorialContact).toBe(true)
    expect(editorialContactAccess?.read?.(accessArgs())).toBe(false)
    expect(editorialContactAccess?.read?.(accessArgs(['editor']))).toBe(true)
  })

  it('allows only admins to update global settings', () => {
    expect(SiteSettings.access?.update?.(accessArgs(['admin']))).toBe(true)
    expect(SiteSettings.access?.update?.(accessArgs(['reviewer']))).toBe(false)
  })
})
