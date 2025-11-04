# Wedding Guest Management App

<!--
🤖 AI ASSISTANT NOTE:
When using Claude Code or similar AI tools, ALWAYS reference the "Development Status" section
to understand what's completed and what's next in the priority queue.

Template prompt: "[Reference README Development Status] Next task: [feature from P0/P1 section]"
-->

A modern wedding guest management application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Development Status

**Last Updated:** November 1, 2025
**Current Phase:** MVP Complete - Analytics & Reporting Implemented ✅

## 🎨 Dashboard Structure & Navigation

### Sidebar Menu

#### Main Navigation
- **📊 Dashboard** (`/dashboard`) - Overview with stats and quick actions
- **📅 Events** (`/events`) - Event management and listing
- **👥 Guests** (`/guests`) - All guests across events (Coming Soon)
- **📋 Templates** (`/templates`) - Invitation template library (Coming Soon)
- **📈 Analytics** (`/analytics`) - Reports and insights (Coming Soon)
- **⚙️ Settings** (`/settings`) - User settings and preferences

#### Dashboard Overview Page
Location: `/dashboard`

Components:
- Welcome header with user name
- Quick stats cards:
  * Total Events (with growth indicator)
  * Total Guests
  * Upcoming Events (next 30 days)
  * Recent Check-ins (today)
- Upcoming events list (next 5 events)
- Recent activity feed
- Quick action buttons:
  * Create New Event
  * Import Guests
  * View Analytics

#### Events Page
Location: `/events`

Features:
- Grid/List view toggle
- Filter: All, Upcoming, Past, Draft
- Sort: Date, Name, Guest Count
- Search by event name
- Create New Event button (prominent)
- Event cards showing:
  * Event name & date
  * Venue
  * Guest count
  * Check-in progress
  * Quick actions: View, Edit, Delete

Per-event navigation (when viewing event detail):
- Event Details (`/events/[id]`)
- Guest List (`/events/[id]/guests`)
- Invitation Preview (`/events/[id]/invitation`)
- Check-in Dashboard (`/events/[id]/checkin`)
- Event Settings (`/events/[id]/settings`)

#### Guests Page
Location: `/guests` (Coming Soon)

Features:
- All guests across all events
- Filter by: Event, Category, Check-in Status
- Search by name or phone
- Bulk actions: Export, Delete, Update Category
- Guest details modal
- Import history

#### Templates Page
Location: `/templates` (Coming Soon)

Features:
- Template gallery (grid view)
- Preview modal for each template
- Filter by style: Modern, Elegant, Custom
- Set default template
- Upload custom template (future)

#### Analytics Page
Location: `/analytics` (Coming Soon)

Features:
- Date range selector
- Key metrics:
  * Total events in period
  * Total guests invited
  * Overall attendance rate
  * Average check-in time
- Charts:
  * Check-in timeline
  * Attendance by event
  * Guest category breakdown
- Export reports (PDF/CSV)

#### Settings Pages

**Profile** (`/settings/profile`)
- Full Name
- Email Address (verified badge)
- Phone Number
- Profile Photo Upload
- Business Name (for vendors)
- Business Type (Wedding Organizer, Catering, Venue, Individual)
- Location/City
- Bio (optional)
- Save Changes button

**Account & Billing** (`/settings/billing`)
- Current plan badge (Free/Pro/Enterprise)
- Usage statistics:
  * Events used / limit
  * Guests used / limit
  * Storage used
- Payment method (card/bank)
- Billing history table
- Upgrade/Downgrade buttons
- Cancel subscription (with confirmation)

**Preferences** (`/settings/preferences`)
- Language: Indonesian / English
- Date Format: DD/MM/YYYY / MM/DD/YYYY
- Time Zone (dropdown)
- Currency: IDR / USD
- Default Event Template (dropdown)
- Default Guest Category
- Theme: Light / Dark / System (future)

**Notifications** (`/settings/notifications`)
- Email Notifications (toggles):
  * New guest check-in
  * Event starting soon (24h before)
  * Weekly summary report
  * System updates
  * Marketing emails
- Browser Push Notifications (toggle)
- WhatsApp Notifications (future, toggle)
- Notification frequency: Real-time / Hourly / Daily

**Security** (`/settings/security`)
- Change Password:
  * Current password
  * New password
  * Confirm password
