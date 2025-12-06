'use client'

import React from 'react'
import Image from 'next/image'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Heart } from 'lucide-react'

export function Step5SocialProof2() {
  const { nextStep } = useOnboarding()

  return (
    <OnboardingCard currentStep={12} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Why social media managers love this tool
          </h1>
          <p className="text-gray-600 text-sm">
            Built for speed, designed for results
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Zap className="w-5 h-5 text-[#FF006F] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-black text-sm">5 hours → 30 seconds</div>
              <div className="text-xs text-gray-600">Turn mockup work from days into minutes</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Shield className="w-5 h-5 text-[#FF006F] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-black text-sm">No design skills needed</div>
              <div className="text-xs text-gray-600">Upload logo, pick vibe, get mockups. That's it.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Heart className="w-5 h-5 text-[#FF006F] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-black text-sm">Rated 4.8/5 by freelancers</div>
              <div className="text-xs text-gray-600">Used to close $50k+ in client deals last month</div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop&q=80"
                alt="Sarah Okafor"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-black">Sarah Okafor, Social Media Strategist:</span>{' '}
                "Honestly, this tool paid for itself in the first pitch. I went from 'trust me, it'll look good' to 'here's exactly what your Instagram will look like.' Instant authority."
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

