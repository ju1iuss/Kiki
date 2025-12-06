'use client'

import React, { useState } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, User, Loader2 } from 'lucide-react'
import Image from 'next/image'

export function Step7Name() {
  const { nextStep, updateData, data } = useOnboarding()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generatedImages = data?.generatedImages || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || name.trim().length < 2) {
      setError('Please enter your name')
      return
    }

    updateData({ name: name.trim() })
    
    // Show loader animation
    setIsGenerating(true)
    
    // Wait for animation (2-3 seconds)
    setTimeout(() => {
      setIsGenerating(false)
      nextStep()
    }, 2500)
  }

  return (
    <OnboardingCard currentStep={10} totalSteps={18} hideBackButton={true}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Thanks for signing up!
          </h1>
          <p className="text-gray-600 text-sm">
            What's your name?
          </p>
        </div>

        {error && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="relative transition-all duration-300 ease-out">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-all duration-300" />
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="pl-10 bg-gray-50 border-gray-300 text-black h-12 transition-all duration-300 ease-out focus-visible:ring-0 focus-visible:border-gray-400 focus-visible:shadow-none"
              autoFocus
            />
          </div>

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center">Your generated mockups</p>
              <div className="grid grid-cols-3 gap-2">
                {generatedImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={image}
                      alt={`Generated mockup ${index + 1}`}
                      fill
                      className={`object-cover transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
                      unoptimized
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <Button
            type="submit"
            size="lg"
            disabled={!name || name.trim().length < 2 || isGenerating}
            className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft h-12 transition-all duration-300 ease-out transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate more
            <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />
          </Button>
        </form>
      </div>
    </OnboardingCard>
  )
}

