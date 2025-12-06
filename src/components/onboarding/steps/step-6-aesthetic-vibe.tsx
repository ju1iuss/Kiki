'use client'

import React, { useState } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const vibes = [
  { id: 'minimal', label: 'Minimal / Clean', color: '#000000', desc: 'whites, grays, simple lines' },
  { id: 'bold', label: 'Bold / High-Contrast', color: '#000000', desc: 'blacks, neons, dramatic' },
  { id: 'luxury', label: 'Luxury / Editorial', color: '#C77DFF', desc: 'golds, serif fonts, elegant' },
  { id: 'cozy', label: 'Cozy / Lifestyle', color: '#4A90E2', desc: 'warm tones, candid photos' },
  { id: 'playful', label: 'Playful / Colorful', color: '#FFB800', desc: 'bright pops, fun fonts' },
  { id: 'earthy', label: 'Earthy / Natural', color: '#FF006F', desc: 'greens, browns, organic textures' },
]

export function Step6AestheticVibe() {
  const { nextStep, updateData, data } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.aestheticVibe || [])

  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((v) => v !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      updateData({ aestheticVibe: selected })
      nextStep()
    }
  }

  return (
    <OnboardingCard currentStep={16} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Pick your vibe—which aesthetic speaks to you?
          </h1>
          <p className="text-gray-600 text-xs">
            This is your "Aha" moment—see yourself reflected in the tool
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {vibes.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => toggleSelection(vibe.id)}
              className={`
                p-3 rounded-xl border-2 transition-all text-left
                ${selected.includes(vibe.id)
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: selected.includes(vibe.id) ? vibe.color : '#e5e7eb',
                    backgroundColor: selected.includes(vibe.id) ? vibe.color : 'transparent',
                  }}
                >
                  {selected.includes(vibe.id) && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-xs font-medium text-black">{vibe.label}</span>
              </div>
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="p-2 bg-[#FF006F]/10 border border-[#FF006F]/20 rounded-lg">
            <p className="text-xs text-[#FF006F]">
              <span className="font-medium">Emma</span> just created 12 mockups in the{' '}
              {vibes.find((v) => selected.includes(v.id))?.label} style{' '}
              <span className="text-xs text-gray-500">(2 min ago)</span>
            </p>
          </div>
        )}

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

