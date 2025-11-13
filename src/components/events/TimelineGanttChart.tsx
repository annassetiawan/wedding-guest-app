'use client'

import { useState, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import type { EventTimelineWithVendor } from '@/types/timeline.types'
import {
  Clock,
  GripVertical,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  User,
  Phone,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface TimelineGanttChartProps {
  timeline: EventTimelineWithVendor[]
  liveMode: boolean
  onDragEnd: (result: DropResult) => void
  onEdit: (item: EventTimelineWithVendor) => void
  onDelete: (item: EventTimelineWithVendor) => void
  onToggleComplete: (item: EventTimelineWithVendor) => void
}

/**
 * Calculate time slot position for Gantt chart
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function TimelineGanttChart({
  timeline,
  liveMode,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleComplete,
}: TimelineGanttChartProps) {
  // Calculate time range for Gantt chart
  const { startTime, endTime, totalMinutes } = useMemo(() => {
    if (timeline.length === 0) {
      return { startTime: 0, endTime: 24 * 60, totalMinutes: 24 * 60 }
    }

    const times = timeline.map((item) => {
      const start = timeToMinutes(item.start_time)
      const end = start + item.duration_minutes
      return { start, end }
    })

    const minStart = Math.min(...times.map((t) => t.start))
    const maxEnd = Math.max(...times.map((t) => t.end))

    // Add padding
    const paddedStart = Math.max(0, minStart - 60) // 1 hour padding before
    const paddedEnd = Math.min(24 * 60, maxEnd + 60) // 1 hour padding after

    return {
      startTime: paddedStart,
      endTime: paddedEnd,
      totalMinutes: paddedEnd - paddedStart,
    }
  }, [timeline])

  // Generate time markers (every hour)
  const timeMarkers = useMemo(() => {
    const markers: { time: string; position: number }[] = []
    const startHour = Math.floor(startTime / 60)
    const endHour = Math.ceil(endTime / 60)

    for (let hour = startHour; hour <= endHour; hour++) {
      const minutes = hour * 60
      const position = ((minutes - startTime) / totalMinutes) * 100
      markers.push({
        time: minutesToTime(minutes),
        position,
      })
    }

    return markers
  }, [startTime, endTime, totalMinutes])

  // Calculate position for each timeline item
  const getItemPosition = (item: EventTimelineWithVendor) => {
    const itemStart = timeToMinutes(item.start_time)
    const left = ((itemStart - startTime) / totalMinutes) * 100
    const width = (item.duration_minutes / totalMinutes) * 100

    return { left, width }
  }

  // Show empty state if no timeline items
  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No timeline items to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Time axis */}
      <div className="relative h-8 border-b">
        {timeMarkers.map((marker, index) => (
          <div
            key={index}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${marker.position}%` }}
          >
            <div className="h-2 w-px bg-border" />
            <span className="text-xs text-muted-foreground mt-1">
              {marker.time}
            </span>
          </div>
        ))}
      </div>

      {/* Gantt chart bars */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="gantt-timeline">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 min-h-[200px] relative"
            >
              {timeline.map((item, index) => {
                const { left, width } = getItemPosition(item)

                return (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'relative h-20 mb-1',
                          snapshot.isDragging && 'opacity-50'
                        )}
                      >
                        {/* Gantt bar */}
                        <Card
                          className={cn(
                            'absolute h-full transition-all cursor-pointer hover:shadow-lg',
                            item.is_completed && 'opacity-60'
                          )}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            minWidth: '80px',
                            backgroundColor: item.color + '20',
                            borderColor: item.color,
                          }}
                        >
                          <CardContent className="p-3 h-full flex items-center gap-2">
                            {/* Drag handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move text-muted-foreground hover:text-foreground"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Completion checkbox */}
                            {liveMode && (
                              <button
                                onClick={() => onToggleComplete(item)}
                                className="flex-shrink-0"
                              >
                                {item.is_completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                )}
                              </button>
                            )}

                            {/* Item content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 flex-shrink-0" style={{ color: item.color }} />
                                <span className="font-medium text-sm truncate">
                                  {item.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{item.start_time}</span>
                                <span>•</span>
                                <span>{item.duration_minutes} min</span>
                                {item.pic_name && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span className="truncate">{item.pic_name}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Actions menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <GripVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(item)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(item)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3" />
          <span>Drag to reorder</span>
        </div>
        {liveMode && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Click to mark complete</span>
          </div>
        )}
      </div>
    </div>
  )
}
