'use client'

/**
 * ONBOARDING PAGE
 * Main onboarding flow orchestrator
 */

import { useEffect, useRef, useState } from 'react'
import { OnboardingProvider } from '@/components/onboarding/onboarding-context'
import { motion } from 'motion/react'
import { Step1LogoUpload } from '@/components/onboarding/steps/step-1-logo-upload'
import { Step2Trust } from '@/components/onboarding/steps/step-2-trust'
import { Step2Generating } from '@/components/onboarding/steps/step-2-generating'
import { Step3Agreement } from '@/components/onboarding/steps/step-3-agreement'
import { Step3MonthlyGoal } from '@/components/onboarding/steps/step-3-monthly-goal'
import { Step3SocialProof } from '@/components/onboarding/steps/step-3-social-proof'
import { Step3GoalSelection } from '@/components/onboarding/steps/step-3-goal-selection'
import { Step4BuildingStrategy } from '@/components/onboarding/steps/step-4-building-strategy'
import { Step4Signup } from '@/components/onboarding/steps/step-4-signup'
import { Step7Name } from '@/components/onboarding/steps/step-7-name'
import { Step5SocialProof1 } from '@/components/onboarding/steps/step-5-social-proof-1'
import { Step5SocialProof2 } from '@/components/onboarding/steps/step-5-social-proof-2'
import { Step5CreatingFor } from '@/components/onboarding/steps/step-5-creating-for'
import { Step6AestheticVibe } from '@/components/onboarding/steps/step-6-aesthetic-vibe'
import { Step7ContentType } from '@/components/onboarding/steps/step-7-content-type'
import { Step8Platforms } from '@/components/onboarding/steps/step-8-platforms'
import { Step9Pricing } from '@/components/onboarding/steps/step-9-pricing'
import { Step10Dashboard } from '@/components/onboarding/steps/step-10-dashboard'
import { useOnboarding } from '@/components/onboarding/onboarding-context'
import { getClient } from '@/lib/supabase/client'
import { saveOnboardingImages } from '@/lib/onboarding-storage'

function OnboardingSteps() {
  const { currentStep, setStep, previousStep } = useOnboarding()
  const supabase = getClient()
  const isInitialMount = useRef(true)
  const isHandlingPopState = useRef(false)
  const previousStepRef = useRef(currentStep)

  // Handle browser back/forward navigation
  useEffect(() => {
    // Push initial state when component mounts
    if (isInitialMount.current) {
      window.history.pushState({ step: currentStep }, '', window.location.href)
      isInitialMount.current = false
      previousStepRef.current = currentStep
    }

    const handlePopState = () => {
      // If going back and not on step 1, go back one step in onboarding
      const stepBeforePop = previousStepRef.current
      if (stepBeforePop > 1 && !isHandlingPopState.current) {
        isHandlingPopState.current = true
        previousStep()
        // Push new state to replace the popped one and keep us on onboarding page
        window.history.pushState({ step: stepBeforePop - 1 }, '', window.location.href)
        previousStepRef.current = stepBeforePop - 1
        isHandlingPopState.current = false
      }
      // If on step 1, allow navigation away (to landing page)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [currentStep, previousStep])

  // Push history state when step changes forward (but not when handling popstate)
  useEffect(() => {
    if (!isInitialMount.current && !isHandlingPopState.current) {
      // Only push if moving forward
      if (currentStep > previousStepRef.current) {
        window.history.pushState({ step: currentStep }, '', window.location.href)
      }
      previousStepRef.current = currentStep
    }
  }, [currentStep])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // If user is logged in and on step 9 or earlier, advance to step 10 (name step)
      if (user && currentStep <= 9) {
        setStep(10)
      }
    }

    checkAuth()

    // Listen for auth state changes (handles OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Save onboarding images after signup
        await saveOnboardingImages()
        // User just logged in, advance to step 10 (name step)
        if (currentStep <= 9) {
          setStep(10)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, currentStep, setStep])

  const steps = [
    <Step1LogoUpload key="1" />,
    <Step2Trust key="2" />,
    <Step2Generating key="3" />,
    <Step3Agreement key="4" />,
    <Step3MonthlyGoal key="5" />,
    <Step3SocialProof key="6" />,
    <Step3GoalSelection key="7" />,
    <Step4BuildingStrategy key="8" />,
    <Step4Signup key="9" />,
    <Step7Name key="10" />,
    <Step5SocialProof1 key="11" />,
    <Step5SocialProof2 key="12" />,
    <Step5CreatingFor key="13" />,
    <Step9Pricing key="14" />,
    <Step10Dashboard key="15" />,
    <Step6AestheticVibe key="16" />,
    <Step7ContentType key="17" />,
    <Step8Platforms key="18" />,
  ]

  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    if (contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight)
        }
      }
      
      // Initial height
      updateHeight()
      
      // Watch for changes
      const resizeObserver = new ResizeObserver(updateHeight)
      resizeObserver.observe(contentRef.current)
      
      return () => resizeObserver.disconnect()
    }
  }, [currentStep])

  return (
    <motion.div
      animate={{ height: height || 'auto' }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      style={{ overflow: 'hidden' }}
    >
      <div ref={contentRef}>
        {steps[currentStep - 1] || steps[0]}
      </div>
    </motion.div>
  )
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingSteps />
    </OnboardingProvider>
  )
}
