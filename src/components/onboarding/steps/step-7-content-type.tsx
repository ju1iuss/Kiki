'use client'

import React, { useState } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const contentTypes = [
  'Product photos / mockups',
  'Quotes / tips / educational',
  'Behind-the-scenes / lifestyle',
  'Fashion / beauty / style',
  'Food / beverage',
  'Services / B2B',
  'Other',
]

export function Step7ContentType() {
  const { nextStep, updateData, data } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.contentType || [])

  const toggleSelection = (type: string) => {
    if (selected.includes(type)) {
      setSelected(selected.filter((t) => t !== type))
    } else {
      setSelected([...selected, type])
    }
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      updateData({ contentType: selected })
      nextStep()
    }
  }

  return (
    <OnboardingCard currentStep={17} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            What do you post most?
          </h1>
          <p className="text-gray-600 text-xs">
            Select all that apply—we'll show you relevant templates
          </p>
        </div>

        <div className="space-y-2">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => toggleSelection(type)}
              className={`
                w-full p-3 rounded-xl border-2 transition-all text-left
                ${selected.includes(type)
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${selected.includes(type)
                      ? 'border-black bg-black'
                      : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  {selected.includes(type) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-black">{type}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={selected.length === 0}
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

