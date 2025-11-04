'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, TrendingUp, Users, UserCheck } from 'lucide-react'
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
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    title: 'Upcoming Events',
    key: 'upcomingEvents',
    icon: TrendingUp,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    title: 'Total Guests',
    key: 'totalGuests',
    icon: Users,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    title: 'Active Check-ins',
    key: 'activeCheckins',
    icon: UserCheck,
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-600',
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-full mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const value = stats[stat.key as keyof typeof stats]

        return (
          <Card
            key={stat.key}
            className="overflow-hidden transition-all duration-300 hover:shadow-md border-border"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
