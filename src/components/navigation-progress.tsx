'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setIsNavigating(true)
    setProgress(0)

    // Fast initial progress
    setProgress(30)

    // Simulate smooth progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval)
          return 85
        }
        // Slower progress as we approach completion
        const increment = prev < 50 ? 15 : prev < 75 ? 8 : 3
        return Math.min(prev + increment, 85)
      })
    }, 60)

    // Complete quickly on navigation finish
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 150)
    }, 50)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [pathname])

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-white/80 to-white transition-all duration-150 ease-out shadow-sm"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  )
}

