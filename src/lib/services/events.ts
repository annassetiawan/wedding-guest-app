import { createClient } from '@/lib/supabase/client'

// ==================== TYPES ====================

export interface Event {
  id: string
  user_id: string
  event_name: string
  event_date: string
  venue: string
  bride_name: string
  groom_name: string
  photo_url: string | null
  template_id: string
  created_at: string
}

export interface EventWithStats extends Event {
  guest_count: number
  checked_in_count: number
  not_checked_in_count: number
}

export interface CreateEventInput {
  event_name: string
  event_date: string
  venue: string
  bride_name: string
  groom_name: string
  photo_url?: string
  template_id: string
}

export interface UpdateEventInput {
  event_name?: string
  event_date?: string
  venue?: string
  bride_name?: string
  groom_name?: string
  photo_url?: string
  template_id?: string
}

// ==================== SERVICE ====================

export const eventService = {
  /**
   * Create a new event
   * @param userId - The ID of the user creating the event
   * @param eventData - Event data to create
   * @returns The newly created event
   */
  async createEvent(userId: string, eventData: CreateEventInput): Promise<Event> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          user_id: userId,
          event_name: eventData.event_name,
          event_date: eventData.event_date,
          venue: eventData.venue,
          bride_name: eventData.bride_name,
          groom_name: eventData.groom_name,
          photo_url: eventData.photo_url || null,
          template_id: eventData.template_id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)

      if (error.code === '42P01') {
        throw new Error('Database table "events" does not exist. Please run the database setup SQL script.')
      }
      if (error.code === '42501') {
        throw new Error('Permission denied. Please check Row Level Security policies.')
      }
      if (error.code === '23505') {
        throw new Error('An event with this information already exists.')
      }

      throw new Error(error.message || 'Failed to create event')
    }

    if (!data) {
      throw new Error('No data returned after creating event')
    }

    return data
  },

  /**
   * Get all events for a specific user
   * @param userId - The user ID to fetch events for
   * @returns Array of events
   */
  async getEventsByUserId(userId: string): Promise<Event[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)

      if (error.code === '42P01') {
        throw new Error('Database table "events" does not exist. Please run the database setup SQL script.')
      }

      throw new Error(error.message || 'Failed to fetch events')
    }

    return data || []
  },

  /**
   * Get events with guest statistics
   * @param userId - The user ID to fetch events for
   * @returns Array of events with guest stats
   */
  async getEventsWithStats(userId: string): Promise<EventWithStats[]> {
    const supabase = createClient()

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)

      if (error.code === '42P01') {
        throw new Error('Database table "events" does not exist. Please run the database setup SQL script.')
      }

      throw new Error(error.message || 'Failed to fetch events')
    }

    if (!events || events.length === 0) {
      return []
    }

    // Get guest counts for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const { data: guests } = await supabase
          .from('guests')
          .select('checked_in')
          .eq('event_id', event.id)

        const guest_count = guests?.length || 0
        const checked_in_count = guests?.filter((g) => g.checked_in).length || 0
        const not_checked_in_count = guests?.filter((g) => !g.checked_in).length || 0

        return {
          ...event,
          guest_count,
          checked_in_count,
          not_checked_in_count,
        }
      })
    )

    return eventsWithStats
  },

  /**
   * Get a single event by ID
   * @param eventId - The event ID
   * @returns The event or null if not found
   */
  async getEventById(eventId: string): Promise<Event | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Row not found
        return null
      }

      console.error('Error fetching event:', error)
      throw new Error(error.message || 'Failed to fetch event')
    }

    return data
  },

  /**
   * Update an existing event
   * @param eventId - The event ID to update
   * @param eventData - Partial event data to update
   * @returns The updated event
   */
  async updateEvent(eventId: string, eventData: UpdateEventInput): Promise<Event> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)

      if (error.code === 'PGRST116') {
        throw new Error('Event not found')
      }
      if (error.code === '42501') {
        throw new Error('Permission denied. You can only update your own events.')
      }

      throw new Error(error.message || 'Failed to update event')
    }

    if (!data) {
      throw new Error('No data returned after updating event')
    }

    return data
  },

  /**
   * Delete an event
   * @param eventId - The event ID to delete
   */
  async deleteEvent(eventId: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)

      if (error.code === '42501') {
        throw new Error('Permission denied. You can only delete your own events.')
      }

      throw new Error(error.message || 'Failed to delete event')
    }
  },

  /**
   * Get the current authenticated user
   * @returns The user object or null if not authenticated
   */
  async getCurrentUser() {
    const supabase = createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    return user
  },
}

// ==================== EXPORTS ====================

export default eventService
