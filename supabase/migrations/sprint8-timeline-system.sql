-- ============================================
-- Sprint 8: Timeline/Rundown Builder System
-- ============================================
-- Description: Event timeline management with drag-drop support,
--              template system, PIC assignment, and live tracking
-- Created: 2025-11-10
-- ============================================

-- ============================================
-- 1. TIMELINE TEMPLATES TABLE
-- ============================================
-- Reusable timeline templates (Akad, Resepsi, etc.)

CREATE TABLE IF NOT EXISTS timeline_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Template Info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'akad',           -- Akad Nikah
    'resepsi',        -- Resepsi/Reception
    'engagement',     -- Lamaran/Engagement
    'birthday',       -- Birthday party
    'corporate',      -- Corporate event
    'custom'          -- Custom template
  )),

  -- Metadata
  is_public BOOLEAN DEFAULT false,      -- Can be shared with other users
  usage_count INTEGER DEFAULT 0,        -- How many times used

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TIMELINE TEMPLATE ITEMS TABLE
-- ============================================
-- Items in each template

CREATE TABLE IF NOT EXISTS timeline_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES timeline_templates(id) ON DELETE CASCADE,

  -- Item Details
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,  -- Duration in minutes
  display_order INTEGER NOT NULL DEFAULT 0,      -- Order in timeline

  -- Styling
  color TEXT DEFAULT '#3b82f6',                  -- Hex color for UI
  icon TEXT DEFAULT 'Clock',                     -- Lucide icon name

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. EVENT TIMELINES TABLE
-- ============================================
-- Actual timeline items for events

CREATE TABLE IF NOT EXISTS event_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Item Details
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,                      -- Scheduled start time
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Assignment
  pic_name TEXT,                                 -- Person In Charge name
  pic_phone TEXT,                                -- Contact number
  pic_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,  -- Link to vendor if applicable

  -- Status Tracking
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,                             -- Who marked it complete

  -- Live Event Notes
  actual_start_time TIMESTAMPTZ,                 -- When actually started
  actual_end_time TIMESTAMPTZ,                   -- When actually ended
  notes TEXT,                                    -- Notes during/after

  -- Styling
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'Clock',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. INDEXES for Performance
-- ============================================

-- Timeline templates
CREATE INDEX IF NOT EXISTS idx_timeline_templates_user_id
  ON timeline_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_templates_category
  ON timeline_templates(category);
CREATE INDEX IF NOT EXISTS idx_timeline_templates_public
  ON timeline_templates(is_public)
  WHERE is_public = true;

-- Template items
CREATE INDEX IF NOT EXISTS idx_timeline_template_items_template_id
  ON timeline_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_timeline_template_items_order
  ON timeline_template_items(template_id, display_order);

-- Event timelines
CREATE INDEX IF NOT EXISTS idx_event_timelines_event_id
  ON event_timelines(event_id);
CREATE INDEX IF NOT EXISTS idx_event_timelines_order
  ON event_timelines(event_id, display_order);
CREATE INDEX IF NOT EXISTS idx_event_timelines_start_time
  ON event_timelines(event_id, start_time);
CREATE INDEX IF NOT EXISTS idx_event_timelines_completed
  ON event_timelines(is_completed);
CREATE INDEX IF NOT EXISTS idx_event_timelines_pic_vendor
  ON event_timelines(pic_vendor_id)
  WHERE pic_vendor_id IS NOT NULL;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE timeline_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_timelines ENABLE ROW LEVEL SECURITY;

-- Timeline Templates Policies
CREATE POLICY "Users can view their own and public templates"
ON timeline_templates FOR SELECT
USING (
  user_id = auth.uid() OR is_public = true
);

CREATE POLICY "Users can create their own templates"
ON timeline_templates FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates"
ON timeline_templates FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
ON timeline_templates FOR DELETE
USING (user_id = auth.uid());

-- Template Items Policies
CREATE POLICY "Users can view template items if they can view the template"
ON timeline_template_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM timeline_templates
    WHERE timeline_templates.id = timeline_template_items.template_id
    AND (timeline_templates.user_id = auth.uid() OR timeline_templates.is_public = true)
  )
);

CREATE POLICY "Users can create items for their templates"
ON timeline_template_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM timeline_templates
    WHERE timeline_templates.id = timeline_template_items.template_id
    AND timeline_templates.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items in their templates"
ON timeline_template_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM timeline_templates
    WHERE timeline_templates.id = timeline_template_items.template_id
    AND timeline_templates.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items from their templates"
