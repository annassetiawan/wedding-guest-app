'use client'

import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

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
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Timeline</h3>
        <div className="flex items-center rounded-md border bg-muted p-1">
          <Button
            variant={view === ViewMode.Day ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView(ViewMode.Day)}
            className="h-7 px-3 text-xs"
          >
            Day
          </Button>
          <Button
            variant={view === ViewMode.Week ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView(ViewMode.Week)}
            className="h-7 px-3 text-xs"
          >
            Week
          </Button>
          <Button
            variant={view === ViewMode.Month ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView(ViewMode.Month)}
            className="h-7 px-3 text-xs"
          >
            Month
          </Button>
        </div>
      </div>

      {/* CHART WRAPPER - This fixes the 'cut off' look */}
      <div className="w-full overflow-hidden rounded-xl border bg-background shadow-sm">
        {/* Force a dark background on this specific div to blend with the chart */}
        <div className="h-[500px] w-full overflow-auto bg-background dark:bg-background">
          <Gantt
            tasks={tasks}
            viewMode={view}
            listCellWidth="160px"
            columnWidth={65}
            headerHeight={60}
            barBackgroundColor={isDark ? '#334155' : '#e2e8f0'}
            barBackgroundSelectedColor={isDark ? '#475569' : '#cbd5e1'}
            arrowColor={isDark ? '#94a3b8' : '#64748b'}
            fontColor={isDark ? '#f8fafc' : '#1e293b'}
            todayColor={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
          />
        </div>
      </div>
    </div>
  )
}
