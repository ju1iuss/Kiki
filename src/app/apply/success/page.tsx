'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import Link from 'next/link'

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="mb-8 flex flex-col items-center gap-6">
                    <Logo />
                    <div className="text-center max-w-md">
                        <h2 className="text-xl md:text-2xl font-medium" style={{ letterSpacing: '-0.05em' }}>Due to extreme demand, we are application-only</h2>
                    </div>
                </div>

                <div className="bg-card/95 backdrop-blur-md border-2 border-gray-200 dark:border-gray-800 p-8 min-h-[500px] flex flex-col w-full">
                    <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-[#ED5A0B]/10 flex items-center justify-center">
                            <Check className="w-8 h-8 text-[#ED5A0B]" />
                        </div>
                        
                        <div className="text-center space-y-4 max-w-md">
                            <h1 className="text-2xl font-semibold">Payment Successful!</h1>
                            <p className="text-sm text-muted-foreground">
                                Thank you for pre-ordering. Your spot has been secured and you'll receive priority access when accounts are ready.
                            </p>
                            
                            <div className="space-y-3 pt-4 text-left">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-[#ED5A0B] mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">You've skipped 500+ people waiting in line</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-[#ED5A0B] mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Your first account (worth €125/month) is included at no extra cost</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-[#ED5A0B] mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">We'll email you when your account is ready</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 w-full max-w-sm">
                            <Button 
                                asChild
                                className="w-full active:scale-95 transition-transform duration-150" 
                                size="default">
                                <Link href="/">
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

