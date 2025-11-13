'use client'

import { useState } from 'react'
import { vendorService } from '@/lib/services/vendors'
import type { EventVendorWithDetails } from '@/types/vendor.types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'

interface RemoveVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  vendorAssignment: EventVendorWithDetails | null
}

export function RemoveVendorDialog({
  open,
  onOpenChange,
  onSuccess,
  vendorAssignment,
}: RemoveVendorDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    if (!vendorAssignment) return

    try {
      setLoading(true)
      await vendorService.removeVendorFromEvent(vendorAssignment.id)
      toast.success(`Vendor "${vendorAssignment.vendor.name}" berhasil dihapus dari event`)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error removing vendor:', error)
      toast.error('Gagal menghapus vendor dari event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>Hapus Vendor dari Event?</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="space-y-3">
          <p>
            Anda yakin ingin menghapus vendor{' '}
            <span className="font-semibold text-foreground">
              {vendorAssignment?.vendor.name}
            </span>{' '}
            dari event ini?
          </p>

          {vendorAssignment?.contract_amount && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>⚠️ Perhatian:</strong> Vendor ini memiliki kontrak senilai{' '}
                <span className="font-semibold">
                  {vendorAssignment.currency === 'USD' ? '$' : 'Rp '}
                  {vendorAssignment.contract_amount.toLocaleString()}
                </span>
                {vendorAssignment.payment_status === 'paid' && (
                  <span> dan pembayaran sudah lunas</span>
                )}
                {vendorAssignment.payment_status === 'dp_paid' && (
                  <span> dengan DP yang sudah dibayar</span>
                )}
                .
              </p>
            </div>
          )}

          <p className="text-sm">
            Data assignment akan dihapus permanen dan tidak dapat dikembalikan.
          </p>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleRemove()
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Hapus Vendor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
