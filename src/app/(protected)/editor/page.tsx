'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Upload, Sparkles, Download, ImagePlus, ChevronDown } from 'lucide-react'
import { MockupGrid, type Mockup } from '@/components/mockup-grid'

type EditorMode = 'create' | 'edit'

const aestheticVibes = [
  { id: 'minimal', label: 'Minimal / Clean' },
  { id: 'bold', label: 'Bold / High-Contrast' },
  { id: 'luxury', label: 'Luxury / Editorial' },
  { id: 'cozy', label: 'Cozy / Lifestyle' },
  { id: 'playful', label: 'Playful / Colorful' },
  { id: 'earthy', label: 'Earthy / Natural' },
]

const platforms = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'both', label: 'Both' },
]

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const imageUrl = searchParams.get('image')

  const [mode, setMode] = useState<EditorMode>(editId ? 'edit' : 'create')
  const [loading, setLoading] = useState(false)
  const [generatedMockups, setGeneratedMockups] = useState<Mockup[]>([])
  const [currentMockup, setCurrentMockup] = useState<Mockup | null>(null)

  // Create mode state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [selectedVibe, setSelectedVibe] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram')
  const [showReplaceDropdown, setShowReplaceDropdown] = useState(false)
  const [analyzingText, setAnalyzingText] = useState(false)
  const [analyzedTexts, setAnalyzedTexts] = useState<Array<{ label: string; text: string; originalText: string }>>([])
  const [applyingText, setApplyingText] = useState(false)
  const [versions, setVersions] = useState<Array<{ id: string; imageUrl: string; isOriginal: boolean; createdAt: string }>>([])
  const replaceDropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editId) {
      fetchMockup(editId)
    } else if (imageUrl) {
      // Load image from URL parameter
      setLogoPreview(imageUrl)
      // Initialize versions with original image
      setVersions([{
        id: 'original',
        imageUrl: imageUrl,
        isOriginal: true,
        createdAt: new Date().toISOString()
      }])
      // Create a fake file object for compatibility
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'image.png', { type: blob.type })
          setLogoFile(file)
        })
        .catch(err => console.error('Error loading image:', err))
    }
  }, [editId, imageUrl])

  const fetchMockup = async (id: string) => {
    try {
      const response = await fetch(`/api/mockups/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentMockup(data.mockup)
        setMode('edit')
      }
    } catch (error) {
      console.error('Error fetching mockup:', error)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setLogoPreview(previewUrl)
        // Initialize versions with original image
        setVersions([{
          id: 'original',
          imageUrl: previewUrl,
          isOriginal: true,
          createdAt: new Date().toISOString()
        }])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (mode === 'create' && (!logoFile || !selectedVibe)) {
      alert('Please upload a logo and select an aesthetic vibe')
      return
    }

    setLoading(true)
    try {
      if (mode === 'create') {
        // Convert logo to base64
        const logoBase64 = logoPreview

        const response = await fetch('/api/mockups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logo_url: logoBase64,
            aesthetic_vibe: selectedVibe,
            platform: selectedPlatform,
            title: `Mockup Pack - ${aestheticVibes.find(v => v.id === selectedVibe)?.label}`,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setGeneratedMockups(data.mockups || [])
          setCurrentMockup(data.mockup)
        }
      } else if (mode === 'edit' && currentMockup) {
        // Regenerate variations
        const response = await fetch(`/api/mockups/${currentMockup.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            regenerate: true,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setGeneratedMockups(data.mockups || [])
        }
      }
    } catch (error) {
      console.error('Error generating mockups:', error)
      alert('Failed to generate mockups. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (mockupId: string) => {
    try {
      const response = await fetch(`/api/mockups/${mockupId}/save`, {
        method: 'POST',
      })
      if (response.ok) {
        setGeneratedMockups((prev) =>
          prev.map((m) =>
            m.id === mockupId ? { ...m, is_saved: true } : m
          )
        )
      }
    } catch (error) {
      console.error('Error saving mockup:', error)
    }
  }

  const handleDownload = async (mockup: Mockup) => {
    // TODO: Implement download functionality
    console.log('Download mockup:', mockup)
  }

  const handleReplaceLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setLogoPreview(previewUrl)
        // Reset versions with new original image
        setVersions([{
          id: 'original',
          imageUrl: previewUrl,
          isOriginal: true,
          createdAt: new Date().toISOString()
        }])
        setAnalyzedTexts([])
      }
      reader.readAsDataURL(file)
      setShowReplaceDropdown(false)
    }
  }

  const handleAnalyzeText = async () => {
    if (!logoPreview) return
    
    setAnalyzingText(true)
    try {
      // Check if we need to upload the image first
      let imageUrl = logoPreview
      
      // If it's a data URL or relative path, upload to Supabase first
      if (imageUrl.startsWith('data:') || imageUrl.startsWith('/')) {
        console.log('[Editor] Image needs upload, starting with:', imageUrl.substring(0, 50))
        
        // For relative paths, convert to absolute first
        let imageDataToUpload = imageUrl
        if (imageUrl.startsWith('/')) {
          // Fetch the image as a blob first
          const fetchUrl = `${window.location.origin}${imageUrl}`
          console.log('[Editor] Fetching relative image from:', fetchUrl)
          const imageResponse = await fetch(fetchUrl)
          const imageBlob = await imageResponse.blob()
          
          // Convert blob to data URL
          const reader = new FileReader()
          imageDataToUpload = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(imageBlob)
          })
        }
        
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: imageDataToUpload,
            fileName: 'editor-image.png',
          }),
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          console.error('[Editor] Upload failed:', errorData)
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
        console.log('[Editor] Image uploaded successfully:', imageUrl)
      }
      // If it's already a full URL (http/https), use as-is
      
      const response = await fetch('/api/chrome-extension/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze text')
      }

      const result = await response.json()
      console.log('Analyzed texts:', result.texts)
      
      // Store analyzed texts with original text for comparison
      if (result.texts && Array.isArray(result.texts)) {
        setAnalyzedTexts(result.texts.map((item: { label: string; text: string }) => ({
          ...item,
          originalText: item.text || ''
        })))
      } else {
        setAnalyzedTexts([])
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      alert('Failed to analyze text. Please try again.')
      setAnalyzedTexts([])
    } finally {
      setAnalyzingText(false)
    }
  }

  const handleTextChange = (index: number, newText: string) => {
    setAnalyzedTexts(prev => prev.map((item, i) => 
      i === index ? { ...item, text: newText } : item
    ))
  }

  const handleApplyText = async () => {
    if (!logoPreview || analyzedTexts.length === 0) return

    // Collect text replacements
    const textReplacements = analyzedTexts
      .filter(item => item.text !== item.originalText)
      .map(item => ({
        label: item.label,
        originalText: item.originalText,
        newText: item.text
      }))

    if (textReplacements.length === 0) {
      alert('No text changes detected. Please edit the text before applying.')
      return
    }

    setApplyingText(true)
    try {
      // Ensure image is a valid URL (upload if needed)
      let imageUrl = logoPreview
      
      // If it's a data URL or relative path, upload to Supabase first
      if (imageUrl.startsWith('data:') || imageUrl.startsWith('/')) {
        console.log('[Editor] Image needs upload for apply, starting with:', imageUrl.substring(0, 50))
        
        // For relative paths, convert to absolute first
        let imageDataToUpload = imageUrl
        if (imageUrl.startsWith('/')) {
          // Fetch the image as a blob first
          const fetchUrl = `${window.location.origin}${imageUrl}`
          console.log('[Editor] Fetching relative image from:', fetchUrl)
          const imageResponse = await fetch(fetchUrl)
          const imageBlob = await imageResponse.blob()
          
          // Convert blob to data URL
          const reader = new FileReader()
          imageDataToUpload = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(imageBlob)
          })
        }
        
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: imageDataToUpload,
            fileName: 'editor-image.png',
          }),
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          console.error('[Editor] Upload failed:', errorData)
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
        console.log('[Editor] Image uploaded successfully:', imageUrl)
      }
      
      // Call adapt-ad endpoint
      const response = await fetch('/api/chrome-extension/adapt-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalAd: {
            image: imageUrl,
            headline: '',
            text: '',
            cta: '',
          },
          brandInfo: {
            logos: [],
            logo: null,
            customPrompt: '',
            accentColor: null,
            textReplacements: textReplacements,
          },
          source: 'editor',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to apply text changes')
      }

      const result = await response.json()
      const newImageUrl = result.adaptedAd?.image

      if (!newImageUrl) {
        throw new Error('No image returned from server')
      }

      // Add new version
      const newVersion = {
        id: `version-${Date.now()}`,
        imageUrl: newImageUrl,
        isOriginal: false,
        createdAt: new Date().toISOString()
      }
      setVersions(prev => [...prev, newVersion])

      // Update preview to show new image
      setLogoPreview(newImageUrl)

      // Save to database
      try {
        const saveResponse = await fetch('/api/mockups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logo_url: logoPreview, // Original image
            aesthetic_vibe: null,
            platform: null,
            title: `Text Edited Image - ${new Date().toLocaleDateString()}`,
            image_urls: [newImageUrl],
          }),
        })

        if (saveResponse.ok) {
          const saveData = await saveResponse.json()
          console.log('Saved to database:', saveData)
        }
      } catch (saveError) {
        console.error('Error saving to database:', saveError)
        // Don't fail the whole operation if save fails
      }
    } catch (error) {
      console.error('Error applying text:', error)
      alert(error instanceof Error ? error.message : 'Failed to apply text changes. Please try again.')
    } finally {
      setApplyingText(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (replaceDropdownRef.current && !replaceDropdownRef.current.contains(event.target as Node)) {
        setShowReplaceDropdown(false)
      }
    }

    if (showReplaceDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showReplaceDropdown])

  return (
    <div className="min-h-screen flex flex-col">
        {/* Title Section */}
        <div className="px-4 pt-8 pb-6">
          <h1 className="text-3xl font-bold text-white font-marlinsoft">
            Editor
          </h1>
          <p className="text-gray-400 mt-2">
            Edit and enhance your images
          </p>
        </div>

        {!logoPreview && generatedMockups.length === 0 ? (
          /* Minimal Image Input */
          <div className="flex-1 w-full px-8 pt-0">
            <div className="w-full max-w-2xl">
              <label className="cursor-pointer block">
                <div className="bg-black border border-gray-800 rounded-lg aspect-square flex items-center justify-center hover:border-gray-700 transition-colors">
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>
        ) : (
          /* Show image editor */
          <div className="flex-1 w-full flex flex-col items-center px-8 pt-0">
            {logoPreview && (
              <div className="relative w-full flex flex-col items-start gap-6">
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Editing image"
                    className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg"
                    style={{ aspectRatio: 'auto' }}
                  />
                  {/* Buttons container */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {/* Analyze Text button */}
                    <button
                      onClick={handleAnalyzeText}
                      disabled={analyzingText}
                      className="px-3 py-1.5 bg-black hover:bg-black/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {analyzingText ? 'Analyzing...' : 'Analyze Text'}
                    </button>
                    {/* Replace button with dropdown */}
                    <div className="relative" ref={replaceDropdownRef}>
                      <button
                        onClick={() => setShowReplaceDropdown(!showReplaceDropdown)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-black hover:bg-black/90 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Replace
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showReplaceDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-black border border-white/10 rounded-lg overflow-hidden min-w-[200px]">
                          <label className="block px-4 py-2 hover:bg-white/10 cursor-pointer text-white text-sm">
                            Upload Logo
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleReplaceLogo}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview('')
                      setGeneratedMockups([])
                      setSelectedVibe('')
                      setAnalyzedTexts([])
                      setVersions([])
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ×
                  </button>
                </div>

                {/* Analyzed Texts Section */}
                {analyzedTexts.length > 0 && (
                  <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white font-marlinsoft mb-4">
                      Edit Text
                    </h3>
                    <div className="space-y-4 mb-6">
                      {analyzedTexts.map((textItem, index) => (
                        <div key={index} className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            {textItem.label || `Text ${index + 1}`}
                          </label>
                          <Input
                            type="text"
                            value={textItem.text || ''}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            className="bg-black/60 border-white/10 text-white"
                            placeholder="Enter text..."
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleApplyText}
                      disabled={applyingText}
                      className="w-full px-4 py-2 bg-[#FF006F] hover:bg-[#FF006F]/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applyingText ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}

                {/* Versions Section */}
                {versions.length > 1 && (
                  <div className="w-full max-w-2xl">
                    <h3 className="text-lg font-bold text-white font-marlinsoft mb-4">
                      Versions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          onClick={() => setLogoPreview(version.imageUrl)}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            logoPreview === version.imageUrl
                              ? 'border-[#FF006F]'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <img
                            src={version.imageUrl}
                            alt={version.isOriginal ? 'Original' : 'Version'}
                            className="w-full h-auto object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                            {version.isOriginal ? 'Original' : 'Edited'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {generatedMockups.length > 0 && (
              <div className="space-y-4">
                <MockupGrid
                  mockups={generatedMockups}
                  onSave={handleSave}
                  onDownload={handleDownload}
                />
              </div>
            )}
          </div>
        )}
      </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}

