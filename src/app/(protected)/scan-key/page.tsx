'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, RotateCcw, Tag, Plus, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface Key {
  id: string
  key: string
  created_at?: string
  title?: string
  description?: string
  image_url?: string
}

interface MatchResult {
  key_id: string
  title: string
  similarity: number
  matched_features: string[]
  analysis: any
  image_url?: string | null
}

const commonTags = ['Work', 'Personal', 'API', 'Production', 'Development', 'Test', 'Staging']

export default function ScanKeyPage() {
  const router = useRouter()
  const { user } = useUser()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [scanResult, setScanResult] = useState<{ matched: boolean; matches?: MatchResult[]; imageData?: string } | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddName, setQuickAddName] = useState('')
  const [quickAddTags, setQuickAddTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Error playing video:', err)
            }
          })
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        setError('Unable to access camera. Please check permissions.')
      }
    }

    if (!scanResult) {
      startCamera()
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [scanResult])

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.error('Video not ready')
      return
    }

    setIsCapturing(true)

    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL('image/jpeg', 0.9)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      setIsCapturing(false)
      setIsScanning(true)
      setScanStep(0)

      try {
        // Step 1: Upload image
        setScanStep(1)
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: imageData,
            fileName: 'scanned-key.jpg',
          }),
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        const imageUrl = uploadData.url

        // Step 2: Analyze key
        setScanStep(2)
        
        // Call the edge function to analyze and match the key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcftkbpfekuvatkiiujq.supabase.co'
        const matchResponse = await fetch(`${supabaseUrl}/functions/v1/key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          },
          body: JSON.stringify({
            mode: 'match',
            image: imageUrl,
            clerk_user_id: user?.id,
          }),
        })

        if (!matchResponse.ok) {
          const errorText = await matchResponse.text()
          throw new Error(`Failed to analyze key: ${errorText}`)
        }

        // Step 3: Compare with existing keys
        setScanStep(3)
        
        const matchData = await matchResponse.json()
        
        // Step 4: Finalize results
        setScanStep(4)
        await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX
        
        if (matchData.success && matchData.matches && matchData.matches.length > 0) {
          // Show all matches with probabilities
          setScanResult({ 
            matched: true, 
            matches: matchData.matches,
            imageData 
          })
        } else {
          // No matches found - show quick add interface
          setScanResult({ matched: false, imageData })
          setShowQuickAdd(true)
        }
      } catch (error) {
        console.error('Error scanning key:', error)
        setError(error instanceof Error ? error.message : 'Failed to scan key')
        setScanResult({ matched: false, imageData })
        setShowQuickAdd(true)
      } finally {
        setIsScanning(false)
      }
    } catch (error) {
      console.error('Error capturing photo:', error)
      setIsCapturing(false)
      setIsScanning(false)
      setError('Failed to capture photo. Please try again.')
    }
  }

  const handleCopy = async (keyId: string, keyValue: string) => {
    try {
      await navigator.clipboard.writeText(keyValue)
      setCopiedKeyId(keyId)
      setTimeout(() => setCopiedKeyId(null), 2000)
    } catch (error) {
      console.error('Error copying key:', error)
    }
  }

  const handleRetry = () => {
    setScanResult(null)
    setShowQuickAdd(false)
    setError(null)
    setIsScanning(false)
    setScanStep(0)
    setQuickAddName('')
    setQuickAddTags([])
    setNewTagInput('')
  }

  const toggleTag = (tag: string) => {
    setQuickAddTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const addCustomTag = () => {
    const tag = newTagInput.trim()
    if (tag && !quickAddTags.includes(tag)) {
      setQuickAddTags(prev => [...prev, tag])
      setNewTagInput('')
    }
  }

  const handleSaveKey = async () => {
    if (!quickAddName.trim() || !scanResult?.imageData || !user) {
      return
    }

    setIsSaving(true)
    try {
      // Upload image
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: scanResult.imageData,
          fileName: 'scanned-key.jpg',
        }),
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const uploadData = await uploadResponse.json()
      const imageUrl = uploadData.url

      // Analyze the key using the edge function
      let keyDescription: string | null = null
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcftkbpfekuvatkiiujq.supabase.co'
        const analyzeResponse = await fetch(`${supabaseUrl}/functions/v1/key`, {
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

        if (analyzeResponse.ok) {
          const analyzeData = await analyzeResponse.json()
          if (analyzeData.success && analyzeData.description) {
            keyDescription = analyzeData.description
          }
        }
      } catch (analyzeError) {
        console.error('Error during key analysis:', analyzeError)
      }

      const finalDescription = keyDescription || 
        (quickAddTags.length > 0 ? quickAddTags.join(', ') : null)

      const saveResponse = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: imageUrl,
          title: quickAddName.trim(),
          description: finalDescription,
          image_url: imageUrl,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save key')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving key:', error)
      alert('Failed to save key. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    router.back()
  }

  // Show matches screen
  if (scanResult && scanResult.matched && scanResult.matches && scanResult.matches.length > 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-white font-marlinsoft mb-2">
                {scanResult.matches.length} {scanResult.matches.length === 1 ? 'Match gefunden!' : 'Matches gefunden!'}
              </h2>
              <p className="text-gray-400">Vergleiche die Wahrscheinlichkeiten</p>
            </div>

            {/* Scanned Image */}
            {scanResult.imageData && (
              <div className="bg-[#191919] rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Gescanntes Bild</h3>
                <img
                  src={scanResult.imageData}
                  alt="Scanned key"
                  className="w-full h-auto rounded-lg max-h-48 object-contain mx-auto"
                />
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-4">
              {scanResult.matches.map((match, index) => {
                const similarityPercent = Math.round(match.similarity * 100)
                const isHighMatch = match.similarity >= 0.7
                const isMediumMatch = match.similarity >= 0.5 && match.similarity < 0.7
                
                return (
                  <div
                    key={match.key_id}
                    className={`bg-[#191919] rounded-xl p-6 border ${
                      isHighMatch 
                        ? 'border-green-500/50' 
                        : isMediumMatch 
                        ? 'border-yellow-500/50' 
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Match Image */}
                      {match.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={match.image_url}
                            alt={match.title}
                            className="w-24 h-24 rounded-lg object-cover border border-white/10"
                          />
                        </div>
                      )}
                      
                      {/* Match Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {match.title || 'Unnamed Key'}
                          </h3>
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            isHighMatch 
                              ? 'bg-green-500/20 text-green-400' 
                              : isMediumMatch 
                              ? 'bg-yellow-500/20 text-yellow-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {similarityPercent}%
                          </div>
                        </div>
                        
                        {/* Similarity Bar */}
                        <div className="mb-3">
                          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isHighMatch 
                                  ? 'bg-green-500' 
                                  : isMediumMatch 
                                  ? 'bg-yellow-500' 
                                  : 'bg-gray-500'
                              }`}
                              style={{ width: `${similarityPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Matched Features */}
                        {match.matched_features && match.matched_features.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Matched Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {match.matched_features.map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-[#FF006F]/20 text-[#FF006F] rounded text-xs"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {match.analysis?.description_summary && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {match.analysis.description_summary}
                          </p>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={() => {
                            router.push(`/dashboard?key=${match.key_id}`)
                          }}
                          className={`w-full ${
                            isHighMatch 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : isMediumMatch 
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Details öffnen
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleRetry}
                className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Erneut scannen
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 bg-[#FF006F] text-white hover:bg-[#FF006F]/90"
              >
                Fertig
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show quick add interface
  if (showQuickAdd && scanResult && !scanResult.matched) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white font-marlinsoft mb-2">
                Neuen Schlüssel hinzufügen
              </h2>
              <p className="text-gray-400 text-sm">Gib deinem Schlüssel einen Namen und Tags</p>
            </div>

            {/* Image Preview */}
            {scanResult.imageData && (
              <div className="bg-[#191919] rounded-xl p-4 border border-white/10">
                <img
                  src={scanResult.imageData}
                  alt="Scanned key"
                  className="w-full h-auto rounded-lg max-h-48 object-contain"
                />
              </div>
            )}

            {/* Quick Name Input */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Name <span className="text-[#FF006F]">*</span>
              </label>
              <Input
                type="text"
                value={quickAddName}
                onChange={(e) => setQuickAddName(e.target.value)}
                placeholder="z.B. Stripe API Key"
                className="w-full h-12 bg-[#191919] border-white/10 text-white placeholder:text-gray-500 focus:border-[#FF006F] rounded-xl text-base"
                autoFocus
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
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      quickAddTags.includes(tag)
                        ? 'bg-[#FF006F] text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
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
              {quickAddTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickAddTags.map((tag) => (
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
                onClick={handleRetry}
                className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveKey}
                disabled={!quickAddName.trim() || isSaving}
                className="flex-1 bg-[#FF006F] text-white hover:bg-[#FF006F]/90 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error screen
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white mb-4">{error}</p>
          <div className="flex gap-3">
            <Button onClick={handleRetry} className="bg-white/10 text-white hover:bg-white/20">
              Erneut versuchen
            </Button>
            <Button onClick={handleClose} className="bg-[#FF006F] text-white">
              Zurück
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show camera view
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Title */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-12 pb-4 bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-2xl font-bold text-white font-marlinsoft text-center">
          Finde deinen Schlüssel
        </h1>
      </div>

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Multi-Step Scanning Animation Overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
          <div className="text-center space-y-8 max-w-md mx-auto px-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4].map((step) => {
                const isCompleted = scanStep > step
                const isCurrent = scanStep === step
                
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2 relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500/20 border-2 border-green-500' 
                          : isCurrent 
                          ? 'bg-[#FF006F]/20 border-2 border-[#FF006F] animate-pulse' 
                          : 'bg-white/10 border-2 border-white/20'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 bg-[#FF006F] rounded-full animate-pulse" />
                        ) : (
                          <div className="w-4 h-4 bg-white/30 rounded-full" />
                        )}
                      </div>
                      {isCurrent && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                          <div className="w-2 h-2 bg-[#FF006F] rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                    {step < 4 && (
                      <div className={`h-0.5 w-6 transition-all duration-500 ${
                        scanStep > step ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>

            {/* Step Content */}
            <div className="space-y-4 min-h-[120px] flex flex-col justify-center">
              {scanStep === 1 && (
                <div className="space-y-4 animate-in">
                  <div className="relative w-24 h-24 mx-auto">
                    <Camera className="w-24 h-24 text-[#FF006F] animate-pulse" />
                    <div className="absolute inset-0 border-4 border-[#FF006F] rounded-full animate-ping opacity-30" />
                  </div>
                  <div>
                    <p className="text-white text-xl font-semibold">Bild wird hochgeladen...</p>
                    <p className="text-gray-400 text-sm mt-1">Speichere das gescannte Bild</p>
                  </div>
                </div>
              )}
              
              {scanStep === 2 && (
                <div className="space-y-4 animate-in">
                  <div className="relative w-24 h-24 mx-auto">
                    <Sparkles className="w-24 h-24 text-[#FF006F] animate-pulse" />
                    <div className="absolute inset-0 border-4 border-[#FF006F] rounded-full animate-ping opacity-30" />
                  </div>
                  <div>
                    <p className="text-white text-xl font-semibold">Schlüssel wird analysiert...</p>
                    <p className="text-gray-400 text-sm mt-1">Erkenne Merkmale und Details</p>
                  </div>
                </div>
              )}
              
              {scanStep === 3 && (
                <div className="space-y-4 animate-in">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF006F] to-pink-500 flex items-center justify-center animate-pulse">
                      <Tag className="w-12 h-12 text-white" strokeWidth={2} />
                    </div>
                    <div className="absolute inset-0 border-4 border-[#FF006F] rounded-full animate-ping opacity-30" />
                  </div>
                  <div>
                    <p className="text-white text-xl font-semibold">Vergleiche mit Sammlung...</p>
                    <p className="text-gray-400 text-sm mt-1">Suche nach ähnlichen Schlüsseln</p>
                  </div>
                </div>
              )}
              
              {scanStep === 4 && (
                <div className="space-y-4 animate-in">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-16 h-16 text-green-500" strokeWidth={3} />
                    </div>
                    <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-30" />
                  </div>
                  <div>
                    <p className="text-white text-xl font-semibold">Fertig!</p>
                    <p className="text-gray-400 text-sm mt-1">Ergebnisse werden geladen...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto">
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF006F] via-pink-500 to-[#FF006F] rounded-full transition-all duration-500 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"
                  style={{ width: `${(scanStep / 4) * 100}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">Schritt {scanStep} von 4</p>
            </div>
          </div>
        </div>
      )}

      {/* Black Overlay with Key Shape Cutout */}
      {!isScanning && (
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <mask id="keyMask">
                <rect width="100" height="100" fill="white" />
                <g transform="translate(50, 50) scale(1.3)">
                  <rect x="-8" y="-20" width="16" height="40" rx="2" fill="black" />
                  <ellipse cx="0" cy="-18" rx="20" ry="12" fill="black" />
                </g>
              </mask>
            </defs>
            <rect width="100" height="100" fill="black" fillOpacity="0.6" mask="url(#keyMask)" />
          </svg>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="flex items-center justify-center gap-4 max-w-[900px] mx-auto">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            size="icon"
          >
            <X className="w-5 h-5" />
          </Button>

          <Button
            onClick={capturePhoto}
            disabled={isCapturing || isScanning}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 border-4 border-gray-300 shadow-lg disabled:opacity-50"
          >
            <Camera className="w-8 h-8 text-black" />
          </Button>

          <div className="w-10" />
        </div>
      </div>
    </div>
  )
}
