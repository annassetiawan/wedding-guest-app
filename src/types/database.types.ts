export type GuestCategory = 'VIP' | 'Regular' | 'Family'
export type RsvpStatus = 'pending' | 'attending' | 'not_attending'

// Re-export Event types from service for convenience
export type {
  Event,
  EventWithStats,
  CreateEventInput,
  UpdateEventInput,
} from '@/lib/services/events'

export interface Guest {
  id: string
  event_id: string
  name: string
  phone: string
  category: GuestCategory
  qr_code: string
  checked_in: boolean
  checked_in_at?: string
  invitation_link: string
  rsvp_status: RsvpStatus
  rsvp_message?: string
  rsvp_at?: string
  created_at: string
  updated_at: string
}
