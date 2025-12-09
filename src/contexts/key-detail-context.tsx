'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface KeyDetailContextType {
  isViewingKeyDetails: boolean
  setIsViewingKeyDetails: (value: boolean) => void
}

const KeyDetailContext = createContext<KeyDetailContextType | undefined>(undefined)

export function KeyDetailProvider({ children }: { children: ReactNode }) {
  const [isViewingKeyDetails, setIsViewingKeyDetails] = useState(false)

  return (
    <KeyDetailContext.Provider value={{ isViewingKeyDetails, setIsViewingKeyDetails }}>
      {children}
    </KeyDetailContext.Provider>
  )
}

export function useKeyDetail() {
  const context = useContext(KeyDetailContext)
  if (context === undefined) {
    throw new Error('useKeyDetail must be used within a KeyDetailProvider')
  }
  return context
}

