'use client'

import posthog from 'posthog-js'

// Re-export posthog for client-side usage
export { posthog }

// Helper to check if PostHog is initialized
export function isPostHogReady(): boolean {
  return typeof window !== 'undefined' && posthog.__loaded
}

// Helper to safely capture events
export function captureEvent(eventName: string, properties?: Record<string, any>) {
  if (isPostHogReady()) {
    posthog.capture(eventName, properties)
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[PostHog] Event not captured (not ready):', eventName, properties)
  }
}

// Identify user
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (isPostHogReady()) {
    posthog.identify(userId, properties)
  }
}

// Reset user (on logout)
export function resetUser() {
  if (isPostHogReady()) {
    posthog.reset()
  }
}

