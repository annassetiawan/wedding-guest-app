'use client'

import { EventWithStats } from '@/lib/services/events'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface EventCardProps {
  event: EventWithStats
  onEdit?: (eventId: string) => void
  onDelete?: (eventId: string) => void
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const eventDate = new Date(event.event_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = eventDate.toDateString() === today.toDateString()
  const isUpcoming = eventDate >= today
  const isPast = eventDate < today

  const getStatusBadge = () => {
    if (isToday) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">Hari Ini</Badge>
      )
    }
    if (isUpcoming) {
      return <Badge>Mendatang</Badge>
    }
    return <Badge variant="secondary">Selesai</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const checkinPercentage =
    event.guest_count > 0 ? Math.round((event.checked_in_count / event.guest_count) * 100) : 0

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-border group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {event.event_name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {event.bride_name} & {event.groom_name}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Date */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(event.event_date)}</span>
        </div>

        {/* Venue */}
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{event.venue}</span>
        </div>

        {/* Guest Count */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          <span>{event.guest_count} tamu</span>
        </div>

        {/* Check-in Progress */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Check-in Progress</span>
            <span className="font-semibold text-foreground">
              {event.checked_in_count}/{event.guest_count}
            </span>
          </div>
          <Progress value={checkinPercentage} className="h-2" />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 border-t pt-4 pb-4">
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>Lihat Detail</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
