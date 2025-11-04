export type GuestCategory = 'VIP' | 'Regular' | 'Family'

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
  created_at: string
  updated_at: string
}
