'use client'

import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimelineGanttProps {
  items: any[];
  className?: string;
}

export function TimelineGantt({ items, className }: TimelineGanttProps) {
  const { theme } = useTheme();
  const [view, setView] = useState<ViewMode>(ViewMode.Week);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      const formattedTasks: Task[] = items.map((item, index) => ({
        start: new Date(item.start_date || new Date()),
        end: new Date(item.end_date || new Date()),
        name: item.title || `Task ${index + 1}`,
        id: item.id || `task-${index}`,
        type: 'task',
        progress: item.progress || 0,
        isDisabled: false,
        styles: {
          progressColor: '#3b82f6', // blue-500
          progressSelectedColor: '#2563eb', // blue-600
        },
      }));
      setTasks(formattedTasks);
    }
  }, [items]);

  const isDark = theme === 'dark';

  // THE NUCLEAR FIX: Inject CSS directly here to override library defaults
  // We make rows transparent so the container background shows through
  const customStyles = `
    /* Force container to be transparent so wrapper color shows */
    .gantt-container,
    .gantt-vertical-scroll-container,
    .horizontal-scroll {
      background-color: transparent !important;
      border: none !important;
    }

    /* DARK MODE SPECIFIC OVERRIDES */
    .dark-gantt-wrapper .grid-row {
      fill: transparent !important; /* Key fix: Transparency lets background show */
    }
    .dark-gantt-wrapper .grid-row:nth-child(even) {
      fill: rgba(255, 255, 255, 0.03) !important; /* Very subtle stripe */
    }
    .dark-gantt-wrapper .calendar-header rect {
      fill: transparent !important;
    }
    .dark-gantt-wrapper .calendar-header text {
      fill: #94a3b8 !important; /* slate-400 */
    }
    .dark-gantt-wrapper .grid-line {
      stroke: #334155 !important; /* slate-700 */
    }
    .dark-gantt-wrapper .calendar-top-tick,
    .dark-gantt-wrapper .calendar-bottom-tick {
      stroke: #334155 !important;
    }

    /* Task List (Left Side) */
    .dark-gantt-wrapper .task-list-header {
      background-color: #1e293b !important; /* slate-800 */
      color: #f8fafc !important;
    }
    .dark-gantt-wrapper .task-list-item {
      background-color: #020817 !important; /* slate-950 (background) */
      color: #f8fafc !important;
    }
    .dark-gantt-wrapper .task-list-item:nth-child(even) {
      background-color: #0f172a !important; /* slate-900 */
    }
  `;

  if (!isMounted) return <div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />;

  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-muted-foreground">
        <p>Belum ada timeline item.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <style>{customStyles}</style>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Timeline</h3>
        <div className="flex rounded-md border bg-muted p-1">
          <button onClick={() => setView(ViewMode.Day)} className={cn("px-3 py-1 text-xs rounded-sm transition-all", view === ViewMode.Day && "bg-background shadow-sm")}>Day</button>
          <button onClick={() => setView(ViewMode.Week)} className={cn("px-3 py-1 text-xs rounded-sm transition-all", view === ViewMode.Week && "bg-background shadow-sm")}>Week</button>
          <button onClick={() => setView(ViewMode.Month)} className={cn("px-3 py-1 text-xs rounded-sm transition-all", view === ViewMode.Month && "bg-background shadow-sm")}>Month</button>
        </div>
      </div>

      {/* WRAPPER FIX:
        We force bg-background (black in dark mode) here.
        Since grid rows are transparent, they will show this black background.
        Even if the chart ends early, the rest of this div is black.
      */}
      <div className={cn(
        "w-full overflow-hidden rounded-xl border shadow-sm",
        isDark ? "bg-[#020817] dark-gantt-wrapper" : "bg-white"
      )}>
        <div className="h-[500px] w-full overflow-hidden">
          <Gantt
            tasks={tasks}
            viewMode={view}
            locale="ID"
            columnWidth={65}
            listCellWidth="160px"
            barFill={70}
            // We pass transparent/dummy colors because CSS above handles the real look
            barBackgroundColor={isDark ? "#334155" : "#e2e8f0"}
            barBackgroundSelectedColor={isDark ? "#475569" : "#cbd5e1"}
          />
        </div>
      </div>
    </div>
  );
}
