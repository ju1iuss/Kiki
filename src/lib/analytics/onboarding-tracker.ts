'use client'

// No-op functions - PostHog tracking removed
export function trackOnboardingStart() {}
export function trackOnboardingStepView(stepNumber: number, previousStep?: number) {}
export function trackOnboardingStepCompleted(stepNumber: number, timeSpent?: number, data?: Record<string, any>) {}
export function trackOnboardingStepAbandoned(stepNumber: number, timeSpent: number) {}
export function trackOnboardingCompleted(totalTime: number, totalSteps: number) {}
export function trackOnboardingDropOff(stepNumber: number, reason?: string) {}
export function trackOnboardingAction(action: string, stepNumber: number, properties?: Record<string, any>) {}
