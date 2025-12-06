import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // Redirect from app.tasy.ai to tasy.ai for privacy and terms
  if (hostname === 'app.tasy.ai' || hostname === 'www.app.tasy.ai') {
    if (pathname === '/privacy-policy') {
      return NextResponse.redirect('https://tasy.ai/privacy', 301)
    }
    if (pathname === '/terms-of-use' || pathname === '/terms') {
      return NextResponse.redirect('https://tasy.ai/terms', 301)
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it so that users
  // never get logged in.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - require authentication
  const protectedRoutes = [
    '/dashboard',
    '/discover',
    '/saved',
    '/editor',
    '/brand',
    '/settings',
    '/apply',
    '/subscription',
    '/create',
    '/content',
  ]
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Public routes
  const publicRoutes = ['/', '/sign-in', '/sign-up', '/reset-password', '/callback', '/confirm', '/error', '/onboarding']
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/')

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(url)
    // Copy cookies from supabaseResponse to redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/discover'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse
}

