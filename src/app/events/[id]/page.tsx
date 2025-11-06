'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { eventService, Event } from '@/lib/services/events'
import { guestService } from '@/lib/services/guests'
import { createClient } from '@/lib/supabase/client'
import { Guest } from '@/types/database.types'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  Search,
  Plus,
  Loader2,
  Edit,
  Trash2,
  QrCode,
  Upload,
  Link2,
  Share2,
  ExternalLink,
  Download,
  ArrowUpDown,
  BarChart3,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Import guest management dialogs
import AddGuestDialog from '@/components/events/AddGuestDialog'
import EditGuestDialog from '@/components/events/EditGuestDialog'
import DeleteGuestDialog from '@/components/events/DeleteGuestDialog'
import GuestQRDialog from '@/components/events/GuestQRDialog'
import ImportGuestsDialog from '@/components/events/ImportGuestsDialog'
import EventAnalytics from '@/components/events/EventAnalytics'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
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
  const [deleteEventOpen, setDeleteEventOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadEventData()

    // Check for action query parameter
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get('action') === 'delete') {
        setDeleteEventOpen(true)
        // Clean up URL
        router.replace(`/events/${eventId}`, { scroll: false })
      }
    }
  }, [eventId, user])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!eventId) return

    const supabase = createClient()

    // Subscribe to guests table changes for this event
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
          console.log('Realtime change received:', payload)

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

    // Cleanup subscription on unmount
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

      if (!eventData) {
        console.error('Event not found:', eventId)
        notFound() // Show 404 page instead of redirecting
      }

      setEvent(eventData)
      setGuests(guestsData)
    } catch (error: any) {
      console.error('Error loading event:', error)
      // Don't redirect on error - show error state instead
      toast.error(error.message || 'Failed to load event')
      // If it's a not found error, show 404
      if (error.message?.includes('not found') || error.status === 404) {
        notFound()
      }
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
      // Optimistic update
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
        // Check in the guest
        await guestService.checkInGuest(guestId)
        toast.success('Guest checked in successfully')
      } else {
        // Undo check-in
        await guestService.updateGuest(guestId, {
          checked_in: false,
          checked_in_at: undefined,
        })
        toast.success('Check-in undone successfully')
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === guestId
            ? { ...guest, checked_in: currentStatus }
            : guest
        )
      )
      toast.error(error.message || 'Failed to update check-in status')
      console.error('Error toggling check-in:', error)
    }
  }

  const exportGuestsToCSV = () => {
    try {
      // CSV headers
      const headers = ['Name', 'Phone', 'Category', 'Status', 'Check-in Time']

      // CSV rows
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

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      // Create blob and download
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
      console.error('Error exporting CSV:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secs ago`
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60)
      return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
  }

  const getFilteredGuests = () => {
    let filtered = guests

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (guest) =>
          guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((guest) => guest.category === filterCategory)
    }

    // Checked-in filter
    if (filterCheckedIn !== 'all') {
      filtered = filtered.filter((guest) =>
        filterCheckedIn === 'checked_in' ? guest.checked_in : !guest.checked_in
      )
    }

    // Sorting
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

  const getRecentCheckins = () => {
    return guests
      .filter((guest) => guest.checked_in && guest.checked_in_at)
      .sort((a, b) => {
        if (!a.checked_in_at || !b.checked_in_at) return 0
        return new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime()
      })
      .slice(0, 50)
  }

  const stats = {
    total: guests.length,
    checkedIn: guests.filter((g) => g.checked_in).length,
    notCheckedIn: guests.filter((g) => !g.checked_in).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  const filteredGuests = getFilteredGuests()
  const recentCheckins = getRecentCheckins()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.event_name}</h1>
                <p className="text-sm text-gray-600">
                  {event.bride_name} & {event.groom_name} • {formatDate(event.event_date)}
                </p>
              </div>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Link href={`/events/${eventId}/checkin`}>
                <QrCode className="mr-2 h-4 w-4" />
                Start Check-in
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Users className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <UserCheck className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-muted-foreground">Sudah Hadir</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.checkedIn}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-sm text-muted-foreground">Belum Hadir</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.notCheckedIn}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs defaultValue="guests" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="guests">
                  Guest List ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Guest List Tab */}
              <TabsContent value="guests" className="mt-0 space-y-6">
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or phone..."
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCheckedIn} onValueChange={setFilterCheckedIn}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Kehadiran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="checked_in">Sudah Hadir</SelectItem>
                      <SelectItem value="not_checked_in">Belum Hadir</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'checkin_time' | 'category')}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="checkin_time">Check-in Time (Recent First)</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={exportGuestsToCSV}
                      disabled={guests.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImportDialogOpen(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
                    <Button
                      onClick={() => setAddGuestOpen(true)}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Guest
                    </Button>
                  </div>
                </div>

                {/* Guest Table */}
                {filteredGuests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
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
                      <Button
                        onClick={() => setAddGuestOpen(true)}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Your First Guest
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Category</TableHead>
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
                                  <Share2 className="h-4 w-4 text-green-600" />
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
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-0">
                <EventAnalytics guests={filteredGuests} />
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Recent Check-ins</h3>
                      <p className="text-sm text-muted-foreground">
                        Latest 50 guests who checked in
                      </p>
                    </div>
                    <Badge variant="outline">
                      {recentCheckins.length} check-ins
                    </Badge>
                  </div>

                  {recentCheckins.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No check-ins yet
                      </h3>
                      <p className="text-muted-foreground">
                        Check-ins will appear here as guests arrive
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentCheckins.map((guest) => (
                        <Card key={guest.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground font-semibold text-sm">
                                  {guest.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{guest.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={
                                      guest.category === 'VIP'
                                        ? 'default'
                                        : guest.category === 'Family'
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {guest.category}
                                  </Badge>
                                  {guest.checked_in_at && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatRelativeTime(guest.checked_in_at)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Information</CardTitle>
                    <CardDescription>View your event details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Event Name
                        </dt>
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
                        <dt className="text-sm font-medium text-muted-foreground">
                          Template
                        </dt>
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

                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-900">Danger Zone</CardTitle>
                    <CardDescription className="text-red-700">
                      Once you delete an event, there is no going back. Please be certain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteEventOpen(true)}
                    >
                      Delete Event
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </main>

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

      {/* Delete Event Confirmation Dialog */}
      <Dialog open={deleteEventOpen} onOpenChange={setDeleteEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{event.event_name}" and all associated guest data.
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
    </div>
  )
}
