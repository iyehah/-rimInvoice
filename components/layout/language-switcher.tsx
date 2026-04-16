'use client'

import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/hooks/use-language'
import { ACTIVE_LANGUAGE_CODES } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'

const FLAGS: Record<(typeof ACTIVE_LANGUAGE_CODES)[number], string> = {
  ar: '🇲🇷',
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  pt: '🇵🇹',
  de: '🇩🇪',
}

export function LanguageSwitcher() {
  const { language, setLanguage, direction, t } = useLanguage()

  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">{t(`languages.${language}` as const)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'}>
        {ACTIVE_LANGUAGE_CODES.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code)}
            className={cn(
              'flex items-center gap-2',
              language === code && 'bg-accent',
            )}
          >
            <span>{FLAGS[code]}</span>
            <span>{t(`languages.${code}` as const)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
