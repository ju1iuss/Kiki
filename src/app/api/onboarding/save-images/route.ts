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
    const { images, logo } = body

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Take only the first 3 images
    const imagesToSave = images.slice(0, 3)

    // Check if user already has onboarding mockups to prevent duplicates
    const { data: existingMockups } = await supabase
      .from('mockups')
      .select('id, image_urls')
      .eq('user_id', user.id)
      .like('title', 'Onboarding Mockup%')
      .limit(3)

    // If user already has onboarding mockups, return them instead of creating duplicates
    if (existingMockups && existingMockups.length > 0) {
      return NextResponse.json({
        success: true,
        mockups: existingMockups,
        count: existingMockups.length,
        alreadyExists: true,
      })
    }

    // Save each image as a separate mockup (as the first 3 content pieces)
    const savedMockups = []
    
    for (let i = 0; i < imagesToSave.length; i++) {
      const imageUrl = imagesToSave[i]
      
      // Ensure imageUrl is a valid string
      if (!imageUrl || typeof imageUrl !== 'string') {
        console.error(`Invalid image URL at index ${i}:`, imageUrl)
        continue
      }
      
      const { data: mockup, error } = await supabase
        .from('mockups')
        .insert({
          user_id: user.id,
          title: `Onboarding Mockup ${i + 1}`,
          logo_url: logo || null,
          aesthetic_vibe: null,
          platform: null,
          content_type: null,
          image_urls: [imageUrl], // Store as array with single image
        })
        .select()
        .single()

      if (error) {
        console.error(`Error saving mockup ${i + 1}:`, error)
        // Log the full error for debugging
        console.error('Full error details:', JSON.stringify(error, null, 2))
        continue // Continue with next image even if one fails
      }

      if (mockup) {
        savedMockups.push(mockup)
      }
    }

    return NextResponse.json({
      success: true,
      mockups: savedMockups,
      count: savedMockups.length,
    })
  } catch (error) {
    console.error('Error in POST /api/onboarding/save-images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

