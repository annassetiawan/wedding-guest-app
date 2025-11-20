'use client'

import { useMemo } from 'react'
import { CustomTimeline } from './CustomTimeline'
import type { EventTimelineWithVendor } from '@/types/timeline.types'

interface GanttWrapperProps {
  timeline: EventTimelineWithVendor[]
  onTaskClick?: (taskId: string) => void
}

/**
 * GanttWrapper - Wrapper component that prepares data for CustomTimeline
 * Handles data transformation from EventTimelineWithVendor to CustomTimeline format
 */
export function GanttWrapper({ timeline, onTaskClick }: GanttWrapperProps) {
  // Transform timeline data to vendors and tasks format
  const { vendors, tasks } = useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return { vendors: [], tasks: [] }
    }

    // Extract unique vendors from timeline items
    const vendorMap = new Map<string, { id: string; name: string; role: string }>()

    // Add default "No Vendor" entry for items without vendor
    vendorMap.set('no-vendor', {
      id: 'no-vendor',
      name: 'No Vendor Assigned',
      role: 'Unassigned',
    })

    timeline.forEach((item) => {
      if (item.vendor && item.pic_vendor_id) {
        if (!vendorMap.has(item.pic_vendor_id)) {
          vendorMap.set(item.pic_vendor_id, {
            id: item.pic_vendor_id,
            name: item.vendor.name,
            role: item.pic_name || 'Contact',
          })
        }
      } else if (item.pic_name) {
        // Use PIC name as vendor if no vendor relation
        const picId = `pic-${item.pic_name.toLowerCase().replace(/\s+/g, '-')}`
        if (!vendorMap.has(picId)) {
          vendorMap.set(picId, {
            id: picId,
            name: item.pic_name,
            role: 'PIC',
          })
        }
      }
    })

    const vendorsList = Array.from(vendorMap.values())

    // Convert timeline items to tasks
    const tasksList = timeline.map((item) => {
      // Calculate end time
      const startTime = item.start_time.substring(0, 5) // HH:MM from HH:MM:SS
      const [hours, minutes] = startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + item.duration_minutes
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

      // Determine vendor ID
      let vendorId = 'no-vendor'
      if (item.pic_vendor_id) {
        vendorId = item.pic_vendor_id
      } else if (item.pic_name) {
        vendorId = `pic-${item.pic_name.toLowerCase().replace(/\s+/g, '-')}`
      }

      // Map hex color to Tailwind class
      const getTailwindColor = (hexColor: string) => {
        const colorMap: Record<string, string> = {
          '#3b82f6': 'bg-blue-500',
          '#10b981': 'bg-green-500',
          '#f59e0b': 'bg-amber-500',
          '#ef4444': 'bg-red-500',
          '#8b5cf6': 'bg-purple-500',
          '#ec4899': 'bg-pink-500',
          '#6366f1': 'bg-indigo-500',
          '#6b7280': 'bg-gray-500',
        }
        return colorMap[hexColor] || 'bg-primary'
      }

      return {
        id: item.id,
        vendorId,
        title: item.title,
        startTime,
        endTime,
        color: getTailwindColor(item.color),
      }
    })

    return { vendors: vendorsList, tasks: tasksList }
  }, [timeline])

  if (!timeline || timeline.length === 0) {
    return null
  }

  return (
    <div>
      <CustomTimeline vendors={vendors} tasks={tasks} />

      {/* Task Count */}
      {tasks.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''} across {vendors.length}{' '}
          vendor{vendors.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
