'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveEvent } from '@/contexts/EventContext'
import { eventService, Event } from '@/lib/services/events'
import { guestService } from '@/lib/services/guests'
import { Guest } from '@/types/database.types'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import EventAnalytics from '@/components/events/EventAnalytics'

export default function EventAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveEvent } = useActiveEvent()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
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
      const [eventData, guestsData] = await Promise.all([
        eventService.getEventById(eventId),
        guestService.getGuestsByEventId(eventId),
      ])

      setEvent(eventData)
      setActiveEvent(eventId, eventData)
      setGuests(guestsData)
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

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View statistics and insights for {event.event_name}
        </p>
      </div>

      {/* Analytics Component */}
      <EventAnalytics guests={guests} />
    </div>
  )
}
