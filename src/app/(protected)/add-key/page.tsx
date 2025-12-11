'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, ImagePlus, Tag, Plus, Save, ArrowLeft } from 'lucide-react'

export default function AddKeyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [keyName, setKeyName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const [showDescription, setShowDescription] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const commonTags = ['Arbeit', 'Privat', 'API', 'Produktion', 'Entwicklung', 'Test', 'Staging']

  // Check for pending image from camera (stored in sessionStorage)
  useEffect(() => {
    const pendingImageUrl = sessionStorage.getItem('pendingKeyImage')
    if (pendingImageUrl) {
      // Set the image preview and create a file object
      setImagePreview(pendingImageUrl)
      setShowQuickAdd(true)
      
      // Fetch the image to create a File object
      fetch(pendingImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          setImageFile(file)
        })
        .catch(err => console.error('Error fetching image:', err))
      
      // Clear from sessionStorage
      sessionStorage.removeItem('pendingKeyImage')
    }
  }, [])

  const cropImageTo3x5 = (imageData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const targetAspectRatio = 3 / 5 // 0.6
        const imgWidth = img.width
        const imgHeight = img.height
        const imgAspectRatio = imgWidth / imgHeight

        let cropWidth: number
        let cropHeight: number
        let cropX: number
        let cropY: number

        // Calculate crop dimensions to fit 3:5 aspect ratio
        if (imgAspectRatio > targetAspectRatio) {
          // Image is wider than target ratio, fit to height
          cropHeight = imgHeight
          cropWidth = cropHeight * targetAspectRatio
          cropX = (imgWidth - cropWidth) / 2 // Center horizontally
          cropY = 0
        } else {
          // Image is taller than target ratio, fit to width
          cropWidth = imgWidth
          cropHeight = cropWidth / targetAspectRatio
          cropX = 0
          cropY = (imgHeight - cropHeight) / 2 // Center vertically
        }

        // Set canvas to exact 3:5 dimensions
        const outputWidth = 600
        const outputHeight = 1000
        canvas.width = outputWidth
        canvas.height = outputHeight

        // Draw the cropped image to canvas
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight, // Source rectangle
          0, 0, outputWidth, outputHeight // Destination rectangle
        )

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageData
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const originalDataUrl = e.target?.result as string
        try {
          // Crop image to 3:5 aspect ratio
          const croppedDataUrl = await cropImageTo3x5(originalDataUrl)
          setImagePreview(croppedDataUrl)
          
          // Convert cropped data URL back to File for upload
          const response = await fetch(croppedDataUrl)
          const blob = await response.blob()
          const croppedFile = new File([blob], file.name || 'key-image.jpg', { type: 'image/jpeg' })
          setImageFile(croppedFile)
          
          setShowQuickAdd(true) // Show quick-add interface for file uploads
        } catch (error) {
          console.error('Error cropping image:', error)
          // Fallback to original image if cropping fails
          setImagePreview(originalDataUrl)
          setImageFile(file)
          setShowQuickAdd(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const addCustomTag = () => {
    const tag = newTagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
      setNewTagInput('')
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!imageFile || !keyName.trim()) {
      alert('Please upload an image and enter a key name')
      return
    }

    if (!user) {
      alert('Please sign in to add a key')
      return
    }

    setLoading(true)
    try {
      // Check if image is already uploaded (URL) or needs to be uploaded (base64)
      let imageUrl: string
      
      if (imagePreview.startsWith('http')) {
        // Already uploaded, use the URL directly
        imageUrl = imagePreview
      } else {
        // Need to upload the image first
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: imagePreview,
            fileName: imageFile.name || 'key-image.png',
          }),
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      // Generate a key from the image URL or create a unique key
      const keyValue = imageUrl

      // AI analysis goes in description (JSON string), manual description goes in custom_description
      // If no AI analysis, use tags as fallback for description
      const initialDescription = tags.length > 0 ? tags.join(', ') : null
      const customDescription = description.trim() || null

      // OPTIMISTIC SAVE: Save the key immediately without waiting for AI analysis
      const saveResponse = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: keyValue,
          title: keyName.trim(),
          description: initialDescription,
          custom_description: customDescription,
          image_url: imageUrl,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save key')
      }

      const savedKeyData = await saveResponse.json()
      const savedKeyId = savedKeyData.key?.id

      // Success - redirect to dashboard immediately (optimistic)
      router.push('/dashboard')

      // Update with AI analysis in the background (fire and forget)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcftkbpfekuvatkiiujq.supabase.co'
      fetch(`${supabaseUrl}/functions/v1/key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          mode: 'analyze',
          image: imageUrl,
        }),
      })
        .then(async (analyzeResponse) => {
          if (analyzeResponse.ok) {
            try {
              const analyzeData = await analyzeResponse.json()
              if (analyzeData.success && analyzeData.description && savedKeyId) {
                // Update the key with AI analysis in the background
                await fetch(`/api/keys/${savedKeyId}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    description: analyzeData.description,
                  }),
                })
                console.log('Key analysis updated successfully in background')
              }
            } catch (parseError) {
              console.error('Error parsing analysis response:', parseError)
            }
          }
        })
        .catch((error) => {
          console.error('Background AI analysis failed:', error)
          // Silently fail - key is already saved
        })
    } catch (error) {
      console.error('Error adding key:', error)
      alert(error instanceof Error ? error.message : 'Failed to add key. Please try again.')
      setLoading(false)
    }
  }

  // Show quick-add interface when image is captured/uploaded
  if (showQuickAdd && imagePreview) {
    return (
      <div className="min-h-screen bg-black flex items-start justify-center p-4 lg:items-center overflow-y-auto pb-24">
        <div className="w-full max-w-lg bg-[#191919] rounded-2xl border border-white/10 overflow-hidden my-4">
          <div className="flex flex-col p-8 space-y-6">
            {/* Image Preview with Title and Name Input Overlay */}
            <div className="relative bg-black rounded-xl border border-white/10 overflow-hidden mx-auto w-full max-w-[360px]" style={{ aspectRatio: '3/5' }}>
              <img
                src={imagePreview}
                alt="Key preview"
                className="w-full h-full object-contain"
              />
              
              {/* Overlay with Title and Name Input */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/60 via-transparent to-black/60">
                {/* Title */}
                <div className="text-center pt-2">
                  <h1 className="text-lg font-bold text-white font-marlinsoft">
                    Neuen Schlüssel hinzufügen
                  </h1>
                </div>

                {/* Name Input at Bottom */}
                <div className="pb-2">
                  <Input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Name eingeben..."
                    className="w-full h-10 bg-black/80 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 focus:border-[#FF006F] rounded-lg text-sm px-3"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {/* Description - Collapsible with Plus Icon */}
            <div>
              {!showDescription ? (
                <button
                  onClick={() => setShowDescription(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-black/40 border border-white/10 rounded-lg hover:bg-black/60 transition-colors text-left"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-300">Beschreibung hinzufügen</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Beschreibung
                    </label>
                    <button
                      onClick={() => {
                        setShowDescription(false)
                        setDescription('')
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Füge eine Beschreibung hinzu..."
                    className="w-full min-h-[100px] p-3 bg-black border border-white/10 text-white rounded-lg resize-none placeholder:text-gray-500 focus:outline-none focus:border-[#FF006F] text-sm"
                    rows={4}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Quick Tags */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all
                      ${tags.includes(tag)
                        ? 'bg-[#FF006F] text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }
                    `}
                  >
                    <Tag className="w-3.5 h-3.5 inline-block mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
              
              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomTag()
                    }
                  }}
                  placeholder="Eigenes Tag"
                  className="flex-1 h-10 bg-black border-white/10 text-white placeholder:text-gray-500 focus:border-[#FF006F] rounded-lg text-sm px-3"
                />
                <Button
                  onClick={addCustomTag}
                  disabled={!newTagInput.trim()}
                  className="h-10 px-4 bg-white/10 text-white hover:bg-white/20 border border-white/10 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="px-3 py-1.5 bg-[#FF006F]/20 text-[#FF006F] rounded-lg text-sm flex items-center gap-2"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="ml-1 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons - Icons Only */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-50">
          <Button
            onClick={() => {
              router.push('/dashboard')
            }}
            className="w-14 h-14 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 flex items-center justify-center shadow-lg"
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!keyName.trim() || loading}
            className="w-14 h-14 rounded-full bg-[#FF006F] text-white hover:bg-[#FF006F]/90 disabled:opacity-50 flex items-center justify-center shadow-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="px-4">
        <h1 className="text-3xl font-bold text-white font-marlinsoft">
          Add Key
        </h1>
        <p className="text-gray-400 mt-2">
          Upload an image and name your key
        </p>
      </div>

      <div className="px-4 space-y-6 max-w-2xl">
        {/* Image Upload Section */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Image
          </label>
          {!imagePreview ? (
            <label className="cursor-pointer block">
              <div className="bg-black border border-gray-800 rounded-lg aspect-video flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
                <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm">Click to upload image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </label>
          ) : (
            <div className="relative">
              <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Key Name Input */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Key Name <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Enter key name"
            className="bg-black/60 border-white/10 text-white"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Description (Optional)
          </label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="bg-black/60 border-white/10 text-white"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={loading || !imageFile || !keyName.trim()}
            className="bg-[#FF006F] text-white hover:bg-[#FF006F]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Key'}
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