- Two-Factor Authentication (2FA):
  * Enable/Disable toggle
  * Setup instructions
  * Backup codes
- Active Sessions:
  * Current session
  * Other active sessions (with device info)
  * "Sign out all devices" button
- Login History (last 10 logins with IP, device, date)
- API Keys (for developers):
  * Generate new key
  * Revoke existing keys
- Danger Zone:
  * Export all data
  * Delete account (with confirmation)

**Integrations** (`/settings/integrations`)
- WhatsApp Business API (future)
- Google Calendar Sync (future)
- Email Marketing (Mailchimp, etc - future)
- Zapier/Make.com webhooks (future)
- Custom API access

### Dashboard Layout Components

**Sidebar Component** (`src/components/dashboard/Sidebar.tsx`)
- Logo at top
- Navigation menu items with icons
- Active state indication
- Collapsible on mobile
- User menu at bottom:
  * User avatar & name
  * Quick settings
  * Logout

**DashboardLayout** (`src/app/dashboard/layout.tsx`)
- Sidebar (persistent)
- Main content area
- Mobile: Hamburger menu + drawer
- Desktop: Fixed sidebar + content

**Mobile Navigation**
- Bottom tab bar (alternative to hamburger)
- Key pages: Dashboard, Events, Guests, More
- Slide-out sidebar for full menu

---

### ✅ Completed Features

#### Authentication & User Management
- [x] User registration with email/password (Supabase Auth)
- [x] Login functionality with session management
- [x] Protected routes with Next.js middleware
- [x] Auto-insert user to public.users table via database trigger
- [x] User profile data storage
- [x] Logout functionality with session cleanup

#### Dashboard
- [x] Main dashboard layout with Shadcn/ui zinc/new-york theme
- [x] Real-time event statistics (Total Events, Upcoming, Guests, Check-ins)
- [x] Event overview cards with status badges
- [x] Search and filter functionality (All, Upcoming, Completed)
- [x] Responsive design (mobile, tablet, desktop)
- [x] Quick actions (Create Event, Import Data placeholders, Reports placeholders)
- [x] Empty states with beautiful illustrations
- [x] Centered container layout with proper spacing (max-w-7xl)
- [x] User profile dropdown menu (Profile, Settings, Logout)
- [x] Backdrop blur effects on header

#### Event Management
- [x] Create new event form with validation (react-hook-form + zod)
- [x] Event detail page with tabbed interface (Guest List, Check-in, Settings)
- [x] Event information display (event_name, event_date, venue, bride_name, groom_name, template)
- [x] Update event settings functionality
- [x] Delete event with confirmation dialog
- [x] Event status tracking (Hari Ini, Mendatang, Selesai)
- [x] Events list on dashboard with cards
- [x] Database schema with RLS policies
- [x] CRUD operations for events

#### Guest List Management ✅ COMPLETE
- [x] "Guests" tab in event detail page
- [x] Guest list table with Shadcn Table component
- [x] Columns: Name, Phone, Category, Kehadiran (Attendance), Actions
- [x] "Add Guest" dialog with Shadcn Dialog component
- [x] Add guest form with validation: name (required), phone (optional), category dropdown
- [x] Guest categories: VIP, Regular, Family
- [x] Attendance tracking: checked_in boolean (Sudah hadir / Belum hadir)
- [x] Auto-generated QR codes on guest creation (format: QR-{UUID})
- [x] Auto-generated invitation links (format: /invitation/{eventId}/{guestId})
- [x] Edit guest functionality with pre-filled form
- [x] Delete guest with confirmation dialog
- [x] Real-time updates after mutations
- [x] Empty state when no guests yet
- [x] Badge components for category and attendance display
- [x] Filter guests by attendance (Semua / Sudah Hadir / Belum Hadir)
- [x] Search guests by name or phone

#### Design System
- [x] Shadcn/ui components exclusively (no raw Tailwind for UI)
- [x] Zinc/New York theme with CSS variables
- [x] Consistent color palette (background, foreground, muted, accent, primary)
- [x] Subtle borders and soft shadows
- [x] Smooth animations and transitions
- [x] Skeleton loading states
- [x] Toast notifications (Sonner)
- [x] Reusable UI components structure
- [x] Mobile-first responsive layouts
- [x] Professional brand refresh with Logo component
- [x] Zero bright/neon colors (no pink-500, purple-600, blue-500)
- [x] Consistent Shadcn Button variants throughout

