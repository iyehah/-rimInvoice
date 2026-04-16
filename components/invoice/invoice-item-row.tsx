'use client'

import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import { formatCurrency } from '@/lib/invoice-utils'

interface InvoiceItemRowProps {
  index: number
  description: string
  quantity: number
  unitPrice: number
  onUpdate: (field: 'description' | 'quantity' | 'unitPrice', value: string | number) => void
  onRemove: () => void
  canRemove: boolean
}

export function InvoiceItemRow({
  index,
  description,
  quantity,
  unitPrice,
  onUpdate,
  onRemove,
  canRemove,
}: InvoiceItemRowProps) {
  const { t } = useLanguage()
  const total = quantity * unitPrice

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-12 sm:col-span-5">
        <Input
          placeholder={t('invoice.description')}
          value={description}
          onChange={(e) => onUpdate('description', e.target.value)}
        />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <Input
          type="number"
          min="1"
          placeholder={t('invoice.quantity')}
          value={quantity || ''}
          onChange={(e) => onUpdate('quantity', parseInt(e.target.value) || 0)}
          dir="ltr"
        />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder={t('invoice.unitPrice')}
          value={unitPrice || ''}
          onChange={(e) => onUpdate('unitPrice', parseFloat(e.target.value) || 0)}
          dir="ltr"
        />
      </div>
      <div className="col-span-3 sm:col-span-2 text-sm font-medium text-end" dir="ltr">
        {formatCurrency(total)}
      </div>
      <div className="col-span-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t('invoice.removeItem')}</span>
        </Button>
      </div>
    </div>
  )
}
