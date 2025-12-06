'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Step2Generating() {
  const { nextStep, data } = useOnboarding()
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [loadingStates, setLoadingStates] = useState<boolean[]>([true, true, true])
  const [showScanner, setShowScanner] = useState<boolean[]>([false, false, false])
  const [revealedImages, setRevealedImages] = useState<boolean[]>([false, false, false])
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [loadingPercentages, setLoadingPercentages] = useState<number[]>([2, 2, 2])

  // Get username and logo from data or use defaults
  // Also check localStorage as a backup
  const [profileImage, setProfileImage] = useState<string>('')
  const username = data?.name ? data.name.toLowerCase().replace(/\s+/g, '') : 'yourbrand'

  useEffect(() => {
    // Try to get logo from context first
    if (data?.logo) {
      setProfileImage(data.logo)
      console.log('Step2Generating - Got logo from context:', data.logo.substring(0, 50) + '...')
      return
    }

    // Fallback to localStorage
    try {
      const savedData = JSON.parse(localStorage.getItem('tasy_onboarding_data') || '{}')
      if (savedData.logo) {
        setProfileImage(savedData.logo)
        console.log('Step2Generating - Got logo from localStorage:', savedData.logo.substring(0, 50) + '...')
      } else {
        console.log('Step2Generating - No logo found in context or localStorage')
      }
    } catch (error) {
      console.error('Error reading logo from localStorage:', error)
    }
  }, [data?.logo])

  // Placeholder images (original images before transformation)
  const placeholderImages = ['/image1.png', '/image4.png', '/image7.png']

  // Animate loading percentages from 2% to 100% over 20 seconds
  useEffect(() => {
    const startTime = Date.now()
    const duration = 20000 // 20 seconds
    const updateInterval = 100 // Update every 100ms

    const percentageInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1) // 0 to 1
      const percentage = Math.floor(2 + (progress * 98)) // 2% to 100%

      setLoadingPercentages([percentage, percentage, percentage])

      if (percentage >= 100) {
        clearInterval(percentageInterval)
      }
    }, updateInterval)

    return () => clearInterval(percentageInterval)
  }, [])

  useEffect(() => {
    // Check if images are already generated in context
    if (data.generatedImages && Array.isArray(data.generatedImages) && data.generatedImages.length > 0) {
      setGeneratedImages(data.generatedImages)
      setLoadingStates(data.generatedImages.map(() => false))
      setLoadingPercentages([100, 100, 100])
      return
    }

    // Also check localStorage immediately
    try {
      const savedData = JSON.parse(localStorage.getItem('tasy_onboarding_data') || '{}')
      if (savedData.generatedImages && Array.isArray(savedData.generatedImages) && savedData.generatedImages.length > 0) {
        setGeneratedImages(savedData.generatedImages)
        setLoadingStates(savedData.generatedImages.map(() => false))
        setLoadingPercentages([100, 100, 100])
        return
      }
    } catch (error) {
      console.error('Error reading localStorage:', error)
    }

    // Poll for images more frequently if not ready yet
    const pollInterval = setInterval(() => {
      try {
        const savedData = JSON.parse(localStorage.getItem('tasy_onboarding_data') || '{}')
        if (savedData.generatedImages && Array.isArray(savedData.generatedImages) && savedData.generatedImages.length > 0) {
          setGeneratedImages(savedData.generatedImages)
          setLoadingStates(savedData.generatedImages.map(() => false))
          setLoadingPercentages([100, 100, 100])
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Error polling for images:', error)
      }
    }, 300) // Poll every 300ms for faster updates

    return () => clearInterval(pollInterval)
  }, [data.generatedImages])

  const handleImageLoad = (index: number) => {
    setLoadingStates(prev => {
      const newStates = [...prev]
      newStates[index] = false
      return newStates
    })
  }

  // Trigger scanner animation when all images are loaded
  useEffect(() => {
    const allLoaded = loadingStates.every(loaded => !loaded) && generatedImages.length === 3
    if (allLoaded) {
      // Start scanner animation for each image with slight delay
      setTimeout(() => setShowScanner([true, false, false]), 300)
      setTimeout(() => {
        setRevealedImages([true, false, false])
        setShowScanner([false, true, false])
      }, 1800) // 300ms + 1500ms animation
      setTimeout(() => {
        setRevealedImages([true, true, false])
        setShowScanner([false, false, true])
      }, 3300) // 1800ms + 1500ms animation
      setTimeout(() => {
        setRevealedImages([true, true, true])
        setShowScanner([false, false, false])
      }, 4800) // 3300ms + 1500ms animation
      
      // Show continue button immediately after last image is revealed
      setTimeout(() => {
        setShowContinueButton(true)
      }, 5000) // 4800ms + 200ms (much faster)
    }
  }, [loadingStates, generatedImages.length])

  // Use generated images if available, otherwise show placeholders
  const displayImages = generatedImages.length > 0 ? generatedImages : [null, null, null]

  return (
    <OnboardingCard currentStep={3} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Turn your brand into an aesthetic Instagram feed in 30 seconds
          </h2>
          <p className="text-sm text-gray-600">
            Your personalized mockups are ready to showcase your brand's unique style
          </p>
        </div>
        
        {/* Instagram Profile View */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Profile Image - Logo with more inset */}
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-200 p-2">
                {profileImage ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image 
                      src={profileImage} 
                      alt={username} 
                      width={48} 
                      height={48} 
                      className="object-contain max-w-full max-h-full" 
                      unoptimized
                      onError={(e) => {
                        console.error('Failed to load profile image:', profileImage)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-xl font-medium text-gray-400">{username[0].toUpperCase()}</span>
                )}
              </div>

              {/* Profile Stats */}
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-black">12</div>
                    <div className="text-xs text-gray-600">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-black">1.2K</div>
                    <div className="text-xs text-gray-600">followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-black">342</div>
                    <div className="text-xs text-gray-600">following</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-black">{username}</div>
              </div>
            </div>
          </div>

          {/* Posts Grid - Generated Images with Scanner Animation */}
          <div className="grid grid-cols-3 gap-0.5 bg-gray-200">
            {displayImages.map((imageUrl, index) => {
              const isRevealed = revealedImages[index]
              const isScanning = showScanner[index]

              return (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 relative overflow-hidden group"
                >
                  {/* Placeholder/Original Image */}
                  <div className={`absolute inset-0 transition-opacity duration-300 ${isRevealed ? 'opacity-0' : 'opacity-100'}`}>
                    <Image
                      src={placeholderImages[index]}
                      alt={`Original mockup ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Generated Image */}
                  {imageUrl ? (
                    <>
                      {loadingStates[index] && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                          <div className="relative w-16 h-16">
                            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-black">{loadingPercentages[index]}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className={`absolute inset-0 transition-opacity duration-300 ${
                        isRevealed ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <Image
                          src={imageUrl}
                          alt={`Post ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          onLoad={() => handleImageLoad(index)}
                          unoptimized
                        />
                      </div>
                      
                      {/* Scanner/Laser Animation */}
                      {isScanning && (
                        <div 
                          className="absolute inset-0 z-20 pointer-events-none"
                          style={{
                            animation: 'scan 1.5s ease-out forwards',
                          }}
                        >
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" 
                               style={{
                                 boxShadow: '0 0 20px 4px rgba(59, 130, 246, 0.6)',
                               }}
                          />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-4 text-white">
                          <span className="text-sm font-semibold">1.2K</span>
                          <span className="text-sm font-semibold">89</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                      <div className="relative w-16 h-16">
                        <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-black">{loadingPercentages[index]}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {showContinueButton && (
          <div className="pt-2" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <Button
              onClick={nextStep}
              size="lg"
              className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft"
            >
              Continue
              <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </OnboardingCard>
  )
}
