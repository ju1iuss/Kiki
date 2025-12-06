'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const platforms = [
  { id: 'instagram', label: 'Instagram (Stories, Posts, Reels)', icon: '📷' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌' },
  { id: 'both', label: 'Both', icon: '📱' },
  { id: 'other', label: 'Other (Facebook, TikTok)', icon: '🌐' },
]

export function Step8Platforms() {
  const router = useRouter()
  const { updateData, data, clearOnboardingData } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.platforms || [])

  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((p) => p !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      updateData({ platforms: selected })
      clearOnboardingData()
      router.push('/dashboard')
    }
  }

  return (
    <OnboardingCard currentStep={18} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Where do you post most?
          </h1>
          <p className="text-gray-600 text-xs">
            We'll tailor mockup formats and aspect ratios for you
          </p>
        </div>

        <div className="space-y-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => toggleSelection(platform.id)}
              className={`
                w-full p-3 rounded-xl border-2 transition-all text-left
                ${selected.includes(platform.id)
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <div
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center ml-auto
                    ${selected.includes(platform.id)
                      ? 'border-black bg-black'
                      : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  {selected.includes(platform.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-black">{platform.label}</span>
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

