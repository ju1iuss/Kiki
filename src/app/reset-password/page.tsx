'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [isRequestMode, setIsRequestMode] = useState(true)

  const supabase = getClient()

  useEffect(() => {
    // Check if we have token params in the URL (from email link)
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token')
    const type = urlParams.get('type')
    
    // If we have tokens from password reset email, exchange them for session
    if ((accessToken || refreshToken) && type === 'recovery') {
      setIsRequestMode(false)
      // Exchange tokens for session
      supabase.auth.setSession({
        access_token: accessToken || '',
        refresh_token: refreshToken || '',
      }).catch((error) => {
        console.error('Error setting session:', error)
        setError('Invalid or expired reset link. Please request a new one.')
        setIsRequestMode(true)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'An error occurred while requesting password reset')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/sign-in')
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating password')
    } finally {
      setLoading(false)
    }
  }

  if (success && isRequestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-2 font-marlinsoft">Check your email</h1>
            <p className="text-gray-400 mb-6 font-marlinsoft">
              We've sent you a password reset link. Please check your email and click the link to reset your password.
            </p>
            <Button asChild>
              <Link href="/sign-in">Back to Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (success && !isRequestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-2 font-marlinsoft">Password Updated</h1>
            <p className="text-gray-400 mb-6 font-marlinsoft">
              Your password has been successfully updated. Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 font-marlinsoft">
            {isRequestMode ? 'Reset Password' : 'Update Password'}
          </h1>
          <p className="text-gray-400 mb-6 font-marlinsoft">
            {isRequestMode
              ? 'Enter your email address and we'll send you a link to reset your password.'
              : 'Enter your new password below.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {isRequestMode ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            <Link href="/sign-in" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

