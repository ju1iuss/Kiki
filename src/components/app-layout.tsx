'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { NavigationProgress } from './navigation-progress'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  // Middleware already handles auth, so we can render immediately
  return (
    <div className="h-screen bg-[#191919] flex justify-center overflow-hidden">
      <NavigationProgress />
      <div className="flex w-full h-full relative" style={{ maxWidth: '900px' }}>
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto">
          <div className="flex justify-center items-start h-full">
            <div style={{ maxWidth: '700px', width: '100%' }} className="py-8 pb-28 lg:pb-8">
              {children}
            </div>
          </div>
        </main>
        <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10 z-10"></div>
      </div>
    </div>
  )
}

