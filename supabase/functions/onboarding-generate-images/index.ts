import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FalQueueResponse {
  request_id: string;
}

interface FalStatusResponse {
  status: string;
}

interface FalResultResponse {
  images: Array<{
    url: string;
    content_type: string;
    file_name: string;
    file_size?: number;
    width?: number;
    height?: number;
  }>;
  description?: string;
}

// Helper function to poll for request completion
async function waitForFalRequest(
  requestId: string,
  falKey: string,
  maxWaitTime: number = 120000 // 2 minutes max
): Promise<FalResultResponse | null> {
  const startTime = Date.now();
  const pollInterval = 2000; // Poll every 2 seconds

  while (Date.now() - startTime < maxWaitTime) {
    // Check status
    const statusResponse = await fetch(
      `https://queue.fal.run/fal-ai/nano-banana/requests/${requestId}/status`,
      {
        headers: {
          'Authorization': `Key ${falKey}`,
        },
      }
    );

    if (!statusResponse.ok) {
      throw new Error(`Failed to check status: ${statusResponse.statusText}`);
    }

    const statusData: FalStatusResponse = await statusResponse.json();

    if (statusData.status === 'COMPLETED') {
      // Get the result
      const resultResponse = await fetch(
        `https://queue.fal.run/fal-ai/nano-banana/requests/${requestId}`,
        {
          headers: {
            'Authorization': `Key ${falKey}`,
          },
        }
      );

      if (!resultResponse.ok) {
        throw new Error(`Failed to get result: ${resultResponse.statusText}`);
      }

      return await resultResponse.json() as FalResultResponse;
    }

    if (statusData.status === 'FAILED') {
      throw new Error('Fal request failed');
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error('Request timeout - fal request took too long');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { logoBase64, imageBase64 } = await req.json();

    if (!logoBase64 || !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: logoBase64, imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get FAL_KEY from Supabase secrets
    const FAL_KEY = Deno.env.get('FAL_KEY');

    if (!FAL_KEY) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received onboarding request');
    console.log('- Logo:', logoBase64.substring(0, 100) + '...');
    console.log('- Image:', imageBase64.substring(0, 100) + '...');

    // Build image URLs array - original image first, then logo
    const imageUrls: string[] = [imageBase64, logoBase64];

    // Build prompt for logo replacement
    const imagePrompt = 'YOU MUST REPLACE THE LOGO IN THE FIRST IMAGE WITH THE LOGO FROM THE SECOND IMAGE. ' +
      'THIS IS A LOGO REPLACEMENT TASK - NOT A RECREATION TASK. ' +
      'IMAGE 1 = ORIGINAL IMAGE (has original logo that needs to be replaced). ' +
      'IMAGE 2 = YOUR LOGO (the logo to use for replacement). ' +
      'STEP-BY-STEP PROCESS: ' +
      '1. Look at IMAGE 1 - find where the logo/brand mark/text logo is located (could be top, bottom, corners, center, anywhere). ' +
      '2. Note the EXACT position, size, and orientation of that logo in IMAGE 1. ' +
      '3. Look at IMAGE 2 - this contains YOUR logo that you must use. ' +
      '4. Take YOUR logo from IMAGE 2 and place it in IMAGE 1 at the EXACT SAME POSITION where the original logo was. ' +
      '5. Make YOUR logo the SAME SIZE and SAME ORIENTATION as the original logo was. ' +
      '6. DELETE/REMOVE the original logo completely and put YOUR logo in its place. ' +
      'CRITICAL RULES: ' +
      '- Use the ACTUAL logo from IMAGE 2 - do NOT recreate, redesign, or reinterpret it. ' +
      '- If IMAGE 2 shows text, use that exact text. If it shows an icon, use that exact icon. ' +
      '- Do NOT transform text logos into shapes, objects, or other designs. ' +
      '- The logo from IMAGE 2 MUST replace the logo in IMAGE 1 at the SAME POSITION. ' +
      '- Only adapt visual properties (color, shadows, lighting, effects) to match the original logo\'s appearance. ' +
      '- Keep everything else in IMAGE 1 exactly the same - only the logo changes. ' +
      '- The replacement MUST be visible - YOUR logo must be clearly seen in the final image. ' +
      'FAILURE TO REPLACE THE LOGO IS NOT ACCEPTABLE. The logo replacement is MANDATORY and must be clearly visible.';

    console.log('=== IMAGE GENERATION PROMPT ===');
    console.log(imagePrompt);
    console.log('=== END PROMPT ===');

    // Generate adapted version using fal.ai Nano Banana EDIT endpoint
    let generatedImage: string | null = null;

    try {
      console.log('Submitting request to fal.ai nano-banana/edit with 2 images');

      const requestBody = {
        prompt: imagePrompt,
        image_urls: imageUrls,
        num_images: 1,
        aspect_ratio: 'auto', // Auto-detect aspect ratio
        output_format: 'png',
      };

      const falSubmitResponse = await fetch('https://queue.fal.run/fal-ai/nano-banana/edit', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!falSubmitResponse.ok) {
        const errorText = await falSubmitResponse.text();
        console.error('FAL API submit error:', errorText);
        throw new Error(`FAL API error: ${errorText}`);
      }

      const submitData: FalQueueResponse = await falSubmitResponse.json();
      const requestId = submitData.request_id;

      if (!requestId) {
        console.error('No request_id in fal.ai response');
        throw new Error('No request_id received from fal.ai');
      }

      console.log('Submitted request to fal.ai, request_id:', requestId);

      // Wait for the request to complete
      const result = await waitForFalRequest(requestId, FAL_KEY);

      if (!result || !result.images || result.images.length === 0) {
        console.error('No images in fal.ai result');
        throw new Error('No images returned from fal.ai');
      }

      // Extract image URL from the first image in the result
      generatedImage = result.images[0].url;

      if (!generatedImage) {
        console.error('No image URL in fal.ai result');
        throw new Error('No image URL in fal.ai result');
      }

      console.log('Successfully generated image:', generatedImage.substring(0, 100) + '...');
    } catch (imageError) {
      console.error('Image generation error:', imageError);
      throw new Error(`Failed to generate image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
    }

    const response = {
      image: generatedImage,
    };

    console.log('Sending response with generated image');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

