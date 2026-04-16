'use client'

import { forwardRef } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { formatCurrency, formatDate } from '@/lib/invoice-utils'
import paymentMethodsConfig from '@/config/payment-methods.json'
import type { Invoice } from '@/types/invoice'

interface InvoicePreviewProps {
  invoice: Partial<Invoice>
  className?: string
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ invoice, className }, ref) {
    const { language, direction, t } = useLanguage()

    const paymentMethod = paymentMethodsConfig.methods.find(
      (m) => m.id === invoice.paymentMethod
    )

    const getPaymentMethodName = () => {
      if (!paymentMethod) return invoice.paymentMethod
      if (language === 'ar') return paymentMethod.nameAr
      if (language === 'fr') return paymentMethod.nameFr
      return paymentMethod.name
    }

    return (
      <div
        ref={ref}
        className={`bg-white text-gray-900 p-8 max-w-2xl mx-auto ${className}`}
        dir={direction}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {invoice.businessLogo ? (
              // eslint-disable-next-line @next/next/no-img-element -- html2canvas-friendly capture
              <img
                src={invoice.businessLogo}
                alt={invoice.businessName || ''}
                width={80}
                height={80}
                className="mb-2 h-20 w-20 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-gray-500">
                  {invoice.businessName?.charAt(0) || 'B'}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold">{invoice.businessName}</h1>
            {invoice.businessTaxId && (
              <p className="text-xs text-gray-600" dir="ltr">
                <span className="font-medium">{t('profile.taxId')}:</span> {invoice.businessTaxId}
              </p>
            )}
            {invoice.businessPhone && (
              <p className="text-sm text-gray-600" dir="ltr">{invoice.businessPhone}</p>
            )}
            {invoice.businessAddress && (
              <p className="text-sm text-gray-600">{invoice.businessAddress}</p>
            )}
          </div>
          <div className="text-end">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('invoice.title')}</h2>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t('invoice.invoiceNumber')}:</span>{' '}
              <span dir="ltr">{invoice.invoiceNumber}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{t('invoice.date')}:</span>{' '}
              {invoice.createdAt && formatDate(invoice.createdAt, language)}
            </p>
            {invoice.dueDate && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t('invoice.dueDate')}:</span>{' '}
                {formatDate(invoice.dueDate, language)}
              </p>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{t('invoice.billTo')}</h3>
          <p className="font-semibold">{invoice.clientName}</p>
          {invoice.clientPhone && (
            <p className="text-sm text-gray-600" dir="ltr">{invoice.clientPhone}</p>
          )}
          {invoice.clientAddress && (
            <p className="text-sm text-gray-600">{invoice.clientAddress}</p>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-start py-2 text-sm font-medium text-gray-500">
                {t('invoice.description')}
              </th>
              <th className="text-center py-2 text-sm font-medium text-gray-500 w-20">
                {t('invoice.quantity')}
              </th>
              <th className="text-end py-2 text-sm font-medium text-gray-500 w-28">
                {t('invoice.unitPrice')}
              </th>
              <th className="text-end py-2 text-sm font-medium text-gray-500 w-28">
                {t('invoice.amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={item.id || index} className="border-b border-gray-100">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-center" dir="ltr">{item.quantity}</td>
                <td className="py-3 text-end" dir="ltr">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td className="py-3 text-end" dir="ltr">{formatCurrency(item.total, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">{t('invoice.subtotal')}</span>
              <span dir="ltr">{formatCurrency(invoice.subtotal || 0, invoice.currency)}</span>
            </div>
            {invoice.taxAmount && invoice.taxAmount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t('invoice.tax')} ({invoice.taxRate}%)</span>
                <span dir="ltr">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}
            {invoice.discount && invoice.discount > 0 && (
              <div className="flex justify-between py-2 text-red-600">
                <span>{t('invoice.discount')}</span>
                <span dir="ltr">-{formatCurrency(invoice.discount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-gray-900 font-bold text-lg">
              <span>{t('invoice.total')}</span>
              <span dir="ltr">{formatCurrency(invoice.total || 0, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        {invoice.paymentMethod && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('invoice.paymentMethod')}
            </h3>
            <div className="flex items-center gap-3">
              {paymentMethod?.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={paymentMethod.logo}
                  alt=""
                  width={32}
                  height={32}
                  className="object-contain"
                />
              )}
              <div>
                <p className="font-medium">{getPaymentMethodName()}</p>
                {invoice.paymentDetails && (
                  <p className="text-sm text-gray-600" dir="ltr">{invoice.paymentDetails}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('invoice.notes')}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
          <p>{t('common.appName')}</p>
        </div>
      </div>
    )
  }
)
