'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { vendorService } from '@/lib/services/vendors'
import type {
  Vendor,
  VendorCategory,
  PriceRange,
  CreateVendorInput,
} from '@/types/vendor.types'
import {
  VENDOR_CATEGORY_LABELS,
  PRICE_RANGE_LABELS,
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// ============================================
// Zod Validation Schema
// ============================================

const vendorFormSchema = z.object({
  name: z.string().min(3, 'Nama vendor minimal 3 karakter'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  is_active: z.boolean(),
  contact_person: z.string(),
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  description: z.string(),
  services_offered: z.array(z.string()).optional(),
  price_range: z.string(),
  rating: z.string(),
  notes: z.string(),
})

type VendorFormData = z.infer<typeof vendorFormSchema>

// ============================================
// Component Props
// ============================================

interface VendorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  userId: string
  vendor?: Vendor // If provided, edit mode
}

// ============================================
// Main Component
// ============================================

export function VendorFormDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
  vendor,
}: VendorFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEditMode = !!vendor

  // Initialize form
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: vendor?.name || '',
      category: vendor?.category || '',
      contact_person: vendor?.contact_person || '',
      phone: vendor?.phone || '',
      email: vendor?.email || '',
      address: vendor?.address || '',
      description: vendor?.description || '',
      services_offered: vendor?.services_offered || [],
      price_range: vendor?.price_range || '',
      rating: vendor?.rating || ('' as any),
      notes: vendor?.notes || '',
      is_active: vendor?.is_active ?? true,
    },
  })

  // Handle form submission
  const onSubmit = async (data: VendorFormData) => {
    try {
      setLoading(true)

      // Clean up data
      const cleanData: CreateVendorInput = {
        name: data.name,
        category: data.category as VendorCategory,
        contact_person: data.contact_person || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        description: data.description || undefined,
        services_offered:
          data.services_offered && data.services_offered.length > 0
            ? data.services_offered
            : undefined,
        price_range: data.price_range
          ? (data.price_range as PriceRange)
          : undefined,
        rating: data.rating ? Number(data.rating) : undefined,
        notes: data.notes || undefined,
        is_active: data.is_active,
      }

      if (isEditMode) {
        // Update existing vendor
        await vendorService.updateVendor(vendor.id, cleanData)
        toast.success('Vendor berhasil diperbarui!')
      } else {
        // Create new vendor
        await vendorService.createVendor(userId, cleanData)
        toast.success('Vendor berhasil ditambahkan!')
      }

      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error saving vendor:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan vendor. Silakan coba lagi.'
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
          <DialogTitle>
            {isEditMode ? 'Edit Vendor' : 'Tambah Vendor Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui informasi vendor'
              : 'Tambahkan vendor baru ke database Anda'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi Dasar</h3>

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Vendor <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Catering Rasa Nusantara" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kategori <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(VENDOR_CATEGORY_LABELS).map(
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

              {/* Price Range */}
              <FormField
                control={form.control}
                name="price_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rentang Harga</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rentang harga (opsional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRICE_RANGE_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Estimasi tingkat harga vendor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Contoh: 4.5"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Rating keseluruhan vendor</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi Kontak</h3>

              {/* Contact Person */}
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kontak</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama PIC vendor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="08xx-xxxx-xxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="vendor@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alamat lengkap vendor"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Detail Bisnis</h3>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi singkat tentang vendor"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
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
                    <FormLabel>Catatan Internal</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan pribadi (hanya terlihat oleh Anda)"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Catatan untuk referensi internal Anda
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Status</h3>

              {/* Is Active */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vendor Aktif</FormLabel>
                      <FormDescription>
                        Vendor aktif dapat di-assign ke event baru
                      </FormDescription>
                    </div>
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
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Vendor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
