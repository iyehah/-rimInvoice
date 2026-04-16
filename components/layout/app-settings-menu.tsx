'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Settings2, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/hooks/use-language'
import { ACTIVE_LANGUAGE_CODES, COMING_SOON_DIALECTS, isActiveLanguage } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'

const THEME_OPTIONS = [
  { value: 'light' as const, icon: Sun, labelKey: 'theme.light' },
  { value: 'dark' as const, icon: Moon, labelKey: 'theme.dark' },
  { value: 'system' as const, icon: Monitor, labelKey: 'theme.system' },
]

export function AppSettingsMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage, t, direction } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            'shrink-0 border-border/70 bg-background/90 shadow-sm backdrop-blur-sm',
            'hover:bg-accent/80',
            className,
          )}
          aria-label={t('settings.menuTitle')}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,20rem)] p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold leading-tight">{t('settings.menuTitle')}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{t('settings.description')}</p>
        </div>
        <div className="max-h-[min(70vh,26rem)] overflow-y-auto overscroll-contain">
          <div className="space-y-4 p-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.theme')}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => {
                  const active = mounted && theme === value
                  return (
                    <Button
                      key={value}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-auto flex-col gap-1 py-2.5 font-normal',
                        !active && 'border-dashed bg-muted/30',
                      )}
                      onClick={() => setTheme(value)}
                    >
                      <Icon className="h-4 w-4 opacity-90" />
                      <span className="text-[10px] leading-tight">{t(labelKey)}</span>
                    </Button>
                  )
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{t('settings.themeDescription')}</p>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.language')}
              </p>
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(v) => {
                  if (isActiveLanguage(v)) setLanguage(v)
                }}
                className="grid gap-0.5"
              >
                {ACTIVE_LANGUAGE_CODES.map((code) => (
                  <DropdownMenuRadioItem
                    key={code}
                    value={code}
                    className="cursor-pointer justify-between gap-2 py-2 text-sm"
                  >
                    <span>{t(`languages.${code}` as const)}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{t('settings.languageDescription')}</p>
            </div>

            <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('dialects.groupLabel')}
              </p>
              <ul className="mt-2 space-y-1.5">
                {COMING_SOON_DIALECTS.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-2 rounded-md px-1 py-0.5 text-sm text-muted-foreground"
                  >
                    <span>{t(d.labelKey)}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal tabular-nums">
                      {t('layout.comingSoon')}
                    </Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{t('dialects.soonHint')}</p>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