---

### 🚧 Currently In Progress

*No features currently in development*

---

### 📋 Up Next - Priority Roadmap

#### 🔴 P0 - Critical (Current Sprint)

**1. QR Code Visual Display & Download** ✅ COMPLETE
- [x] Auto-generate unique QR code when adding guest (format: QR-{UUID})
- [x] Store QR code string in guests.qr_code column
- [x] Install qrcode library: `npm install qrcode @types/qrcode`
- [x] Create QR code rendering utility in `src/lib/utils/qrcode.ts`
- [x] Display visual QR code in guest detail dialog
- [x] Add "View QR Code" button in guest list table actions
- [x] QR code dialog showing large scannable QR code
- [x] Include guest name and category in QR dialog
- [x] "Download QR" button to save as PNG
- [x] Print QR code functionality with guest details
- [x] Copy QR code text to clipboard
- [ ] Bulk download all QR codes for event (ZIP file) - Future enhancement

**Database:** ✅ Complete (qr_code column populated automatically)
**Completed:** October 31, 2025
**Dependencies:** Guest List Management (✅ Complete)

---

**2. CSV Import for Bulk Guest Upload** ✅ COMPLETE
- [x] Install papaparse: `npm install papaparse @types/papaparse`
- [x] "Import CSV" button in guest list toolbar (next to "Add Guest")
- [x] CSV upload dialog with file input and drag-drop support
- [x] CSV template download button with sample data
- [x] Parse CSV with columns: name, phone, category
- [x] Validate CSV data (required fields, valid category values)
- [x] Preview parsed data in table before import
- [x] Show validation errors with row numbers and error details
- [x] Summary cards showing total/valid/error counts
- [x] Bulk insert guests with auto QR code and invitation link generation
- [x] Progress indicator during import (percentage-based)
- [x] Success notification with imported guest count
- [x] Comprehensive error handling for failed imports
- [x] Reset functionality to clear and start over

**CSV Template Format:**
```csv
name,phone,category
John Doe,08123456789,VIP
Jane Smith,08198765432,Regular
Ahmad Family,08177778888,Family
```

**Completed:** October 31, 2025
**Dependencies:** Guest List Management (✅ Complete), QR Code Generation (✅ Complete)

---

#### 🟠 P1 - High Priority (Next Sprint)

**3. Digital Invitation Templates** ✅ COMPLETE
- [x] Design 2 invitation templates (Modern & Elegant styles)
- [x] Create invitation page route: `/invitation/[eventId]/[guestId]`
- [x] Public route (no auth required, accessible by anyone with link)
- [x] Fetch guest and event data from database
- [x] Template switcher based on event.template_id
- [x] Display: event name, date (formatted), venue, couple names
- [x] Personalized greeting with guest name
- [x] Display large QR code for check-in (400x400px)
- [x] Add to calendar button (Google Calendar integration)
- [x] Share via WhatsApp button with pre-filled message
- [x] Responsive design (mobile-first, looks good on phone)
- [x] Beautiful animations (fade-in with translate)
- [x] Modern template: Gradient (rose/pink/fuchsia), serif fonts, clean layout
- [x] Elegant template: Amber colors, decorative borders, hearts, formal style
- [x] Download QR code button from invitation page
- [x] Error states (invitation not found)
- [x] Loading states with spinner

**Completed:** October 31, 2025
**Dependencies:** Guest List Management (✅ Complete), QR Code Generation (✅ Complete)

---

**4. Invitation Link Sharing UI** ✅ COMPLETE
- [x] Generate unique shareable link per guest (auto-generated on creation)
- [x] Format: `/invitation/{eventId}/{guestId}`
- [x] Store link in guests.invitation_link column
- [x] "Copy Link" button in guest list table actions (Link2 icon)
- [x] Copy to clipboard with success toast notification
- [x] WhatsApp share button with pre-filled message template (Share2 icon, green)
- [x] Message format: "Kepada Yth. {name}, Anda diundang ke acara {event_name}..." with full details
- [x] Preview invitation button (ExternalLink icon, blue, opens in new tab)
- [x] Error handling for clipboard failures
- [x] Mobile-responsive action buttons layout
- [ ] Bulk copy links for all guests (to clipboard or download as text file) - Future enhancement
- [ ] Click tracking (track who opened invitation) - Future enhancement

