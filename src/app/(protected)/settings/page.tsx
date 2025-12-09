'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Save, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      })
      alert('Einstellungen gespeichert!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Fehler beim Speichern der Einstellungen')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Abmeldung fehlgeschlagen. Bitte versuche es erneut.')
    }
  }

  const hasChanges = 
    firstName !== (user?.firstName || '') || 
    lastName !== (user?.lastName || '')

  return (
    <div className="space-y-8 max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-marlinsoft">
          Einstellungen
        </h1>
        <p className="text-gray-400 mt-3 text-base sm:text-lg">
          Verwalte dein Konto
        </p>
      </div>

      <div className="space-y-8">
        {/* Account Information */}
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Kontoinformationen</h2>
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-sm sm:text-base text-gray-400 sm:w-24 font-medium">Vorname</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Dein Vorname"
                className="bg-transparent text-white text-base sm:text-lg focus:outline-none flex-1 border-b-2 border-white/10 focus:border-white/30 transition-colors pb-2 pt-1 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-sm sm:text-base text-gray-400 sm:w-24 font-medium">Nachname</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dein Nachname"
                className="bg-transparent text-white text-base sm:text-lg focus:outline-none flex-1 border-b-2 border-white/10 focus:border-white/30 transition-colors pb-2 pt-1 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-sm sm:text-base text-gray-400 sm:w-24 font-medium">E-Mail</span>
              <span className="text-base sm:text-lg text-gray-300 flex-1 break-all pt-1">
                {user?.emailAddresses?.[0]?.emailAddress || '--'}
              </span>
            </div>

            <div className="pt-4 flex items-center gap-3 sm:gap-4">
              <Button 
                onClick={handleSave} 
                disabled={saving || !hasChanges} 
                size="lg"
                className={`min-h-[48px] px-6 text-base ${!hasChanges ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-100'}`}
                title={saving ? 'Speichern...' : 'Änderungen speichern'}
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Speichern...' : 'Änderungen speichern'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                size="lg"
                className="min-h-[48px] px-6 text-base border-gray-600 text-white hover:bg-gray-800"
                title="Abmelden"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
