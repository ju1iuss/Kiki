# Stripe Setup Guide for Tasy Viral

## ✅ Completed

1. ✅ Database migration - Added `product` column to subscriptions table
2. ✅ Edge functions created and configured
3. ✅ Frontend components created
4. ✅ API routes created
5. ✅ Integration into pricing components

## 🔴 Action Required: Create €9 Starter Plan in Stripe

You need to create a new Stripe product and price for the Starter plan (€9.99/month).

### Steps:

1. **Go to Stripe Dashboard** → Products
2. **Create New Product:**
   - Name: "Tasy Viral Starter"
   - Description: "Starter plan for tasy-viral mockup tool"
   - Pricing: €9.99/month (recurring, monthly)
   - Currency: EUR

3. **Copy the Price ID** (starts with `price_...`)

4. **Update Edge Function:**
   - Open `supabase/functions/stripe-checkout-viral/index.ts`
   - Replace `'price_XXXXXXXXXXXXX'` in `PRICE_IDS.starter_monthly` with your new price ID
   - Open `supabase/functions/stripe-webhooks-viral/index.ts`
   - Add the price ID to `PRICE_MAPPING`:
     ```typescript
     'price_YOUR_NEW_PRICE_ID': { plan: 'starter', interval: 'monthly' }
     ```

## Existing Price IDs (Already Configured)

- **Pro Monthly**: `price_1RRq7ILbnEoK1sp4Io7vlSNC` (€29/month) ✅
- **Business Monthly**: `price_1RRq7ZLbnEoK1sp4gSzsZgSO` (€99/month) ✅

## Environment Variables Needed

### Next.js (.env.local):
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://zcftkbpfekuvatkiiujq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Functions (Set via Supabase Dashboard):
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET_VIRAL=whsec_...
SITE_URL=https://app.tasy.ai
SUPABASE_URL=https://zcftkbpfekuvatkiiujq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

## Webhook Setup

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add Endpoint:**
   - URL: `https://zcftkbpfekuvatkiiujq.supabase.co/functions/v1/stripe-webhooks-viral`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Copy Webhook Secret** (starts with `whsec_...`)
4. **Add to Supabase Edge Function secrets** as `STRIPE_WEBHOOK_SECRET_VIRAL`

## Deployment Steps

1. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy stripe-checkout-viral
   supabase functions deploy stripe-webhooks-viral
   supabase functions deploy stripe-portal-viral
   ```

2. **Set Edge Function Secrets:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase secrets set STRIPE_WEBHOOK_SECRET_VIRAL=whsec_...
   supabase secrets set SITE_URL=https://app.tasy.ai
   ```

3. **Test the Flow:**
   - Go to onboarding step 9 (pricing)
   - Select a plan
   - Click "Continue"
   - Embedded checkout modal should open
   - Complete test payment
   - Verify subscription created in database

## Testing Checklist

- [ ] €9 Starter plan created in Stripe
- [ ] Price IDs updated in edge functions
- [ ] Edge functions deployed
- [ ] Webhook endpoint configured
- [ ] Environment variables set
- [ ] Test checkout flow works
- [ ] Test webhook receives events
- [ ] Test subscription appears in database
- [ ] Test credits allocated correctly

## Notes

- Only monthly billing is supported for now
- The product column defaults to 'tasy.ai' for existing subscriptions
- New tasy-viral subscriptions will have `product: 'tasy-viral'`
- Credits are shared in the profiles table but allocated based on plan

