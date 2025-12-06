'use client'

import React from 'react'
import Image from 'next/image'

interface SampleLogoProps {
  type: 'fashion' | 'beauty' | 'tech'
  selected?: boolean
  onClick: () => void
}

export function SampleLogo({ type, selected, onClick }: SampleLogoProps) {
  const logoMap = {
    fashion: '/nike.png',
    beauty: '/apple.png',
    tech: '/prada.png',
  }

  const labels = {
    fashion: 'Nike',
    beauty: 'Apple',
    tech: 'Prada',
  }

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
        ${selected 
          ? 'border-black bg-gray-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      <div className="w-20 h-20 flex items-center justify-center">
        <Image
          src={logoMap[type]}
          alt={labels[type]}
          width={80}
          height={80}
          className="object-contain max-w-full max-h-full"
          unoptimized
        />
      </div>
      <span className="text-sm font-medium text-black">{labels[type]}</span>
    </button>
  )
}

