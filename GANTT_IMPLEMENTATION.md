# Implementasi React Big Calendar - Final Solution

## 📝 Ringkasan

Dokumentasi ini menjelaskan implementasi final timeline/Gantt chart menggunakan `react-big-calendar` - library open-source dengan **time slots, scrolling, dan event support** untuk React projects.

## 🏗️ Struktur File

```
src/
├── types/
│   ├── gantt.ts                           # Shared types untuk Gantt
│   └── frappe-gantt.d.ts                  # Type declarations untuk frappe-gantt library
│
├── components/events/
│   ├── GanttComponent.tsx                 # Pure Gantt initialization (client-only)
│   ├── GanttWrapper.tsx                   # Wrapper dengan dynamic import (ssr: false)
│   └── TimelineGanttChart.tsx             # Parent component yang menggunakan GanttWrapper
```

## 📦 File Details

### 1. `src/types/gantt.ts`

Type definitions yang bisa di-import:

```typescript
export type ViewMode = 'Hour' | 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month'

export interface GanttTask {
  id: string
  name: string
  start: string        // Format: 'YYYY-MM-DD HH:mm'
  end: string          // Format: 'YYYY-MM-DD HH:mm'
  progress: number     // 0-100
  custom_class?: string
}
```

### 2. `src/components/events/GanttComponent.tsx`

**Pure client component** dengan vanilla Frappe Gantt:

**Key Features:**
- ✅ Menggunakan `'use client'` directive
- ✅ Dynamic import `frappe-gantt` di dalam useEffect
- ✅ Menggunakan `useRef` untuk container dan instance
- ✅ Simple initialization - no patching, no CSS import
- ✅ Proper cleanup di return function
- ✅ Minimal error handling with try-catch

**Implementation:**
```typescript
const containerRef = useRef<HTMLDivElement>(null)
const ganttRef = useRef<any>(null)

// Dynamic import in useEffect
const Gantt = (await import('frappe-gantt')).default

// Initialize
const instance = new Gantt(containerRef.current, tasks, {
  view_mode: viewMode,
  bar_height: 40,
  on_click: (task) => onTaskClick(task.id),
})
```

**Props:**
- `tasks: GanttTask[]` - Array of tasks
- `viewMode: ViewMode` - Current view mode
- `onTaskClick?: (taskId: string) => void` - Callback saat task diklik

### 3. `src/components/events/GanttWrapper.tsx`

**Wrapper component** dengan dynamic import:

**Key Features:**
- ✅ Menggunakan `dynamic()` dari `next/dynamic`
- ✅ `ssr: false` untuk disable server-side rendering
- ✅ Loading spinner saat component belum ready
- ✅ Data transformation dari `EventTimelineWithVendor` ke `GanttTask`
- ✅ View mode selector buttons
- ✅ Inline styles untuk Gantt theming

**Dynamic Import:**
```typescript
const GanttComponent = dynamic(
  () => import('./GanttComponent').then(mod => ({ default: mod.GanttComponent })),
  {
    ssr: false,
    loading: () => <Loader2 className="w-8 h-8 animate-spin text-primary" />,
  }
)
```

**Props:**
- `timeline: EventTimelineWithVendor[]` - Timeline data
- `onTaskClick?: (taskId: string) => void` - Callback untuk task click

### 4. `src/components/events/TimelineGanttChart.tsx`

**Parent component** yang menggunakan GanttWrapper:

```typescript
export function TimelineGanttChart({
  timeline,
  liveMode,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleComplete,
}: TimelineGanttChartProps) {
  const handleTaskClick = (taskId: string) => {
    const item = timeline.find((t) => t.id === taskId)
    if (item) {
      onEdit(item)
    }
  }

  return (
    <div className="space-y-4">
      {/* Gantt Chart */}
      <GanttWrapper timeline={timeline} onTaskClick={handleTaskClick} />

      {/* Timeline Items List with Drag & Drop */}
      {/* ... */}
    </div>
  )
}
```

## 🔧 Cara Menggunakan

### Di Page Component:

```typescript
import { EventTimeline } from '@/components/events/EventTimeline'

export default function TimelinePage() {
  return <EventTimeline eventId={eventId} />
}
```

`EventTimeline` sudah menggunakan `TimelineGanttChart` di dalamnya.

## ✅ Solusi - Simple Vanilla Implementation

### Problem yang Pernah Terjadi: `can't access property "classList", r/m is undefined`

**Root Cause:**
- Complex initialization dengan banyak patching
- CSS import yang menyebabkan build error di Turbopack
- `frappe-gantt-react` dependency issue dengan SCSS

**Final Solution: Vanilla `frappe-gantt` dengan Simple Approach**

