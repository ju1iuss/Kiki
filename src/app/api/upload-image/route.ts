import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Get Clerk session token to pass to Supabase
    const { getToken, userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Clerk token using JWT template (named 'supabase' - you'll create this in Clerk dashboard)
    const clerkToken = await getToken({ template: 'supabase' })
    
    if (!clerkToken) {
      console.error('Failed to get Clerk token for Supabase')
      return NextResponse.json(
        { error: 'Authentication error: Unable to generate Supabase token. Make sure you created a JWT template named "supabase" in Clerk dashboard.' },
        { status: 500 }
      )
    }

    // Create Supabase client with Clerk JWT token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Use anon key + Clerk JWT for authenticated requests (RLS will handle permissions)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const headers = new Headers(options?.headers)
          headers.set('Authorization', `Bearer ${clerkToken}`)
          return fetch(url, { ...options, headers })
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const { imageData, fileName } = body

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Convert data URL to buffer/blob
    let buffer: Buffer
    let contentType: string
    
    if (imageData.startsWith('data:')) {
      // Extract MIME type from data URL
      const matches = imageData.match(/data:([^;]+);base64,/)
      const mimeType = matches?.[1] || 'image/jpeg'
      
      // Convert base64 to buffer (Node.js environment)
      const base64Data = imageData.split(',')[1]
      buffer = Buffer.from(base64Data, 'base64')
      contentType = mimeType
    } else {
      // If it's already a URL, fetch it
      const response = await fetch(imageData)
      const arrayBuffer = await response.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      contentType = response.headers.get('content-type') || 'image/jpeg'
    }

    // Ensure content type is valid for keys bucket (image/jpeg, image/png, image/jpg, image/webp)
    if (!contentType.startsWith('image/')) {
      contentType = 'image/jpeg'
    }
    // Normalize jpg to jpeg
    if (contentType === 'image/jpg') {
      contentType = 'image/jpeg'
    }

    // Generate unique filename using Clerk user ID
    const fileExt = fileName?.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const uniqueFileName = `${userId}/${timestamp}-${randomStr}.${fileExt}`

    // Determine bucket based on file name or use keys bucket for key images
    const bucketName = fileName?.includes('key') || fileName?.includes('scanned') || fileName?.includes('camera-capture') ? 'keys' : 'brand-assets'

    // Upload to Supabase storage (use buffer directly)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, buffer, {
        contentType: contentType,
        upsert: false,
      })

    if (error) {
      console.error('Error uploading to storage:', {
        error: error.message,
        bucket: bucketName,
        fileName: uniqueFileName,
        contentType: contentType,
        bufferSize: buffer.length,
      })
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
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

