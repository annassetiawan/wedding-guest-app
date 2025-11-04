'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/lib/services/events'
import { Guest } from '@/types/database.types'
import { generateQRCodeDataURL } from '@/lib/utils/qrcode'
import { Calendar, MapPin, Share2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ModernTemplateProps {
  event: Event
  guest: Guest
}

export default function ModernTemplate({ event, guest }: ModernTemplateProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100)

    // Generate QR code
    generateQRCodeDataURL(guest.qr_code, {
      width: 400,
      margin: 3,
      errorCorrectionLevel: 'H',
    }).then(setQrDataUrl)
  }, [guest.qr_code])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      full: date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      day: date.toLocaleDateString('id-ID', { day: 'numeric' }),
      month: date.toLocaleDateString('id-ID', { month: 'short' }),
      year: date.toLocaleDateString('id-ID', { year: 'numeric' }),
    }
  }

  const handleAddToCalendar = () => {
    const date = new Date(event.event_date)
    const title = `Wedding ${event.bride_name} & ${event.groom_name}`
    const details = `Undangan pernikahan di ${event.venue}`

    // Google Calendar URL
    const startDate = date.toISOString().replace(/-|:|\.\d+/g, '')
    const endDate = new Date(date.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '')

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(event.venue)}`

    window.open(googleCalUrl, '_blank')
  }

  const handleShareWhatsApp = () => {
    const message = `Halo ${guest.name}! Anda diundang ke acara pernikahan ${event.bride_name} & ${event.groom_name}. Lihat undangan lengkap: ${window.location.href}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleDownloadQR = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `QR-${guest.name}.png`
    link.click()
  }

  const dateInfo = formatDate(event.event_date)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Hero Section */}
      <div
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm text-gray-600 uppercase tracking-widest mb-4">
              The Wedding Of
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary mb-4">
              {event.bride_name}
            </h1>
            <p className="text-3xl md:text-4xl text-muted-foreground font-light my-2">&</p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary">
              {event.groom_name}
            </h1>
          </div>

          {/* Guest Greeting */}
          <Card className="p-8 text-center bg-card/80 backdrop-blur-sm border-border mb-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              Kepada Yth.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {guest.name}
            </h2>
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full">
              <p className="text-sm font-medium text-primary">{guest.category}</p>
            </div>
          </Card>

          {/* Event Details */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                {event.event_name}
              </h3>

              {/* Date Display */}
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex flex-col items-center justify-center text-primary-foreground shadow-lg">
                    <div className="text-3xl font-bold">{dateInfo.day}</div>
                    <div className="text-xs uppercase">{dateInfo.month}</div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-foreground">{dateInfo.full}</p>
                  <p className="text-sm text-muted-foreground">{dateInfo.year}</p>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-start gap-3 justify-center text-left mb-6">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Lokasi Acara</p>
                  <p className="text-muted-foreground">{event.venue}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleAddToCalendar}
                  variant="outline"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Tambah ke Kalender
                </Button>
                <Button
                  onClick={handleShareWhatsApp}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share via WhatsApp
                </Button>
              </div>
            </div>
          </Card>

          {/* QR Code Section */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              QR Code untuk Check-in
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tunjukkan QR code ini saat tiba di lokasi acara
            </p>

            {qrDataUrl ? (
              <div className="inline-block p-6 bg-card rounded-2xl shadow-lg border-2 border-border">
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-64 h-64 mx-auto"
                />
                <p className="text-xs text-muted-foreground mt-4 font-mono">{guest.qr_code}</p>
              </div>
            ) : (
              <div className="w-64 h-64 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading QR...</div>
              </div>
            )}

            <Button
              onClick={handleDownloadQR}
              variant="outline"
              className="mt-6"
              disabled={!qrDataUrl}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 text-muted-foreground">
            <p className="text-sm">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami
            </p>
            <p className="text-sm">
              apabila Bapak/Ibu/Saudara/i berkenan hadir
            </p>
            <p className="text-sm mt-4">
              untuk memberikan doa restu kepada kedua mempelai
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
