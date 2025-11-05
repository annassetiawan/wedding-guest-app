'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp, Users, UserCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardsProps {
  totalEvents: number
  upcomingEvents: number
  totalGuests: number
  activeCheckins: number
  loading?: boolean
}

const statCards = [
  {
    title: 'Total Events',
    key: 'totalEvents',
    icon: Calendar,
    description: 'All events created',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Upcoming Events',
    key: 'upcomingEvents',
    icon: TrendingUp,
    description: 'Events scheduled ahead',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Total Guests',
    key: 'totalGuests',
    icon: Users,
    description: 'Expected attendees',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Active Check-ins',
    key: 'activeCheckins',
    icon: UserCheck,
    description: 'Guests checked in',
    color: 'text-orange-600 dark:text-orange-400',
  },
]

export default function StatsCards({
  totalEvents,
  upcomingEvents,
  totalGuests,
  activeCheckins,
  loading = false,
}: StatsCardsProps) {
  const stats = {
    totalEvents,
    upcomingEvents,
    totalGuests,
    activeCheckins,
  }

  // Calculate attendance rate for trend
  const attendanceRate = totalGuests > 0
    ? Math.round((activeCheckins / totalGuests) * 100)
    : 0

  // Mock trends (in a real app, you'd compare with previous period)
  const trends = {
    totalEvents: { value: 12, isPositive: true },
    upcomingEvents: { value: 8, isPositive: true },
    totalGuests: { value: 23, isPositive: true },
    activeCheckins: { value: attendanceRate, isPositive: attendanceRate >= 50 },
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const value = stats[stat.key as keyof typeof stats]
        const trend = trends[stat.key as keyof typeof trends]

        return (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {trend.isPositive ? (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3" />
                    +{trend.value}%
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400">
                    <ArrowDownRight className="h-3 w-3" />
                    {trend.value}%
                  </span>
                )}
                <span className="text-muted-foreground ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
