'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trash2, X, Check, Search, CheckSquare2, Edit2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Key {
  id: string
  key: string
  created_at?: string
  title?: string
  description?: string
  custom_description?: string
  image_url?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keys, setKeys] = useState<Key[]>([])
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [selectedKey, setSelectedKey] = useState<Key | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedKeyIds, setSelectedKeyIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedCustomDescription, setEditedCustomDescription] = useState('')
  const [editedAnalysis, setEditedAnalysis] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('/api/keys')
        
        if (!response.ok) {
          console.error('Error fetching keys:', response.statusText)
          setLoading(false)
          return
        }

        const data = await response.json()
        setKeys(data.keys || [])
        setLoading(false)
        
        // Check if there's a key ID in the URL query params
        const keyIdFromUrl = searchParams.get('key')
        if (keyIdFromUrl && data.keys) {
          const keyToSelect = data.keys.find((k: Key) => k.id === keyIdFromUrl)
          if (keyToSelect) {
            setSelectedKey(keyToSelect)
            // Remove query param from URL
            router.replace('/dashboard', { scroll: false })
          }
        }
        
        if ((data.keys || []).length === 0 && retryCount === 0) {
          setTimeout(() => {
            setRetryCount(1)
          }, 2000)
        }
      } catch (err) {
        console.error('Error fetching keys:', err)
        setLoading(false)
      }
    }
    
    fetchKeys()
  }, [retryCount, searchParams, router])

  const handleDelete = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this key?')) return

    try {
      const response = await fetch(`/api/keys/${keyId}`, { method: 'DELETE' })
      
      if (response.ok) {
        // Refresh the keys list
        const refreshResponse = await fetch('/api/keys')
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setKeys(data.keys || [])
        }
        // Close detail view if deleting the selected key
        if (selectedKey?.id === keyId) {
          setSelectedKey(null)
        }
      }
    } catch (error) {
      console.error('Error deleting key:', error)
    }
  }

  const handleEdit = () => {
    if (selectedKey) {
      setEditedTitle(selectedKey.title || '')
      setEditedCustomDescription(selectedKey.custom_description || '')
      const analysis = parseKeyAnalysis(selectedKey.description)
      setEditedAnalysis(analysis ? { ...analysis } : null)
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!selectedKey) return

    setIsSaving(true)
    try {
      // Reconstruct description from edited analysis
      const description = editedAnalysis ? JSON.stringify(editedAnalysis) : null

      const response = await fetch(`/api/keys/${selectedKey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          custom_description: editedCustomDescription || null,
          description: description,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update local state
        const updatedKey = { 
          ...selectedKey, 
          title: editedTitle, 
          custom_description: editedCustomDescription || undefined,
          description: description || undefined
        }
        setSelectedKey(updatedKey)
        // Update keys list
        setKeys(keys.map(k => k.id === selectedKey.id ? updatedKey : k))
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving key:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedTitle('')
    setEditedCustomDescription('')
    setEditedAnalysis(null)
  }

  const updateAnalysisField = (path: string[], value: any) => {
    if (!editedAnalysis) return
    const newAnalysis = { ...editedAnalysis }
    let current: any = newAnalysis
    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] = { ...current[path[i]] }
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
    setEditedAnalysis(newAnalysis)
  }

  const parseKeyAnalysis = (description: string | undefined) => {
    if (!description) return null
    try {
      return JSON.parse(description)
    } catch {
      return null
    }
  }

  const formatKeyAnalysis = (analysis: any) => {
    if (!analysis) return null

    const sections = []

    if (analysis.description_summary) {
      sections.push({
        title: 'Summary',
        content: analysis.description_summary,
        type: 'text'
      })
    }

    if (analysis.key_type && analysis.key_type !== 'unknown') {
      sections.push({
        title: 'Key Type',
        content: analysis.key_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        type: 'badge'
      })
    }

    if (analysis.color) {
      const colorInfo = []
      if (analysis.color.primary) colorInfo.push(analysis.color.primary)
      if (analysis.color.finish) colorInfo.push(analysis.color.finish)
      if (colorInfo.length > 0) {
        sections.push({
          title: 'Color',
          content: colorInfo.join(' • '),
          type: 'text'
        })
      }
    }

    if (analysis.material?.type) {
      sections.push({
        title: 'Material',
        content: analysis.material.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        type: 'badge'
      })
    }

    if (analysis.shape) {
      const shapeInfo = []
      if (analysis.shape.head_shape && analysis.shape.head_shape !== 'unknown') {
        shapeInfo.push(`Head: ${analysis.shape.head_shape}`)
      }
      if (analysis.shape.blade_shape && analysis.shape.blade_shape !== 'unknown') {
        shapeInfo.push(`Blade: ${analysis.shape.blade_shape}`)
      }
      if (shapeInfo.length > 0) {
        sections.push({
          title: 'Shape',
          content: shapeInfo.join(' • '),
          type: 'text'
        })
      }
    }

    if (analysis.teeth_pattern?.zacken_anzahl !== undefined && analysis.teeth_pattern.zacken_anzahl > 0) {
      sections.push({
        title: 'Teeth',
        content: `${analysis.teeth_pattern.zacken_anzahl} teeth`,
        type: 'badge'
      })
    }

    if (analysis.special_features) {
      const features = []
      if (analysis.special_features.transponder_chip) features.push('Transponder Chip')
      if (analysis.special_features.remote_buttons) features.push('Remote Buttons')
      if (analysis.special_features.switchblade) features.push('Switchblade')
      if (analysis.special_features.laser_cut) features.push('Laser Cut')
      if (features.length > 0) {
        sections.push({
          title: 'Features',
          content: features.join(' • '),
          type: 'text'
        })
      }
    }

    if (analysis.condition) {
      const conditionInfo = []
      if (analysis.condition.wear_level) {
        conditionInfo.push(`Wear: ${analysis.condition.wear_level.replace(/_/g, ' ')}`)
      }
      if (analysis.condition.damage && analysis.condition.damage.length > 0) {
        conditionInfo.push(`Damage: ${analysis.condition.damage.join(', ')}`)
      }
      if (conditionInfo.length > 0) {
        sections.push({
          title: 'Condition',
          content: conditionInfo.join(' • '),
          type: 'text'
        })
      }
    }

    return sections
  }

  const toggleKeySelection = (keyId: string) => {
    const newSelection = new Set(selectedKeyIds)
    if (newSelection.has(keyId)) {
      newSelection.delete(keyId)
    } else {
      newSelection.add(keyId)
    }
    setSelectedKeyIds(newSelection)
  }

  const handleBulkDelete = async () => {
    if (selectedKeyIds.size === 0) return

    try {
      const deletePromises = Array.from(selectedKeyIds).map(id =>
        fetch(`/api/keys/${id}`, { method: 'DELETE' })
      )

      await Promise.all(deletePromises)

      // Refresh the keys list
      const response = await fetch('/api/keys')
      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys || [])
      }

      setSelectedKeyIds(new Set())
      setSelectionMode(false)
    } catch (error) {
      console.error('Error deleting keys:', error)
    }
  }

  const handleKeyClick = (key: Key) => {
    if (selectionMode) {
      toggleKeySelection(key.id)
    } else {
      setSelectedKey(key)
    }
  }

  // Filter keys based on search query
  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) {
      return keys
    }

    const query = searchQuery.toLowerCase().trim()
    return keys.filter((key) => {
      const titleMatch = key.title?.toLowerCase().includes(query)
      const descriptionMatch = key.description?.toLowerCase().includes(query)
      const keyMatch = key.key?.toLowerCase().includes(query)
      return titleMatch || descriptionMatch || keyMatch
    })
  }, [keys, searchQuery])

  if (selectedKey) {
    const analysis = isEditing ? editedAnalysis : parseKeyAnalysis(selectedKey.description)
    const formattedAnalysis = formatKeyAnalysis(analysis)

    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            handleCancelEdit()
            setSelectedKey(null)
          }}
          className="p-2 text-gray-400 hover:text-white transition-colors px-4"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="px-4 space-y-4">
          <div className="bg-[#191919] rounded-xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-6">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-3xl font-bold text-white font-marlinsoft bg-black/40 border-white/20 flex-1 max-w-md"
                  placeholder="Key title"
                />
              ) : (
                <h2 className="text-3xl font-bold text-white font-marlinsoft">
                  {selectedKey.title || 'Key Details'}
                </h2>
              )}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      variant="outline"
                      size="icon"
                      className="border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-600"
                    >
                      <Save className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="icon"
                      className="border-gray-600/50 text-gray-400 hover:bg-gray-600/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="icon"
                      className="border-blue-600/50 text-blue-400 hover:bg-blue-600/20 hover:border-blue-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(selectedKey.id)}
                      variant="outline"
                      size="icon"
                      className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {selectedKey.image_url && (
              <div className="mb-6 rounded-lg overflow-hidden border border-white/10 bg-black/20 aspect-square">
                <img
                  src={selectedKey.image_url}
                  alt={selectedKey.title || 'Key image'}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Custom Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Description
              </h3>
              {isEditing ? (
                <textarea
                  value={editedCustomDescription}
                  onChange={(e) => setEditedCustomDescription(e.target.value)}
                  placeholder="Add a custom description to help you remember what this key is for..."
                  className="w-full min-h-[100px] p-3 bg-black/40 border border-white/20 text-white rounded-lg resize-y placeholder:text-gray-500 focus:outline-none focus:border-white/40"
                  rows={3}
                />
              ) : (
                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                  {selectedKey.custom_description ? (
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedKey.custom_description}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No description added yet. Click edit to add one.
                    </p>
                  )}
                </div>
              )}
            </div>

            {formattedAnalysis && formattedAnalysis.length > 0 ? (
              <div className="space-y-4 mb-6">
                {formattedAnalysis.map((section, index) => {
                  if (section.title === 'Color' && isEditing && analysis?.color) {
                    return (
                      <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/5">
                        <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                          {section.title}
                        </h3>
                        <div className="space-y-2">
                          <Input
                            value={analysis.color.primary || ''}
                            onChange={(e) => updateAnalysisField(['color', 'primary'], e.target.value)}
                            placeholder="Primary color"
                            className="bg-black/40 border-white/20 text-white"
                          />
                          {analysis.color.secondary !== undefined && (
                            <Input
                              value={analysis.color.secondary || ''}
                              onChange={(e) => updateAnalysisField(['color', 'secondary'], e.target.value)}
                              placeholder="Secondary color (optional)"
                              className="bg-black/40 border-white/20 text-white"
                            />
                          )}
                          <Input
                            value={analysis.color.finish || ''}
                            onChange={(e) => updateAnalysisField(['color', 'finish'], e.target.value)}
                            placeholder="Finish (matte, shiny, etc.)"
                            className="bg-black/40 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/5">
                      <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                        {section.title}
                      </h3>
                      {section.type === 'badge' ? (
                        <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                          {section.content}
                        </span>
                      ) : (
                        <p className="text-white/90 text-sm leading-relaxed">
                          {section.content}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : selectedKey.description && !analysis ? (
              <div className="bg-black/20 rounded-lg p-4 mb-6 border border-white/5">
                <p className="text-white/90 text-sm">{selectedKey.description}</p>
              </div>
            ) : null}

            {selectedKey.created_at && (
              <p className="text-xs text-gray-500 mt-4">
                Created: {new Date(selectedKey.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="px-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-marlinsoft">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your API keys
          </p>
        </div>
        {!selectionMode ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSelectionMode(true)}
              size="icon"
              className="bg-white text-black hover:bg-gray-100"
              title="Select"
            >
              <CheckSquare2 className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {selectedKeyIds.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white hover:bg-red-700 p-2"
                title={`Delete ${selectedKeyIds.size} key${selectedKeyIds.size > 1 ? 's' : ''}`}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={() => {
                setSelectionMode(false)
                setSelectedKeyIds(new Set())
              }}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Search Bar */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Schlüssel suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 h-14 text-base bg-[#191919] border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:ring-0 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-400 mt-2 px-1">
            {filteredKeys.length} {filteredKeys.length === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 px-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse overflow-hidden rounded-lg">
              <div className="w-full h-full bg-[#000000] rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="text-gray-400 px-4 text-center py-12">
          {searchQuery ? (
            <div>
              <p className="text-lg mb-2">Keine Ergebnisse gefunden</p>
              <p className="text-sm">Versuche andere Suchbegriffe</p>
            </div>
          ) : (
            <p>No keys found.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4">
          {filteredKeys.map((key) => {
            const isSelected = selectedKeyIds.has(key.id)
            return (
              <div
                key={key.id}
                onClick={() => handleKeyClick(key)}
                className={`
                  relative aspect-square cursor-pointer transition-all overflow-hidden rounded-lg group
                  ${isSelected 
                    ? 'ring-2 ring-white/60' 
                    : ''
                  }
                `}
              >
                {key.image_url ? (
                  <>
                    <img
                      src={key.image_url}
                      alt={key.title || 'Key image'}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay with title, date, and delete button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 p-4 flex flex-col justify-between">
                      {/* Top section with delete button */}
                      <div className="flex justify-end">
                        {selectionMode ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleKeySelection(key.id)
                            }}
                            className={`
                              w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition-all
                              ${isSelected 
                                ? 'bg-white border-white' 
                                : 'bg-black/40 border-white/60 hover:border-white'
                              }
                            `}
                          >
                            {isSelected && <Check className="w-4 h-4 text-black" strokeWidth={2.5} />}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(key.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/60 hover:bg-black/80 rounded-full"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                      {/* Bottom section with title and date */}
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white font-marlinsoft line-clamp-2">
                          {key.title || 'Untitled Key'}
                        </h3>
                        {key.created_at && (
                          <p className="text-xs text-white/80">
                            {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-[#191919] flex flex-col items-center justify-between p-4">
                    {/* Top section with delete button */}
                    <div className="flex justify-end w-full">
                      {selectionMode ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleKeySelection(key.id)
                          }}
                          className={`
                            w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition-all
                            ${isSelected 
                              ? 'bg-white border-white' 
                              : 'bg-black/40 border-white/60 hover:border-white'
                            }
                          `}
                        >
                          {isSelected && <Check className="w-4 h-4 text-black" strokeWidth={2.5} />}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(key.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/60 hover:bg-black/80 rounded-full"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                    {/* Bottom section with title and date */}
                    <div className="text-center space-y-2 w-full">
                      <h3 className="text-lg font-bold text-white font-marlinsoft line-clamp-2">
                        {key.title || 'Untitled Key'}
                      </h3>
                      {key.created_at && (
                        <p className="text-xs text-gray-400">
                          {new Date(key.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
