import { createClient } from '@/lib/supabase/client'
import type {
  Vendor,
  VendorWithStats,
  CreateVendorInput,
  UpdateVendorInput,
  VendorFilters,
  VendorStats,
  EventVendor,
  EventVendorWithDetails,
  AssignVendorInput,
  UpdateEventVendorInput,
  EventVendorFilters,
  VendorPaymentStats,
} from '@/types/vendor.types'

// ============================================
// Vendor CRUD Operations
// ============================================

/**
 * Create a new vendor
 */
export async function createVendor(
  userId: string,
  input: CreateVendorInput
): Promise<Vendor> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      user_id: userId,
      ...input,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating vendor:', error)
    throw new Error('Failed to create vendor')
  }

  return data
}

/**
 * Get all vendors for a user
 */
export async function getVendors(
  userId: string,
  filters?: VendorFilters
): Promise<VendorWithStats[]> {
  const supabase = createClient()

  let query = supabase
    .from('vendor_summary')
    .select('*')
    .eq('user_id', userId)

  // Apply filters
  if (filters) {
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters.price_range && filters.price_range !== 'all') {
      query = query.eq('price_range', filters.price_range)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters.min_rating) {
      query = query.gte('rating', filters.min_rating)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`)
    }
  }

  query = query.order('name', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching vendors:', error)
    throw new Error('Failed to fetch vendors')
  }

  return data || []
}

/**
 * Get single vendor by ID
 */
export async function getVendorById(vendorId: string): Promise<Vendor | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .single()

  if (error) {
    console.error('Error fetching vendor:', error)
    return null
  }

  return data
}

/**
 * Update vendor
 */
export async function updateVendor(
  vendorId: string,
  input: UpdateVendorInput
): Promise<Vendor> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vendors')
    .update(input)
    .eq('id', vendorId)
    .select()
    .single()

  if (error) {
    console.error('Error updating vendor:', error)
    throw new Error('Failed to update vendor')
  }

  return data
}

/**
 * Delete vendor
 */
export async function deleteVendor(vendorId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from('vendors').delete().eq('id', vendorId)

  if (error) {
    console.error('Error deleting vendor:', error)
    throw new Error('Failed to delete vendor')
  }
}

/**
 * Get vendor statistics
 */
export async function getVendorStats(userId: string): Promise<VendorStats> {
  const supabase = createClient()

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('category, price_range, rating, is_active')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching vendor stats:', error)
    throw new Error('Failed to fetch vendor statistics')
  }

  const stats: VendorStats = {
    total_vendors: vendors.length,
    active_vendors: vendors.filter((v) => v.is_active).length,
    by_category: {},
    by_price_range: {},
    avg_rating: 0,
  }

  // Count by category
  vendors.forEach((vendor) => {
    const category = vendor.category as keyof typeof stats.by_category
    stats.by_category[category] = (stats.by_category[category] || 0) + 1

    if (vendor.price_range) {
      const priceRange = vendor.price_range as keyof typeof stats.by_price_range
      stats.by_price_range[priceRange] =
        (stats.by_price_range[priceRange] || 0) + 1
    }
  })

  // Calculate average rating
  const ratingsSum = vendors.reduce(
    (sum, vendor) => sum + (vendor.rating || 0),
    0
  )
  stats.avg_rating = vendors.length > 0 ? ratingsSum / vendors.length : 0

  return stats
}

// ============================================
// Event Vendor Assignment Operations
// ============================================

/**
 * Assign vendor to event
 */
export async function assignVendorToEvent(
  eventId: string,
  input: AssignVendorInput
): Promise<EventVendor> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('event_vendors')
    .insert({
      event_id: eventId,
      ...input,
      payment_status: input.payment_status || 'pending',
      status: input.status || 'confirmed',
      currency: input.currency || 'IDR',
    })
    .select()
    .single()

  if (error) {
    console.error('Error assigning vendor:', error)
    throw new Error('Failed to assign vendor to event')
  }

  return data
}

/**
 * Get vendors assigned to an event
 */
export async function getEventVendors(
  eventId: string,
  filters?: EventVendorFilters
): Promise<EventVendorWithDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from('event_vendors')
    .select('*, vendor:vendors(*)')
    .eq('event_id', eventId)

  // Apply filters
  if (filters) {
    if (filters.payment_status && filters.payment_status !== 'all') {
      query = query.eq('payment_status', filters.payment_status)
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching event vendors:', error)
    throw new Error('Failed to fetch event vendors')
  }

  return data || []
}

/**
 * Update event vendor assignment
 */
export async function updateEventVendor(
  eventVendorId: string,
  input: UpdateEventVendorInput
): Promise<EventVendor> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('event_vendors')
    .update(input)
    .eq('id', eventVendorId)
    .select()
    .single()

  if (error) {
    console.error('Error updating event vendor:', error)
    throw new Error('Failed to update event vendor')
  }

  return data
}

/**
 * Remove vendor from event
 */
export async function removeVendorFromEvent(
  eventVendorId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('event_vendors')
    .delete()
    .eq('id', eventVendorId)

  if (error) {
    console.error('Error removing vendor from event:', error)
    throw new Error('Failed to remove vendor from event')
  }
}

/**
 * Get vendor payment statistics for an event
 */
export async function getEventVendorPaymentStats(
  eventId: string
): Promise<VendorPaymentStats> {
  const supabase = createClient()

  const { data: eventVendors, error } = await supabase
    .from('event_vendors')
    .select('contract_amount, payment_status, down_payment')
    .eq('event_id', eventId)

  if (error) {
    console.error('Error fetching payment stats:', error)
    throw new Error('Failed to fetch payment statistics')
  }

  const stats: VendorPaymentStats = {
    total_amount: 0,
    paid_amount: 0,
    pending_amount: 0,
    dp_paid_amount: 0,
    payment_completion_rate: 0,
  }

  eventVendors.forEach((ev) => {
    const amount = ev.contract_amount || 0
    stats.total_amount += amount

    switch (ev.payment_status) {
      case 'paid':
        stats.paid_amount += amount
        break
      case 'dp_paid':
        stats.dp_paid_amount += ev.down_payment || amount * 0.5
        break
      case 'pending':
        stats.pending_amount += amount
        break
    }
  })

  stats.payment_completion_rate =
    stats.total_amount > 0 ? (stats.paid_amount / stats.total_amount) * 100 : 0

  return stats
}

/**
 * Check if vendor is already assigned to event
 */
export async function isVendorAssignedToEvent(
  eventId: string,
  vendorId: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('event_vendors')
    .select('id')
    .eq('event_id', eventId)
    .eq('vendor_id', vendorId)
    .single()

  return !!data && !error
}

// ============================================
// Export as Service Object
// ============================================

export const vendorService = {
  // Vendor CRUD
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getVendorStats,

  // Event Vendor Assignment
  assignVendorToEvent,
  getEventVendors,
  updateEventVendor,
  removeVendorFromEvent,
  getEventVendorPaymentStats,
  isVendorAssignedToEvent,
}
