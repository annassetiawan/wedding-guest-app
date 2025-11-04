'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { guestService } from '@/lib/services/guests'
import { Guest } from '@/types/database.types'

interface DeleteGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
  onSuccess: () => void
}

export default function DeleteGuestDialog({
  open,
  onOpenChange,
  guest,
  onSuccess,
}: DeleteGuestDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!guest) return

    try {
      setIsDeleting(true)
      await guestService.deleteGuest(guest.id)
      toast.success('Tamu berhasil dihapus')
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus tamu')
      console.error('Error deleting guest:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Hapus Tamu</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-3">
            Apakah Anda yakin ingin menghapus <span className="font-semibold text-foreground">{guest?.name}</span> dari daftar tamu?
            Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              'Hapus Tamu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
