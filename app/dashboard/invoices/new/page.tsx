'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceForm } from '@/components/invoice/invoice-form'
import { useInvoiceActions } from '@/hooks/use-invoice'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/hooks/use-language'
import { toast } from '@/hooks/use-toast'
import { useBusinessProfiles } from '@/hooks/use-business-profiles'
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/invoice-utils'
import type { InvoiceFormData, Invoice, InvoiceItem } from '@/types/invoice'

const InvoicePdf = dynamic(
  () => import('@/components/invoice/invoice-pdf').then((mod) => ({ default: mod.InvoicePdf })),
  { ssr: false },
)

export default function NewInvoicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createInvoice, loading } = useInvoiceActions()
  const { t, direction } = useLanguage()
  const { profiles, defaultProfileId } = useBusinessProfiles()

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Partial<Invoice> | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (!profiles.length) {
      setSelectedProfileId(null)
      return
    }
    setSelectedProfileId((prev) => {
      if (prev && profiles.some((p) => p.id === prev)) return prev
      if (defaultProfileId && profiles.some((p) => p.id === defaultProfileId)) return defaultProfileId
      return profiles[0].id
    })
  }, [profiles, defaultProfileId])

  const selectedBusiness = profiles.find((p) => p.id === selectedProfileId) ?? null

  const handleSubmit = async (data: InvoiceFormData) => {
    if (!selectedBusiness) return
    const invoiceId = await createInvoice(data, selectedBusiness)
    if (invoiceId) {
      toast({ title: t('toast.invoiceCreated') })
      router.push(`/dashboard/invoices/${invoiceId}`)
    } else {
      toast({ variant: 'destructive', title: t('toast.invoiceCreateFailed') })
    }
  }

  const handlePreview = (data: InvoiceFormData) => {
    if (!user || !selectedBusiness) return

    const items: InvoiceItem[] = data.items.map((item, index) => ({
      id: `item-${index}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }))

    const totals = calculateInvoiceTotals(items, data.taxRate, data.discount)

    const invoice: Partial<Invoice> = {
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate,
      status: 'draft',
      businessName: selectedBusiness.storeName,
      businessLogo: selectedBusiness.logo,
      businessPhone: selectedBusiness.phone,
      businessAddress: selectedBusiness.address,
      businessTaxId: selectedBusiness.taxId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      items,
      ...totals,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
      notes: data.notes,
      currency: 'MRU',
    }

    setPreviewInvoice(invoice)
    setShowPreview(true)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.07] via-background to-background p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -bottom-8 -end-8 h-32 w-32 rounded-full bg-primary/[0.06] blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Button asChild variant="ghost" size="icon" className="mt-0.5 shrink-0 rounded-xl border border-border/60 bg-background/80 shadow-sm">
              <Link href="/dashboard/invoices">
                <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
            <div>
              <div className="mb-1 flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">{t('nav.newInvoice')}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('invoice.createInvoice')}</h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">{t('invoice.fillDetails')}</p>
            </div>
          </div>
        </div>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        onPreview={handlePreview}
        loading={loading}
        businessProfiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfileId={setSelectedProfileId}
        defaultBusinessProfileId={defaultProfileId}
      />

      {previewInvoice ? (
        <InvoicePdf invoice={previewInvoice} open={showPreview} onOpenChange={setShowPreview} />
      ) : null}
    </div>
  )
}
