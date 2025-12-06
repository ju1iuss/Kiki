'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'auth_callback_error':
        return {
          title: 'Authentication Error',
          message: 'There was an error completing the authentication process. Please try signing in again.',
        }
      case 'email_confirmation_error':
        return {
          title: 'Email Confirmation Error',
          message: 'There was an error confirming your email. The link may have expired. Please try signing up again or request a new confirmation email.',
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred. Please try again.',
        }
    }
  }

  const { title, message } = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-2 font-marlinsoft text-destructive">{title}</h1>
          <p className="text-gray-400 mb-6 font-marlinsoft">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/sign-in">Go to Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">Go to Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

