'use client'

import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define interface based on our needs
interface TimelineGanttProps {
  items: any[] // TODO: Replace 'any' with strict type from database.types.ts later
}

export function TimelineGantt({ items }: TimelineGanttProps) {
  const { theme } = useTheme()
  const [view, setView] = useState<ViewMode>(ViewMode.Week)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (items && items.length > 0) {
      // Transform your DB data to Gantt Task format here
      const formattedTasks: Task[] = items.map((item, index) => ({
        start: new Date(item.start_date || new Date()),
        end: new Date(item.end_date || new Date()),
        name: item.title || `Task ${index + 1}`,
        id: item.id || `task-${index}`,
        type: 'task',
        progress: item.progress || 0,
        isDisabled: false,
        // Progress colors - let CSS override for dark mode
        styles: { progressColor: '#2563eb', progressSelectedColor: '#1d4ed8' },
      }))
      setTasks(formattedTasks)
    }
  }, [items])

  // Ensure isDark logic is correct
  const isDark = theme === 'dark'

  if (!isMounted) return null

  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-background p-8">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            No timeline items found. Start adding tasks to see the chart.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-1">
        <h3 className="font-medium">Timeline</h3>
        <div className="flex rounded-md border bg-muted p-1 shadow-sm">
          {/* View Mode Switcher Buttons */}
          <button
            onClick={() => setView(ViewMode.Day)}
            className={cn(
              'px-3 py-1 text-xs rounded-sm',
              view === ViewMode.Day && 'bg-background shadow-sm'
            )}
          >
            Day
          </button>
          <button
            onClick={() => setView(ViewMode.Week)}
            className={cn(
              'px-3 py-1 text-xs rounded-sm',
              view === ViewMode.Week && 'bg-background shadow-sm'
            )}
          >
            Week
          </button>
          <button
            onClick={() => setView(ViewMode.Month)}
            className={cn(
              'px-3 py-1 text-xs rounded-sm',
              view === ViewMode.Month && 'bg-background shadow-sm'
            )}
          >
            Month
          </button>
        </div>
      </div>

      {/* CHART CONTAINER */}
      {/* relative group ensures styling isolation */}
      <div className="relative w-full overflow-hidden rounded-xl border bg-background shadow-sm">
        {/* IMPORTANT: This wrapper div forces the background color even if the chart is narrow */}
        <div
          className="h-[500px] w-full overflow-hidden"
          style={{
            backgroundColor: isDark ? 'hsl(var(--background))' : '#ffffff',
          }}
        >
          <Gantt
            tasks={tasks}
            viewMode={view}
            locale="ID"
            listCellWidth={isDark ? '160px' : '160px'}
            columnWidth={65}
            barFill={70}
            // Force colors via props as secondary fallback
            barBackgroundColor={isDark ? '#334155' : '#e2e8f0'}
            barBackgroundSelectedColor={isDark ? '#475569' : '#cbd5e1'}
            // Use transparent here so our CSS overrides take full effect
            todayColor="rgba(0,0,0,0)"
          />
        </div>
      </div>
    </div>
  )
}
