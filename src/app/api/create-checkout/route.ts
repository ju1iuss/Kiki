import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, interval = 'monthly', uiMode = 'embedded', promotionCode } = await req.json();
    
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
    console.log('Calling edge function:', `${supabaseUrl}/functions/v1/stripe-checkout-viral`);
    console.log('With plan:', plan, 'interval:', interval, 'uiMode:', uiMode, 'promotionCode:', promotionCode);
    
    const requestBody: any = { plan, interval, uiMode };
    if (promotionCode) {
      requestBody.promotionCode = promotionCode;
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout-viral`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey, // Add apikey header for Supabase edge functions
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Edge function response status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('Edge function response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse edge function response:', e);
      return NextResponse.json({ 
        error: `Edge function returned invalid JSON: ${responseText}` 
      }, { status: 500 });
    }
    
    if (!response.ok) {
      console.error('Edge function error:', data);
      return NextResponse.json({ 
        error: data.error || data.details || data.message || `Failed to create checkout (${response.status})`,
        edgeFunctionError: data, // Pass through the full error for debugging
        edgeFunctionStatus: response.status
      }, { status: response.status });
    }

    return NextResponse.json(data);
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

