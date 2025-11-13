'use client'

import { useState } from 'react'
import { vendorService } from '@/lib/services/vendors'
import type { VendorWithStats } from '@/types/vendor.types'
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
import { Loader2 } from 'lucide-react'

interface DeleteVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  vendor: VendorWithStats | null
}

export function DeleteVendorDialog({
  open,
  onOpenChange,
  onSuccess,
  vendor,
}: DeleteVendorDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!vendor) return

    try {
      setLoading(true)
      await vendorService.deleteVendor(vendor.id)
      toast.success(`Vendor "${vendor.name}" berhasil dihapus`)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal menghapus vendor. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Vendor</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus vendor{' '}
            <span className="font-semibold text-foreground">
              {vendor?.name}
            </span>
            ?
            <br />
            <br />
            {vendor && vendor.total_events > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                ⚠️ Vendor ini telah di-assign ke {vendor.total_events} event.
                Menghapus vendor akan menghapus semua assignment terkait.
              </span>
            )}
            {vendor && vendor.active_events > 0 && (
              <span className="text-red-600 dark:text-red-400 block mt-2">
                ⚠️ Vendor ini masih memiliki {vendor.active_events} event aktif.
              </span>
            )}
            <br />
            Aksi ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Hapus Vendor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
