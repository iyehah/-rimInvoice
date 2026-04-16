'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, LayoutDashboard, PlusCircle, User } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const pathname = usePathname()
  const { t, direction } = useLanguage()
  const { user, signOut } = useAuth()
  const side = direction === 'rtl' ? 'right' : 'left'

  const mainNav = [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/dashboard/invoices', labelKey: 'nav.invoices', icon: FileText },
    { href: '/dashboard/invoices/new', labelKey: 'nav.newInvoice', icon: PlusCircle },
    { href: '/dashboard/profile', labelKey: 'nav.profile', icon: User },
  ]

  const isNavActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/dashboard/invoices/new') return pathname.startsWith('/dashboard/invoices/new')
    if (href === '/dashboard/invoices') {
      if (pathname.startsWith('/dashboard/invoices/new')) return false
      return pathname === '/dashboard/invoices' || pathname.startsWith('/dashboard/invoices/')
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Sidebar side={side} variant="floating" collapsible="icon">
      <SidebarHeader className="space-y-3 border-b border-sidebar-border pb-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md font-semibold outline-none ring-sidebar-ring focus-visible:ring-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-primary-foreground">
            <Image width={30} height={30} src="/logo.svg" alt="Logo" draggable={false} />
          </div>
          <span className="truncate text-bold group-data-[collapsible=icon]:hidden">{t('common.appName')}</span>
        </Link>
        
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('layout.mainNavigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavActive(item.href)}
                    tooltip={t(item.labelKey)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border py-2">
        {user ? (
          <DropdownMenu dir={direction}>
            <DropdownMenuTrigger asChild className='border border-border/60 bg-linear-to-br from-primary/8 via-background to-background'>
              <Button
                variant="ghost"
                className={cn(
                  'h-12 w-full justify-start gap-2 px-2',
                  'group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center',
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user.photoURL || undefined} alt="" />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col items-start truncate text-start group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-medium">
                    {user.displayName || user.email || 'User'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground/70">{user.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={side === 'right' ? 'left' : 'right'}
              align="end"
              className="w-56"
            >
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
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
