import { createClient } from '@/lib/supabase/client'
import { RsvpStatus } from '@/types/database.types'

export interface UpdateRsvpInput {
  rsvp_status: RsvpStatus
  rsvp_message?: string
}

export interface RsvpStats {
  total: number
  pending: number
  attending: number
  not_attending: number
  attendance_rate: number
}

/**
 * Update guest RSVP status
 */
export async function updateRsvpStatus(
  guestId: string,
  input: UpdateRsvpInput
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('guests')
    .update({
      rsvp_status: input.rsvp_status,
      rsvp_message: input.rsvp_message || null,
      rsvp_at: new Date().toISOString(),
    })
    .eq('id', guestId)

  if (error) {
    console.error('Error updating RSVP status:', error)
    throw new Error('Failed to update RSVP status')
  }
}

/**
 * Get RSVP statistics for an event
 */
export async function getRsvpStats(eventId: string): Promise<RsvpStats> {
  const supabase = createClient()

  const { data: guests, error } = await supabase
    .from('guests')
    .select('rsvp_status')
    .eq('event_id', eventId)

  if (error) {
    console.error('Error fetching RSVP stats:', error)
    throw new Error('Failed to fetch RSVP statistics')
  }

  const total = guests.length
  const pending = guests.filter((g) => g.rsvp_status === 'pending').length
  const attending = guests.filter((g) => g.rsvp_status === 'attending').length
  const not_attending = guests.filter(
    (g) => g.rsvp_status === 'not_attending'
  ).length

  const attendance_rate = total > 0 ? (attending / total) * 100 : 0

  return {
    total,
    pending,
    attending,
    not_attending,
    attendance_rate: Math.round(attendance_rate * 10) / 10, // Round to 1 decimal
  }
}

/**
 * Get RSVP breakdown by category
 */
export async function getRsvpBreakdownByCategory(
  eventId: string
): Promise<{ category: string; attending: number; not_attending: number; pending: number }[]> {
  const supabase = createClient()

  const { data: guests, error } = await supabase
    .from('guests')
    .select('category, rsvp_status')
    .eq('event_id', eventId)

  if (error) {
    console.error('Error fetching RSVP breakdown:', error)
    throw new Error('Failed to fetch RSVP breakdown')
  }

  // Group by category
  const breakdown = guests.reduce((acc, guest) => {
    const cat = guest.category
    if (!acc[cat]) {
      acc[cat] = { category: cat, attending: 0, not_attending: 0, pending: 0 }
    }

    if (guest.rsvp_status === 'attending') {
      acc[cat].attending++
    } else if (guest.rsvp_status === 'not_attending') {
      acc[cat].not_attending++
    } else {
      acc[cat].pending++
    }

    return acc
  }, {} as Record<string, { category: string; attending: number; not_attending: number; pending: number }>)

  return Object.values(breakdown)
}

export const rsvpService = {
  updateRsvpStatus,
  getRsvpStats,
  getRsvpBreakdownByCategory,
}
