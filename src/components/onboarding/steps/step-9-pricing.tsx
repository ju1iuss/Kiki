'use client'

import React, { useState, useEffect } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowRight, Check, X, Lock, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { EmbeddedCheckout } from '@/components/embedded-checkout'
import { useRouter } from 'next/navigation'

const pricingPlans = [
  {
    id: 'starter',
    label: 'Try out',
    price: 9.99,
    credits: 240,
    generations: 48, // 240 credits / 5 credits per generation
    days: 30,
    tagline: 'For solo creators & new brands',
  },
  {
    id: 'pro',
    label: 'Starter',
    price: 29.00,
    credits: 720,
    generations: 144, // 720 credits / 5 credits per generation
    days: 30,
    mostPopular: true,
    tagline: 'For freelancers & growing brands',
  },
  {
    id: 'business',
    label: 'Business',
    price: 99.00,
    credits: 1999,
    generations: 399, // 1999 credits / 5 credits per generation
    days: 30,
    tagline: 'For agencies & power users',
  },
]

const loadingSteps = [
  { id: 1, text: 'Calculating your perfect plan' },
  { id: 2, text: 'Analyzing your usage patterns' },
  { id: 3, text: 'Preparing pricing options' },
  { id: 4, text: 'Ready to choose your plan' },
]

