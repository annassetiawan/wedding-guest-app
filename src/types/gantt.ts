/**
 * Gantt Chart Types
 * Shared types for Gantt chart components
 */

export type ViewMode = 'Hour' | 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month'

export interface GanttTask {
  id: string
  name: string
  start: string
  end: string
  progress: number
  custom_class?: string
}
