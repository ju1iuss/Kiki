'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getClient } from '@/lib/supabase/client'
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { saveOnboardingImages } from '@/lib/onboarding-storage'

export function Step8Password() {
  const router = useRouter()
  const { nextStep, updateData, data } = useOnboarding()
  const supabase = getClient()
  const [email, setEmail] = useState(data?.email || '')
  const [confirmEmail, setConfirmEmail] = useState(data?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data?.email) {
      setEmail(data.email)
      setConfirmEmail(data.email)
    }
  }, [data?.email])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (email !== confirmEmail) {
      setError('Emails do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // First, try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: confirmEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback?redirect=/onboarding`,
        },
      })

      // If user already exists, try to sign in instead
      if (signUpError && signUpError.message.includes('already registered')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: confirmEmail,
          password,
        })

        if (signInError) {
          // If sign in also fails, check if it's because password is wrong
          if (signInError.message.includes('Invalid login credentials')) {
            setError('An account with this email already exists. Please use the correct password or reset it.')
          } else {
            throw signInError
          }
          return
        }

        // Successfully signed in existing user
        updateData({ email: confirmEmail })
        // Save onboarding images after signup
        await saveOnboardingImages()
        nextStep()
        return
      }

      // If sign up had a different error, throw it
      if (signUpError) throw signUpError

      // Check if email confirmation is required
      if (signUpData.user && !signUpData.session) {
        // Email confirmation required - user needs to verify email
        setError('Please check your email to verify your account before continuing.')
        return
      }

      // Successfully signed up and logged in (if email confirmation is disabled)
      updateData({ email: confirmEmail })
      // Save onboarding images after signup
      await saveOnboardingImages()
      nextStep()
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingCard currentStep={10} totalSteps={19}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            Confirm your email and create password
          </h1>
          <p className="text-gray-600 text-sm">
            Just a few more steps and you're done.
          </p>
          <p className="text-gray-600 text-sm">
            We hate paperwork, too
          </p>
        </div>

        {error && (
          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Email Display */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={email}
              readOnly
              className="pl-10 bg-gray-50 border-gray-300 text-gray-600 h-12 transition-all duration-300 ease-out"
            />
          </div>

          {/* Confirm Email Input */}
          <div className="relative transition-all duration-300 ease-out">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-all duration-300" />
            <Input
              type="email"
              placeholder="Confirm your email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              disabled={loading}
              className="pl-10 bg-gray-50 border-gray-300 text-black h-12 transition-all duration-300 ease-out focus-visible:ring-0 focus-visible:border-gray-400 focus-visible:shadow-none"
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div className="relative transition-all duration-300 ease-out">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-all duration-300" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="pl-10 pr-10 bg-gray-50 border-gray-300 text-black h-12 transition-all duration-300 ease-out focus-visible:ring-0 focus-visible:border-gray-400 focus-visible:shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-300"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Continue Button */}
          <Button
            type="submit"
            size="lg"
            disabled={loading || !password || !confirmEmail}
            className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft h-12 transition-all duration-300 ease-out transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5 text-[#FF006F]" />
          </Button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By continuing I agree to the{' '}
            <Link href="/terms" className="font-semibold text-gray-700 hover:text-black">
              Terms & Conditions
            </Link>
            {', '}
            <Link href="/privacy" className="font-semibold text-gray-700 hover:text-black">
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </OnboardingCard>
  )
}

