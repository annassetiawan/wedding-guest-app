'use client'

import { useState } from 'react'
import { EventWithStats } from '@/lib/services/events'
import EventCard from './EventCard'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Calendar, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EventsGridProps {
  events: EventWithStats[]
  onEdit?: (eventId: string) => void
  onDelete?: (eventId: string) => void
}

type FilterType = 'all' | 'upcoming' | 'completed'

export default function EventsGrid({ events, onEdit, onDelete }: EventsGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

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

  // Empty state component
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-primary/10 rounded-full">
            <Calendar className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Belum ada event</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Mulai dengan membuat event pertama Anda dan kelola daftar tamu dengan mudah
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/events/create">
            <Gift className="h-5 w-5 mr-2" />
            Buat Event Pertama
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Event Saya</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola dan pantau semua event wedding Anda
          </p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
              Mendatang ({upcomingCount})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Selesai ({completedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Events Grid or No Results */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Tidak ada hasil</h3>
          <p className="text-muted-foreground">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
