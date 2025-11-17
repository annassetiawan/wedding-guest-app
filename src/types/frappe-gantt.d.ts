declare module 'frappe-gantt' {
  export interface Task {
    id: string
    name: string
    start: string | Date
    end: string | Date
    progress: number
    dependencies?: string
    custom_class?: string
  }

  export type ViewMode = 'Hour' | 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month'

  export interface GanttOptions {
    view_mode?: ViewMode
    on_click?: (task: Task) => void
    on_date_change?: (task: Task, start: Date, end: Date) => void
    on_progress_change?: (task: Task, progress: number) => void
    on_view_change?: (mode: string) => void
    bar_height?: number
    bar_corner_radius?: number
    arrow_curve?: number
    padding?: number
    view_modes?: ViewMode[]
    date_format?: string
    language?: string
  }

  export default class Gantt {
    constructor(container: HTMLElement | string, tasks: Task[], options?: GanttOptions)
    change_view_mode(mode: ViewMode): void
    refresh(tasks: Task[]): void
  }
}
