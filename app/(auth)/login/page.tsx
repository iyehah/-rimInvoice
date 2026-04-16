'use client'

import { FileText } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'
import { AppSettingsMenu } from '@/components/layout/app-settings-menu'
import { useLanguage } from '@/hooks/use-language'

export default function LoginPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 via-background to-background">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <FileText className="h-4 w-4" />
          </div>
          <span>{t('common.appName')}</span>
        </div>
        <AppSettingsMenu />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <LoginForm />
      </main>

      <footer className="border-t border-border/60 py-4 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {t('common.appName')}
        </p>
      </footer>
    </div>
  )
}
