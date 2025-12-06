import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const aesthetic_vibe = searchParams.get('aesthetic_vibe')
    const platform = searchParams.get('platform')

    // Build query
    let query = supabase
      .from('mockups')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (aesthetic_vibe) {
      query = query.eq('aesthetic_vibe', aesthetic_vibe)
    }

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data: mockups, error } = await query

    if (error) {
      console.error('Error fetching mockups:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check which mockups are saved by this user
    const { data: savedMockups } = await supabase
      .from('saved_mockups')
      .select('mockup_id')
      .eq('user_id', user.id)

    const savedMockupIds = new Set(savedMockups?.map((s) => s.mockup_id) || [])

    const mockupsWithSaved = mockups?.map((mockup) => ({
      ...mockup,
      is_saved: savedMockupIds.has(mockup.id),
    }))

    return NextResponse.json({ mockups: mockupsWithSaved || [] })
  } catch (error) {
    console.error('Error in GET /api/mockups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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
          setAll() {},
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { logo_url, aesthetic_vibe, platform, content_type, title } = body

    // Generate mock image URLs (in production, this would call your AI/image generation service)
    const mockImageUrls = [
      '/image1.png',
      '/image2.png',
      '/image3.png',
      '/image4.png',
      '/image5.png',
      '/image6.png',
    ]

    const { data: mockup, error } = await supabase
      .from('mockups')
      .insert({
        user_id: user.id,
        title: title || `Mockup Pack - ${aesthetic_vibe}`,
        logo_url,
        aesthetic_vibe,
        platform,
        content_type,
        image_urls: mockImageUrls,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating mockup:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      mockup,
      mockups: mockImageUrls.map((url, index) => ({
        id: `${mockup.id}-${index}`,
        title: `${mockup.title} - ${index + 1}`,
        image_urls: [url],
        aesthetic_vibe: mockup.aesthetic_vibe,
        platform: mockup.platform,
        is_saved: false,
      })),
    })
  } catch (error) {
    console.error('Error in POST /api/mockups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

