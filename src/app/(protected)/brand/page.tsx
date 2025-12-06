'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, ImagePlus, Type, Trash2 } from 'lucide-react'
import { getClient } from '@/lib/supabase/client'

interface BrandAsset {
  id: string
  url: string
  name?: string
}

export default function BrandPage() {
  const [logos, setLogos] = useState<BrandAsset[]>([])
  const [headlines, setHeadlines] = useState<string[]>([''])
  const [secondaryImages, setSecondaryImages] = useState<BrandAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = getClient()

  useEffect(() => {
    loadBrandAssets()
  }, [])

  const loadBrandAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading brand assets:', error)
        return
      }

      if (data) {
        setLogos(data.logos || [])
        setHeadlines(data.headlines && data.headlines.length > 0 ? data.headlines : [''])
        setSecondaryImages(data.secondary_images || [])
      }
    } catch (error) {
      console.error('Error loading brand assets:', error)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setLoading(true)
    try {
      const newLogos: BrandAsset[] = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large (max 5MB)`)
          continue
        }

        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          newLogos.push({
            id: Date.now().toString() + Math.random(),
            url: base64,
            name: file.name,
          })

          if (newLogos.length === files.length) {
            setLogos((prev) => [...prev, ...newLogos])
            setLoading(false)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      setLoading(false)
    }
  }

  const handleSecondaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setLoading(true)
    try {
      const newImages: BrandAsset[] = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large (max 5MB)`)
          continue
        }

        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          newImages.push({
            id: Date.now().toString() + Math.random(),
            url: base64,
            name: file.name,
          })

          if (newImages.length === files.length) {
            setSecondaryImages((prev) => [...prev, ...newImages])
            setLoading(false)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Error uploading secondary image:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please sign in to save brand assets')
        return
      }

      // Filter out empty headlines
      const filteredHeadlines = headlines.filter((h) => h.trim() !== '')

      const { error } = await supabase
        .from('brand_assets')
        .upsert({
          user_id: user.id,
          logos,
          headlines: filteredHeadlines.length > 0 ? filteredHeadlines : [],
          secondary_images: secondaryImages,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (error) {
        throw error
      }

      alert('Brand assets saved successfully!')
    } catch (error) {
      console.error('Error saving brand assets:', error)
      alert('Failed to save brand assets. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const removeLogo = (id: string) => {
    setLogos((prev) => prev.filter((logo) => logo.id !== id))
  }

  const removeSecondaryImage = (id: string) => {
    setSecondaryImages((prev) => prev.filter((img) => img.id !== id))
  }

  const addHeadline = () => {
    setHeadlines((prev) => [...prev, ''])
  }

  const updateHeadline = (index: number, value: string) => {
    setHeadlines((prev) => {
      const newHeadlines = [...prev]
      newHeadlines[index] = value
      return newHeadlines
    })
  }

  const removeHeadline = (index: number) => {
    setHeadlines((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl space-y-6 px-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white font-marlinsoft">Brand Assets</h1>
        </div>

        {/* Logos Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Logos</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {logos.map((logo) => (
              <div key={logo.id} className="relative group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={logo.url}
                    alt={logo.name || 'Logo'}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <button
                  onClick={() => removeLogo(logo.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
              <div className="text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-400">Upload Logo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleLogoUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Headlines Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Headlines</h2>
          </div>
          <div className="space-y-2">
            {headlines.map((headline, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => updateHeadline(index, e.target.value)}
                  placeholder="Enter headline text..."
                  className="bg-transparent text-white text-sm focus:outline-none flex-1"
                />
                {headlines.length > 1 && (
                  <button
                    onClick={() => removeHeadline(index)}
                    className="w-6 h-6 flex items-center justify-center transition-colors hover:opacity-70"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
            ))}
            <Button
              onClick={addHeadline}
              variant="outline"
              size="sm"
              className="h-8 text-xs border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            >
              + Add Headline
            </Button>
          </div>
        </div>

        {/* Secondary Images (B-roll) Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold text-white">Secondary Images (B-roll)</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {secondaryImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name || 'Secondary image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeSecondaryImage(image.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
              <div className="text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-400">Upload Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSecondaryImageUpload}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            size="sm"
            className="h-8 text-xs bg-white text-black hover:bg-gray-100"
          >
            {saving ? 'Saving...' : 'Save Brand Assets'}
          </Button>
        </div>
      </div>
  )
}

