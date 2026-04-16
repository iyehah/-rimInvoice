// Local storage helpers with type safety

const KEYS = {
  PROFILE: 'rim-invoice-profile',
  LANGUAGE: 'rim-invoice-language',
  THEME: 'rim-invoice-theme',
  DRAFT_INVOICE: 'rim-invoice-draft',
} as const

export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage might be full or disabled
    console.warn('Failed to save to localStorage')
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore errors
  }
}

// Specific storage functions
export function saveDraftInvoice<T>(draft: T): void {
  setStorageItem(KEYS.DRAFT_INVOICE, draft)
}

export function getDraftInvoice<T>(): T | null {
  return getStorageItem<T>(KEYS.DRAFT_INVOICE)
}

export function clearDraftInvoice(): void {
  removeStorageItem(KEYS.DRAFT_INVOICE)
}

export function getTheme(): 'light' | 'dark' | 'system' {
  const stored = getStorageItem<string>(KEYS.THEME)
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    return stored as 'light' | 'dark' | 'system'
  }
  return 'system'
}

export function setTheme(theme: 'light' | 'dark' | 'system'): void {
  setStorageItem(KEYS.THEME, theme)
}
