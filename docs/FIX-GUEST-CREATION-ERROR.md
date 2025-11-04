# Quick Fix: Guest Creation Error

> **Error:** "Error creating guest: {}" or empty error when adding guests

## TL;DR - Quick Fix

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy this SQL** → Paste and Run:

```sql
-- Fix RLS Policies for Guests Table
DROP POLICY IF EXISTS "Users can manage guests for their events" ON guests;
DROP POLICY IF EXISTS "Anyone can view guest invitation" ON guests;

CREATE POLICY "Users can view guests for their events" ON guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert guests for their events" ON guests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update guests for their events" ON guests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete guests for their events" ON guests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );
```

3. **Refresh your app** and try adding a guest again

## What This Does

This SQL creates proper Row Level Security (RLS) policies that allow:
- ✅ Users to add guests to **their own events**
- ✅ Users to view/edit/delete guests from **their own events**
- ❌ Users **cannot** access other users' guests

## Why This Happens

The `guests` table has RLS enabled but the policies were either:
- Not created yet
- Too restrictive (blocking all inserts)
- Incorrectly configured

## Verification

After running the SQL, verify it worked:

```sql
-- Check policies are created (should show 4 rows)
SELECT * FROM pg_policies WHERE tablename = 'guests';
```

## Still Not Working?

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed debug steps.

## Additional Files

- Full migration: `/supabase/migrations/fix-guests-rls-policies.sql`
- Troubleshooting guide: `/docs/TROUBLESHOOTING.md`
- Migration README: `/supabase/migrations/README.md`
