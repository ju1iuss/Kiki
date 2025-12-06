# Onboarding Analytics Implementation Guide

## Overview

This guide outlines the best tools and implementation strategy for tracking your 18-step onboarding flow to identify drop-offs, optimize conversion, and improve user experience.

## Recommended Tools (Based on Research)

### 🏆 Top Recommendation: **PostHog**

**Why PostHog?**
- ✅ **Open-source** (self-hostable) or cloud-hosted
- ✅ **Excellent Next.js integration** with official SDK
- ✅ **Autocapture** - automatically tracks clicks, form submissions, pageviews
- ✅ **Funnel analysis** - perfect for tracking 18-step onboarding
- ✅ **Session replay** - watch where users struggle
- ✅ **Free tier**: 1M events/month (cloud) or unlimited (self-hosted)
- ✅ **Feature flags** - A/B test onboarding improvements
- ✅ **User paths** - visualize user journeys

**Pricing**: Free up to 1M events/month, then $0.000225/event

**Best for**: Complete solution with minimal setup, great for Next.js apps

---

### 🥈 Alternative: **Amplitude**

**Why Amplitude?**
- ✅ **Generous free tier**: 50K MTUs/month
- ✅ **Excellent funnel analysis** - built specifically for conversion tracking
- ✅ **User journey mapping** - see complete paths
- ✅ **Cohort analysis** - segment users by behavior
- ✅ **Next.js SDK** available
- ✅ **Predictive analytics** - identify at-risk users

**Pricing**: Free up to 50K MTUs/month, then starts at $900/month

**Best for**: Deep funnel analysis and user journey insights

---

### 🥉 Alternative: **Mixpanel**

**Why Mixpanel?**
- ✅ **Free tier**: 20M events/month
- ✅ **Strong event tracking** - granular control
- ✅ **Funnel analysis** - identify drop-off points
- ✅ **A/B testing** built-in
- ✅ **User segmentation** - group by behavior
- ✅ **Next.js integration** available

**Pricing**: Free up to 20M events/month, then $25/month+

**Best for**: Event-heavy tracking with detailed segmentation

---

## Implementation Plan

### Phase 1: PostHog Setup (Recommended)

#### Step 1: Install PostHog

```bash
npm install posthog-js
```

#### Step 2: Create PostHog Client Utility

Create `src/lib/analytics/posthog.ts`:

```typescript
'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // Disable automatic pageview capture, we'll do it manually
      capture_pageleave: true,
    })
  }
}

export { PostHogProvider, posthog }
```

#### Step 3: Wrap App with PostHog Provider

Update `src/app/layout.tsx`:

```typescript
import { PostHogProvider } from '@/lib/analytics/posthog'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
```

#### Step 4: Create Onboarding Analytics Hook

Create `src/lib/analytics/onboarding-tracker.ts`:

