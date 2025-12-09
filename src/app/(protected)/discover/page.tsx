'use client'

import React, { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Collection {
  id: string
  name: string
  description: string
  coverImage: string
  images: string[]
}

const collections: Collection[] = [
  {
    id: 'minimal',
    name: 'Minimal Aesthetic',
    description: 'Clean and simple designs',
    coverImage: '/image1.png',
    images: ['/image1.png', '/image2.png', '/image3.png', '/image4.png']
  },
  {
    id: 'bold',
    name: 'Bold & Vibrant',
    description: 'High-contrast and eye-catching',
    coverImage: '/image5.png',
    images: ['/image5.png', '/image6.png', '/image7.png', '/image8.png']
  },
  {
    id: 'luxury',
    name: 'Luxury Editorial',
    description: 'Premium and sophisticated',
    coverImage: '/image9.png',
    images: ['/image9.png', '/image10.png', '/image1.png', '/image2.png']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Cozy',
    description: 'Warm and inviting',
    coverImage: '/image3.png',
    images: ['/image3.png', '/image4.png', '/image5.png', '/image6.png']
  }
]

export default function DiscoverPage() {
  const router = useRouter()
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  // Get a random collection for quick items
  const quickItemsCollection = useMemo(() => {
    return collections[Math.floor(Math.random() * collections.length)]
  }, [])

  // Get first 8 items from the random collection
  const quickItems = useMemo(() => {
    return quickItemsCollection.images.slice(0, 8)
  }, [quickItemsCollection])

  const handleReplicate = (imageUrl: string) => {
    router.push(`/editor?image=${encodeURIComponent(imageUrl)}`)
  }

  const handleQuickItemClick = () => {
    setSelectedCollection(quickItemsCollection)
  }

  if (selectedCollection) {
    return (
      <div className="space-y-6">
          <button
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </button>
          
          <div className="px-4">
            <h1 className="text-3xl font-bold text-white font-marlinsoft text-left">
              {selectedCollection.name}
            </h1>
            <p className="text-gray-400 mt-2 text-left">
              {selectedCollection.description}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-0">
            {selectedCollection.images.map((image, index) => (
              <div
                key={index}
                onClick={() => handleReplicate(image)}
                className="group relative border-r border-b border-white/10 last:border-r-0 overflow-hidden bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ aspectRatio: '1/1' }}
              >
                <img
                  src={image}
                  alt={`Collection image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="px-4 text-left">
          <h1 className="text-3xl font-bold text-white font-marlinsoft">
            Discover
          </h1>
          <p className="text-gray-400 mt-2">
            Browse and explore aesthetic mockup collections
          </p>
        </div>

        {/* Quick Items Section */}
        <div className="grid grid-cols-4 gap-0">
          {quickItems.map((image, index) => (
            <div
              key={index}
              onClick={handleQuickItemClick}
              className="group relative border-r border-b border-white/10 last:border-r-0 overflow-hidden bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ aspectRatio: '1/1' }}
            >
              <img
                src={image}
                alt={`Quick item ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Collections Section */}
        <div className="space-y-3">
          <div className="px-4">
            <h2 className="text-xl font-bold text-white font-marlinsoft">
              Collections
            </h2>
          </div>
        <div className="grid grid-cols-2 gap-0">
          {collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className="cursor-pointer group relative w-full overflow-hidden bg-gray-800 border-r border-b border-white/10 last:border-r-0 hover:opacity-90 transition-opacity"
            >
                <div className="relative w-full" style={{ aspectRatio: '21/9' }}>
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h3 className="text-2xl font-bold text-white mb-1 font-marlinsoft">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {collection.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
    </div>
  )
}
