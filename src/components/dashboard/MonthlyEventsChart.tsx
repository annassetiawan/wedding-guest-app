'use client'

import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { getMonthlyEventsData, MonthlyEventsData } from '@/lib/services/dashboard-stats'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from 'lucide-react'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface MonthlyEventsChartProps {
  months?: number
}

const chartConfig = {
  events: {
    label: 'Events',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export default function MonthlyEventsChart({ months = 6 }: MonthlyEventsChartProps) {
  const { user } = useAuth()
  const [data, setData] = useState<MonthlyEventsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, months])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const monthlyData = await getMonthlyEventsData(user.id, months)
      setData(monthlyData)
    } catch (error) {
      console.error('Error loading monthly events data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[350px] w-full" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Belum Ada Data</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Data akan muncul setelah Anda membuat event
        </p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => {
            // Shorten month name for mobile
            const [month, year] = value.split(' ')
            return `${month} '${year.slice(-2)}`
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar
          dataKey="events"
          fill="var(--color-events)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
