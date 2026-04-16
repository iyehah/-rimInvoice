'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/use-language'
import paymentMethodsConfig from '@/config/payment-methods.json'

interface PaymentMethodSelectProps {
  value?: string
  onChange: (value: string) => void
}

export function PaymentMethodSelect({ value, onChange }: PaymentMethodSelectProps) {
  const { language, t } = useLanguage()

  const methods = paymentMethodsConfig.methods.filter((m) => m.isEnabled)

  const getMethodName = (method: (typeof methods)[0]) => {
    if (language === 'ar') return method.nameAr
    if (language === 'fr') return method.nameFr
    return method.name
  }

  const getHint = (method: (typeof methods)[0]) => {
    if (language === 'ar') return method.instructionsAr
    if (language === 'fr') return method.instructionsFr
    return method.instructions
  }

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label={t('invoice.paymentMethod')}
    >
      {methods.map((method) => {
        const selected = value === method.id
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(method.id)}
            className={cn(
              'relative flex w-full flex-col gap-3 rounded-xl border-2 p-4 text-start transition-all sm:flex-row sm:items-center',
              selected
                ? 'border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary/20'
                : 'border-border/80 bg-card hover:border-primary/35 hover:bg-muted/40',
            )}
          >
            {selected && (
              <span className="absolute end-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white shadow-inner',
              )}
              style={
                method.color
                  ? { backgroundColor: `${method.color}18`, borderColor: `${method.color}35` }
                  : undefined
              }
            >
              {method.logo ? (
                <Image
                  src={method.logo}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="h-9 w-9 object-contain"
                  draggable={false}
                />
              ) : (
                <span className="text-lg font-bold" style={{ color: method.color }}>
                  {method.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pe-8 sm:pe-6">
              <p className="font-semibold leading-tight">{getMethodName(method)}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{getHint(method)}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
