'use client'

import React from 'react'
import Image from 'next/image'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star } from 'lucide-react'

export function Step3SocialProof() {
  const { nextStep } = useOnboarding()

  // Chart data matching the specified dates and values
  const salesData = [
    { date: '4 Dec', value: 1000 },
    { date: '25 Dec', value: 2000 },
    { date: '15 Jan', value: 3000 },
    { date: '1 Feb', value: 4000 },
    { date: '22 Feb', value: 5000 },
  ]

  const maxValue = 5000 // $5K max
  const minValue = 0

  return (
    <OnboardingCard currentStep={6} totalSteps={18}>
      <div className="space-y-6">
        {/* Headline */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-marlinsoft">
          How Marcus closed 3 clients with AI mockups
        </h1>

        {/* Testimonial Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          {/* User Info */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=100&h=100&fit=crop&q=80"
                alt="Marcus Chen"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-black mb-1">Marcus Chen, SMM Consultant</div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-500 ml-1">2 weeks ago</span>
              </div>
            </div>
          </div>

          {/* Testimonial Text */}
          <p className="text-sm text-gray-700 mb-6 leading-relaxed">
            "My clients always asked, 'Can you show me what our feed will look like?' I'd fumble through Canva templates. Now I just send them a link with 12 mockups using their logo. Game changer for credibility."
          </p>

          {/* Sales Summary */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-xs text-gray-600 mb-1">Mockups Created</div>
                <div className="text-2xl font-bold text-black">150+</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">Last Month</div>
                <div className="text-sm font-semibold text-black">3 clients closed</div>
              </div>
            </div>
          </div>

          {/* Sales Graph */}
          <div className="space-y-2 pb-8">
            <div className="flex items-end justify-between gap-2 relative bg-gray-50 rounded p-3" style={{ height: '160px' }}>
              {/* Y-axis grid lines */}
              <div className="absolute inset-x-3 inset-y-3 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
              </div>
              
              {salesData.map((point, index) => {
                // Calculate height as pixels (20% to 100% of container)
                const heightPercent = (point.value / maxValue) * 100

                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end relative group z-10" style={{ height: '100%' }}>
                    {/* Bar - Black */}
                    <div
                      className="w-full bg-black rounded-t transition-all duration-300 hover:bg-gray-800 relative"
                      style={{ 
                        height: `${heightPercent}%`,
                        animation: `growUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    />
                    {/* Date label - show all dates */}
                    <div className="absolute -bottom-6 text-[10px] text-gray-600 font-medium whitespace-nowrap left-1/2 -translate-x-1/2">
                      {point.date}
                    </div>
                    {/* Y-axis labels positioned under specific dates */}
                    {index === 0 && (
                      <div className="absolute -bottom-10 text-xs text-gray-500 whitespace-nowrap left-1/2 -translate-x-1/2">$1K</div>
                    )}
                    {index === 2 && (
                      <div className="absolute -bottom-10 text-xs text-gray-500 whitespace-nowrap left-1/2 -translate-x-1/2">$3K</div>
                    )}
                    {index === 4 && (
                      <div className="absolute -bottom-10 text-xs text-gray-500 whitespace-nowrap left-1/2 -translate-x-1/2">$5K</div>
                    )}
                  </div>
                )
              })}
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

      <style jsx>{`
        @keyframes growUp {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </OnboardingCard>
  )
}

