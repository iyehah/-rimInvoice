'use client'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AppSettingsMenu } from '@/components/layout/app-settings-menu'
import { RepoDevLinks } from '@/components/layout/repo-dev-links'
import { useLanguage } from '@/hooks/use-language'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, LogOut } from 'lucide-react'

export function Header() {
  const { t, direction } = useLanguage()
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-15.5 shrink-0 items-center gap-2 border-b border-border/80 bg-background/90 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:px-4">
      <SidebarTrigger className="-ms-0.5" />
      <Separator orientation="vertical" className="me-1 h-6" />
      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-semibold text-foreground/90 md:hidden"
      >
        {/* <Image width={30} height={30} src="/logo.svg" alt="Logo" draggable={false} /> */}
        <span className='text-bold'>{t('common.appName')}</span>
      </Link>
      <div className="ms-auto flex items-center gap-1 sm:gap-2">
        <RepoDevLinks />
        <AppSettingsMenu />
        {user ? (
          <DropdownMenu dir={direction}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full md:hidden">
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={direction === 'rtl' ? 'start' : 'end'} className="w-56 md:hidden">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('nav.profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 me-2" />
                {t('auth.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" className="md:hidden">
            <Link href="/login">{t('auth.login')}</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
