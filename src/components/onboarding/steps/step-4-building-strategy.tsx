'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const loadingSteps = [
  { id: 1, text: 'Analyzing your brand aesthetic' },
  { id: 2, text: 'Preparing AI mockup templates' },
  { id: 3, text: 'Generating your aesthetic pack' },
]

const testimonials = [
  { 
    name: 'Jess Martinez', 
    role: 'Freelance Social Media Manager', 
    quote: 'I closed 2 clients in one week because they could see their brand instead of imagining it.',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=100&h=100&fit=crop&q=80'
  },
  { 
    name: 'Emma Larsson', 
    role: 'Jewelry Brand Founder', 
    quote: 'I uploaded my logo, picked minimal, and suddenly my feed looks like a real brand.',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop&q=80'
  },
  { 
    name: 'Marcus Chen', 
    role: 'SMM Consultant', 
    quote: 'Game changer for credibility. I just send clients a link with 12 mockups using their logo.',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=100&h=100&fit=crop&q=80'
  },
  { 
    name: 'Zoe Kim', 
    role: 'Lifestyle Influencer', 
    quote: 'I went from 0 brand deals to 3 paid collabs in 2 months after fixing my aesthetic.',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop&q=80'
  },
  { 
    name: 'Sarah Okafor', 
    role: 'Social Media Strategist', 
    quote: 'Went from trust me, it\'ll look good to here\'s exactly what your Instagram will look like.',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=100&h=100&fit=crop&q=80'
  },
]

export function Step4BuildingStrategy() {
  const { nextStep } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(0)
  const [showContinue, setShowContinue] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    // Cycle through steps faster - 0.8 seconds per step
    const timers: NodeJS.Timeout[] = []
    
    loadingSteps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentStep(index + 1)
        
        // After the last step, mark it as completed and show continue button
        if (index === loadingSteps.length - 1) {
          setTimeout(() => {
            setCurrentStep(loadingSteps.length + 1) // Mark all steps as completed
            setShowContinue(true)
          }, 800) // Wait for the step animation to complete
        }
      }, (index + 1) * 800) // 0.8 seconds per step (faster)
      
      timers.push(timer)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    // Rotate testimonials every 2 seconds
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <OnboardingCard currentStep={8} totalSteps={18}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Creating your aesthetic mockup pack...
          </h1>
        </div>

        {/* Loading Steps - New Design with Progress Dots */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const isActive = currentStep === index + 1
            const isCompleted = currentStep > index + 1
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isActive || isCompleted ? 1 : 0.5,
                  x: 0,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                {/* Animated Dot Loader */}
                <div className="flex-shrink-0 relative w-8 h-8">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-[#FF006F] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : isActive ? (
                    <div className="w-8 h-8 relative">
                      {/* Spinning ring */}
                      <div className="absolute inset-0 border-2 border-[#FF006F] border-t-transparent rounded-full animate-spin" />
                      {/* Pulsing dot */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#FF006F] rounded-full animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-50" />
                  )}
                </div>
                
                {/* Step Text */}
                <span
                  className={`text-base transition-colors duration-300 ${
                    isActive || isCompleted 
                      ? 'text-black font-semibold' 
                      : 'text-gray-400'
                  }`}
                >
                  {step.text}
                </span>
              </motion.div>
            )
          })}
          
          {/* Overall Progress Bar */}
          <div className="pt-2">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / loadingSteps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#FF006F] to-pink-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Scrolling Testimonials */}
        <div className="pt-4 border-t border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-200">
                  <Image
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-700">
                    <span className="font-medium text-black">
                      {testimonials[currentTestimonial].name}
                    </span>
                    {', '}
                    <span className="text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </span>
                    {': '}
                    <span className="italic">"{testimonials[currentTestimonial].quote}"</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Completion Message and Continue Button */}
        <AnimatePresence>
          {showContinue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-center text-lg font-semibold text-black font-marlinsoft">
                Your aesthetic pack is ready!
              </p>
              <Button
                onClick={nextStep}
                size="lg"
                className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft h-12 transition-all duration-300 ease-out transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign up to see your mockups
                <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingCard>
  )
}

