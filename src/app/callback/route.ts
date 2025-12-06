import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect') || '/discover'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Images will be saved via the auth state change listener in step-4-signup.tsx
      // or via step-10-dashboard.tsx when redirecting to dashboard
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/error?error=auth_callback_error', request.url))
}

