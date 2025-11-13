// ============================================
// Timeline System Types
// ============================================
// Sprint 8: Timeline/Rundown Builder
// Supports templates, drag-drop, PIC assignment, and live tracking

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const TIMELINE_CATEGORIES = [
  'akad',
  'resepsi',
  'engagement',
  'birthday',
  'corporate',
  'custom',
] as const

export type TimelineCategory = typeof TIMELINE_CATEGORIES[number]

export const TIMELINE_CATEGORY_LABELS: Record<TimelineCategory, string> = {
  akad: 'Akad Nikah',
  resepsi: 'Resepsi',
  engagement: 'Lamaran',
  birthday: 'Ulang Tahun',
  corporate: 'Corporate Event',
  custom: 'Custom',
}

// Default colors for each category
export const CATEGORY_COLORS: Record<TimelineCategory, string> = {
  akad: '#f59e0b', // amber
  resepsi: '#8b5cf6', // purple
  engagement: '#ec4899', // pink
  birthday: '#10b981', // green
  corporate: '#3b82f6', // blue
  custom: '#6b7280', // gray
}

// ============================================
// DATABASE TYPES
// ============================================

/**
 * Timeline Template - Reusable templates
 */
export interface TimelineTemplate {
  id: string
  user_id: string
  name: string
  description: string | null
  category: TimelineCategory
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

/**
 * Timeline Template Item - Items within a template
 */
export interface TimelineTemplateItem {
  id: string
  template_id: string
  title: string
  description: string | null
  duration_minutes: number
  display_order: number
  color: string
  icon: string
  created_at: string
}

/**
 * Event Timeline - Actual timeline for an event
 */
export interface EventTimeline {
  id: string
  event_id: string
  title: string
  description: string | null
  start_time: string // TIME format (HH:MM:SS)
  duration_minutes: number
  display_order: number

  // Assignment
  pic_name: string | null
  pic_phone: string | null
  pic_vendor_id: string | null

  // Status
  is_completed: boolean
  completed_at: string | null
  completed_by: string | null

  // Live tracking
  actual_start_time: string | null // TIMESTAMPTZ
  actual_end_time: string | null // TIMESTAMPTZ
  notes: string | null

  // Styling
  color: string
  icon: string

