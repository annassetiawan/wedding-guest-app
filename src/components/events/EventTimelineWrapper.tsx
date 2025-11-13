'use client'

import { useState } from 'react'
import { EventTimeline } from './EventTimeline'
import { TimelineItemDialog } from './TimelineItemDialog'
import { ApplyTemplateDialog } from './ApplyTemplateDialog'
import type { EventTimelineWithVendor } from '@/types/timeline.types'

interface EventTimelineWrapperProps {
  eventId: string
  eventDate: string
  userId: string
}

/**
 * Wrapper component that renders EventTimeline and its dialogs
 * This is necessary because dialogs need to be rendered OUTSIDE of TabsContent
 * to avoid being hidden by CSS display:none
 */
export function EventTimelineWrapper({
  eventId,
  eventDate,
  userId,
}: EventTimelineWrapperProps) {
  // Dialog states (lifted to this wrapper)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [editItemOpen, setEditItemOpen] = useState(false)
  const [applyTemplateOpen, setApplyTemplateOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<EventTimelineWithVendor | null>(null)
  const [timelineLength, setTimelineLength] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEdit = (item: EventTimelineWithVendor) => {
    setSelectedItem(item)
    setEditItemOpen(true)
  }

  const handleAddItem = () => {
    setAddItemOpen(true)
  }

  const handleApplyTemplate = () => {
    setApplyTemplateOpen(true)
  }

  return (
    <>
      {/* Timeline Component */}
      <EventTimeline
        eventId={eventId}
        eventDate={eventDate}
        userId={userId}
        onAddItem={handleAddItem}
        onEditItem={handleEdit}
        onApplyTemplate={handleApplyTemplate}
        onTimelineChange={setTimelineLength}
        refreshTrigger={refreshTrigger}
      />

      {/* Dialogs - Rendered at wrapper level (outside TabsContent) */}
      <TimelineItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        onSuccess={handleRefresh}
        eventId={eventId}
        userId={userId}
        nextDisplayOrder={timelineLength}
      />

      <TimelineItemDialog
        open={editItemOpen}
        onOpenChange={setEditItemOpen}
        onSuccess={handleRefresh}
        eventId={eventId}
        userId={userId}
        item={selectedItem}
        nextDisplayOrder={timelineLength}
      />

      <ApplyTemplateDialog
        open={applyTemplateOpen}
        onOpenChange={setApplyTemplateOpen}
        onSuccess={handleRefresh}
        eventId={eventId}
        userId={userId}
      />
    </>
  )
}
