'use client'

import React from 'react'

interface ProgressIndicatorProps {
  current: number
  total: number
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  // Calculate progress percentage (0 to 100)
  // Step 1 = 1/total * 100%, Step 2 = 2/total * 100%, etc.
  const progressPercentage = (current / total) * 100

  return (
    <div className="absolute top-0 left-0 right-0 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

