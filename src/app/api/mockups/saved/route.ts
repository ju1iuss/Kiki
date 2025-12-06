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

    // Get saved mockup IDs first
    const { data: savedIds, error: savedError } = await supabase
      .from('saved_mockups')
      .select('mockup_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (savedError) {
      console.error('Error fetching saved mockup IDs:', savedError)
      return NextResponse.json({ error: savedError.message }, { status: 500 })
    }

    if (!savedIds || savedIds.length === 0) {
      return NextResponse.json({ mockups: [] })
    }

    // Get the actual mockups
    const mockupIds = savedIds.map((s) => s.mockup_id)
    const { data: mockups, error } = await supabase
      .from('mockups')
      .select('*')
      .in('id', mockupIds)

    if (error) {
      console.error('Error fetching saved mockups:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mark all as saved
    const mockupsWithSaved = mockups?.map((mockup) => ({
      ...mockup,
      is_saved: true,
    })) || []

    return NextResponse.json({ mockups })
  } catch (error) {
    console.error('Error in GET /api/mockups/saved:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

