'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Heart, Edit, Download, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Mockup {
  id: string
  title?: string
  image_urls: string[]
  aesthetic_vibe?: string
  platform?: string
  content_type?: string
  created_at?: string
  is_saved?: boolean
}

interface MockupCardProps {
  mockup: Mockup
  onSave?: (mockupId: string) => void
  onUnsave?: (mockupId: string) => void
  onEdit?: (mockup: Mockup) => void
  onView?: (mockup: Mockup) => void
  onDownload?: (mockup: Mockup) => void
}

export function MockupCard({
  mockup,
  onSave,
  onUnsave,
  onEdit,
  onView,
  onDownload,
}: MockupCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(mockup.is_saved || false)

  const primaryImage = mockup.image_urls?.[0] || '/placeholder.png'

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSaving) return

    setIsSaving(true)
    try {
      if (isSaved && onUnsave) {
        await onUnsave(mockup.id)
        setIsSaved(false)
      } else if (!isSaved && onSave) {
        await onSave(mockup.id)
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error saving mockup:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClick = () => {
    if (onView) {
      onView(mockup)
    }
  }

  return (
    <div
      className="group relative bg-gray-900 rounded-lg border border-gray-800 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="aspect-square relative bg-gray-800 overflow-hidden">
        <Image
          src={primaryImage}
          alt={mockup.title || 'Mockup'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (onEdit) onEdit(mockup)
              }}
              className="bg-white/90 hover:bg-white"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload(mockup)
                }}
                className="bg-white/90 hover:bg-white"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            absolute top-2 right-2 p-2 rounded-full transition-all
            ${
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }
            ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Info */}
      {(mockup.title || mockup.aesthetic_vibe) && (
        <div className="p-3">
          {mockup.title && (
            <h3 className="text-sm font-medium text-white truncate mb-1">
              {mockup.title}
            </h3>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {mockup.aesthetic_vibe && (
              <span className="capitalize">{mockup.aesthetic_vibe}</span>
            )}
            {mockup.platform && (
              <>
                {mockup.aesthetic_vibe && <span>•</span>}
                <span className="capitalize">{mockup.platform}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

