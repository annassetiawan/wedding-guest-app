# Database Schema Mismatch Fix - Complete

## Issue Summary
The codebase was referencing a non-existent `status` column in the `guests` table. The actual database schema only has a `checked_in` boolean column to track guest attendance.

Additionally, the `qr_code` and `invitation_link` columns are NOT NULL in the database but were marked as optional in TypeScript types.

## Database Schema (Actual)
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL,
  qr_code TEXT NOT NULL,           -- Auto-generated QR code
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP,
  invitation_link TEXT NOT NULL,   -- Auto-generated invitation URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Changes Made

### 1. TypeScript Types ([src/types/database.types.ts](src/types/database.types.ts))
**Before:**
```typescript
export type GuestStatus = 'pending' | 'confirmed' | 'declined'

export interface Guest {
  status: GuestStatus
  qr_code?: string
  invitation_link?: string
  // ...
}
```

**After:**
```typescript
// Removed GuestStatus type entirely

export interface Guest {
  qr_code: string              // Now required (NOT NULL)
  checked_in: boolean
  checked_in_at?: string
  invitation_link: string      // Now required (NOT NULL)
  // ...
}
```

### 2. Guest Service ([src/lib/services/guests.ts](src/lib/services/guests.ts))

#### Removed Methods:
- `updateGuestStatus(id, status)` - No longer needed

#### Updated Methods:
- `filterGuestsByStatus()` → `filterGuestsByCheckedIn(eventId, checkedIn: boolean)`
- `getGuestStats()` - Now returns `checkedIn` and `notCheckedIn` counts instead of confirmed/pending/declined

#### Enhanced `createGuest()`:
```typescript
async createGuest(
  guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at' | 'checked_in' | 'checked_in_at' | 'qr_code' | 'invitation_link'>
): Promise<Guest> {
  // Auto-generate QR code and invitation link
  const guestId = crypto.randomUUID()
  const qrCode = `QR-${guestId.substring(0, 8).toUpperCase()}`
  const invitationLink = `${window.location.origin}/invitation/${guestData.event_id}/${guestId}`

  const { data, error } = await supabase
    .from('guests')
    .insert([{
      ...guestData,
      qr_code: qrCode,
      invitation_link: invitationLink,
    }])
    .select()
    .single()
  // ...
}
```

### 3. Event Service ([src/lib/services/events.ts](src/lib/services/events.ts))

**Before:**
```typescript
export interface EventWithStats extends Event {
  guest_count: number
  confirmed_count: number
  pending_count: number
  declined_count: number
}
```

**After:**
```typescript
export interface EventWithStats extends Event {
  guest_count: number
  checked_in_count: number
  not_checked_in_count: number
}
```

Updated `getEventsWithStats()`:
```typescript
const { data: guests } = await supabase
  .from('guests')
  .select('checked_in')  // Changed from 'status'
  .eq('event_id', event.id)

const checked_in_count = guests?.filter((g) => g.checked_in).length || 0
const not_checked_in_count = guests?.filter((g) => !g.checked_in).length || 0
```

### 4. UI Components

#### [src/components/events/AddGuestDialog.tsx](src/components/events/AddGuestDialog.tsx)
- Removed `status` field from form schema
- Removed Status dropdown from UI
- Guest creation now only requires: name, phone, category

#### [src/components/events/EditGuestDialog.tsx](src/components/events/EditGuestDialog.tsx)
- Removed `status` field from form schema
- Removed Status dropdown from UI (lines 180-206)

#### [src/app/events/[id]/page.tsx](src/app/events/[id]/page.tsx)
**Stats Cards:**
- Before: 5 cards (Total / Confirmed / Pending / Declined / Checked In)
- After: 3 cards (Total Guests / Sudah Hadir / Belum Hadir)

**Filters:**
- Changed from "Status" filter → "Kehadiran" filter
- Options: "Semua" / "Sudah Hadir" / "Belum Hadir"

**Guest Table:**
- Column header: "Status" → "Kehadiran"
- Display: Badge showing "Sudah hadir" (green) or "Belum hadir" (gray)

#### [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)
```typescript
// Before
const activeCheckins = events.reduce((sum, event) => sum + event.confirmed_count, 0)

// After
const activeCheckins = events.reduce((sum, event) => sum + event.checked_in_count, 0)
```

#### [src/components/dashboard/EventCard.tsx](src/components/dashboard/EventCard.tsx)
```typescript
// Before
const checkinPercentage =
  event.guest_count > 0 ? Math.round((event.confirmed_count / event.guest_count) * 100) : 0

// After
const checkinPercentage =
  event.guest_count > 0 ? Math.round((event.checked_in_count / event.guest_count) * 100) : 0
```

Display updated:
```typescript
{event.checked_in_count}/{event.guest_count}
```

## Migration Required

**Important:** If you have existing guests in the database with NULL `qr_code` or `invitation_link` values, you need to run this SQL migration:

```sql
-- Update existing guests with missing QR codes
UPDATE guests
SET
  qr_code = 'QR-' || SUBSTRING(id::text, 1, 8),
  invitation_link = 'https://your-domain.com/invitation/' || event_id || '/' || id
WHERE qr_code IS NULL OR invitation_link IS NULL;
```

Replace `https://your-domain.com` with your actual domain.

## Testing Checklist

- [x] TypeScript compilation succeeds
- [x] Build completes without errors
- [ ] Can create new guest (with auto-generated QR code and invitation link)
- [ ] Can edit existing guest
- [ ] Can delete guest
- [ ] Guest table displays "Kehadiran" status correctly
- [ ] Can filter guests by "Sudah Hadir" / "Belum Hadir"
- [ ] Dashboard shows correct check-in statistics
- [ ] Event card shows correct check-in progress

## Breaking Changes

1. **Guest Status Removed**
   - All references to `GuestStatus` type removed
   - `status` column no longer exists
   - UI now uses `checked_in` boolean for attendance tracking

2. **API Changes**
   - `guestService.updateGuestStatus()` removed
   - `guestService.filterGuestsByStatus()` renamed to `filterGuestsByCheckedIn()`
   - `eventService.getEventsWithStats()` returns different properties

3. **Required Fields**
   - `qr_code` is now auto-generated and required
   - `invitation_link` is now auto-generated and required

## Files Modified

1. `src/types/database.types.ts` - Updated Guest interface
2. `src/lib/services/guests.ts` - Updated service methods
3. `src/lib/services/events.ts` - Updated EventWithStats interface
4. `src/components/events/AddGuestDialog.tsx` - Removed status field
5. `src/components/events/EditGuestDialog.tsx` - Removed status field
6. `src/app/events/[id]/page.tsx` - Updated UI to use checked_in
7. `src/app/dashboard/page.tsx` - Updated stats calculation
8. `src/components/dashboard/EventCard.tsx` - Updated check-in display

## Build Status

✅ **TypeScript Compilation:** Success
✅ **Production Build:** Success
✅ **All Type Errors:** Resolved

## Next Steps

1. Test guest creation in the UI
2. Verify QR codes are generated correctly
3. Test invitation links
4. Update any API documentation
5. Run database migration if needed for existing data
