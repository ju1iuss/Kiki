# Stripe Integration Plan for Tasy Viral (app.tasy.ai)

## Overview
This document outlines the plan to integrate Stripe payments for **tasy-viral** (app.tasy.ai), which is an add-on product to the main **tasy.ai** product. Both products share the same Supabase database and Stripe account, requiring careful separation.

## ✅ Implementation Approach: Stripe Embedded Checkout

We will use **Stripe Embedded Checkout** (`ui_mode=embedded`) instead of redirect-based checkout for a better user experience:
- **No page redirects** - Checkout renders inline in a modal or section
- **Better UX** - Users stay on your site throughout the payment flow
- **Mobile optimized** - Stripe handles responsive design automatically
- **Same security** - Still uses Checkout Sessions under the hood

## Critical Challenge
- **Shared Database**: Both products use the same `profiles` and `subscriptions` tables
- **Shared Stripe Account**: Same Stripe account, but different products
- **Different Redirect URLs**: tasy.ai redirects to `ugcs1205.vercel.app`, app.tasy.ai needs `app.tasy.ai`
- **Different Pricing**: tasy-viral has different plans (starter, pro, business) vs tasy.ai (basic, pro, business, company)
- **MUST NOT BREAK**: Existing tasy.ai functionality must remain untouched

## Current Tasy.ai Stripe Functions (from Supabase)

### Edge Functions Found:
1. **stripe-checkout** - Creates checkout sessions for subscriptions
2. **stripe-webhooks** - Handles Stripe webhook events
3. **stripe-portal** - Creates billing portal sessions
4. **stripe-credits-checkout** - One-time credit purchases
5. **stripe-invoices** - Invoice management
6. **update-stripe-customer** - Updates customer info
7. **update-payment-method** - Updates payment methods

### Database Tables Used:
- **profiles** - Contains `subscription_id`, `stripe_customer_id`, `credits`
- **subscriptions** - Contains subscription details with plan enum: `basic`, `pro`, `business`, `company`
- **webhook_event_log** - Logs webhook events

### Current Tasy.ai Price IDs:
```typescript
PRICE_IDS = {
  basic_monthly: 'price_1RRq74LbnEoK1sp4GrxZspKu',
  basic_yearly: 'price_1RRq7BLbnEoK1sp42OnteHuY',
  pro_monthly: 'price_1RRq7ILbnEoK1sp4Io7vlSNC',
  pro_yearly: 'price_1RRq7RLbnEoK1sp4WZ1gAIxu',
  business_monthly: 'price_1RRq7ZLbnEoK1sp4gSzsZgSO',
  business_yearly: 'price_1RRq7iLbnEoK1sp4uAA4nDty',
  company_monthly: 'price_1S52WdLbnEoK1sp4YkHuze3H',
  company_yearly: 'price_1S52XdLbnEoK1sp4YkHuze3H'
}
```

## Tasy Viral Pricing Plans

### Plans (from SUBSCRIPTION_SYSTEM.md):
- **Starter**: €9.99/month, 240 credits/month
- **Pro**: €29.00/month, 720 credits/month ⭐ Most Popular
- **Business**: €99.00/month, 1999 credits/month

### Plan Mapping:
- UI Plan ID → DB Plan Enum
- `starter` → `basic` (or new enum value?)
- `pro` → `pro`
- `business` → `business`

## Strategy: Namespace Approach

### Option 1: Add Product Metadata (RECOMMENDED)
Add a `product` field to subscriptions table to differentiate:
- `product: 'tasy.ai'` for main product
- `product: 'tasy-viral'` for mockup product

**Pros:**
- Clean separation
- Easy to query
- No breaking changes

**Cons:**
- Requires migration
- Need to update webhook handlers

### Option 2: Use Different Plan Enum Values
Create new enum values like `viral_starter`, `viral_pro`, `viral_business`

**Pros:**
- No schema changes needed
- Clear separation

**Cons:**
- Clutters enum
- Harder to maintain

### Option 3: Use Subscription Metadata
Store product info in `metadata` JSONB field

**Pros:**
- No schema changes
- Flexible

**Cons:**
- Harder to query
- Less type-safe

## Recommended Approach: Option 1 + Separate Edge Functions

### Step 1: Database Migration
Add `product` column to `subscriptions` table:
```sql
ALTER TABLE subscriptions 
ADD COLUMN product TEXT DEFAULT 'tasy.ai' 
CHECK (product IN ('tasy.ai', 'tasy-viral'));
```

### Step 2: Create New Stripe Products & Prices
Create new Stripe products for tasy-viral:
- Product: "Tasy Viral Mockups"
- Prices:
  - Starter Monthly: €9.99
  - Starter Yearly: (calculate)
  - Pro Monthly: €29.00
  - Pro Yearly: (calculate)
  - Business Monthly: €99.00
  - Business Yearly: (calculate)

