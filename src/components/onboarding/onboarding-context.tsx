'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { OnboardingData, getOnboardingData, saveOnboardingData, getOnboardingStep, saveOnboardingStep, clearOnboardingData, clearOnboardingStep } from '@/lib/onboarding-storage'
import {
  trackOnboardingStart,
  trackOnboardingStepView,
  trackOnboardingStepCompleted,
  trackOnboardingStepAbandoned,
  trackOnboardingCompleted,
} from '@/lib/analytics/onboarding-tracker'

interface OnboardingContextType {
  currentStep: number
  data: OnboardingData
  setStep: (step: number) => void
  updateData: (data: Partial<OnboardingData>) => void
  nextStep: () => void
  previousStep: () => void
  reset: () => void
  clearOnboardingData: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({})
  const startTimeRef = useRef<number>(Date.now())
  const stepStartTimeRef = useRef<number>(Date.now())
  const previousStepRef = useRef<number>(1)

  useEffect(() => {
    // Always start from step 1 - don't load saved step
    // Clear any existing step data to ensure fresh start
    clearOnboardingStep()
    const savedData = getOnboardingData()
    setCurrentStep(1)
    setData(savedData)
    
    // Track onboarding start
    startTimeRef.current = Date.now()
    stepStartTimeRef.current = Date.now()
    trackOnboardingStart()
  }, [])

  // Track step views and time spent
  useEffect(() => {
    if (currentStep !== previousStepRef.current) {
      const timeSpent = Date.now() - stepStartTimeRef.current
      
      // Track view of new step
      trackOnboardingStepView(currentStep, previousStepRef.current)
      
      // Track abandonment of previous step if user spent significant time (> 3 seconds)
      if (previousStepRef.current > 0 && timeSpent > 3000) {
        trackOnboardingStepAbandoned(previousStepRef.current, timeSpent)
      }
      
      // Reset step timer
      stepStartTimeRef.current = Date.now()
      previousStepRef.current = currentStep
    }
  }, [currentStep])

  const setStep = (step: number) => {
    const timeSpent = Date.now() - stepStartTimeRef.current
    
    // Track completion of current step before moving
    if (currentStep > 0 && step > currentStep) {
      trackOnboardingStepCompleted(currentStep, timeSpent)
    }
    
    setCurrentStep(step)
    saveOnboardingStep(step)
  }

  const updateData = (newData: Partial<OnboardingData>) => {
    const updated = { ...data, ...newData }
    setData(updated)
    saveOnboardingData(newData)
  }

  const nextStep = () => {
    const timeSpent = Date.now() - stepStartTimeRef.current
    const next = currentStep + 1
    
    // Track completion of current step
    trackOnboardingStepCompleted(currentStep, timeSpent)
    
    // Track onboarding completion if this is the last step
    if (next > 18) {
      const totalTime = Date.now() - startTimeRef.current
      trackOnboardingCompleted(totalTime, 18)
    }
    
    setStep(next)
  }

  const previousStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1
      setStep(prev)
    }
  }

  const reset = () => {
    setStep(1)
    setData({})
    saveOnboardingData({})
  }

  const handleClearOnboardingData = () => {
    clearOnboardingData()
    setData({})
  }

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        data,
        setStep,
        updateData,
        nextStep,
        previousStep,
        reset,
        clearOnboardingData: handleClearOnboardingData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

