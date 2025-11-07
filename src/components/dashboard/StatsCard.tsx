'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import CountUp from 'react-countup'

interface StatsCardProps {
  title: string
  value: string | number
  change: number
  trend: string
  subtitle: string
  icon: React.ReactNode
  gradient?: string // Kept for backwards compatibility but not used
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  subtitle,
  icon,
}: StatsCardProps) {
  const isPositive = change >= 0
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString(), 10)

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md border-border">
      <CardContent className="p-6">
        {/* Icon in corner */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center">
            {icon}
          </div>

          {/* Change indicator */}
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md',
            isPositive
              ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950/50'
              : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/50'
          )}>
            {isPositive ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1 mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          {/* Main value with count-up animation */}
          <div className="text-3xl font-bold tracking-tight">
            {typeof numericValue === 'number' && !isNaN(numericValue) ? (
              <CountUp end={numericValue} duration={1} separator="," />
            ) : (
              value
            )}
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
          )}
          <span className="font-medium">{trend}</span>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}
