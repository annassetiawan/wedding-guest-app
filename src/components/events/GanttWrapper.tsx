'use client'

import { useMemo } from 'react'
import { TimelineGantt } from './TimelineGantt'
import type { EventTimelineWithVendor } from '@/types/timeline.types'
import { Card, CardContent } from '@/components/ui/card'

interface GanttWrapperProps {
  timeline: EventTimelineWithVendor[]
  onTaskClick?: (taskId: string) => void
}

/**
 * GanttWrapper - Wrapper component that prepares data for Gantt chart
 * Handles data transformation using gantt-task-react library
 */
export function GanttWrapper({ timeline, onTaskClick }: GanttWrapperProps) {
  // Convert timeline items to format required by TimelineGantt component
  const ganttItems = useMemo(() => {
    if (!timeline || timeline.length === 0) return []

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const baseDate = `${year}-${month}-${day}`

    return timeline.map((item, index) => {
      // Parse start time
      const timeParts = item.start_time.split(':')
      const hours = String(timeParts[0] || '00').padStart(2, '0')
      const minutes = String(timeParts[1] || '00').padStart(2, '0')

      // Create start date
      const startDate = new Date(`${baseDate}T${hours}:${minutes}:00`)

      // Calculate end date
      const endDate = new Date(startDate.getTime() + (item.duration_minutes * 60 * 1000))

      return {
        id: item.id,
        title: item.title || `Task ${index + 1}`,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        progress: item.is_completed ? 100 : 0,
      }
    })
  }, [timeline])

  if (!timeline || timeline.length === 0) {
    return null
  }

  return (
    <div>
      <TimelineGantt items={ganttItems} />

      {/* Task Count */}
      {ganttItems.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          Showing {ganttItems.length} task{ganttItems.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
