import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Protected paths - all paths except these public ones
  const publicPaths = ['/', '/login', '/register', '/api', '/_next', '/favicon.ico']
  const { pathname } = request.nextUrl
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(path => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  })
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Check for userlogin cookie
  const userlogin = request.cookies.get('userlogin')
  
  // If no userlogin cookie, redirect to login
  if (!userlogin || !userlogin.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Try to parse the cookie data
  try {
    const userData = JSON.parse(userlogin.value)
    if (!userData.user || !userData.session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch (error) {
    // Invalid cookie data, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 