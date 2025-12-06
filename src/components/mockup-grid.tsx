'use client'

import React from 'react'
import { MockupCard, type Mockup } from './mockup-card'

export type { Mockup }

interface MockupGridProps {
  mockups: Mockup[]
  onSave?: (mockupId: string) => void
  onUnsave?: (mockupId: string) => void
  onEdit?: (mockup: Mockup) => void
  onView?: (mockup: Mockup) => void
  onDownload?: (mockup: Mockup) => void
  loading?: boolean
  emptyMessage?: string
}

export function MockupGrid({
  mockups,
  onSave,
  onUnsave,
  onEdit,
  onView,
  onDownload,
  loading = false,
  emptyMessage = 'No mockups found',
}: MockupGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (mockups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center w-full">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mockups.map((mockup) => (
        <MockupCard
          key={mockup.id}
          mockup={mockup}
          onSave={onSave}
          onUnsave={onUnsave}
          onEdit={onEdit}
          onView={onView}
          onDownload={onDownload}
        />
      ))}
    </div>
  )
}

