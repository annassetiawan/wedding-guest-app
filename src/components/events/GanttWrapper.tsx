'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { EventTimelineWithVendor } from '@/types/timeline.types'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Dynamic import GanttComponent with SSR disabled
const GanttComponent = dynamic(
  () => import('./GanttComponent').then(mod => ({ default: mod.GanttComponent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
)

interface GanttWrapperProps {
  timeline: EventTimelineWithVendor[]
  onTaskClick?: (taskId: string) => void
}

/**
 * GanttWrapper - Wrapper component that prepares data for Gantt chart
 * Handles data transformation and view mode state
 */
export function GanttWrapper({ timeline, onTaskClick }: GanttWrapperProps) {
  // No viewMode needed for react-calendar-timeline

  // Convert timeline items to Gantt task format
  const ganttTasks = useMemo(() => {
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

      const startDateTime = `${baseDate} ${hours}:${minutes}`

      // Calculate end time
      const startMs = new Date(`${baseDate}T${hours}:${minutes}:00`).getTime()
      const endMs = startMs + (item.duration_minutes * 60 * 1000)
      const endDate = new Date(endMs)
      const endHours = String(endDate.getHours()).padStart(2, '0')
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
      const endDay = String(endDate.getDate()).padStart(2, '0')
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0')
      const endYear = endDate.getFullYear()
      const endDateTime = `${endYear}-${endMonth}-${endDay} ${endHours}:${endMinutes}`

      return {
        id: item.id,
        name: item.title || `Task ${index + 1}`,
        start: startDateTime,
        end: endDateTime,
        progress: item.is_completed ? 100 : 0,
        custom_class: item.is_completed ? 'gantt-completed' : '',
      }
    })
  }, [timeline])

  if (!timeline || timeline.length === 0) {
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Gantt Chart - Load dynamically (client-side only) */}
        {ganttTasks.length > 0 && (
          <GanttComponent
            tasks={ganttTasks}
            onTaskClick={onTaskClick}
          />
        )}

        {/* Task Count */}
        {ganttTasks.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Showing {ganttTasks.length} task{ganttTasks.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>

      {/* Gantt Styles */}
      <style jsx global>{`
        /* Gantt Wrapper */
        .gantt-wrapper {
          font-family: inherit !important;
          position: relative;
        }

        /* Gantt Container (created by Frappe Gantt) */
        .gantt-container {
          position: relative !important;
          overflow: auto !important;
          width: 100% !important;
        }

        .gantt-container svg {
          display: block;
          width: 100%;
          height: auto;
          min-height: 400px;
        }

        /* Gantt SVG */
        .gantt {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Bars */
        .gantt .bar {
          fill: hsl(var(--primary)) !important;
          stroke: hsl(var(--primary)) !important;
          stroke-width: 0 !important;
          opacity: 0.8;
          transition: opacity 0.2s;
          cursor: pointer;
        }

        .gantt .bar:hover {
          opacity: 1;
        }

        .gantt .bar-progress {
          fill: hsl(var(--primary)) !important;
          opacity: 1;
        }

        .gantt .bar-wrapper {
          cursor: pointer;
        }

        .gantt .bar-wrapper:hover .bar {
          fill: hsl(var(--primary) / 0.9) !important;
        }

        /* Bar Labels */
        .gantt .bar-label {
          fill: hsl(var(--primary-foreground)) !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          pointer-events: none;
        }

        /* Grid */
        .gantt .grid {
          user-select: none;
        }

        .gantt .grid-background {
          fill: hsl(var(--background)) !important;
        }

        .gantt .grid-header {
          fill: hsl(var(--muted)) !important;
          stroke: hsl(var(--border)) !important;
          stroke-width: 1.4;
        }

        .gantt .grid-row {
          fill: hsl(var(--muted) / 0.3) !important;
        }

        .gantt .grid-row:nth-child(even) {
          fill: hsl(var(--muted) / 0.1) !important;
        }

        .gantt .row-line {
          stroke: hsl(var(--border)) !important;
        }

        .gantt .grid-tick {
          stroke: hsl(var(--border)) !important;
          stroke-width: 0.5;
        }

        /* Today Highlight */
        .gantt .today-highlight {
          fill: hsl(var(--primary) / 0.1) !important;
          stroke: hsl(var(--primary)) !important;
          stroke-width: 1;
        }

        /* Arrows (Dependencies) */
        .gantt .arrow {
          fill: none;
          stroke: hsl(var(--muted-foreground)) !important;
          stroke-width: 1.4;
        }

        /* Text */
        .gantt text {
          fill: hsl(var(--foreground)) !important;
          font-family: inherit;
        }

        .gantt .lower-text,
        .gantt .upper-text {
          fill: hsl(var(--muted-foreground)) !important;
          font-size: 11px;
        }

        .gantt .upper-text {
          font-weight: 500;
        }

        /* Handle */
        .gantt .handle {
          fill: hsl(var(--primary)) !important;
          cursor: ew-resize;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .gantt .bar-wrapper:hover .handle {
          opacity: 1;
        }

        /* Popup */
        .gantt .popup-wrapper {
          background: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          color: hsl(var(--popover-foreground));
          font-size: 13px;
        }

        .gantt .popup-wrapper .title {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .gantt .popup-wrapper .subtitle {
          color: hsl(var(--muted-foreground));
          margin-bottom: 4px;
        }

        /* Dark mode support */
        .dark .gantt .bar {
          opacity: 0.9;
        }

        .dark .gantt .popup-wrapper {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
        }

        /* Completed tasks styling */
        .gantt .bar.gantt-completed {
          fill: hsl(var(--muted)) !important;
          stroke: hsl(var(--muted)) !important;
          opacity: 0.5;
        }

        .gantt .bar.gantt-completed .bar-label {
          fill: hsl(var(--muted-foreground)) !important;
          text-decoration: line-through;
        }

        /* Date highlight */
        .gantt .date-highlight {
          fill: hsl(var(--accent)) !important;
          opacity: 0.8;
        }
      `}</style>
    </Card>
  )
}
