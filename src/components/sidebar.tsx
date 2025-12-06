'use client'

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Menu, X, Compass, Bookmark, Edit, Settings, LayoutDashboard, Puzzle, Check, ChevronRight, Palette } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  className?: string
}

const pricingPlans = [
  {
    id: 'starter',
    label: 'Try out',
    price: 9.99,
    credits: 240,
    tagline: 'For solo creators & new brands',
  },
  {
    id: 'pro',
    label: 'Starter',
    price: 29.00,
    credits: 720,
    mostPopular: true,
    tagline: 'For freelancers & growing brands',
  },
  {
    id: 'business',
    label: 'Business',
    price: 99.00,
    credits: 1999,
    tagline: 'For agencies & power users',
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [userPlan, setUserPlan] = useState<string>('starter') // Default to starter
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)

  // Map subscription plan enum to pricing plan ID
  const mapSubscriptionPlanToPricingPlan = (plan: string | null): string => {
    if (!plan) return 'starter'
    const planMap: Record<string, string> = {
      'basic': 'starter',
      'pro': 'pro',
      'business': 'business',
      'company': 'business',
    }
    return planMap[plan.toLowerCase()] || 'starter'
  }

  useEffect(() => {
    // Only fetch once on mount - empty dependency array ensures this runs only once
    const getUser = async () => {
      const supabase = getClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Fetch credits and subscription plan if user is authenticated
      if (user) {
        try {
          // Fetch profile to get subscription_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits, subscription_id')
            .eq('id', user.id)
            .single()

          if (profile) {
            // Set credits from profile
            setCredits(profile.credits || 0)

            // Fetch subscription plan - check for ANY active subscription (tasy.ai or tasy-viral)
            // First try to get subscription from profile.subscription_id
            if (profile.subscription_id) {
              const { data: subscription } = await supabase
                .from('subscriptions')
                .select('plan, status, is_active, product')
                .eq('id', profile.subscription_id)
                .single()

              if (subscription && subscription.is_active && subscription.status === 'active') {
                const planId = mapSubscriptionPlanToPricingPlan(subscription.plan)
                setUserPlan(planId)
                setHasActiveSubscription(true)
              }
            } else {
              // If no subscription_id in profile, check for any active subscription
              const { data: activeSubscriptions } = await supabase
                .from('subscriptions')
                .select('plan, status, is_active, product')
                .eq('user_id', user.id)
                .in('status', ['active', 'trialing'])
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)

              if (activeSubscriptions && activeSubscriptions.length > 0) {
                const subscription = activeSubscriptions[0]
                const planId = mapSubscriptionPlanToPricingPlan(subscription.plan)
                setUserPlan(planId)
                setHasActiveSubscription(true)
              }
            }
          }

          // Fallback: Try to fetch credits from API if profile credits not available
          if (!profile?.credits && profile?.credits !== 0) {
            try {
              const response = await fetch('/api/chrome-extension/auth')
              if (response.ok) {
                const data = await response.json()
                if (data.credits !== undefined) {
                  setCredits(data.credits)
                }
              }
            } catch (error) {
              console.error('Error fetching credits from API:', error)
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty array - only fetch once on mount


  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/saved', label: 'Saved', icon: Bookmark, inConstruction: true },
    { href: '/editor', label: 'Editor', icon: Edit },
    { href: '/brand', label: 'Brand', icon: Palette, inConstruction: true },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  const handlePlanChange = async (planId: string) => {
    // Don't allow changing to current plan
    if (planId === userPlan) {
      return
    }

    // Optimistically update UI immediately
    const previousPlan = userPlan
    setUserPlan(planId)
    setShowPricingDialog(false)

    // If user has active subscription, redirect to Stripe billing portal
    if (hasActiveSubscription) {
      try {
        console.log('🚀 User has active subscription, redirecting to billing portal')
        const res = await fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
          // Revert optimistic update on error
          setUserPlan(previousPlan)
          const errorData = await res.json().catch(() => ({ error: 'Failed to create portal session' }))
          throw new Error(errorData.error || 'Failed to open billing portal')
        }

        const portalData = await res.json()
        if (portalData.url) {
          console.log('✅ Redirecting to Stripe billing portal:', portalData.url)
          window.location.href = portalData.url
        } else {
          setUserPlan(previousPlan)
          throw new Error('No portal URL returned')
        }
      } catch (error) {
        console.error('💥 Error opening billing portal:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to open billing portal. Please try again.'
        alert(errorMessage)
      }
      return
    }

    // For users without subscription, start checkout
    try {
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: planId, 
          interval: 'monthly', 
          uiMode: 'hosted' // Use hosted checkout for sidebar
        }),
      })

      if (!res.ok) {
        // Revert optimistic update on error
        setUserPlan(previousPlan)
        const responseText = await res.text()
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText || 'Unknown error' }
        }
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to create checkout`)
      }

      const checkoutData = await res.json()
      
      if (checkoutData.url) {
        console.log('✅ Redirecting to Stripe checkout:', checkoutData.url)
        // Redirect to Stripe hosted checkout page
        window.location.href = checkoutData.url
      } else {
        setUserPlan(previousPlan)
        throw new Error(checkoutData.error || 'Failed to create checkout - no URL returned')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.'
      alert(errorMessage)
    }
  }


  const SidebarContent = () => {
    return (
      <>
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 px-3 py-6">
          {/* Favicon/Logo */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={20}
              height={20}
              className="w-5 h-5"
              unoptimized
            />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isInConstruction = item.inConstruction
            return (
              <div key={item.href}>
                {isInConstruction ? (
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold
                      text-gray-500 cursor-not-allowed opacity-50
                      relative
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                      Soon
                    </span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={true}
                    onMouseEnter={() => {
                      // Prefetch on hover for instant navigation
                      router.prefetch(item.href)
                    }}
                    onClick={() => {
                      setIsMobileOpen(false)
                      startTransition(() => {
                        // Navigation happens automatically via Link
                      })
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold
                      transition-all duration-150
                      ${active
                        ? 'text-white'
                        : 'text-gray-400'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${active ? 'fill-current' : ''}`} />
                    {item.label}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Get Extension */}
        <div className="px-3 pb-4">
          <Link
            href="/apply"
            prefetch={true}
            onMouseEnter={() => {
              // Prefetch on hover for instant navigation
              router.prefetch('/apply')
            }}
            onClick={() => {
              setIsMobileOpen(false)
              startTransition(() => {
                // Navigation happens automatically via Link
              })
            }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold
              transition-all duration-150
              ${isActive('/apply')
                ? 'text-white'
                : 'text-gray-400'
              }
            `}
          >
            <Puzzle className={`w-5 h-5 transition-colors ${isActive('/apply') ? 'fill-current' : ''}`} />
            Get Extension
          </Link>
          {/* Plan & Credits Display */}
          <div className="px-4 py-2 mt-2">
            <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
              <DialogTrigger asChild>
                <div className="border border-white/10 rounded-lg px-3 py-2 bg-white/5 cursor-pointer transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">
                      {user ? (pricingPlans.find(p => p.id === userPlan)?.label || 'Try out') : '--'} Plan
                    </div>
                    <div className="text-sm text-gray-400">
                      <span className="font-semibold text-white">{credits !== null ? credits : '--'}</span> credits
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </DialogTrigger>
                <DialogContent className="max-w-[85vw] sm:max-w-[700px] lg:max-w-[700px] min-h-[600px] bg-[#191919] border-white/10 p-6">
                  <DialogTitle className="sr-only">Choose Your Plan</DialogTitle>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white font-marlinsoft mb-1">Choose Your Plan</h2>
                      <p className="text-gray-400 text-sm">Select the plan that works best for you</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {pricingPlans.map((plan) => {
                        const isCurrentPlan = plan.id === userPlan
                        const dailyPrice = (plan.price / 30).toFixed(2)
                        return (
                          <div
                            key={plan.id}
                              className={`
                              relative border-2 rounded-lg p-4 transition-all
                              ${isCurrentPlan 
                                ? 'border-white/40 bg-white/10 shadow-lg' 
                                : 'border-white/10 bg-white/5'
                              }
                            `}
                          >
                            {isCurrentPlan && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-white text-black text-xs px-2 py-0.5 rounded-full font-semibold">
                                  Current
                                </div>
                              </div>
                            )}
                            {plan.mostPopular && !isCurrentPlan && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-[#ED5A0B] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                  Popular
                                </div>
                              </div>
                            )}
                            <div className="mb-3">
                              <h3 className="text-base font-semibold text-white mb-0.5">{plan.label}</h3>
                              <p className="text-xs text-gray-400">{plan.tagline}</p>
                            </div>
                            <div className="mb-3">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">€{dailyPrice}</span>
                                <span className="text-xs text-gray-400">/day</span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                €{plan.price}/mo
                              </div>
                            </div>
                            <div className="space-y-1.5 mb-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Check className="w-3 h-3 text-white flex-shrink-0" />
                                <span>{plan.credits} credits/month</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Check className="w-3 h-3 text-white flex-shrink-0" />
                                <span>All aesthetic packs</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                <Check className="w-3 h-3 text-white flex-shrink-0" />
                                <span>Unlimited exports</span>
                              </div>
                            </div>
                            {!isCurrentPlan && (
                              <Button
                                size="sm"
                                className="w-full bg-white text-black hover:bg-gray-100 text-sm h-9"
                                onClick={() => handlePlanChange(plan.id)}
                              >
                                Switch to {plan.label}
                              </Button>
                            )}
                            {isCurrentPlan && (
                              <Button
                                size="sm"
                                className="w-full bg-gray-700 text-white cursor-default text-sm h-9"
                                disabled
                              >
                                Current Plan
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <h3 className="text-sm font-semibold text-white mb-3">Frequently Asked Questions</h3>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/10">
                          <AccordionTrigger className="text-xs text-gray-300 py-2 hover:no-underline">
                            Can I change my plan anytime?
                          </AccordionTrigger>
                          <AccordionContent className="text-xs text-gray-400 pb-2">
                            Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-white/10">
                          <AccordionTrigger className="text-xs text-gray-300 py-2 hover:no-underline">
                            What happens to unused credits?
                          </AccordionTrigger>
                          <AccordionContent className="text-xs text-gray-400 pb-2">
                            Credits reset monthly and don't roll over. Make sure to use them before your billing cycle renews.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-white/10">
                          <AccordionTrigger className="text-xs text-gray-300 py-2 hover:no-underline">
                            Do you offer refunds?
                          </AccordionTrigger>
                          <AccordionContent className="text-xs text-gray-400 pb-2">
                            We offer a 30-day money-back guarantee. Contact support if you're not satisfied.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
        </div>

        {/* User Profile */}
        <div className="px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=100&h=100&fit=crop&crop=center"
                  alt="Profile"
                  width={40}
                  height={40}
                className="w-10 h-10 object-cover"
                  unoptimized
                />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
          </div>
        </div>

      </>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-[#191919] border-gray-800"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-screen w-56 bg-[#191919] border-r border-white/10
          flex flex-col z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
