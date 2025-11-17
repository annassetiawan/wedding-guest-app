'use client'

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
  MoreVertical,
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
import { GanttWrapper } from './GanttWrapper'

interface TimelineGanttChartProps {
  timeline: EventTimelineWithVendor[]
  liveMode: boolean
  onDragEnd: (result: DropResult) => void
  onEdit: (item: EventTimelineWithVendor) => void
  onDelete: (item: EventTimelineWithVendor) => void
  onToggleComplete: (item: EventTimelineWithVendor) => void
}

/**
 * TimelineGanttChart - Display timeline items using Frappe Gantt Chart
 */
export function TimelineGanttChart({
  timeline,
  liveMode,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleComplete,
}: TimelineGanttChartProps) {
  // Handle task click from Gantt chart
  const handleTaskClick = (taskId: string) => {
    const item = timeline.find((t) => t.id === taskId)
    if (item) {
      onEdit(item)
    }
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
      {/* Gantt Chart - Using GanttWrapper with dynamic import */}
      <GanttWrapper timeline={timeline} onTaskClick={handleTaskClick} />

      {/* Timeline Items List with Drag & Drop */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Timeline Items</h4>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="gantt-timeline-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {timeline.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'transition-all',
                          item.is_completed && 'opacity-60',
                          liveMode && item.is_completed && 'bg-green-50 dark:bg-green-950/20',
                          snapshot.isDragging && 'shadow-lg ring-2 ring-primary'
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move text-muted-foreground hover:text-foreground"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>

                            {/* Completion Checkbox */}
                            {liveMode && (
                              <button
                                onClick={() => onToggleComplete(item)}
                                className="flex-shrink-0"
                              >
                                {item.is_completed ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                                )}
                              </button>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h4
                                    className={cn(
                                      'font-medium text-sm',
                                      item.is_completed && 'line-through text-muted-foreground'
                                    )}
                                  >
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Time */}
                                  <div className="text-right">
                                    <div className="text-sm font-medium">
                                      {item.start_time.substring(0, 5)}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {item.duration_minutes}m
                                    </Badge>
                                  </div>

                                  {/* Actions */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <MoreVertical className="w-4 h-4" />
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
                                </div>
                              </div>

                              {/* PIC Info */}
                              {(item.pic_name || item.vendor) && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                            </div>
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

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3" />
          <span>Drag to reorder</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Click on Gantt bar to edit</span>
        </div>
        {liveMode && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Click checkbox to mark complete</span>
          </div>
        )}
      </div>
    </div>
  )
}
