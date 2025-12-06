import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: mockup, error } = await supabase
      .from('mockups')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching mockup:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!mockup) {
      return NextResponse.json({ error: 'Mockup not found' }, { status: 404 })
    }

    // Check if saved
    const { data: saved } = await supabase
      .from('saved_mockups')
      .select('id')
      .eq('user_id', user.id)
      .eq('mockup_id', id)
      .single()

    return NextResponse.json({
      mockup: {
        ...mockup,
        is_saved: !!saved,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/mockups/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify ownership
    const { data: existingMockup } = await supabase
      .from('mockups')
      .select('user_id, aesthetic_vibe, platform')
      .eq('id', id)
      .single()

    if (!existingMockup || existingMockup.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { regenerate, ...updateData } = body

    // If regenerating, create new variations
    if (regenerate) {
      const mockImageUrls = [
        '/image7.png',
        '/image8.png',
        '/image9.png',
        '/image10.png',
      ]

      return NextResponse.json({
        mockups: mockImageUrls.map((url, index) => ({
          id: `${id}-new-${index}`,
          title: `Variation ${index + 1}`,
          image_urls: [url],
          aesthetic_vibe: existingMockup.aesthetic_vibe,
          platform: existingMockup.platform,
          is_saved: false,
        })),
      })
    }

    const { data: mockup, error } = await supabase
      .from('mockups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating mockup:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ mockup })
  } catch (error) {
    console.error('Error in PATCH /api/mockups/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify ownership
    const { data: existingMockup } = await supabase
      .from('mockups')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingMockup || existingMockup.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('mockups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting mockup:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/mockups/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

