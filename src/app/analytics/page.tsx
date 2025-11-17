'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { analyticsService, GlobalAnalytics } from '@/lib/services/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const chartConfig = {
  count: {
    label: 'Events',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await analyticsService.getGlobalAnalytics(user.id)
      setAnalytics(data)
    } catch (error: any) {
      console.error('Error loading analytics:', error)
      toast.error(error.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCsv = async () => {
    if (!user) return

    try {
      setExporting(true)
      const csvContent = await analyticsService.exportAnalyticsToCsv(user.id)

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`)
      link.className = 'sr-only'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Analytics exported successfully')
    } catch (error: any) {
      console.error('Error exporting analytics:', error)
      toast.error(error.message || 'Failed to export analytics')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Events Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics || analytics.totalEvents === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">No Data Yet</CardTitle>
            <CardDescription>
              Create your first event to see analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/events/create">Create First Event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Global Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Comprehensive insights across all your events
          </p>
        </div>
        <Button onClick={handleExportCsv} disabled={exporting} variant="outline" className="hover:bg-accent hover:border-accent-foreground/20 dark:hover:bg-accent dark:hover:border-accent-foreground/30 transition-all">
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              All time events created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCheckedIn}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.attendanceRate.toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Not yet checked in
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Events by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Month</CardTitle>
            <CardDescription>Distribution of events over time</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.eventsByMonth.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  accessibilityLayer
                  data={analytics.eventsByMonth}
                  margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Guests by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Guests by Category</CardTitle>
            <CardDescription>Distribution of guest types</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.guestsByCategory.length > 0 ? (
              <div className="space-y-4">
                {analytics.guestsByCategory.map((item, index) => {
                  const percentage = ((item.count / analytics.totalGuests) * 100).toFixed(1)

                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.category}</Badge>
                        <span className="text-sm text-muted-foreground">{item.count} guests</span>
                      </div>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events by Guest Count</CardTitle>
          <CardDescription>Your largest events ranked by number of guests</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topEvents.length > 0 ? (
            <div className="space-y-4">
              {analytics.topEvents.map((item, index) => {
                const attendanceRate = item.guestCount > 0
                  ? ((item.checkedInCount / item.guestCount) * 100).toFixed(1)
                  : '0'
                const isHighAttendance = parseFloat(attendanceRate) >= 70

                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold">{item.event.event_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.event.event_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <Users className="inline h-4 w-4 mr-1" />
                          {item.guestCount} guests
                        </span>
                        <span className="text-muted-foreground">
                          <CheckCircle2 className="inline h-4 w-4 mr-1" />
                          {item.checkedInCount} checked in
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {isHighAttendance ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-orange-600" />
                          )}
                          <span className={`text-lg font-bold ${isHighAttendance ? 'text-green-600' : 'text-orange-600'}`}>
                            {attendanceRate}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">attendance</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/events/${item.event.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No events found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
          <CardDescription>Latest guest check-in activity</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">{item.guest.name}</p>
                      <p className="text-sm text-muted-foreground">{item.event.event_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{item.guest.category}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.checkedInAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent check-ins
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
