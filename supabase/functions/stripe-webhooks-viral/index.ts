import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.2';
import Stripe from 'https://esm.sh/stripe@14.22.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Tasy Viral Price ID mapping
// Using existing tasy.ai prices for pro and business
const PRICE_MAPPING: Record<string, { plan: string; interval: string }> = {
  'price_1SbOfcLbnEoK1sp4WpTIIbAp': { plan: 'starter', interval: 'monthly' }, // €9.99/month
  'price_1RRq7ILbnEoK1sp4Io7vlSNC': { plan: 'pro', interval: 'monthly' }, // €29/month
  'price_1RRq7ZLbnEoK1sp4gSzsZgSO': { plan: 'business', interval: 'monthly' } // €99/month
};

// Plan credit limits (monthly allocation) for tasy-viral
const PLAN_CREDITS: Record<string, number> = {
  starter: 240,    // 240 credits per month for Starter plan
  pro: 720,        // 720 credits per month for Pro plan
  business: 1999   // 1999 credits per month for Business plan
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase with SERVICE ROLE KEY for admin access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Function to log webhook events
async function logWebhookEvent(eventId: string, eventType: string, stripeCustomerId: string | null) {
  try {
    const { error } = await supabaseAdmin
      .from('webhook_event_log')
      .insert({
        event_id: eventId,
        event_type: eventType,
        stripe_customer_id: stripeCustomerId,
        source: 'edge_function_viral'
      });

    if (error) {
      console.error('❌ Error logging webhook event:', error);
    } else {
      console.log('✅ Webhook event logged:', eventId);
    }
  } catch (err) {
    console.error('❌ Exception logging webhook event:', err);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('=== WEBHOOK RECEIVED (VIRAL) ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Get Stripe signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get webhook secret from environment variable
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_VIRAL') || Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get request body
    const body = await req.text();
    console.log('📦 Body length:', body.length);

    // Verify webhook signature
    console.log('🔐 Verifying Stripe signature...');
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log('✅ Stripe signature verified successfully');
    } catch (err) {
      console.error('❌ Stripe signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🎯 Processing webhook event: ${event.type}`);
    console.log('📋 Event ID:', event.id);

    // Extract customer ID for logging
    let customerId: string | null = null;
    if ('customer' in event.data.object && event.data.object.customer) {
      customerId = typeof event.data.object.customer === 'string' 
        ? event.data.object.customer 
        : event.data.object.customer.id;
    } else if ('subscription' in event.data.object && event.data.object.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          typeof event.data.object.subscription === 'string'
            ? event.data.object.subscription
            : event.data.object.subscription.id
        );
        customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;
      } catch (err) {
        console.warn('⚠️ Could not get customer from subscription:', err instanceof Error ? err.message : 'Unknown error');
      }
    }

    // Log the webhook event
    await logWebhookEvent(event.id, event.type, customerId);

    // Process different event types
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('📋 Processing checkout.session.completed');
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.created':
          console.log('📋 Processing customer.subscription.created');
          await handleSubscriptionChange(event.data.object as Stripe.Subscription, true);
          break;
        case 'customer.subscription.updated':
          console.log('📋 Processing customer.subscription.updated');
          await handleSubscriptionChange(event.data.object as Stripe.Subscription, false);
          break;
        case 'customer.subscription.deleted':
          console.log('📋 Processing customer.subscription.deleted');
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          console.log('📋 Processing invoice.payment_succeeded');
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          console.log('📋 Processing invoice.payment_failed');
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }
    } catch (processingError) {
      console.error('💥💥💥 CRITICAL ERROR processing webhook event:', processingError);
      console.error('💥 Event type:', event.type);
      console.error('💥 Event ID:', event.id);
      console.error('💥 Error details:', processingError instanceof Error ? processingError.message : 'Unknown error');
    }

    console.log('✅ Webhook processed successfully');
    return new Response(
      JSON.stringify({ received: true, eventId: event.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('💥💥💥 FATAL WEBHOOK ERROR:', error);
    return new Response(
      JSON.stringify({
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🛍️ === CHECKOUT SESSION COMPLETED ===');
  console.log('Session ID:', session.id);
  console.log('Customer ID:', session.customer);
  console.log('Subscription ID:', session.subscription);
  console.log('Mode:', session.mode);
  console.log('Metadata:', session.metadata);

  if (session.mode === 'subscription' && session.subscription) {
    console.log('✅ Subscription checkout completed. Will be processed by customer.subscription.created event.');
  } else {
    console.log('⚠️ Not a subscription checkout');
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription, isNewSubscription: boolean) {
  console.log('📝 === PROCESSING SUBSCRIPTION CHANGE ===');
  console.log('Subscription ID:', subscription.id);
  console.log('Customer ID:', subscription.customer);
  console.log('Status:', subscription.status);
  console.log('Is New Subscription:', isNewSubscription);
  console.log('Metadata:', subscription.metadata);

  const customerId = typeof subscription.customer === 'string' 
    ? subscription.customer 
    : subscription.customer.id;

  // Check if this is a tasy-viral subscription (from metadata)
  const isViralProduct = subscription.metadata?.product === 'tasy-viral';

  if (!isViralProduct) {
    console.log('⚠️ Not a tasy-viral subscription, skipping');
    return;
  }

  // Find user by customer ID or metadata
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId);

  let userId: string | null = null;
  let userEmail: string | null = null;

  if (profileError || !profiles || profiles.length === 0) {
    console.log('⚠️ No user found by customer ID, trying metadata...');
    if (subscription.metadata?.user_id) {
      userId = subscription.metadata.user_id;
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      userEmail = userProfile?.email || null;

      // Update profile with customer ID
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    } else {
      console.error('❌ No way to identify user for customer:', customerId);
      throw new Error(`Cannot identify user for customer ${customerId}`);
    }
  } else {
    userId = profiles[0].id;
    userEmail = profiles[0].email;
  }

  await createOrUpdateSubscription(userId, customerId, userEmail, subscription);
}

async function createOrUpdateSubscription(
  userId: string,
  customerId: string,
  userEmail: string | null,
  subscription: Stripe.Subscription
) {
  console.log('💾 === CREATING/UPDATING SUBSCRIPTION ===');

  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem.price.id;
  console.log('💰 Price ID:', priceId);

  const planInfo = PRICE_MAPPING[priceId];
  if (!planInfo) {
    console.error('❌ Unknown price ID:', priceId);
    throw new Error(`Unknown price ID: ${priceId}`);
  }

  const { plan, interval } = planInfo;
  const billingInterval = interval === 'yearly' ? 'yearly' : 'monthly';

  // Check for existing subscription
  const { data: existingSubscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  const subscriptionData = {
    user_id: userId,
    email: userEmail,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    plan: plan === 'starter' ? 'basic' : plan, // Map starter to basic enum
    billing_interval: billingInterval,
    price_id: priceId,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    is_active: subscription.status === 'active',
    updated_at: new Date().toISOString(),
    product: 'tasy-viral', // Set product column
    metadata: { product: 'tasy-viral' } // Also store in metadata for compatibility
  };

  if (existingSubscription) {
    // Update existing
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id);

    if (error) throw error;
    await updateProfileSubscriptionLink(userId, existingSubscription.id);
    await updateUserCredits(userId, plan, subscription.status, subscription);
  } else {
    // Create new
    const { data: newSubscription, error } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    await updateProfileSubscriptionLink(userId, newSubscription.id);
    await updateUserCredits(userId, plan, subscription.status, subscription);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🗑️ === PROCESSING SUBSCRIPTION DELETION ===');

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      is_active: false,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) throw error;
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💳 === PAYMENT SUCCEEDED ===');

  if (invoice.subscription) {
    const subId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subId);

    const { data: subscriptionData } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan')
      .eq('stripe_subscription_id', subId)
      .single();

    if (subscriptionData) {
      const stripeSubscription = await stripe.subscriptions.retrieve(subId);
      await updateUserCredits(subscriptionData.user_id, subscriptionData.plan, 'active', stripeSubscription);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💸 === PAYMENT FAILED ===');

  if (invoice.subscription) {
    const subId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;

    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'past_due',
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subId);
  }
}

async function updateProfileSubscriptionLink(userId: string, subscriptionId: string) {
  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_id: subscriptionId,
      new_onboarding_completed: true,
      new_onboarding_completed_at: new Date().toISOString()
    })
    .eq('id', userId);
}

async function updateUserCredits(
  userId: string,
  plan: string,
  status: string,
  subscription: Stripe.Subscription
) {
  console.log('📎 === UPDATING USER CREDITS ===');

  if (status !== 'active' || !plan) {
    console.log('⚠️ Subscription not active or no plan, skipping credit update');
    return;
  }

  const planCreditCap = PLAN_CREDITS[plan as keyof typeof PLAN_CREDITS];
  if (!planCreditCap) {
    console.log('⚠️ No credit cap found for plan, skipping credit update');
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  const currentCredits = profile?.credits || 0;
  const isYearly = subscription.items.data[0]?.price?.recurring?.interval === 'year';

  let creditsToAdd = 0;

  if (isYearly) {
    const yearlyCredits = planCreditCap * 12;
    creditsToAdd = yearlyCredits;
  } else {
    if (currentCredits < planCreditCap) {
      creditsToAdd = planCreditCap - currentCredits;
    }
  }

  if (creditsToAdd > 0) {
    const newTotal = currentCredits + creditsToAdd;
    await supabaseAdmin
      .from('profiles')
      .update({
        credits: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }
}