**Completed:** October 31, 2025
**Dependencies:** Digital Invitation Templates (✅ Complete), Guest List Management (✅ Complete)

---

#### 🟡 P2 - Medium Priority (Future Sprint)

**5. QR Scanner & Check-in System** ✅ COMPLETE
- [x] Install scanner library: `npm install html5-qrcode`
- [x] Create check-in page: `/events/[eventId]/checkin` (dedicated page)
- [x] Camera-based QR scanner with permission request
- [x] Scan QR code and decode (html5-qrcode library)
- [x] Validate QR code matches guest list
- [x] Mark guest as checked-in (update checked_in = true, checked_in_at = now())
- [x] Success animation with guest name, category, and animated checkmark
- [x] Auto-reset scanner for next guest (3 second delay)
- [x] Manual search fallback (search by name or phone)
- [x] Prevent duplicate check-in (show warning if already checked-in)
- [x] Mobile-optimized scanner UI (split-screen layout)
- [x] Works on tablets and phones (target device for vendors)
- [x] Real-time statistics (Total, Checked In, Pending)
- [x] Start/Stop scanner controls
- [x] Camera permission denied handling
- [x] "Start Check-in" button from event detail page
- [ ] Sound effect on successful scan - Future enhancement
- [ ] Undo check-in functionality - Future enhancement

**Completed:** October 31, 2025
**Dependencies:** QR Code Generation (✅ Complete), Guest List Management (✅ Complete)

---

**6. Real-time Check-in Dashboard** ✅ COMPLETE
- [x] Live statistics cards (total guests, checked-in, remaining, percentage)
- [x] Real-time guest list with check-in status indicators
- [x] Use Supabase Realtime subscriptions to listen for changes
- [x] Status indicators: green badge (checked-in), gray badge (pending)
- [x] Filter dropdown: All / Checked-in / Not Checked-in
- [x] Sort dropdown: Name / Check-in time / Category
- [x] Manual toggle check-in status (clickable badge)
- [x] Check-in timeline view (list of recent check-ins with timestamps)
- [x] Export check-in report to CSV (name, phone, category, status, check-in time)
- [x] Real-time updates with Supabase subscriptions

**Completed:** November 1, 2025
**Dependencies:** QR Scanner & Check-in System (✅ Complete)

---

#### 🟢 P3 - Nice to Have (Backlog)

**7. Analytics & Reporting** ✅ COMPLETE
- [x] Event statistics dashboard (attendance rate, category breakdown)
- [x] Attendance rate calculation (checked-in / total guests * 100)
- [x] Check-in timeline chart with Recharts
- [x] Category breakdown pie chart (VIP vs Regular vs Family)
- [x] Attendance status pie chart (Checked In vs Not Checked In)
- [x] Peak check-in hours bar chart
- [x] Summary statistics cards (Total, Checked In, Pending, Attendance Rate)
- [x] Line chart showing check-in flow over time
- [x] Responsive charts with Recharts library
- [x] Analytics tab in event detail page with icon
- [x] Empty state for events with no check-in data yet
- [ ] Export reports to PDF (event summary, guest list, attendance) - Future enhancement

**Completed:** November 1, 2025
**Dependencies:** Real-time Check-in Dashboard (✅ Complete)

**8. Additional Features (Future)**
- [ ] RSVP confirmation system (guest can RSVP via invitation link)
- [ ] Email notifications (send invitations via email)
- [ ] WhatsApp integration (send via WhatsApp Business API)
- [ ] Multiple invitation templates (3+ designs: Modern, Elegant, Minimalist)
- [ ] Template customization (change colors, fonts, backgrounds)
- [ ] Photo gallery per event
- [ ] Gift registry integration
- [ ] Custom branding for vendors (white-label, upload logo)
- [ ] Payment integration (Midtrans for premium features)
- [ ] Subscription plans (Free: 1 event, Pro: unlimited, Enterprise: white-label)

---

### 🐛 Known Issues & Bugs

*No critical bugs at the moment*

**Recent Fixes:**
- ✅ Fixed database schema mismatch (removed non-existent `status` column, now uses `checked_in` boolean)
- ✅ Fixed NOT NULL constraint violation for `qr_code` and `invitation_link` (auto-generated on guest creation)
- ✅ Fixed RLS policies for guest creation (see `supabase/migrations/fix-guests-rls-policies.sql`)

**Minor Issues:**
- None reported

