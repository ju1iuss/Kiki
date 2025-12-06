'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Download } from 'lucide-react'

interface ImageGridProps {
  images: string[]
  className?: string
  onImageClick?: (imageUrl: string, index: number) => void
  showReplicateButton?: boolean
  showDownloadButton?: boolean
  onDownload?: (imageUrl: string, index: number) => void
  renderImageOverlay?: (imageUrl: string, index: number) => React.ReactNode
  isImageSelected?: (imageUrl: string, index: number) => boolean
}

interface ImageDimensions {
  aspectRatio: number
}

export function ImageGrid({ images, className = '', onImageClick, showReplicateButton = false, showDownloadButton = false, onDownload, renderImageOverlay, isImageSelected }: ImageGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions[]>([])
  const [columnRatios, setColumnRatios] = useState<number[]>([])

  useEffect(() => {
    // Load all images and get their aspect ratios
    const loadImageDimensions = async () => {
      const dimensions: ImageDimensions[] = []
      
      for (const src of images) {
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const aspectRatio = img.width / img.height
            dimensions.push({ aspectRatio })
            resolve(null)
          }
          img.onerror = reject
          img.src = src
        })
      }
      
      setImageDimensions(dimensions)
    }

    if (images.length > 0) {
      loadImageDimensions()
    }
  }, [images])

  useEffect(() => {
    if (imageDimensions.length !== 4 || !containerRef.current) return

    const calculateLayout = () => {
      // All images will have the same height H
      // For each image i: width_i = H * aspectRatio_i
      // Total width = H * (sum of all aspect ratios)
      // So: H = totalWidth / (sum of all aspect ratios)
      // Column ratios are proportional to aspect ratios
      
      const totalAspectRatio = imageDimensions.reduce((sum, dim) => sum + dim.aspectRatio, 0)
      const ratios = imageDimensions.map(dim => dim.aspectRatio / totalAspectRatio)
      
      setColumnRatios(ratios)
    }

    calculateLayout()
    
    // Recalculate on window resize
    const handleResize = () => {
      calculateLayout()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [imageDimensions])

  if (images.length !== 4) {
    // Fallback: equal columns
    return (
      <div className={`grid grid-cols-4 gap-0 ${className}`}>
        {images.map((src, index) => {
          const isSelected = isImageSelected?.(src, index) ?? false
          return (
          <div 
            key={index} 
            className={`group relative border-r border-b border-white/10 last:border-r-0 overflow-hidden bg-gray-800 cursor-pointer transition-all ${
              isSelected ? 'ring-1 ring-white/60' : ''
            }`}
            onClick={(e) => {
              const target = e.target as HTMLElement
              if (target.tagName !== 'BUTTON' && !target.closest('button')) {
                onImageClick?.(src, index)
              }
            }}
          >
            <img
              src={src}
              alt={`Image ${index + 1}`}
              className="w-full h-auto object-cover"
            />
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 pointer-events-none ${
              isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
            }`} />
            {showDownloadButton && onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDownload(src, index)
                }}
                className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto"
                aria-label="Download image"
                type="button"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}
            {renderImageOverlay && renderImageOverlay(src, index)}
          </div>
          )
        })}
      </div>
    )
  }

  // Calculate common height: H = containerWidth / sum(aspectRatios)
  const containerWidth = containerRef.current?.clientWidth || 0
  const totalAspectRatio = imageDimensions.reduce((sum, dim) => sum + dim.aspectRatio, 0)
  const commonHeight = containerWidth > 0 && totalAspectRatio > 0 
    ? containerWidth / totalAspectRatio 
    : undefined

  return (
    <div 
      ref={containerRef}
      className={`grid gap-0 ${className}`}
      style={{
        gridTemplateColumns: columnRatios.length === 4 
          ? columnRatios.map(ratio => `${ratio}fr`).join(' ')
          : 'repeat(4, 1fr)',
      }}
    >
      {images.map((src, index) => {
        const isSelected = isImageSelected?.(src, index) ?? false
        return (
          <div 
            key={index} 
            className={`group relative border-r border-b border-white/10 last:border-r-0 overflow-hidden bg-gray-800 cursor-pointer transition-all ${
              isSelected ? 'ring-1 ring-white/60' : ''
            }`}
            style={{
              height: commonHeight ? `${commonHeight}px` : 'auto',
            }}
            onClick={(e) => {
              // Only trigger if not clicking on a button
              const target = e.target as HTMLElement
              if (target.tagName !== 'BUTTON' && !target.closest('button')) {
                onImageClick?.(src, index)
              }
            }}
          >
            <img
              src={src}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 pointer-events-none ${
              isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
            }`} />
            {showReplicateButton && onImageClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onImageClick(src, index)
                }}
                className="absolute bottom-2 left-2 px-3 py-1.5 rounded-lg bg-black/80 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/90"
              >
                Replace
              </button>
            )}
            {showDownloadButton && onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDownload(src, index)
                }}
                className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto"
                aria-label="Download image"
                type="button"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}
            {renderImageOverlay && renderImageOverlay(src, index)}
          </div>
        )
      })}
    </div>
  )
}

