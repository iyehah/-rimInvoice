'use client'

import { useRouter } from 'next/navigation'
import { Chrome, Facebook, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/hooks/use-language'

export function LoginForm() {
  const router = useRouter()
  const { signInWithGoogle, loading, error } = useAuth()
  const { t } = useLanguage()

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
    router.push('/dashboard')
  }

  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden border-border/80 shadow-lg">
      <CardHeader className="space-y-1 border-b border-border/60 bg-muted/30 pb-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">{t('common.appName')}</CardTitle>
        <CardDescription className="text-base">{t('auth.continueWithGoogle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full gap-3 text-base shadow-sm"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Chrome className="h-5 w-5" />
              {t('auth.continueWithGoogle')}
            </>
          )}
        </Button>

        <Button type="button" variant="outline" size="lg" className="h-12 w-full gap-3" disabled>
          <Facebook className="h-5 w-5 opacity-70" />
          {t('auth.facebookSoon')}
          <Badge variant="secondary" className="ms-auto font-normal">
            {t('layout.comingSoon')}
          </Badge>
        </Button>

        {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  )
}
