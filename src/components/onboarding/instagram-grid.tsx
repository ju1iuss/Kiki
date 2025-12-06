'use client'

import React from 'react'
import Image from 'next/image'

interface InstagramGridProps {
  images: string[]
  className?: string
}

export function InstagramGrid({ images, className }: InstagramGridProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-3 gap-1 md:gap-1.5">
        {images.map((src, index) => (
          <div
            key={index}
            className="aspect-square rounded-sm overflow-hidden bg-gray-100 relative border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both',
            }}
          >
            <Image
              src={src}
              alt={`Generated mockup ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Instagram-like overlay on hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

