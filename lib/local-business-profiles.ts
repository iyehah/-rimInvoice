import type { BusinessProfile } from '@/types/user'

export type BusinessProfileStored = BusinessProfile & { id: string }

export interface BusinessProfilesState {
  profiles: BusinessProfileStored[]
  defaultProfileId: string | null
}

function storageKey(userId: string) {
  return `riminvoice-businesses-${userId}`
}

const emptyState = (): BusinessProfilesState => ({
  profiles: [],
  defaultProfileId: null,
})

export function loadBusinessProfilesState(userId: string): BusinessProfilesState {
  if (typeof window === 'undefined') return emptyState()
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return emptyState()
    const data = JSON.parse(raw) as BusinessProfilesState
    if (!data || !Array.isArray(data.profiles)) return emptyState()
    return {
      profiles: data.profiles,
      defaultProfileId: data.defaultProfileId ?? (data.profiles[0]?.id ?? null),
    }
  } catch {
    return emptyState()
  }
}

export function saveBusinessProfilesState(userId: string, state: BusinessProfilesState): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(state))
}

export function getDefaultProfile(userId: string): BusinessProfileStored | null {
  const { profiles, defaultProfileId } = loadBusinessProfilesState(userId)
  if (!profiles.length) return null
  const def = profiles.find((p) => p.id === defaultProfileId)
  return def ?? profiles[0] ?? null
}

export function newProfileId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `bp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** One-time migration from legacy single-profile key */
export function migrateLegacyProfileIfNeeded(userId: string): void {
  const LEGACY = 'rim-invoice-profile'
  try {
    const raw = localStorage.getItem(LEGACY)
    if (!raw) return
    const state = loadBusinessProfilesState(userId)
    if (state.profiles.length > 0) {
      localStorage.removeItem(LEGACY)
      return
    }
    const parsed = JSON.parse(raw) as BusinessProfile
    if (parsed && typeof parsed === 'object' && parsed.storeName) {
      const id = newProfileId()
      saveBusinessProfilesState(userId, {
        profiles: [{ ...parsed, id }],
        defaultProfileId: id,
      })
    }
    localStorage.removeItem(LEGACY)
  } catch {
    localStorage.removeItem(LEGACY)
  }
}
