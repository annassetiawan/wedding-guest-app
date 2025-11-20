'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types
type Vendor = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
};

type Task = {
  id: string;
  vendorId: string;
  title: string;
  startTime: string; // "HH:MM" format
  endTime: string;   // "HH:MM" format
  color?: string;    // Tailwind bg class
};

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 to 21:00

// Helper to calculate position
const getPositionStyle = (start: string, end: string, startHour = 7) => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startTotalMinutes = (startH - startHour) * 60 + startM;
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

  // Assuming 1 hour = 120px column width
  const pixelsPerMinute = 120 / 60;

  return {
    left: `${startTotalMinutes * pixelsPerMinute}px`,
    width: `${durationMinutes * pixelsPerMinute}px`
  };
};

interface CustomTimelineProps {
  vendors?: Vendor[];
  tasks?: Task[];
  className?: string;
}

export function CustomTimeline({ vendors: propVendors, tasks: propTasks, className }: CustomTimelineProps = {}) {
  // PRIORITY: Use database data from props if provided (via GanttWrapper)
  // FALLBACK: Use dummy data only for standalone testing/preview
  const vendors: Vendor[] = propVendors && propVendors.length > 0
    ? propVendors
    : [
        { id: 'v1', name: 'Lumina Photography', role: 'Photographer' },
        { id: 'v2', name: 'Berkah Catering', role: 'Catering' },
        { id: 'v3', name: 'Melody Band', role: 'Music' },
        { id: 'v4', name: 'Cantika Makeup', role: 'MUA' },
      ];

  const tasks: Task[] = propTasks && propTasks.length > 0
    ? propTasks
    : [
        { id: 't1', vendorId: 'v1', title: 'Foto Akad', startTime: '08:00', endTime: '10:00', color: 'bg-blue-500' },
        { id: 't2', vendorId: 'v1', title: 'Foto Resepsi', startTime: '11:00', endTime: '13:00', color: 'bg-blue-500' },
        { id: 't3', vendorId: 'v2', title: 'Setup Buffet', startTime: '09:30', endTime: '11:00', color: 'bg-orange-500' },
        { id: 't4', vendorId: 'v3', title: 'Check Sound', startTime: '09:00', endTime: '10:00', color: 'bg-purple-500' },
        { id: 't5', vendorId: 'v4', title: 'Makeup CPW', startTime: '07:00', endTime: '09:00', color: 'bg-pink-500' },
      ];

  // Development mode: Log data source for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('CustomTimeline data source:', {
      usingDatabaseData: !!(propVendors && propVendors.length > 0),
      vendorCount: vendors.length,
      taskCount: tasks.length,
    });
  }

  return (
    <div className={cn("w-full rounded-xl border bg-background shadow-sm flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex border-b bg-muted/40">
        <div className="w-[200px] shrink-0 p-4 font-medium border-r text-sm">
          Vendor List
        </div>
        <ScrollArea className="flex-1">
          <div className="flex" style={{ width: `${HOURS.length * 120}px` }}>
            {HOURS.map(hour => (
              <div key={hour} className="w-[120px] shrink-0 p-3 text-xs font-medium text-muted-foreground border-r border-dashed last:border-0">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Vendors) */}
        <div className="w-[200px] shrink-0 border-r bg-card z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
          {vendors.map(vendor => (
            <div key={vendor.id} className="h-[80px] flex items-center gap-3 p-4 border-b hover:bg-muted/50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{vendor.name.substring(0,2)}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium leading-none">{vendor.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{vendor.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Grid area */}
        <ScrollArea className="flex-1 bg-background">
          <div className="relative" style={{ width: `${HOURS.length * 120}px` }}>

            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {HOURS.map(hour => (
                <div key={hour} className="w-[120px] shrink-0 border-r border-dashed border-border/50 h-full" />
              ))}
            </div>

            {/* Rows & Tasks */}
            {vendors.map(vendor => {
              const vendorTasks = tasks.filter(t => t.vendorId === vendor.id);
              return (
                <div key={vendor.id} className="h-[80px] w-full border-b border-border/50 relative group">
                  {/* Hover highlight for row */}
                  <div className="absolute inset-0 bg-muted/0 group-hover:bg-muted/20 transition-colors" />

                  {vendorTasks.map(task => {
                    const style = getPositionStyle(task.startTime, task.endTime);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "absolute top-4 h-12 rounded-md px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90 hover:scale-[1.01] cursor-pointer z-10 flex items-center",
                          task.color || "bg-primary"
                        )}
                        style={style}
                      >
                        <div className="truncate">
                          <span className="block font-semibold">{task.title}</span>
                          <span className="opacity-90 text-[10px]">{task.startTime} - {task.endTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
