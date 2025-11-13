'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { vendorService } from '@/lib/services/vendors'
import type { EventVendorWithDetails, UpdateEventVendorInput } from '@/types/vendor.types'
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

const editVendorAssignmentSchema = z.object({
  contract_amount: z.string(),
  currency: z.string(),
  payment_status: z.string(),
  down_payment: z.string(),
  down_payment_date: z.string(),
  full_payment_date: z.string(),
  status: z.string(),
  performance_rating: z.string(),
  notes: z.string(),
})

type EditVendorAssignmentFormData = z.infer<typeof editVendorAssignmentSchema>

// ============================================
// Component Props
// ============================================

interface EditVendorAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  vendorAssignment: EventVendorWithDetails | null
}

// ============================================
// Main Component
// ============================================

export function EditVendorAssignmentDialog({
  open,
  onOpenChange,
  onSuccess,
  vendorAssignment,
}: EditVendorAssignmentDialogProps) {
  const [loading, setLoading] = useState(false)

  // Initialize form
  const form = useForm<EditVendorAssignmentFormData>({
    resolver: zodResolver(editVendorAssignmentSchema),
    defaultValues: {
      contract_amount: '',
      currency: 'IDR',
      payment_status: 'pending',
      down_payment: '',
      down_payment_date: '',
      full_payment_date: '',
      status: 'confirmed',
      performance_rating: '',
      notes: '',
    },
  })

  // Update form when vendorAssignment changes
  useEffect(() => {
    if (vendorAssignment) {
      form.reset({
        contract_amount: vendorAssignment.contract_amount?.toString() || '',
        currency: vendorAssignment.currency || 'IDR',
        payment_status: vendorAssignment.payment_status || 'pending',
        down_payment: vendorAssignment.down_payment?.toString() || '',
        down_payment_date: vendorAssignment.down_payment_date || '',
        full_payment_date: vendorAssignment.full_payment_date || '',
        status: vendorAssignment.status || 'confirmed',
        performance_rating: vendorAssignment.performance_rating?.toString() || '',
        notes: vendorAssignment.notes || '',
      })
    }
  }, [vendorAssignment, form])

  // Handle form submission
  const onSubmit = async (data: EditVendorAssignmentFormData) => {
    if (!vendorAssignment) return

    try {
      setLoading(true)

      // Clean up data
      const updateData: UpdateEventVendorInput = {
        contract_amount: data.contract_amount
          ? Number(data.contract_amount)
          : undefined,
        payment_status: data.payment_status as any,
        down_payment: data.down_payment ? Number(data.down_payment) : undefined,
        down_payment_date: data.down_payment_date || undefined,
        full_payment_date: data.full_payment_date || undefined,
        status: data.status as any,
        performance_rating: data.performance_rating
          ? Number(data.performance_rating)
          : undefined,
        notes: data.notes || undefined,
      }

      await vendorService.updateEventVendor(vendorAssignment.id, updateData)
      toast.success('Assignment berhasil diupdate!')

      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error updating vendor assignment:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal update assignment. Silakan coba lagi.'
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
          <DialogTitle>Edit Vendor Assignment</DialogTitle>
          <DialogDescription>
            Update contract dan payment details untuk{' '}
            <span className="font-semibold">
              {vendorAssignment?.vendor.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                {/* Currency - Display Only */}
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mata Uang</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>Tidak dapat diubah</FormDescription>
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
                      value={field.value}
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

              {/* Full Payment Date */}
              <FormField
                control={form.control}
                name="full_payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pelunasan</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Opsional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assignment Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Assignment</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
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

              {/* Performance Rating */}
              <FormField
                control={form.control}
                name="performance_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance Rating (1-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Rating setelah event selesai (opsional)
                    </FormDescription>
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
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Assignment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
