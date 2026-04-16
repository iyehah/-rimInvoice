'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format, isValid, parseISO } from 'date-fns'
import { Plus, Building2, AlertCircle, Check, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { InvoiceItemRow } from './invoice-item-row'
import { PaymentMethodSelect } from '@/components/payment/payment-method-select'
import { useLanguage } from '@/hooks/use-language'
import { createEmptyInvoiceItem, formatCurrency, calculateInvoiceTotals } from '@/lib/invoice-utils'
import { cn } from '@/lib/utils'
import type { InvoiceFormData, InvoiceItem } from '@/types/invoice'
import type { BusinessProfileStored } from '@/lib/local-business-profiles'

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void
  onPreview?: (data: InvoiceFormData) => void
  loading?: boolean
  businessProfiles: BusinessProfileStored[]
  selectedProfileId: string | null
  onSelectProfileId: (id: string) => void
  defaultBusinessProfileId: string | null
}

type ItemInput = Omit<InvoiceItem, 'id' | 'total'>

function dueDateLabel(dueDate: string, language: string, pickText: string): string {
  if (!dueDate) return pickText
  const d = parseISO(dueDate)
  if (!isValid(d)) return pickText
  const locale =
    language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-PT' : language === 'de' ? 'de-DE' : 'en-US'
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function InvoiceForm({
  onSubmit,
  onPreview,
  loading,
  businessProfiles,
  selectedProfileId,
  onSelectProfileId,
  defaultBusinessProfileId,
}: InvoiceFormProps) {
  const { t, language } = useLanguage()
  const hasBusiness = businessProfiles.length > 0 && !!selectedProfileId
  const [dueCalendarOpen, setDueCalendarOpen] = useState(false)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [items, setItems] = useState<ItemInput[]>([createEmptyInvoiceItem()])
  const [taxRate, setTaxRate] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, createEmptyInvoiceItem()])
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateItem = useCallback((index: number, field: keyof ItemInput, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }, [])

  const itemsWithTotals = items.map((item, index) => ({
    id: `item-${index}`,
    ...item,
    total: item.quantity * item.unitPrice,
  }))

  const totals = calculateInvoiceTotals(itemsWithTotals, taxRate, discount)

  const getFormData = (): InvoiceFormData => ({
    clientName,
    clientPhone,
    clientAddress,
    items,
    taxRate: taxRate || undefined,
    discount: discount || undefined,
    paymentMethod,
    paymentDetails,
    notes,
    dueDate: dueDate || undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(getFormData())
  }

  const handlePreview = () => {
    onPreview?.(getFormData())
  }

  const dueSelected = dueDate && isValid(parseISO(dueDate)) ? parseISO(dueDate) : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {businessProfiles.length === 0 ? (
        <Alert className="border-dashed border-amber-500/40 bg-amber-500/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('invoice.noBusinessProfile')}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{t('invoice.noBusinessProfileHint')}</span>
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard/profile">{t('nav.profile')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="border-primary/15 bg-linear-to-br from-primary/4 to-transparent shadow-sm">
          <CardHeader>
                  <CardTitle className="text-base">{t('invoice.selectBusiness')}</CardTitle>
                  <CardDescription >
                    {t('invoice.selectBusinessHint')}
                  </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="listbox" aria-label={t('invoice.selectBusiness')}>
              {businessProfiles.map((p) => {
                const selected = selectedProfileId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => onSelectProfileId(p.id)}
                    className={cn(
                      'relative flex w-full gap-4 rounded-xl border-2 p-4 text-start transition-all',
                      selected
                        ? 'border-primary bg-primary/[0.07] shadow-sm ring-1 ring-primary/25'
                        : 'border-border/80 bg-card hover:border-primary/35 hover:bg-muted/30',
                    )}
                  >
                    {selected && (
                      <span className="absolute inset-e-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                    )}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-white shadow-inner">
                      {p.logo ? (
                        <Image
                          src={p.logo}
                          alt=""
                          width={56}
                          height={56}
                          unoptimized
                          className="h-14 w-14 object-contain"
                        />
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground">
                          {(p.storeName || '?').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pe-10">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold leading-tight">{p.storeName || t('profile.storeName')}</p>
                        {defaultBusinessProfileId === p.id ? (
                          <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
                            {t('profile.defaultBadge')}
                          </Badge>
                        ) : null}
                      </div>
                      {p.taxId ? (
                        <p className="mt-1.5 text-xs text-muted-foreground" >
                          <span className="font-medium text-foreground/80">{t('profile.taxId')}:</span> {p.taxId}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-xs text-muted-foreground/80">{t('invoice.noTaxIdOnProfile')}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('invoice.billTo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">{t('client.name')} *</Label>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">{t('client.phone')}</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientAddress">{t('client.address')}</Label>
            <Input id="clientAddress" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('invoice.item')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden grid-cols-12 gap-2 text-sm font-medium text-muted-foreground sm:grid">
            <div className="col-span-5">{t('invoice.description')}</div>
            <div className="col-span-2">{t('invoice.quantity')}</div>
            <div className="col-span-2">{t('invoice.unitPrice')}</div>
            <div className="col-span-2 text-end">{t('invoice.amount')}</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <InvoiceItemRow
                key={index}
                index={index}
                description={item.description}
                quantity={item.quantity}
                unitPrice={item.unitPrice}
                onUpdate={(field, value) => updateItem(index, field, value)}
                onRemove={() => removeItem(index)}
                canRemove={items.length > 1}
              />
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addItem} className="w-full">
            <Plus className="me-2 h-4 w-4" />
            {t('invoice.addItem')}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('invoice.paymentMethod')}</CardTitle>
            <CardDescription>{t('invoice.paymentMethodHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PaymentMethodSelect value={paymentMethod} onChange={setPaymentMethod} />

            <div className="space-y-2">
              <Label htmlFor="paymentDetails">{t('invoice.paymentDetails')}</Label>
              <Input
                id="paymentDetails"
                placeholder={t('invoice.paymentDetailsPlaceholder')}
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('invoice.dueDate')}</Label>
              <Popover open={dueCalendarOpen} onOpenChange={setDueCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-start ps-3 text-start font-normal"
                  >
                    <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
                    {dueDateLabel(dueDate, language, t('invoice.pickDueDate'))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueSelected}
                    onSelect={(d) => {
                      setDueDate(d ? format(d, 'yyyy-MM-dd') : '')
                      setDueCalendarOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('invoice.notes')}</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('invoice.total')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">{t('invoice.tax')} (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate || ''}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">{t('invoice.discount')}</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('invoice.subtotal')}</span>
                <span >{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.taxAmount && totals.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('invoice.tax')} ({taxRate}%)
                  </span>
                  <span >{formatCurrency(totals.taxAmount)}</span>
                </div>
              )}
              {totals.discount && totals.discount > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>{t('invoice.discount')}</span>
                  <span>-{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                <span>{t('invoice.total')}</span>
                <span >{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" className="flex-1" disabled={loading || !clientName || !hasBusiness}>
          {t('invoice.createInvoice')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={handlePreview}
          disabled={!clientName || !hasBusiness}
        >
          {t('invoice.previewInvoice')}
        </Button>
      </div>
    </form>
  )
}
