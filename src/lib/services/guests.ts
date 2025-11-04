import { createClient } from '@/lib/supabase/client'
import { Guest, GuestCategory } from '@/types/database.types'

export const guestService = {
  // Get all guests for an event
  async getGuestsByEventId(eventId: string): Promise<Guest[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get single guest by ID
  async getGuestById(id: string): Promise<Guest | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new guest
  async createGuest(
    guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'checked_in' | 'checked_in_at' | 'qr_code' | 'invitation_link'>
  ): Promise<Guest> {
    const supabase = createClient()

    // Verify user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      throw new Error('Anda harus login untuk menambahkan tamu')
    }

    // Verify event ownership
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id')
      .eq('id', guestData.event_id)
      .eq('user_id', session.user.id)
      .single()

    if (eventError || !event) {
      console.error('Event verification error:', eventError)
      throw new Error('Event tidak ditemukan atau Anda tidak memiliki akses')
    }

    // Generate QR code and invitation link
    const guestId = crypto.randomUUID()
    const qrCode = `QR-${guestId.substring(0, 8).toUpperCase()}`
    const invitationLink = `${window.location.origin}/invitation/${guestData.event_id}/${guestId}`

    console.log('Creating guest with data:', {
      event_id: guestData.event_id,
      name: guestData.name,
      category: guestData.category,
      qr_code: qrCode,
      user_id: session.user.id
    })

    const { data, error } = await supabase
      .from('guests')
      .insert([{
        ...guestData,
        qr_code: qrCode,
        invitation_link: invitationLink,
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })

      // User-friendly error messages
      if (error.code === '42501') {
        throw new Error('Permission denied. Silakan periksa RLS policies di Supabase.')
      }
      if (error.code === '23505') {
        throw new Error('Tamu dengan data ini sudah ada')
      }
      if (error.code === '23503') {
        throw new Error('Event tidak valid')
      }

      throw new Error(error.message || 'Gagal menambahkan tamu')
    }

    return data
  },

  // Update guest
  async updateGuest(
    id: string,
    guestData: Partial<Omit<Guest, 'id' | 'event_id' | 'created_at' | 'updated_at'>>
  ): Promise<Guest> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .update(guestData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete guest
  async deleteGuest(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('guests').delete().eq('id', id)

    if (error) throw error
  },

  // Check-in guest
  async checkInGuest(id: string): Promise<Guest> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Undo check-in
  async undoCheckIn(id: string): Promise<Guest> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .update({
        checked_in: false,
        checked_in_at: null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Search guests by name or phone
  async searchGuests(eventId: string, query: string): Promise<Guest[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Filter guests by category
  async filterGuestsByCategory(eventId: string, category: GuestCategory): Promise<Guest[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Filter guests by check-in status
  async filterGuestsByCheckedIn(eventId: string, checkedIn: boolean): Promise<Guest[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('event_id', eventId)
      .eq('checked_in', checkedIn)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get guest statistics for an event
  async getGuestStats(eventId: string) {
    const guests = await this.getGuestsByEventId(eventId)

    return {
      total: guests.length,
      checkedIn: guests.filter((g) => g.checked_in).length,
      notCheckedIn: guests.filter((g) => !g.checked_in).length,
      vip: guests.filter((g) => g.category === 'VIP').length,
      regular: guests.filter((g) => g.category === 'Regular').length,
      family: guests.filter((g) => g.category === 'Family').length,
    }
  },
}