### Step 3: Copy & Adapt Edge Functions ✅
**COMPLETED** - Edge functions created:
- ✅ `stripe-checkout-viral` - Adapted checkout with embedded mode support
- ✅ `stripe-webhooks-viral` - Separate webhook handler for tasy-viral
- ✅ `stripe-portal-viral` - Portal for viral subscriptions

**Key Features:**
- Supports both `embedded` and `hosted` modes (fallback)
- Returns `client_secret` for embedded checkout
- Returns `url` for hosted checkout
- Marks subscriptions with `product: 'tasy-viral'` metadata

### Step 4: Update Webhook Handler
Enhance `stripe-webhooks` to:
- Detect product from price ID mapping
- Set `product: 'tasy-viral'` in subscription records
- Use correct redirect URLs based on product

### Step 5: Frontend Integration (Embedded Checkout)
- Create checkout API route that calls `stripe-checkout-viral`
- Install `@stripe/stripe-js` (already in package.json ✅)
- Create embedded checkout component using `stripe.initEmbeddedCheckout()`
- Update pricing components to trigger embedded checkout modal
- Handle success/cancel callbacks (no redirect needed for embedded)

## Implementation Steps

### Phase 1: Setup & Planning ✅
- [x] Read existing Stripe functions
- [x] Document database schema
- [x] Create integration plan
- [x] Research Stripe Embedded Checkout
- [x] Copy edge functions to project

### Phase 2: Database & Stripe Setup
- [ ] Add `product` column to subscriptions table (optional - using metadata instead)
- [ ] Create Stripe products for tasy-viral in Stripe Dashboard
- [ ] Create Stripe prices for all plans (monthly + yearly)
- [ ] Update price IDs in `stripe-checkout-viral/index.ts`
- [ ] Update price mapping in `stripe-webhooks-viral/index.ts`
- [ ] Set up webhook endpoint in Stripe Dashboard pointing to `stripe-webhooks-viral`

### Phase 3: Edge Functions ✅
- [x] Copy stripe-checkout → stripe-checkout-viral (with embedded support)
- [x] Copy stripe-webhooks → stripe-webhooks-viral (filtered for viral)
- [x] Copy stripe-portal → stripe-portal-viral
- [ ] Deploy edge functions to Supabase
- [ ] Test edge functions with Stripe CLI

### Phase 4: Frontend Integration (Embedded Checkout)
- [ ] Create `/api/create-checkout` route (Next.js API route)
- [ ] Create `<EmbeddedCheckout>` React component
- [ ] Create checkout modal/dialog wrapper
- [ ] Update `step-9-pricing.tsx` to use embedded checkout
- [ ] Update `pricing.tsx` component to use embedded checkout
- [ ] Update `sidebar.tsx` to show viral subscriptions
- [ ] Update `settings/page.tsx` for viral subscriptions
- [ ] Create success callback handler

### Phase 5: Testing & Validation
- [ ] Test embedded checkout flow (modal opens, payment works)
- [ ] Test webhook processing (subscription created in DB)
- [ ] Verify no impact on tasy.ai (test existing checkout still works)
- [ ] Test credit allocation (credits added correctly)
- [ ] Test subscription management (portal access)
- [ ] Test plan switching
- [ ] Test cancellation flow

## Files to Create/Modify

### ✅ New Edge Functions (COMPLETED):
- ✅ `supabase/functions/stripe-checkout-viral/index.ts` - Embedded checkout support
- ✅ `supabase/functions/stripe-webhooks-viral/index.ts` - Viral-specific webhooks
- ✅ `supabase/functions/stripe-portal-viral/index.ts` - Billing portal

### New API Routes (TODO):
- `src/app/api/create-checkout/route.ts` - Creates checkout session, returns client_secret
- `src/app/api/webhook/stripe/route.ts` - Optional: Next.js webhook handler (or use edge function)

### New Components (TODO):
- `src/components/embedded-checkout.tsx` - Stripe Embedded Checkout component
- `src/components/checkout-modal.tsx` - Modal wrapper for checkout

### Modified Components (TODO):
- `src/components/onboarding/steps/step-9-pricing.tsx` - Add checkout trigger
- `src/components/pricing.tsx` - Add checkout trigger
- `src/components/sidebar.tsx` - Show viral subscriptions
- `src/app/settings/page.tsx` - Manage viral subscriptions

### New Pages (TODO):
- `src/app/subscription/success/page.tsx` - Success page (for hosted fallback)
- `src/app/subscription/cancel/page.tsx` - Cancel page (for hosted fallback)

## Key Considerations

1. **URL Redirects**: All Stripe redirects must go to `app.tasy.ai`, not `ugcs1205.vercel.app`
2. **Credit System**: Credits are shared in profiles table - ensure proper allocation
3. **Customer IDs**: Same Stripe customer can have subscriptions for both products
4. **Webhook Events**: Must route to correct handler based on product
5. **Plan Mapping**: Map UI plan IDs to DB enum values correctly

