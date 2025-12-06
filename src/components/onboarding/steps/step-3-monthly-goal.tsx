'use client'

import React, { useState } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Step3MonthlyGoal() {
  const { nextStep, updateData, data } = useOnboarding()
  const [value, setValue] = useState<number>(data.monthlyPostsGoal || 50)

  const handleContinue = () => {
    updateData({ monthlyPostsGoal: value })
    nextStep()
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(e.target.value, 10))
  }

  return (
    <OnboardingCard currentStep={5} totalSteps={18}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            How many visuals do you create each month?
          </h1>
          <p className="text-gray-600 text-sm">
            This helps us recommend the right plan for your workflow
          </p>
        </div>

        {/* Value Display */}
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-bold text-black font-marlinsoft">
            {value}
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={value}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #000 0%, #000 ${(value / 200) * 100}%, #e5e7eb ${(value / 200) * 100}%, #e5e7eb 100%)`
              }}
            />
            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #000;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #000;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
            `}</style>
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-gray-600">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200+</span>
          </div>
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

