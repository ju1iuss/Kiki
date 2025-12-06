'use client'

import { useEffect } from 'react'
import { getClient } from '@/lib/supabase/client'
import { saveOnboardingImages } from '@/lib/onboarding-storage'
import { identifyUser, resetUser } from '@/lib/analytics/posthog'

// Storage key format used by Supabase - must match what extension reads
const STORAGE_KEY = `sb-zcftkbpfekuvatkiiujq-auth-token`

export function AuthSync() {
  useEffect(() => {
    const supabase = getClient()

    // Sync session to localStorage in format Chrome extension expects
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Store in standard Supabase format - access_token at root level
        const storageData = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          token_type: session.token_type,
          user: session.user,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
        
        // Identify user in PostHog
        if (session.user) {
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          })
        }
        
        // Save onboarding images if they exist (from pre-login session)
        await saveOnboardingImages()
      } else {
        localStorage.removeItem(STORAGE_KEY)
        resetUser()
      }
    }

    // Initial sync
    syncSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (session) {
          const storageData = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            expires_in: session.expires_in,
            token_type: session.token_type,
            user: session.user,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
          
          // Identify user in PostHog
          if (session.user) {
            identifyUser(session.user.id, {
              email: session.user.email,
              created_at: session.user.created_at,
            })
          }
          
          // Save onboarding images when user signs in (catches OAuth callbacks, etc.)
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await saveOnboardingImages()
          }
        } else {
          localStorage.removeItem(STORAGE_KEY)
          // Reset PostHog user on logout
          resetUser()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}

