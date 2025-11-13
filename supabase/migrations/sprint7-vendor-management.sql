-- Migration: Sprint 7 - Vendor Management System
-- Created: November 10, 2025
-- Description: Adds vendor management tables for Wedding Organizers

-- ============================================
-- Table 1: vendors
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'catering',
    'decoration',
    'photography',
    'videography',
    'mc',
    'music',
    'makeup',
    'venue',
    'transport',
    'souvenir',
    'invitation_printing',
    'wedding_cake',
    'other'
  )),

  -- Contact Information
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,

  -- Business Details
  description TEXT,
  services_offered TEXT[],
  price_range TEXT CHECK (price_range IN ('budget', 'standard', 'premium', 'luxury')),

  -- Performance Metrics
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  total_events INTEGER DEFAULT 0,

  -- Internal Notes
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table 2: event_vendors
-- ============================================
CREATE TABLE IF NOT EXISTS event_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Assignment Details
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),

  -- Contract & Payment
  contract_amount DECIMAL(12,2),
  currency TEXT DEFAULT 'IDR',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'dp_paid',
    'paid',
    'cancelled'
  )),
  down_payment DECIMAL(12,2),
  down_payment_date DATE,
  full_payment_date DATE,

  -- Performance Rating (after event)
  performance_rating DECIMAL(2,1) CHECK (performance_rating >= 0 AND performance_rating <= 5),
  performance_notes TEXT,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN (
    'pending',
    'confirmed',
    'cancelled'
  )),

  -- Communication
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one vendor per category per event
  UNIQUE(event_id, vendor_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Vendors table indexes
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);

-- Event_vendors table indexes
CREATE INDEX IF NOT EXISTS idx_event_vendors_event_id ON event_vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_vendors_vendor_id ON event_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_event_vendors_payment_status ON event_vendors(payment_status);
CREATE INDEX IF NOT EXISTS idx_event_vendors_status ON event_vendors(status);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;

-- Vendors Policies
CREATE POLICY "Users can view their own vendors"
  ON vendors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendors"
  ON vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors"
  ON vendors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors"
  ON vendors FOR DELETE
  USING (auth.uid() = user_id);

-- Event_vendors Policies (through events ownership)
CREATE POLICY "Users can view vendors assigned to their events"
  ON event_vendors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_vendors.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can assign vendors to their events"
  ON event_vendors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_vendors.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update vendors in their events"
  ON event_vendors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_vendors.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove vendors from their events"
  ON event_vendors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_vendors.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ============================================
-- Functions & Triggers
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vendors table
CREATE TRIGGER trigger_update_vendors_timestamp
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendors_updated_at();

-- Trigger for event_vendors table
CREATE TRIGGER trigger_update_event_vendors_timestamp
  BEFORE UPDATE ON event_vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendors_updated_at();

-- Function: Update vendor statistics when event vendor is added
CREATE OR REPLACE FUNCTION update_vendor_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE vendors
    SET total_events = total_events + 1
    WHERE id = NEW.vendor_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE vendors
    SET total_events = GREATEST(total_events - 1, 0)
    WHERE id = OLD.vendor_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vendor stats
CREATE TRIGGER trigger_update_vendor_event_count
  AFTER INSERT OR DELETE ON event_vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_stats();

-- ============================================
-- Views for Common Queries
-- ============================================

-- View: Vendor summary with event count and average rating
CREATE OR REPLACE VIEW vendor_summary AS
SELECT
  v.id,
  v.user_id,
  v.name,
  v.category,
  v.phone,
  v.email,
  v.price_range,
  v.rating,
  v.total_events,
  v.is_active,
  COUNT(DISTINCT ev.event_id) as active_events,
  AVG(ev.performance_rating) as avg_performance_rating,
  SUM(CASE WHEN ev.payment_status = 'paid' THEN 1 ELSE 0 END) as completed_payments,
  SUM(CASE WHEN ev.payment_status = 'pending' THEN 1 ELSE 0 END) as pending_payments
FROM vendors v
LEFT JOIN event_vendors ev ON v.id = ev.vendor_id
GROUP BY v.id, v.user_id, v.name, v.category, v.phone, v.email, v.price_range, v.rating, v.total_events, v.is_active;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE vendors IS 'Wedding Organizer vendor database - caterers, photographers, etc.';
COMMENT ON TABLE event_vendors IS 'Assignment of vendors to specific events with payment tracking';

COMMENT ON COLUMN vendors.category IS 'Type of vendor service (catering, photography, etc.)';
COMMENT ON COLUMN vendors.price_range IS 'Price tier: budget, standard, premium, luxury';
COMMENT ON COLUMN vendors.rating IS 'Overall vendor rating (0-5 stars)';
COMMENT ON COLUMN vendors.total_events IS 'Total number of events this vendor has worked on';

COMMENT ON COLUMN event_vendors.payment_status IS 'Payment progress: pending, dp_paid, paid, cancelled';
COMMENT ON COLUMN event_vendors.performance_rating IS 'Vendor performance rating for this specific event';
COMMENT ON COLUMN event_vendors.status IS 'Vendor assignment status: pending, confirmed, cancelled';
