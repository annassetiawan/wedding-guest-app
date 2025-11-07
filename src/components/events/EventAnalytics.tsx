'use client'

import { Guest } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Cell,
  Legend as RechartsLegend,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Users, UserCheck, Clock, TrendingUp, Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'

interface EventAnalyticsProps {
  guests: Guest[]
}

// Chart configurations
const categoryChartConfig = {
  VIP: {
    label: 'VIP',
    color: 'hsl(var(--primary))',
  },
  Regular: {
    label: 'Regular',
    color: 'hsl(var(--muted-foreground))',
  },
  Family: {
    label: 'Family',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig

const attendanceChartConfig = {
  checkedIn: {
    label: 'Checked In',
    color: 'hsl(var(--primary))',
  },
  notCheckedIn: {
    label: 'Not Checked In',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig

const timelineChartConfig = {
  count: {
    label: 'Check-ins',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export default function EventAnalytics({ guests }: EventAnalyticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = guests.length
    const checkedIn = guests.filter((g) => g.checked_in).length
    const notCheckedIn = total - checkedIn
    const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0

    // Category breakdown
    const categoryBreakdown = guests.reduce((acc, guest) => {
      const category = guest.category || 'Regular'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      checkedIn,
      notCheckedIn,
      attendanceRate,
      categoryBreakdown,
    }
  }, [guests])

  // Category breakdown data for pie chart
  const categoryData = useMemo(() => {
    return Object.entries(stats.categoryBreakdown).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / stats.total) * 100),
      fill: `var(--color-${category})`,
    }))
  }, [stats])

  // Check-in timeline data (guests checked in over time)
  const timelineData = useMemo(() => {
    const checkedInGuests = guests
      .filter((g) => g.checked_in && g.checked_in_at)
      .sort((a, b) => {
        if (!a.checked_in_at || !b.checked_in_at) return 0
        return new Date(a.checked_in_at).getTime() - new Date(b.checked_in_at).getTime()
      })

    // Group by hour
    const hourlyCheckIns: Record<string, number> = {}
    checkedInGuests.forEach((guest) => {
      if (!guest.checked_in_at) return
      const hour = format(parseISO(guest.checked_in_at), 'HH:00')
      hourlyCheckIns[hour] = (hourlyCheckIns[hour] || 0) + 1
    })

    return Object.entries(hourlyCheckIns).map(([hour, count]) => ({
      hour,
      count,
    }))
  }, [guests])

  // Peak hours data for bar chart
  const peakHoursData = useMemo(() => {
    return [...timelineData].sort((a, b) => b.count - a.count).slice(0, 10)
  }, [timelineData])

  // Attendance status data for pie chart
  const attendanceData = [
    {
      status: 'checkedIn',
      count: stats.checkedIn,
      fill: 'var(--color-checkedIn)',
    },
    {
      status: 'notCheckedIn',
      count: stats.notCheckedIn,
      fill: 'var(--color-notCheckedIn)',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
              <div className="text-3xl font-bold tracking-tight">{stats.total}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">All invited guests</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Checked In</p>
              <div className="text-3xl font-bold tracking-tight text-primary">{stats.checkedIn}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{stats.attendanceRate}% attendance rate</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <div className="text-3xl font-bold tracking-tight">{stats.notCheckedIn}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Not checked in yet</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
              <div className="text-3xl font-bold tracking-tight">{stats.attendanceRate}%</div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {stats.checkedIn} of {stats.total} guests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Guest Category Breakdown</CardTitle>
            <CardDescription>Distribution by guest category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {stats.total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Guests
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="category" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Attendance Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in Status</CardTitle>
            <CardDescription>Overall attendance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={attendanceData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {stats.attendanceRate}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Attendance
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      {timelineData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          {/* Check-in Timeline Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Check-in Timeline</CardTitle>
              <CardDescription>Guest check-ins over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={timelineChartConfig} className="h-[300px]">
                <LineChart
                  accessibilityLayer
                  data={timelineData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    dataKey="count"
                    type="natural"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-count)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Peak Hours Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Check-in Hours</CardTitle>
              <CardDescription>Top 10 busiest hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={timelineChartConfig} className="h-[300px]">
                <BarChart
                  accessibilityLayer
                  data={peakHoursData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No data state */}
      {timelineData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Check-in Data Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Timeline and peak hours charts will appear once guests start checking in to your
              event.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
