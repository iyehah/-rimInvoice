import type { InvoiceItem } from '@/types/invoice'

export function generateInvoiceNumber(): string {
  const prefix = 'INV'
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `${prefix}-${year}${month}${day}-${random}`
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxRate?: number,
  discount?: number
): {
  subtotal: number
  taxRate?: number
  taxAmount?: number
  discount?: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  
  let taxAmount: number | undefined
  if (taxRate && taxRate > 0) {
    taxAmount = subtotal * (taxRate / 100)
  }
  
  const discountAmount = discount || 0
  const total = subtotal + (taxAmount || 0) - discountAmount
  
  return {
    subtotal,
    taxRate,
    taxAmount,
    discount,
    total: Math.max(0, total),
  }
}

export function formatCurrency(amount: number, currency = 'MRU'): string {
  const symbols: Record<string, string> = {
    MRU: 'UM',
    USD: '$',
    EUR: '€',
  }
  
  const symbol = symbols[currency] || currency
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  
  return `${formatted} ${symbol}`
}

export function formatDate(dateString: string, locale = 'en'): string {
  const date = new Date(dateString)
  
  const localeMap: Record<string, string> = {
    ar: 'ar-SA',
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    pt: 'pt-PT',
    de: 'de-DE',
  }
  
  return date.toLocaleDateString(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  
  return colors[status] || colors.draft
}

export function isInvoiceOverdue(dueDate?: string): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function createEmptyInvoiceItem(): Omit<InvoiceItem, 'id' | 'total'> {
  return {
    description: '',
    quantity: 1,
    unitPrice: 0,
  }
}
