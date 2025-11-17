'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveEvent } from '@/contexts/EventContext'
import { eventService, Event } from '@/lib/services/events'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { EventTimelineWrapper } from '@/components/events/EventTimelineWrapper'

// Import layout components
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'

export default function EventTimelinePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveEvent } = useActiveEvent()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEventData()
  }, [eventId, user])

  const loadEventData = async () => {
    try {
      setLoading(true)
      const eventData = await eventService.getEventById(eventId)
      setEvent(eventData)
      setActiveEvent(eventId, eventData)
    } catch (error: any) {
      console.error('Error loading event:', error)
      toast.error(error.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!event || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title="Event Timeline"
        subtitle={`Manage rundown and timeline for ${event.event_name}`}
      />

      {/* Timeline Component */}
      <EventTimelineWrapper
        eventId={event.id}
        eventDate={event.event_date}
        userId={user.id}
      />
    </PageLayout>
  )
}
