'use client'

import { Guest } from '@/types/database.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import {
  User,
  Phone,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  QrCode as QrCodeIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface GuestDetailsDialogProps {
  guest: Guest | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GuestDetailsDialog({
  guest,
  open,
  onOpenChange,
}: GuestDetailsDialogProps) {
  if (!guest) return null

  const getRsvpStatusInfo = (status: string) => {
    switch (status) {
      case 'attending':
        return {
          label: 'Hadir',
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
        }
      case 'not_attending':
        return {
          label: 'Tidak Hadir',
          icon: XCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
        }
      default:
        return {
          label: 'Pending',
          icon: Clock,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
        }
    }
  }

  const rsvpInfo = getRsvpStatusInfo(guest.rsvp_status)
  const RsvpIcon = rsvpInfo.icon

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '-'
    try {
      return format(new Date(timestamp), "d MMMM yyyy, HH:mm 'WIB'", {
        locale: idLocale,
      })
    } catch {
      return '-'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary">
                {guest.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div>{guest.name}</div>
              <DialogDescription className="text-sm mt-1">
                Detail informasi tamu undangan
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                    <p className="font-medium truncate">{guest.name}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">No. Telepon</p>
                    <p className="font-medium truncate">{guest.phone || '-'}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Kategori</p>
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
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <QrCodeIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">QR Code</p>
                    <p className="font-mono text-xs truncate">{guest.qr_code}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RSVP Status */}
          <Card className={`border-2 ${rsvpInfo.borderColor} ${rsvpInfo.bgColor}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${rsvpInfo.bgColor} flex items-center justify-center flex-shrink-0 border-2 ${rsvpInfo.borderColor}`}
                >
                  <RsvpIcon className={`w-6 h-6 ${rsvpInfo.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Status RSVP
                    </p>
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
                      {rsvpInfo.label}
                    </Badge>
                  </div>
                  <p className={`text-lg font-semibold ${rsvpInfo.color}`}>
                    {guest.rsvp_status === 'attending'
                      ? 'Tamu akan hadir'
                      : guest.rsvp_status === 'not_attending'
                      ? 'Tamu tidak dapat hadir'
                      : 'Menunggu konfirmasi'}
                  </p>
                  {guest.rsvp_at && (
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Dikonfirmasi pada {formatTimestamp(guest.rsvp_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* RSVP Message */}
              {guest.rsvp_message && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>Pesan dari Tamu</span>
                    </div>
                    <div className="bg-background rounded-lg p-4 border">
                      <p className="text-sm italic leading-relaxed">
                        "{guest.rsvp_message}"
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Check-in Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Kehadiran</p>
                    <p className="font-medium">
                      {guest.checked_in ? 'Sudah check-in' : 'Belum check-in'}
                    </p>
                  </div>
                </div>
                <Badge variant={guest.checked_in ? 'default' : 'secondary'}>
                  {guest.checked_in ? 'Hadir' : 'Belum hadir'}
                </Badge>
              </div>
              {guest.checked_in_at && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Check-in pada {formatTimestamp(guest.checked_in_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium mb-1">Dibuat pada</p>
              <p>{formatTimestamp(guest.created_at)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium mb-1">Terakhir diperbarui</p>
              <p>{formatTimestamp(guest.updated_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
