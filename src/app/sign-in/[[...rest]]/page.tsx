'use client'

import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || searchParams.get('redirect') || '/dashboard'
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <SignIn 
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl={redirectUrl}
        afterSignUpUrl={redirectUrl}
        redirectUrl={redirectUrl}
        appearance={{
          baseTheme: dark
        }}
      />
    </div>
  )
}

