'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { guestService } from '@/lib/services/guests'
import { Guest, GuestCategory } from '@/types/database.types'

const formSchema = z.object({
  name: z.string().min(1, 'Nama tamu wajib diisi').min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
  category: z.enum(['VIP', 'Regular', 'Family'] as const),
})

type FormValues = z.infer<typeof formSchema>

interface EditGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
  onSuccess: () => void
}

export default function EditGuestDialog({
  open,
  onOpenChange,
  guest,
  onSuccess,
}: EditGuestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      category: 'Regular',
    },
  })

  // Update form when guest changes
  useEffect(() => {
    if (guest) {
      form.reset({
        name: guest.name,
        phone: guest.phone || '',
        category: guest.category as 'VIP' | 'Regular' | 'Family',
      })
    }
  }, [guest, form])

  const onSubmit = async (values: FormValues) => {
    if (!guest) return

    try {
      setIsSubmitting(true)
      await guestService.updateGuest(guest.id, {
        name: values.name,
        phone: values.phone || '',
        category: values.category as GuestCategory,
      })
      toast.success('Tamu berhasil diperbarui')
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui tamu')
      console.error('Error updating guest:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Tamu</DialogTitle>
          <DialogDescription>
            Perbarui informasi tamu dalam daftar undangan
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Tamu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., John Doe"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Telepon (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 08123456789"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
