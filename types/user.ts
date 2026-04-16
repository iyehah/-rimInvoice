import type { ActiveLanguage } from '@/lib/i18n-config'

export interface BusinessProfile {
  storeName: string
  logo?: string // base64 string
  phone?: string
  address?: string
  email?: string
  taxId?: string
  website?: string
}

export interface UserPreferences {
  language: ActiveLanguage
  currency: string
  theme: 'light' | 'dark' | 'system'
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phoneNumber: string | null
  role: 'user'
  isPremium: boolean
  isEnabled: boolean
  createdAt: string
  lastLoginAt: string
  invoiceCount: number
  profile?: BusinessProfile
  preferences?: UserPreferences
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}