---

### 📝 Technical Debt

*No significant technical debt*

**Recent Improvements:**
- ✅ Updated database schema to match actual Supabase schema (removed `status` column)
- ✅ Auto-generation of QR codes and invitation links on guest creation
- ✅ Improved type safety by making `qr_code` and `invitation_link` required fields

**Future Refactoring:**
- Consider implementing virtual scrolling for large guest lists (>500 guests)
- Add caching layer for frequently accessed data (React Query or SWR)
- Optimize image loading for invitation templates (Next.js Image optimization)
- Add migration script to populate QR codes for existing guests (if any)
- Implement pagination for guest list (currently loads all guests)

---

### 💭 Development Notes

**Design Decisions:**
- Using Shadcn/ui exclusively for all UI components (no raw Tailwind utility classes for UI elements)
- QR code format: `{eventId}_{guestId}_{timestamp}` for uniqueness and traceability
- CSV import format kept simple: name, phone, category (3 columns only for MVP)
- Mobile-first approach for all features (wedding vendors will use tablets/phones on event day)
- Browser-based QR scanner (no native app needed for MVP, works on modern browsers)
- Zinc/New York theme for professional, clean look

**Database Notes:**
- All tables use UUID for primary keys (Supabase default)
- RLS policies ensure users only see their own events and guests
- Supabase Realtime enabled for check-in dashboard (subscription-based updates)
- Auto-trigger creates user in public.users on signup (handles first-time users)
- ON DELETE CASCADE for guests when event is deleted (cleanup automatically)

**Performance Considerations:**
- QR generation happens on-demand when adding guest (not pre-generated for all)
- Images stored in Supabase Storage (not database, better performance)
- Pagination will be added when guest lists exceed 100 guests per event
- Lazy loading for images in invitation templates

---

### 🎯 Current Focus

**Recently Completed:**
1. ✅ Guest List Management UI and CRUD operations
2. ✅ Dashboard theme redesign (Shadcn/ui zinc/new-york)
3. ✅ QR Code generation and display system
4. ✅ CSV Import feature for bulk guest upload
5. ✅ Digital Invitation Templates (Modern & Elegant designs)
6. ✅ Invitation Link Sharing UI (Copy, WhatsApp, Preview)
7. ✅ QR Scanner & Check-in System (Camera-based with manual fallback)
8. ✅ Real-time Check-in Dashboard with Supabase Realtime
9. ✅ Analytics & Reporting with interactive charts (Recharts)

**Next Priority:**
1. Additional Features (RSVP, Email notifications, WhatsApp integration)
2. Export reports to PDF
3. Advanced analytics and customization

---

## Tech Stack

- **Framework**: Next.js 16.0.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database & Auth**: Supabase
- **UI Components**: Shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Form Validation**: React Hook Form + Zod
- **Notifications**: Sonner
- **Charts**: Recharts
- **Package Manager**: npm
- **QR Scanner**: @zxing/browser + @zxing/library

---

## 🎨 Brand & Design Guidelines

### Design Philosophy
Professional, modern, and elegant wedding platform with a focus on usability and accessibility.

### Color System

**Primary Theme: Zinc/Slate (Neutral & Professional)**

We use Shadcn/ui theme colors exclusively via CSS variables:

✅ **Always Use:**
- `bg-primary` / `text-primary` / `border-primary` - Main brand color
- `bg-secondary` / `text-secondary` - Secondary actions
- `bg-muted` / `text-muted-foreground` - Subtle backgrounds and text
- `bg-background` / `text-foreground` - Base colors
- `bg-card` / `text-card-foreground` - Card containers
- `border-border` / `border-input` - Consistent borders
- `bg-primary/5`, `bg-primary/10` - Subtle opacity variants

✅ **Semantic Colors (Acceptable):**
- Green (`green-50`, `green-600`) - Success, check-in, active states
- Red (`red-50`, `red-600`, `destructive`) - Errors, delete actions
- Orange/Amber (`orange-600`, `amber-500`) - Warnings, pending states

❌ **Never Use (Bright/Neon Colors):**
- `bg-pink-500`, `bg-pink-600`, `text-pink-500` etc.
- `bg-purple-500`, `bg-purple-600`, `from-purple-*` etc.
- `bg-blue-500`, `bg-blue-600`, `text-blue-500` etc.
- `bg-fuchsia-*`, `bg-rose-*`, `bg-indigo-*`, `bg-violet-*`
- Any gradient with bright colors: `from-pink-500 to-purple-600`