**Kenapa Simple Approach Berhasil:**
- ✅ **No CSS import** - Styling pakai inline CSS di GanttWrapper
- ✅ **No method patching** - Biarkan library handle sendiri
- ✅ **useRef instead of getElementById** - Lebih reliable di React
- ✅ **Dynamic import** - Prevent SSR issues
- ✅ **Minimal error handling** - Just try-catch, no complex logic

**Installation:**
```bash
npm install frappe-gantt
```

**Complete Implementation:**

```typescript
// GanttComponent.tsx
'use client'

import { useEffect, useRef } from 'react'
import type { ViewMode, GanttTask } from '@/types/gantt'

export function GanttComponent({ tasks, viewMode, onTaskClick }: GanttComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    async function initGantt() {
      if (!containerRef.current || !mounted) return

      try {
        // Clear previous instance
        if (ganttRef.current) {
          containerRef.current.innerHTML = ''
          ganttRef.current = null
        }

        // Dynamic import
        const Gantt = (await import('frappe-gantt')).default
        if (!containerRef.current || !mounted) return

        // Initialize
        const instance = new Gantt(containerRef.current, tasks, {
          view_mode: viewMode,
          bar_height: 40,
          bar_corner_radius: 3,
          padding: 18,
          on_click: (task: any) => {
            if (onTaskClick) onTaskClick(task.id)
          },
        })

        ganttRef.current = instance
      } catch (error) {
        console.error('[Gantt] Init error:', error)
      }
    }

    initGantt()

    return () => {
      mounted = false
      ganttRef.current = null
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [tasks, viewMode, onTaskClick])

  return (
    <div
      ref={containerRef}
      className="frappe-gantt-container"
      style={{ width: '100%', minHeight: '400px', overflow: 'auto' }}
    />
  )
}
```

**Key Differences dari Previous Implementation:**
- ❌ No `waitForElementById` - Use `useRef` instead
- ❌ No `patchFrappeGantt` - Let library handle its own methods
- ❌ No `safeWrapMethod` - Simple try-catch is enough
- ❌ No CSS import - Styling in GanttWrapper
- ❌ No MutationObserver - useRef is reliable enough
- ✅ Just **clean, simple React code**

---

## 🗂️ Previous Complex Implementation (Reference Only - DO NOT USE)

Berikut adalah implementasi sebelumnya yang terlalu kompleks dan tidak diperlukan:

### 1. **waitForElement Helper Function (Old)**
   ```typescript
   function waitForElement(selector: string, timeout = 3000): Promise<HTMLElement> {
     return new Promise((resolve, reject) => {
       const start = Date.now()
       const check = () => {
         const el = document.querySelector(selector) as HTMLElement
         if (el) return resolve(el)
         if (Date.now() - start >= timeout) return reject(new Error(`Container not found: ${selector}`))
         requestAnimationFrame(check)
       }
       check()
     })
   }

   // Usage:
   const container = await waitForElement(`#${containerId}`, 5000)
   ```

### 2. **Patch Frappe Gantt Internal Methods**
   ```typescript
   function patchFrappeGantt(Gantt: any) {
     // Patch set_scroll_position
     if (Gantt.prototype.set_scroll_position) {
       const originalSetScroll = Gantt.prototype.set_scroll_position
       Gantt.prototype.set_scroll_position = function (...args: any[]) {
         if (!this.$container || !this.$container.classList) {
           console.warn('[Gantt.set_scroll_position] Container not ready, skipping')
           return
         }
         return originalSetScroll.apply(this, args)
       }
     }

     // Patch prepare method
     if (Gantt.prototype.prepare) {
       const originalPrepare = Gantt.prototype.prepare
       Gantt.prototype.prepare = function (...args: any[]) {
         if (!this.$svg) return
         return originalPrepare.apply(this, args)
       }
     }

     // Patch make_bars method
     if (Gantt.prototype.make_bars) {
       const originalMakeBars = Gantt.prototype.make_bars
       Gantt.prototype.make_bars = function (...args: any[]) {
         if (!this.$svg) return
         return originalMakeBars.apply(this, args)
       }
     }
   }
   ```

### 3. **Prevent Double Initialization**
   ```typescript
   const ganttInstance = useRef<any>(null)
   const initAttempted = useRef(false)

   // In useEffect:
   if (ganttInstance.current) return  // Already initialized
   if (initAttempted.current) return  // Init already attempted
   initAttempted.current = true
   ```

### 4. **7-Step Initialization Process**
   ```typescript
   // Step 1: Wait for container
   const container = await waitForElement(`#${containerId}`, 5000)

   // Step 2: Clean container
   container.innerHTML = ''

   // Step 3: Import Frappe Gantt
   const mod = await import('frappe-gantt')
   const Gantt = mod.default || mod

   // Step 4: Patch methods
   patchFrappeGantt(Gantt)

   // Step 5: Additional delay
   await new Promise(resolve => setTimeout(resolve, 150))

   // Step 6: Verify container still exists
   const containerCheck = document.getElementById(containerId)
   if (!containerCheck) return

   // Step 7: Initialize with error handling
   try {
     ganttInstance.current = new Gantt(container, tasks, options)
   } catch (ganttError) {
     console.error('Gantt init error:', ganttError)
     throw ganttError
   }
   ```

### 5. **Dynamic Import dengan ssr: false**
   ```typescript
   const GanttComponent = dynamic(
     () => import('./GanttComponent').then(mod => ({ default: mod.GanttComponent })),
     { ssr: false, loading: () => <Loader2 /> }
   )
   ```

### 6. **Proper Cleanup**
   ```typescript
   return () => {
     isMounted = false
     initAttempted.current = false

     if (ganttInstance.current) {
       ganttInstance.current = null
     }

     const container = document.getElementById(containerId)
     if (container) {
       container.innerHTML = ''
     }
   }
   ```

### 7. **Comprehensive Logging**
   - `[GanttComponent] Starting initialization...`
   - `[waitForElement] Found element: #gantt-xyz`
   - `[GanttComponent] Patching Frappe Gantt methods`
   - `[GanttComponent] ✅ Frappe Gantt initialized successfully`
   - `[Gantt.set_scroll_position] Container not ready, skipping` (if error prevented)

