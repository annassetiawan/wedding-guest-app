'use client'

import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, LayoutGrid } from 'lucide-react'

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
        // Generic progress colors - CSS will override for dark mode
        styles: { progressColor: '#2563eb', progressSelectedColor: '#1d4ed8' },
      }))
      setTasks(formattedTasks)
    }
  }, [items])

  // Theme Configuration - Generic colors, CSS overrides will handle dark mode
  const isDark = theme === 'dark'

  const ganttConfig = {
    headerHeight: 60,
    columnWidth: 65,
    // Generic colors - rely on CSS !important rules for dark mode
    barBackgroundColor: isDark ? '#475569' : '#e2e8f0',
    barBackgroundSelectedColor: isDark ? '#64748b' : '#cbd5e1',
    arrowColor: isDark ? '#94a3b8' : '#64748b',
    fontColor: isDark ? '#f8fafc' : '#1e293b',
    backgroundColor: 'transparent', // Let CSS handle background
  }

  if (!isMounted) return null

  if (tasks.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex h-[200px] items-center justify-center">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No timeline items found. Start adding tasks to see the chart.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-background border">
      {/* Header with View Switcher */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Gantt Chart View</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">View:</span>
            <Select
              value={view}
              onValueChange={(value) => setView(value as ViewMode)}
            >
              <SelectTrigger className="w-[120px] h-8 text-sm">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ViewMode.Day}>Day</SelectItem>
                <SelectItem value={ViewMode.Week}>Week</SelectItem>
                <SelectItem value={ViewMode.Month}>Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {/* Gantt Chart Container */}
      <CardContent className="p-0">
        <div className="w-full h-[500px] overflow-auto bg-background">
          <Gantt
            tasks={tasks}
            viewMode={view}
            listCellWidth="155px"
            columnWidth={ganttConfig.columnWidth}
            headerHeight={ganttConfig.headerHeight}
            barBackgroundColor={ganttConfig.barBackgroundColor}
            barBackgroundSelectedColor={ganttConfig.barBackgroundSelectedColor}
            arrowColor={ganttConfig.arrowColor}
            fontColor={ganttConfig.fontColor}
            todayColor={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
          />
        </div>
      </CardContent>
    </Card>
  )
}
