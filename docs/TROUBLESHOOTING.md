# Troubleshooting Guide

## Table of Contents
- [Guest Creation Errors](#guest-creation-errors)
- [RLS Permission Errors](#rls-permission-errors)
- [Database Connection Issues](#database-connection-issues)
- [Common Error Codes](#common-error-codes)
- [Debug Steps](#debug-steps)

---

## Guest Creation Errors

### Error: Empty Error Object `{}`

**Symptom:** When creating a guest, you get `Error creating guest: {}` with no details.

**Root Cause:** Row Level Security (RLS) policies blocking the INSERT operation.

**Solution:**

1. **Run the RLS Migration**
   - Go to Supabase Dashboard > SQL Editor
   - Open `/supabase/migrations/fix-guests-rls-policies.sql`
   - Copy and paste the entire SQL script
   - Click "Run" to execute

2. **Verify Policies**
   ```sql
   -- Check current policies
   SELECT * FROM pg_policies WHERE tablename = 'guests';

   -- Should show 4 policies:
   -- - Users can view guests for their events (SELECT)
   -- - Users can insert guests for their events (INSERT)
   -- - Users can update guests for their events (UPDATE)
   -- - Users can delete guests for their events (DELETE)
   ```

3. **Test Permissions**
   ```sql
   -- Test if current user can insert into events they own
   SELECT
     e.id as event_id,
     e.event_name,
     e.user_id = auth.uid() as is_owner,
     EXISTS (
       SELECT 1 FROM events
       WHERE events.id = e.id
       AND events.user_id = auth.uid()
     ) as has_insert_permission
   FROM events e
   WHERE e.user_id = auth.uid();
   ```

---

## RLS Permission Errors

### Error Code: 42501 (Permission Denied)

**Symptom:** `Permission denied. Silakan periksa RLS policies di Supabase.`

**Causes:**
1. RLS policies not configured correctly
2. User trying to insert guest for event they don't own
3. User session expired

**Solutions:**

1. **Check Event Ownership**
   - Ensure user is logged in
   - Verify event belongs to current user
   - Check user session in browser DevTools > Application > Local Storage

2. **Verify RLS Policies**
   ```sql
   -- Check if RLS is enabled
   SELECT relname, relrowsecurity
   FROM pg_class
   WHERE relname = 'guests';
   -- relrowsecurity should be 't' (true)

   -- Check policy definitions
   SELECT * FROM pg_policies WHERE tablename = 'guests';
   ```

3. **Temporarily Disable RLS (Development Only)**
   ```sql
   -- ONLY FOR LOCAL DEVELOPMENT TESTING
   ALTER TABLE guests DISABLE ROW LEVEL SECURITY;

   -- Re-enable when done testing
   ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
   ```

---

## Database Connection Issues

### Error: "Anda harus login untuk menambahkan tamu"

**Symptom:** User session not found or expired.

**Solutions:**

1. **Clear Browser Storage**
   - DevTools > Application > Local Storage
   - Clear all entries for your app domain
   - Log out and log in again

2. **Check Supabase Keys**
   - Verify `.env.local` has correct keys:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Keys must match Supabase Dashboard > Settings > API

3. **Verify Middleware**
   - Check `src/middleware.ts` is properly configured
   - Middleware should refresh session on each request

---

## Common Error Codes

| Code | Error | Description | Solution |
|------|-------|-------------|----------|
| `42501` | Permission Denied | RLS blocking operation | Fix RLS policies |
| `23505` | Unique Violation | Duplicate data | Check unique constraints |
| `23503` | Foreign Key Violation | Invalid event_id | Verify event exists |
| `08P01` | Protocol Violation | Connection issue | Check network/Supabase status |
| `PGRST116` | Not Found | Resource doesn't exist | Verify IDs |

---

## Debug Steps

### 1. Enable Console Logging

The guest service now includes comprehensive logging. Open DevTools Console to see:

```
Creating guest with data: {
  event_id: "uuid-here",
  name: "Guest Name",
  category: "Regular",
  user_id: "user-uuid"
}
```

### 2. Check Browser Console

Look for these logs in order:
1. `Submitting guest data:` - Form data sent
2. `Event ID:` - Event being added to
3. `Creating guest with data:` - Service processing
4. `Guest created successfully:` - Success!

If error occurs, you'll see:
- `Session error:` - Authentication issue
- `Event verification error:` - Ownership issue
- `Supabase error details:` - Database issue with error code

### 3. Verify Event Ownership

In browser console:
```javascript
// Get current user
const { data: { session } } = await window.supabase.auth.getSession()
console.log('User ID:', session?.user?.id)

// Get event
const { data: event } = await window.supabase
  .from('events')
  .select('id, user_id')
  .eq('id', 'your-event-id-here')
  .single()

console.log('Event owner:', event?.user_id)
console.log('Match:', event?.user_id === session?.user?.id)
```

### 4. Check Database State

In Supabase Dashboard > Table Editor:

1. **Events table**
   - Find your event by ID
   - Verify `user_id` matches your auth user ID

2. **Guests table**
   - Check if guest was created despite error
   - Look for partial data

3. **Auth Users**
   - Settings > Authentication > Users
   - Find your user, copy ID
   - Compare with events.user_id

### 5. Test Direct Insert

In Supabase Dashboard > SQL Editor:
```sql
-- Replace with actual IDs
INSERT INTO guests (
  event_id,
  name,
  phone,
  category,
  status
) VALUES (
  'your-event-id-uuid',
  'Test Guest',
  '08123456789',
  'Regular',
  'pending'
);
```

If this works, RLS is the issue. If this fails, there's a schema/constraint problem.

---

## Quick Fixes Checklist

- [ ] Run RLS migration SQL script
- [ ] Verify user is logged in (check session in DevTools)
- [ ] Confirm event belongs to current user
- [ ] Check browser console for detailed error logs
- [ ] Verify Supabase keys in `.env.local`
- [ ] Test direct insert in Supabase SQL Editor
- [ ] Check RLS policies are enabled and correct
- [ ] Clear browser cache and local storage
- [ ] Restart development server (`npm run dev`)

---

## Getting Help

If none of the above works:

1. **Copy Error Details**
   - Full error message from console
   - Error code
   - Stack trace

2. **Provide Context**
   - What were you trying to do?
   - Does it work in Supabase SQL Editor?
   - Can you view events/guests?

3. **Check Database Logs**
   - Supabase Dashboard > Logs
   - Filter by "Postgres Logs"
   - Look for errors around the time of failure

4. **Verify Schema**
   ```sql
   -- Check guests table structure
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'guests';

   -- Check constraints
   SELECT conname, contype, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conrelid = 'guests'::regclass;
   ```

---

## Prevention

To avoid these issues in the future:

1. **Always Use Migrations**
   - Store all SQL changes in `/supabase/migrations/`
   - Version control your schema
   - Document RLS policy changes

2. **Test RLS Policies**
   - Write tests for each policy
   - Verify both positive and negative cases
   - Check all CRUD operations

3. **Monitor Logs**
   - Check Supabase logs regularly
   - Set up error tracking (Sentry, etc.)
   - Log important operations

4. **Use Type Safety**
   - Keep `database.types.ts` in sync
   - Use TypeScript for all database operations
   - Validate data before sending to DB

---

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [Next.js Troubleshooting](https://nextjs.org/docs/messages)
