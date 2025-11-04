'use client'

import { useState, useEffect } from 'react'
import { Event } from '@/lib/services/events'
import { Guest } from '@/types/database.types'
import { generateQRCodeDataURL } from '@/lib/utils/qrcode'
import { Calendar, MapPin, Share2, Download, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ElegantTemplateProps {
  event: Event
  guest: Guest
}

export default function ElegantTemplate({ event, guest }: ElegantTemplateProps) {
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
      month: date.toLocaleDateString('id-ID', { month: 'long' }),
      year: date.toLocaleDateString('id-ID', { year: 'numeric' }),
    }
  }

  const handleAddToCalendar = () => {
    const date = new Date(event.event_date)
    const title = `Wedding ${event.bride_name} & ${event.groom_name}`
    const details = `Undangan pernikahan di ${event.venue}`

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Decorative Border */}
      <div className="border-t-4 border-amber-600"></div>

      <div
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container max-w-3xl mx-auto px-4 py-16">
          {/* Ornamental Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <Heart className="h-12 w-12 text-amber-600 mx-auto fill-amber-600" />
            </div>
            <p className="text-sm text-amber-800 uppercase tracking-[0.3em] mb-8 font-serif">
              Wedding Invitation
            </p>

            {/* Names */}
            <div className="space-y-4">
              <h1 className="font-serif text-6xl md:text-7xl font-light text-amber-900 italic">
                {event.bride_name}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-amber-600"></div>
                <Heart className="h-6 w-6 text-amber-600 fill-amber-600" />
                <div className="h-px w-16 bg-amber-600"></div>
              </div>
              <h1 className="font-serif text-6xl md:text-7xl font-light text-amber-900 italic">
                {event.groom_name}
              </h1>
            </div>
          </div>

          {/* Guest Card */}
          <div className="mb-12 text-center">
            <div className="inline-block">
              <div className="border-2 border-amber-600 p-8 bg-amber-50/50">
                <p className="text-xs text-amber-800 uppercase tracking-widest mb-3 font-serif">
                  Dear
                </p>
                <h2 className="text-2xl font-serif text-amber-900 mb-3">
                  {guest.name}
                </h2>
                <div className="inline-block px-6 py-2 border border-amber-600 bg-white">
                  <p className="text-xs font-serif text-amber-800 uppercase tracking-wider">
                    {guest.category} Guest
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Card */}
          <Card className="p-12 border-2 border-amber-600 bg-white shadow-xl mb-8">
            <div className="text-center space-y-8">
              {/* Event Name */}
              <div>
                <h3 className="text-3xl font-serif font-light text-amber-900 mb-4">
                  {event.event_name}
                </h3>
                <div className="h-px w-24 bg-amber-600 mx-auto"></div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <p className="text-xs text-amber-800 uppercase tracking-widest font-serif">
                  Date
                </p>
                <p className="text-xl font-serif text-amber-900">{dateInfo.full}</p>
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <p className="text-xs text-amber-800 uppercase tracking-widest font-serif">
                    Venue
                  </p>
                </div>
                <p className="text-lg font-serif text-amber-900 max-w-md mx-auto">
                  {event.venue}
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="h-px w-12 bg-amber-300"></div>
                <Heart className="h-4 w-4 text-amber-600 fill-amber-600" />
                <div className="h-px w-12 bg-amber-300"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleAddToCalendar}
                  variant="outline"
                  className="border-2 border-amber-600 text-amber-900 hover:bg-amber-50 font-serif"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button
                  onClick={handleShareWhatsApp}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-serif"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Invitation
                </Button>
              </div>
            </div>
          </Card>

          {/* QR Code Section */}
          <Card className="p-10 border-2 border-amber-600 bg-amber-50/30 text-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-serif font-light text-amber-900 mb-3">
                  Check-in QR Code
                </h3>
                <div className="h-px w-16 bg-amber-600 mx-auto mb-4"></div>
                <p className="text-sm text-amber-800 font-serif">
                  Please present this QR code upon arrival
                </p>
              </div>

              {qrDataUrl ? (
                <div className="inline-block p-8 bg-white border-2 border-amber-600 shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                  <p className="text-xs text-amber-700 mt-4 font-mono tracking-wider">
                    {guest.qr_code}
                  </p>
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto bg-amber-100 border-2 border-amber-600 flex items-center justify-center">
                  <div className="animate-pulse text-amber-600 font-serif">
                    Loading QR Code...
                  </div>
                </div>
              )}

              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="border-2 border-amber-600 text-amber-900 hover:bg-amber-50 font-serif"
                disabled={!qrDataUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </Card>

          {/* Closing Message */}
          <div className="text-center mt-16 space-y-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-amber-300"></div>
              <Heart className="h-4 w-4 text-amber-600 fill-amber-600" />
              <div className="h-px w-12 bg-amber-300"></div>
            </div>
            <p className="text-sm font-serif text-amber-900 italic max-w-md mx-auto leading-relaxed">
              "We would be honored by your presence as we celebrate our union and begin our journey together as husband and wife"
            </p>
            <p className="text-xs text-amber-800 uppercase tracking-widest font-serif mt-8">
              With Love
            </p>
            <p className="text-lg font-serif text-amber-900 italic">
              {event.bride_name} & {event.groom_name}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Border */}
      <div className="border-b-4 border-amber-600"></div>
    </div>
  )
}
