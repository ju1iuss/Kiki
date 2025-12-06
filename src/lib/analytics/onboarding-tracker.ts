'use client'

import { captureEvent } from './posthog'

interface StepInfo {
  stepNumber: number
  stepName: string
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
  captureEvent('onboarding_started', {
    timestamp: Date.now(),
  })
}

export function trackOnboardingStepView(stepNumber: number, previousStep?: number) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  captureEvent('onboarding_step_viewed', {
    step_number: stepNumber,
    step_name: stepName,
    previous_step: previousStep,
    timestamp: Date.now(),
  })
}

export function trackOnboardingStepCompleted(stepNumber: number, timeSpent?: number, data?: Record<string, any>) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  captureEvent('onboarding_step_completed', {
    step_number: stepNumber,
    step_name: stepName,
    time_spent_ms: timeSpent,
    step_data: data,
    timestamp: Date.now(),
  })
}

export function trackOnboardingStepAbandoned(stepNumber: number, timeSpent: number) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  captureEvent('onboarding_step_abandoned', {
    step_number: stepNumber,
    step_name: stepName,
    time_spent_ms: timeSpent,
    timestamp: Date.now(),
  })
}

export function trackOnboardingCompleted(totalTime: number, totalSteps: number) {
  captureEvent('onboarding_completed', {
    total_time_ms: totalTime,
    total_steps: totalSteps,
    timestamp: Date.now(),
  })
}

export function trackOnboardingDropOff(stepNumber: number, reason?: string) {
  const stepName = STEP_NAMES[stepNumber] || `step_${stepNumber}`
  
  captureEvent('onboarding_dropped_off', {
    step_number: stepNumber,
    step_name: stepName,
    reason: reason,
    timestamp: Date.now(),
  })
}

export function trackOnboardingAction(action: string, stepNumber: number, properties?: Record<string, any>) {
  captureEvent('onboarding_action', {
    action,
    step_number: stepNumber,
    step_name: STEP_NAMES[stepNumber] || `step_${stepNumber}`,
    ...properties,
    timestamp: Date.now(),
  })
}

