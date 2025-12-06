'use client'

import React, { useState } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Step3GoalSelection() {
  const { nextStep, updateData, data } = useOnboarding()
  const [selectedGoal, setSelectedGoal] = useState<string>(data.goal || 'design-feed')

  const handleContinue = () => {
    updateData({ goal: selectedGoal })
    nextStep()
  }

  return (
    <OnboardingCard currentStep={7} totalSteps={18}>
      <div className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            What are you creating?
          </h1>
          <p className="text-gray-600 text-xs">
            This helps us personalize your experience and show relevant templates
          </p>
        </div>

        {/* Three options side by side */}
        <div className="grid grid-cols-3 gap-2">
            {/* My own brand's content */}
            <label
              onClick={() => setSelectedGoal('design-feed')}
              className={`
                relative p-3 rounded-xl border-2 cursor-pointer transition-all
                ${selectedGoal === 'design-feed'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {selectedGoal === 'design-feed' && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black border-2 border-white"></div>
              )}
              <div className="flex flex-col items-center gap-1.5 pt-0.5">
                {/* Instagram icon */}
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="32" height="32" rx="8" stroke="#999" strokeWidth="2"/>
                  <circle cx="24" cy="24" r="8" stroke="#999" strokeWidth="2"/>
                  <circle cx="32" cy="16" r="2" fill="#999"/>
                </svg>
                <span className="text-xs font-medium text-black text-center leading-tight">My own brand's content</span>
              </div>
            </label>

            {/* Client projects */}
            <label
              onClick={() => setSelectedGoal('client-content')}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedGoal === 'client-content'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {selectedGoal === 'client-content' && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black border-2 border-white"></div>
              )}
              <div className="flex flex-col items-center gap-1.5 pt-0.5">
                {/* Briefcase icon */}
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="12" y="14" width="24" height="20" rx="2" stroke="#999" strokeWidth="2"/>
                  <path d="M18 14V10C18 8.89543 18.8954 8 20 8H28C29.1046 8 30 8.89543 30 10V14" stroke="#999" strokeWidth="2"/>
                  <path d="M20 22H28" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-xs font-medium text-black text-center leading-tight">Client projects (I'm a freelancer/SMM)</span>
              </div>
            </label>

            {/* Influencer/creator content */}
            <label
              onClick={() => setSelectedGoal('build-brand')}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedGoal === 'build-brand'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {selectedGoal === 'build-brand' && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black border-2 border-white"></div>
              )}
              <div className="flex flex-col items-center gap-1.5 pt-0.5">
                {/* Growth/trending icon */}
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 32L18 24L24 28L30 18L36 22" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 32L18 24L24 28L30 18L36 22" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="32" r="2" fill="#999"/>
                  <circle cx="36" cy="22" r="2" fill="#999"/>
                </svg>
                <span className="text-xs font-medium text-black text-center leading-tight">Influencer / creator content</span>
              </div>
            </label>
          </div>

        <div className="pt-2">
          <Button
            onClick={handleContinue}
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

