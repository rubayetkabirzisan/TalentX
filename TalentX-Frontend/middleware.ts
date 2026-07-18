import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Note: Since this is a client-heavy app storing auth in localStorage,
  // true strict RBAC is challenging at the edge without cookies.
  // But we can check for an auth cookie if we set one, or just let client components handle it.
  // For demonstration, we assume we have a basic cookie or we redirect to login if we can detect it.
  
  // Since we rely on localStorage, middleware cannot read it directly.
  // We will pass this requirement. Real RBAC hardening in a localStorage app
  // must be done in a top-level Layout component (which we already partially have in role guards).
  // I will add a Client-Side RoleGuard layout instead.
  return NextResponse.next()
}

export const config = {
  matcher: ['/employer/:path*', '/talent/:path*'],
}
