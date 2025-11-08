# 🚀 RSVP Feature Migration Instructions

**IMPORTANT:** Please run this database migration before using the RSVP feature.

---

## ⚠️ Before You Start

1. **Backup Your Data** (Recommended)
   - Go to Supabase Dashboard → Database → Backups
   - Create a manual backup snapshot

2. **Check Current Schema**
   ```sql
   -- Run this to verify current schema
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'guests'
   ORDER BY ordinal_position;
   ```

---

## 📋 Step-by-Step Migration

### Step 1: Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy Migration SQL

Copy the entire contents of `supabase/migrations/add-rsvp-fields.sql`:

```sql
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
```

### Step 3: Execute Migration

1. Paste the SQL into the editor
2. Click **Run** (or press Ctrl/Cmd + Enter)
3. Wait for success message
4. You should see: **Success. No rows returned**

### Step 4: Verify Migration

Run this verification query:

```sql
-- Verify new columns exist
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'guests'
AND column_name LIKE 'rsvp%'
ORDER BY ordinal_position;
```

**Expected Result:**
| column_name | data_type | column_default | is_nullable |
|-------------|-----------|----------------|-------------|
| rsvp_status | text | 'pending'::text | YES |
| rsvp_message | text | NULL | YES |
| rsvp_at | timestamp with time zone | NULL | YES |

### Step 5: Check Indexes

```sql
-- Verify indexes created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'guests'
AND indexname LIKE '%rsvp%';
```

**Expected Result:**
| indexname | indexdef |
|-----------|----------|
| idx_guests_rsvp_status | CREATE INDEX idx_guests_rsvp_status ON public.guests USING btree (rsvp_status) |
| idx_guests_event_rsvp | CREATE INDEX idx_guests_event_rsvp ON public.guests USING btree (event_id, rsvp_status) |

### Step 6: Test with Sample Data

```sql
-- Check existing guests now have default rsvp_status
SELECT id, name, rsvp_status, rsvp_message, rsvp_at
FROM guests
LIMIT 5;
```

**Expected:** All guests should have `rsvp_status = 'pending'`

---

## ✅ Migration Complete!

If all steps succeeded, the RSVP feature is now ready to use!

### What's Changed:

1. ✅ New `rsvp_status` column added (default: 'pending')
2. ✅ New `rsvp_message` column added (optional)
3. ✅ New `rsvp_at` timestamp column added
4. ✅ Indexes created for better performance
5. ✅ All existing guests have 'pending' status

---

## 🔄 Next Steps

### 1. Update Your Application

Make sure you've pulled the latest code:

```bash
git pull origin main
npm install
npm run build
```

### 2. Test the Feature

1. **Create a test event**
2. **Add a test guest**
3. **Copy the invitation link** from guest list
4. **Open invitation in new tab**
5. **Complete RSVP form**
6. **Verify status shows in guest list**

### 3. Deploy to Production

If testing succeeds:

```bash
git add .
git commit -m "feat: add RSVP feature migration"
git push origin main
```

---

## 🐛 Troubleshooting

### Error: "column already exists"

This is safe to ignore. The migration uses `IF NOT EXISTS`, so re-running is safe.

### Error: "permission denied"

You need admin/owner access to run migrations. Contact your Supabase project owner.

### Error: "relation does not exist"

The `guests` table doesn't exist. Run the main database setup first:
- See `DATABASE_SETUP.md`
- Or `supabase-schema.sql`

### Guests Show NULL for rsvp_status

This shouldn't happen with `DEFAULT 'pending'`. If it does, run:

```sql
-- Fix any NULL rsvp_status
UPDATE guests
SET rsvp_status = 'pending'
WHERE rsvp_status IS NULL;
```

### Need to Rollback?

To remove RSVP fields (not recommended):

```sql
-- WARNING: This will DELETE all RSVP data!
ALTER TABLE guests
DROP COLUMN IF EXISTS rsvp_status,
DROP COLUMN IF EXISTS rsvp_message,
DROP COLUMN IF EXISTS rsvp_at;

DROP INDEX IF EXISTS idx_guests_rsvp_status;
DROP INDEX IF EXISTS idx_guests_event_rsvp;
```

---

## 📚 Documentation

For complete feature documentation, see:
- `docs/RSVP-FEATURE.md` - Full feature documentation
- `README.md` - Updated with RSVP in roadmap

---

## 💡 Need Help?

1. Check Supabase logs: Dashboard → Logs → Postgres
2. Check application logs: Browser DevTools → Console
3. Review error messages carefully
4. Verify you're using the latest code from Git

---

**Migration File:** `supabase/migrations/add-rsvp-fields.sql`
**Last Updated:** November 8, 2025
**Version:** 1.0.0