export function Step9Pricing() {
  const { nextStep, updateData, data } = useOnboarding()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('starter')
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showPricing, setShowPricing] = useState(false)
  const [showSkipButton, setShowSkipButton] = useState(false)
  const [showDiscountPlan, setShowDiscountPlan] = useState(false)
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false)
  const [showDiscountCross, setShowDiscountCross] = useState(false)
  const [timeLeft, setTimeLeft] = useState(12 * 60 * 60) // Timer in seconds (12 hours)
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  
  const generatedImages = data?.generatedImages || []

  useEffect(() => {
    // Show checkmarks sequentially, each after 1.2 seconds
    const timers: NodeJS.Timeout[] = []
    
    loadingSteps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id])
        
        // After the last step, show pricing
        if (index === loadingSteps.length - 1) {
          setTimeout(() => {
            setShowPricing(true)
          }, 500)
        }
      }, (index + 1) * 1200) // 1.2 seconds per step
      
      timers.push(timer)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    // Show skip button 5 seconds after pricing is shown (after loader completes)
    if (showPricing && !showDiscountPlan) {
      const timer = setTimeout(() => {
        setShowSkipButton(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showPricing, showDiscountPlan])

  useEffect(() => {
    // Timer countdown
    if (showPricing && !showDiscountPlan) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [showPricing, showDiscountPlan])

  useEffect(() => {
    // Show discount cross button 5 seconds after special offer becomes visible
    if (showDiscountPlan) {
      const timer = setTimeout(() => {
        setShowDiscountCross(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showDiscountPlan])

  const handleContinue = async () => {
    if (!selectedPlan) return;

    // For all plans (including discount), start checkout
    setIsLoadingCheckout(true)
    setCheckoutError(null)
    try {
      const isDiscountPlan = selectedPlan === 'starter-discount'
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: isDiscountPlan ? 'starter' : selectedPlan, 
          interval: 'monthly', 
          uiMode: 'embedded',
          promotionCode: isDiscountPlan ? 'promo_1SbPbTLbnEoK1sp4V9XHzehT' : undefined
        }),
      })

      const checkoutData = await res.json()
      if (checkoutData.client_secret) {
        setClientSecret(checkoutData.client_secret)
        setShowCheckout(true)
      } else {
        throw new Error(checkoutData.error || 'Failed to create checkout')
      }
    } catch (error) {
      console.error('Error:', error)
      setCheckoutError('Failed to start checkout. Please try again.')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  const handleBackFromCheckout = () => {
    setShowCheckout(false)
    setClientSecret(null)
    setCheckoutError(null)
  }

  const handleCheckoutSuccess = () => {
    updateData({ selectedPlan })
    // Continue to next step in onboarding instead of redirecting
    nextStep()
  }

  const handleSkip = () => {
    setIsLoadingDiscount(true)
    setTimeout(() => {
      setIsLoadingDiscount(false)
      setShowDiscountPlan(true)
      setSelectedPlan('starter-discount')
    }, 2000)
  }

  const handleDiscountContinue = async () => {
    setIsLoadingCheckout(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: 'starter', 
          interval: 'monthly', 
          uiMode: 'embedded',
          promotionCode: 'promo_1SbPbTLbnEoK1sp4V9XHzehT'
        }),
      })

      const checkoutData = await res.json()
      if (checkoutData.client_secret) {
        setClientSecret(checkoutData.client_secret)
        setSelectedPlan('starter-discount')
        setShowCheckout(true)
      } else {
        throw new Error(checkoutData.error || 'Failed to create checkout')
      }
    } catch (error) {
      console.error('Error:', error)
      setCheckoutError('Failed to start checkout. Please try again.')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan)
  
  const discountPlan = {
    id: 'starter-discount',
    label: 'Starter',
    originalPrice: 9.99,
    discountedPrice: 2.00,
    credits: 240,
    generations: 48,
    days: 30,
    tagline: 'Limited time offer - 60% off',
  }

  return (
    <OnboardingCard currentStep={14} totalSteps={18}>
      {showCheckout ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <button
              onClick={handleBackFromCheckout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to plans
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
              Complete Your Subscription
            </h1>
            <p className="text-gray-600 text-sm">
              {selectedPlanData ? `${selectedPlanData.label} Plan - €${selectedPlanData.price}/month` : 'Complete your purchase'}
            </p>
          </div>

          {checkoutError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {checkoutError}
            </div>
          )}

          {clientSecret ? (
            <EmbeddedCheckout
              clientSecret={clientSecret}
              onComplete={handleCheckoutSuccess}
              onError={(error) => {
                console.error('Checkout error:', error);
                setCheckoutError('An error occurred during checkout. Please try again.');
              }}
            />
          ) : (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
      ) : !showPricing ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
              Finding your perfect plan...
            </h1>
          </div>

          {/* Loading Steps */}
          <div className="space-y-3">
            {loadingSteps.map((step) => {
              const isCompleted = completedSteps.includes(step.id)
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: isCompleted ? 1 : 0.4,
                    y: 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gray-50 border-[#FF006F]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#FF006F] border-[#FF006F]'
                          : 'bg-transparent border-gray-300'
                      }`}
                    >
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-4 h-4 text-black" />
                        </motion.div>
                      )}
                    </div>
                    <span
                      className={`text-sm transition-colors duration-300 ${
                        isCompleted ? 'text-black font-medium' : 'text-gray-500'
                      }`}
                    >
                      {step.text}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : showDiscountPlan ? (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-1 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
                    Special Offer - Start for 2€ now
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Limited time discount - Get started with our Starter plan
                  </p>
                </div>
                <AnimatePresence>
                  {showDiscountCross && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      onClick={() => nextStep()}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="relative block p-12 rounded-xl border-2 border-[#FF006F] bg-gradient-to-br from-[#FF006F]/10 to-[#FF006F]/5 cursor-pointer">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#FF006F] text-black text-xs font-semibold px-3 py-1 rounded-full">
                  60% OFF
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-black">{discountPlan.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{discountPlan.tagline}</p>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">{discountPlan.generations} generations</span>
                    <span className="mx-1">•</span>
                    <span>{discountPlan.credits} credits</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="mb-1">
                    <span className="text-lg font-bold text-black">€{(discountPlan.discountedPrice / discountPlan.days).toFixed(2)}</span>
                    <span className="text-xs text-gray-500">/day</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="text-gray-500 line-through">€{discountPlan.originalPrice.toFixed(2)}</span>
                    <span className="text-gray-400">/month</span>
                    <span className="text-black font-semibold ml-1">€{discountPlan.discountedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleDiscountContinue}
                size="lg"
                disabled={isLoadingCheckout}
                className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft"
              >
                {isLoadingCheckout ? 'Loading...' : 'Take 2€ offer Now'}
                {!isLoadingCheckout && <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
                  Unlock unlimited aesthetic packs for your brand
                </h1>
                <p className="text-gray-600 text-sm">
                  You've already created mockups. Keep the momentum going with a plan that fits your workflow.
                </p>
              </div>
              <AnimatePresence>
                {showSkipButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    onClick={handleSkip}
                    disabled={isLoadingDiscount}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Skip pricing"
                  >
                    {isLoadingDiscount ? (
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Generated Images - Single Row */}
          {generatedImages.length > 0 && (
            <div className="flex gap-1.5 w-full">
              {/* Show 3 generated images */}
              {generatedImages.map((image, index) => (
                <div key={index} className="relative flex-1 aspect-square rounded overflow-hidden border border-gray-200">
                  <Image
                    src={image}
                    alt={`Mockup ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
              {/* Show fewer locked placeholders with landing page images as background */}
              {Array.from({ length: 5 }).map((_, index) => {
                const backgroundImage = `/image${(index % 8) + 1}.png`
                return (
                  <div 
                    key={`placeholder-${index}`} 
                    className="relative flex-1 aspect-square rounded overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={backgroundImage}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Timer */}
          {timeLeft > 0 && (
            <div className="flex items-center justify-center gap-2 p-2 bg-[#FF006F]/10 rounded-lg">
              <span className="text-xs font-semibold text-[#FF006F]">
                Limited time offer expires in:
              </span>
              <span className="text-sm font-bold text-black">
                {Math.floor(timeLeft / 3600)}h:{(Math.floor((timeLeft % 3600) / 60)).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-2">
          {pricingPlans.map((plan) => {
            const dailyPrice = plan.price / plan.days
            const isSelected = selectedPlan === plan.id
            const isPro = plan.mostPopular

            return (
              <label
                key={plan.id}
                className={`
                  relative block p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${isSelected
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {/* Most Popular Badge */}
                {isPro && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-[#FF006F] text-black text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  {/* Radio Button */}
                  <RadioGroupItem value={plan.id} id={plan.id} className="mt-0.5 w-4 h-4" />

                  {/* Plan Details - Left Side */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-semibold text-black">
                        {plan.label}
                      </span>
                    </div>
                    {plan.tagline && (
                      <p className="text-xs text-gray-500 mb-1">{plan.tagline}</p>
                    )}
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">{plan.generations} gens</span>
                      <span className="mx-1">•</span>
                      <span>{plan.credits} credits</span>
                    </div>
                  </div>

                  {/* Prices - Right Side */}
                  <div className="text-right">
                    {/* Daily Price - Big */}
                    <div className="mb-0.5">
                      <span className="text-base font-bold text-black">
                        €{dailyPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">/day</span>
                    </div>

                    {/* Monthly Price - Small with strikethrough for Pro */}
                    <div className="text-xs">
                      {isPro ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="text-gray-400 line-through text-[10px]">
                            €{(plan.price * 1.4).toFixed(2)}/mo
                          </div>
                          <div className="text-[#FF006F] font-semibold">
                            €{plan.price.toFixed(2)}/mo
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600">
                          <span className="text-gray-500">€{plan.price.toFixed(2)}</span>
                          <span className="text-gray-400">/mo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            )
          })}
        </RadioGroup>

        {/* Footer Text */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 text-center">
            Start with a <span className="font-semibold text-black">1-week trial</span> • Cancel anytime
          </p>
        </div>

          <div className="pt-2">
            <Button
              onClick={handleContinue}
              size="lg"
              disabled={!selectedPlan || isLoadingCheckout}
              className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft"
            >
              {isLoadingCheckout ? 'Loading...' : 'Continue'}
              {!isLoadingCheckout && <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />}
            </Button>
          </div>
        </div>
      )}
    </OnboardingCard>
  )
}

