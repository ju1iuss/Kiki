'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, ImagePlus, Tag, Plus, Save } from 'lucide-react'

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setImagePreview(previewUrl)
        setShowQuickAdd(true) // Show quick-add interface for file uploads
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

      // Analyze the key using the edge function (use the uploaded URL instead of base64)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcftkbpfekuvatkiiujq.supabase.co'
      const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          mode: 'analyze',
          image: imageUrl, // Use the uploaded URL instead of base64
        }),
      })

      let keyDescription: string | null = null
      if (analyzeResponse.ok) {
        try {
          const analyzeData = await analyzeResponse.json()
          if (analyzeData.success && analyzeData.description) {
            // The edge function returns description as JSON.stringify(analysis)
            keyDescription = analyzeData.description
            console.log('Key analysis successful, description saved')
          } else {
            console.warn('Key analysis response missing description:', analyzeData)
          }
        } catch (parseError) {
          console.error('Error parsing analysis response:', parseError)
        }
      } else {
        const errorText = await analyzeResponse.text()
        console.warn('Key analysis failed:', analyzeResponse.status, errorText)
      }

      // Generate a key from the image URL or create a unique key
      const keyValue = imageUrl

      // AI analysis goes in description (JSON string), manual description goes in custom_description
      // If no AI analysis, use tags as fallback for description
      const finalDescription = keyDescription || 
        (tags.length > 0 ? tags.join(', ') : null)
      const customDescription = description.trim() || null

      // Save the key to the database
      const saveResponse = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: keyValue,
          title: keyName.trim(),
          description: finalDescription,
          custom_description: customDescription,
          image_url: imageUrl,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save key')
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error adding key:', error)
      alert(error instanceof Error ? error.message : 'Failed to add key. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show quick-add interface when image is captured/uploaded
  if (showQuickAdd && imagePreview) {
    return (
      <div className="min-h-screen bg-black">
        <div className="px-4 py-6 max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white font-marlinsoft mb-2">
              Neuen Schlüssel hinzufügen
            </h1>
            <p className="text-gray-400 text-sm">Gib deinem Schlüssel einen Namen und Tags</p>
          </div>

          {/* Image Preview */}
          <div className="bg-[#191919] rounded-xl p-4 border border-white/10">
            <img
              src={imagePreview}
              alt="Key preview"
              className="w-full h-auto rounded-lg max-h-64 object-contain"
            />
          </div>

          {/* Quick Name Input */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Name <span className="text-[#FF006F]">*</span>
            </label>
            <Input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="z.B. Stripe API Key"
              className="w-full h-12 bg-[#191919] border-white/10 text-white placeholder:text-gray-500 focus:border-[#FF006F] rounded-xl text-base"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Beschreibung <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Füge eine Beschreibung hinzu..."
              className="w-full min-h-[100px] p-3 bg-[#191919] border border-white/10 text-white rounded-xl resize-y placeholder:text-gray-500 focus:outline-none focus:border-[#FF006F] text-base"
              rows={3}
            />
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
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${tags.includes(tag)
                      ? 'bg-[#FF006F] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  <Tag className="w-3 h-3 inline-block mr-1.5" />
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
                placeholder="Eigenes Tag hinzufügen"
                className="flex-1 h-10 bg-[#191919] border-white/10 text-white placeholder:text-gray-500 focus:border-[#FF006F] rounded-lg text-sm"
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
                    className="px-3 py-1.5 bg-[#FF006F]/20 text-[#FF006F] rounded-lg text-sm flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-1 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                router.push('/dashboard')
              }}
              className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/20"
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!keyName.trim() || loading}
              className="flex-1 bg-[#FF006F] text-white hover:bg-[#FF006F]/90 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
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

