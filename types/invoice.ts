export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  createdAt: string
  dueDate?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  
  // Business info (from profile)
  businessProfileId?: string
  businessName: string
  businessLogo?: string
  businessPhone?: string
  businessAddress?: string
  businessTaxId?: string

  // Client info
  clientName: string
  clientPhone?: string
  clientAddress?: string
  
  // Items
  items: InvoiceItem[]
  
  // Totals
  subtotal: number
  taxRate?: number
  taxAmount?: number
  discount?: number
  total: number
  
  // Payment
  paymentMethod?: string
  paymentDetails?: string
  
  // Notes
  notes?: string
  
  // Metadata
  userId: string
  currency: string
}

export interface InvoiceFormData {
  clientName: string
  clientPhone?: string
  clientAddress?: string
  items: Omit<InvoiceItem, 'id' | 'total'>[]
  taxRate?: number
  discount?: number
  paymentMethod?: string
  paymentDetails?: string
  notes?: string
  dueDate?: string
}
