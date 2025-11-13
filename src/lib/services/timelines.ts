// ============================================
// Timeline Service
// ============================================
// Sprint 8: Business logic for timeline/rundown management
// Handles templates, event timelines, and live tracking

import { createClient } from '@/lib/supabase/client'
import type {
  TimelineTemplate,
  TimelineTemplateItem,
  TimelineTemplateWithItems,
  EventTimeline,
  EventTimelineWithVendor,
  CreateTimelineTemplateInput,
  UpdateTimelineTemplateInput,
  CreateTimelineTemplateItemInput,
  UpdateTimelineTemplateItemInput,
  CreateEventTimelineInput,
  UpdateEventTimelineInput,
  CompleteTimelineItemInput,
  ApplyTemplateToEventInput,
  UpdateTimelineOrderInput,
  TimelineTemplateFilters,
  EventTimelineFilters,
  TimelineSummary,
  TimelineStats,
} from '@/types/timeline.types'

const supabase = createClient()

// ============================================
// TIMELINE TEMPLATES
// ============================================

/**
 * Get all timeline templates for user (including public templates)
 */
export async function getTimelineTemplates(
  userId: string,
  filters?: TimelineTemplateFilters
): Promise<TimelineTemplate[]> {
  let query = supabase
    .from('timeline_templates')
    .select('*')
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public)
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch timeline templates: ${error.message}`)
  }

  return data || []
}

/**
 * Get single timeline template with items
 */
export async function getTimelineTemplateById(
  templateId: string
): Promise<TimelineTemplateWithItems | null> {
  const { data: template, error: templateError } = await supabase
    .from('timeline_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (templateError) {
    throw new Error(`Failed to fetch template: ${templateError.message}`)
  }

  if (!template) return null

  const { data: items, error: itemsError } = await supabase
    .from('timeline_template_items')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order', { ascending: true })

  if (itemsError) {
    throw new Error(`Failed to fetch template items: ${itemsError.message}`)
  }

  return {
    ...template,
    items: items || [],
  }
}

/**
 * Create timeline template
 */
export async function createTimelineTemplate(
  userId: string,
  input: CreateTimelineTemplateInput
): Promise<TimelineTemplate> {
  const { data, error } = await supabase
    .from('timeline_templates')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description || null,
      category: input.category,
      is_public: input.is_public || false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create template: ${error.message}`)
  }

  return data
}

/**
 * Update timeline template
 */
export async function updateTimelineTemplate(
  templateId: string,
  input: UpdateTimelineTemplateInput
): Promise<TimelineTemplate> {
  const { data, error } = await supabase
    .from('timeline_templates')
    .update({
      name: input.name,
      description: input.description,
      category: input.category,
      is_public: input.is_public,
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update template: ${error.message}`)
  }

  return data
}

/**
 * Delete timeline template
 */
export async function deleteTimelineTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('timeline_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    throw new Error(`Failed to delete template: ${error.message}`)
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  const { error } = await supabase.rpc('increment', {
    table_name: 'timeline_templates',
    row_id: templateId,
    column_name: 'usage_count',
  })

  // If RPC doesn't exist, fallback to manual update
  if (error) {
    const { data: template } = await supabase
      .from('timeline_templates')
      .select('usage_count')
      .eq('id', templateId)
      .single()

    if (template) {
      await supabase
        .from('timeline_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId)
    }
  }
}

// ============================================
// TIMELINE TEMPLATE ITEMS
// ============================================

/**
 * Get template items
 */
export async function getTemplateItems(
  templateId: string
): Promise<TimelineTemplateItem[]> {
  const { data, error } = await supabase
    .from('timeline_template_items')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch template items: ${error.message}`)
  }

  return data || []
}

/**
 * Create template item
 */
export async function createTemplateItem(
  input: CreateTimelineTemplateItemInput
): Promise<TimelineTemplateItem> {
  const { data, error } = await supabase
    .from('timeline_template_items')
    .insert({
      template_id: input.template_id,
      title: input.title,
      description: input.description || null,
      duration_minutes: input.duration_minutes,
      display_order: input.display_order,
      color: input.color || '#3b82f6',
      icon: input.icon || 'Clock',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create template item: ${error.message}`)
  }

  return data
}

/**
 * Update template item
 */
export async function updateTemplateItem(
  itemId: string,
  input: UpdateTimelineTemplateItemInput
): Promise<TimelineTemplateItem> {
  const { data, error } = await supabase
    .from('timeline_template_items')
    .update({
      title: input.title,
      description: input.description,
      duration_minutes: input.duration_minutes,
      display_order: input.display_order,
      color: input.color,
      icon: input.icon,
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update template item: ${error.message}`)
  }

  return data
}

