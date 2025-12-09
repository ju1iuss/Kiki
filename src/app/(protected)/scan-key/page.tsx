'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, RotateCcw, Tag, Plus, Save, Sparkles, ChevronRight, Info } from 'lucide-react'
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
  reason: string
  description: string
  image_url?: string | null
}

const commonTags = ['Arbeit', 'Privat', 'API', 'Produktion', 'Entwicklung', 'Test', 'Staging']

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
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddName, setQuickAddName] = useState('')
  const [quickAddTags, setQuickAddTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const [clickedButtonId, setClickedButtonId] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

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
      setCapturedImageData(imageData) // Store image for display in step loader

      // Auto-progress through 5 steps in 20 seconds (4 seconds per step)
      const stepDuration = 4000 // 4 seconds per step
      
      // Progress through steps automatically
      setScanStep(1)
      setTimeout(() => setScanStep(2), stepDuration)
      setTimeout(() => setScanStep(3), stepDuration * 2)
      setTimeout(() => setScanStep(4), stepDuration * 3)
      setTimeout(() => setScanStep(5), stepDuration * 4)

      try {
        // Start backend operations in parallel
        const uploadPromise = fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: imageData,
            fileName: 'scanned-key.jpg',
          }),
        })

        // Wait for 20 seconds total (ensuring UI completes all steps)
        await new Promise(resolve => setTimeout(resolve, 20000))

        // Now process the results
        const uploadResponse = await uploadPromise

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        const imageUrl = uploadData.url
        
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
        
        if (matchResponse.ok) {
          const matchData = await matchResponse.json()
          
          if (matchData.success && matchData.matches && matchData.matches.length > 0) {
            // Show all matches with probabilities
            setScanResult({ 
              matched: true, 
              matches: matchData.matches,
              imageData 
            })
            // Show match animation
            setShowMatchAnimation(true)
            setTimeout(() => setShowMatchAnimation(false), 4000) // Fade after 4 seconds
          } else {
            // No matches found - show no matches screen and go back to dashboard
            setScanResult({ matched: false, imageData })
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000) // Show message for 2 seconds then navigate
          }
        } else {
          // Error or no matches - show no matches screen and go back to dashboard
          setScanResult({ matched: false, imageData })
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000) // Show message for 2 seconds then navigate
        }
      } catch (error) {
        console.error('Error scanning key:', error)
        setScanResult({ matched: false, imageData })
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000) // Show message for 2 seconds then navigate
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
    setCapturedImageData(null)
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
        {/* Match Animation Overlay */}
        {showMatchAnimation && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
            <div 
              className="bg-[#191919] border border-green-500 rounded-2xl px-8 py-6 text-center max-w-md mx-4"
              style={{
                animation: 'matchFoundAnimation 4s ease-in-out forwards'
              }}
            >
              <h2 className="text-2xl font-bold text-white font-marlinsoft mb-2">
                {scanResult.matches.length} {scanResult.matches.length === 1 ? 'Match gefunden!' : 'Matches gefunden!'}
              </h2>
              <p className="text-gray-300">Vergleiche die Wahrscheinlichkeiten</p>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
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
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-white/10 bg-white/5 relative group">
                        {match.image_url ? (
                          !imageErrors.has(match.key_id) ? (
                            <>
                              <img
                                src={match.image_url}
                                alt={match.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  console.error('Image failed to load:', match.image_url)
                                  setImageErrors(prev => new Set(prev).add(match.key_id))
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', match.image_url)
                                }}
                              />
                              {/* URL tooltip on hover */}
                              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 z-10 pointer-events-none">
                                <div className="text-[8px] text-white/80 text-center break-all leading-tight font-mono">
                                  {match.image_url}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-1 z-10">
                              <Camera className="w-6 h-6 text-white/30 mb-1" />
                              <div className="text-[7px] text-white/60 text-center break-all leading-tight font-mono">
                                Failed to load
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white/30" />
                          </div>
                        )}
                      </div>
                      
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

                        {/* Match Reason */}
                        {match.reason && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Match Reason:</p>
                            <p className="text-sm text-gray-300">
                              {match.reason}
                            </p>
                          </div>
                        )}

                        {/* Description and Action Button */}
                        <div className="flex items-start justify-between gap-3">
                          {match.description && (
                            <p className="text-sm text-gray-400 flex-1 line-clamp-2">
                              {match.description}
                            </p>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setClickedButtonId(match.key_id)
                              // Add a small delay for animation feedback
                              setTimeout(() => {
                                router.push(`/dashboard?key=${match.key_id}`)
                              }, 200)
                            }}
                            className={`
                              flex-shrink-0 w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center
                              ${clickedButtonId === match.key_id 
                                ? 'scale-75 bg-[#FF006F]' 
                                : 'scale-100 hover:scale-110'
                              }
                              ${isHighMatch 
                                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400' 
                                : isMediumMatch 
                                ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' 
                                : 'bg-white/10 hover:bg-white/20 text-white'
                              }
                            `}
                            title="Details öffnen"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
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

  // Show no matches found screen
  if (scanResult && !scanResult.matched && !showQuickAdd) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-gray-400" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-white font-marlinsoft mb-2">
            Keine Matches gefunden
          </h2>
          <p className="text-gray-400 mb-6">Der gescannte Schlüssel wurde nicht in deiner Sammlung gefunden.</p>
          <p className="text-sm text-gray-500">Weiterleitung zum Dashboard...</p>
        </div>
      </div>
    )
  }

  // Show quick add interface (kept for backward compatibility but shouldn't be used)
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
          <div className="max-w-md mx-auto px-6 w-full">
            {/* Vertical Card Stack */}
            <div className="space-y-3">
              {[
                { step: 1, title: 'Bild wird hochgeladen', description: 'Speichere das gescannte Bild' },
                { step: 2, title: 'Schlüssel wird analysiert', description: 'Erkenne Merkmale und Details' },
                { step: 3, title: 'Vergleiche mit Sammlung', description: 'Suche nach ähnlichen Schlüsseln' },
                { step: 4, title: 'Berechne Ähnlichkeiten', description: 'Analysiere Übereinstimmungen' },
                { step: 5, title: 'Fertig', description: 'Ergebnisse werden geladen' },
              ].map((stepData) => {
                const isCompleted = scanStep > stepData.step
                const isCurrent = scanStep === stepData.step
                const isPending = scanStep < stepData.step
                
                return (
                  <div
                    key={stepData.step}
                    className={`
                      bg-[#191919] rounded-xl p-4 border transition-all duration-500
                      ${isCompleted 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : isCurrent 
                        ? 'border-[#FF006F] bg-[#FF006F]/10 shadow-lg shadow-[#FF006F]/20' 
                        : 'border-white/10 bg-[#191919] opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Indicator */}
                      <div className={`
                        w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-green-500' 
                          : isCurrent 
                          ? 'bg-[#FF006F] animate-pulse' 
                          : 'bg-white/20'
                        }
                      `} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`
                          text-base font-semibold mb-1 transition-colors
                          ${isCompleted 
                            ? 'text-green-400' 
                            : isCurrent 
                            ? 'text-white' 
                            : 'text-gray-400'
                          }
                        `}>
                          {stepData.title}
                        </h3>
                        <p className={`
                          text-sm transition-colors
                          ${isCompleted || isCurrent 
                            ? 'text-gray-300' 
                            : 'text-gray-500'
                          }
                        `}>
                          {stepData.description}
                        </p>
                        {/* Show scanned image in step 1 */}
                        {stepData.step === 1 && isCurrent && capturedImageData && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                            <img
                              src={capturedImageData}
                              alt="Scanned key"
                              className="w-full h-auto max-h-32 object-contain"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Loading indicator for current step */}
                      {isCurrent && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 border-2 border-[#FF006F] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      
                      {/* Checkmark for completed steps */}
                      {isCompleted && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
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

