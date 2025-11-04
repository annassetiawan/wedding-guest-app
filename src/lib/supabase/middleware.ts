import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  console.log('[Middleware] Processing request:', request.nextUrl.pathname)

  // Create response object first
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with explicit cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on request (for current middleware execution)
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Set cookie on response (for browser)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Remove cookie from response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session - this updates cookies but should NOT cause navigation
  // This is critical: getSession() refreshes auth state without redirecting
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('[Middleware] Session exists:', !!session)
  console.log('[Middleware] Current path:', request.nextUrl.pathname)

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register']
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname)
  const isInvitationPath = request.nextUrl.pathname.startsWith('/invitation')

  console.log('[Middleware] Is public path:', isPublicPath)
  console.log('[Middleware] Is invitation path:', isInvitationPath)

  // ONLY redirect to login if:
  // 1. No session exists
  // 2. NOT a public path
  // 3. NOT an invitation path
  if (!session && !isPublicPath && !isInvitationPath) {
    console.log('[Middleware] No session, redirecting to login')
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    console.log('[Middleware] Already authenticated, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For all other cases (authenticated users on protected pages, public access, etc.)
  // NEVER redirect - just let them through with refreshed session cookies
  console.log('[Middleware] Allowing access to:', request.nextUrl.pathname)
  return response
}
