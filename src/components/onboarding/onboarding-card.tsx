'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ProgressIndicator } from './progress-indicator'
import { useOnboarding } from './onboarding-context'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react'

interface OnboardingCardProps {
  children: React.ReactNode
  className?: string
  currentStep?: number
  totalSteps?: number
  hideBackButton?: boolean
}

export function OnboardingCard({ children, className, currentStep, totalSteps, hideBackButton = false }: OnboardingCardProps) {
  const { previousStep, currentStep: contextStep } = useOnboarding()
  // Always use contextStep (actual step number) for back button logic
  const canGoBack = contextStep > 1 && !hideBackButton

  return (
    <div className="min-h-screen bg-[#191919] relative overflow-hidden">
      {/* Back Button */}
      {canGoBack && (
        <button
          onClick={previousStep}
          className="absolute top-6 left-6 z-50 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Progress Indicator */}
      {currentStep && totalSteps && (
        <ProgressIndicator current={currentStep} total={totalSteps} />
      )}

      {/* Background pattern - abstract shapes */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-32 bg-[#1a0014] rounded-lg rotate-12 blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-40 right-20 w-48 h-24 bg-[#1a0014] rounded-lg -rotate-12 blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-56 h-28 bg-[#1a0014] rounded-lg rotate-45 blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-40 h-20 bg-[#1a0014] rounded-lg -rotate-45 blur-2xl animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}></div>
      </div>

      {/* Card positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 md:p-6 md:pb-8">
        <div
          className={cn(
            'bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto',
            'px-6 py-6 md:px-8 md:py-8',
            'max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
            className
          )}
        >
          <motion.div
            key={contextStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

