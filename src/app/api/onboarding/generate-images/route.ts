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
    // For onboarding, try to get auth from cookies first
    let authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      // Try to parse auth token from cookies
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
      
      // If still no auth, try from Supabase session
      if (!authHeader) {
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

        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          authHeader = `Bearer ${session.access_token}`
        }
      }
    }
    
    // For onboarding, if no auth found, we need to handle this case
    // The edge function requires auth, so we'll use anon key as fallback
    // Note: This might still fail if edge function strictly requires JWT
    if (!authHeader) {
      // Try using anon key - this may not work if edge function requires JWT
      authHeader = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }

    const body = await request.json()
    const { logoBase64, imagePaths } = body

    if (!logoBase64 || !imagePaths || !Array.isArray(imagePaths)) {
      return NextResponse.json(
        { error: 'Missing required fields: logoBase64, imagePaths' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Convert image paths to base64 (server-side compatible)
    const convertImageToBase64 = async (imagePath: string): Promise<string> => {
      const response = await fetch(`${request.nextUrl.origin}${imagePath}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      const contentType = response.headers.get('content-type') || 'image/png'
      return `data:${contentType};base64,${base64}`
    }

    // Process all images in parallel for faster generation
    const imagePromises = imagePaths.map(async (imagePath) => {
      try {
        const imageBase64 = await convertImageToBase64(imagePath)

        // Call the new onboarding edge function (no auth required)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/onboarding-generate-images`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            },
            body: JSON.stringify({
              logoBase64,
              imageBase64,
            }),
          }
        )

        if (!response.ok) {
          const error = await response.json()
          console.error(`Failed to adapt image ${imagePath}:`, error)
          return null
        }

        const result = await response.json()
        return result.image || null
      } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error)
        return null
      }
    })

    // Wait for all images to complete in parallel
    const results = await Promise.all(imagePromises)
    const adaptedImages = results.filter((img): img is string => img !== null)

    return NextResponse.json(
      { images: adaptedImages },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Onboarding generate images error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

