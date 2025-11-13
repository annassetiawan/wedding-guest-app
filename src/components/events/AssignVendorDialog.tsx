'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { vendorService } from '@/lib/services/vendors'
import type { Vendor, AssignVendorInput } from '@/types/vendor.types'
import {
  PAYMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_LABELS,
} from '@/types/vendor.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// ============================================
// Zod Validation Schema
// ============================================

const assignVendorSchema = z.object({
  vendor_id: z.string().min(1, 'Vendor wajib dipilih'),
  contract_amount: z.string(),
  currency: z.string(),
  payment_status: z.string(),
  down_payment: z.string(),
  down_payment_date: z.string(),
  status: z.string(),
  notes: z.string(),
})

type AssignVendorFormData = z.infer<typeof assignVendorSchema>

// ============================================
// Component Props
// ============================================

interface AssignVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  eventId: string
  userId: string
  existingVendorIds?: string[] // IDs of vendors already assigned
}

// ============================================
// Main Component
// ============================================

export function AssignVendorDialog({
  open,
  onOpenChange,
  onSuccess,
  eventId,
  userId,
  existingVendorIds = [],
}: AssignVendorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)

  // Initialize form
  const form = useForm<AssignVendorFormData>({
    resolver: zodResolver(assignVendorSchema),
    defaultValues: {
      vendor_id: '',
      contract_amount: '',
      currency: 'IDR',
      payment_status: 'pending',
      down_payment: '',
      down_payment_date: '',
      status: 'confirmed',
      notes: '',
    },
  })

  // Load vendors when dialog opens
  useEffect(() => {
    if (open) {
      loadVendors()
    }
  }, [open, userId])

  const loadVendors = async () => {
    try {
      setLoadingVendors(true)
      const data = await vendorService.getVendors(userId, { is_active: true })
      setVendors(data)
    } catch (error) {
      console.error('Error loading vendors:', error)
      toast.error('Gagal memuat data vendor')
    } finally {
      setLoadingVendors(false)
    }
  }

  // Handle form submission
  const onSubmit = async (data: AssignVendorFormData) => {
    try {
      setLoading(true)

      // Check for duplicate vendor
      if (existingVendorIds.includes(data.vendor_id)) {
        const selectedVendor = vendors.find((v) => v.id === data.vendor_id)
        toast.error(
          `Vendor "${selectedVendor?.name || 'ini'}" sudah di-assign ke event ini!`,
          {
            description: 'Silakan pilih vendor lain atau edit assignment yang sudah ada.',
            duration: 5000,
          }
        )
        setLoading(false)
        return
      }

      // Clean up data
      const assignData: AssignVendorInput = {
        vendor_id: data.vendor_id,
        contract_amount: data.contract_amount
          ? Number(data.contract_amount)
          : undefined,
        currency: data.currency || 'IDR',
        payment_status: data.payment_status as any,
        down_payment: data.down_payment ? Number(data.down_payment) : undefined,
        down_payment_date: data.down_payment_date || undefined,
        status: data.status as any,
        notes: data.notes || undefined,
      }

      await vendorService.assignVendorToEvent(eventId, assignData)
      toast.success('Vendor berhasil di-assign ke event!')

      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error assigning vendor:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal assign vendor. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Vendor ke Event</DialogTitle>
          <DialogDescription>
            Pilih vendor dan atur detail kontrak untuk event ini
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Vendor Selection */}
            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vendor <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingVendors}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingVendors ? (
                        <SelectItem value="loading" disabled>
                          Memuat vendor...
                        </SelectItem>
                      ) : vendors.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Belum ada vendor aktif
                        </SelectItem>
                      ) : (
                        vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contract Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Detail Kontrak</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Contract Amount */}
                <FormField
                  control={form.control}
                  name="contract_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai Kontrak</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Currency */}
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mata Uang</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih mata uang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IDR">IDR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Status */}
              <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pembayaran</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PAYMENT_STATUS_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Down Payment */}
                <FormField
                  control={form.control}
                  name="down_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DP (Down Payment)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Opsional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DP Date */}
                <FormField
                  control={form.control}
                  name="down_payment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal DP</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Opsional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Assignment Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Assignment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ASSIGNMENT_STATUS_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan (opsional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading || loadingVendors}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Assign Vendor
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
