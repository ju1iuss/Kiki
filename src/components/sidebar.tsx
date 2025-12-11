'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Plus, Settings, LayoutDashboard, ScanLine, Check, X, Info } from 'lucide-react'
import Image from 'next/image'
import { KeyCamera } from './key-camera'
import { useKeyDetail } from '@/contexts/key-detail-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const { user } = useUser()
  const { isViewingKeyDetails } = useKeyDetail()
  const [showCamera, setShowCamera] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/add-key', label: 'Schlüssel hinzufügen', icon: Plus },
    { href: '/settings', label: 'Einstellungen', icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  const SidebarContent = () => {
    return (
      <>
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 px-3 py-6">
          {/* Favicon/Logo */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={20}
              height={20}
              className="w-5 h-5"
              unoptimized
            />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => {
                    // Prefetch on hover for instant navigation
                    router.prefetch(item.href)
                  }}
                  onClick={() => {
                    startTransition(() => {
                      // Navigation happens automatically via Link
                    })
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold
                    transition-all duration-150
                    ${active
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'fill-white' : ''}`} />
                  {item.label}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src={user?.imageUrl || "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=100&h=100&fit=crop&crop=center"}
                alt="Profile"
                width={40}
                height={40}
                className="w-10 h-10 object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'}
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const handleCameraCapture = async (imageData: string): Promise<void> => {
    // Upload image immediately to avoid URL length issues
    const uploadResponse = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: imageData,
        fileName: 'camera-capture.jpg',
      }),
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`)
    }

    const uploadData = await uploadResponse.json()
    
    // Store the uploaded URL in sessionStorage
    sessionStorage.setItem('pendingKeyImage', uploadData.url)
    
    // Navigate immediately - camera will close automatically when component unmounts
    router.push('/add-key')
    
    // Close camera after navigation starts
    setShowCamera(false)
  }

  const handleAddKeyClick = (e: React.MouseEvent) => {
    // On mobile, show info modal first (if not dismissed), then camera
    if (window.innerWidth < 1024) {
      e.preventDefault()
      const shouldShowModal = localStorage.getItem('key-add-info-dismissed') !== 'true'
      if (shouldShowModal) {
        setShowInfoModal(true)
      } else {
        setShowCamera(true)
      }
    }
  }

  const handleInfoModalContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem('key-add-info-dismissed', 'true')
    }
    setShowInfoModal(false)
    setShowCamera(true)
  }

  const handleScanKeyClick = () => {
    router.push('/scan-key')
  }

  // Only show bottom nav on dashboard and settings pages, but not when viewing key details
  const showBottomNav = (pathname === '/dashboard' || pathname === '/settings') && !isViewingKeyDetails

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex lg:relative top-0 left-0 h-screen w-56 bg-[#191919] border-r border-white/10
          flex-col z-40
          ${className}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Bottom Navigation - Floating Cloud */}
      {showBottomNav && (
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-fit max-w-[500px]">
        <div className="bg-[#191919] border border-white/10 rounded-full shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center gap-8 px-6 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const isAddKey = item.href === '/add-key'
              
              if (isAddKey) {
                return (
                  <div key={item.href} className="flex items-center gap-2">
                    {/* Scan Key Button */}
                    <button
                      onClick={handleScanKeyClick}
                      className="flex items-center justify-center transition-all duration-150"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#FF006F] flex items-center justify-center shadow-lg">
                        <ScanLine className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                    </button>
                    {/* Add Key Button */}
                    <button
                      onClick={handleAddKeyClick}
                      className="flex items-center justify-center transition-all duration-150"
                    >
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <Plus className="w-8 h-8 text-black" strokeWidth={2.5} />
                      </div>
                    </button>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    startTransition(() => {
                      // Navigation happens automatically via Link
                    })
                  }}
                  className={`
                    flex items-center justify-center
                    transition-all duration-150
                    ${active ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  <Icon className={`w-7 h-7 transition-colors ${active ? 'fill-white' : ''}`} />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      )}

      {/* Mobile Camera Modal */}
      {showCamera && (
        <KeyCamera
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Add Key Info Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-md bg-[#191919] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Bitte beachten Sie folgende Hinweise:
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Positive Checklist - Green */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-sm text-gray-200">Sauberer einfarbiger Hintergrund</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-sm text-gray-200">Nicht mehrere Schlüssel auf dem Bild sichtbar</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-sm text-gray-200">Schlüssel zeigt nach unten (Seite egal)</span>
              </div>
            </div>

            {/* Negative Examples - Red */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-sm text-gray-200">Unruhiger oder gemusterter Hintergrund</span>
              </div>
              <div className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-sm text-gray-200">Mehrere Schlüssel gleichzeitig auf dem Bild</span>
              </div>
              <div className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-sm text-gray-200">Schlüssel zeigt nach oben oder zur Seite</span>
              </div>
            </div>

            {/* Information - Equal points with info icons */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Alle Schlüssel sind möglich</span>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Nur eine Seite nötig, welche ist egal (unsere trainierte KI erkennt jeden Schlüssel und kategorisiert ihn an seinem Aussehen)</span>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Alle Schlüssel sind encrypted und sicher saved hosted in Deutschland</span>
              </div>
            </div>

            {/* Don't show again checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="dont-show-again"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-0 bg-transparent text-[#FF006F] focus:ring-0 focus:outline-none"
              />
              <label htmlFor="dont-show-again" className="text-sm text-gray-300 cursor-pointer">
                Nicht mehr anzeigen
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleInfoModalContinue}
              className="w-full bg-[#FF006F] hover:bg-[#FF006F]/90 text-white"
            >
              Weiter →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
