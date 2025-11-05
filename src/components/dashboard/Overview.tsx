"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { EventWithStats } from "@/lib/services/events"
import { format, subDays, startOfDay } from "date-fns"

interface OverviewProps {
  events: EventWithStats[]
}

export default function Overview({ events }: OverviewProps) {
  // Prepare data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i))
    return {
      date: date,
      dateLabel: format(date, 'EEE'),
      guests: 0,
      checkins: 0,
    }
  })

  // Aggregate event data
  events.forEach(event => {
    const eventDate = startOfDay(new Date(event.event_date))
    const dayData = last7Days.find(d => d.date.getTime() === eventDate.getTime())

    if (dayData) {
      dayData.guests += event.guest_count
      dayData.checkins += event.checked_in_count
    }
  })

  const chartData = last7Days.map(({ dateLabel, guests, checkins }) => ({
    day: dateLabel,
    guests,
    checkins,
  }))

  // Monthly stats
  const currentMonth = new Date().getMonth()
  const monthlyEvents = events.filter(e => new Date(e.event_date).getMonth() === currentMonth)
  const totalMonthlyGuests = monthlyEvents.reduce((sum, e) => sum + e.guest_count, 0)
  const totalMonthlyCheckins = monthlyEvents.reduce((sum, e) => sum + e.checked_in_count, 0)

  const guestChartConfig = {
    guests: {
      label: "Guests",
      color: "hsl(var(--chart-1))",
    },
  }

  const checkinChartConfig = {
    checkins: {
      label: "Check-ins",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Guest Overview</CardTitle>
          <CardDescription>
            Total guests registered in the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={guestChartConfig} className="h-[300px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="guests"
                fill="var(--color-guests)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Check-in Trend</CardTitle>
          <CardDescription>
            Guest check-ins over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={checkinChartConfig} className="h-[300px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="checkins"
                stroke="var(--color-checkins)"
                strokeWidth={2}
                dot={{ fill: "var(--color-checkins)", r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>This Month</CardTitle>
          <CardDescription>
            Statistics for {format(new Date(), 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Total Events</p>
                <p className="text-sm text-muted-foreground">
                  Events scheduled this month
                </p>
              </div>
              <div className="text-2xl font-bold">{monthlyEvents.length}</div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Total Guests</p>
                <p className="text-sm text-muted-foreground">
                  Expected attendees
                </p>
              </div>
              <div className="text-2xl font-bold">{totalMonthlyGuests}</div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Check-ins</p>
                <p className="text-sm text-muted-foreground">
                  Guests who have checked in
                </p>
              </div>
              <div className="text-2xl font-bold">{totalMonthlyCheckins}</div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Attendance Rate</p>
                <p className="text-sm text-muted-foreground">
                  Check-in percentage
                </p>
              </div>
              <div className="text-2xl font-bold">
                {totalMonthlyGuests > 0
                  ? Math.round((totalMonthlyCheckins / totalMonthlyGuests) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>
            Overall platform statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Avg. Guests per Event</p>
                <p className="text-2xl font-bold">
                  {events.length > 0
                    ? Math.round(events.reduce((sum, e) => sum + e.guest_count, 0) / events.length)
                    : 0}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Overall Attendance</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + e.guest_count, 0) > 0
                    ? Math.round(
                        (events.reduce((sum, e) => sum + e.checked_in_count, 0) /
                          events.reduce((sum, e) => sum + e.guest_count, 0)) *
                          100
                      )
                    : 0}%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Upcoming Events</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => new Date(e.event_date) >= new Date()).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
