'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { timelineService } from '@/lib/services/timelines'
import type {
  TimelineTemplate,
  TimelineTemplateWithItems,
  ApplyTemplateToEventInput,
} from '@/types/timeline.types'
import {
  TIMELINE_CATEGORY_LABELS,
  TimelineCategory,
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Clock, Users, Star, ChevronRight } from 'lucide-react'

// ============================================
// Zod Validation Schema
// ============================================

const applyTemplateSchema = z.object({
  template_id: z.string().min(1, 'Template wajib dipilih'),
  start_time: z.string().min(1, 'Waktu mulai wajib diisi'),
})

type ApplyTemplateFormData = z.infer<typeof applyTemplateSchema>

// ============================================
// Component Props
// ============================================

interface ApplyTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  eventId: string
  userId: string
}

// ============================================
// Main Component
// ============================================

export function ApplyTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
  eventId,
  userId,
}: ApplyTemplateDialogProps) {
  console.log('ApplyTemplateDialog RENDER - open:', open, 'eventId:', eventId)

  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<TimelineTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TimelineTemplateWithItems | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Initialize form
  const form = useForm<ApplyTemplateFormData>({
    resolver: zodResolver(applyTemplateSchema),
    defaultValues: {
      template_id: '',
      start_time: '09:00',
    },
  })

  // Load templates when dialog opens
  useEffect(() => {
    if (open) {
      loadTemplates()
      form.reset({
        template_id: '',
        start_time: '09:00',
      })
      setSelectedTemplate(null)
    }
  }, [open, userId, form])

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const data = await timelineService.getTimelineTemplates(userId)
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Gagal memuat template')
    } finally {
      setLoadingTemplates(false)
    }
  }

  // Load template preview when selected
  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate(null)
      return
    }

    try {
      setLoadingPreview(true)
      const template = await timelineService.getTimelineTemplateById(templateId)
      setSelectedTemplate(template)
    } catch (error) {
      console.error('Error loading template preview:', error)
      toast.error('Gagal memuat preview template')
    } finally {
      setLoadingPreview(false)
    }
  }

  // Handle form submission
  const onSubmit = async (data: ApplyTemplateFormData) => {
    try {
      setLoading(true)

      const applyData: ApplyTemplateToEventInput = {
        template_id: data.template_id,
        event_id: eventId,
        start_time: data.start_time,
      }

      const createdItems = await timelineService.applyTemplateToEvent(applyData)

      toast.success(
        `Template berhasil diterapkan! ${createdItems.length} item ditambahkan ke timeline.`
      )

      form.reset()
      setSelectedTemplate(null)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error applying template:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal menerapkan template. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      form.reset()
      setSelectedTemplate(null)
      onOpenChange(false)
    }
  }

  // Calculate total duration
  const getTotalDuration = () => {
    if (!selectedTemplate) return 0
    return selectedTemplate.items.reduce((sum, item) => sum + item.duration_minutes, 0)
  }

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Terapkan Template ke Timeline</DialogTitle>
          <DialogDescription>
            Pilih template yang sudah ada untuk membuat timeline event dengan cepat
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Template Selection */}
              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pilih Template <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleTemplateSelect(value)
                      }}
                      value={field.value}
                      disabled={loadingTemplates}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingTemplates ? (
                          <SelectItem value="loading" disabled>
                            Memuat template...
                          </SelectItem>
                        ) : templates.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Belum ada template tersedia
                          </SelectItem>
                        ) : (
                          templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <span>{template.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {TIMELINE_CATEGORY_LABELS[template.category as TimelineCategory]}
                                </Badge>
                                {template.is_public && (
                                  <Badge variant="secondary" className="text-xs">
                                    Public
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih template untuk melihat preview dan menerapkannya
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
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
                    <FormDescription>
                      Item pertama akan dimulai pada waktu ini, item berikutnya akan otomatis
                      dijadwalkan berdasarkan durasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Template Preview */}
              {loadingPreview && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {selectedTemplate && !loadingPreview && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Preview Timeline</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedTemplate.description || 'Tidak ada deskripsi'}
                    </p>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Total Durasi</p>
                              <p className="text-sm font-medium">{getTotalDuration()} menit</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Total Item</p>
                              <p className="text-sm font-medium">{selectedTemplate.items.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Digunakan</p>
                              <p className="text-sm font-medium">
                                {selectedTemplate.usage_count}x
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timeline Items Preview */}
                    <ScrollArea className="h-[300px] rounded-md border p-4">
                      <div className="space-y-3">
                        {selectedTemplate.items.map((item, index) => {
                          const startTime = form.watch('start_time') || '09:00'
                          const [startHours, startMinutes] = startTime.split(':').map(Number)
                          const previousDuration = selectedTemplate.items
                            .slice(0, index)
                            .reduce((sum, i) => sum + i.duration_minutes, 0)
                          const itemStartMinutes = startHours * 60 + startMinutes + previousDuration
                          const itemStartTime = `${String(Math.floor(itemStartMinutes / 60)).padStart(2, '0')}:${String(itemStartMinutes % 60).padStart(2, '0')}`
                          const itemEndTime = calculateEndTime(itemStartTime, item.duration_minutes)

                          return (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                            >
                              <div
                                className="w-1 h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{item.title}</h4>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {item.duration_minutes}m
                                  </Badge>
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {itemStartTime} - {itemEndTime}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>

                    {/* Estimated End Time */}
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Estimasi selesai:</span>{' '}
                        <span className="font-medium">
                          {calculateEndTime(
                            form.watch('start_time') || '09:00',
                            getTotalDuration()
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedTemplate}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Terapkan Template
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
