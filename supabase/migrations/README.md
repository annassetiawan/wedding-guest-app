# Database Migrations

This folder contains SQL migration files for the Wedding Guest Manager app.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the content of the migration file
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Migration Files

### fix-guests-rls-policies.sql

**Purpose:** Fix Row Level Security (RLS) policies for the `guests` table to allow proper CRUD operations.

**When to run:**
- When you get "Permission denied" errors when creating guests
- After initial database setup
- When guest operations fail with empty error objects

**What it does:**
- Drops old restrictive policies
- Creates 4 granular policies (SELECT, INSERT, UPDATE, DELETE)
- Ensures users can only manage guests for events they own

**Verification:**
```sql
-- Check policies are created
SELECT * FROM pg_policies WHERE tablename = 'guests';

-- Should return 4 policies
```

## Migration Checklist

Before running a migration:
- [ ] Backup your database (Supabase Dashboard > Database > Backups)
- [ ] Read the migration file to understand changes
- [ ] Check if migration has already been applied
- [ ] Test in a development project first (if possible)

After running a migration:
- [ ] Verify the changes (run verification queries)
- [ ] Test the feature in your app
- [ ] Monitor logs for any errors
- [ ] Document any issues

## Rollback

If you need to rollback a migration:

### For RLS Policies

```sql
-- Drop the new policies
DROP POLICY IF EXISTS "Users can view guests for their events" ON guests;
DROP POLICY IF EXISTS "Users can insert guests for their events" ON guests;
DROP POLICY IF EXISTS "Users can update guests for their events" ON guests;
DROP POLICY IF EXISTS "Users can delete guests for their events" ON guests;

-- Restore previous policies (if you have them)
-- ...
```

## Common Issues

### "relation already exists"
The migration has already been run. Check if the changes are already in place.

### "permission denied"
Make sure you're logged in as the database owner or have sufficient privileges.

### "syntax error"
Copy the exact SQL from the file without modifications. Check for missing semicolons.

## Best Practices

1. **Version Control:** Keep all migrations in git
2. **Naming Convention:** Use descriptive names with timestamps if needed
3. **One Purpose:** Each migration should do one thing
4. **Comments:** Add comments explaining complex changes
5. **Verification:** Include verification queries in comments
6. **Idempotent:** Use `IF EXISTS` / `IF NOT EXISTS` when possible

## Need Help?

See [docs/TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md) for detailed troubleshooting steps.
