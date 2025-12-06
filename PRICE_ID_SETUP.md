# Price ID Setup Instructions

## Product ID Provided
You provided the product ID: `prod_TYVh5147mojhPs`

## Action Required: Get Monthly Price ID

This is a **product ID**, but we need the **price ID** (starts with `price_`) for the monthly subscription.

### Steps:

1. **Go to Stripe Dashboard** → Products
2. **Find product** `prod_TYVh5147mojhPs` (Tasy Viral Starter)
3. **Click on the product** to view its prices
4. **Find the monthly recurring price** (€9.99/month)
5. **Copy the Price ID** (it will look like `price_1ABC123...`)

### Update Edge Functions

Once you have the price ID, update these files:

#### 1. `supabase/functions/stripe-checkout-viral/index.ts`
Replace line 25:
```typescript
starter_monthly: 'price_YOUR_PRICE_ID_HERE', // €9.99/month
```

#### 2. `supabase/functions/stripe-webhooks-viral/index.ts`
Add to `PRICE_MAPPING` around line 11:
```typescript
'price_YOUR_PRICE_ID_HERE': { plan: 'starter', interval: 'monthly' },
```

## Current Configuration

- ✅ **Pro Monthly**: `price_1RRq7ILbnEoK1sp4Io7vlSNC` (€29/month)
- ✅ **Business Monthly**: `price_1RRq7ZLbnEoK1sp4gSzsZgSO` (€99/month)
- ⏳ **Starter Monthly**: Need price ID from product `prod_TYVh5147mojhPs`

## After Updating

1. Deploy edge functions
2. Test checkout flow
3. Verify webhook receives events correctly

