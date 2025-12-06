'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export function LoadingScreen() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Only show loading screen on landing page (/)
    if (pathname !== '/') {
      setIsVisible(false)
      return
    }

    // Show for 2 seconds, then fade out
    const timer = setTimeout(() => {
      setIsFading(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 500) // Fade duration
    }, 2000)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#191919] transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ pointerEvents: isFading ? 'none' : 'auto' }}
    >
      <Image
        src="/favicon.ico"
        alt="Tasy"
        width={64}
        height={64}
        className="h-16 w-16 favicon-spin-continuous"
        unoptimized
        priority
      />
    </div>
  )
}

