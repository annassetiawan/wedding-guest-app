import { createClient } from '@/lib/supabase/client'
import { Event } from './events'
import { Guest, GuestCategory } from '@/types/database.types'

export interface GlobalAnalytics {
  totalEvents: number
  totalGuests: number
  totalCheckedIn: number
  totalPending: number
  attendanceRate: number
  eventsByMonth: { month: string; count: number }[]
  guestsByCategory: { category: GuestCategory; count: number }[]
  topEvents: { event: Event; guestCount: number; checkedInCount: number }[]
  recentActivity: { event: Event; guest: Guest; checkedInAt: string }[]
}

export const analyticsService = {
  /**
   * Get global analytics across all user's events
   */
  async getGlobalAnalytics(userId: string): Promise<GlobalAnalytics> {
    const supabase = createClient()

    // Fetch all user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: false })

    if (eventsError) throw eventsError

    if (!events || events.length === 0) {
      return {
        totalEvents: 0,
        totalGuests: 0,
        totalCheckedIn: 0,
        totalPending: 0,
        attendanceRate: 0,
        eventsByMonth: [],
        guestsByCategory: [],
        topEvents: [],
        recentActivity: [],
      }
    }

    const eventIds = events.map((e) => e.id)

    // Fetch all guests for these events
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .in('event_id', eventIds)
      .order('checked_in_at', { ascending: false, nullsFirst: false })

    if (guestsError) throw guestsError

    // Calculate metrics
    const totalEvents = events.length
    const totalGuests = guests?.length || 0
    const totalCheckedIn = guests?.filter((g) => g.checked_in).length || 0
    const totalPending = totalGuests - totalCheckedIn
    const attendanceRate = totalGuests > 0 ? (totalCheckedIn / totalGuests) * 100 : 0

    // Events by month
    const eventsByMonthMap = new Map<string, number>()
    events.forEach((event) => {
      const date = new Date(event.event_date)
      const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      eventsByMonthMap.set(month, (eventsByMonthMap.get(month) || 0) + 1)
    })
    const eventsByMonth = Array.from(eventsByMonthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .slice(0, 6)
      .reverse()

    // Guests by category
    const guestsByCategoryMap = new Map<GuestCategory, number>()
    guests?.forEach((guest) => {
      guestsByCategoryMap.set(
        guest.category,
        (guestsByCategoryMap.get(guest.category) || 0) + 1
      )
    })
    const guestsByCategory = Array.from(guestsByCategoryMap.entries()).map(
      ([category, count]) => ({ category, count })
    )

    // Top events by guest count
    const eventStatsMap = new Map<
      string,
      { event: Event; guestCount: number; checkedInCount: number }
    >()

    events.forEach((event) => {
      const eventGuests = guests?.filter((g) => g.event_id === event.id) || []
      const guestCount = eventGuests.length
      const checkedInCount = eventGuests.filter((g) => g.checked_in).length

      eventStatsMap.set(event.id, {
        event,
        guestCount,
        checkedInCount,
      })
    })

    const topEvents = Array.from(eventStatsMap.values())
      .sort((a, b) => b.guestCount - a.guestCount)
      .slice(0, 5)

    // Recent check-in activity
    const recentActivity = (guests || [])
      .filter((g) => g.checked_in && g.checked_in_at)
      .slice(0, 10)
      .map((guest) => {
        const event = events.find((e) => e.id === guest.event_id)!
        return {
          event,
          guest,
          checkedInAt: guest.checked_in_at!,
        }
      })

    return {
      totalEvents,
      totalGuests,
      totalCheckedIn,
      totalPending,
      attendanceRate,
      eventsByMonth,
      guestsByCategory,
      topEvents,
      recentActivity,
    }
  },

  /**
   * Export analytics data to CSV
   */
  async exportAnalyticsToCsv(userId: string): Promise<string> {
    const analytics = await this.getGlobalAnalytics(userId)

    const csvLines: string[] = []

    // Header
    csvLines.push('Wedding Guest Management - Global Analytics Report')
    csvLines.push(`Generated: ${new Date().toLocaleString()}`)
    csvLines.push('')

    // Summary
    csvLines.push('SUMMARY')
    csvLines.push('Metric,Value')
    csvLines.push(`Total Events,${analytics.totalEvents}`)
    csvLines.push(`Total Guests,${analytics.totalGuests}`)
    csvLines.push(`Checked In,${analytics.totalCheckedIn}`)
    csvLines.push(`Pending,${analytics.totalPending}`)
    csvLines.push(`Attendance Rate,${analytics.attendanceRate.toFixed(1)}%`)
    csvLines.push('')

    // Events by Month
    csvLines.push('EVENTS BY MONTH')
    csvLines.push('Month,Count')
    analytics.eventsByMonth.forEach((item) => {
      csvLines.push(`${item.month},${item.count}`)
    })
    csvLines.push('')

    // Guests by Category
    csvLines.push('GUESTS BY CATEGORY')
    csvLines.push('Category,Count')
    analytics.guestsByCategory.forEach((item) => {
      csvLines.push(`${item.category},${item.count}`)
    })
    csvLines.push('')

    // Top Events
    csvLines.push('TOP EVENTS BY GUEST COUNT')
    csvLines.push('Event Name,Date,Total Guests,Checked In,Attendance Rate')
    analytics.topEvents.forEach((item) => {
      const rate =
        item.guestCount > 0 ? ((item.checkedInCount / item.guestCount) * 100).toFixed(1) : '0'
      csvLines.push(
        `"${item.event.event_name}",${item.event.event_date},${item.guestCount},${item.checkedInCount},${rate}%`
      )
    })

    return csvLines.join('\n')
  },
}
