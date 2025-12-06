'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/app-layout'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('User not authenticated, redirecting to sign-in')
        router.push(`/sign-in?redirect=${pathname}`)
      }
    }

    checkAuth()

    // Set up auth state listener
    const supabase = getClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/sign-in')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  return <AppLayout>{children}</AppLayout>
}

