import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    let authHeader = request.headers.get('Authorization')
    
    // If no Authorization header, try to get token from cookies
    if (!authHeader) {
      const cookieHeader = request.headers.get('Cookie')
      
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim())
        for (const cookie of cookies) {
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
              // Continue
            }
          }
        }
      }
      
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
                // No-op
              },
            },
          }
        )

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

    // Get request body
    const body = await request.json()

    // Forward request to Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chrome-adapt-ad`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Chrome extension adapt-ad error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

