'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Guest, GuestCategory } from '@/types/database.types'
import { Event } from '@/lib/services/events'
import Link from 'next/link'
import {
  Users,
  Search,
  Filter,
  Download,
  Loader2,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  QrCode,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface GuestWithEvent extends Guest {
  event?: Event
}

export default function AllGuestsPage() {
  const { user } = useAuth()
  const [guests, setGuests] = useState<GuestWithEvent[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCheckedIn, setFilterCheckedIn] = useState<string>('all')
  const [selectedGuest, setSelectedGuest] = useState<GuestWithEvent | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchEventsAndGuests()
    }
  }, [user])

  const fetchEventsAndGuests = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch user's events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .order('event_date', { ascending: false })

      if (eventsError) throw eventsError

      setEvents(eventsData || [])

      // Fetch all guests across all events
      const eventIds = eventsData?.map((e) => e.id) || []

      if (eventIds.length > 0) {
        const { data: guestsData, error: guestsError } = await supabase
          .from('guests')
          .select('*')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false })

        if (guestsError) throw guestsError

        // Attach event data to each guest
        const guestsWithEvents = guestsData?.map((guest) => ({
          ...guest,
          event: eventsData?.find((e) => e.id === guest.event_id),
        })) || []

        setGuests(guestsWithEvents)
      }
    } catch (error: any) {
      console.error('Error fetching guests:', error)
      toast.error(error.message || 'Failed to load guests')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId)

      if (error) throw error

      setGuests(guests.filter((g) => g.id !== guestId))
      toast.success('Guest deleted successfully')
      setDetailsOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete guest')
    }
  }

  const handleExportCSV = () => {
    const csvData = filteredGuests.map((guest) => ({
      Name: guest.name,
      Phone: guest.phone || '-',
      Category: guest.category,
      Event: guest.event?.bride_name && guest.event?.groom_name
        ? `${guest.event.bride_name} & ${guest.event.groom_name}`
        : '-',
      'Event Date': guest.event?.event_date || '-',
      'Checked In': guest.checked_in ? 'Yes' : 'No',
      'Check-in Time': guest.checked_in_at || '-',
      'QR Code': guest.qr_code,
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `all-guests-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('CSV exported successfully')
  }

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      searchQuery === '' ||
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEvent = filterEvent === 'all' || guest.event_id === filterEvent

    const matchesCategory =
      filterCategory === 'all' || guest.category === filterCategory

    const matchesCheckedIn =
      filterCheckedIn === 'all' ||
      (filterCheckedIn === 'checked_in' && guest.checked_in) ||
      (filterCheckedIn === 'not_checked_in' && !guest.checked_in)

    return matchesSearch && matchesEvent && matchesCategory && matchesCheckedIn
  })

  const stats = {
    total: filteredGuests.length,
    checkedIn: filteredGuests.filter((g) => g.checked_in).length,
    notCheckedIn: filteredGuests.filter((g) => !g.checked_in).length,
    vip: filteredGuests.filter((g) => g.category === 'VIP').length,
    regular: filteredGuests.filter((g) => g.category === 'Regular').length,
    family: filteredGuests.filter((g) => g.category === 'Family').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Guests</h1>
          <p className="text-muted-foreground">
            Manage all guests across all your events
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={filteredGuests.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.checkedIn / stats.total) * 100)
                : 0}% attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notCheckedIn}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search guests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Event Filter */}
            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger>
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.bride_name} & {event.groom_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
              </SelectContent>
            </Select>

            {/* Check-in Filter */}
            <Select value={filterCheckedIn} onValueChange={setFilterCheckedIn}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="not_checked_in">Not Checked In</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guests ({filteredGuests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No guests found</h3>
              <p className="text-sm text-muted-foreground">
                {guests.length === 0
                  ? 'Create an event and add guests to get started'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {guest.event?.bride_name && guest.event?.groom_name
                          ? `${guest.event.bride_name} & ${guest.event.groom_name}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {guest.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            guest.category === 'VIP'
                              ? 'default'
                              : guest.category === 'Family'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {guest.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {guest.checked_in ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedGuest(guest)
                                setDetailsOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${guest.event_id}`}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Go to Event
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(guest.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guest Details</DialogTitle>
            <DialogDescription>
              Detailed information about the guest
            </DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{selectedGuest.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Event</p>
                <p>
                  {selectedGuest.event?.bride_name && selectedGuest.event?.groom_name
                    ? `${selectedGuest.event.bride_name} & ${selectedGuest.event.groom_name}`
                    : '-'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedGuest.event?.event_date
                    ? new Date(selectedGuest.event.event_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{selectedGuest.phone || '-'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge
                  variant={
                    selectedGuest.category === 'VIP'
                      ? 'default'
                      : selectedGuest.category === 'Family'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {selectedGuest.category}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Check-in Status</p>
                {selectedGuest.checked_in ? (
                  <div>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Checked In
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedGuest.checked_in_at
                        ? new Date(selectedGuest.checked_in_at).toLocaleString('id-ID')
                        : '-'}
                    </p>
                  </div>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="mr-1 h-3 w-3" />
                    Not Checked In
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">QR Code</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {selectedGuest.qr_code}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  asChild
                >
                  <Link href={`/events/${selectedGuest.event_id}`}>
                    Go to Event
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
