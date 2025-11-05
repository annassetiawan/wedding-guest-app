"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventWithStats } from "@/lib/services/events"
import { format, isPast, isFuture } from "date-fns"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RecentEventsProps {
  events: EventWithStats[]
}

export default function RecentEvents({ events }: RecentEventsProps) {
  // Get the 5 most recent events (sorted by date)
  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    .slice(0, 5)

  const getEventStatus = (eventDate: string) => {
    const date = new Date(eventDate)
    if (isPast(date)) {
      return { label: "Completed", variant: "secondary" as const }
    }
    if (isFuture(date)) {
      return { label: "Upcoming", variant: "default" as const }
    }
    return { label: "Today", variant: "default" as const }
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              Your latest wedding events
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No events yet</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/events/create">Create Your First Event</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => {
              const status = getEventStatus(event.event_date)

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Link
                          href={`/events/${event.id}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {event.event_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {event.bride_name} & {event.groom_name}
                        </p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{event.checked_in_count}/{event.guest_count} checked in</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
