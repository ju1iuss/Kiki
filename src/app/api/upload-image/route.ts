import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
    const { imageData, fileName } = body

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Convert data URL to blob if needed
    let blob: Blob
    if (imageData.startsWith('data:')) {
      const response = await fetch(imageData)
      blob = await response.blob()
    } else {
      // If it's already a URL, fetch it
      const response = await fetch(imageData)
      blob = await response.blob()
    }

    // Generate unique filename
    const fileExt = fileName?.split('.').pop() || 'png'
    const uniqueFileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Supabase storage (using brand-assets bucket)
    const { data, error } = await supabase.storage
      .from('brand-assets')
      .upload(uniqueFileName, blob, {
        contentType: blob.type,
        upsert: false,
      })

    if (error) {
      console.error('Error uploading to storage:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(uniqueFileName)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: uniqueFileName,
    })
  } catch (error) {
    console.error('Error in POST /api/upload-image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

