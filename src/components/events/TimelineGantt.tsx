'use client'

import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

// Define interface based on our needs
interface TimelineGanttProps {
  items: any[]; // TODO: Replace 'any' with strict type from database.types.ts later
}

export function TimelineGantt({ items }: TimelineGanttProps) {
  const { theme } = useTheme();
  const [view, setView] = useState<ViewMode>(ViewMode.Week);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      // Transform your DB data to Gantt Task format here
      // For now, we assume items are already mapped or map them simply:
      const formattedTasks: Task[] = items.map((item, index) => ({
        start: new Date(item.start_date || new Date()),
        end: new Date(item.end_date || new Date()),
        name: item.title || `Task ${index + 1}`,
        id: item.id || `task-${index}`,
        type: 'task',
        progress: item.progress || 0,
        isDisabled: false,
        styles: { progressColor: '#2563eb', progressSelectedColor: '#1d4ed8' },
      }));
      setTasks(formattedTasks);
    }
  }, [items]);

  // Theme Configuration
  const isDark = theme === 'dark';

  const ganttConfig = {
    headerHeight: 60,
    columnWidth: 65,
    barBackgroundColor: isDark ? '#334155' : '#e2e8f0',
    barBackgroundSelectedColor: isDark ? '#475569' : '#cbd5e1',
    arrowColor: isDark ? '#94a3b8' : '#64748b',
    fontColor: isDark ? '#f8fafc' : '#1e293b',
    backgroundColor: isDark ? '#020817' : '#ffffff',
  };

  if (!isMounted) return null;

  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground">
        No timeline items found. Start adding tasks to see the chart.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-background shadow-sm">
      <div className="flex justify-end p-2 border-b bg-muted/30">
        <select
          className="text-sm border rounded px-2 py-1 bg-background"
          value={view}
          onChange={(e) => setView(e.target.value as ViewMode)}
        >
          <option value={ViewMode.Day}>Day</option>
          <option value={ViewMode.Week}>Week</option>
          <option value={ViewMode.Month}>Month</option>
        </select>
      </div>
      <div className="h-[500px] overflow-auto">
        <Gantt
          tasks={tasks}
          viewMode={view}
          listCellWidth={isDark ? "155px" : "155px"}
          columnWidth={ganttConfig.columnWidth}
          headerHeight={ganttConfig.headerHeight}
          barBackgroundColor={ganttConfig.barBackgroundColor}
          barBackgroundSelectedColor={ganttConfig.barBackgroundSelectedColor}
          arrowColor={ganttConfig.arrowColor}
          fontColor={ganttConfig.fontColor}
          todayColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}
        />
      </div>
    </div>
  );
}
