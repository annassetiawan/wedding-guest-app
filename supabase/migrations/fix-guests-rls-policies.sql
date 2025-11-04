-- =====================================================
-- Fix RLS Policies for Guests Table
-- =====================================================
-- This migration fixes permission issues when creating guests
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can manage guests for their events" ON guests;
DROP POLICY IF EXISTS "Anyone can view guest invitation" ON guests;
DROP POLICY IF EXISTS "Enable read access for all users" ON guests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON guests;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON guests;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON guests;

-- =====================================================
-- Create granular policies for each operation
-- =====================================================

-- 1. SELECT Policy: Users can view guests for their events
CREATE POLICY "Users can view guests for their events" ON guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );

-- 2. INSERT Policy: Users can add guests to their events
CREATE POLICY "Users can insert guests for their events" ON guests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );

-- 3. UPDATE Policy: Users can update guests in their events
CREATE POLICY "Users can update guests for their events" ON guests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );

-- 4. DELETE Policy: Users can delete guests from their events
CREATE POLICY "Users can delete guests for their events" ON guests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = guests.event_id
      AND events.user_id = auth.uid()
    )
  );

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the policies are working:

-- Check all policies for guests table
-- SELECT * FROM pg_policies WHERE tablename = 'guests';

-- Test INSERT permission (should show true for your events)
-- SELECT
--   e.id as event_id,
--   e.event_name,
--   e.user_id = auth.uid() as is_owner,
--   EXISTS (
--     SELECT 1 FROM events
--     WHERE events.id = e.id
--     AND events.user_id = auth.uid()
--   ) as has_insert_permission
-- FROM events e
-- WHERE e.user_id = auth.uid();
