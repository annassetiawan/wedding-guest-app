'use client'

import { useState } from 'react'
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
import { GuestCategory } from '@/types/database.types'

const formSchema = z.object({
  name: z.string().min(1, 'Nama tamu wajib diisi').min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
  category: z.enum(['VIP', 'Regular', 'Family'] as const),
})

type FormValues = z.infer<typeof formSchema>

interface AddGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onSuccess: () => void
}

export default function AddGuestDialog({
  open,
  onOpenChange,
  eventId,
  onSuccess,
}: AddGuestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      category: 'Regular',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      console.log('=== Add Guest Form Submission ===')
      console.log('Form values:', values)
      console.log('Event ID:', eventId)

      const guestData = {
        event_id: eventId,
        name: values.name,
        phone: values.phone || '',
        category: values.category as GuestCategory,
      }

      console.log('Guest data to insert:', guestData)

      const newGuest = await guestService.createGuest(guestData)

      console.log('Guest created successfully:', newGuest)
      toast.success('Tamu berhasil ditambahkan')
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error('=== Error Creating Guest ===')
      console.error('Error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error))
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)

      const errorMessage = error?.message || 'Gagal menambahkan tamu. Silakan coba lagi.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Tamu Baru</DialogTitle>
          <DialogDescription>
            Tambahkan tamu ke daftar undangan event Anda
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
                    defaultValue={field.value}
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
                  'Tambah Tamu'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
