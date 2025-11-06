'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Minus, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Logo } from '@/components/logo'
import { InfiniteSlider } from '@/components/ui/infinite-slider'

export default function ApplyPage() {
    const [step, setStep] = useState(1)
    const [userType, setUserType] = useState('')
    const [otherType, setOtherType] = useState('')
    const [accountCount, setAccountCount] = useState(5)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [company, setCompany] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showQueuePosition, setShowQueuePosition] = useState(false)
    const [showPriorityPackage, setShowPriorityPackage] = useState(false)
    const [queuePosition, setQueuePosition] = useState(0)

    const handleNext = () => {
        if (step < 4) setStep(step + 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        // Generate random queue position
        const position = Math.floor(Math.random() * (1200 - 300 + 1)) + 300
        setQueuePosition(position)
        
        // After 3 seconds, move to step 4 and show queue position
        setTimeout(() => {
            setIsSubmitting(false)
            setStep(4)
            setShowQueuePosition(true)
        }, 3000)
        
        // After 2 more seconds (5 total), show priority package
        setTimeout(() => {
            setShowPriorityPackage(true)
        }, 5000)
    }

    // Auto-advance when user type is selected
    useEffect(() => {
        if (step === 1 && userType && (userType !== 'other' || otherType)) {
            setTimeout(() => {
                setStep(2)
            }, 300)
        }
    }, [userType, otherType, step])


    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-8 flex flex-col items-center gap-6">
                    <Logo />
                    {step === 1 && (
                        <div className="text-center max-w-md">
                            <h2 className="text-xl md:text-2xl font-medium" style={{ letterSpacing: '-0.05em' }}>Due to extreme demand, we are application-only</h2>
                        </div>
                    )}
                </div>

                <div className="bg-card/95 backdrop-blur-md border-2 border-gray-200 dark:border-gray-800 p-8 min-h-[500px] flex flex-col">
                    <div className="flex-1 space-y-6">
                        {/* Step 1: User Type Selection */}
                        {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="text-center space-y-1">
                                <h2 className="text-base font-semibold">What best describes you?</h2>
                            </div>
                            <RadioGroup value={userType} onValueChange={setUserType} className="space-y-1 max-w-sm mx-auto">
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="brand-owner" className="text-base cursor-pointer text-center w-full">Brand Owner</Label>
                                    <RadioGroupItem value="brand-owner" id="brand-owner" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="agency" className="text-base cursor-pointer text-center w-full">Agency</Label>
                                    <RadioGroupItem value="agency" id="agency" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="affiliate" className="text-base cursor-pointer text-center w-full">Affiliate</Label>
                                    <RadioGroupItem value="affiliate" id="affiliate" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="founder" className="text-base cursor-pointer text-center w-full">Founder</Label>
                                    <RadioGroupItem value="founder" id="founder" className="sr-only" />
                                </div>
                                <div className="flex items-center justify-center px-4 py-3 border-2 hover:bg-muted/50 hover:border-[#ED5A0B] transition-colors cursor-pointer">
                                    <Label htmlFor="other" className="text-base cursor-pointer text-center w-full">Other</Label>
                                    <RadioGroupItem value="other" id="other" className="sr-only" />
                                </div>
                            </RadioGroup>
                            
                            {userType === 'other' && (
                                <div className="space-y-1 animate-in fade-in duration-300 max-w-sm mx-auto">
                                    <Input
                                        type="text"
                                        placeholder="Please specify..."
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
                                <div className="text-center space-y-2">
                                    <h2 className="text-base font-semibold">On how many accounts do you want to post?</h2>
                                    <p className="text-xs text-muted-foreground max-w-md mx-auto">You can select up to 50 accounts and distribute content to them how you wish. Content will get distributed 2 posts per day max automatically on warmed up customized accounts for you.</p>
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
                                                accounts
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
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact Information */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="text-center space-y-1">
                                    <h2 className="text-base font-semibold">Your information</h2>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto">
                                    <div className="space-y-1">
                                        <Label htmlFor="name" className="text-xs">Full Name</Label>
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
                                        <Label htmlFor="email" className="text-xs">Email</Label>
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
                                        <Label htmlFor="company" className="text-xs">Company (Optional)</Label>
                                        <Input
                                            id="company"
                                            type="text"
                                            placeholder="Your Company Inc."
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            disabled={isSubmitting}
                                            className="h-9 text-sm rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                    </div>
                                    
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full active:scale-95 transition-transform duration-150" 
                                        size="default">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Step 4: Queue Position and Priority Package */}
                        {step === 4 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {/* Queue Position Display */}
                                {showQueuePosition && (
                                    <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-700">
                                        <div className="text-center space-y-2 mb-6">
                                            <h2 className="text-base font-semibold">Your Queue Position</h2>
                                        </div>
                                        <div className="text-3xl font-thin text-black dark:text-white tabular-nums tracking-tight">
                                            #{queuePosition}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Priority Package Display */}
                                {showPriorityPackage && (
                                    <div className="space-y-4 animate-in fade-in duration-1000 pt-6 max-w-sm mx-auto">
                                        <div className="text-center space-y-3">
                                            <div>
                                                <div className="bg-background border-2 border-[#ED5A0B] p-4">
                                                    <div className="flex items-baseline justify-between mb-2">
                                                        <span className="text-base font-bold">First Account</span>
                                                        <div>
                                                            <span className="text-2xl font-bold text-[#ED5A0B]">€50</span>
                                                            <span className="text-sm text-muted-foreground line-through ml-2">€125</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-3">60% OFF - Limited to 100 priority spots</p>
                                                    
                                                    <ul className="space-y-1.5 mb-4 text-xs">
                                                        <li className="flex items-center gap-2">
                                                            <Check className="w-3 h-3 text-[#ED5A0B]" />
                                                            <span>Skip the queue (567+ people)</span>
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <Check className="w-3 h-3 text-[#ED5A0B]" />
                                                            <span>Get to be first of 100 users</span>
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <Check className="w-3 h-3 text-[#ED5A0B]" />
                                                            <span>Priority onboarding support</span>
                                                        </li>
                                                        <li className="flex items-center gap-2">
                                                            <Check className="w-3 h-3 text-[#ED5A0B]" />
                                                            <span>First account at 60% discount</span>
                                                        </li>
                                                    </ul>

                                                    <Button 
                                                        className="w-full active:scale-95 transition-transform duration-150 text-sm"
                                                        size="default">
                                                        Get priority now
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Your information is secure and will only be used to review your application.
                </p>

                {/* Logo Cloud */}
                <div className="mt-8 overflow-hidden">
                    <div className="relative">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={80}>
                            <img className="h-4 w-fit opacity-50 dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia" />
                            <img className="h-3 w-fit opacity-50 dark:invert" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column" />
                            <img className="h-3 w-fit opacity-50 dark:invert" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub" />
                            <img className="h-4 w-fit opacity-50 dark:invert" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike" />
                            <img className="h-4 w-fit opacity-50 dark:invert" src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg" alt="Lemon Squeezy" />
                        </InfiniteSlider>
                    </div>
                </div>
            </div>
        </div>
    )
}

