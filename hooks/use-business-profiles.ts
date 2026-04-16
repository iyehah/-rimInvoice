'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { BusinessProfile } from '@/types/user'
import {
  loadBusinessProfilesState,
  saveBusinessProfilesState,
  newProfileId,
  migrateLegacyProfileIfNeeded,
  type BusinessProfileStored,
  type BusinessProfilesState,
} from '@/lib/local-business-profiles'

export function useBusinessProfiles() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const [state, setState] = useState<BusinessProfilesState>({ profiles: [], defaultProfileId: null })

  const hydrate = useCallback(() => {
    if (!uid) {
      setState({ profiles: [], defaultProfileId: null })
      return
    }
    migrateLegacyProfileIfNeeded(uid)
    setState(loadBusinessProfilesState(uid))
  }, [uid])

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const persist = useCallback(
    (next: BusinessProfilesState) => {
      if (!uid) return
      saveBusinessProfilesState(uid, next)
      setState(next)
    },
    [uid],
  )

  const addProfile = useCallback(
    (data: BusinessProfile): BusinessProfileStored | null => {
      if (!uid) return null
      const id = newProfileId()
      const row: BusinessProfileStored = { ...data, id }
      const prev = loadBusinessProfilesState(uid)
      const profiles = [...prev.profiles, row]
      const defaultProfileId = prev.defaultProfileId ?? id
      persist({ profiles, defaultProfileId })
      return row
    },
    [uid, persist],
  )

  const updateProfile = useCallback(
    (id: string, data: BusinessProfile): boolean => {
      if (!uid) return false
      const prev = loadBusinessProfilesState(uid)
      const profiles = prev.profiles.map((p) => (p.id === id ? { ...data, id } : p))
      persist({ ...prev, profiles })
      return true
    },
    [uid, persist],
  )

  const removeProfile = useCallback(
    (id: string): boolean => {
      if (!uid) return false
      const prev = loadBusinessProfilesState(uid)
      const profiles = prev.profiles.filter((p) => p.id !== id)
      let defaultProfileId = prev.defaultProfileId
      if (defaultProfileId === id) {
        defaultProfileId = profiles[0]?.id ?? null
      }
      persist({ profiles, defaultProfileId })
      return true
    },
    [uid, persist],
  )

  const setDefaultProfile = useCallback(
    (id: string): boolean => {
      if (!uid) return false
      const prev = loadBusinessProfilesState(uid)
      if (!prev.profiles.some((p) => p.id === id)) return false
      persist({ ...prev, defaultProfileId: id })
      return true
    },
    [uid, persist],
  )

  const convertLogoToBase64 = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  const defaultProfile =
    state.profiles.find((p) => p.id === state.defaultProfileId) ?? state.profiles[0] ?? null

  return {
    profiles: state.profiles,
    defaultProfileId: state.defaultProfileId,
    defaultProfile,
    addProfile,
    updateProfile,
    removeProfile,
    setDefaultProfile,
    convertLogoToBase64,
    refresh: hydrate,
  }
}
