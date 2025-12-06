'use client'

import React, { useEffect, useState } from 'react'
import { MockupGrid, type Mockup } from '@/components/mockup-grid'
import { useRouter } from 'next/navigation'

export default function SavedPage() {
  const router = useRouter()
  const [mockups, setMockups] = useState<Mockup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSavedMockups = async () => {
      const response = await fetch('/api/mockups/saved')
      if (response.ok) {
        const data = await response.json()
        setMockups(data.mockups || [])
      }
      setLoading(false)
    }

    fetchSavedMockups()
  }, [])

  const handleUnsave = async (mockupId: string) => {
    try {
      const response = await fetch(`/api/mockups/${mockupId}/save`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setMockups((prev) => prev.filter((m) => m.id !== mockupId))
      }
    } catch (error) {
      console.error('Error unsaving mockup:', error)
    }
  }

  const handleEdit = (mockup: Mockup) => {
    router.push(`/editor?id=${mockup.id}`)
  }

  const handleView = (mockup: Mockup) => {
    router.push(`/editor?id=${mockup.id}`)
  }

  const handleDownload = async (mockup: Mockup) => {
    // TODO: Implement download functionality
    console.log('Download mockup:', mockup)
  }

  return (
    <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white font-marlinsoft">
            Saved
          </h1>
          <p className="text-gray-400 mt-2">
            Your favorited mockups and templates
          </p>
        </div>

        <MockupGrid
          mockups={mockups}
          loading={loading}
          onUnsave={handleUnsave}
          onEdit={handleEdit}
          onView={handleView}
          onDownload={handleDownload}
          emptyMessage="You haven't saved any mockups yet. Start exploring in Discover!"
        />
      </div>
  )
}

