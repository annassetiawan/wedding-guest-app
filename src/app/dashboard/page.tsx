'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { eventService, EventWithStats } from '@/lib/services/events'
import { toast } from 'sonner'
import { Plus, FileText, Download } from 'lucide-react'

import StatsCards from '@/components/dashboard/StatsCards'
import EventsGrid from '@/components/dashboard/EventsGrid'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
      <div className="space-y-8">
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
    <div className="space-y-8">
      {/* Stats Cards */}
      <section>
        <StatsCards
          totalEvents={totalEvents}
          upcomingEvents={upcomingEvents}
          totalGuests={totalGuests}
          activeCheckins={activeCheckins}
          loading={loading}
        />
      </section>

      <Separator />

      {/* Quick Actions */}
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/events/create">
              <Plus className="h-5 w-5 mr-2" />
              Buat Event Baru
            </Link>
          </Button>
          <Button variant="outline" size="lg" disabled>
            <Download className="h-5 w-5 mr-2" />
            Import Data
          </Button>
          <Button variant="outline" size="lg" disabled>
            <FileText className="h-5 w-5 mr-2" />
            Lihat Laporan
          </Button>
        </div>
      </section>

      <Separator />

      {/* Events Grid */}
      <section>
        <EventsGrid
          events={events}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      </section>
    </div>
  )
}
