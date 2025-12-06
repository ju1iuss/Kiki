'use client'

import React, { useState } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Step3Agreement() {
  const { nextStep, updateData } = useOnboarding()
  const [selected, setSelected] = useState<string | null>(null)

  const handleContinue = () => {
    if (selected) {
      updateData({ agreement: selected })
      nextStep()
    }
  }

  const options = [
    { value: 'strongly-disagree', emoji: '👎', label: 'Strongly Disagree' },
    { value: 'disagree', emoji: '👎', label: 'Disagree' },
    { value: 'neutral', emoji: '🤷', label: 'Neutral' },
    { value: 'agree', emoji: '👍', label: 'Agree' },
    { value: 'strongly-agree', emoji: '👍', label: 'Strongly Agree' },
  ]

  return (
    <OnboardingCard currentStep={4} totalSteps={18}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            If it works for 1,200+ social media managers, it can work for me too.
          </h1>
          <p className="text-gray-600 text-sm">
            Do you agree with the following statement?
          </p>
        </div>

        {/* Emoji Options */}
        <div className="flex items-center justify-center gap-4 md:gap-6">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                ${selected === option.value
                  ? 'bg-[#FF006F]/20 border-2 border-[#FF006F]'
                  : 'border-2 border-transparent hover:bg-gray-50'
                }
              `}
            >
              <span className="text-4xl md:text-5xl">{option.emoji}</span>
              {option.label && (
                <span className="text-xs text-gray-600 text-center max-w-[80px]">
                  {option.label}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={!selected}
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

