# Guest Creation Error - Fix Summary

## Problem
Getting empty error object `{}` when trying to create a guest through the Add Guest dialog.

## Root Cause
Row Level Security (RLS) policies for the `guests` table were not configured to allow INSERT operations, causing silent failures.

## Solution Applied

### 1. Enhanced Error Handling in Service Layer
**File:** `src/lib/services/guests.ts`

**Changes:**
- Added session verification
- Added event ownership verification
- Added detailed console logging
- Added specific error code handling (42501, 23505, 23503)
- Improved error messages for users

### 2. Created RLS Migration
**File:** `supabase/migrations/fix-guests-rls-policies.sql`

**What it does:**
- Drops old restrictive policies
- Creates 4 granular policies (SELECT, INSERT, UPDATE, DELETE)
- Ensures users can only manage guests for events they own
- Includes verification queries

### 3. Improved Component Error Logging
**File:** `src/components/events/AddGuestDialog.tsx`

**Changes:**
- Added detailed console logging for debugging
- Logs form values, event ID, guest data
- Logs complete error object structure
- Shows user-friendly error messages

### 4. Created Documentation

#### [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
Comprehensive troubleshooting guide with:
- Common errors and solutions
- Debug steps
- RLS verification queries
- Quick fixes checklist

#### [docs/FIX-GUEST-CREATION-ERROR.md](docs/FIX-GUEST-CREATION-ERROR.md)
Quick reference guide with:
- TL;DR fix (copy-paste SQL)
- What and why
- Verification steps

#### [supabase/migrations/README.md](supabase/migrations/README.md)
Migration instructions:
- How to run migrations
- Verification steps
- Rollback procedures
- Best practices

## How to Fix (For Users)

### Option A: Quick Fix (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy SQL from `docs/FIX-GUEST-CREATION-ERROR.md`
3. Paste and Run
4. Try creating a guest again

### Option B: Run Full Migration
1. Open `supabase/migrations/fix-guests-rls-policies.sql`
2. Copy entire content
3. Paste in Supabase Dashboard → SQL Editor
4. Run

## Verification

After applying fix, check browser console when creating a guest:

**Success logs:**
```
=== Add Guest Form Submission ===
Form values: {name: "...", phone: "...", category: "..."}
Event ID: uuid-here
Guest data to insert: {...}
Creating guest with data: {...}
Guest created successfully: {...}
```

**Error logs (if still failing):**
```
=== Error Creating Guest ===
Error object: {...}
Supabase error details: {
  code: "42501",
  message: "...",
  ...
}
```

## Testing Checklist

- [ ] User can create guest in their own event
- [ ] Error shows specific message (not empty object)
- [ ] Console logs show detailed debugging info
- [ ] User cannot create guest in other user's event
- [ ] Success toast appears on successful creation
- [ ] Guest list refreshes automatically

## Files Changed

1. `src/lib/services/guests.ts` - Enhanced error handling
2. `src/components/events/AddGuestDialog.tsx` - Better logging
3. `supabase/migrations/fix-guests-rls-policies.sql` - RLS fix (NEW)
4. `supabase/migrations/README.md` - Migration guide (NEW)
5. `docs/TROUBLESHOOTING.md` - Comprehensive guide (NEW)
6. `docs/FIX-GUEST-CREATION-ERROR.md` - Quick reference (NEW)

## Prevention

To prevent similar issues in the future:

1. **Always test RLS policies** after schema changes
2. **Log errors comprehensively** in services and components
3. **Document migrations** with verification queries
4. **Use TypeScript** for type safety
5. **Check Supabase logs** regularly

## Additional Notes

- RLS policies now follow least privilege principle
- Each CRUD operation has its own policy
- Policies verify event ownership before allowing actions
- Migration is idempotent (safe to run multiple times)
- Console logging can be disabled in production by wrapping in `if (process.env.NODE_ENV === 'development')`

## Need Help?

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed debugging steps.
