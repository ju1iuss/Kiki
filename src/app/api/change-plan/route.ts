import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, interval = 'monthly', uiMode = 'embedded' } = await req.json();
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }
    
    // Get Supabase function URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Get user's auth token for edge function
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }
    
    // Call edge function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/stripe-checkout-viral`;
    console.log('🌐 Calling edge function:', edgeFunctionUrl);
    console.log('📦 With params:', { plan, interval, uiMode });
    console.log('🔑 Has token:', !!session.access_token);
    console.log('🔑 Has apikey:', !!supabaseAnonKey);
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey, // Add apikey header for Supabase edge functions
        },
        body: JSON.stringify({ plan, interval, uiMode }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('📊 Edge function response status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📄 Edge function response text:', responseText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse edge function response:', e);
        return NextResponse.json({ 
          error: `Edge function returned invalid JSON: ${responseText.substring(0, 200)}` 
        }, { status: 500 });
      }
      
      if (!response.ok) {
        console.error('❌ Edge function error:', data);
        return NextResponse.json({ 
          error: data.error || data.details || data.message || `Failed to create checkout (${response.status})`,
          edgeFunctionError: data, // Pass through the full error for debugging
          edgeFunctionStatus: response.status
        }, { status: response.status });
      }

      console.log('✅ Edge function success');
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      const errorName = fetchError instanceof Error ? fetchError.name : 'Unknown';
      
      console.error('❌ Error details:', {
        name: errorName,
        message: errorMessage,
        cause: fetchError instanceof Error ? fetchError.cause : undefined,
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
      });
      
      // Check if it's a timeout/abort error
      if (errorName === 'AbortError' || errorMessage.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Request timed out. Please try again.',
          details: 'The edge function did not respond within 30 seconds',
          edgeFunctionUrl: edgeFunctionUrl
        }, { status: 504 });
      }
      
      // Check if it's a network error
      if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
        return NextResponse.json({ 
          error: 'Network error. Unable to reach edge function.',
          details: errorMessage,
          edgeFunctionUrl: edgeFunctionUrl,
          suggestion: 'Please check your network connection and verify the Supabase URL is correct.'
        }, { status: 503 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create checkout session',
        details: errorMessage,
        edgeFunctionUrl: edgeFunctionUrl
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

