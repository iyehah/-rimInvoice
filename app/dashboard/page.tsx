'use client'

import Link from 'next/link'
import { ArrowRight, FileText, History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useUserInvoices } from '@/hooks/use-invoice'
import { useLanguage } from '@/hooks/use-language'
import { formatCurrency, getInvoiceStatusColor } from '@/lib/invoice-utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const { invoices, isLoading } = useUserInvoices()
  const { t } = useLanguage()

  const recentInvoices = invoices.slice(0, 8)
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-primary/8 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -inset-e-16 -top-16 h-48 w-48 rounded-full bg-primary/6 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-primary/80">
              {t('common.appName')}
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('nav.dashboard')}</h1>
            <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
              {user?.displayName || user?.email || t('common.loading')}
            </p>
            <p className="max-w-xl text-sm text-muted-foreground/90">{t('dashboard.welcomeHint')}</p>
          </div>
          <Button asChild size="lg" className="shrink-0 shadow-md">
            <Link href="/dashboard/invoices/new">
              <Plus className="h-4 w-4 me-2" />
              {t('nav.newInvoice')}
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>{t('dashboard.invoiceCount')}</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">{invoices.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-sm">{t('dashboard.recentInvoicesHint')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>{t('dashboard.revenueTotal')}</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums" dir="ltr">
              {formatCurrency(totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t('invoice.total')}</CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">{t('dashboard.recentInvoices')}</CardTitle>
            <CardDescription>{t('dashboard.recentInvoicesHint')}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full shrink-0 sm:w-auto">
            <Link href="/dashboard/invoices" className="gap-2">
              <History className="h-4 w-4" />
              {t('common.view')}
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
          ) : recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mb-6 max-w-sm text-muted-foreground">{t('invoice.noInvoices')}</p>
              <Button asChild>
                <Link href="/dashboard/invoices/new">
                  <Plus className="h-4 w-4 me-2" />
                  {t('invoice.createInvoice')}
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentInvoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40 sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{invoice.clientName}</p>
                        <p className="truncate text-sm text-muted-foreground" dir="ltr">
                          {invoice.invoiceNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-end">
                        <p className="font-semibold tabular-nums" dir="ltr">
                          {formatCurrency(invoice.total)}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn('mt-1 text-xs font-normal', getInvoiceStatusColor(invoice.status))}
                        >
                          {t(`invoice.status.${invoice.status}`)}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
