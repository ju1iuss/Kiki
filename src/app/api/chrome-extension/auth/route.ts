import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    let authHeader = request.headers.get('Authorization')
    
    // If no Authorization header, try to get token from cookies
    if (!authHeader) {
      // First check for Cookie header sent by extension
      const cookieHeader = request.headers.get('Cookie')
      
      // Parse cookies to find Supabase auth token
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim())
        for (const cookie of cookies) {
          // Look for sb-*-auth-token cookie
          if (cookie.startsWith('sb-') && cookie.includes('-auth-token=')) {
            try {
              const [, value] = cookie.split('=')
              const decoded = decodeURIComponent(value)
              const parsed = JSON.parse(decoded)
              if (parsed.access_token) {
                authHeader = `Bearer ${parsed.access_token}`
                break
              }
            } catch {
              // Continue to next method
            }
          }
        }
      }
      
      // If still no auth, try from request cookies (browser-sent)
      if (!authHeader) {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll() {
                // No-op for this read-only use case
              },
            },
          }
        )

        // Get session from cookies
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          authHeader = `Bearer ${session.access_token}`
        }
      }
    }

    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization found' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Forward request to Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chrome-auth`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Chrome extension auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