### Component Usage

**Buttons:**
```typescript
// ✅ Correct - Use Shadcn Button component
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>

// ❌ Wrong - No custom button styling with bright colors
<button className="bg-pink-500 hover:bg-pink-700 text-white">Click</button>
```

**Cards:**
```typescript
// ✅ Correct
<Card className="border-border">
  <CardHeader>
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-6 h-6 text-primary" />
    </div>
  </CardHeader>
</Card>

// ❌ Wrong
<div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">...</div>
```

**Badges:**
```typescript
// ✅ Correct
<Badge>Default</Badge>
<Badge variant="secondary">Info</Badge>
<Badge variant="outline">Outline</Badge>

// ❌ Wrong
<span className="bg-blue-500 text-white px-2 py-1">Badge</span>
```

### Branding

**Logo Component:**
```typescript
import { Logo } from '@/components/ui/logo'

// Usage:
<Logo /> // Full logo with icon and text
<Logo showText={false} /> // Icon only
<Logo className="..." iconClassName="..." textClassName="..." />
```

**Brand Elements:**
- **Icon**: Sparkles (Lucide React)
- **Name**: WeddingGuest
- **Typography**: Geist Sans (modern, clean)
- **Style**: Professional, approachable, trustworthy

### Layout Guidelines

**Spacing:**
- Use generous whitespace for clarity
- Container max-width: `max-w-7xl` for main content
- Section padding: `py-20` for sections, `py-8` for smaller areas
- Card padding: `p-6` or `p-8` depending on content

**Responsive Design:**
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Grid layouts: `grid md:grid-cols-2 lg:grid-cols-3`

**Typography:**
- Headings: `text-foreground` with proper hierarchy (text-4xl, text-3xl, text-2xl)
- Body text: `text-muted-foreground` for secondary content
- Links: `hover:text-foreground transition-colors`

### Accessibility

- All interactive elements must have proper focus states
- Use semantic HTML (`<button>`, `<Link>`, `<nav>`)
- Maintain proper color contrast ratios
- Include loading states for async operations
- Provide error messages for form validation

### File Organization

```
src/
├── app/              # Next.js app router pages
├── components/
│   ├── ui/          # Shadcn/ui components
│   │   └── logo.tsx # Brand logo component
│   ├── dashboard/   # Dashboard-specific components
│   ├── events/      # Event-related components
│   └── ...
├── lib/             # Utilities and helpers
└── types/           # TypeScript type definitions
```

### Development Rules

1. **Always use Shadcn/ui components** - Never create custom UI with raw Tailwind
2. **Import components properly** - Use `@/components/ui/*` for UI components
3. **Consistent naming** - Follow existing patterns (PascalCase for components)
4. **Type safety** - Use TypeScript strictly, no `any` types
5. **Color discipline** - Only use theme colors, never hardcode bright colors

## About This Project

Wedding Guest Management App adalah platform untuk wedding organizer dan event planner untuk mengelola undangan digital, guest list, dan check-in system secara modern dan efisien.

### Target Users
- Wedding Organizer (WO) dan Event Planner
- Catering dan venue vendors
- Individual users untuk personal events

### Features Overview

