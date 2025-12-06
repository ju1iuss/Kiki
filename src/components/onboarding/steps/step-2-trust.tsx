'use client'

import React from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Step2Trust() {
  const { nextStep } = useOnboarding()

  return (
    <OnboardingCard currentStep={2} totalSteps={18}>
      <div className="space-y-6">
        {/* Headline */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-marlinsoft">
            Join 1,200+ social media managers creating scroll-stopping feeds
          </h1>
        </div>


        {/* Quote Box */}
        <div className="relative p-6 bg-[#FF006F] rounded-xl">
          {/* Large quotation mark icon */}
          <div className="absolute top-4 right-4">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-20"
            >
              <path 
                d="M14 20C14 16 16 14 20 14C24 14 26 16 26 20C26 24 24 26 20 26C18 26 16.5 25.5 16 24.5M32 20C32 16 34 14 38 14C42 14 44 16 44 20C44 24 42 26 38 26C36 26 34.5 25.5 34 24.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="text-gray-700"
              />
            </svg>
          </div>
          
          {/* Quote Text */}
          <div className="text-center space-y-2">
            <p className="text-base md:text-lg text-gray-800 font-medium leading-relaxed">
              "Turn any brand into an aesthetic Instagram feed in 30 seconds—no designer needed."
            </p>
            <p className="text-sm text-gray-700 font-medium">
              Trusted by freelancers, agencies & creators
            </p>
          </div>
        </div>

        {/* Featured In */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Used by creators worldwide:
          </p>
          
          {/* Publication Logos */}
          <div className="flex items-center gap-6 justify-center">
            {/* Social Media Managers */}
            <div className="text-gray-800 font-bold text-lg tracking-tight">
              SMMs
            </div>
            
            {/* Agencies */}
            <div className="text-gray-800 font-bold text-lg">
              Agencies
            </div>
            
            {/* Creators */}
            <div className="text-gray-800 font-medium text-sm">
              Creators
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={nextStep}
            size="lg"
            className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />
          </Button>
        </div>
      </div>
    </OnboardingCard>
  )
}
