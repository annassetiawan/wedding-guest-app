'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getCheckinTimeline, CheckinTimelineData } from '@/lib/services/dashboard-stats'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

interface VisitorChartProps {
  period: '7days' | '30days' | '3months'
}

export default function VisitorChart({ period }: VisitorChartProps) {
  const { user } = useAuth()
  const [data, setData] = useState<CheckinTimelineData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, period])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const timelineData = await getCheckinTimeline(user.id, period)
      setData(timelineData)
    } catch (error) {
      console.error('Error loading checkin timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[350px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Belum ada data check-in untuk periode ini
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Data akan muncul setelah ada tamu yang check-in
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {payload[0].payload.date}
                      </span>
                      <span className="text-sm font-bold">
                        {payload[0].value} Check-ins
                      </span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="checkins"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCheckins)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
