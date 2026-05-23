// ============================================
// Progress Save Hook with Debouncing
// Saves progress every 5 seconds or on explicit save
// ============================================

import { useCallback, useRef, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

interface SaveProgressParams {
  userId: string
  bookId: string
  charsTyped: number
  completed: boolean
}

export function useProgressSave() {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveRef = useRef<SaveProgressParams | null>(null)
  const isSavingRef = useRef(false)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const saveProgress = useCallback(async (
    userId: string,
    bookId: string,
    charsTyped: number,
    completed: boolean,
    immediate: boolean = false
  ) => {
    // Store latest save params
    lastSaveRef.current = { userId, bookId, charsTyped, completed }

    // If already saving, queue the next save
    if (isSavingRef.current && !immediate) {
      return
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    const performSave = async () => {
      if (!lastSaveRef.current) return

      isSavingRef.current = true

      try {
        const response = await apiClient.post('/progress', {
          bookId: lastSaveRef.current.bookId,
          charsTyped: lastSaveRef.current.charsTyped,
          completed: lastSaveRef.current.completed
        })

        if (!response.success) {
          throw new Error(response.error || 'Failed to save progress')
        }

        // Clear last save after successful save
        lastSaveRef.current = null
      } catch (error) {
        console.error('Error saving progress:', error)
        // Could add toast notification here
        // If save failed, keep lastSaveRef so we can retry
      } finally {
        isSavingRef.current = false

        // If there's still a queued save, schedule it
        if (lastSaveRef.current && !lastSaveRef.current.completed) {
          const queued = lastSaveRef.current
          saveTimeoutRef.current = setTimeout(
            () => performSave(),
            5000
          )
        }
      }
    }

    if (immediate) {
      // Cancel any pending saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      await performSave()
    } else {
      // Debounce: wait 5 seconds before saving
      saveTimeoutRef.current = setTimeout(performSave, 5000)
    }
  }, [])

  // Force save immediately (for completion)
  const saveImmediate = useCallback(async (
    userId: string,
    bookId: string,
    charsTyped: number,
    completed: boolean = true
  ) => {
    await saveProgress(userId, bookId, charsTyped, completed, true)
  }, [saveProgress])

  return { 
    saveProgress: (userId: string, bookId: string, charsTyped: number, completed: boolean) => 
      saveProgress(userId, bookId, charsTyped, completed, false),
    saveImmediate 
  }
}

