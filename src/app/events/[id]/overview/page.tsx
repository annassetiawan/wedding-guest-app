'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveEvent } from '@/contexts/EventContext'
import { eventService, Event } from '@/lib/services/events'
import { guestService } from '@/lib/services/guests'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  MapPin,
  Users,
  UserCheck,
  Clock,
  Edit,
  QrCode,
  TrendingUp,
  Briefcase,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// Import layout components
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'

export default function EventOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveEvent } = useActiveEvent()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    notCheckedIn: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEventData()
  }, [eventId, user])

  const loadEventData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [eventData, guestsData] = await Promise.all([
        eventService.getEventById(eventId),
        guestService.getGuestsByEventId(eventId),
      ])

      setEvent(eventData)
      // Set as active event
      setActiveEvent(eventId, eventData)

      // Calculate stats
      const checkedIn = guestsData.filter((g) => g.checked_in).length
      setStats({
        total: guestsData.length,
        checkedIn,
        notCheckedIn: guestsData.length - checkedIn,
      })
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <EventOverviewSkeleton />
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    )
  }

  const eventDate = new Date(event.event_date)
  const isUpcoming = eventDate >= new Date()

  return (
    <PageLayout>
      <PageHeader
        title={event.event_name}
        subtitle={
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              {event.bride_name} & {event.groom_name}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(eventDate, 'd MMMM yyyy, EEEE', { locale: idLocale })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </div>
            </div>
          </div>
        }
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/events/${eventId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/events/${eventId}/checkin`}>
                <QrCode className="h-4 w-4 mr-2" />
                Check-in
              </Link>
            </Button>
          </div>
        }
      />

      {/* Status Badge */}
      <div>
        <Badge variant={isUpcoming ? 'default' : 'secondary'} className="text-sm">
          {isUpcoming ? '📅 Upcoming Event' : '✅ Past Event'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total invited guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.checkedIn}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0
                ? `${Math.round((stats.checkedIn / stats.total) * 100)}% attendance`
                : 'No guests yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Not Checked In</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notCheckedIn}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting check-in
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-4 hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
            asChild
          >
            <Link href={`/events/${eventId}/guests`}>
              <div className="flex items-start gap-3 w-full">
                <Users className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Manage Guests</div>
                  <div className="text-xs text-muted-foreground">
                    Add, edit, or import guests
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
            asChild
          >
            <Link href={`/events/${eventId}/vendors`}>
              <div className="flex items-start gap-3 w-full">
                <Briefcase className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Manage Vendors</div>
                  <div className="text-xs text-muted-foreground">
                    Assign and track vendors
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
            asChild
          >
            <Link href={`/events/${eventId}/timeline`}>
              <div className="flex items-start gap-3 w-full">
                <Clock className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Event Timeline</div>
                  <div className="text-xs text-muted-foreground">
                    View Gantt chart & rundown
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
            asChild
          >
            <Link href={`/events/${eventId}/analytics`}>
              <div className="flex items-start gap-3 w-full">
                <TrendingUp className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground">
                    Charts and statistics
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
            asChild
          >
            <Link href={`/events/${eventId}/checkin`}>
              <div className="flex items-start gap-3 w-full">
                <QrCode className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">QR Check-in</div>
                  <div className="text-xs text-muted-foreground">
                    Scan QR codes for check-in
                  </div>
                </div>
              </div>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all"
            asChild
          >
            <Link href={`/events/${eventId}/settings`}>
              <div className="flex items-start gap-3 w-full">
                <Edit className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Event Settings</div>
                  <div className="text-xs text-muted-foreground">
                    Edit event details
                  </div>
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bride Name</p>
            <p className="text-base">{event.bride_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Groom Name</p>
            <p className="text-base">{event.groom_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Event Date</p>
            <p className="text-base">
              {format(eventDate, 'd MMMM yyyy, EEEE', { locale: idLocale })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Venue</p>
            <p className="text-base">{event.venue}</p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}

function EventOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  )
}
