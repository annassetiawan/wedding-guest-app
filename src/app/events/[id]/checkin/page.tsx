'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { eventService, Event } from '@/lib/services/events'
import { guestService } from '@/lib/services/guests'
import { Guest } from '@/types/database.types'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// CRITICAL: Import ZXing scanner with NO SSR
const ZXingScanner = dynamic(
  () => import('@/components/checkin/ZXingScanner'),
  {
    ssr: false,
    loading: () => (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Scanner QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Loading scanner...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pencarian Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
)

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

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
      const [eventData, guestsData] = await Promise.all([
        eventService.getEventById(eventId),
        guestService.getGuestsByEventId(eventId),
      ])

      if (eventData) {
        setEvent(eventData)
      }

      if (guestsData) {
        setGuests(guestsData)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load event')
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScanSuccess = async (guest: Guest) => {
    try {
      if (guest.checked_in) {
        toast.warning(`${guest.name} sudah check-in sebelumnya`)
        return
      }

      await guestService.checkInGuest(guest.id)

      setGuests((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, checked_in: true, checked_in_at: new Date().toISOString() } : g))
      )

      toast.success(`${guest.name} berhasil check-in!`)
    } catch (error: any) {
      toast.error(error.message || 'Gagal check-in tamu')
      console.error('Error checking in guest:', error)
    }
  }

  const stats = {
    total: guests.length,
    checkedIn: guests.filter((g) => g.checked_in).length,
    pending: guests.filter((g) => !g.checked_in).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading check-in page...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/events/${eventId}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.event_name}</h1>
                <p className="text-sm text-gray-500">Guest Check-In</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{new Date(event.event_date).toLocaleDateString()}</Badge>
              <Badge variant="outline">{event.venue}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Guests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* ZXing Scanner - Client-only with dynamic import (NO SSR) */}
        <ZXingScanner
          eventId={eventId}
          guests={guests}
          onScanSuccess={handleScanSuccess}
        />
      </main>
    </div>
  )
}