## Stripe Embedded Checkout Implementation Details

### How Embedded Checkout Works

1. **Backend (Edge Function):**
   ```typescript
   const session = await stripe.checkout.sessions.create({
     mode: 'subscription',
     ui_mode: 'embedded',  // Key difference
     line_items: [{ price: priceId, quantity: 1 }],
     return_url: 'https://app.tasy.ai/subscription/success', // Required for embedded
     // ... other params
   });
   
   // Returns client_secret instead of url
   return { client_secret: session.client_secret };
   ```

2. **Frontend (React Component):**
   ```typescript
   import { loadStripe } from '@stripe/stripe-js';
   
   const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
   const checkout = await stripe.initEmbeddedCheckout({
     clientSecret: clientSecret
   });
   checkout.mount('#checkout-container');
   ```

### Benefits of Embedded Checkout
- ✅ **No redirects** - Better UX, users stay on your site
- ✅ **Mobile optimized** - Stripe handles responsive design
- ✅ **Faster** - No page reloads
- ✅ **Customizable** - Can style container, add custom messaging
- ✅ **Same security** - Uses same Checkout Sessions API

### Implementation Pattern

```typescript
// 1. User clicks "Subscribe" button
const handleSubscribe = async (plan: string) => {
  // 2. Call API to create checkout session
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, interval: 'monthly', uiMode: 'embedded' })
  });
  const { client_secret } = await res.json();
  
  // 3. Initialize embedded checkout
  const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
  const checkout = await stripe.initEmbeddedCheckout({ clientSecret: client_secret });
  
  // 4. Mount in modal/container
  checkout.mount('#checkout-container');
  
  // 5. Handle completion
  checkout.on('complete', () => {
    // Redirect or show success message
    router.push('/subscription/success');
  });
};
```

## Embedded Checkout Frontend Implementation Guide

### Step 1: Create API Route (`src/app/api/create-checkout/route.ts`)

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, interval, uiMode = 'embedded' } = await req.json();
    
    // Get Supabase function URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Call edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout-viral`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan, interval, uiMode }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Embedded Checkout Component (`src/components/embedded-checkout.tsx`)

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeEmbeddedCheckout } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface EmbeddedCheckoutProps {
  clientSecret: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function EmbeddedCheckout({ clientSecret, onComplete, onError }: EmbeddedCheckoutProps) {
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [checkout, setCheckout] = useState<StripeEmbeddedCheckout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeCheckout() {
      try {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');

        const embeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret,
        });

        if (!mounted) return;

        setCheckout(embeddedCheckout);
        setLoading(false);

        // Mount checkout
        if (checkoutRef.current) {
          embeddedCheckout.mount(checkoutRef.current);
        }

        // Listen for completion
        embeddedCheckout.on('complete', () => {
          onComplete?.();
        });

      } catch (error) {
        console.error('Error initializing checkout:', error);
        onError?.(error as Error);
        setLoading(false);
      }
    }

    initializeCheckout();

    return () => {
      mounted = false;
      checkout?.unmount();
    };
  }, [clientSecret]);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div ref={checkoutRef} id="checkout-container" />
    </div>
  );
}
```

### Step 3: Create Checkout Modal (`src/components/checkout-modal.tsx`)

```typescript
'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmbeddedCheckout } from './embedded-checkout';
import { X } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string | null;
  onSuccess: () => void;
}

export function CheckoutModal({ open, onOpenChange, clientSecret, onSuccess }: CheckoutModalProps) {
  const handleComplete = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Complete Your Subscription</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {clientSecret && (
          <EmbeddedCheckout
            clientSecret={clientSecret}
            onComplete={handleComplete}
            onError={(error) => {
              console.error('Checkout error:', error);
              alert('An error occurred. Please try again.');
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Step 4: Use in Pricing Component

```typescript
'use client';

import { useState } from 'react';
import { CheckoutModal } from '@/components/checkout-modal';
import { useRouter } from 'next/navigation';

export function PricingPlan({ plan, interval }: { plan: string; interval: string }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval, uiMode: 'embedded' }),
      });

      const data = await res.json();
      if (data.client_secret) {
        setClientSecret(data.client_secret);
        setShowCheckout(true);
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push('/subscription/success');
  };

  return (
    <>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Subscribe'}
      </button>

      <CheckoutModal
        open={showCheckout}
        onOpenChange={setShowCheckout}
        clientSecret={clientSecret}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

## Environment Variables Needed

Add to `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add to Supabase Edge Function secrets:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET_VIRAL=whsec_...
SITE_URL=https://app.tasy.ai
```

## Next Steps

1. ✅ Review this plan
2. ✅ Copy edge functions (DONE)
3. **Create Stripe products/prices in Stripe Dashboard**
4. **Update price IDs in edge functions**
5. **Deploy edge functions to Supabase**
6. **Create frontend embedded checkout component** (use guide above)
7. **Integrate into pricing components**
8. **Test end-to-end flow**

