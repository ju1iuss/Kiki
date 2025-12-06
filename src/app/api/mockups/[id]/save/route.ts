import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if mockup exists
    const { data: mockup } = await supabase
      .from('mockups')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!mockup) {
      return NextResponse.json({ error: 'Mockup not found' }, { status: 404 })
    }

    // Insert saved mockup (unique constraint will prevent duplicates)
    const { data, error } = await supabase
      .from('saved_mockups')
      .insert({
        user_id: user.id,
        mockup_id: params.id,
      })
      .select()
      .single()

    if (error) {
      // If already saved, return success
      if (error.code === '23505') {
        return NextResponse.json({ success: true, saved: true })
      }
      console.error('Error saving mockup:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, saved: true })
  } catch (error) {
    console.error('Error in POST /api/mockups/[id]/save:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('saved_mockups')
      .delete()
      .eq('user_id', user.id)
      .eq('mockup_id', params.id)

    if (error) {
      console.error('Error unsaving mockup:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, saved: false })
  } catch (error) {
    console.error('Error in DELETE /api/mockups/[id]/save:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

