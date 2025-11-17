'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveEvent } from '@/contexts/EventContext'
import { eventService, Event } from '@/lib/services/events'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

// Import layout components
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'

export default function EventSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveEvent } = useActiveEvent()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteEventOpen, setDeleteEventOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDeleteEvent = async () => {
    if (!event) return

    try {
      setIsDeleting(true)
      await eventService.deleteEvent(event.id)
      toast.success('Event deleted successfully')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event')
      console.error('Error deleting event:', error)
    } finally {
      setIsDeleting(false)
      setDeleteEventOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
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
    <PageLayout>
      <PageHeader
        title="Event Settings"
        subtitle={`Manage settings for ${event.event_name}`}
      />

      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
          <CardDescription>View your event details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Event Name</dt>
              <dd className="mt-1 text-sm">{event.event_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Date</dt>
              <dd className="mt-1 text-sm">{formatDate(event.event_date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Venue</dt>
              <dd className="mt-1 text-sm">{event.venue}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Template</dt>
              <dd className="mt-1 text-sm">{event.template_id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Bride</dt>
              <dd className="mt-1 text-sm">{event.bride_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Groom</dt>
              <dd className="mt-1 text-sm">{event.groom_name}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit Event Button */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>Update your event information</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(`/events/${eventId}/edit`)}>
            Edit Event Details
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-900 dark:text-red-100">Danger Zone</CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Once you delete an event, there is no going back. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDeleteEventOpen(true)}>
            Delete Event
          </Button>
        </CardContent>
      </Card>

      {/* Delete Event Confirmation Dialog */}
      <Dialog open={deleteEventOpen} onOpenChange={setDeleteEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the event "
              {event.event_name}" and all associated guest data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteEventOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
