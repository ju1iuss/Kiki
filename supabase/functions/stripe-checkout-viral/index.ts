import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.2';
import Stripe from 'https://esm.sh/stripe@14.22.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Initialize Stripe with environment variable (SERVER-SIDE ONLY)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient()
});

// Initialize Supabase admin client (SERVER-SIDE ONLY)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Tasy Viral Price IDs
// Using existing tasy.ai prices for pro and business
// Starter plan: Product ID prod_TYVh5147mojhPs
const PRICE_IDS = {
  starter_monthly: 'price_1SbOfcLbnEoK1sp4WpTIIbAp', // €9.99/month
  pro_monthly: 'price_1RRq7ILbnEoK1sp4Io7vlSNC', // €29.00/month - Existing from tasy.ai
  business_monthly: 'price_1RRq7ZLbnEoK1sp4gSzsZgSO' // €99.00/month - Existing from tasy.ai
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('=== STRIPE CHECKOUT VIRAL REQUEST ===');
  console.log('Method:', req.method);

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
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

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token received, length:', token.length);

    // Verify JWT token (SERVER-SIDE ONLY)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('❌ Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const { plan, interval, promotionCode, uiMode = 'embedded', returnUrl } = await req.json();
    console.log('📦 Request params:', { plan, interval, uiMode });

    if (!plan || !interval) {
      return new Response(
        JSON.stringify({ error: 'Missing plan or billing interval' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get price ID - only monthly supported for now
    if (interval !== 'monthly') {
      return new Response(
        JSON.stringify({ error: 'Only monthly billing is supported at this time' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const priceKey = `${plan}_monthly`;
    const priceId = PRICE_IDS[priceKey as keyof typeof PRICE_IDS];

    console.log('💰 Price lookup:', { priceKey, priceId });

    if (!priceId || priceId.startsWith('price_XXXXXXXXXXXXX')) {
      console.error('❌ Invalid price ID:', priceKey);
      return new Response(
        JSON.stringify({ 
          error: `Price ID not configured for ${priceKey}. Please create Stripe products first.` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user profile
    console.log('👤 Fetching profile for user:', user.id);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User profile not found', details: profileError.message }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Profile found:', { email: profile.email, hasCustomerId: !!profile.stripe_customer_id });

    let customerId = profile.stripe_customer_id;

    // Create or retrieve customer
    if (!customerId) {
      console.log('💳 Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      console.log('✅ Customer created:', customerId);

      // Update profile with customer ID asynchronously
      supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
        .then(() => console.log('✅ Profile updated with customer ID'))
        .catch(err => console.error('❌ Error updating profile (non-blocking):', err));
    } else {
      console.log('💳 Using existing customer:', customerId);
    }

    // Determine return URL for embedded checkout
    // Use SITE_URL_VIRAL if set, otherwise fallback to SITE_URL or default
    const siteUrl = Deno.env.get('SITE_URL_VIRAL') || Deno.env.get('SITE_URL') || 'https://app.tasy.ai';
    // For onboarding flow, return to onboarding to continue the flow
    const finalReturnUrl = returnUrl || `${siteUrl}/onboarding`;

    // Prepare session parameters - different params for embedded vs hosted
    const baseParams = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription' as const,
      ui_mode: (uiMode === 'embedded' ? 'embedded' : 'hosted') as const,
      automatic_tax: { enabled: true },
      customer_update: { address: 'auto', name: 'auto' },
      // Enable multiple payment methods including quick checkout options
      payment_method_types: ['card', 'link'],
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: plan,
          billing_interval: interval,
          product: 'tasy-viral' // Mark as tasy-viral product
        }
      },
      metadata: {
        product: 'tasy-viral',
        user_id: user.id
      }
    };

    // Add URLs based on mode - embedded uses return_url, hosted uses success_url and cancel_url
    const sessionParams: Stripe.Checkout.SessionCreateParams = uiMode === 'embedded' 
      ? {
          ...baseParams,
          return_url: finalReturnUrl, // Only return_url for embedded
        }
      : {
          ...baseParams,
          success_url: `${siteUrl}/subscription/success?plan=${plan}&interval=${interval}&customer=${customerId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteUrl}/subscription?canceled=true`,
        };

    // Add promotion code handling
    if (promotionCode) {
      sessionParams.discounts = [{ promotion_code: promotionCode }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    // Create checkout session
    console.log('🏗️ Creating Stripe checkout session...', { uiMode, priceId });
    const sessionPromise = stripe.checkout.sessions.create(sessionParams);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Stripe API timeout')), 10000)
    );

    const session = await Promise.race([sessionPromise, timeoutPromise]) as Stripe.Checkout.Session;
    console.log('✅ Session created:', session.id);

    // For embedded checkout, return client_secret
    if (uiMode === 'embedded' && session.client_secret) {
      return new Response(
        JSON.stringify({
          client_secret: session.client_secret,
          session_id: session.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // For hosted checkout, return URL
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('💥 Error creating checkout session:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

