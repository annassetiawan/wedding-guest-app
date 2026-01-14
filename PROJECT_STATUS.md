# Wedding Guest Manager - Consolidated Status (Code-Based)

Last updated: 2026-01-14
Source of truth: current code in src/

## Completed (implemented in code)

### Authentication and Access
- Login and register pages, session handling, route protection.
- Files: src/app/(auth)/login/page.tsx, src/app/(auth)/register/page.tsx, src/middleware.ts, src/contexts/AuthContext.tsx

### Dashboard and Navigation
- Dashboard page with stats and event list.
- Sidebar navigation and layout scaffolding.
- Files: src/app/dashboard/page.tsx, src/components/dashboard, src/app/*/layout.tsx

### Event Management
- Event CRUD: create, edit, delete, list.
- Event detail sections: overview, guests, vendors, timeline, analytics, settings.
- Files: src/app/events/page.tsx, src/app/events/create/page.tsx, src/app/events/[id]/*

### Guest Management (Per Event)
- Guest CRUD, search, filter, sort, check-in toggle.
- CSV import, export, QR code dialog, invitation link share, WhatsApp share.
- Realtime updates via Supabase channel.
- Files: src/app/events/[id]/guests/page.tsx, src/components/events/*

### All Guests (Cross-Event)
- Global guests page with filters, stats, CSV export, details dialog.
- File: src/app/guests/page.tsx

### QR Check-in
- QR scanner flow with ZXing and manual search fallback.
- File: src/app/events/[id]/checkin/page.tsx, src/components/checkin/ZXingScanner.tsx

### Invitations and Templates
- Modern and Elegant templates.
- Public invitation route.
- Template gallery with preview modal.
- Files: src/app/invitation/[eventId]/[guestId]/page.tsx, src/components/invitation/*, src/app/templates/page.tsx

### RSVP
- RSVP form section and service.
- Status stored on guests table fields (rsvp_*).
- Files: src/components/invitation/RsvpSection.tsx, src/lib/services/rsvp.ts

### Analytics
- Per-event analytics.
- Global analytics with export CSV.
- Files: src/app/events/[id]/analytics/page.tsx, src/components/events/EventAnalytics.tsx, src/app/analytics/page.tsx, src/lib/services/analytics.ts

### Vendors
- Vendor CRUD and event assignment.
- Files: src/app/vendors/page.tsx, src/app/events/[id]/vendors/page.tsx, src/lib/services/vendors.ts

### Timeline and Gantt
- Timeline management and Gantt chart.
- Files: src/app/events/[id]/timeline/page.tsx, src/components/events/EventTimelineWrapper.tsx

### Profile Settings
- Backend integration and avatar upload to Supabase Storage.
- Files: src/app/settings/profile/page.tsx, src/lib/services/profile.ts

## In Progress
- None detected in code.

## Placeholder / Coming Soon (UI only)
- Billing: src/app/settings/billing/page.tsx
- Preferences: src/app/settings/preferences/page.tsx
- Notifications: src/app/settings/notifications/page.tsx
- Security: src/app/settings/security/page.tsx
- Integrations: src/app/settings/integrations/page.tsx

## Not Implemented (no code/services found)
- Automated notifications (email/WhatsApp/SMS), no service or API routes.
- Automated tests (no *.test.* or *.spec.* files).

## Notes
- This file replaces mixed status across CLAUDE.md and TODO.md and reflects code only.
