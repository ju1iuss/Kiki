'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KeyCameraProps {
  onCapture: (imageData: string) => void
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

      // Set canvas size to match video
      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.9)

      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      setIsCapturing(false)
      onCapture(imageData)
    } catch (error) {
      console.error('Error capturing photo:', error)
      setIsCapturing(false)
      setError('Failed to capture photo. Please try again.')
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
            disabled={isCapturing}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 border-4 border-gray-300 shadow-lg disabled:opacity-50"
          >
            <Camera className="w-8 h-8 text-black" />
          </Button>

          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>
      </div>
    </div>
  )
}

