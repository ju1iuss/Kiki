'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Download, Edit, ArrowLeft, Check, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageGrid } from '@/components/image-grid'

interface UserImage {
  id: string
  url: string
  mockupId: string
  mockupTitle?: string
  created_at?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = getClient()
  const [images, setImages] = useState<UserImage[]>([])
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [selectedImage, setSelectedImage] = useState<UserImage | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchMockups = async () => {
      try {
        // Middleware already handles auth, so we can directly fetch data
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return // Shouldn't happen due to middleware, but safety check
        
        // Fetch user's mockups
        const { data: mockups, error } = await supabase
          .from('mockups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching mockups:', error.message || error)
          setLoading(false)
          return
        }

        // Extract all images from all mockups
        const allImages: UserImage[] = []
        mockups?.forEach((mockup: any) => {
          // Handle image_urls as JSONB array - could be array or null
          let imageUrls: string[] = []
          if (mockup.image_urls) {
            // If it's already an array, use it directly
            if (Array.isArray(mockup.image_urls)) {
              imageUrls = mockup.image_urls
            } else {
              // If it's a string (shouldn't happen but handle gracefully), wrap it
              imageUrls = [mockup.image_urls]
            }
          }
          
          imageUrls.forEach((url: string, index: number) => {
            // Only add valid image URLs
            if (url && typeof url === 'string' && url.length > 0) {
              allImages.push({
                id: `${mockup.id}-${index}`,
                url,
                mockupId: mockup.id,
                mockupTitle: mockup.title,
                created_at: mockup.created_at,
              })
            }
          })
        })

        setImages(allImages)
        setLoading(false)
        
        // If no images found and we haven't retried, wait a bit and retry once
        // This helps catch cases where images are still being saved
        if (allImages.length === 0 && retryCount === 0) {
          setTimeout(() => {
            setRetryCount(1)
          }, 2000) // Increased to 2 seconds to give more time for save to complete
        }
      } catch (err) {
        console.error('Error fetching mockups:', err)
        setLoading(false)
      }
    }
    
    fetchMockups()
  }, [supabase, retryCount])

  const handleDownload = async (image: UserImage) => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = image.url.split('/').pop() || 'mockup.png'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const handleEdit = (image: UserImage) => {
    router.push(`/editor?image=${encodeURIComponent(image.url)}`)
  }

  const handleImageClick = (imageUrl: string, index: number) => {
    // Find the image object from the URL
    const image = images.find(img => img.url === imageUrl)
    if (image) {
      setSelectedImage(image)
    }
  }

  const handleImageDownload = (imageUrl: string) => {
    const image = images.find(img => img.url === imageUrl)
    if (image) {
      handleDownload(image)
    }
  }

  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImageIds)
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId)
    } else {
      newSelection.add(imageId)
    }
    setSelectedImageIds(newSelection)
  }

  const handleBulkDownload = async () => {
    const selectedImages = images.filter(img => selectedImageIds.has(img.id))
    for (const image of selectedImages) {
      await handleDownload(image)
      // Small delay to prevent browser from blocking multiple downloads
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setSelectedImageIds(new Set())
    setSelectionMode(false)
  }

  const handleBulkDelete = async () => {
    if (selectedImageIds.size === 0) return

    const selectedImages = images.filter(img => selectedImageIds.has(img.id))
    
    // Group images by mockupId
    const imagesByMockup = new Map<string, UserImage[]>()
    selectedImages.forEach(img => {
      if (!imagesByMockup.has(img.mockupId)) {
        imagesByMockup.set(img.mockupId, [])
      }
      imagesByMockup.get(img.mockupId)!.push(img)
    })

    try {
      // Get all mockups to check which ones to delete entirely vs update
      const { data: mockups } = await supabase
        .from('mockups')
        .select('id, image_urls')
        .in('id', Array.from(imagesByMockup.keys()))

      const deletePromises: Promise<any>[] = []
      const updatePromises: Promise<any>[] = []

      for (const [mockupId, selectedImgs] of imagesByMockup.entries()) {
        const mockup = mockups?.find((m: any) => m.id === mockupId)
        if (!mockup) continue

        const imageUrls = Array.isArray(mockup.image_urls) ? mockup.image_urls : []
        const selectedUrls = selectedImgs.map(img => img.url)
        
        // If all images in the mockup are selected, delete the entire mockup
        if (selectedUrls.length === imageUrls.length && 
            selectedUrls.every(url => imageUrls.includes(url))) {
          deletePromises.push(
            fetch(`/api/mockups/${mockupId}`, { method: 'DELETE' })
          )
        } else {
          // Otherwise, update the mockup to remove only selected images
          const updatedUrls = imageUrls.filter((url: string) => !selectedUrls.includes(url))
          updatePromises.push(
            supabase
              .from('mockups')
              .update({ image_urls: updatedUrls })
              .eq('id', mockupId)
          )
        }
      }

      await Promise.all([...deletePromises, ...updatePromises])
      
      // Refresh the images list
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: updatedMockups } = await supabase
          .from('mockups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (updatedMockups) {
          const allImages: UserImage[] = []
          updatedMockups.forEach((mockup: any) => {
            let imageUrls: string[] = []
            if (mockup.image_urls) {
              if (Array.isArray(mockup.image_urls)) {
                imageUrls = mockup.image_urls
              } else {
                imageUrls = [mockup.image_urls]
              }
            }
            
            imageUrls.forEach((url: string, index: number) => {
              if (url && typeof url === 'string' && url.length > 0) {
                allImages.push({
                  id: `${mockup.id}-${index}`,
                  url,
                  mockupId: mockup.id,
                  mockupTitle: mockup.title,
                  created_at: mockup.created_at,
                })
              }
            })
          })
          setImages(allImages)
        }
      }

      setSelectedImageIds(new Set())
      setSelectionMode(false)
    } catch (error) {
      console.error('Error deleting images:', error)
    }
  }

  if (selectedImage) {
    return (
      <div className="space-y-6">
          <button
            onClick={() => setSelectedImage(null)}
            className="p-2 text-gray-400 hover:text-white transition-colors px-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="relative w-full flex items-center justify-center px-4">
            <div className="relative rounded-xl overflow-hidden bg-[#191919] max-w-full">
              <img
                src={selectedImage.url}
                alt={selectedImage.mockupTitle || 'Mockup'}
                className="max-w-full max-h-[85vh] object-contain block"
              />
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                <Button
                  onClick={() => handleDownload(selectedImage)}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handleEdit(selectedImage)}
                  className="bg-[#FF006F] text-white hover:bg-[#FF006F]/90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white font-marlinsoft">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Overview of your mockups and activity
            </p>
          </div>
          {!selectionMode ? (
            <Button
              onClick={() => setSelectionMode(true)}
              className="bg-white text-black hover:bg-gray-100"
            >
              Select
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {selectedImageIds.size > 0 && (
                <>
                  <Button
                    onClick={handleBulkDownload}
                    className="bg-white text-black hover:bg-gray-100 p-2"
                    title={`Download ${selectedImageIds.size} image${selectedImageIds.size > 1 ? 's' : ''}`}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white hover:bg-red-700 p-2"
                    title={`Delete ${selectedImageIds.size} image${selectedImageIds.size > 1 ? 's' : ''}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  setSelectionMode(false)
                  setSelectedImageIds(new Set())
                }}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-0">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden bg-gray-800 border-r border-b border-white/10 animate-pulse last:border-r-0">
                <div className="relative w-full" style={{ paddingBottom: '100%' }}></div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-gray-400 px-4">
            <p>No images generated yet.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Group images into sets of 4 */}
            {Array.from({ length: Math.ceil(images.length / 4) }).map((_, groupIndex) => {
              const groupImages = images.slice(groupIndex * 4, (groupIndex + 1) * 4)
              return (
                <ImageGrid
                  key={groupIndex}
                  images={groupImages.map(img => img.url)}
                  className="w-full"
                  onImageClick={selectionMode ? (url, index) => {
                    const image = groupImages[index]
                    if (image) {
                      toggleImageSelection(image.id)
                    }
                  } : handleImageClick}
                  isImageSelected={selectionMode ? (url, index) => {
                    const image = groupImages[index]
                    return image ? selectedImageIds.has(image.id) : false
                  } : undefined}
                  renderImageOverlay={selectionMode ? (url, index) => {
                    const image = groupImages[index]
                    if (!image) return null
                    const isSelected = selectedImageIds.has(image.id)
                    return (
                      <div
                        className="absolute top-2 right-2 z-30"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleImageSelection(image.id)
                        }}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-white border-white' 
                            : 'bg-black/40 border-white/40 hover:border-white/60'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />}
                        </div>
                      </div>
                    )
                  } : undefined}
                />
              )
            })}
          </div>
        )}
      </div>
  )
}
