/** UI languages with full locale files */
export const ACTIVE_LANGUAGE_CODES = ['ar', 'fr', 'en', 'es', 'pt', 'de'] as const
export type ActiveLanguage = (typeof ACTIVE_LANGUAGE_CODES)[number]

export function isActiveLanguage(code: string): code is ActiveLanguage {
  return (ACTIVE_LANGUAGE_CODES as readonly string[]).includes(code)
}

/** Mauritanian / regional dialects — UI copy only; full translations planned */
export const COMING_SOON_DIALECTS = [
  { id: 'hassaniya', labelKey: 'dialects.hassaniya' as const },
  { id: 'pulaar', labelKey: 'dialects.pulaar' as const },
  { id: 'soninke', labelKey: 'dialects.soninke' as const },
  { id: 'wolof', labelKey: 'dialects.wolof' as const },
] as const
