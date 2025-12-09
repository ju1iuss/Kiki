import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, custom_description } = body

    const supabase = await createClient()
    
    const updateData: { title?: string; description?: string; custom_description?: string | null } = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (custom_description !== undefined) updateData.custom_description = custom_description || null

    const { data: updatedKey, error } = await supabase
      .from('physical_keys')
      .update(updateData)
      .eq('id', id)
      .eq('clerk_user_id', user.id) // Ensure user owns the key
      .select()
      .single()

    if (error) {
      console.error('Error updating key:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, key: updatedKey })
  } catch (error) {
    console.error('Error in PATCH /api/keys/[id]:', error)
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
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('physical_keys')
      .delete()
      .eq('id', id)
      .eq('clerk_user_id', user.id) // Ensure user owns the key

    if (error) {
      console.error('Error deleting key:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/keys/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

