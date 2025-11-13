'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { timelineService } from '@/lib/services/timelines'
import { vendorService } from '@/lib/services/vendors'
import type {
  EventTimelineWithVendor,
  CreateEventTimelineInput,
  UpdateEventTimelineInput,
  TimelineItemFormData,
} from '@/types/timeline.types'
import type { Vendor } from '@/types/vendor.types'
import {
  TIMELINE_COLOR_PRESETS,
  TIMELINE_ICON_PRESETS,
} from '@/types/timeline.types'
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
import { Loader2, Clock, Palette } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

// ============================================
// Zod Validation Schema
// ============================================

const timelineItemSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string(),
  start_time: z.string().min(1, 'Waktu mulai wajib diisi'),
  duration_minutes: z.string().min(1, 'Durasi wajib diisi'),
  pic_name: z.string(),
  pic_phone: z.string(),
  pic_vendor_id: z.string(),
  color: z.string(),
  icon: z.string(),
})

// ============================================
// Component Props
// ============================================

interface TimelineItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  eventId: string
  userId: string
  item?: EventTimelineWithVendor | null // If editing
  nextDisplayOrder: number // For new items
}

// ============================================
// Main Component
// ============================================

export function TimelineItemDialog({
  open,
  onOpenChange,
  onSuccess,
  eventId,
  userId,
  item,
  nextDisplayOrder,
}: TimelineItemDialogProps) {
  console.log('TimelineItemDialog RENDER - open:', open, 'eventId:', eventId, 'item:', item)

  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loadingVendors, setLoadingVendors] = useState(false)

  const isEditing = !!item

  // Debug: Log when dialog open state changes
  useEffect(() => {
    console.log('TimelineItemDialog useEffect - open changed to:', open)
  }, [open])

  // Initialize form
  const form = useForm<TimelineItemFormData>({
    resolver: zodResolver(timelineItemSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '',
      duration_minutes: '30',
      pic_name: '',
      pic_phone: '',
      pic_vendor_id: '',
      color: '#3b82f6',
      icon: 'Clock',
    },
  })

  // Load vendors when dialog opens
  useEffect(() => {
    if (open) {
      loadVendors()
    }
  }, [open, userId])

  // Update form when editing
  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description || '',
        start_time: item.start_time.substring(0, 5), // HH:MM format
        duration_minutes: item.duration_minutes.toString(),
        pic_name: item.pic_name || '',
        pic_phone: item.pic_phone || '',
        pic_vendor_id: item.pic_vendor_id || '',
        color: item.color,
        icon: item.icon,
      })
    } else {
      // Reset for new item
      form.reset({
        title: '',
        description: '',
        start_time: '',
        duration_minutes: '30',
        pic_name: '',
        pic_phone: '',
        pic_vendor_id: '',
        color: '#3b82f6',
        icon: 'Clock',
      })
    }
  }, [item, form])

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

  // Handle vendor selection
  const handleVendorChange = (vendorId: string) => {
    if (vendorId === 'none') {
      form.setValue('pic_vendor_id', '')
      return
    }

    const selectedVendor = vendors.find((v) => v.id === vendorId)
    if (selectedVendor) {
      form.setValue('pic_vendor_id', vendorId)
      // Auto-fill PIC name and phone from vendor
      if (!form.getValues('pic_name')) {
        form.setValue('pic_name', selectedVendor.contact_person || selectedVendor.name)
      }
      if (!form.getValues('pic_phone')) {
        form.setValue('pic_phone', selectedVendor.phone || '')
      }
    }
  }

  // Handle form submission
  const onSubmit = async (data: TimelineItemFormData) => {
    try {
      setLoading(true)

      if (isEditing && item) {
        // Update existing item
        const updateData: UpdateEventTimelineInput = {
          title: data.title,
          description: data.description || undefined,
          start_time: data.start_time,
          duration_minutes: Number(data.duration_minutes),
          pic_name: data.pic_name || undefined,
          pic_phone: data.pic_phone || undefined,
          pic_vendor_id: data.pic_vendor_id || undefined,
          color: data.color,
          icon: data.icon,
        }

        await timelineService.updateEventTimelineItem(item.id, updateData)
        toast.success('Timeline item berhasil diupdate!')
      } else {
        // Create new item
        const createData: CreateEventTimelineInput = {
          event_id: eventId,
          title: data.title,
          description: data.description || undefined,
          start_time: data.start_time,
          duration_minutes: Number(data.duration_minutes),
          display_order: nextDisplayOrder,
          pic_name: data.pic_name || undefined,
          pic_phone: data.pic_phone || undefined,
          pic_vendor_id: data.pic_vendor_id || undefined,
          color: data.color,
          icon: data.icon,
        }

        await timelineService.createEventTimelineItem(createData)
        toast.success('Timeline item berhasil ditambahkan!')
      }

      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error saving timeline item:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan timeline item. Silakan coba lagi.'
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

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Clock className="w-4 h-4" />
  }

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Timeline Item' : 'Tambah Timeline Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update detail item di timeline event'
              : 'Tambahkan item baru ke timeline event'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informasi Dasar</h3>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Judul Item <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Tamu Mulai Berdatangan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi detail item (opsional)"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Opsional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Waktu Mulai <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Durasi (menit) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PIC Assignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Person In Charge (PIC)</h3>

              {/* Vendor Selection */}
              <FormField
                control={form.control}
                name="pic_vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link ke Vendor</FormLabel>
                    <Select
                      onValueChange={handleVendorChange}
                      value={field.value || 'none'}
                      disabled={loadingVendors}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih vendor (opsional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada vendor</SelectItem>
                        {loadingVendors ? (
                          <SelectItem value="loading" disabled>
                            Memuat vendor...
                          </SelectItem>
                        ) : vendors.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Belum ada vendor
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
                    <FormDescription>
                      Pilih vendor jika item ini ditangani oleh vendor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* PIC Name */}
                <FormField
                  control={form.control}
                  name="pic_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama PIC</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama penanggung jawab" {...field} />
                      </FormControl>
                      <FormDescription>Opsional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PIC Phone */}
                <FormField
                  control={form.control}
                  name="pic_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Telepon PIC</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="08xx-xxxx-xxxx"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Opsional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Styling */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tampilan
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Color */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih warna" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMELINE_COLOR_PRESETS.map((preset) => (
                            <SelectItem key={preset.color} value={preset.color}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: preset.color }}
                                />
                                {preset.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Icon */}
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMELINE_ICON_PRESETS.map((preset) => (
                            <SelectItem key={preset.icon} value={preset.icon}>
                              <div className="flex items-center gap-2">
                                {getIconComponent(preset.icon)}
                                {preset.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                {isEditing ? 'Update Item' : 'Tambah Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
