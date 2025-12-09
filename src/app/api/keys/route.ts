import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get Clerk user ID and map to Supabase user if needed
    // For now, we'll use Clerk userId directly if keys table uses it
    // Otherwise, we need to find the Supabase user by Clerk ID
    
    const { data: keys, error } = await supabase
      .from('physical_keys')
      .select('*')
      .eq('clerk_user_id', user.id) // Using Clerk user ID
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching keys:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ keys: keys || [] })
  } catch (error) {
    console.error('Error in GET /api/keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, title, description, custom_description, image_url } = body

    if (!key || !title) {
      return NextResponse.json(
        { error: 'Key and title are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Save the key with description (can be JSON string from OpenAI analysis or plain text)
    const { data: newKey, error } = await supabase
      .from('physical_keys')
      .insert({
        clerk_user_id: user.id, // Using Clerk user ID
        key: key,
        title: title,
        description: description || null, // Can be JSON string from OpenAI or plain text
        custom_description: custom_description || null, // User's custom description
        image_url: image_url || null,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating key:', error)
      console.error('Attempted to save:', { clerk_user_id: user.id, title, description: description?.substring(0, 100) })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Log success for debugging
    console.log('Key saved successfully:', { id: newKey.id, title, hasDescription: !!newKey.description })

    return NextResponse.json({ success: true, key: newKey })
  } catch (error) {
    console.error('Error in POST /api/keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