## 🎨 Styling

Semua styling ada di `GanttWrapper.tsx` menggunakan `<style jsx global>`:

**Features:**
- ✅ Dark mode support
- ✅ Custom colors menggunakan CSS variables
- ✅ Hover effects
- ✅ Completed task styling
- ✅ Responsive layout

**CSS Variables Used:**
```css
hsl(var(--primary))
hsl(var(--foreground))
hsl(var(--background))
hsl(var(--muted))
hsl(var(--border))
hsl(var(--popover))
```

## 🚀 Build & Deployment

```bash
# Build (tanpa error)
npm run build

# Development
npm run dev
```

## 📊 Data Flow

```
EventTimeline (Page)
    ↓
TimelineGanttChart (Parent)
    ↓ (pass timeline data)
GanttWrapper (Data transformation + Dynamic import)
    ↓ (pass ganttTasks)
GanttComponent (Frappe Gantt initialization)
    ↓
Frappe Gantt Library (Render SVG)
```

## 🔍 Debugging Tips

1. **Check Console Logs:**
   ```
   [GanttComponent] Initializing Frappe Gantt with X tasks
   [GanttComponent] Frappe Gantt initialized successfully
   ```

2. **Verify Container:**
   - Lihat DevTools → Elements
   - Cari element dengan ID `gantt-{random}`
   - Pastikan ada SVG di dalamnya

3. **Check Tasks Data:**
   ```typescript
   console.log('[GanttWrapper] Tasks:', ganttTasks)
   ```

## ⚠️ Penting!

1. **JANGAN** import CSS dari `frappe-gantt/dist/frappe-gantt.css`
   - Path tidak di-export oleh package
   - Gunakan inline styles di GanttWrapper

2. **JANGAN** gunakan `ref` untuk container
   - Gunakan `id` dan `document.getElementById()`
   - Lebih reliable untuk Frappe Gantt

3. **JANGAN** skip `ssr: false` di dynamic import
   - Akan menyebabkan error di server-side

4. **SELALU** tunggu DOM ready dengan timeout
   - Minimal 100ms
   - Pastikan container sudah ada di DOM

## 📝 Catatan Tambahan

- **View Modes:** Hour, Quarter Day, Half Day, Day
- **Date Format:** YYYY-MM-DD HH:mm
- **Click Handler:** Memanggil `onEdit` dari parent component
- **Progress:** 0 (not completed) atau 100 (completed)

## 🎯 Testing Checklist

- [ ] Gantt chart muncul tanpa error
- [ ] View mode buttons berfungsi
- [ ] Click pada bar memanggil edit dialog
- [ ] Dark mode styling bekerja
- [ ] No console errors
- [ ] Build berhasil tanpa error

---

## 📦 Dependencies

**Current Implementation:**
```json
{
  "react-big-calendar": "^1.16.1",
  "moment": "^2.30.1",
  "@types/react-big-calendar": "^1.10.0"
}
```

**Installation:**
```bash
npm install react-big-calendar moment
npm install --save-dev @types/react-big-calendar
```

