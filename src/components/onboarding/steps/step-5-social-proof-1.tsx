'use client'

import React from 'react'
import Image from 'next/image'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star } from 'lucide-react'

export function Step5SocialProof1() {
  const { nextStep } = useOnboarding()

  return (
    <OnboardingCard currentStep={11} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Join 1,200+ creators, freelancers, and agencies
          </h1>
          <p className="text-gray-600 text-sm">
            Creating scroll-stopping feeds every day
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-black">1,200+</div>
            <div className="text-xs text-gray-600 mt-1">Active Users</div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-black">50K+</div>
            <div className="text-xs text-gray-600 mt-1">Mockups Created</div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=100&h=100&fit=crop&q=80"
                alt="Jess Martinez"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-black">Jess Martinez, Freelance Social Media Manager:</span>{' '}
                "I used to spend 6–8 hours creating mockups for client pitches. Now I upload their logo, pick a vibe, and have a full aesthetic feed ready in under 5 minutes."
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={nextStep}
            size="lg"
            className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft h-12 transition-all duration-300 ease-out transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />
          </Button>
        </div>
      </div>
    </OnboardingCard>
  )
}

