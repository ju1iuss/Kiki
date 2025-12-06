'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const imageCount = 8
const imagePaths = Array.from({ length: imageCount }, (_, i) => `/image${i + 1}.png`)

// Seeded random function for consistent values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function ImagesShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full py-20 pb-64 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl border" style={{ backgroundColor: '#0B1014', borderColor: '#1a1f24' }}>
        {/* Profile Header */}
        <div className="px-8 py-8 border-b" style={{ borderColor: '#1a1f24' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 border-2" style={{ borderColor: '#1a1f24' }}>
              <Image
                src="/favicon.ico"
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-4">
                <h2 className="text-2xl font-light text-white">yourbrand</h2>
                <button className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition-colors">
                  Follow
                </button>
                <button className="px-4 py-1.5 border text-white text-sm font-semibold rounded-md transition-colors" style={{ borderColor: '#1a1f24' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1f24'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  Message
                </button>
                <button className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                <div className="text-center">
                  <span className="block text-base font-semibold text-white">24</span>
                  <span className="text-sm text-gray-400">posts</span>
                </div>
                <div className="text-center">
                  <span className="block text-base font-semibold text-white">1.2K</span>
                  <span className="text-sm text-gray-400">followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-base font-semibold text-white">342</span>
                  <span className="text-sm text-gray-400">following</span>
                </div>
              </div>

              {/* Bio */}
              <div className="text-left">
                <div className="text-base font-semibold text-white mb-1">Your Brand Name</div>
                <div className="text-sm text-gray-300 mb-2">
                  Creating amazing content with AI ✨
                  <br />
                  Design • Creative • Innovation
                </div>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">yourbrand.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-4 gap-0.5" style={{ backgroundColor: '#0B1014' }}>
          {imagePaths.map((path, index) => (
            <div
              key={index}
              className="relative aspect-square group cursor-pointer overflow-hidden"
              style={{ backgroundColor: '#0B1014' }}
            >
              <img
                src={path}
                alt={`Post ${index + 1}`}
                className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              {/* Hover overlay with stats */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center gap-6 transition-all">
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="font-semibold">{Math.floor(seededRandom(index) * 500) + 100}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                  <span className="font-semibold">{Math.floor(seededRandom(index + 1000) * 50) + 10}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

