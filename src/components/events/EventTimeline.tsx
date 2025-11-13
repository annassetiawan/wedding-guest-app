'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { timelineService } from '@/lib/services/timelines'
import type {
  EventTimelineWithVendor,
  TimelineStats,
  UpdateTimelineOrderInput,
} from '@/types/timeline.types'
import {
  Clock,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  GripVertical,
  User,
  Phone,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { TimelineItemDialog } from './TimelineItemDialog'
import { ApplyTemplateDialog } from './ApplyTemplateDialog'

// ============================================
// Component Props
// ============================================

interface EventTimelineProps {
  eventId: string
  eventDate: string // Used to check if event is today (live mode)
  userId: string // For loading vendors
  // Callbacks for dialog actions (lifted state)
  onAddItem?: () => void
  onEditItem?: (item: EventTimelineWithVendor) => void
  onApplyTemplate?: () => void
  onTimelineChange?: (length: number) => void
  refreshTrigger?: number
}

// ============================================
// Main Component
// ============================================

export function EventTimeline({
  eventId,
  eventDate,
  userId,
  onAddItem,
  onEditItem,
  onApplyTemplate,
  onTimelineChange,
  refreshTrigger = 0,
}: EventTimelineProps) {
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState<EventTimelineWithVendor[]>([])
  const [stats, setStats] = useState<TimelineStats | null>(null)
  const [liveMode, setLiveMode] = useState(false)

  // Check if event is today (enable live mode)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const isToday = eventDate === today
    setLiveMode(isToday)
  }, [eventDate])

  // Load timeline data
  useEffect(() => {
    loadTimeline()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, refreshTrigger])

  // Notify parent when timeline changes
  useEffect(() => {
    if (onTimelineChange) {
      onTimelineChange(timeline.length)
    }
  }, [timeline, onTimelineChange])

  const loadTimeline = async () => {
    try {
      setLoading(true)
      console.log('[loadTimeline] Starting to load timeline for eventId:', eventId)
      const [timelineData, statsData] = await Promise.all([
        timelineService.getEventTimeline(eventId),
        timelineService.getTimelineStats(eventId),
      ])
      console.log('[loadTimeline] Success - timeline:', timelineData, 'stats:', statsData)
      setTimeline(timelineData)
      setStats(statsData)
    } catch (error) {
      console.error('[loadTimeline] ERROR:', error)
      // Check if it's a database error (table doesn't exist)
      if (error instanceof Error && error.message.includes('relation')) {
        toast.error('Timeline tables belum ada. Silakan jalankan migration SQL terlebih dahulu.')
      } else {
        toast.error('Gagal memuat timeline')
      }
      // Set empty data to prevent crash
      setTimeline([])
      setStats({
        total_items: 0,
        completed_items: 0,
        total_duration_minutes: 0,
        completion_percentage: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle completion status
  const handleToggleComplete = async (item: EventTimelineWithVendor) => {
    try {
      await timelineService.completeTimelineItem(item.id, {
        is_completed: !item.is_completed,
        completed_by: 'Current User', // TODO: Get from auth context
        actual_start_time: !item.is_completed ? new Date().toISOString() : undefined,
        actual_end_time: !item.is_completed ? new Date().toISOString() : undefined,
      })

      toast.success(
        !item.is_completed
          ? `"${item.title}" ditandai selesai`
          : `"${item.title}" ditandai belum selesai`
      )

      loadTimeline()
    } catch (error) {
      console.error('Error toggling completion:', error)
      toast.error('Gagal update status')
    }
  }

  // Handle edit
  const handleEdit = (item: EventTimelineWithVendor) => {
    if (onEditItem) {
      onEditItem(item)
    }
  }

  // Handle delete
  const handleDelete = async (item: EventTimelineWithVendor) => {
    if (!confirm(`Hapus "${item.title}" dari timeline?`)) return

    try {
      await timelineService.deleteEventTimelineItem(item.id)
      toast.success('Item timeline berhasil dihapus')
      loadTimeline()
    } catch (error) {
      console.error('Error deleting timeline item:', error)
      toast.error('Gagal menghapus item')
    }
  }

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    // No change in position
    if (source.index === destination.index) return

    // Reorder items locally
    const reorderedTimeline = Array.from(timeline)
    const [removed] = reorderedTimeline.splice(source.index, 1)
    reorderedTimeline.splice(destination.index, 0, removed)

    // Update local state immediately for responsiveness
    setTimeline(reorderedTimeline)

    // Prepare updates for API
    const updates: UpdateTimelineOrderInput[] = reorderedTimeline.map((item, index) => ({
      id: item.id,
      display_order: index,
    }))

    try {
      await timelineService.updateTimelineOrder(updates)
      toast.success('Urutan timeline berhasil diupdate')
    } catch (error) {
      console.error('Error updating timeline order:', error)
      toast.error('Gagal update urutan timeline')
      // Reload to restore correct order
      loadTimeline()
    }
  }

  // Calculate end time
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  // ============================================
  // Loading State
  // ============================================

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  // ============================================
  // Empty State
  // ============================================

  if (timeline.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Timeline / Rundown</h3>
            <p className="text-sm text-muted-foreground">
              Atur jadwal acara dari awal hingga akhir
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onApplyTemplate) {
                  onApplyTemplate()
                }
              }}
            >
              Apply Template
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (onAddItem) {
                  onAddItem()
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada timeline</h3>
            <p className="text-muted-foreground mb-4">
              Mulai buat timeline acara atau gunakan template yang sudah ada
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Browse Templates button clicked')
                  if (onApplyTemplate) {
                    onApplyTemplate()
                  }
                }}
              >
                Browse Templates
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Buat Timeline Pertama button clicked')
                  if (onAddItem) {
                    onAddItem()
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Timeline Pertama
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Timeline / Rundown</h3>
          <p className="text-sm text-muted-foreground">
            {stats?.total_items || 0} items • Total durasi: {stats?.total_duration_minutes || 0} menit
          </p>
        </div>
        <div className="flex gap-2">
          {liveMode && (
            <Badge variant="default" className="animate-pulse">
              Live Mode
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('[HEADER] Apply Template button clicked')
              if (onApplyTemplate) {
                onApplyTemplate()
              }
            }}
          >
            Apply Template
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('[HEADER] Add Item button clicked')
              if (onAddItem) {
                onAddItem()
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      {stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {stats.completed_items}/{stats.total_items} selesai ({stats.completion_percentage}%)
                </span>
              </div>
              <Progress value={stats.completion_percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Estimasi selesai: {stats.estimated_end_time}</span>
                <span>
                  {stats.items_without_pic > 0 &&
                    `${stats.items_without_pic} item belum ada PIC`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Items with Drag-Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timeline-items">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {timeline.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        transition-all duration-200
                        ${item.is_completed ? 'opacity-60' : ''}
                        ${liveMode && item.is_completed ? 'bg-green-50 dark:bg-green-950/20' : ''}
                        ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex-shrink-0 mt-1 cursor-move text-muted-foreground hover:text-foreground"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* Completion Checkbox */}
                          <button
                            onClick={() => handleToggleComplete(item)}
                            className="flex-shrink-0 mt-1"
                            disabled={!liveMode}
                          >
                            {item.is_completed ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title and Time */}
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <h4
                                  className={`font-medium ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="text-sm font-medium">
                                    {item.start_time.substring(0, 5)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {calculateEndTime(item.start_time, item.duration_minutes)}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {item.duration_minutes}m
                                </Badge>
                              </div>
                            </div>

                            {/* PIC and Vendor Info */}
                            {(item.pic_name || item.vendor) && (
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                {item.pic_name && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>{item.pic_name}</span>
                                  </div>
                                )}
                                {item.pic_phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{item.pic_phone}</span>
                                  </div>
                                )}
                                {item.vendor && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.vendor.name}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Notes (if any) */}
                            {item.notes && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                <div className="flex items-start gap-1">
                                  <FileText className="w-3 h-3 mt-0.5" />
                                  <span>{item.notes}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(item)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