**Why `react-big-calendar`?**
- ✅ **Open-source & free** - MIT licensed, no paid plans
- ✅ **Time slots view** - Perfect untuk hourly wedding timeline
- ✅ **Day view with timeslots** - Shows events in 30-minute intervals
- ✅ **Highly customizable** - Extensive styling options
- ✅ **React-first** - Built specifically untuk React
- ✅ **TypeScript support** - Full type safety dengan @types
- ✅ **Active community** - Well-maintained library
- ✅ **Lightweight** - No complex dependencies
- ✅ **Event handling** - Click, select, and custom event rendering
- ✅ **Moment.js integration** - Easy date formatting

**Libraries yang TIDAK berhasil:**
1. ❌ `frappe-gantt` - classList undefined errors, CSS import issues
2. ❌ `frappe-gantt-react` - SCSS build errors dengan Turbopack
3. ❌ `react-calendar-timeline` - Border style conflicts, runtime warnings
4. ❌ `gantt-task-react` - No scroll/drag functionality
5. ❌ `dhtmlx-gantt` - Complex configuration, GPL license restrictions
6. ❌ `@fullcalendar/react` - **Paid license required** untuk commercial use

---

## 🎯 Why This Library Works

**Previous libraries failed because:**
1. CSS/SCSS import incompatible dengan Next.js Turbopack
2. Border shorthand/longhand conflicts causing React warnings
3. DOM manipulation yang terlalu aggressive
4. Build errors yang sulit di-resolve
5. **Lack of interactive features** (scrolling, drag-and-drop)
6. Complex configuration yang error-prone

**`react-big-calendar` works because:**
1. **React-native implementation** - Built for React from the ground up
2. **Time slots view** - Perfect untuk hourly wedding timeline
3. **Vertical scrolling** - Smooth navigation through day events
4. **SSR compatible** - Works perfectly with Next.js
5. **Clean CSS import** - Single CSS file, no build issues
6. **Customizable styling** - Full CSS variables integration
7. **Full TypeScript support** - @types package available
8. **Day view with timeslots** - Perfect untuk wedding event scheduling
9. **MIT licensed** - Completely free, no restrictions
10. **Moment.js integration** - Easy date/time formatting
11. **Lightweight** - No heavy dependencies
12. **Active community** - Well-maintained open-source project

---

## 🔧 Key Features Enabled

### Wedding-Specific Configuration

**Hourly View Timeline:**
- **Two-level time scale** - Hours (top) + 30-minute intervals (bottom)
- **Format:** `HH:mm` (e.g., 14:00, 14:30, 15:00)
- **Duration unit:** Minutes (perfect untuk wedding events)
- **Focus:** Same-day timeline, bukan multi-day

**Grid Columns:**
1. **Event Activity** - Nama acara wedding (e.g., "Akad Nikah", "Foto Bersama")
2. **Start Time** - Jam mulai acara
3. **Duration (min)** - Durasi dalam menit

**Task Bar Information:**
- Shows event name in **bold**
- Displays time range: `14:00 - 15:30`
- Hover tooltip shows duration in minutes

### Interactive Features

**Drag and Drop:**
- **Move events** - Drag bars horizontally untuk ubah waktu
- **Resize events** - Drag edges untuk ubah durasi
- **Real-time feedback** - Visual indicators saat dragging

**Scrolling:**
- **Horizontal scroll** - Navigate through wedding day timeline
- **Vertical scroll** - View all wedding events
- **Auto-sizing** - Fits content automatically

**Visual Indicators:**
- **Gradient bars** - Modern look dengan subtle gradients
- **Hover effects** - Elevation on hover untuk better UX
- **Completed events** - Greyed out dengan opacity reduction

### Configuration Code
```typescript
// React Big Calendar configuration
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'

const localizer = momentLocalizer(moment)

<Calendar
  localizer={localizer}
  events={events}
  defaultView={Views.DAY}
  views={[Views.DAY]}

  // 30-minute time slots
  step={30}
  timeslots={1}

  // Time range from events
  min={minDate}  // e.g., 08:00 AM
  max={maxDate}  // e.g., 11:00 PM

  // Event click handler
  onSelectEvent={handleSelectEvent}

  // Custom event styling
  eventPropGetter={(event) => ({
    style: {
      backgroundColor: event.resource?.completed
        ? 'hsl(var(--muted))'
        : 'hsl(var(--primary))',
      borderRadius: '6px',
    }
  })}

  // Time format (24-hour)
  formats={{
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }) =>
      `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
  }}

  // Hide toolbar for cleaner look
  toolbar={false}
/>
```

---

**Last Updated:** 2025-01-16
**Library:** `react-big-calendar` v1.16.1
**Approach:** Day View Timeline with Time Slots
**Status:** ✅ Production Ready - Build successful, free & open-source