See the **[Development Status](#-development-status)** section above for detailed feature tracking, roadmap, and priorities.

## Database Schema

The application uses Supabase PostgreSQL with the following schema:

### Tables

#### `events`
```sql
id            UUID (PK)
user_id       UUID (FK -> auth.users.id)
event_name    TEXT (NOT NULL)
event_date    DATE (NOT NULL)
venue         TEXT (NOT NULL)
bride_name    TEXT (NOT NULL)
groom_name    TEXT (NOT NULL)
photo_url     TEXT
template_id   TEXT (DEFAULT 'Modern')
created_at    TIMESTAMPTZ (DEFAULT NOW())
```

#### `guests`
```sql
id              UUID (PK)
event_id        UUID (FK -> events.id ON DELETE CASCADE)
name            TEXT (NOT NULL)
phone           TEXT
category        TEXT (DEFAULT 'Regular') -- VIP, Regular, Family
status          TEXT (DEFAULT 'pending') -- pending, confirmed, declined
checked_in      BOOLEAN (DEFAULT FALSE)
checked_in_at   TIMESTAMPTZ
created_at      TIMESTAMPTZ (DEFAULT NOW())
updated_at      TIMESTAMPTZ (DEFAULT NOW())
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own events (`user_id = auth.uid()`)
- Guests are accessible through event ownership
- Public access for invitation pages (guest view only - planned)

### Example Policies

```sql
-- Events: Users can view their own events
CREATE POLICY "Users can view own events"
ON events FOR SELECT
USING (auth.uid() = user_id);

-- Events: Users can insert their own events
CREATE POLICY "Users can insert own events"
ON events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Events: Users can update their own events
CREATE POLICY "Users can update own events"
ON events FOR UPDATE
USING (auth.uid() = user_id);

-- Events: Users can delete their own events
CREATE POLICY "Users can delete own events"
ON events FOR DELETE
USING (auth.uid() = user_id);
```

### Database Setup

If you need to set up the database from scratch:

1. Go to your Supabase Dashboard → SQL Editor
2. Run the SQL script from `supabase-schema.sql` (in project root)
3. This will create:
   - All tables with proper structure
   - Indexes for better performance
   - RLS policies for security
   - Triggers for timestamp updates

Or manually run:
```sql
-- See supabase-schema.sql for complete setup
```

## Project Structure

```
wedding-guest-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout dengan Toaster
│   │   ├── page.tsx      # Landing page
│   │   ├── dashboard/    # Dashboard page (redesigned)
│   │   ├── events/       # Event pages
│   │   │   ├── create/   # Create event form
│   │   │   └── [id]/     # Event detail page
│   │   └── (auth)/       # Auth pages (login, register)
│   ├── components/       # Reusable React components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   │   ├── StatsCards.tsx
│   │   │   ├── EventCard.tsx
│   │   │   └── EventsGrid.tsx
│   │   └── layout/       # Layout components
│   │       └── DashboardHeader.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities and configurations
│   │   ├── supabase/     # Supabase clients
│   │   │   ├── client.ts    # Browser client
│   │   │   ├── server.ts    # Server client
│   │   │   └── middleware.ts # Middleware client
│   │   ├── services/     # API services
│   │   │   ├── events.ts    # Event CRUD operations
│   │   │   └── guests.ts    # Guest CRUD operations
│   │   └── utils.ts      # Utility functions
│   ├── types/            # TypeScript types
│   │   └── database.types.ts
│   └── middleware.ts     # Next.js middleware for auth
├── public/               # Static assets
├── components.json       # Shadcn/ui configuration
├── supabase-schema.sql   # Database schema
├── .env.local           # Environment variables (not committed)
├── .env.local.example   # Environment variables template
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- A Supabase account (create one at [https://supabase.com](https://supabase.com))

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

```bash
cd wedding-guest-app
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

   - Copy `.env.local.example` to `.env.local`:
     ```bash
     cp .env.local.example .env.local
     ```

   - Update `.env.local` with your Supabase credentials:
     - Go to your [Supabase Dashboard](https://app.supabase.com)
     - Select your project
     - Go to Settings > API
     - Copy the Project URL and anon/public key
     - Paste them into `.env.local`:
       ```env
       NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
       NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
       ```

4. **Set up the database**:

   - Go to Supabase Dashboard → SQL Editor
   - Run the SQL script from `supabase-schema.sql`
   - Verify tables are created in Table Editor

5. **Run the development server**:

```bash
npm run dev
```

6. **Open your browser**:

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run type-check` - Check TypeScript types without emitting files

## Supabase Setup

### Client Usage

The project includes three Supabase client configurations:

1. **Browser Client** (for Client Components):
```typescript
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  // Use supabase client
}
```

2. **Server Client** (for Server Components and Server Actions):
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  // Use supabase client
}
```

3. **Middleware** (automatically configured in `src/middleware.ts`):
   - Handles session refresh
   - Protects authenticated routes
   - Redirects based on auth state

### Service Layer

The app uses a service layer pattern for database operations:

```typescript
// Events Service
import { eventService } from '@/lib/services/events'

// Create event
const event = await eventService.createEvent(userId, {
  event_name: 'Wedding Celebration',
  event_date: '2024-12-25',
  venue: 'Grand Ballroom',
  bride_name: 'Jane',
  groom_name: 'John',
  template_id: 'Modern',
})

// Get events with stats
const events = await eventService.getEventsWithStats(userId)

// Get single event
const event = await eventService.getEventById(eventId)

// Update event
await eventService.updateEvent(eventId, { venue: 'New Venue' })

// Delete event
await eventService.deleteEvent(eventId)
```

## Development Guidelines

### Folder Organization

- **`src/app/`**: Keep routing and page-level components here
- **`src/components/`**: Create reusable UI components
  - `ui/`: Shadcn/ui components (auto-generated)
  - `dashboard/`: Dashboard-specific components
  - `layout/`: Layout components (headers, footers, etc.)
- **`src/lib/`**: Add utility functions, helpers, and service configurations
  - `services/`: API service layer for database operations
  - `supabase/`: Supabase client configurations
- **`src/types/`**: Define TypeScript interfaces and types
- **`src/contexts/`**: React contexts for global state

### Code Style

- Use TypeScript for all files
- Follow the ESLint configuration
- Use Tailwind CSS for styling
- Use Shadcn/ui components for UI consistency
- Prefer Server Components over Client Components when possible
- Use service layer for all database operations
- Implement proper error handling with try-catch
- Show loading states for async operations
- Use toast notifications for user feedback

### Adding New Shadcn/ui Components

```bash
# Install a component
npx shadcn@latest add button

# Install multiple components
npx shadcn@latest add button input card dialog
```

### Component Patterns

**Client Component with Auth:**
```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export default function MyPage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  // Component logic
}
```

**Form with Validation:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  })

  // Form logic
}
```

## Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

### Environment Variables in Production

Make sure to set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Roadmap

### Phase 1: MVP (Current - 80% Complete)
- [x] Authentication system
- [x] Dashboard with statistics
- [x] Event CRUD operations
- [x] Modern UI with Shadcn/ui
- [ ] Guest management (CRUD)
- [ ] CSV import for guests
- [ ] QR code generation

### Phase 2: Core Features
- [ ] Invitation templates (2-3 designs)
- [ ] Shareable invitation links
- [ ] QR scanner for check-in
- [ ] Real-time check-in dashboard
- [ ] Guest RSVP functionality
- [ ] Email notifications

### Phase 3: Enhancement
- [ ] Analytics and reporting
- [ ] Multiple template customization
- [ ] Export functionality (CSV, Excel, PDF)
- [ ] White-label for vendors
- [ ] WhatsApp integration
- [ ] Bulk operations

### Phase 4: Scale
- [ ] Payment integration (Midtrans)
- [ ] Subscription plans
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics

## Contributing

This is a private project. For development guidelines:

1. Always work on feature branches
2. Follow TypeScript strict mode
3. Use Shadcn/ui components for UI consistency
4. Write descriptive commit messages
5. Test features locally before committing
6. Ensure build passes before pushing
7. Use proper TypeScript types (no `any` unless necessary)
8. Implement proper error handling
9. Add loading states for async operations
10. Follow existing code patterns

## Troubleshooting

### Common Issues

**"Database error" when creating events**
- Ensure database schema is set up correctly
- Check RLS policies are enabled
- Verify environment variables are correct
- Check user is authenticated
- Use browser DevTools to inspect network requests

**Authentication not working**
- Clear browser cookies and local storage
- Check Supabase Auth providers are enabled in Dashboard
- Verify API keys in `.env.local`
- Ensure middleware is not blocking requests
- Check Supabase service status

**Styling issues or components not rendering**
- Run `npm install` to ensure all dependencies are installed
- Check Tailwind CSS configuration
- Verify Shadcn/ui components are installed correctly
- Clear `.next` cache: `rm -rf .next` and rebuild
- Check browser console for errors

**Build fails with TypeScript errors**
- Run `npm run type-check` to see all errors
- Ensure all imports are correct
- Check for missing types or interfaces
- Verify Zod schemas match form fields
- Use proper TypeScript types (avoid `any`)

**Toast notifications not showing**
- Verify Toaster is in root layout
- Check Sonner is installed: `npm install sonner`
- Import toast correctly: `import { toast } from 'sonner'`
- Check browser console for errors

**Events not loading on dashboard**
- Check authentication is working
- Verify user has events in database
- Check RLS policies allow user to read their events
- Inspect network tab for failed requests
- Check Supabase connection in browser console

For more issues, check the documentation files in the project or contact the development team.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

## License

This project is private and intended for personal use.
