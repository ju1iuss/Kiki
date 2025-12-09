'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { useAuth, useUser } from '@clerk/nextjs'
import { saveOnboardingImages } from '@/lib/onboarding-storage'

export function Step4Signup() {
  const router = useRouter()
  const { nextStep, updateData } = useOnboarding()
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()

  // Check if user is already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const userEmail = user.emailAddresses?.[0]?.emailAddress || ''
      updateData({ email: userEmail })
      // Save onboarding images if user is already authenticated
      saveOnboardingImages().then(() => {
        nextStep()
      })
    }
  }, [isLoaded, isSignedIn, user, updateData, nextStep])

  // Redirect to sign-up page if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-up?redirect=/onboarding')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <OnboardingCard currentStep={9} totalSteps={18}>
        <div className="space-y-4">
          <div className="text-center">Loading...</div>
        </div>
      </OnboardingCard>
    )
  }

  return null
}
