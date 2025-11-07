'use client'

import { EventWithStats } from '@/lib/services/events'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Calendar, MapPin, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format, isFuture, isToday } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface RecentEventsTableProps {
  events: EventWithStats[]
}

export default function RecentEventsTable({ events }: RecentEventsTableProps) {
  const router = useRouter()

  const getEventStatus = (eventDate: string) => {
    const date = new Date(eventDate)

    if (isToday(date)) {
      return {
        label: 'Hari Ini',
        variant: 'default' as const,
      }
    }

    if (isFuture(date)) {
      return {
        label: 'Mendatang',
        variant: 'secondary' as const,
      }
    }

    return {
      label: 'Selesai',
      variant: 'outline' as const,
    }
  }

  const getCheckinProgress = (checkedIn: number, total: number) => {
    if (total === 0) return 0
    return Math.round((checkedIn / total) * 100)
  }

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 80) return 'default'
    if (percentage >= 50) return 'secondary'
    return 'outline'
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Belum ada event terbaru
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Buat event pertama Anda untuk memulai
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead className="hidden md:table-cell">Tanggal</TableHead>
            <TableHead className="hidden lg:table-cell">Venue</TableHead>
            <TableHead className="text-center">Tamu</TableHead>
            <TableHead className="text-center">Check-in</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const status = getEventStatus(event.event_date)
            const progress = getCheckinProgress(event.checked_in_count, event.guest_count)

            return (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.event_name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {format(new Date(event.event_date), 'd MMM yyyy', { locale: idLocale })}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm">
                    {format(new Date(event.event_date), 'd MMMM yyyy', { locale: idLocale })}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{event.venue}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{event.guest_count}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getProgressVariant(progress)}>
                    {progress}% ({event.checked_in_count}/{event.guest_count})
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/events/${event.id}`)}
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/events/${event.id}/edit`)}
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
