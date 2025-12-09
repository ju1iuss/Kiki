'use client'

import { SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useSearchParams } from 'next/navigation'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url') || searchParams.get('redirect') || '/dashboard'
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <SignUp 
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
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

