import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/discover(.*)',
  '/editor(.*)',
  '/add-key(.*)',
  '/saved(.*)',
  '/settings(.*)',
  '/brand(.*)',
  '/apply(.*)',
  '/onboarding(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;
  const pathname = url.pathname;
  
  // Skip protection for public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Protect protected routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Handle SSO callback - redirect authenticated users to dashboard
  if (pathname.startsWith('/sign-in/sso-callback')) {
    if (userId) {
      const redirectUrl = url.searchParams.get('redirect_url') || url.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }
  
  // Redirect authenticated users away from sign-in/sign-up pages (except SSO callback)
  if (userId && (pathname === '/sign-in' || pathname === '/sign-up') && !pathname.includes('sso-callback')) {
    const redirectUrl = url.searchParams.get('redirect_url') || url.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

