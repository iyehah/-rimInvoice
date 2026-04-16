'use client'

import { useState, useCallback } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import type { Invoice, InvoiceFormData, InvoiceItem } from '@/types/invoice'
import { useAuth } from './use-auth'
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/invoice-utils'
import {
  loadInvoices,
  getInvoiceById,
  addInvoice,
  deleteInvoiceFromStore,
  newInvoiceId,
} from '@/lib/local-invoices'
import type { BusinessProfileStored } from '@/lib/local-business-profiles'

type BusinessForInvoice = BusinessProfileStored | null

function invoicesKey(uid: string | undefined) {
  return uid ? `user-invoices-local-${uid}` : null
}

export function useInvoice(invoiceId?: string) {
  const { user } = useAuth()
  const key = invoicesKey(user?.uid)

  const { data, error, isLoading, mutate } = useSWR(
    key && invoiceId ? ([key, invoiceId] as const) : null,
    ([, id]) => {
      if (!user?.uid || !id) return null
      return getInvoiceById(user.uid, id)
    },
  )

  return {
    invoice: data === undefined ? undefined : data,
    isLoading: !!invoiceId && !!user?.uid && isLoading,
    isError: error,
    mutate,
  }
}

export function useUserInvoices() {
  const { user } = useAuth()
  const key = invoicesKey(user?.uid)

  const { data, error, mutate } = useSWR(key, () => (user?.uid ? loadInvoices(user.uid) : []), {
    revalidateOnFocus: true,
  })

  return {
    invoices: data || [],
    isLoading: !error && !data && !!user?.uid,
    isError: error,
    mutate,
  }
}

export function useInvoiceActions() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invalidate = useCallback(() => {
    if (user?.uid) globalMutate(invoicesKey(user.uid))
  }, [user?.uid])

  const createInvoice = useCallback(
    async (formData: InvoiceFormData, business: BusinessForInvoice): Promise<string | null> => {
      if (!user) {
        setError('Not authenticated')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const items: InvoiceItem[] = formData.items.map((item, index) => ({
          id: `item-${index}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        }))

        const totals = calculateInvoiceTotals(items, formData.taxRate, formData.discount)

        const id = newInvoiceId()
        const invoice: Invoice = {
          id,
          invoiceNumber: generateInvoiceNumber(),
          createdAt: new Date().toISOString(),
          dueDate: formData.dueDate,
          status: 'draft',
          businessProfileId: business?.id,
          businessName: business?.storeName || user.displayName || 'My Business',
          businessLogo: business?.logo,
          businessPhone: business?.phone,
          businessAddress: business?.address,
          businessTaxId: business?.taxId,
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          clientAddress: formData.clientAddress,
          items,
          ...totals,
          paymentMethod: formData.paymentMethod,
          paymentDetails: formData.paymentDetails,
          notes: formData.notes,
          userId: user.uid,
          currency: 'MRU',
        }

        addInvoice(user.uid, invoice)
        invalidate()
        setLoading(false)
        return id
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create invoice')
        setLoading(false)
        return null
      }
    },
    [user, invalidate],
  )

  const updateInvoice = useCallback(async (_invoiceId: string, _updates: Partial<Invoice>): Promise<boolean> => {
    setError(null)
    return true
  }, [])

  const deleteInvoice = useCallback(
    async (invoiceId: string): Promise<boolean> => {
      if (!user) {
        setError('Not authenticated')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        deleteInvoiceFromStore(user.uid, invoiceId)
        invalidate()
        setLoading(false)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invoice')
        setLoading(false)
        return false
      }
    },
    [user, invalidate],
  )

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    loading,
    error,
  }
}
