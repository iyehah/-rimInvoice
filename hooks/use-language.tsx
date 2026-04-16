'use client'

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'
import arLocale from '@/locales/ar.json'
import frLocale from '@/locales/fr.json'
import enLocale from '@/locales/en.json'
import esLocale from '@/locales/es.json'
import ptLocale from '@/locales/pt.json'
import deLocale from '@/locales/de.json'
import { isActiveLanguage, type ActiveLanguage } from '@/lib/i18n-config'

type Direction = 'rtl' | 'ltr'

interface LanguageContextType {
  language: ActiveLanguage
  direction: Direction
  t: (key: string, params?: Record<string, string | number>) => string
  setLanguage: (lang: ActiveLanguage) => void
}

const locales: Record<ActiveLanguage, typeof enLocale> = {
  ar: arLocale,
  fr: frLocale,
  en: enLocale,
  es: esLocale,
  pt: ptLocale,
  de: deLocale,
}

const directions: Record<ActiveLanguage, Direction> = {
  ar: 'rtl',
  fr: 'ltr',
  en: 'ltr',
  es: 'ltr',
  pt: 'ltr',
  de: 'ltr',
}

const STORAGE_KEY = 'rim-invoice-language'

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<ActiveLanguage>('ar')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isActiveLanguage(stored)) {
      setLanguageState(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dir = directions[language]
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((lang: ActiveLanguage) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = locales[language]

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          value = locales.en
          for (const fallbackKey of keys) {
            if (value && typeof value === 'object' && fallbackKey in value) {
              value = value[fallbackKey]
            } else {
              return key
            }
          }
          break
        }
      }

      if (typeof value === 'string' && params) {
        return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
          return params[paramKey]?.toString() || `{${paramKey}}`
        })
      }

      return typeof value === 'string' ? value : key
    },
    [language],
  )

  const direction = directions[language]

  return (
    <LanguageContext.Provider value={{ language, direction, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export type { ActiveLanguage }