ON timeline_template_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM timeline_templates
    WHERE timeline_templates.id = timeline_template_items.template_id
    AND timeline_templates.user_id = auth.uid()
  )
);

-- Event Timelines Policies
CREATE POLICY "Users can view timelines for their events"
ON event_timelines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_timelines.event_id
    AND events.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create timelines for their events"
ON event_timelines FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_timelines.event_id
    AND events.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update timelines for their events"
ON event_timelines FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_timelines.event_id
    AND events.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete timelines for their events"
ON event_timelines FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_timelines.event_id
    AND events.user_id = auth.uid()
  )
);

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp for templates
CREATE OR REPLACE FUNCTION update_timeline_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timeline_templates_updated_at
  BEFORE UPDATE ON timeline_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_timeline_template_updated_at();

-- Auto-update updated_at timestamp for event timelines
CREATE OR REPLACE FUNCTION update_event_timeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_timelines_updated_at
  BEFORE UPDATE ON event_timelines
  FOR EACH ROW
  EXECUTE FUNCTION update_event_timeline_updated_at();

-- Auto-set completed_at when is_completed changes to true
CREATE OR REPLACE FUNCTION set_timeline_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = NOW();
  END IF;

  IF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_timelines_completion
  BEFORE UPDATE ON event_timelines
  FOR EACH ROW
  EXECUTE FUNCTION set_timeline_completed_at();

-- Increment template usage_count when applied
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called from application logic
  -- Not directly triggered by event_timelines insert
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Calculate total event duration
CREATE OR REPLACE FUNCTION get_event_timeline_duration(p_event_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(duration_minutes), 0)
    FROM event_timelines
    WHERE event_id = p_event_id
  );
END;
$$ LANGUAGE plpgsql;

-- Get completion percentage
CREATE OR REPLACE FUNCTION get_timeline_completion_percentage(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_items
  FROM event_timelines
  WHERE event_id = p_event_id;

  IF total_items = 0 THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) INTO completed_items
  FROM event_timelines
  WHERE event_id = p_event_id
  AND is_completed = true;

  RETURN ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. VIEWS
-- ============================================

-- Timeline summary view
CREATE OR REPLACE VIEW timeline_summary AS
SELECT
  et.event_id,
  COUNT(*) as total_items,
  SUM(CASE WHEN et.is_completed THEN 1 ELSE 0 END) as completed_items,
  SUM(et.duration_minutes) as total_duration_minutes,
  MIN(et.start_time) as earliest_start,
  MAX(et.start_time + (et.duration_minutes || ' minutes')::INTERVAL) as latest_end,
  ROUND(
    (SUM(CASE WHEN et.is_completed THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL) * 100,
    1
  ) as completion_percentage
FROM event_timelines et
GROUP BY et.event_id;

-- ============================================
-- 9. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Akad template
-- Note: This will create a public template owned by the first user
-- You can also manually create templates after migration
DO $$
DECLARE
  first_user_id UUID;
  template_id_var UUID;
BEGIN
  -- Get the first user ID (if any users exist)
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;

  -- Only create sample data if a user exists
  IF first_user_id IS NOT NULL THEN
    -- Create the template
    INSERT INTO timeline_templates (user_id, name, description, category, is_public)
    VALUES
      (first_user_id, 'Standard Akad Nikah', 'Timeline standar untuk acara Akad Nikah', 'akad', true)
    ON CONFLICT DO NOTHING
    RETURNING id INTO template_id_var;

    -- If template was created (or get existing one)
    IF template_id_var IS NULL THEN
      SELECT id INTO template_id_var FROM timeline_templates WHERE name = 'Standard Akad Nikah' LIMIT 1;
    END IF;

    -- Create template items
    IF template_id_var IS NOT NULL THEN
      INSERT INTO timeline_template_items (template_id, title, duration_minutes, display_order, color, icon)
      VALUES
        (template_id_var, 'Persiapan & Dekorasi', 60, 1, '#10b981', 'Wrench'),
        (template_id_var, 'Tamu Mulai Berdatangan', 30, 2, '#3b82f6', 'Users'),
        (template_id_var, 'Prosesi Akad', 45, 3, '#f59e0b', 'Heart'),
        (template_id_var, 'Foto Bersama', 30, 4, '#8b5cf6', 'Camera'),
        (template_id_var, 'Makan & Networking', 60, 5, '#ef4444', 'Utensils')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE timeline_templates IS 'Reusable timeline templates for different event types';
COMMENT ON TABLE timeline_template_items IS 'Items in timeline templates';
COMMENT ON TABLE event_timelines IS 'Actual timeline items for events with live tracking';
