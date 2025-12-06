'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { InstagramGrid } from '../instagram-grid'
import { ArrowRight } from 'lucide-react'
import { getClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'
import { saveOnboardingImages } from '@/lib/onboarding-storage'

// Mock generated images per category - replace with real data later
const mockMockupsByCategory = {
  stories: ['/image1.png', '/image2.png', '/image3.png'],
  posts: ['/image4.png', '/image5.png', '/image6.png'],
  pinterest: ['/image7.png', '/image8.png', '/image9.png'],
}

const activityFeed = [
  { name: 'Emma', action: 'exported 6 mockups', time: '2 min ago' },
  { name: 'Marcus', action: 'saved a Minimal pack', time: '5 min ago' },
  { name: 'Jess', action: 'created 12 mockups', time: '8 min ago' },
]

export function Step10Dashboard() {
  const router = useRouter()
  const { data, clearOnboardingData, nextStep } = useOnboarding()
  const supabase = getClient()
  const [userName, setUserName] = useState('')
  const [currentActivity, setCurrentActivity] = useState(0)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Use name from onboarding data if available, otherwise use email
        const name = data?.name || user.email?.split('@')[0] || 'there'
        setUserName(name)
      }
    }
    getUser()
  }, [supabase, data?.name])

  useEffect(() => {
    // Show continue button after 3 seconds
    const timer = setTimeout(() => {
      setShowContinueButton(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Rotate activity feed
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activityFeed.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleContinue = async () => {
    if (isSaving) return // Prevent multiple clicks
    
    setIsSaving(true)
    
    // Save images to database before redirecting (with retry logic)
    const generatedImages = data?.generatedImages || []
    const logo = data?.logo || null
    
    if (generatedImages.length > 0) {
      // Use the saveOnboardingImages function which has retry logic
      const saved = await saveOnboardingImages(3)
      if (!saved) {
        console.warn('Failed to save images, but continuing to dashboard')
      }
    }
    
    // Small delay to ensure save completes
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Clear onboarding data and redirect to dashboard
    clearOnboardingData()
    router.push('/dashboard')
  }

  // Use generated images from onboarding data, fallback to mock images
  const generatedImages = data?.generatedImages || []
  const currentImages = generatedImages.length > 0 ? generatedImages : mockMockupsByCategory.stories

  return (
    <OnboardingCard currentStep={15} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Welcome, {userName || 'there'}!
          </h1>
          <p className="text-gray-600 text-sm">
            Your aesthetic pack is ready. Here's what's inside:
          </p>
        </div>

        {/* Mockups Grid - 3 images from stories */}
        <InstagramGrid images={currentImages} />

        {/* Activity Feed */}
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <span className="font-medium text-black">{activityFeed[currentActivity].name}</span>{' '}
            {activityFeed[currentActivity].action}{' '}
            <span className="text-xs text-gray-500">({activityFeed[currentActivity].time})</span>
          </p>
        </div>

        {/* Continue Button - Animated in after 3 seconds */}
        <AnimatePresence>
          {showContinueButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-2"
            >
              <Button
                onClick={handleContinue}
                size="lg"
                disabled={isSaving}
                className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Go to Dashboard'}
                <ArrowRight className={`ml-2 w-5 h-5 text-[#FF006F] ${isSaving ? 'animate-pulse' : ''}`} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Tutorial Placeholder */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            💡 Tip: Click any image to swap colors, edit text, or regenerate
          </p>
        </div>
      </div>
    </OnboardingCard>
  )
}

