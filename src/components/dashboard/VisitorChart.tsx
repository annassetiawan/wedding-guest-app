'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { getCheckinTimeline, CheckinTimelineData } from '@/lib/services/dashboard-stats'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface VisitorChartProps {
  period: '7days' | '30days' | '3months'
}

const chartConfig = {
  checkins: {
    label: 'Check-ins',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

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
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 5)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="checkins"
          type="natural"
          fill="var(--color-checkins)"
          fillOpacity={0.4}
          stroke="var(--color-checkins)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  )
}
