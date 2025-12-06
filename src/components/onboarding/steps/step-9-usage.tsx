'use client'

import React, { useState } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowRight } from 'lucide-react'

const usageOptions = [
  { value: '1-10', label: '1–10 (Casual)' },
  { value: '10-30', label: '10–30 (Regular)' },
  { value: '30-100', label: '30–100 (Heavy)' },
  { value: '100+', label: '100+ (Agency/Power user)' },
]

export function Step9Usage() {
  const { nextStep, updateData, data } = useOnboarding()
  const [selected, setSelected] = useState<string>(data.usage || '')

  const handleContinue = () => {
    if (selected) {
      updateData({ usage: selected })
      nextStep()
    }
  }

  return (
    <OnboardingCard currentStep={9} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            How many visuals do you usually create each month?
          </h1>
        </div>

        <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2">
          {usageOptions.map((option) => (
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

        {/* Social Proof */}
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            Most social media managers create 30–100 visuals/month and save 5+ hours/week with unlimited exports.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={!selected}
            className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft"
          >
            Show me my plan
            <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />
          </Button>
        </div>
      </div>
    </OnboardingCard>
  )
}

