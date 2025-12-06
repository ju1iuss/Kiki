import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Custom storage to ensure localStorage is used for Chrome extension
        storage: typeof window !== 'undefined' ? {
          getItem: (key: string) => window.localStorage.getItem(key),
          setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
          removeItem: (key: string) => window.localStorage.removeItem(key),
        } : undefined,
      },
    }
  )
}

// Singleton instance for consistent client across app
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getClient() {
  if (typeof window === 'undefined') {
    return createClient()
  }
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}

