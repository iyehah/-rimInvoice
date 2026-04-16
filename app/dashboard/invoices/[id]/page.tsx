'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Download, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { InvoicePreview } from '@/components/invoice/invoice-preview'
import { useInvoice, useInvoiceActions } from '@/hooks/use-invoice'
import { useLanguage } from '@/hooks/use-language'
import { toast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'

// Dynamically import InvoicePdf to avoid SSR issues with jsPDF
const InvoicePdf = dynamic(
  () => import('@/components/invoice/invoice-pdf').then(mod => ({ default: mod.InvoicePdf })),
  { ssr: false }
)

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, direction } = useLanguage()
  const invoiceId = params.id as string
  
  const { invoice, isLoading } = useInvoice(invoiceId)
  const { deleteInvoice, loading: actionLoading } = useInvoiceActions()
  
  const [showPreview, setShowPreview] = useState(false)

  const handleDelete = async () => {
    const success = await deleteInvoice(invoiceId)
    if (success) {
      toast({ title: t('toast.invoiceDeleted') })
      router.push('/dashboard/invoices')
    } else {
      toast({ variant: 'destructive', title: t('toast.invoiceDeleteFailed') })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{t('errors.notFound')}</p>
        <Button asChild>
          <Link href="/dashboard/invoices">{t('common.back')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/invoices">
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold" dir="ltr">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">{invoice.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Download className="h-4 w-4 me-2" />
            {t('invoice.downloadPdf')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('invoice.deleteConfirm') || 'Are you sure you want to delete this invoice? This action cannot be undone.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={actionLoading}>
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card>
        <CardContent className="p-6">
          <InvoicePreview invoice={invoice} />
        </CardContent>
      </Card>

      {/* PDF Dialog */}
      <InvoicePdf
        invoice={invoice}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </div>
  )
}
