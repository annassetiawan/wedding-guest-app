// Sprint 7: Vendor Management Types
// Created: November 10, 2025

export type VendorCategory =
  | 'catering'
  | 'decoration'
  | 'photography'
  | 'videography'
  | 'mc'
  | 'music'
  | 'makeup'
  | 'venue'
  | 'transport'
  | 'souvenir'
  | 'invitation_printing'
  | 'wedding_cake'
  | 'other'

export type PriceRange = 'budget' | 'standard' | 'premium' | 'luxury'

export type PaymentStatus = 'pending' | 'dp_paid' | 'paid' | 'cancelled'

export type AssignmentStatus = 'pending' | 'confirmed' | 'cancelled'

// ============================================
// Main Vendor Interface
// ============================================

export interface Vendor {
  id: string
  user_id: string

  // Basic Information
  name: string
  category: VendorCategory

  // Contact Information
  contact_person?: string
  phone?: string
  email?: string
  address?: string

  // Business Details
  description?: string
  services_offered?: string[]
  price_range?: PriceRange

  // Performance Metrics
  rating?: number
  total_events: number

  // Internal Notes
  notes?: string

  // Status
  is_active: boolean

  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================
// Event Vendor Assignment Interface
// ============================================

export interface EventVendor {
  id: string
  event_id: string
  vendor_id: string

  // Assignment Details
  assigned_at: string
  assigned_by?: string

  // Contract & Payment
  contract_amount?: number
  currency: string
  payment_status: PaymentStatus
  down_payment?: number
  down_payment_date?: string
  full_payment_date?: string

  // Performance Rating (after event)
  performance_rating?: number
  performance_notes?: string

  // Status
  status: AssignmentStatus

  // Communication
  notes?: string

  // Timestamps
  created_at: string
  updated_at: string
}

// ============================================
// Extended Types with Relations
// ============================================

export interface VendorWithStats extends Vendor {
  active_events: number
  avg_performance_rating?: number
  completed_payments: number
  pending_payments: number
}

export interface EventVendorWithDetails extends EventVendor {
  vendor: Vendor
}

export interface VendorWithAssignments extends Vendor {
  event_vendors: EventVendor[]
}

// ============================================
// Input Types for CRUD Operations
// ============================================

export interface CreateVendorInput {
  name: string
  category: VendorCategory
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  description?: string
  services_offered?: string[]
  price_range?: PriceRange
  rating?: number
  notes?: string
  is_active?: boolean
}

export interface UpdateVendorInput {
  name?: string
  category?: VendorCategory
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  description?: string
  services_offered?: string[]
  price_range?: PriceRange
  rating?: number
  notes?: string
  is_active?: boolean
}

export interface AssignVendorInput {
  vendor_id: string
  contract_amount?: number
  currency?: string
  payment_status?: PaymentStatus
  down_payment?: number
  down_payment_date?: string
  status?: AssignmentStatus
  notes?: string
}

export interface UpdateEventVendorInput {
  contract_amount?: number
  payment_status?: PaymentStatus
  down_payment?: number
  down_payment_date?: string
  full_payment_date?: string
  performance_rating?: number
  performance_notes?: string
  status?: AssignmentStatus
  notes?: string
}

// ============================================
// Statistics Types
// ============================================

export interface VendorStats {
  total_vendors: number
  active_vendors: number
  by_category: {
    [key in VendorCategory]?: number
  }
  by_price_range: {
    [key in PriceRange]?: number
  }
  avg_rating: number
}

export interface VendorPaymentStats {
  total_amount: number
  paid_amount: number
  pending_amount: number
  dp_paid_amount: number
  payment_completion_rate: number
}

// ============================================
// Filter & Search Types
// ============================================

export interface VendorFilters {
  category?: VendorCategory | 'all'
  price_range?: PriceRange | 'all'
  is_active?: boolean
  min_rating?: number
  search?: string
}

export interface EventVendorFilters {
  payment_status?: PaymentStatus | 'all'
  status?: AssignmentStatus | 'all'
  search?: string
}

// ============================================
// Category Display Names (for UI)
// ============================================

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  catering: 'Katering',
  decoration: 'Dekorasi',
  photography: 'Fotografi',
  videography: 'Videografi',
  mc: 'MC / Pembawa Acara',
  music: 'Musik / Entertainment',
  makeup: 'Make Up Artist',
  venue: 'Venue / Gedung',
  transport: 'Transportasi',
  souvenir: 'Souvenir',
  invitation_printing: 'Cetak Undangan',
  wedding_cake: 'Kue Pengantin',
  other: 'Lainnya',
}

export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  budget: 'Budget',
  standard: 'Standard',
  premium: 'Premium',
  luxury: 'Luxury',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Belum Bayar',
  dp_paid: 'DP Sudah Dibayar',
  paid: 'Lunas',
  cancelled: 'Dibatalkan',
}

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Terkonfirmasi',
  cancelled: 'Dibatalkan',
}

// ============================================
// Helper Functions
// ============================================

export function getCategoryLabel(category: VendorCategory): string {
  return VENDOR_CATEGORY_LABELS[category]
}

export function getPriceRangeLabel(priceRange: PriceRange): string {
  return PRICE_RANGE_LABELS[priceRange]
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status]
}

export function getAssignmentStatusLabel(status: AssignmentStatus): string {
  return ASSIGNMENT_STATUS_LABELS[status]
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function calculatePaymentProgress(eventVendor: EventVendor): number {
  if (!eventVendor.contract_amount || eventVendor.contract_amount === 0) {
    return 0
  }

  const { payment_status, down_payment, contract_amount } = eventVendor

  switch (payment_status) {
    case 'paid':
      return 100
    case 'dp_paid':
      if (down_payment) {
        return (down_payment / contract_amount) * 100
      }
      return 50 // Default DP is usually 50%
    case 'pending':
      return 0
    case 'cancelled':
      return 0
    default:
      return 0
  }
}