/**
 * Delete template item
 */
export async function deleteTemplateItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('timeline_template_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(`Failed to delete template item: ${error.message}`)
  }
}

// ============================================
// EVENT TIMELINES
// ============================================

/**
 * Get event timeline items
 */
export async function getEventTimeline(
  eventId: string,
  filters?: EventTimelineFilters
): Promise<EventTimelineWithVendor[]> {
  let query = supabase
    .from('event_timelines')
    .select(
      `
      *,
      vendor:pic_vendor_id (
        id,
        name,
        phone
      )
    `
    )
    .eq('event_id', eventId)
    .order('display_order', { ascending: true })

  // Apply filters
  if (filters?.is_completed !== undefined) {
    query = query.eq('is_completed', filters.is_completed)
  }

  if (filters?.has_pic !== undefined) {
    if (filters.has_pic) {
      query = query.not('pic_name', 'is', null)
    } else {
      query = query.is('pic_name', null)
    }
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch event timeline: ${error.message}`)
  }

  return data || []
}

/**
 * Get single timeline item
 */
export async function getTimelineItemById(
  itemId: string
): Promise<EventTimelineWithVendor | null> {
  const { data, error } = await supabase
    .from('event_timelines')
    .select(
      `
      *,
      vendor:pic_vendor_id (
        id,
        name,
        phone
      )
    `
    )
    .eq('id', itemId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch timeline item: ${error.message}`)
  }

  return data
}

/**
 * Create event timeline item
 */
export async function createEventTimelineItem(
  input: CreateEventTimelineInput
): Promise<EventTimeline> {
  const { data, error } = await supabase
    .from('event_timelines')
    .insert({
      event_id: input.event_id,
      title: input.title,
      description: input.description || null,
      start_time: input.start_time,
      duration_minutes: input.duration_minutes,
      display_order: input.display_order,
      pic_name: input.pic_name || null,
      pic_phone: input.pic_phone || null,
      pic_vendor_id: input.pic_vendor_id || null,
      color: input.color || '#3b82f6',
      icon: input.icon || 'Clock',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create timeline item: ${error.message}`)
  }

  return data
}

/**
 * Update event timeline item
 */
export async function updateEventTimelineItem(
  itemId: string,
  input: UpdateEventTimelineInput
): Promise<EventTimeline> {
  const { data, error } = await supabase
    .from('event_timelines')
    .update({
      title: input.title,
      description: input.description,
      start_time: input.start_time,
      duration_minutes: input.duration_minutes,
      display_order: input.display_order,
      pic_name: input.pic_name,
      pic_phone: input.pic_phone,
      pic_vendor_id: input.pic_vendor_id,
      color: input.color,
      icon: input.icon,
      notes: input.notes,
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update timeline item: ${error.message}`)
  }

  return data
}

/**
 * Delete event timeline item
 */
export async function deleteEventTimelineItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('event_timelines')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(`Failed to delete timeline item: ${error.message}`)
  }
}

/**
 * Complete/uncomplete timeline item (live mode)
 */