```typescript
'use client'

import { posthog } from './posthog'
import { useEffect, useRef } from 'react'

interface StepInfo {
  stepNumber: number
  stepName: string
  stepType: string
  timestamp: number
}

const STEP_NAMES: Record<number, string> = {
  1: 'logo_upload',
  2: 'trust',
  3: 'generating',
  4: 'agreement',
  5: 'monthly_goal',
  6: 'social_proof',
  7: 'goal_selection',
  8: 'building_strategy',
  9: 'signup',
  10: 'name',
  11: 'social_proof_1',
  12: 'social_proof_2',
  13: 'creating_for',
  14: 'pricing',
  15: 'dashboard',
  16: 'aesthetic_vibe',
  17: 'content_type',
  18: 'platforms',
}

export function trackOnboardingStart() {
  posthog?.capture('onboarding_started', {
    timestamp: Date.now(),
  })
}

export function trackOnboardingStepView(stepNumber: number, previousStep?: number) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  posthog?.capture('onboarding_step_viewed', {
    step_number: stepNumber,
    step_name: stepName,
    previous_step: previousStep,
    timestamp: Date.now(),
  })
}

export function trackOnboardingStepCompleted(stepNumber: number, timeSpent?: number, data?: Record<string, any>) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  posthog?.capture('onboarding_step_completed', {
    step_number: stepNumber,
    step_name: stepName,
    time_spent_ms: timeSpent,
    step_data: data,
    timestamp: Date.now(),
  })
}

export function trackOnboardingStepAbandoned(stepNumber: number, timeSpent: number) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  posthog?.capture('onboarding_step_abandoned', {
    step_number: stepNumber,
    step_name: stepName,
    time_spent_ms: timeSpent,
    timestamp: Date.now(),
  })
}

export function trackOnboardingCompleted(totalTime: number, totalSteps: number) {
  posthog?.capture('onboarding_completed', {
    total_time_ms: totalTime,
    total_steps: totalSteps,
    timestamp: Date.now(),
  })
}

export function trackOnboardingDropOff(stepNumber: number, reason?: string) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  posthog?.capture('onboarding_dropped_off', {
    step_number: stepNumber,
    step_name: stepName,
    reason: reason,
    timestamp: Date.now(),
  })
}

// Hook to track time spent on step
export function useStepTimeTracker(stepNumber: number) {
  const startTimeRef = useRef<number>(Date.now())
  
  useEffect(() => {
    startTimeRef.current = Date.now()
    trackOnboardingStepView(stepNumber)
    
    return () => {
      const timeSpent = Date.now() - startTimeRef.current
      // Only track abandonment if user spent significant time (> 5 seconds)
      if (timeSpent > 5000) {
        trackOnboardingStepAbandoned(stepNumber, timeSpent)
      }
    }
  }, [stepNumber])
  
  return {
    getTimeSpent: () => Date.now() - startTimeRef.current,
  }
}
```

#### Step 5: Integrate with Onboarding Context

Update `src/components/onboarding/onboarding-context.tsx`:

```typescript
import { 
  trackOnboardingStart, 
  trackOnboardingStepView, 
  trackOnboardingStepCompleted,
  trackOnboardingDropOff,
  trackOnboardingCompleted 
} from '@/lib/analytics/onboarding-tracker'

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({})
  const startTimeRef = useRef<number>(Date.now())
  const previousStepRef = useRef<number>(1)

  useEffect(() => {
    // Track onboarding start
    trackOnboardingStart()
    startTimeRef.current = Date.now()
  }, [])

  const setStep = (step: number) => {
    // Track step view
    trackOnboardingStepView(step, previousStepRef.current)
    
    setCurrentStep(step)
    saveOnboardingStep(step)
    previousStepRef.current = step
  }

  const nextStep = () => {
    const next = currentStep + 1
    
    // Track step completion
    trackOnboardingStepCompleted(currentStep)
    
    setStep(next)
    
    // Track completion if last step
    if (next > 18) {
      const totalTime = Date.now() - startTimeRef.current
      trackOnboardingCompleted(totalTime, 18)
    }
  }

  // ... rest of the code
}
```

#### Step 6: Add Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

### Phase 2: Advanced Tracking

#### Track User Actions Within Steps

Add tracking to individual step components:

```typescript
// Example: step-1-logo-upload.tsx
import { posthog } from '@/lib/analytics/posthog'

export function Step1LogoUpload() {
  const handleLogoUpload = () => {
    posthog?.capture('onboarding_logo_uploaded', {
      step: 1,
      file_size: file.size,
      file_type: file.type,
    })
  }
  
  // ... rest of component
}
```

#### Track Form Interactions

```typescript
// Track form field interactions
const handleInputChange = (field: string, value: any) => {
  posthog?.capture('onboarding_form_field_changed', {
    step: currentStep,
    field,
    value_length: String(value).length,
  })
}
```

#### Track Errors

```typescript
const handleError = (error: Error, step: number) => {
  posthog?.capture('onboarding_error', {
    step,
    error_message: error.message,
    error_stack: error.stack,
  })
}
```

---

## Key Metrics to Track

