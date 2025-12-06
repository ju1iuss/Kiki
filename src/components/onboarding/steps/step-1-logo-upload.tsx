'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useOnboarding } from '../onboarding-context'
import { OnboardingCard } from '../onboarding-card'
import { SampleLogo } from '../sample-logos'
import Image from 'next/image'

export function Step1LogoUpload() {
  const { nextStep, updateData } = useOnboarding()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null)
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [logoScore, setLogoScore] = useState<number | null>(null)
  const [scoreProgress, setScoreProgress] = useState(0) // Progress percentage 0-100
  const [showAdvantage1, setShowAdvantage1] = useState(false)
  const [showAdvantage2, setShowAdvantage2] = useState(false)
  const [showAdvantage3, setShowAdvantage3] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const generationStartedRef = useRef(false) // Prevent duplicate API calls

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const convertImageToBase64 = async (imagePath: string): Promise<string> => {
    const response = await fetch(imagePath)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const startBackgroundGeneration = async (logoBase64: string) => {
    // Prevent duplicate calls
    if (generationStartedRef.current) {
      console.log('Generation already started, skipping duplicate call')
      return
    }
    generationStartedRef.current = true

    try {
      // Pick 3 images from image1.png to image10.png
      const imageIndices = [1, 4, 7]
      const imagePaths = imageIndices.map(i => `/image${i}.png`)

      console.log('Starting background generation for images:', imagePaths)

      // Start generation in background (don't await)
      fetch('/api/onboarding/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for auth
        body: JSON.stringify({
          logoBase64,
          imagePaths,
        }),
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            // Update both context and localStorage immediately
            updateData({ generatedImages: data.images })
            
            // Also update localStorage directly for faster polling
            try {
              const savedData = JSON.parse(localStorage.getItem('tasy_onboarding_data') || '{}')
              savedData.generatedImages = data.images
              localStorage.setItem('tasy_onboarding_data', JSON.stringify(savedData))
            } catch (e) {
              console.error('Error updating localStorage:', e)
            }
          }
        })
        .catch(err => {
          console.error('Background generation error:', err)
        })
    } catch (error) {
      console.error('Error starting background generation:', error)
    }
  }

  const handleLogoSelection = async (logoBase64: string, logoType: 'uploaded' | 'sample' = 'uploaded', sampleType?: 'fashion' | 'beauty' | 'tech') => {
    setSelectedLogo(logoBase64)
    setShowAnimation(true)
    
    // Generate random final score between 70 and 100
    const finalScore = Math.floor(Math.random() * 31) + 70 // 70-100
    
    // Start with a lower score and animate up
    const startScore = Math.floor(Math.random() * 21) + 30 // Start between 30-50
    setLogoScore(startScore)
    
    // Store logo - SINGLE source of truth
    const logoData: any = { 
      logo: logoBase64,
      logoType 
    }
    if (sampleType) {
      logoData.sampleLogoType = sampleType
    }
    updateData(logoData)
    
    // Start background generation with the SAME logo
    startBackgroundGeneration(logoBase64)
    
    // Animate score over 8 seconds with smoother progression
    const duration = 8000 // 8 seconds
    const steps = 80 // More steps for smoother animation (out of 100)
    const stepDuration = duration / steps
    const scoreIncrement = (finalScore - startScore) / steps
    
    let currentStep = 0
    const scoreInterval = setInterval(() => {
      currentStep++
      const newScore = Math.min(
        Math.round(startScore + (scoreIncrement * currentStep)),
        finalScore
      )
      const newProgress = newScore // Direct percentage (score is already out of 100)
      const animationProgress = (currentStep / steps) * 100 // Actual animation progress percentage
      
      setLogoScore(newScore)
      setScoreProgress(newProgress)
      
      // Show advantages while score is animating (at 30%, 60%, 90% of animation progress)
      if (animationProgress >= 30 && !showAdvantage1) {
        setShowAdvantage1(true)
      }
      if (animationProgress >= 60 && !showAdvantage2) {
        setShowAdvantage2(true)
      }
      if (animationProgress >= 90 && !showAdvantage3) {
        setShowAdvantage3(true)
      }
      
      if (currentStep >= steps || newScore >= finalScore) {
        clearInterval(scoreInterval)
        setLogoScore(finalScore)
        setScoreProgress(finalScore) // Score is already out of 100
        setShowAdvantage1(true)
        setShowAdvantage2(true)
        setShowAdvantage3(true)
        setAnimationComplete(true)
      }
    }, stepDuration)
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setUploadedLogo(base64)
      // Only call handleLogoSelection - it will update data
      await handleLogoSelection(base64, 'uploaded')
    }
    reader.readAsDataURL(file)
  }

  const handleSampleLogo = async (type: 'fashion' | 'beauty' | 'tech') => {
    const logoMap: Record<'fashion' | 'beauty' | 'tech', string> = {
      fashion: '/nike.png',
      beauty: '/apple.png',
      tech: '/prada.png',
    }
    
    const logoPath = logoMap[type]
    if (!logoPath) {
      console.error('Invalid logo type:', type)
      return
    }
    
    const logoBase64 = await convertImageToBase64(logoPath)
    
    // Verify we got the logo data
    if (!logoBase64 || !logoBase64.startsWith('data:image')) {
      console.error('Failed to load logo from:', logoPath)
      return
    }
    
    // Only call handleLogoSelection - it will update data
    await handleLogoSelection(logoBase64, 'sample', type)
  }

  // Show animation overlay when logo is selected
  if (showAnimation && selectedLogo) {
    return (
      <OnboardingCard currentStep={1} totalSteps={18}>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          {/* Large Logo with Scanning Animation */}
          <div className="relative">
            <div className="w-48 h-48 md:w-64 md:h-64 relative">
              <Image
                src={selectedLogo}
                alt="Selected logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            
            {/* Scanning Lines Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent" 
                   style={{
                     animation: 'scan 2s ease-in-out infinite',
                   }}
              />
            </div>
          </div>

          {/* Score Display with Multiple Vertical Bars */}
          {logoScore !== null && (
            <div className="w-full max-w-lg space-y-4">
              {/* Score Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-black font-marlinsoft">Logo score</h3>
                <div className="text-3xl md:text-4xl font-bold text-orange-500 font-marlinsoft">
                  {logoScore}
                  <span className="text-xl text-gray-400">/100</span>
                </div>
              </div>
              
              {/* Multiple Vertical Bars - Same size, rounded, fewer bars */}
              <div className="flex items-end justify-center gap-1 h-12 bg-gray-100 rounded-lg p-2">
                {Array.from({ length: 30 }).map((_, index) => {
                  const barProgress = (scoreProgress / 100) * 30
                  const isFilled = index < barProgress
                  
                  // Color based on position (blue to green to orange gradient)
                  const colorIndex = index / 30
                  let barColor = 'bg-gray-300'
                  if (isFilled) {
                    if (colorIndex < 0.4) {
                      barColor = 'bg-blue-500'
                    } else if (colorIndex < 0.7) {
                      barColor = 'bg-green-500'
                    } else {
                      barColor = 'bg-orange-500'
                    }
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`w-2 rounded-md transition-all duration-200 ease-linear ${barColor}`}
                      style={{
                        height: isFilled ? '100%' : '20%',
                        minHeight: '8px',
                      }}
                    />
                  )
                })}
              </div>
              
              {/* Advantage Cards - Smaller and more compact */}
              <div className="space-y-2">
                {/* Advantage 1 */}
                {showAdvantage1 && (
                  <div 
                    className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                    style={{
                      animation: 'fadeInUp 0.4s ease-out',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-black text-sm">Strong brand identity</h4>
                      <span className="text-xs text-gray-600">•</span>
                      <p className="text-xs text-gray-600">Logo is clear and recognizable</p>
                    </div>
                  </div>
                )}
                
                {/* Advantage 2 */}
                {showAdvantage2 && (
                  <div 
                    className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                    style={{
                      animation: 'fadeInUp 0.4s ease-out',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-black text-sm">High visual appeal</h4>
                      <span className="text-xs text-gray-600">•</span>
                      <p className="text-xs text-gray-600">Perfect for social media mockups</p>
                    </div>
                  </div>
                )}
                
                {/* Advantage 3 */}
                {showAdvantage3 && (
                  <div 
                    className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                    style={{
                      animation: 'fadeInUp 0.4s ease-out',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-black text-sm">Ready for mockups</h4>
                      <span className="text-xs text-gray-600">•</span>
                      <p className="text-xs text-gray-600">Will look great on all 3 sample images</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Continue Button */}
              {logoScore !== null && logoScore >= 70 && (showAdvantage3 || animationComplete) && (
                <div className="pt-2">
                  <button
                    onClick={nextStep}
                    className="w-full bg-black text-white hover:bg-gray-800 border-0 font-marlinsoft px-6 py-3 rounded-lg text-base font-semibold transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes scan {
            0% {
              transform: translateY(-100%);
            }
            50% {
              transform: translateY(100%);
            }
            100% {
              transform: translateY(-100%);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </OnboardingCard>
    )
  }

  return (
    <OnboardingCard currentStep={1} totalSteps={18}>
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-black font-marlinsoft">
            See your brand in an aesthetic feed—instantly.
          </h1>
          <p className="text-gray-600 text-sm">
            No signup. Just upload or pick, and watch the magic in 3 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {/* Upload Logo */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all
              ${dragActive 
                ? 'border-black bg-gray-50' 
                : uploadedLogo
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            {uploadedLogo ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={uploadedLogo}
                  alt="Uploaded logo"
                  className="max-w-32 max-h-32 object-contain"
                />
                <span className="text-sm font-medium text-black">Logo uploaded!</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm font-medium text-black">Upload your logo</span>
                <span className="text-xs text-gray-500">Drag & drop or click</span>
              </div>
            )}
          </div>

          {/* Try with Sample */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-black text-center">Try with a sample logo</p>
            <div className="grid grid-cols-3 gap-2">
              <SampleLogo type="fashion" onClick={() => handleSampleLogo('fashion')} />
              <SampleLogo type="beauty" onClick={() => handleSampleLogo('beauty')} />
              <SampleLogo type="tech" onClick={() => handleSampleLogo('tech')} />
            </div>
          </div>
        </div>
      </div>
    </OnboardingCard>
  )
}
