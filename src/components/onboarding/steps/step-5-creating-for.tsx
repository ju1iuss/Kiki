'use client'

import React, { useState, useEffect } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowRight } from 'lucide-react'

const options = [
  { value: 'own-brand', label: 'My own brand\'s content' },
  { value: 'client-projects', label: 'Client projects (I\'m a freelancer/SMM)' },
  { value: 'influencer', label: 'Influencer / creator content' },
  { value: 'agency', label: 'Agency / team projects' },
  { value: 'exploring', label: 'Just exploring' },
]

export function Step5CreatingFor() {
  const { nextStep, updateData, data } = useOnboarding()
  const [selected, setSelected] = useState<string>(data.creatingFor?.[0] || '')

  const handleContinue = () => {
    if (selected) {
      updateData({ creatingFor: [selected] })
      nextStep()
    }
  }

  return (
    <OnboardingCard currentStep={13} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            What are you creating?
          </h1>
          <p className="text-gray-600 text-xs">
            This helps us personalize your experience
          </p>
        </div>

        <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className={`
                flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all
                ${selected === option.value
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span className="text-sm font-medium text-black">{option.label}</span>
            </label>
          ))}
        </RadioGroup>

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

