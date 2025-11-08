-- Migration: Add RSVP fields to guests table
-- Created: 2025-11-08
-- Description: Adds RSVP functionality fields to guests table

-- Add RSVP columns to guests table
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'not_attending')),
ADD COLUMN IF NOT EXISTS rsvp_message TEXT,
ADD COLUMN IF NOT EXISTS rsvp_at TIMESTAMPTZ;

-- Create index on rsvp_status for faster filtering
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON guests(rsvp_status);

-- Create index on event_id and rsvp_status for analytics
CREATE INDEX IF NOT EXISTS idx_guests_event_rsvp ON guests(event_id, rsvp_status);

-- Add comment to columns for documentation
COMMENT ON COLUMN guests.rsvp_status IS 'RSVP confirmation status: pending, attending, or not_attending';
COMMENT ON COLUMN guests.rsvp_message IS 'Optional message from guest when confirming RSVP';
COMMENT ON COLUMN guests.rsvp_at IS 'Timestamp when guest confirmed their RSVP';
