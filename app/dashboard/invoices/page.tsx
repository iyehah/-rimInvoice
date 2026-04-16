'use client'

import Link from 'next/link'
import { Plus, FileText, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserInvoices } from '@/hooks/use-invoice'
import { useLanguage } from '@/hooks/use-language'
import { formatCurrency, formatDate, getInvoiceStatusColor } from '@/lib/invoice-utils'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export default function InvoicesPage() {
  const { invoices, isLoading } = useUserInvoices()
  const { t, language } = useLanguage()
  const [search, setSearch] = useState('')

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.clientName.toLowerCase().includes(search.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.invoices')}</h1>
          <p className="text-muted-foreground">
            {invoices.length} {t('invoice.total').toLowerCase()}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="h-4 w-4 me-2" />
            {t('nav.newInvoice')}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {search ? 'No invoices found' : 'No invoices yet'}
            </p>
            {!search && (
              <Button asChild>
                <Link href="/dashboard/invoices/new">
                  <Plus className="h-4 w-4 me-2" />
                  {t('invoice.createInvoice')}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/dashboard/invoices/${invoice.id}`}
              className="block"
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{invoice.clientName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span dir="ltr">{invoice.invoiceNumber}</span>
                          <span>•</span>
                          <span>{formatDate(invoice.createdAt, language)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold text-lg" dir="ltr">
                        {formatCurrency(invoice.total)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', getInvoiceStatusColor(invoice.status))}
                      >
                        {t(`invoice.status.${invoice.status}`)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
