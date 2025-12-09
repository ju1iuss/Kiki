'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { AppLayout } from '@/components/app-layout'
import { useEffect } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/sign-in?redirect=${pathname}`)
    }
  }, [isLoaded, isSignedIn, router, pathname])

  if (!isLoaded) {
    return null
  }

  if (!isSignedIn) {
    return null
  }

  return <AppLayout>{children}</AppLayout>
}

