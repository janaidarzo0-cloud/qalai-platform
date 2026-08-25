import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isIndexingAllowed } from '@/lib/site'

const noindexDirective = 'noindex, nofollow, noarchive'
const privateRoutePrefixes = ['/admin', '/api', '/preview']

const isPrivateRoute = (pathname: string) =>
  privateRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  if (!isIndexingAllowed() || isPrivateRoute(request.nextUrl.pathname)) {
    response.headers.set('X-Robots-Tag', noindexDirective)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
