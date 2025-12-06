'use client'

/**
 * MAIN LANDING PAGE
 * This is the primary landing page for the application.
 * Route: / (root)
 * All landing page changes should be made here.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ImagesShowcase } from '@/components/images-showcase'
import Image from 'next/image'
import { getClient } from '@/lib/supabase/client'

export default function Home() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const supabase = getClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setLoading(false)
    }
    checkAuth()

    let animationFrameId: number
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const animate = () => {
      // Smooth interpolation with easing
      const ease = 0.15
      currentX += (targetX - currentX) * ease
      currentY += (targetY - currentY) * ease

      setCursorPos({
        x: currentX,
        y: currentY,
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div 
      className="min-h-screen flex flex-col relative bg-[#191919]" 
      data-landing-page
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
      }}
    >
      {/* Custom Cursor */}
      <div
        className="fixed pointer-events-none z-[10000] mix-blend-difference"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>

      {/* Floating Cloud Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4" style={{ zIndex: 100 }}>
        <nav className="w-full max-w-xl">
          <div className="bg-[#191919] backdrop-blur-xl rounded-full border border-gray-600/60 shadow-lg px-6 py-4">
            <div className="flex items-center justify-between gap-8">
              <Link href="/" className="flex items-center text-white hover:text-gray-300 transition-colors">
                <Image 
                  src="/favicon.ico" 
                  alt="Tasy" 
                  width={24} 
                  height={24}
                  className="h-6 w-6"
                  unoptimized
                />
              </Link>
              <div className="flex items-center gap-8">
                <Link href="#reviews" className="text-sm font-medium text-white hover:text-gray-300 transition-colors font-marlinsoft">
                  Reviews
                </Link>
                <Link href="#pricing" className="text-sm font-medium text-white hover:text-gray-300 transition-colors font-marlinsoft">
                  Pricing
                </Link>
                <Link href="/dashboard" className="text-sm font-medium text-white hover:text-gray-300 transition-colors font-marlinsoft">
                  Login
                </Link>
              </div>
              {!loading && (
                <Button asChild size="lg" className="h-8 bg-white text-black hover:bg-gray-200 border-0 font-marlinsoft group">
                  <Link href={isLoggedIn ? "/dashboard" : "/onboarding"} className="flex items-center gap-1.5 text-black">
                    {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                    <span className="relative w-5 h-5 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 absolute transition-transform duration-300 group-hover:translate-x-1 text-black" />
                    </span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex items-center justify-center px-4 pt-60 pb-16" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-3 font-marlinsoft leading-[1.1] tracking-tight">
            Turn any brand into an
            <br />
            aesthetic Instagram feed
            <br />
            in 30 seconds
          </h1>
          <p className="text-base md:text-lg text-gray-400 mb-6 font-marlinsoft max-w-2xl mx-auto">
            Upload your logo, pick your vibe, get 15 on-brand mockups.
            <br />
            No designer needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!loading && (
              <Button asChild size="lg" className="min-w-[200px] text-base px-8 bg-white text-black hover:bg-gray-200 border-0 font-marlinsoft group">
                <Link href={isLoggedIn ? "/dashboard" : "/onboarding"} className="flex items-center gap-2">
                  {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                  <span className="relative w-5 h-5 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 absolute transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            )}
            <Button asChild size="lg" className="min-w-[200px] text-base px-8 bg-white text-black hover:bg-gray-100 border-0 font-marlinsoft">
              <Link href="#download" className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Download Extension
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Images Showcase Section */}
      <ImagesShowcase />
    </div>
  );
}
