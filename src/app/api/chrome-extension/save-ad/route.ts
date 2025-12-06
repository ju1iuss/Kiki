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

    // Get auth from headers or cookies
    let authHeader = request.headers.get('Authorization')
    
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
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          authHeader = `Bearer ${session.access_token}`
        }
      }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Get request body
    const body = await request.json()
    const { originalAd, adaptedAd, sourceUrl } = body

    // Save to mockups table
    const { data: mockup, error } = await supabase
      .from('mockups')
      .insert({
        user_id: user.id,
        title: originalAd.headline || 'Generated Ad',
        platform: sourceUrl?.includes('pinterest') ? 'pinterest' : 'facebook',
        content_type: 'ad',
        image_urls: adaptedAd.image ? [adaptedAd.image] : [],
        logo_url: null,
        aesthetic_vibe: null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving mockup:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: true, mockup },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Chrome extension save-ad error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

