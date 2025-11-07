# Wedding Guest Manager - Developer Documentation

> **Comprehensive documentation for developers working on the Wedding Guest Management System**

---

## 📋 Table of Contents

1. [Overview Project](#overview-project)
2. [Struktur Project](#struktur-project)
3. [Arsitektur & Design Patterns](#arsitektur--design-patterns)
4. [Komponen Utama](#komponen-utama)
5. [Setup & Installation](#setup--installation)
6. [Konvensi Kode](#konvensi-kode)
7. [Testing](#testing)
8. [Notes untuk Developer](#notes-untuk-developer)

---

## Overview Project

### 📝 Deskripsi Singkat

**Wedding Guest Manager** adalah aplikasi full-stack untuk mengelola tamu undangan pernikahan dengan fitur:
- Manajemen event dan guest list
- QR code generation & scanning untuk check-in
- Invitation templates (Modern & Elegant design)
- Real-time analytics dan reporting
- CSV import/export
- Public RSVP pages
- Dark/light mode

### 🎯 Tujuan dan Use Case

**Target Users:**
- Wedding organizers
- Event planners
- Venue managers
- Individual couples planning their wedding

**Main Use Cases:**
1. **Event Creation** - Create wedding event dengan detail (venue, date, bride/groom names)
2. **Guest Management** - Add, edit, delete guests dengan kategori (VIP, Regular, Family)
3. **QR Code System** - Generate unique QR codes untuk setiap guest
4. **Check-in Tracking** - Scan QR codes saat guest datang ke venue
5. **Invitation Sharing** - Send personalized invitation links ke guests
6. **Analytics** - Track attendance rates, guest statistics, dan event metrics
7. **CSV Import** - Bulk import guest list dari Excel/CSV
8. **Reports** - Export analytics data untuk dokumentasi

### 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Next.js (App Router) | 16.0.1 |
| **UI Library** | React | 19.2.0 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **Backend/Database** | Supabase (PostgreSQL) | 2.78.0 |
| **Authentication** | Supabase Auth | Built-in |
| **Storage** | Supabase Storage | Built-in |
| **Forms** | React Hook Form | 7.65.0 |
| **Validation** | Zod | 4.1.12 |
| **Charts** | Recharts | 2.15.4 |
| **Icons** | Lucide React | 0.548.0 |
| **QR Code** | qrcode + ZXing | 1.5.4 / 0.21.3 |
| **Notifications** | Sonner | 2.0.7 |
| **Theme** | next-themes | 0.4.6 |
| **Date Utils** | date-fns | 4.1.0 |
| **CSV** | papaparse | 5.5.3 |

---

## Struktur Project

### 📂 Directory Tree

```
wedding-guest-app/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx        # Main dashboard
│   │   ├── events/                   # Event management
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── edit/page.tsx
│   │   │       └── checkin/page.tsx
│   │   ├── guests/page.tsx           # Guest listing
│   │   ├── invitation/[eventId]/[guestId]/page.tsx
│   │   ├── templates/page.tsx        # Template library
│   │   ├── analytics/page.tsx        # Analytics dashboard
│   │   ├── settings/                 # User settings
│   │   │   ├── page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── security/page.tsx
│   │   │   ├── preferences/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── integrations/page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (30+ files)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── table.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ...
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── MonthlyEventsChart.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── ...
│   │   ├── events/                   # Event components
│   │   │   ├── AddGuestDialog.tsx
│   │   │   ├── EditGuestDialog.tsx
│   │   │   ├── ImportGuestsDialog.tsx
│   │   │   └── ...
│   │   ├── invitation/               # Templates
│   │   │   ├── ModernTemplate.tsx
│   │   │   └── ElegantTemplate.tsx
│   │   ├── templates/
│   │   │   ├── TemplateCard.tsx
│   │   │   └── TemplatePreviewModal.tsx
│   │   └── checkin/
│   │       └── ZXingScanner.tsx
│   │
│   ├── lib/                          # Utilities & Services
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── services/
│   │   │   ├── events.ts             # Event CRUD
│   │   │   ├── guests.ts             # Guest CRUD
│   │   │   ├── analytics.ts          # Analytics
│   │   │   ├── dashboard-stats.ts    # Dashboard metrics
│   │   │   └── profile.ts            # User profile
│   │   ├── utils/
│   │   │   └── qrcode.ts             # QR generation
│   │   ├── design-tokens.ts          # Design system
│   │   └── utils.ts                  # General utils
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx           # Auth state management
│   │
│   ├── types/
│   │   └── database.types.ts         # TypeScript types
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── supabase/
│   └── migrations/                   # Database migrations
│       └── fix-guests-rls-policies.sql
│
├── docs/                             # Documentation
│   ├── TROUBLESHOOTING.md
│   ├── QR-CODE-FEATURE.md
│   ├── CSV-IMPORT-FEATURE.md
│   └── ...
│
├── public/                           # Static assets
│
├── .env.local.example                # Environment template
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── components.json                   # shadcn config
├── tailwind.config.ts                # Tailwind config
└── next.config.ts                    # Next.js config
```

### 📄 Penjelasan Directory Utama

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/app/` | Next.js pages & routes | `page.tsx`, `layout.tsx` |
| `src/components/ui/` | Reusable UI primitives | All shadcn components |
| `src/components/dashboard/` | Dashboard-specific components | `StatsCard`, `EventCard`, `Sidebar` |
| `src/components/events/` | Event management components | Dialogs, forms, analytics |
| `src/lib/supabase/` | Database integration | `client.ts`, `server.ts` |
| `src/lib/services/` | Business logic layer | Event, guest, analytics services |
| `src/contexts/` | React Context providers | `AuthContext` |
| `supabase/migrations/` | Database schema changes | SQL migration files |

### ⚙️ File Konfigurasi Penting

| File | Fungsi |
|------|--------|
| `.env.local` | Environment variables (Supabase credentials) |
| `package.json` | NPM dependencies dan scripts |
| `tsconfig.json` | TypeScript configuration, path aliases (`@/*`) |
| `components.json` | shadcn/ui setup (New York style, Slate color) |
| `tailwind.config.ts` | Tailwind CSS customization |
| `next.config.ts` | Next.js configuration |
| `middleware.ts` | Route protection & auth |

---

## Arsitektur & Design Patterns

### 🏗 Arsitektur Aplikasi

**Pattern:** **Feature-Based Modular Architecture** dengan **Service Layer Pattern**

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  (Next.js Pages + React Components + shadcn/ui)         │
├─────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                     │
│  (React Hooks + Context API + Custom Hooks)             │
├─────────────────────────────────────────────────────────┤
│                     SERVICE LAYER                        │
│  (Business Logic + Data Transformation)                 │
│   - EventService                                         │
│   - GuestService                                         │
│   - AnalyticsService                                     │
│   - ProfileService                                       │
├─────────────────────────────────────────────────────────┤
│                   DATA ACCESS LAYER                      │
│  (Supabase Client + Database Queries)                   │
├─────────────────────────────────────────────────────────┤
│                     DATA LAYER                           │
│  (PostgreSQL Database via Supabase)                     │
└─────────────────────────────────────────────────────────┘
```

### 🎨 Design Patterns

#### 1. **Service Pattern**
Semua business logic di-encapsulate dalam service objects:

```typescript
// Example: Event Service
export const eventService = {
  async createEvent(userId: string, data: CreateEventInput) { },
  async getEventsByUserId(userId: string) { },
  async updateEvent(eventId: string, data: UpdateEventInput) { },
  async deleteEvent(eventId: string) { },
}

// Usage in component:
const events = await eventService.getEventsByUserId(user.id)
```

**Benefits:**
- Reusable business logic
- Easier testing
- Clear separation of concerns
- Type-safe API

#### 2. **Context API for State Management**

```typescript
// AuthContext provides global auth state
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Usage:
const { user, signOut } = useAuth()
```

#### 3. **Compound Component Pattern**

```typescript
// Card component composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### 4. **Dialog/Modal Pattern**

```typescript
// Controlled dialog state
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Guest</DialogTitle>
    </DialogHeader>
    <AddGuestForm onSuccess={() => setOpen(false)} />
  </DialogContent>
</Dialog>
```

#### 5. **Server/Client Component Split**

```typescript
// Server Component (default in app/)
export default async function EventsPage() {
  const supabase = await createClient() // Server client
  const { data } = await supabase.from('events').select()
  return <EventsList events={data} />
}

// Client Component ('use client' directive)
'use client'
export function EventsList({ events }) {
  const [filtered, setFiltered] = useState(events)
  // Interactive logic here
}
```

### 🔄 Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Service Method Call
    ↓
Supabase Client Query
    ↓
PostgreSQL Database (RLS Check)
    ↓
Supabase Response
    ↓
Service Data Transformation
    ↓
Component State Update
    ↓
UI Re-render
```

**Example Flow: Creating a Guest**

```
1. User clicks "Add Guest" button
2. AddGuestDialog opens
3. User fills form and submits
4. Form validates with Zod schema
5. Component calls: guestService.createGuest(data)
6. Service executes: supabase.from('guests').insert(...)
7. Database checks RLS policy (user owns the event)
8. Returns new guest record
9. Service transforms data (adds QR code, invitation link)
10. Component updates local state
11. Table re-renders with new guest
12. Toast notification shows success
13. Dialog closes
```

### 🔐 Security Architecture

**Row-Level Security (RLS) Policies:**

```sql
-- Events table policy
CREATE POLICY "Users can only access their own events"
ON events
USING (user_id = auth.uid());

-- Guests table policy
CREATE POLICY "Users can only access guests from their events"
ON guests
USING (EXISTS (
  SELECT 1 FROM events
  WHERE events.id = guests.event_id
  AND events.user_id = auth.uid()
));
```

**Middleware Protection:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { user } = await getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

---

## Komponen Utama

### 🔑 File-file Kunci

#### 1. Authentication & Authorization

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Global auth state, sign in/up/out methods |
| `src/middleware.ts` | Route protection, session refresh |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client |

#### 2. Service Layer (Business Logic)

| File | Exports | Key Methods |
|------|---------|-------------|
| `src/lib/services/events.ts` | `eventService` | `createEvent`, `getEventsByUserId`, `updateEvent`, `deleteEvent` |
| `src/lib/services/guests.ts` | `guestService` | `createGuest`, `checkInGuest`, `searchGuests`, `getGuestStats` |
| `src/lib/services/analytics.ts` | `analyticsService` | `getGlobalAnalytics`, `exportAnalyticsToCsv` |
| `src/lib/services/dashboard-stats.ts` | Functions | `getDashboardStats`, `getMonthlyEventsData` |
| `src/lib/services/profile.ts` | `profileService` | `updateProfile`, `uploadAvatar`, `deleteAvatar` |

#### 3. Core Pages

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard` | `src/app/dashboard/page.tsx` | Main dashboard with stats |
| `/events` | `src/app/events/page.tsx` | Event listing |
| `/events/create` | `src/app/events/create/page.tsx` | Create event form |
| `/events/[id]` | `src/app/events/[id]/page.tsx` | Event details & guest list |
| `/events/[id]/checkin` | `src/app/events/[id]/checkin/page.tsx` | QR scanner check-in |
| `/analytics` | `src/app/analytics/page.tsx` | Analytics dashboard |
| `/templates` | `src/app/templates/page.tsx` | Template library |

#### 4. Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `StatsCard` | `src/components/dashboard/StatsCard.tsx` | Metric display card |
| `EventCard` | `src/components/dashboard/EventCard.tsx` | Event preview card |
| `MonthlyEventsChart` | `src/components/dashboard/MonthlyEventsChart.tsx` | Recharts bar chart |
| `AddGuestDialog` | `src/components/events/AddGuestDialog.tsx` | Add guest modal form |
| `ZXingScanner` | `src/components/checkin/ZXingScanner.tsx` | QR code scanner |
| `ModernTemplate` | `src/components/invitation/ModernTemplate.tsx` | Modern invitation design |
| `ElegantTemplate` | `src/components/invitation/ElegantTemplate.tsx` | Elegant invitation design |

### 📡 API Endpoints (Supabase)

**Database Tables:**

```typescript
// Events
supabase.from('events')
  .select('*')
  .eq('user_id', userId)

// Guests
supabase.from('guests')
  .select('*')
  .eq('event_id', eventId)

// Guest Check-in
supabase.from('guests')
  .update({ checked_in: true, checked_in_at: new Date().toISOString() })
  .eq('id', guestId)
```

**Storage Buckets:**

```typescript
// Avatar upload
supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file)
```

**Authentication:**

```typescript
// Sign up
supabase.auth.signUp({
  email,
  password,
  options: { data: { name } }
})

// Sign in
supabase.auth.signInWithPassword({ email, password })

// Sign out
supabase.auth.signOut()
```

### 🧩 Module Dependencies

```
Core Dependencies:
├── next@16.0.1 (Framework)
├── react@19.2.0 (UI Library)
├── typescript@5 (Language)
└── @supabase/supabase-js@2.78.0 (Database)

UI & Styling:
├── tailwindcss@4 (CSS Framework)
├── @radix-ui/* (UI Primitives)
├── lucide-react@0.548.0 (Icons)
└── shadcn/ui (Component Library)

Forms & Data:
├── react-hook-form@7.65.0 (Forms)
├── zod@4.1.12 (Validation)
├── recharts@2.15.4 (Charts)
└── papaparse@5.5.3 (CSV)

QR Features:
├── qrcode@1.5.4 (Generation)
└── @zxing/browser@0.1.5 (Scanning)

Utils:
├── date-fns@4.1.0 (Dates)
├── clsx + tailwind-merge (Classes)
└── next-themes@0.4.6 (Theming)
```

---

## Setup & Installation

### ✅ Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | >= 18.x | Runtime environment |
| **npm/yarn/pnpm** | Latest | Package manager |
| **Git** | Latest | Version control |
| **Supabase Account** | Free tier OK | Backend & database |
| **Modern Browser** | Chrome/Firefox/Safari | QR scanning requires webcam |

### 📦 Installation Steps

#### 1. Clone Repository

```bash
git clone <repository-url>
cd wedding-guest-app
```

#### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3. Setup Supabase Project

1. Buka [supabase.com](https://supabase.com)
2. Create new project
3. Copy project URL dan anon key
4. Copy service role key (optional, untuk admin operations)

#### 4. Configure Environment Variables

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)
```

#### 5. Initialize Database

Jalankan migration file di Supabase SQL Editor:

```bash
# File location: supabase/migrations/
# atau lihat DATABASE_SETUP.md untuk full schema
```

SQL yang perlu dijalankan:
- Create tables (`events`, `guests`)
- Create indexes
- Enable RLS policies
- Create triggers
- Create views

#### 6. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 🔧 Environment Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://abc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Public anon key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Optional | Admin operations | `eyJhbGc...` |

**⚠️ Security Notes:**
- NEVER commit `.env.local` to git
- Only use `NEXT_PUBLIC_` prefix untuk client-safe variables
- Service role key should ONLY be used in server-side code

### 🚀 Running the Application

#### Development Mode

```bash
npm run dev
```

Features:
- Hot reload
- Source maps
- Error overlay
- Console warnings

#### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

Features:
- Optimized bundles
- Minified code
- Static generation where possible
- Turbopack compilation

#### Linting

```bash
npm run lint
```

Checks:
- ESLint rules
- TypeScript errors
- Next.js best practices

---

## Konvensi Kode

### 📝 Naming Conventions

#### Files & Folders

```
✅ GOOD:
src/components/dashboard/StatsCard.tsx         # PascalCase for components
src/lib/services/events.ts                     # camelCase for utilities
src/app/events/[id]/page.tsx                   # kebab-case for routes
src/types/database.types.ts                    # .types.ts for type files

❌ BAD:
src/components/dashboard/stats_card.tsx        # No snake_case
src/lib/Services/Events.ts                     # No PascalCase for utils
src/app/Events/Page.tsx                        # No PascalCase in routes
```

#### Variables & Functions

```typescript
✅ GOOD:
const userName = 'John'                        # camelCase
const MAX_GUESTS = 500                         # UPPER_SNAKE_CASE for constants
function handleSubmit() {}                     # camelCase
const fetchUserData = async () => {}           # camelCase

❌ BAD:
const user_name = 'John'                       # No snake_case
const maxguests = 500                          # Use UPPER_SNAKE_CASE
function HandleSubmit() {}                     # No PascalCase
```

#### Components

```typescript
✅ GOOD:
export function StatsCard() {}                 # PascalCase
export default function DashboardPage() {}     # PascalCase

❌ BAD:
export function statsCard() {}                 # No camelCase
export default function dashboard_page() {}    # No snake_case
```

#### Types & Interfaces

```typescript
✅ GOOD:
interface User {}                              # PascalCase
type EventStatus = 'active' | 'past'           # PascalCase
type GuestCategory = 'VIP' | 'Regular'         # PascalCase

❌ BAD:
interface user {}                              # No lowercase
type event_status = 'active' | 'past'          # No snake_case
```

### 🗂 Folder Structure Conventions

```
✅ GOOD Structure:
src/
├── app/                      # Pages following Next.js conventions
│   └── events/
│       └── [id]/             # Dynamic routes in square brackets
│           └── page.tsx      # Must be named 'page.tsx'
├── components/
│   ├── ui/                   # Generic UI components
│   └── events/               # Feature-specific components
└── lib/
    ├── services/             # Business logic
    └── utils/                # Utility functions

❌ BAD Structure:
src/
├── pages/                    # Don't use 'pages' in App Router
├── all-components/           # Don't dump everything in one folder
└── helpers/                  # Use 'utils' or 'lib' instead
```

### 🎨 Component Structure Pattern

```typescript
'use client' // If client component (top of file)

// 1. Imports (grouped by source)
import { useState } from 'react'                    // React
import { useRouter } from 'next/navigation'         // Next.js
import { Button } from '@/components/ui/button'     // Internal components
import { eventService } from '@/lib/services/events'// Services
import { cn } from '@/lib/utils'                    // Utils
import type { Event } from '@/types/database.types' // Types

// 2. Type definitions (if any)
interface EventCardProps {
  event: Event
  onEdit?: (id: string) => void
}

// 3. Component definition
export function EventCard({ event, onEdit }: EventCardProps) {
  // 4. Hooks (useState, useEffect, useRouter, etc.)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 5. Event handlers
  const handleClick = () => {
    router.push(`/events/${event.id}`)
  }

  // 6. Render helpers (if needed)
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID')
  }

  // 7. JSX return
  return (
    <Card onClick={handleClick} className={cn('cursor-pointer hover:shadow-lg')}>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{formatDate(event.event_date)}</p>
      </CardContent>
    </Card>
  )
}
```

### 🔧 Best Practices

#### 1. **Use TypeScript Strictly**

```typescript
✅ GOOD:
interface CreateEventInput {
  name: string
  event_date: string
  venue: string
}

function createEvent(data: CreateEventInput): Promise<Event> {
  // Type-safe
}

❌ BAD:
function createEvent(data: any): any {
  // No type safety
}
```

#### 2. **Prefer Named Exports**

```typescript
✅ GOOD:
export function EventCard() {}
export const eventService = {}

❌ AVOID (unless necessary):
export default EventCard
```

**Exceptions:** Page components must use default export:
```typescript
// src/app/events/page.tsx
export default function EventsPage() {}
```

#### 3. **Use Path Aliases**

```typescript
✅ GOOD:
import { Button } from '@/components/ui/button'
import { eventService } from '@/lib/services/events'

❌ BAD:
import { Button } from '../../../components/ui/button'
import { eventService } from '../../lib/services/events'
```

#### 4. **Component Composition Over Props**

```typescript
✅ GOOD:
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

❌ AVOID:
<Card
  title="Title"
  content="Content"
  hasHeader
  hasFooter
/>
```

#### 5. **Server Components by Default**

```typescript
✅ GOOD:
// app/events/page.tsx (server component)
export default async function EventsPage() {
  const events = await eventService.getEvents()
  return <EventsList events={events} />
}

// components/EventsList.tsx (client component only if needed)
'use client'
export function EventsList({ events }) {
  const [filtered, setFiltered] = useState(events)
  // Interactive logic
}

❌ BAD:
// Unnecessarily marking server component as client
'use client'
export default function EventsPage() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    // Fetching on client when could be on server
  }, [])
}
```

#### 6. **Error Handling**

```typescript
✅ GOOD:
try {
  await eventService.createEvent(data)
  toast.success('Event created!')
} catch (error) {
  console.error('Event creation error:', error)
  toast.error(error instanceof Error ? error.message : 'Failed to create event')
}

❌ BAD:
try {
  await eventService.createEvent(data)
} catch (error) {
  // Silent failure
}
```

#### 7. **Design Tokens Usage**

```typescript
import { spacing, fontSize, iconSize, classNames } from '@/lib/design-tokens'

✅ GOOD:
<div className={cn('p-4', classNames.card.default)}>
  <Icon size={iconSize.md} />
</div>

❌ BAD:
<div className="p-4 rounded-lg border shadow-sm">
  <Icon size={24} />
</div>
```

#### 8. **Form Validation with Zod**

```typescript
✅ GOOD:
const eventSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  event_date: z.string(),
  venue: z.string().min(1, 'Venue is required'),
})

type EventFormData = z.infer<typeof eventSchema>

❌ BAD:
// Manual validation
if (name.length < 3) {
  setError('Name too short')
}
```

---

## Testing

### 🧪 Testing Strategy

**Current Status:** ⚠️ Testing framework not yet implemented

**Planned Testing Approach:**

#### 1. **Unit Tests** (Planned)
- Framework: **Jest** + **React Testing Library**
- Target: Service functions, utility functions
- Coverage goal: 80%

```typescript
// Example test (planned)
describe('eventService', () => {
  it('should create event with valid data', async () => {
    const data = {
      name: 'Test Event',
      event_date: '2025-12-31',
      venue: 'Test Venue'
    }
    const result = await eventService.createEvent('user-id', data)
    expect(result).toHaveProperty('id')
  })
})
```

#### 2. **Component Tests** (Planned)
```typescript
// Example (planned)
describe('EventCard', () => {
  it('should render event details', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })
})
```

#### 3. **Integration Tests** (Planned)
- Framework: **Playwright** or **Cypress**
- Test user flows end-to-end

#### 4. **Manual Testing Checklist**

Current approach (until automated tests are implemented):

**Event Management:**
- [ ] Create event with all fields
- [ ] Edit event details
- [ ] Delete event
- [ ] View event details

**Guest Management:**
- [ ] Add guest manually
- [ ] Import guests via CSV
- [ ] Edit guest details
- [ ] Delete guest
- [ ] Check-in via QR scan

**Analytics:**
- [ ] View dashboard stats
- [ ] Export CSV report
- [ ] Filter by date range

**Authentication:**
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Access protected routes

**Responsive Design:**
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1280px)

---

## Notes untuk Developer

### ⚠️ Hal-hal yang Perlu Diperhatikan

#### 1. **Supabase RLS Policies**
- SELALU test dengan user yang berbeda
- RLS policies memfilter data di database level
- User hanya bisa akses event/guest mereka sendiri
- Jangan bypass RLS kecuali menggunakan service role key

```typescript
// ✅ AMAN - RLS akan filter otomatis
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('user_id', user.id)

// ⚠️ HATI-HATI - Service role key bypass RLS
const supabaseAdmin = createClient(serviceRoleKey)
const { data } = await supabaseAdmin
  .from('events')
  .select('*') // Returns ALL events from ALL users!
```

#### 2. **Server vs Client Components**

```typescript
// ❌ ERROR: Can't use hooks in server component
export default function Page() {
  const [state, setState] = useState() // Error!
}

// ✅ CORRECT: Mark as client component
'use client'
export default function Page() {
  const [state, setState] = useState() // OK
}

// ✅ BETTER: Keep server component, extract client part
export default async function Page() {
  const data = await fetchData() // Server-side
  return <ClientComponent data={data} /> // Client part
}
```

#### 3. **Environment Variables**

```typescript
// ✅ SAFE - Available on client
const url = process.env.NEXT_PUBLIC_SUPABASE_URL

// ❌ UNSAFE - Will be undefined on client
const key = process.env.SECRET_KEY

// ✅ SAFE - Only on server
// app/api/admin/route.ts
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
```

#### 4. **Middleware Performance**

```typescript
// ❌ BAD - Slow middleware
export async function middleware(request: NextRequest) {
  const data = await fetchLargeData() // Blocks every request!
  // ...
}

// ✅ GOOD - Fast middleware
export async function middleware(request: NextRequest) {
  const session = await getSession() // Minimal work
  if (!session && isProtectedRoute(request)) {
    return redirect('/login')
  }
}
```

#### 5. **Type Safety**

```typescript
// ✅ ALWAYS define types
interface Event {
  id: string
  name: string
  event_date: string
}

// ✅ ALWAYS use Zod for runtime validation
const eventSchema = z.object({
  name: z.string().min(1),
  event_date: z.string(),
})

// ❌ NEVER use 'any'
function doSomething(data: any) {} // Bad!

// ✅ USE proper typing
function doSomething(data: Event) {} // Good!
```

### 🐛 Known Issues

#### 1. **QR Scanner Camera Permission**
- **Issue:** Browser requires HTTPS for camera access
- **Workaround:** Use localhost (allowed) or deploy to HTTPS
- **Solution:** Enable HTTPS in dev with `next-dev-https` package

#### 2. **CSV Import Large Files**
- **Issue:** Browser may freeze on very large CSV (>10MB)
- **Workaround:** Split large files or use batch processing
- **Solution:** Implement worker threads (planned)

#### 3. **Chart Rendering on Mobile**
- **Issue:** Recharts may overflow on small screens
- **Solution:** Use responsive containers and proper sizing

#### 4. **Session Refresh Edge Case**
- **Issue:** Middleware sometimes doesn't refresh session token
- **Workaround:** Manual page refresh
- **Fix:** Implemented in `lib/supabase/middleware.ts`

### 📋 Roadmap / TODO

#### High Priority
- [ ] **Testing Framework Setup** - Jest + React Testing Library
- [ ] **E2E Tests** - Critical user flows
- [ ] **Performance Optimization** - Code splitting, lazy loading
- [ ] **Mobile Optimization** - PWA support

#### Medium Priority
- [ ] **Export to PDF** - Generate invitation PDFs
- [ ] **Email Integration** - Send invitations via email
- [ ] **SMS Notifications** - Check-in alerts
- [ ] **Multi-language** - i18n support (EN/ID)
- [ ] **More Templates** - Traditional, Minimalist, Luxury

#### Low Priority
- [ ] **Admin Dashboard** - Super admin panel
- [ ] **Payment Integration** - Premium features
- [ ] **Analytics Export** - Multiple formats (Excel, PDF)
- [ ] **Team Collaboration** - Multi-user events

#### Documentation
- [ ] API Reference completion
- [ ] Component Storybook
- [ ] Video tutorials
- [ ] Migration guides

### 🔗 Useful Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| **Next.js Docs** | [nextjs.org/docs](https://nextjs.org/docs) | Framework reference |
| **Supabase Docs** | [supabase.com/docs](https://supabase.com/docs) | Database & auth |
| **shadcn/ui** | [ui.shadcn.com](https://ui.shadcn.com) | Component library |
| **Tailwind CSS** | [tailwindcss.com](https://tailwindcss.com) | Styling docs |
| **React Hook Form** | [react-hook-form.com](https://react-hook-form.com) | Form handling |
| **Zod** | [zod.dev](https://zod.dev) | Schema validation |
| **Recharts** | [recharts.org](https://recharts.org) | Chart library |

### 💡 Development Tips

#### Quick Commands

```bash
# Start dev server
npm run dev

# Build production
npm run build

# Run linter
npm run lint

# Check types
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next

# Reset node_modules
rm -rf node_modules && npm install
```

#### VS Code Extensions Recommended

- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Tailwind CSS IntelliSense** - Class suggestions
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Pretty TypeScript Errors** - Better error messages

#### Git Workflow

```bash
# Feature branch
git checkout -b feature/guest-bulk-delete

# Commit changes
git add .
git commit -m "feat: add bulk delete for guests"

# Push to remote
git push origin feature/guest-bulk-delete

# Create PR and merge after review
```

---

## 📞 Support & Contact

**Project Documentation:**
- README.md - Project overview
- STYLEGUIDE.md - Design system
- TROUBLESHOOTING.md - Common issues
- DATABASE_SETUP.md - Database guide

**Getting Help:**
1. Check existing documentation in `/docs/`
2. Search closed issues in GitHub
3. Ask in team Slack/Discord
4. Create new issue with template

---

## 📄 License

[Specify license here - MIT, Apache 2.0, etc.]

---

**Last Updated:** January 2025
**Version:** 0.1.0
**Status:** MVP Complete - Ready for Production

---

> 💡 **Tip for New Developers:** Start by reading README.md, then STYLEGUIDE.md, then this document. Run the app locally and explore the dashboard to understand the user flow before diving into code.