  created_at: string
  updated_at: string
}

// ============================================
// WITH RELATIONS TYPES
// ============================================

/**
 * Timeline Template with Items
 */
export interface TimelineTemplateWithItems extends TimelineTemplate {
  items: TimelineTemplateItem[]
}

/**
 * Event Timeline with Vendor Details
 */
export interface EventTimelineWithVendor extends EventTimeline {
  vendor?: {
    id: string
    name: string
    phone: string
  } | null
}

// ============================================
// INPUT TYPES FOR CRUD OPERATIONS
// ============================================

/**
 * Create Timeline Template
 */
export interface CreateTimelineTemplateInput {
  name: string
  description?: string
  category: TimelineCategory
  is_public?: boolean
}

/**
 * Update Timeline Template
 */
export interface UpdateTimelineTemplateInput {
  name?: string
  description?: string
  category?: TimelineCategory
  is_public?: boolean
}

/**
 * Create Timeline Template Item
 */
export interface CreateTimelineTemplateItemInput {
  template_id: string
  title: string
  description?: string
  duration_minutes: number
  display_order: number
  color?: string
  icon?: string
}

/**
 * Update Timeline Template Item
 */
export interface UpdateTimelineTemplateItemInput {
  title?: string
  description?: string
  duration_minutes?: number
  display_order?: number
  color?: string
  icon?: string
}

/**
 * Create Event Timeline Item
 */
export interface CreateEventTimelineInput {
  event_id: string
  title: string
  description?: string
  start_time: string // HH:MM format
  duration_minutes: number
  display_order: number
  pic_name?: string
  pic_phone?: string
  pic_vendor_id?: string
  color?: string
  icon?: string
}

/**
 * Update Event Timeline Item
 */
export interface UpdateEventTimelineInput {
  title?: string
  description?: string
  start_time?: string
  duration_minutes?: number
  display_order?: number
  pic_name?: string
  pic_phone?: string
  pic_vendor_id?: string
  color?: string
  icon?: string
  notes?: string
}

/**
 * Complete Event Timeline Item (Live Mode)
 */
export interface CompleteTimelineItemInput {
  is_completed: boolean
  completed_by?: string
  actual_start_time?: string
  actual_end_time?: string
  notes?: string
}

/**
 * Apply Template to Event
 */
export interface ApplyTemplateToEventInput {
  template_id: string
  event_id: string
  start_time: string // Starting time for first item (HH:MM)
}

/**
 * Bulk Update Display Order (for drag-drop)
 */
export interface UpdateTimelineOrderInput {
  id: string
  display_order: number
}

// ============================================
// QUERY FILTERS
// ============================================

/**
 * Filter for Timeline Templates
 */
export interface TimelineTemplateFilters {
  category?: TimelineCategory
  is_public?: boolean
  search?: string
}

/**
 * Filter for Event Timelines
 */
export interface EventTimelineFilters {
  is_completed?: boolean
  has_pic?: boolean
  search?: string
}

// ============================================
// SUMMARY & ANALYTICS TYPES
// ============================================

/**
 * Timeline Summary (from view)
 */
export interface TimelineSummary {
  event_id: string
  total_items: number
  completed_items: number
  total_duration_minutes: number
  earliest_start: string // TIME
  latest_end: string // TIME
  completion_percentage: number
}

/**
 * Timeline Statistics
 */
export interface TimelineStats {
  total_items: number
  completed_items: number
  pending_items: number
  completion_percentage: number
  total_duration_minutes: number
  estimated_end_time: string
  items_with_pic: number
  items_without_pic: number
}

/**
 * Timeline Item with Calculated Fields
 */
export interface TimelineItemWithCalculated extends EventTimeline {
  end_time: string // Calculated from start_time + duration_minutes
  is_current: boolean // Is currently happening
  is_upcoming: boolean // Not started yet
  is_past: boolean // Already passed
  delay_minutes?: number // Difference between scheduled and actual start
}

// ============================================
// FORM DATA TYPES (for React Hook Form)
// ============================================

/**
 * Timeline Item Form Data
 */
export interface TimelineItemFormData {
  title: string
  description: string
  start_time: string // HH:MM
  duration_minutes: string // String for input
  pic_name: string
  pic_phone: string
  pic_vendor_id: string
  color: string
  icon: string
}

/**
 * Template Form Data
 */
export interface TemplateFormData {
  name: string
  description: string
  category: TimelineCategory
  is_public: boolean
}

/**
 * Apply Template Form Data
 */
export interface ApplyTemplateFormData {
  template_id: string
  start_time: string // HH:MM
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Timeline Drag Item (for react-beautiful-dnd)
 */
export interface TimelineDragItem {
  id: string
  index: number
}

/**
 * Timeline Color Preset
 */
export interface TimelineColorPreset {
  name: string
  color: string
  label: string
}

/**
 * Timeline Icon Preset
 */
export interface TimelineIconPreset {
  name: string
  icon: string
  label: string
}

// ============================================
// COMMON COLOR PRESETS
// ============================================

export const TIMELINE_COLOR_PRESETS: TimelineColorPreset[] = [
  { name: 'blue', color: '#3b82f6', label: 'Biru' },
  { name: 'green', color: '#10b981', label: 'Hijau' },
  { name: 'amber', color: '#f59e0b', label: 'Kuning' },
  { name: 'red', color: '#ef4444', label: 'Merah' },
  { name: 'purple', color: '#8b5cf6', label: 'Ungu' },
  { name: 'pink', color: '#ec4899', label: 'Pink' },
  { name: 'indigo', color: '#6366f1', label: 'Indigo' },
  { name: 'gray', color: '#6b7280', label: 'Abu-abu' },
]

// ============================================
// COMMON ICON PRESETS (Lucide Icons)
// ============================================

export const TIMELINE_ICON_PRESETS: TimelineIconPreset[] = [
  { name: 'Clock', icon: 'Clock', label: 'Jam' },
  { name: 'Heart', icon: 'Heart', label: 'Hati' },
  { name: 'Camera', icon: 'Camera', label: 'Kamera' },
  { name: 'Music', icon: 'Music', label: 'Musik' },
  { name: 'Utensils', icon: 'Utensils', label: 'Makan' },
  { name: 'Users', icon: 'Users', label: 'Tamu' },
  { name: 'Gift', icon: 'Gift', label: 'Hadiah' },
  { name: 'Wrench', icon: 'Wrench', label: 'Persiapan' },
  { name: 'Sparkles', icon: 'Sparkles', label: 'Dekorasi' },
  { name: 'Mic', icon: 'Mic', label: 'Pidato' },
  { name: 'Star', icon: 'Star', label: 'Special' },
  { name: 'Calendar', icon: 'Calendar', label: 'Acara' },
]
