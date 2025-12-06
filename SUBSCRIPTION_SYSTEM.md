# Subscription System Documentation

This document describes the subscription and pricing system for the Tasy Viral AI Mockup Tool.

## Database Schema

### Tables

#### `subscriptions` Table
Stores user subscription information.

**Columns:**
- `id` (UUID, Primary Key) - Unique subscription identifier
- `user_id` (UUID, Foreign Key → auth.users) - User who owns the subscription
- `plan` (ENUM: `basic`, `pro`, `business`, `company`) - Subscription plan type
- `status` (ENUM: `active`, `canceled`, `incomplete`, `incomplete_expired`, `past_due`, `trialing`, `unpaid`) - Subscription status
- `billing_interval` (ENUM: `monthly`, `yearly`) - Billing frequency
- `price_id` (TEXT) - Stripe price ID
- `current_period_start` (TIMESTAMP) - Start of current billing period
- `current_period_end` (TIMESTAMP) - End of current billing period
- `cancel_at_period_end` (BOOLEAN) - Whether subscription will cancel at period end
- `canceled_at` (TIMESTAMP) - When subscription was canceled
- `trial_start` (TIMESTAMP) - Trial period start
- `trial_end` (TIMESTAMP) - Trial period end
- `stripe_customer_id` (TEXT) - Stripe customer identifier
- `stripe_subscription_id` (TEXT, Unique) - Stripe subscription identifier
- `is_active` (BOOLEAN) - Whether subscription is currently active
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp
- `metadata` (JSONB) - Additional subscription metadata
- `email` (TEXT) - User email

#### `profiles` Table
Stores user profile information including subscription reference.

**Relevant Columns:**
- `id` (UUID, Primary Key) - User ID (matches auth.users.id)
- `credits` (INTEGER) - Current credit balance
- `subscription_id` (UUID, Foreign Key → subscriptions.id) - Reference to active subscription
- `stripe_customer_id` (TEXT) - Stripe customer identifier

## Plan Mapping

The subscription plan enum values map to pricing plan IDs as follows:

| Subscription Plan (DB) | Pricing Plan ID (UI) | Display Name |
|------------------------|---------------------|--------------|
| `basic` | `starter` | Starter |
| `pro` | `pro` | Pro |
| `business` | `business` | Business |
| `company` | `business` | Business |

## Pricing Plans

### Starter Plan (€9.99/month)
- **Plan ID:** `starter`
- **Credits:** 240/month
- **Tagline:** "For solo creators & new brands"
- **Features:**
  - 240 credits/month
  - All aesthetic packs
  - Unlimited exports

### Pro Plan (€29.00/month) ⭐ Most Popular
- **Plan ID:** `pro`
- **Credits:** 720/month
- **Tagline:** "For freelancers & growing brands"
- **Features:**
  - 720 credits/month
  - All aesthetic packs
  - Unlimited exports

### Business Plan (€99.00/month)
- **Plan ID:** `business`
- **Credits:** 1999/month
- **Tagline:** "For agencies & power users"
- **Features:**
  - 1999 credits/month
  - All aesthetic packs
  - Unlimited exports

## How to Fetch User Subscription

### Client-Side (React Component)

```typescript
// 1. Get authenticated user
const { data: { user } } = await supabase.auth.getUser()

// 2. Fetch user profile to get subscription_id
const { data: profile } = await supabase
  .from('profiles')
  .select('credits, subscription_id')
  .eq('id', user.id)
  .single()

// 3. Fetch subscription details if subscription_id exists
if (profile?.subscription_id) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, is_active')
    .eq('id', profile.subscription_id)
    .single()

  // 4. Check if subscription is active
  if (subscription?.is_active && subscription.status === 'active') {
    const planId = mapSubscriptionPlanToPricingPlan(subscription.plan)
    // Use planId for UI display
  }
}
```

### Plan Mapping Function

```typescript
const mapSubscriptionPlanToPricingPlan = (plan: string | null): string => {
  if (!plan) return 'starter'
  const planMap: Record<string, string> = {
    'basic': 'starter',
    'pro': 'pro',
    'business': 'business',
    'company': 'business',
  }
  return planMap[plan.toLowerCase()] || 'starter'
}
```

## Subscription Status

A subscription is considered "active" when:
1. `is_active` = `true`
2. `status` = `'active'`

Only active subscriptions should be displayed in the UI.

## Credits System

- Credits are stored in the `profiles.credits` column
- Credits are deducted when users generate mockups
- Credits are replenished based on subscription plan and billing cycle
- Default credits for new users: `0`

## UI Components

### Sidebar Credits Display
- Shows current plan name
- Shows current credit balance
- Clickable to open pricing dialog
- Located in sidebar below "Get Extension" link

### Pricing Dialog
- Displays all available plans
- Highlights current plan with "Current" badge
- Shows "Popular" badge for Pro plan
- Allows switching plans (requires Stripe integration)

## Future Considerations

1. **Plan Switching:** Implement Stripe checkout flow for plan changes
2. **Credit Replenishment:** Automate credit top-ups based on billing cycle
3. **Trial Periods:** Handle trial subscriptions with `trial_start` and `trial_end`
4. **Cancellation:** Handle `cancel_at_period_end` for graceful cancellations
5. **Yearly Billing:** Support `yearly` billing interval with discounts

## Related Files

- `src/components/sidebar.tsx` - Sidebar with credits/plan display
- `src/components/onboarding/steps/step-9-pricing.tsx` - Pricing selection during onboarding
- `supabase/migrations/001_create_mockups_tables.sql` - Database migrations (may need subscription table migration)

## Notes

- The subscription system integrates with Stripe for payment processing
- Webhook handlers should update subscription status in real-time
- Credits should be validated before allowing mockup generation
- Consider implementing credit purchase/upgrade flows for users without subscriptions

