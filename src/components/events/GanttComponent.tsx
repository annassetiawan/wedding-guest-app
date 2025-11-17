'use client'

import { useMemo, useCallback } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import type { GanttTask } from '@/types/gantt'

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface GanttComponentProps {
  tasks: GanttTask[]
  onTaskClick?: (taskId: string) => void
}

/**
 * GanttComponent - Using react-big-calendar
 * Professional timeline with drag-and-drop and scrolling support
 */
export function GanttComponent({ tasks, onTaskClick }: GanttComponentProps) {
  // Transform tasks to react-big-calendar events
  const events = useMemo(() => {
    return tasks.map((task) => {
      // Parse dates
      const startDate = new Date(task.start.replace(' ', 'T'))
      const endDate = new Date(task.end.replace(' ', 'T'))

      return {
        id: task.id,
        title: task.name,
        start: startDate,
        end: endDate,
        resource: {
          completed: task.custom_class === 'gantt-completed',
          progress: task.progress,
        }
      }
    })
  }, [tasks])

  // Get date range from tasks
  const { minDate, maxDate } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date()
      return {
        minDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0),
        maxDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      }
    }

    const dates = tasks.flatMap(task => [
      new Date(task.start.replace(' ', 'T')),
      new Date(task.end.replace(' ', 'T'))
    ])

    const min = new Date(Math.min(...dates.map(d => d.getTime())))
    const max = new Date(Math.max(...dates.map(d => d.getTime())))

    return {
      minDate: new Date(min.getFullYear(), min.getMonth(), min.getDate(), 0, 0, 0),
      maxDate: new Date(max.getFullYear(), max.getMonth(), max.getDate(), 23, 59, 59)
    }
  }, [tasks])

  // Event style getter
  const eventStyleGetter = useCallback((event: any) => {
    const isCompleted = event.resource?.completed

    return {
      style: {
        backgroundColor: isCompleted ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
        borderColor: isCompleted ? 'hsl(var(--muted-foreground) / 0.3)' : 'hsl(var(--primary))',
        color: isCompleted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary-foreground))',
        borderRadius: '6px',
        border: '1px solid',
        opacity: isCompleted ? 0.7 : 1,
        fontSize: '12px',
        fontWeight: 500,
      }
    }
  }, [])

  // Handle event click
  const handleSelectEvent = useCallback((event: any) => {
    if (onTaskClick) {
      onTaskClick(event.id)
    }
  }, [onTaskClick])

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No tasks to display
      </div>
    )
  }

  return (
    <div className="rbc-calendar-wrapper">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}

        // Use Day view to show single day timeline
        defaultView={Views.DAY}
        views={[Views.DAY]}

        // Default date from first task
        defaultDate={minDate}

        // Time slots configuration
        step={30} // 30-minute intervals
        timeslots={1} // 1 slot per step
        min={minDate}
        max={maxDate}

        // Event handlers
        onSelectEvent={handleSelectEvent}

        // Custom styling
        eventPropGetter={eventStyleGetter}

        // Toolbar (hide it for cleaner look)
        toolbar={false}

        // Time format
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }: any) => {
            return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
          },
          dayHeaderFormat: (date: Date) => moment(date).format('dddd, DD MMMM YYYY'),
        }}
      />

      <style jsx global>{`
        .rbc-calendar-wrapper {
          width: 100%;
          min-height: 500px;
        }

        /* React Big Calendar Base Styles */
        .rbc-calendar {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
          font-family: inherit;
          background-color: transparent;
        }

        /* Header */
        .rbc-header {
          background-color: hsl(var(--muted) / 0.5);
          border-bottom: 1px solid hsl(var(--border));
          color: hsl(var(--muted-foreground));
          font-weight: 600;
          font-size: 13px;
          padding: 8px;
        }

        .rbc-header + .rbc-header {
          border-left: 1px solid hsl(var(--border));
        }

        /* Time Gutter (left column with times) */
        .rbc-time-gutter {
          background-color: transparent;
          color: hsl(var(--foreground));
          font-size: 12px;
        }

        .rbc-label {
          padding: 4px 8px;
          font-weight: 500;
        }

        /* Time slots */
        .rbc-time-slot {
          border-top: 1px solid hsl(var(--border));
        }

        .rbc-time-content {
          border-top: 1px solid hsl(var(--border));
        }

        .rbc-day-slot {
          background-color: transparent;
        }

        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.3);
        }

        .rbc-timeslot-group {
          border-left: 1px solid hsl(var(--border));
          min-height: 40px;
        }

        /* Events */
        .rbc-event {
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          padding: 2px 5px;
        }

        .rbc-event:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .rbc-event-label {
          font-size: 11px;
          font-weight: 400;
        }

        .rbc-event-content {
          font-size: 12px;
          font-weight: 500;
        }

        /* Current time indicator */
        .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
          height: 2px;
        }

        .rbc-current-time-indicator::before {
          background-color: hsl(var(--primary));
          width: 8px;
          height: 8px;
          border-radius: 50%;
          content: '';
          display: block;
          position: absolute;
          left: -4px;
          top: -3px;
        }

        /* Scrollbars */
        .rbc-time-content::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .rbc-time-content::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.3);
          border-radius: 5px;
        }

        .rbc-time-content::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.4);
          border-radius: 5px;
          border: 2px solid hsl(var(--muted) / 0.3);
        }

        .rbc-time-content::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.6);
        }

        /* Dark mode support */
        .dark .rbc-calendar {
          border-color: hsl(var(--border));
        }

        .dark .rbc-header {
          background-color: hsl(var(--muted) / 0.5);
          border-bottom-color: hsl(var(--border));
          color: hsl(var(--muted-foreground));
        }

        .dark .rbc-header + .rbc-header {
          border-left-color: hsl(var(--border));
        }

        .dark .rbc-time-gutter {
          background-color: transparent;
          color: hsl(var(--foreground));
        }

        .dark .rbc-time-slot {
          border-top-color: hsl(var(--border));
        }

        .dark .rbc-time-content {
          border-top-color: hsl(var(--border));
        }

        .dark .rbc-day-slot .rbc-time-slot {
          border-top-color: hsl(var(--border) / 0.3);
        }

        .dark .rbc-timeslot-group {
          border-left-color: hsl(var(--border));
        }

        .dark .rbc-event {
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
        }

        .dark .rbc-event:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .dark .rbc-time-content::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.2);
        }

        .dark .rbc-time-content::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.5);
          border-color: hsl(var(--muted) / 0.2);
        }

        .dark .rbc-time-content::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.7);
        }
      `}</style>
    </div>
  )
}
