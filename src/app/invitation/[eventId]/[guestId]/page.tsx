'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Event } from '@/lib/services/events'
import { Guest } from '@/types/database.types'
import { Loader2 } from 'lucide-react'
import ModernTemplate from '@/components/invitation/ModernTemplate'
import ElegantTemplate from '@/components/invitation/ElegantTemplate'

export default function InvitationPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const guestId = params.guestId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvitationData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, guestId])

  const loadInvitationData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError) throw new Error('Event tidak ditemukan')

      // Fetch guest data
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('id', guestId)
        .eq('event_id', eventId)
        .single()

      if (guestError) throw new Error('Undangan tidak ditemukan')

      setEvent(eventData)
      setGuest(guestData)
    } catch (err: any) {
      console.error('Error loading invitation:', err)
      setError(err.message || 'Gagal memuat undangan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Memuat undangan...</p>
        </div>
      </div>
    )
  }

  if (error || !event || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Undangan Tidak Ditemukan</h1>
          <p className="text-gray-600">
            {error || 'Maaf, undangan yang Anda cari tidak dapat ditemukan.'}
          </p>
        </div>
      </div>
    )
  }

  // Render template based on event.template_id
  const renderTemplate = () => {
    switch (event.template_id) {
      case 'elegant':
        return <ElegantTemplate event={event} guest={guest} />
      case 'modern':
      default:
        return <ModernTemplate event={event} guest={guest} />
    }
  }

  return renderTemplate()
}
