'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { eventService, EventWithStats } from '@/lib/services/events'
import { toast } from 'sonner'
import { Plus, LayoutGrid, Table as TableIcon, Calendar, MapPin, Users, CheckCircle, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EventsGrid from '@/components/dashboard/EventsGrid'
import EventCard from '@/components/dashboard/EventCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import Link from 'next/link'
import { format } from 'date-fns'

type FilterType = 'all' | 'upcoming' | 'completed'

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filterEvents = (events: EventWithStats[]): EventWithStats[] => {
    let filtered = events

    // Apply status filter
    if (filter === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.event_date) >= today)
    } else if (filter === 'completed') {
      filtered = filtered.filter((event) => new Date(event.event_date) < today)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((event) =>
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.bride_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.groom_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredEvents = filterEvents(events)
  const upcomingCount = events.filter((e) => new Date(e.event_date) >= today).length
  const completedCount = events.filter((e) => new Date(e.event_date) < today).length

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
        <Button asChild size="lg">
          <Link href="/events/create">
            <Plus className="w-5 h-5 mr-2" />
            Buat Event Baru
          </Link>
        </Button>
      </div>

      {/* Search, Filter, and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">
                Semua ({events.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* View Toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'table')}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <TableIcon className="h-4 w-4 mr-2" />
            Table
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Events View */}
      {viewMode === 'grid' ? (
        <EventsGridView
          events={filteredEvents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <EventsTable
          events={filteredEvents}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

// Events Grid View Component (without search/filter)
function EventsGridView({
  events,
  onEdit,
  onDelete,
}: {
  events: EventWithStats[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

// Events Table Component
function EventsTable({
  events,
  onEdit,
  onDelete,
}: {
  events: EventWithStats[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Belum ada event</h3>
          <p className="text-muted-foreground mb-4">
            Mulai buat event wedding pertama Anda
          </p>
          <Button asChild>
            <Link href="/events/create">
              <Plus className="w-4 h-4 mr-2" />
              Buat Event Pertama
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Checked In</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const eventDate = new Date(event.event_date)
            const today = new Date()
            const isPast = eventDate < today
            const isToday = eventDate.toDateString() === today.toDateString()

            return (
              <TableRow key={event.id}>
                <TableCell>
                  <Link
                    href={`/events/${event.id}`}
                    className="font-medium hover:underline"
                  >
                    {event.event_name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(eventDate, 'dd MMM yyyy')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{event.venue}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{event.guest_count || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      {event.checked_in_count || 0}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      ({event.guest_count ? Math.round(((event.checked_in_count || 0) / event.guest_count) * 100) : 0}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {isPast ? (
                    <Badge variant="secondary">Past</Badge>
                  ) : isToday ? (
                    <Badge className="bg-green-600">Today</Badge>
                  ) : (
                    <Badge variant="default">Upcoming</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(event.id)}
                      title="Edit event"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(event.id)}
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
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
