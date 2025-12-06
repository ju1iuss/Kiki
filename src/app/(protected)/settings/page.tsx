'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { getClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { LogOut, Save, Check } from 'lucide-react'

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

export default function SettingsPage() {
  const router = useRouter()
  const supabase = getClient()
  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [userPlan, setUserPlan] = useState<string>('starter')
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [showPricingDialog, setShowPricingDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)

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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const initialName = user?.user_metadata?.name || user?.email?.split('@')[0] || ''
      setName(initialName)
      setOriginalName(initialName)
      
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits, subscription_id')
            .eq('id', user.id)
            .single()

          if (profile) {
            setCredits(profile.credits || 0)

            // Check for ANY active subscription (tasy.ai or tasy-viral)
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
              // Fallback: check for any active subscription
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
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        alert('Failed to sign out. Please try again.')
        return
      }
      // Redirect to home page after successful sign out
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name },
      })
      if (error) throw error
      setOriginalName(name)
      alert('Settings saved!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = name !== originalName

  const handlePlanChange = async (planId: string) => {
    if (planId === userPlan) {
      return
    }

    // If user has active subscription, redirect to Stripe billing portal
    if (hasActiveSubscription) {
      setIsLoadingCheckout(true)
      try {
        console.log('🚀 User has active subscription, redirecting to billing portal')
        const res = await fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to create portal session' }))
          throw new Error(errorData.error || 'Failed to open billing portal')
        }

        const portalData = await res.json()
        if (portalData.url) {
          console.log('✅ Redirecting to Stripe billing portal:', portalData.url)
          window.location.href = portalData.url
        } else {
          throw new Error('No portal URL returned')
        }
      } catch (error) {
        console.error('💥 Error opening billing portal:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to open billing portal. Please try again.'
        alert(errorMessage)
        setIsLoadingCheckout(false)
      }
      return
    }

    // For users without subscription, start checkout
    setSelectedPlan(planId)
    setIsLoadingCheckout(true)
    
    try {
      console.log('🚀 Starting checkout for plan:', planId)
      const res = await fetch('/api/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: planId, 
          interval: 'monthly', 
          uiMode: 'hosted' // Use hosted checkout for settings page
        }),
      })

      console.log('📊 Response status:', res.status, res.statusText)

      if (!res.ok) {
        const responseText = await res.text()
        console.error('❌ Response text:', responseText)
        
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText || 'Unknown error' }
        }
        
        console.error('❌ API Error:', errorData)
        console.error('❌ Edge function details:', errorData.edgeFunctionError)
        console.error('❌ Additional details:', errorData.details)
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to create checkout`)
      }

      const checkoutData = await res.json()
      console.log('✅ Checkout response:', checkoutData)
      
      if (checkoutData.url) {
        console.log('✅ Redirecting to Stripe checkout:', checkoutData.url)
        // Redirect to Stripe hosted checkout page
        window.location.href = checkoutData.url
      } else {
        console.error('❌ No checkout URL in response:', checkoutData)
        throw new Error(checkoutData.error || 'Failed to create checkout - no URL returned')
      }
    } catch (error) {
      console.error('💥 Error creating checkout:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.'
      alert(errorMessage)
      setShowPricingDialog(false)
      setIsLoadingCheckout(false)
    }
  }

  const handleCheckoutSuccess = async () => {
    // Refresh user data
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits, subscription_id')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCredits(profile.credits || 0)
        
        // Check for any active subscription (tasy.ai or tasy-viral)
        if (profile.subscription_id) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan, status, is_active, product')
            .eq('id', profile.subscription_id)
            .single()

          if (subscription && subscription.is_active && subscription.status === 'active') {
            const planId = mapSubscriptionPlanToPricingPlan(subscription.plan)
            setUserPlan(planId)
          }
        } else {
          // Fallback: check for any active subscription
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
          }
        }
      }
    }
    
    setSelectedPlan(null)
    
    router.push('/subscription/success?plan=' + selectedPlan)
  }

  return (
    <div className="space-y-6 max-w-2xl px-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white font-marlinsoft">
            Settings
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your account
          </p>
        </div>

        <div className="space-y-6">
          {/* Subscription Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Subscription</h2>
              <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    Manage Plan
                  </Button>
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
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
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
                                disabled={isLoadingCheckout}
                              >
                                {isLoadingCheckout && selectedPlan === plan.id ? 'Loading...' : `Switch to ${plan.label}`}
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
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">Current Plan</span>
                <span className="text-sm font-semibold text-white">
                  {pricingPlans.find(p => p.id === userPlan)?.label || 'Try out'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">Credits</span>
                <span className="text-sm font-semibold text-white">
                  {credits !== null ? credits : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white">Account Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 w-20">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-transparent text-white text-sm focus:outline-none flex-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 w-20">Email</span>
                <span className="text-sm text-gray-300 flex-1">
                  {user?.email || '--'}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || !hasChanges} 
                  size="sm" 
                  className={`h-8 text-xs ${!hasChanges ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : ''}`}
                >
                  <Save className="w-3 h-3 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleSignOut} size="sm" className="h-8 text-xs">
                  <LogOut className="w-3 h-3 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

