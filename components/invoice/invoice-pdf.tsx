'use client'

import { useRef, useState } from 'react'
import { Download, Image, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvoicePreview } from './invoice-preview'
import { generatePdf, generateImage } from '@/lib/pdf-generator'
import { useLanguage } from '@/hooks/use-language'
import type { Invoice } from '@/types/invoice'

interface InvoicePdfProps {
  invoice: Partial<Invoice>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePdf({ invoice, open, onOpenChange }: InvoicePdfProps) {
  const { t } = useLanguage()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState<'pdf' | 'image' | null>(null)

  const baseName = `invoice-${invoice.invoiceNumber || 'draft'}`

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return
    setLoading('pdf')
    try {
      await generatePdf(previewRef.current, `${baseName}.pdf`)
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadImage = async () => {
    if (!previewRef.current) return
    setLoading('image')
    try {
      await generateImage(previewRef.current, `${baseName}.png`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogDescription className="sr-only">{t('invoice.previewInvoice')}</DialogDescription>
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border px-4 py-3 pe-12">
          <DialogTitle>{t('invoice.previewInvoice')}</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute end-2 top-2" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <Button variant="default" size="sm" onClick={handleDownloadPdf} disabled={!!loading}>
            {loading === 'pdf' ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Download className="h-4 w-4 me-2" />
            )}
            {t('invoice.downloadPdf')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadImage} disabled={!!loading}>
            {loading === 'image' ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Image className="h-4 w-4 me-2" />
            )}
            {t('invoice.downloadImage')}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-muted/20 p-4">
          <div className="mx-auto max-w-2xl rounded-lg border border-border bg-white shadow-sm">
            <InvoicePreview ref={previewRef} invoice={invoice} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
