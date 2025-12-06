import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.2';
import Stripe from 'https://esm.sh/stripe@14.22.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient()
});

// Initialize Supabase with SERVICE ROLE KEY for admin access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('=== STRIPE PORTAL REQUEST (VIRAL) ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get authorization header to extract user info
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token received, length:', token.length);

    // Create Supabase client with the user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('❌ Invalid user token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Get the customer ID from ANY active subscription (tasy.ai or tasy-viral)
    // Prefer tasy-viral if both exist, but allow tasy.ai subscriptions too
    const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id, product')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Prefer tasy-viral subscription, but fallback to any active subscription
    let subscription = null;
    if (subscriptions && subscriptions.length > 0) {
      // Try to find tasy-viral subscription first
      const viralSubscription = subscriptions.find(
        sub => sub.product === 'tasy-viral' || (sub as any).metadata?.product === 'tasy-viral'
      );
      subscription = viralSubscription || subscriptions[0];
    }

    if (subscriptionError) {
      console.error('❌ Error fetching subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Error fetching subscription information' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!subscription || !subscription.stripe_customer_id) {
      console.error('❌ No customer ID found for user:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'You need to subscribe to a plan before you can manage billing.' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const customerId = subscription.stripe_customer_id;
    console.log('💳 Customer ID found:', customerId);

    // Create Stripe billing portal session
    console.log('🏗️ Creating Stripe portal session...');
    // Use SITE_URL_VIRAL if set, otherwise fallback to SITE_URL or default
    const siteUrl = Deno.env.get('SITE_URL_VIRAL') || Deno.env.get('SITE_URL') || 'https://app.tasy.ai';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get('origin') || siteUrl}/settings`
    });

    console.log('✅ Portal session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('💥 Portal error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create portal session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

