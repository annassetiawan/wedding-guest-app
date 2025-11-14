'use client'

import { EventWithStats } from '@/lib/services/events'
import { useActiveEvent } from '@/contexts/EventContext'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2, QrCode, TrendingUp, UserCheck } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, isToday, isFuture, isPast } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface EventCardProps {
  event: EventWithStats
  onEdit?: (eventId: string) => void
  onDelete?: (eventId: string) => void
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const router = useRouter()
  const { setActiveEvent } = useActiveEvent()

  const handleCardClick = () => {
    // Set this event as active
    setActiveEvent(event.id, event)
    // Navigate to event overview
    router.push(`/events/${event.id}/overview`)
  }
  const eventDate = new Date(event.event_date)

  const isTodayEvent = isToday(eventDate)
  const isUpcomingEvent = isFuture(eventDate)
  const isPastEvent = isPast(eventDate) && !isTodayEvent

  const getStatusInfo = () => {
    if (isTodayEvent) {
      return {
        label: 'Hari Ini',
        variant: 'default' as const,
      }
    }
    if (isUpcomingEvent) {
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

  const checkinPercentage =
    event.guest_count > 0 ? Math.round((event.checked_in_count / event.guest_count) * 100) : 0

  const statusInfo = getStatusInfo()

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "hover:shadow-md border-border"
    )}>
      {/* Icon Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Calendar className="w-5 h-5 text-foreground" />
        </div>
      </div>

      <div onClick={handleCardClick} className="cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between pr-14">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors mb-2">
                {event.event_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {event.bride_name} & {event.groom_name}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant} className="font-medium">
              {statusInfo.label}
            </Badge>
            {checkinPercentage >= 80 && event.guest_count > 0 && (
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                High Attendance
              </Badge>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{format(eventDate, 'd MMMM yyyy, EEEE', { locale: idLocale })}</span>
          </div>

          {/* Venue */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total Tamu</span>
                <span className="text-sm font-bold">{event.guest_count}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <UserCheck className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Check-in</span>
                <span className="text-sm font-bold text-primary">{event.checked_in_count}</span>
              </div>
            </div>
          </div>

          {/* Check-in Progress */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Check-in Progress</span>
              <span className="font-bold text-foreground">
                {checkinPercentage}%
              </span>
            </div>
            <Progress value={checkinPercentage} className="h-2" />
          </div>
        </CardContent>
      </div>

      <CardFooter className="bg-muted/30 border-t pt-4 pb-4 gap-2">
        <Button onClick={handleCardClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          Lihat Detail
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/events/${event.id}/checkin`}>
                <QrCode className="mr-2 h-4 w-4" />
                <span>Start Check-in</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit?.(event.id)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(event.id)}
              className="cursor-pointer text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
