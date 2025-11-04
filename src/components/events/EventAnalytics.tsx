'use client'

import { Guest } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Users, UserCheck, Clock, TrendingUp, Calendar } from 'lucide-react'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'

interface EventAnalyticsProps {
  guests: Guest[]
}

const COLORS = {
  VIP: 'hsl(var(--primary))',
  Regular: 'hsl(var(--muted))',
  Family: 'hsl(var(--accent))',
}

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
      name: category,
      value: count,
      percentage: Math.round((count / stats.total) * 100),
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
    return timelineData.sort((a, b) => b.count - a.count).slice(0, 10)
  }, [timelineData])

  // Attendance status data for pie chart
  const attendanceData = [
    { name: 'Checked In', value: stats.checkedIn, color: 'hsl(142 76% 36%)' },
    { name: 'Not Checked In', value: stats.notCheckedIn, color: 'hsl(var(--muted))' },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All invited guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {stats.attendanceRate}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.notCheckedIn}</div>
            <p className="text-xs text-muted-foreground">Not checked in yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS] || 'hsl(var(--primary))'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in Status</CardTitle>
            <CardDescription>Overall attendance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Check-ins"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Hours Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Check-in Hours</CardTitle>
              <CardDescription>Top 10 busiest hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Check-ins" />
                </BarChart>
              </ResponsiveContainer>
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