### 1. **Funnel Metrics**
- Step completion rate (% of users completing each step)
- Drop-off rate (where users leave)
- Time to complete each step
- Total onboarding completion rate

### 2. **User Behavior**
- Back button usage (users going back)
- Time spent on each step
- Form field interactions
- Button clicks
- Error occurrences

### 3. **Conversion Metrics**
- Onboarding start → completion rate
- Signup conversion (step 9)
- Pricing page views (step 14)
- Final dashboard access (step 15)

### 4. **User Segmentation**
- Users who complete vs. drop off
- Fast completers vs. slow completers
- Users who skip steps vs. complete all
- Mobile vs. desktop users

---

## PostHog Dashboard Setup

### Create Funnel Analysis

1. Go to PostHog → Insights → New Funnel
2. Add steps:
   - `onboarding_started`
   - `onboarding_step_completed` (step 1)
   - `onboarding_step_completed` (step 2)
   - ... (all 18 steps)
   - `onboarding_completed`

### Create Drop-off Analysis

1. Create a funnel with all steps
2. View drop-off percentages between steps
3. Identify problematic steps (>20% drop-off)

### Create Time Analysis

1. Create a chart tracking `time_spent_ms` per step
2. Identify steps where users spend too much time (>2 minutes)

---

## Alternative: Amplitude Setup

If you prefer Amplitude:

```bash
npm install @amplitude/analytics-browser
```

Create `src/lib/analytics/amplitude.ts`:

```typescript
'use client'

import * as amplitude from '@amplitude/analytics-browser'

if (typeof window !== 'undefined') {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_KEY
  if (apiKey) {
    amplitude.init(apiKey, {
      defaultTracking: {
        pageViews: false,
        sessions: true,
      },
    })
  }
}

export { amplitude }
```

Use similar tracking functions as PostHog.

---

## Alternative: Mixpanel Setup

If you prefer Mixpanel:

```bash
npm install mixpanel-browser
```

Create `src/lib/analytics/mixpanel.ts`:

```typescript
'use client'

import mixpanel from 'mixpanel-browser'

if (typeof window !== 'undefined') {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (token) {
    mixpanel.init(token, {
      track_pageview: false,
      persistence: 'localStorage',
    })
  }
}

export { mixpanel }
```

---

## Best Practices

1. **Track Early**: Start tracking from day one to build historical data
2. **Track Everything**: Better to have too much data than too little
3. **Name Events Consistently**: Use snake_case, descriptive names
4. **Include Context**: Always include step number, user ID, timestamp
5. **Privacy First**: Don't track PII (personally identifiable information)
6. **Test in Dev**: Verify events are firing correctly
7. **Monitor Regularly**: Check dashboards weekly for insights
8. **Iterate**: Use data to improve onboarding flow

---

## Expected Insights

After 1-2 weeks of tracking, you should be able to answer:

- ✅ Which step has the highest drop-off rate?
- ✅ How long does average onboarding take?
- ✅ Where do users spend the most time?
- ✅ What percentage complete onboarding?
- ✅ Which steps cause users to go back?
- ✅ Are there any error-prone steps?
- ✅ Do mobile users behave differently?

---

## Next Steps

1. **Choose a tool** (PostHog recommended)
2. **Set up tracking** using the code above
3. **Test thoroughly** in development
4. **Deploy and monitor** for 1-2 weeks
5. **Analyze data** and identify improvements
6. **A/B test changes** using feature flags
7. **Iterate** based on results

---

## Resources

- [PostHog Next.js Docs](https://posthog.com/docs/libraries/next-js)
- [Amplitude Next.js Docs](https://www.docs.developers.amplitude.com/data/sdks/browser-2/)
- [Mixpanel Next.js Docs](https://developer.mixpanel.com/docs/javascript-full-api-reference)

---

**Recommendation**: Start with **PostHog** for the best balance of features, ease of use, and Next.js integration. You can always add Amplitude or Mixpanel later for additional insights.

