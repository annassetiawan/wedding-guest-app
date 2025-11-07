'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { eventService, EventWithStats } from '@/lib/services/events'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EventsGrid from '@/components/dashboard/EventsGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function EventsPage() {
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

  const handleEdit = (eventId: string) => {
    router.push(`/events/${eventId}/edit`)
  }

  const handleDelete = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId)
      toast.success('Event berhasil dihapus')
      loadEvents()
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus event')
      console.error('Error deleting event:', error)
    }
  }

  if (authLoading || loading) {
    return <EventsPageSkeleton />
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua event wedding Anda
          </p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/events/create">
            <Plus className="w-5 h-5 mr-2" />
            Buat Event Baru
          </Link>
        </Button>
      </div>

      {/* Events Grid */}
      <EventsGrid
        events={events}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

// Skeleton Loading Component
function EventsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-80" />
        <Skeleton className="h-10 w-full sm:w-96" />
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="border-t p-4 flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
