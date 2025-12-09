'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { saveOnboardingImages } from '@/lib/onboarding-storage'

// Storage key format - keeping similar structure for Chrome extension compatibility
// Note: Chrome extension will need updates to work with Clerk tokens
const STORAGE_KEY = `clerk-auth-token`

export function AuthSync() {
  const { isSignedIn, userId, getToken, user } = useAuth()

  useEffect(() => {
    const syncSession = async () => {
      if (isSignedIn && userId) {
        try {
          // Get Clerk session token
          const token = await getToken()
          
          if (token) {
            // Store token in format similar to Supabase for extension compatibility
            const storageData = {
              access_token: token,
              token_type: 'Bearer',
              user: {
                id: userId,
                email: user?.emailAddresses?.[0]?.emailAddress,
                created_at: user?.createdAt,
              },
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
            
            // Save onboarding images if they exist (from pre-login session)
            await saveOnboardingImages()
          }
        } catch (error) {
          console.error('Error syncing Clerk session:', error)
        }
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    syncSession()
  }, [isSignedIn, userId, getToken, user])

  return null
}

