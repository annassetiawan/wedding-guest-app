'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, X, Loader2, Heart } from 'lucide-react'
import { RsvpStatus } from '@/types/database.types'
import { rsvpService } from '@/lib/services/rsvp'
import { toast } from 'sonner'

interface RsvpSectionProps {
  guestId: string
  guestName: string
  currentStatus: RsvpStatus
  onSuccess?: () => void
}

export default function RsvpSection({
  guestId,
  guestName,
  currentStatus,
  onSuccess,
}: RsvpSectionProps) {
  const [selectedStatus, setSelectedStatus] = useState<RsvpStatus>(currentStatus)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(currentStatus !== 'pending')

  const handleSubmit = async (status: RsvpStatus) => {
    try {
      setLoading(true)

      await rsvpService.updateRsvpStatus(guestId, {
        rsvp_status: status,
        rsvp_message: message.trim() || undefined,
      })

      setSelectedStatus(status)
      setConfirmed(true)

      if (status === 'attending') {
        toast.success('Terima kasih sudah mengkonfirmasi kehadiran! 🎉', {
          description: 'Kami tunggu kehadirannya ya!',
        })
      } else {
        toast.success('Terima kasih atas konfirmasinya', {
          description: 'Semoga bisa bertemu di lain kesempatan',
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating RSVP:', error)
      toast.error('Gagal menyimpan konfirmasi', {
        description: 'Silakan coba lagi dalam beberapa saat',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRsvp = () => {
    setConfirmed(false)
  }

  if (confirmed) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {selectedStatus === 'attending' ? (
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Heart className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {selectedStatus === 'attending'
              ? 'Konfirmasi Kehadiran Berhasil!'
              : 'Terima Kasih Atas Konfirmasinya'}
          </CardTitle>
          <CardDescription className="text-base">
            {selectedStatus === 'attending'
              ? 'Kami sangat senang Anda bisa hadir di acara kami 🎉'
              : 'Terima kasih sudah memberitahukan. Semoga bisa bertemu di lain kesempatan'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-muted rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-1">Status RSVP Anda</p>
            <p className="font-semibold text-foreground">
              {selectedStatus === 'attending' ? 'Hadir' : 'Tidak Hadir'}
            </p>
            {message && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Pesan Anda</p>
                <p className="text-sm text-foreground italic">"{message}"</p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleChangeRsvp}
            className="text-xs"
          >
            Ubah Konfirmasi
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Konfirmasi Kehadiran</CardTitle>
        <CardDescription className="text-base">
          Mohon konfirmasi kehadiran Anda di acara kami
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RSVP Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={selectedStatus === 'attending' ? 'default' : 'outline'}
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => setSelectedStatus('attending')}
            disabled={loading}
          >
            <Check className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Hadir</div>
              <div className="text-xs opacity-80">Saya akan hadir</div>
            </div>
          </Button>

          <Button
            variant={selectedStatus === 'not_attending' ? 'default' : 'outline'}
            className="h-auto py-6 flex flex-col items-center gap-2"
            onClick={() => setSelectedStatus('not_attending')}
            disabled={loading}
          >
            <X className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Tidak Hadir</div>
              <div className="text-xs opacity-80">Maaf tidak bisa</div>
            </div>
          </Button>
        </div>

        {/* Optional Message */}
        {selectedStatus !== 'pending' && (
          <div className="space-y-2">
            <Label htmlFor="message">
              Pesan (Opsional)
            </Label>
            <Textarea
              id="message"
              placeholder={
                selectedStatus === 'attending'
                  ? 'Tulis ucapan atau pertanyaan...'
                  : 'Tulis alasan atau ucapan...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={loading}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={() => handleSubmit(selectedStatus)}
          disabled={selectedStatus === 'pending' || loading}
          className="w-full h-12 text-base"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Heart className="mr-2 h-5 w-5" />
              Kirim Konfirmasi
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Dengan mengkonfirmasi, Anda membantu kami dalam persiapan acara
        </p>
      </CardContent>
    </Card>
  )
}
