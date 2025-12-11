'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KeyCameraProps {
  onCapture: (imageData: string) => Promise<void>
  onClose: () => void
}

export function KeyCamera({ onCapture, onClose }: KeyCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch((err) => {
            // Ignore play() interruption errors - they're common when component unmounts quickly
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

    startCamera()

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    // Check if video is ready
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

      const videoWidth = video.videoWidth || video.clientWidth
      const videoHeight = video.videoHeight || video.clientHeight

      // Target aspect ratio: 3:5 (width:height = 3:5 = 0.6)
      const targetAspectRatio = 3 / 5 // 0.6

      // Calculate crop area based on key overlay shape (centered)
      // Key overlay is centered at 50% with scale 1.3
      // Use the overlay region as the base for cropping
      const overlayCenterX = videoWidth * 0.5
      const overlayCenterY = videoHeight * 0.5
      const overlayWidth = videoWidth * 0.52
      const overlayHeight = videoHeight * 0.65

      // Calculate crop dimensions to fit 3:5 aspect ratio
      // Use the larger dimension to ensure we capture enough area
      let cropWidth: number
      let cropHeight: number

      if (overlayWidth / overlayHeight > targetAspectRatio) {
        // Overlay is wider than target ratio, fit to height
        cropHeight = overlayHeight
        cropWidth = cropHeight * targetAspectRatio
      } else {
        // Overlay is taller than target ratio, fit to width
        cropWidth = overlayWidth
        cropHeight = cropWidth / targetAspectRatio
      }

      // Center the crop on the overlay center
      const cropX = overlayCenterX - cropWidth / 2
      const cropY = overlayCenterY - cropHeight / 2

      // Set canvas to exact 3:5 aspect ratio dimensions
      // Use a reasonable output size (e.g., 600x1000 pixels for good quality)
      const outputWidth = 600
      const outputHeight = 1000
      canvas.width = outputWidth
      canvas.height = outputHeight

      // Draw the cropped video frame to canvas, scaled to exact 3:5 dimensions
      ctx.drawImage(
        video,
        Math.max(0, cropX), Math.max(0, cropY), cropWidth, cropHeight, // Source rectangle (crop from video)
        0, 0, outputWidth, outputHeight // Destination rectangle (exact 3:5 size)
      )

      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.9)

      // Stop camera stream immediately after capture
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Call onCapture - it will handle upload and navigation
      // Keep isCapturing true to show loading state
      await onCapture(imageData)
      // If successful, onCapture will handle closing the camera
    } catch (error) {
      console.error('Error capturing photo:', error)
      setIsCapturing(false)
      
      // Show error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture photo. Please try again.'
      setError(errorMessage)
      
      // Restart camera stream for retry after a short delay
      setTimeout(async () => {
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
            videoRef.current.play().catch(() => {})
          }
          // Clear error after restarting camera
          setError(null)
        } catch (restartError) {
          console.error('Error restarting camera:', restartError)
        }
      }, 1000)
    }
  }

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    onClose()
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-white mb-4">{error}</p>
          <Button onClick={handleClose} className="bg-[#FF006F] text-white">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Black Overlay with Key Shape Cutout */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <mask id="keyMask">
              {/* White = overlay visible, Black = transparent (camera visible) */}
              <rect width="100" height="100" fill="white" />
              <g transform="translate(50, 50) scale(1.3)">
                {/* Key blade - simple rectangle */}
                <rect x="-8" y="-20" width="16" height="40" rx="2" fill="black" />
                {/* Key head - ellipse (wider than tall) */}
                <ellipse cx="0" cy="-18" rx="20" ry="12" fill="black" />
              </g>
            </mask>
          </defs>
          <rect width="100" height="100" fill="black" fillOpacity="0.6" mask="url(#keyMask)" />
        </svg>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4 max-w-[900px] mx-auto">
          {!isCapturing && (
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              size="icon"
            >
              <X className="w-5 h-5" />
            </Button>
          )}

          {isCapturing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-white text-sm">Wird hochgeladen...</p>
            </div>
          ) : (
            <Button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 border-4 border-gray-300 shadow-lg disabled:opacity-50"
            >
              <Camera className="w-8 h-8 text-black" />
            </Button>
          )}

          {!isCapturing && <div className="w-10" />} {/* Spacer for symmetry */}
        </div>
      </div>
    </div>
  )
}

