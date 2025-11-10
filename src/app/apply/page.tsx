'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Minus, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

export default function ApplyPage() {
    const { t } = useLanguage()
    const [step, setStep] = useState(1)
    const [userType, setUserType] = useState('')
    const [otherType, setOtherType] = useState('')
    const [accountCount, setAccountCount] = useState(5)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [company, setCompany] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingNext, setIsLoadingNext] = useState(false)
    const [showQueuePosition, setShowQueuePosition] = useState(false)
    const [showPriorityPackage, setShowPriorityPackage] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [showCapacityMessage, setShowCapacityMessage] = useState(false)
    const [queuePosition, setQueuePosition] = useState(0)

    const handleNext = async () => {
        if (step === 3 && (!email || !name)) {
            return // Don't proceed if required fields are empty
        }
        if (step === 3) {
            setIsLoadingNext(true)
            
            // Save to waitlist via Supabase Edge Function
            try {
                const finalUserType = userType === 'other' ? otherType : userType
                await fetch('https://zcftkbpfekuvatkiiujq.supabase.co/functions/v1/waitlist-save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        name,
                        company,
                        accountCount,
                        userType: finalUserType,
                    }),
                })
            } catch (error) {
                console.error('Error saving to waitlist:', error)
                // Continue even if save fails
            }
            
            setTimeout(() => {
                setIsLoadingNext(false)
                setStep(4)
            }, 1500)
            return
        }
        if (step < 5) setStep(step + 1)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        
        try {
            // Create Stripe checkout session via Supabase Edge Function
            const response = await fetch('https://zcftkbpfekuvatkiiujq.supabase.co/functions/v1/waitlist-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    accountCount,
                    userType: userType === 'other' ? otherType : userType,
                    company,
                }),
            })

            const data = await response.json()

            if (data.url) {
                // Redirect to Stripe checkout
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'Failed to create checkout session')
            }
        } catch (error) {
            console.error('Error:', error)
            setIsSubmitting(false)
            // You might want to show an error message to the user here
        }
    }

    // Auto-advance when user type is selected
    useEffect(() => {
        if (step === 1 && userType && (userType !== 'other' || otherType)) {
            setTimeout(() => {
                setStep(2)
            }, 300)
        }
    }, [userType, otherType, step])

    // Handle step 4 timing: show capacity message after 1 second, then payment after 4 seconds
    useEffect(() => {
        if (step === 4) {
            setShowPayment(false)
            setShowCapacityMessage(false)
            // Show capacity message after 1 second (fade in)
            const capacityTimer = setTimeout(() => {
                setShowCapacityMessage(true)
            }, 1000)
            // Then show payment section after 4 seconds total
            const paymentTimer = setTimeout(() => {
                setShowPayment(true)
            }, 4000)
            return () => {
                clearTimeout(capacityTimer)
                clearTimeout(paymentTimer)
            }
        } else {
            setShowPayment(false)
            setShowCapacityMessage(false)
        }
    }, [step])


    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="mb-8 flex flex-col items-center gap-6">
                    <Logo />
                        <div className="text-center max-w-md">
                            <h2 className="text-xl md:text-2xl font-medium" style={{ letterSpacing: '-0.05em' }}>{t('apply.title')}</h2>
                        </div>
                </div>

                <div className="bg-card/95 backdrop-blur-md border-2 border-gray-200 dark:border-gray-800 p-8 min-h-[500px] flex flex-col w-full">
                    <div className={`flex-1 ${step === 1 || step === 2 || step === 3 || step === 4 ? 'flex flex-col justify-center' : 'space-y-6'}`}>
                        {/* Step 1: User Type Selection */}
                        {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center space-y-1">
                                <h2 className="text-base font-semibold">{t('apply.userType.question')}</h2>
                            </div>
                            <RadioGroup value={userType} onValueChange={setUserType} className="space-y-1 max-w-sm mx-auto">
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="brand-owner" className="text-base cursor-pointer text-center w-full">{t('apply.userType.brandOwner')}</Label>
                                    <RadioGroupItem value="brand-owner" id="brand-owner" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="agency" className="text-base cursor-pointer text-center w-full">{t('apply.userType.agency')}</Label>
                                    <RadioGroupItem value="agency" id="agency" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="affiliate" className="text-base cursor-pointer text-center w-full">{t('apply.userType.affiliate')}</Label>
                                    <RadioGroupItem value="affiliate" id="affiliate" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="founder" className="text-base cursor-pointer text-center w-full">{t('apply.userType.founder')}</Label>
                                    <RadioGroupItem value="founder" id="founder" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="other" className="text-base cursor-pointer text-center w-full">{t('apply.userType.other')}</Label>
                                    <RadioGroupItem value="other" id="other" className="sr-only" />
                                </div>
                            </RadioGroup>
                            
                            {userType === 'other' && (
                                <div className="space-y-1 animate-in fade-in duration-300 max-w-sm mx-auto">
                                    <Input
                                        type="text"
                                        placeholder={t('apply.userType.specify')}
                                        value={otherType}
                                        onChange={(e) => setOtherType(e.target.value)}
                                        className="h-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                        )}

                        {/* Step 2: Account Selection */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="text-center space-y-2 mb-6">
                                    <h2 className="text-base font-semibold">{t('apply.accounts.question')}</h2>
                                    <p className="text-xs text-muted-foreground max-w-md mx-auto">{t('apply.accounts.description')}</p>
                                </div>
                                <div className="space-y-3 max-w-sm mx-auto">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setAccountCount(Math.max(1, accountCount - 1))}
                                            className="h-10 w-10 rounded-none">
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <div className="flex-1 text-center bg-muted/40 py-4 border-2">
                                            <div className="text-4xl font-bold tabular-nums">{accountCount}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {t('apply.accounts.label')}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setAccountCount(Math.min(50, accountCount + 1))}
                                            className="h-10 w-10 rounded-none">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-center py-2 bg-muted/20 border-2">
                                        <div className="text-xl font-semibold tabular-nums">€{accountCount * 125}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                    </div>
                                </div>
                                <div className="max-w-sm mx-auto">
                                    <Button onClick={handleNext} className="w-full active:scale-95 transition-transform duration-150" size="default">
                                        {t('apply.continue')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact Information */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="space-y-3 max-w-sm mx-auto">
                                    <div className="space-y-1">
                                        <Label htmlFor="name" className="text-xs">{t('apply.contact.name')}</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                            className="h-9 text-sm rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="email" className="text-xs">{t('apply.contact.email')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                            className="h-9 text-sm rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="company" className="text-xs">{t('apply.contact.company')}</Label>
                                        <Input
                                            id="company"
                                            type="text"
                                            placeholder={t('apply.contact.companyOptional')}
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            disabled={isSubmitting}
                                            className="h-9 text-sm rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                    </div>
                                    
                                    <Button 
                                        type="button" 
                                        onClick={handleNext}
                                        disabled={isSubmitting || isLoadingNext}
                                        className="w-full active:scale-95 transition-transform duration-150" 
                                        size="default">
                                        {isLoadingNext ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {t('apply.contact.checking')}
                                            </>
                                        ) : (
                                            t('apply.contact.next')
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Capacity Message + Payment */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <div className={`text-center space-y-4 max-w-md mx-auto transition-opacity duration-1000 ${showCapacityMessage ? 'opacity-100' : 'opacity-0'}`}>
                                    <h2 className="text-xl font-semibold">
                                        {t('apply.capacity.title')} <span className="text-[#ED5A0B] font-bold text-2xl">{t('apply.capacity.count')}</span> Capacity
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {t('apply.capacity.message')}
                                    </p>
                                </div>
                                
                                {/* Payment Section */}
                                {showPayment && (
                                    <div className="text-center space-y-4 max-w-md mx-auto animate-in fade-in duration-300">
                                {/* Priority Package Display */}
                                        <div className="space-y-4 pt-6">
                                                <div className="bg-background border-2 border-[#ED5A0B] p-4">
                                                <div className="flex items-baseline justify-between mb-3">
                                                    <span className="text-base font-bold">{t('apply.priority.title')}</span>
                                                        <div>
                                                            <span className="text-2xl font-bold text-[#ED5A0B]">{t('apply.priority.price')}</span>
                                                            <span className="text-sm text-muted-foreground line-through ml-2">{t('apply.priority.originalPrice')}</span>
                                                    </div>
                                                        </div>
                                                        
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-start gap-2">
                                                        <Check className="w-3 h-3 text-[#ED5A0B] mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs">{t('apply.priority.guarantee')}</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Check className="w-3 h-3 text-[#ED5A0B] mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs">{t('apply.priority.skip')}</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Check className="w-3 h-3 text-[#ED5A0B] mt-0.5 flex-shrink-0" />
                                                        <p className="text-xs">{t('apply.priority.account')}</p>
                                                    </div>
                                                </div>

                                                    <Button 
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                        className="w-full active:scale-95 transition-transform duration-150 text-sm"
                                                        size="default">
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            {t('apply.priority.processing')}
                                                        </>
                                                    ) : (
                                                        t('apply.priority.preorder')
                                                    )}
                                                    </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: Confirmation */}
                        {step === 5 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="text-center space-y-3 max-w-md mx-auto">
                                    <h2 className="text-xl font-semibold">{t('apply.success.title')}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {t('apply.success.message')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="#link"
                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-3 rounded-full border p-1 pl-4 pr-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                        <div className="flex -space-x-2">
                            <img 
                                src="https://i.pravatar.cc/150?img=12" 
                                alt="User" 
                                className="w-7 h-7 rounded-full border-2 border-background"
                            />
                            <img 
                                src="https://i.pravatar.cc/150?img=33" 
                                alt="User" 
                                className="w-7 h-7 rounded-full border-2 border-background"
                            />
                            <img 
                                src="https://i.pravatar.cc/150?img=47" 
                                alt="User" 
                                className="w-7 h-7 rounded-full border-2 border-background"
                            />
                            <img 
                                src="https://i.pravatar.cc/150?img=52" 
                                alt="User" 
                                className="w-7 h-7 rounded-full border-2 border-background"
                            />
                            <img 
                                src="https://i.pravatar.cc/150?img=68" 
                                alt="User" 
                                className="w-7 h-7 rounded-full border-2 border-background"
                            />
                    </div>
                        <span className="text-foreground text-sm">{t('apply.rolledOut')}</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

