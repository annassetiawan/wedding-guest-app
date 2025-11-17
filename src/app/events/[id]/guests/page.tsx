'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useActiveEvent } from '@/contexts/EventContext'
import { eventService, Event } from '@/lib/services/events'
import { guestService } from '@/lib/services/guests'
import { createClient } from '@/lib/supabase/client'
import { Guest } from '@/types/database.types'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  QrCode,
  Link2,
  Share2,
  ExternalLink,
  Eye,
  Users,
  UserCheck,
  Clock,
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
import { Skeleton } from '@/components/ui/skeleton'

// Import layout components
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchFilterBar, FilterOption } from '@/components/layout/SearchFilterBar'

// Import guest management dialogs
import AddGuestDialog from '@/components/events/AddGuestDialog'
import EditGuestDialog from '@/components/events/EditGuestDialog'
import DeleteGuestDialog from '@/components/events/DeleteGuestDialog'
import GuestQRDialog from '@/components/events/GuestQRDialog'
import ImportGuestsDialog from '@/components/events/ImportGuestsDialog'
import { GuestDetailsDialog } from '@/components/events/GuestDetailsDialog'

export default function EventGuestsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { setActiveEvent } = useActiveEvent()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCheckedIn, setFilterCheckedIn] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'checkin_time' | 'category'>('name')

  // Dialog states
  const [addGuestOpen, setAddGuestOpen] = useState(false)
  const [editGuestOpen, setEditGuestOpen] = useState(false)
  const [deleteGuestOpen, setDeleteGuestOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [guestDetailsOpen, setGuestDetailsOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEventData()
  }, [eventId, user])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!eventId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`guests-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGuests((prev) => [payload.new as Guest, ...prev])
            toast.success('New guest added')
          } else if (payload.eventType === 'UPDATE') {
            setGuests((prev) =>
              prev.map((guest) =>
                guest.id === payload.new.id ? (payload.new as Guest) : guest
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setGuests((prev) => prev.filter((guest) => guest.id !== payload.old.id))
            toast.info('Guest removed')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

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

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setEditGuestOpen(true)
  }

  const handleDeleteGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setDeleteGuestOpen(true)
  }

  const handleViewQR = (guest: Guest) => {
    setSelectedGuest(guest)
    setQrDialogOpen(true)
  }

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest)
    setGuestDetailsOpen(true)
  }

  const handleCopyInvitationLink = (guest: Guest) => {
    const invitationUrl = `${window.location.origin}/invitation/${eventId}/${guest.id}`
    navigator.clipboard.writeText(invitationUrl).then(() => {
      toast.success(`Invitation link copied for ${guest.name}`)
    }).catch(() => {
      toast.error('Failed to copy link')
    })
  }

  const handleShareWhatsApp = (guest: Guest) => {
    if (!event) return

    const invitationUrl = `${window.location.origin}/invitation/${eventId}/${guest.id}`
    const message = `Kepada Yth. ${guest.name},\n\nAnda diundang ke acara pernikahan ${event.bride_name} & ${event.groom_name}.\n\nTanggal: ${formatDate(event.event_date)}\nLokasi: ${event.venue}\n\nLihat undangan lengkap di:\n${invitationUrl}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePreviewInvitation = (guest: Guest) => {
    const invitationUrl = `/invitation/${eventId}/${guest.id}`
    window.open(invitationUrl, '_blank')
  }

  const handleToggleCheckin = async (guestId: string, currentStatus: boolean) => {
    try {
      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === guestId
            ? {
                ...guest,
                checked_in: !currentStatus,
                checked_in_at: !currentStatus ? new Date().toISOString() : undefined,
              }
            : guest
        )
      )

      if (!currentStatus) {
        await guestService.checkInGuest(guestId)
        toast.success('Guest checked in successfully')
      } else {
        await guestService.updateGuest(guestId, {
          checked_in: false,
          checked_in_at: undefined,
        })
        toast.success('Check-in undone successfully')
      }
    } catch (error: any) {
      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === guestId ? { ...guest, checked_in: currentStatus } : guest
        )
      )
      toast.error(error.message || 'Failed to update check-in status')
    }
  }

  const exportGuestsToCSV = () => {
    try {
      const headers = ['Name', 'Phone', 'Category', 'Status', 'Check-in Time']
      const rows = guests.map((guest) => [
        guest.name,
        guest.phone || '',
        guest.category,
        guest.checked_in ? 'Sudah hadir' : 'Belum hadir',
        guest.checked_in_at
          ? new Date(guest.checked_in_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `${event?.event_name || 'guests'}-export.csv`)
      link.className = 'sr-only'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Guest list exported successfully')
    } catch (error: any) {
      toast.error('Failed to export guest list')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getFilteredGuests = () => {
    let filtered = guests

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (guest) =>
          guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((guest) => guest.category === filterCategory)
    }

    if (filterCheckedIn !== 'all') {
      filtered = filtered.filter((guest) =>
        filterCheckedIn === 'checked_in' ? guest.checked_in : !guest.checked_in
      )
    }

    const sorted = [...filtered]
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'checkin_time') {
      sorted.sort((a, b) => {
        if (!a.checked_in_at && !b.checked_in_at) return 0
        if (!a.checked_in_at) return 1
        if (!b.checked_in_at) return -1
        return new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime()
      })
    } else if (sortBy === 'category') {
      sorted.sort((a, b) => a.category.localeCompare(b.category))
    }

    return sorted
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
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

  const filteredGuests = getFilteredGuests()
  const stats = {
    total: guests.length,
    checkedIn: guests.filter((g) => g.checked_in).length,
    notCheckedIn: guests.filter((g) => !g.checked_in).length,
  }

  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'VIP', label: 'VIP' },
        { value: 'Regular', label: 'Regular' },
        { value: 'Family', label: 'Family' },
      ],
      defaultValue: filterCategory,
    },
    {
      key: 'status',
      label: 'Kehadiran',
      options: [
        { value: 'all', label: 'Semua' },
        { value: 'checked_in', label: 'Sudah Hadir' },
        { value: 'not_checked_in', label: 'Belum Hadir' },
      ],
      defaultValue: filterCheckedIn,
    },
    {
      key: 'sort',
      label: 'Sort by',
      options: [
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'checkin_time', label: 'Check-in Time' },
        { value: 'category', label: 'Category' },
      ],
      defaultValue: sortBy,
    },
  ]

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'category') setFilterCategory(value)
    if (key === 'status') setFilterCheckedIn(value)
    if (key === 'sort') setSortBy(value as 'name' | 'checkin_time' | 'category')
  }

  return (
    <PageLayout>
      <PageHeader
        title="Guest List"
        subtitle={`Manage guests for ${event.event_name}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportGuestsToCSV}
              disabled={guests.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setAddGuestOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add Guest
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
              <div className="text-3xl font-bold tracking-tight">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Total invited guests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Checked In</p>
              <div className="text-3xl font-bold tracking-tight text-green-600">{stats.checkedIn}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0
                  ? `${Math.round((stats.checkedIn / stats.total) * 100)}% attendance rate`
                  : 'No guests yet'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Not Checked In</p>
              <div className="text-3xl font-bold tracking-tight">{stats.notCheckedIn}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting check-in</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <SearchFilterBar
        searchable
        searchPlaceholder="Search by name or phone..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterOptions}
        onFilterChange={handleFilterChange}
      />

      {/* Guest Table */}
      {filteredGuests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || filterCategory !== 'all' || filterCheckedIn !== 'all'
                ? 'No guests found'
                : 'No guests yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterCategory !== 'all' || filterCheckedIn !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first guest'}
            </p>
            {!searchQuery && filterCategory === 'all' && filterCheckedIn === 'all' && (
              <Button onClick={() => setAddGuestOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Guest
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Kehadiran</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-sm">
                              {guest.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{guest.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{guest.phone || '-'}</TableCell>
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
                        <Badge
                          variant={
                            guest.rsvp_status === 'attending'
                              ? 'default'
                              : guest.rsvp_status === 'not_attending'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={
                            guest.rsvp_status === 'attending'
                              ? 'bg-green-600 hover:bg-green-700'
                              : guest.rsvp_status === 'not_attending'
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : ''
                          }
                        >
                          {guest.rsvp_status === 'attending'
                            ? 'Hadir'
                            : guest.rsvp_status === 'not_attending'
                            ? 'Tidak Hadir'
                            : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleCheckin(guest.id, guest.checked_in)}
                          className="h-auto p-0"
                        >
                          <Badge variant={guest.checked_in ? 'default' : 'secondary'}>
                            {guest.checked_in ? 'Sudah hadir' : 'Belum hadir'}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(guest)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewQR(guest)}
                            title="View QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyInvitationLink(guest)}
                            title="Copy Invitation Link"
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShareWhatsApp(guest)}
                            title="Share via WhatsApp"
                          >
                            <Share2 className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreviewInvitation(guest)}
                            title="Preview Invitation"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGuest(guest)}
                            title="Edit Guest"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGuest(guest)}
                            title="Delete Guest"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <AddGuestDialog
        open={addGuestOpen}
        onOpenChange={setAddGuestOpen}
        eventId={eventId}
        onSuccess={loadEventData}
      />

      <EditGuestDialog
        open={editGuestOpen}
        onOpenChange={setEditGuestOpen}
        guest={selectedGuest}
        onSuccess={loadEventData}
      />

      <DeleteGuestDialog
        open={deleteGuestOpen}
        onOpenChange={setDeleteGuestOpen}
        guest={selectedGuest}
        onSuccess={loadEventData}
      />

      <GuestQRDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        guest={selectedGuest}
        eventName={event?.event_name}
      />

      <ImportGuestsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        eventId={eventId}
        onSuccess={loadEventData}
      />

      <GuestDetailsDialog
        guest={selectedGuest}
        open={guestDetailsOpen}
        onOpenChange={setGuestDetailsOpen}
      />
    </PageLayout>
  )
}
