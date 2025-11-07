'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getDashboardStats, DashboardStats } from '@/lib/services/dashboard-stats'
import { toast } from 'sonner'
import {
  Plus,
  Calendar,
  CalendarClock,
  Users,
  CheckCircle,
} from 'lucide-react'

import StatsCard from '@/components/dashboard/StatsCard'
import VisitorChart from '@/components/dashboard/VisitorChart'
import RecentEventsTable from '@/components/dashboard/RecentEventsTable'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState<'7days' | '30days' | '3months'>('7days')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadDashboardStats()
    }
  }, [user])

  const loadDashboardStats = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getDashboardStats(user.id)
      setStats(data)
    } catch (error: any) {
      toast.error('Gagal memuat dashboard stats')
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <DashboardSkeleton />
  }

  if (!user || !stats) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali, {user.user_metadata?.name || user.email}
          </p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/events/create">
            <Plus className="w-5 h-5 mr-2" />
            Buat Event Baru
          </Link>
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          change={stats.eventsChange}
          trend="Pertumbuhan stabil"
          subtitle="Semua event yang dibuat"
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
        />

        <StatsCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          change={stats.upcomingChange}
          trend="30 hari ke depan"
          subtitle="Event yang akan datang"
          icon={<CalendarClock className="w-5 h-5 text-blue-600" />}
        />

        <StatsCard
          title="Total Guests"
          value={stats.totalGuests}
          change={stats.guestsChange}
          trend="Bertambah terus"
          subtitle="Semua tamu di semua event"
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />

        <StatsCard
          title="Check-ins Hari Ini"
          value={stats.todayCheckins}
          change={stats.checkinsChange}
          trend="Event aktif hari ini"
          subtitle="Check-in real-time"
          icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
        />
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Aktivitas Check-in</CardTitle>
              <CardDescription className="mt-1">
                Total check-in dari waktu ke waktu
              </CardDescription>
            </div>

            <Tabs
              value={chartPeriod}
              onValueChange={(value) => setChartPeriod(value as typeof chartPeriod)}
            >
              <TabsList>
                <TabsTrigger value="7days">7 Hari</TabsTrigger>
                <TabsTrigger value="30days">30 Hari</TabsTrigger>
                <TabsTrigger value="3months">3 Bulan</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <VisitorChart period={chartPeriod} />
        </CardContent>
      </Card>

      {/* Recent Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Terbaru</CardTitle>
          <CardDescription>5 event terbaru Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentEventsTable events={stats.recentEvents} />
        </CardContent>
      </Card>
    </div>
  )
}