export async function completeTimelineItem(
  itemId: string,
  input: CompleteTimelineItemInput
): Promise<EventTimeline> {
  const updateData: any = {
    is_completed: input.is_completed,
    completed_by: input.completed_by || null,
    notes: input.notes,
  }

  // Only set actual times if completing (not uncompleting)
  if (input.is_completed) {
    updateData.actual_start_time = input.actual_start_time || new Date().toISOString()
    updateData.actual_end_time = input.actual_end_time || new Date().toISOString()
  } else {
    // Reset actual times when uncompleting
    updateData.actual_start_time = null
    updateData.actual_end_time = null
  }

  const { data, error } = await supabase
    .from('event_timelines')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to complete timeline item: ${error.message}`)
  }

  return data
}

/**
 * Bulk update display order (for drag-drop)
 */
export async function updateTimelineOrder(
  updates: UpdateTimelineOrderInput[]
): Promise<void> {
  const promises = updates.map((update) =>
    supabase
      .from('event_timelines')
      .update({ display_order: update.display_order })
      .eq('id', update.id)
  )

  const results = await Promise.all(promises)

  const errors = results.filter((r) => r.error)
  if (errors.length > 0) {
    throw new Error(`Failed to update timeline order: ${errors[0].error?.message}`)
  }
}

/**
 * Apply template to event
 */
export async function applyTemplateToEvent(
  input: ApplyTemplateToEventInput
): Promise<EventTimeline[]> {
  // Get template items
  const items = await getTemplateItems(input.template_id)

  if (items.length === 0) {
    throw new Error('Template has no items')
  }

  // Convert start_time string to minutes
  const [startHour, startMinute] = input.start_time.split(':').map(Number)
  let currentTimeMinutes = startHour * 60 + startMinute

  // Create timeline items from template
  const timelinePromises = items.map(async (item, index) => {
    const hours = Math.floor(currentTimeMinutes / 60)
    const minutes = currentTimeMinutes % 60
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`

    const result = await createEventTimelineItem({
      event_id: input.event_id,
      title: item.title,
      description: item.description || undefined,
      start_time: timeString,
      duration_minutes: item.duration_minutes,
      display_order: index,
      color: item.color,
      icon: item.icon,
    })

    // Add duration for next item
    currentTimeMinutes += item.duration_minutes

    return result
  })

  const createdItems = await Promise.all(timelinePromises)

  // Increment template usage
  await incrementTemplateUsage(input.template_id)

  return createdItems
}

// ============================================
// ANALYTICS & SUMMARY
// ============================================

/**
 * Get timeline summary for event
 */
export async function getTimelineSummary(
  eventId: string
): Promise<TimelineSummary | null> {
  const { data, error } = await supabase
    .from('timeline_summary')
    .select('*')
    .eq('event_id', eventId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No timeline items yet
      return {
        event_id: eventId,
        total_items: 0,
        completed_items: 0,
        total_duration_minutes: 0,
        earliest_start: '00:00:00',
        latest_end: '00:00:00',
        completion_percentage: 0,
      }
    }
    throw new Error(`Failed to fetch timeline summary: ${error.message}`)
  }

  return data
}

/**
 * Get detailed timeline statistics
 */
export async function getTimelineStats(eventId: string): Promise<TimelineStats> {
  const items = await getEventTimeline(eventId)

  const totalItems = items.length
  const completedItems = items.filter((i) => i.is_completed).length
  const pendingItems = totalItems - completedItems
  const completionPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const totalDuration = items.reduce((sum, i) => sum + i.duration_minutes, 0)

  const itemsWithPic = items.filter((i) => i.pic_name || i.pic_vendor_id).length
  const itemsWithoutPic = totalItems - itemsWithPic

  // Calculate estimated end time
  let estimatedEndTime = '00:00:00'
  if (items.length > 0) {
    const lastItem = items[items.length - 1]
    const [hours, minutes] = lastItem.start_time.split(':').map(Number)
    const endMinutes = hours * 60 + minutes + lastItem.duration_minutes
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    estimatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`
  }

  return {
    total_items: totalItems,
    completed_items: completedItems,
    pending_items: pendingItems,
    completion_percentage: completionPercentage,
    total_duration_minutes: totalDuration,
    estimated_end_time: estimatedEndTime,
    items_with_pic: itemsWithPic,
    items_without_pic: itemsWithoutPic,
  }
}

/**
 * Call database function to get completion percentage
 */
export async function getTimelineCompletionPercentage(
  eventId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('get_timeline_completion_percentage', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Failed to get completion percentage:', error)
    return 0
  }

  return data || 0
}

/**
 * Call database function to get total duration
 */
export async function getEventTimelineDuration(eventId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_event_timeline_duration', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Failed to get timeline duration:', error)
    return 0
  }

  return data || 0
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const timelineService = {
  // Templates
  getTimelineTemplates,
  getTimelineTemplateById,
  createTimelineTemplate,
  updateTimelineTemplate,
  deleteTimelineTemplate,
  incrementTemplateUsage,

  // Template Items
  getTemplateItems,
  createTemplateItem,
  updateTemplateItem,
  deleteTemplateItem,

  // Event Timelines
  getEventTimeline,
  getTimelineItemById,
  createEventTimelineItem,
  updateEventTimelineItem,
  deleteEventTimelineItem,
  completeTimelineItem,
  updateTimelineOrder,
  applyTemplateToEvent,

  // Analytics
  getTimelineSummary,
  getTimelineStats,
  getTimelineCompletionPercentage,
  getEventTimelineDuration,
}
