# Environment Variables Setup

## ✅ Already Configured (Shared with tasy.ai)

Since we're using the **same Supabase project** (`zcftkbpfekuvatkiiujq`), these environment variables are **already set** and shared:

- ✅ `STRIPE_SECRET_KEY` - Already configured
- ✅ `SUPABASE_URL` - Already configured  
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Already configured
- ✅ `SUPABASE_ANON_KEY` - Already configured

## 🔴 NEW: Only Need to Add These

You only need to add **ONE new environment variable**:

### 1. `STRIPE_WEBHOOK_SECRET_VIRAL`

**Steps:**
1. Go to **Stripe Dashboard** → Developers → Webhooks
2. Click **"Add endpoint"**
3. Set URL: `https://zcftkbpfekuvatkiiujq.supabase.co/functions/v1/stripe-webhooks-viral`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Go to **Supabase Dashboard** → Edge Functions → Settings → Secrets
8. Add new secret: `STRIPE_WEBHOOK_SECRET_VIRAL` = `whsec_...`

### 2. Optional: `SITE_URL_VIRAL` (if different from tasy.ai)

If you want a different redirect URL for tasy-viral:
- Add `SITE_URL_VIRAL=https://app.tasy.ai`

**Note:** The functions will fallback to `SITE_URL` if `SITE_URL_VIRAL` is not set, so this is optional.

## How It Works

The edge functions use this fallback logic:

```typescript
// Webhook secret: Uses STRIPE_WEBHOOK_SECRET_VIRAL, falls back to STRIPE_WEBHOOK_SECRET
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET_VIRAL') || Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Site URL: Uses SITE_URL_VIRAL, falls back to SITE_URL, then default
const siteUrl = Deno.env.get('SITE_URL_VIRAL') || Deno.env.get('SITE_URL') || 'https://app.tasy.ai';
```

## Summary

**Action Required:**
1. ✅ Create Stripe webhook endpoint for `stripe-webhooks-viral`
2. ✅ Add `STRIPE_WEBHOOK_SECRET_VIRAL` secret to Supabase
3. ⏳ (Optional) Add `SITE_URL_VIRAL` if you want different redirects

**Already Done:**
- ✅ All other environment variables are shared and already configured
- ✅ Edge functions deployed
- ✅ Price IDs configured

