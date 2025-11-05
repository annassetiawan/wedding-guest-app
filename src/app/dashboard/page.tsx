'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { eventService, EventWithStats } from '@/lib/services/events'
import { toast } from 'sonner'
import { Plus, Calendar, Download } from 'lucide-react'

import StatsCards from '@/components/dashboard/StatsCards'
import Overview from '@/components/dashboard/Overview'
import RecentEvents from '@/components/dashboard/RecentEvents'
import EventsGrid from '@/components/dashboard/EventsGrid'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await eventService.getEventsWithStats(user.id)
      setEvents(data)
    } catch (error: any) {
      toast.error('Gagal memuat events')
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`)
  }

  const handleDeleteEvent = (eventId: string) => {
    router.push(`/events/${eventId}?action=delete`)
  }

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalEvents = events.length
  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= today).length
  const totalGuests = events.reduce((sum, event) => sum + event.guest_count, 0)
  const activeCheckins = events.reduce((sum, event) => sum + event.checked_in_count, 0)

  if (authLoading || (loading && !events.length)) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <StatsCards
          totalEvents={0}
          upcomingEvents={0}
          totalGuests={0}
          activeCheckins={0}
          loading={true}
        />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your wedding events.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/events">
              <Calendar className="mr-2 h-4 w-4" />
              View All Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <StatsCards
            totalEvents={totalEvents}
            upcomingEvents={upcomingEvents}
            totalGuests={totalGuests}
            activeCheckins={activeCheckins}
            loading={loading}
          />

          {/* Overview Charts and Recent Events */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <Overview events={events} />
            </div>
            <RecentEvents events={events} />
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <StatsCards
            totalEvents={totalEvents}
            upcomingEvents={upcomingEvents}
            totalGuests={totalGuests}
            activeCheckins={activeCheckins}
            loading={loading}
          />
          <Overview events={events} />
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <EventsGrid
            events={events}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
